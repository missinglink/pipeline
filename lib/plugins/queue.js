
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
    sock.cbqueue = [];

    /**
     * Flush `buf` on `connect`.
     */

    sock.on('connect', function(){
      var prev = sock.queue;
      var len = prev.length;
      sock.queue = [];

      var cbprev = sock.cbqueue;
      sock.cbqueue = [];

      //debug('flush %d messages', len);

      for (var i = 0; i < len; ++i) {
        this.send.call(this, prev[i], cbprev[i]);
      }

      sock.emit('flush', len);
    });

    /**
     * Pushes `msg` into `buf`.
     */

    sock.enqueue = function(msg, cb){
      var hwm = sock.settings.hwm;
      if (sock.queue.length >= hwm) flood(msg);
      sock.queue.push(msg);
      sock.cbqueue.push(cb);
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
