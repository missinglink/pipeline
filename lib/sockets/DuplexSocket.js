
var util = require('util'),
    Socket = require('./Socket'),
    PubSocket = require('axon').PubSocket;

function DuplexSocket() {
  Socket.call( this );

  // Set id on bind
  this.on( 'bind', function(){
    this.id = Socket.generateId( this.server.address() );
  });
}

// Inherit methods
util.inherits( DuplexSocket, Socket );
DuplexSocket.prototype.write = PubSocket.prototype.send;

// Log info when clients connect/deconnect
DuplexSocket.prototype.logConnectionInfo = function(){
  this.on( 'connect', function( sock ){
    this._debug( 'CLIENT_CONNECT', sock._peername );
  }.bind(this));
  this.on( 'disconnect', function( sock ){
    this._debug( 'CLIENT_DISCONNECT', sock._peername );
  }.bind(this));
}

module.exports = DuplexSocket;