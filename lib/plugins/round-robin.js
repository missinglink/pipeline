
/**
 * Deps.
 */

var slice = function(args){
  var len = args.length;
  var ret = new Array(len);

  for (var i = 0; i < len; i++) {
    ret[i] = args[i];
  }

  return ret;
};

/**
 * Round-robin plugin.
 *
 * Provides a `send` method which will
 * write the `msg` to all connected peers.
 *
 * @param {Object} options
 * @api private
 */

module.exports = function(options){
  options = options || {};
  var fallback = options.fallback || function(){};

  return function(sock){

    /**
     * Bind callback to `sock`.
     */

    fallback = fallback.bind(sock);

    /**
     * Initialize counter.
     */

    var n = 0;

    /**
     * Sends `msg` to all connected peers round-robin.
     */

    sock.send = function(){
      var socks = this.socks;
      var len = socks.length;
      var sock = socks[n++ % len];

      var msg = slice(arguments);

      if (sock && sock.writable) {
        sock.write(this.pack(msg));
      } else {
        fallback(msg);
      }
    };

  };
};
