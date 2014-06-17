
var Socket = require('axon').Socket,
    PubSocket = require('axon').PubSocket,
    Message = require('amp-message'),
    colors = require('colors');

function BiDirectionalSocket( config ) {
  Socket.call( this );
  this._assignId();
  this._bindDebugErrorHandlers();
}

BiDirectionalSocket.prototype.__proto__ = Socket.prototype;
BiDirectionalSocket.prototype.send = PubSocket.prototype.send;

// override onmessage to pass sockid as second param
BiDirectionalSocket.prototype.onmessage = function(sock){
  var sockid = !!sock._peername ? BiDirectionalSocket.generateId( sock._peername ) : null;
  return function( buf ){
    var msg = new Message( buf );
    this.emit.apply( this, [ 'message' ].concat( msg.args, sockid ) );
  }.bind(this);
};

// set id on bind
BiDirectionalSocket.prototype._assignId = function(){
  this.on( 'bind', function(){
    this.id = BiDirectionalSocket.generateId( this.server.address() );
  });
}

BiDirectionalSocket.prototype._bindDebugErrorHandlers = function(){
  this.on( 'error', function( err ){
    var args = Array.prototype.slice.call( arguments );
    console.error.apply( console, [ 'ERROR'.bold.red ].concat( args ) );
  });
  this.on( 'socket error', function( err ){
    var args = Array.prototype.slice.call( arguments );
    console.error.apply( console, [ 'SOCKET_ERROR'.bold.red ].concat( err.code ) );
  });
}

BiDirectionalSocket.generateId = function( address ){
  return [ address.family, address.address, address.port ].join( ':' );
}

BiDirectionalSocket.debug = function( role, id ){
  console.log.apply( console, [
    role.bold.yellow +
    '@'.grey +
    id.replace('IPv4:0.0.0.0:','').bold.green +
    ':'.grey,
  ].concat( Array.prototype.slice.call(arguments,2) ).map( function( item ){
    if( 'object' == typeof item ){
      return JSON.stringify( item, null, 1 )
                 .replace( /\n/g, '' )
                 .replace( /([\w\}])\}/g, "$1 }" )
                 .replace( /  ? ? ?/g, ' ' )
                 .bold.white;
    }
    return item;
  }));
}

module.exports = BiDirectionalSocket;