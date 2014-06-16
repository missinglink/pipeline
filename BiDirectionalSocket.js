
var Socket = require('axon').Socket,
    PubSocket = require('axon').PubSocket,
    Message = require('amp-message');

function BiDirectionalSocket( config ) {
  Socket.call( this );
  this.assignId();
  this.bindDebugErrorHandlers();
}

BiDirectionalSocket.prototype.__proto__ = Socket.prototype;
BiDirectionalSocket.prototype.send = PubSocket.prototype.send;

BiDirectionalSocket.prototype.onmessage = function(sock){
  var self = this;
  var sockid = null;

  if( sock._peername ){
    sockid = [
      sock._peername.family,
      sock._peername.address,
      sock._peername.port
    ].join(':');
  }

  return function(buf){
    var msg = new Message(buf);
    self.emit.apply(self, ['message'].concat(msg.args,sockid));
  };
};

BiDirectionalSocket.prototype.assignId = function(){
  // set id on bind
  this.id = null;
  this.on( 'bind', function(){
    var address = this.server.address();
    this.id = [ address.family, address.address, address.port ].join(':');
  });
}

BiDirectionalSocket.prototype.bindDebugErrorHandlers = function(){
  this.on( 'error', function(){
    var args = Array.prototype.slice.call( arguments );
    console.error.apply( console, [ 'ERROR' ].concat( args ) );
  });
  this.on( 'socket error', function(){
    var args = Array.prototype.slice.call( arguments );
    console.error.apply( console, [ 'SOCKET_ERROR' ].concat( args ) );
  });
}

BiDirectionalSocket.debug = function( role, id ){
  console.log.apply( console, [
    '\x1b[1;33m' + role + '\x1b[0m' +
    '\x1b[1;2m@\x1b[0m' +
    '\x1b[1;32m' + id.replace('IPv4:0.0.0.0:','') + '\x1b[0m' +
    '\x1b[1;2m:\x1b[0m',
  ].concat( Array.prototype.slice.call(arguments,2) ).map( function( item ){
    if( 'object' == typeof item ){
      return '\x1b[1;1m' +
             JSON.stringify( item, null, 1 )
                 .replace( /\n/g, '' )
                 .replace( /([\w\}])\}/g, "$1 }" )
                 .replace( /  ? ? ?/g, ' ' )
             + '\x1b[0m';
    }
    return item;
  }));
}

module.exports = BiDirectionalSocket;