
var AxonSocket = require('axon').Socket,
    colors = require('colors');

function Socket( config ) {
  AxonSocket.call( this );
  this.outputSocketErrors();
}

Socket.prototype.__proto__ = AxonSocket.prototype;

Socket.prototype.outputSocketErrors = function(){
  this.on( 'error', function( err ){
    var args = Array.prototype.slice.call( arguments );
    console.error.apply( console, [ 'ERROR'.bold.red ].concat( args ) );
  });
  this.on( 'socket error', function( err ){
    var args = Array.prototype.slice.call( arguments );
    console.error.apply( console, [ 'SOCKET_ERROR'.bold.red ].concat( err.code ) );
  });
}

Socket.generateId = function( address ){
  return [ address.family, address.address, address.port ].join( ':' );
}

Socket.debug = function( role, id ){
  console.log.apply( this.write, [
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

module.exports = Socket;