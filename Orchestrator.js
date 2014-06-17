
var util = require('util');
var BiDirectionalSocket = require('./BiDirectionalSocket');
var Worker = require('./Worker');
var PeerList = require('./PeerList');

var Orchestrator = function( pipeline ){ 
  BiDirectionalSocket.call(this);
  this.peers = new PeerList( pipeline );
  this._bindDebugErrorHandlers();
  this._bindMessageHandlers();
}

util.inherits( Orchestrator, BiDirectionalSocket );

Orchestrator.prototype._broadcast = function(){

  this.socks.forEach( function( sock ){
    if( sock.writable ){
      sock.write( this.pack([{
        cmd: 'peers',
        body: this.peers.for( BiDirectionalSocket.generateId( sock._peername ) )
      }]) );
    }
  }, this );
}

Orchestrator.prototype._debug = function(){
  BiDirectionalSocket.debug.apply( this, [
    'orchestrator',
    this.id
  ].concat( Array.prototype.slice.call( arguments ) ) );
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

Orchestrator.prototype._bindDebugErrorHandlers = function(){
  this.on( 'connect', function( sock ){
    this._debug( 'CLIENT_CONNECT', sock._peername );
  }.bind(this));
  this.on( 'disconnect', function( sock ){
    this._debug( 'CLIENT_DISCONNECT', sock._peername );
  }.bind(this));
}

module.exports = Orchestrator;