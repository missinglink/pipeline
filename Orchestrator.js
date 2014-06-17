
var util = require('util');
var Socket = require('./lib/sockets/Socket');
var DuplexSocket = require('./lib/sockets/DuplexSocket');
var PeerList = require('./PeerList');

var Orchestrator = function( pipeline ){ 
  DuplexSocket.call(this);
  this.peers = new PeerList( pipeline );
  this._bindMessageHandlers();
  this.logConnectionInfo();
}

util.inherits( Orchestrator, DuplexSocket );

Orchestrator.prototype._broadcast = function(){
  this.socks.forEach( function( sock ){
    if( sock.writable ){
      sock.write( this.pack([{
        cmd: 'peers',
        body: this.peers.for( Socket.generateId( sock._peername ) )
      }]));
    }
  }, this );
}

Orchestrator.prototype._bindMessageHandlers = function(){
  this.on( 'data', function( msg, sockid ){
    this._debug( 'RECV_MESSAGE', msg );
    if( 'object' == typeof msg ){
      switch( msg.cmd ){
        case 'announce' :
          if( msg.hasOwnProperty( 'body' ) ){
            this.peers.registerPeer( msg.body, sockid );
            this._broadcast();
          } else {
            this._debug( 'invalid announce' );
          }
          break;
        default:
          this._debug( 'unknown command', msg.cmd );
      }
    } else {
      this._debug( 'invalid msg envelope' );
    }
  }.bind(this));
}

Orchestrator.prototype._debug = function(){
  Socket.debug.apply( process.stderr, [
    'orchestrator', this.id
  ].concat( Array.prototype.slice.call( arguments ) ) );
}

module.exports = Orchestrator;