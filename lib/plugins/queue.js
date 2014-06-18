
/**
 * Queue plugin.
 *
 * Provides an `.enqueue()` method to the `sock`. Messages
 * passed to `enqueue` will be buffered until the next
 * `connect` event is emitted.
 *
 * Emits:
 *
 *  - `drop` (msg) when a message is dropped
 *  - `flush` (msgs) when the queue is flushed
 *
 * @param {Object} options
 * @api private
 */

module.exports = function(options){
  options = options || {};

  return function(sock){

    /**
     * Message buffer.
     */

    sock.queue = [];

    /**
     * Flush `buf` on `connect`.
     */

    sock.on('connect', function(){
      var prev = sock.queue;
      var len = prev.length;
      sock.queue = [];

      //debug('flush %d messages', len);

      for (var i = 0; i < len; ++i) {
        this.send.apply(this, prev[i]);
      }

      sock.emit('flush', len);
    });

    /**
     * Pushes `msg` into `buf`.
     */

    sock.enqueue = function(msg){
      var hwm = sock.settings.hwm;
      if (sock.queue.length >= hwm) flood(msg);
      sock.queue.push(msg);
    };

    /**
     * Drop the given `msg`.
     */

    function flood(msg) {
      //debug('flood');
      sock.emit('flood', msg);
    }
  };
};
