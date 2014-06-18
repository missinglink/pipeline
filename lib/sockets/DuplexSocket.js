
var util = require('util'),
    Socket  = require('./Socket'),
    ReadSocket  = require('./ReadSocket'),
    WriteSocket = require('./WriteSocket');

function DuplexSocket() {
  Socket.call( this );
  ReadSocket.call( this );
  WriteSocket.call( this );
}

// Inherit methods
util.inherits( DuplexSocket, Socket );

// Copy methods from other sockets (a bit haxxy)
DuplexSocket.prototype.onmessage = ReadSocket.prototype.onmessage;
DuplexSocket.prototype.logSocketInfo = ReadSocket.prototype.logSocketInfo;
DuplexSocket.prototype.write = WriteSocket.prototype.write;
DuplexSocket.prototype.logConnectionInfo = WriteSocket.prototype.logConnectionInfo;

module.exports = DuplexSocket;