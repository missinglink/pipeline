
var util = require('util'),
    Socket = require('./Socket'),
    Message = require('amp-message');

function ReadSocket() {
  Socket.call( this );
}

util.inherits( ReadSocket, Socket );

// override onmessage to pass sockid as second param
ReadSocket.prototype.onmessage = function(sock){
  var sockid = !!sock._peername ? Socket.generateId( sock._peername ) : null;
  return function( buf ){
    var msg = new Message( buf );
    this.emit.apply( this, [ 'data' ].concat( msg.args, sockid ) );
  }.bind(this);
};

module.exports = ReadSocket;