
var util = require('util');
var BiDirectionalSocket = require('./BiDirectionalSocket');
var Worker = require('./Worker');
var PeerList = require('./PeerList');

var Orchestrator = function( pipeline ){ 
  BiDirectionalSocket.call(this);
  this.peers = new PeerList( pipeline );
  this.bindDebugErrorHandlers();
  this.bindMessageHandlers();
}

util.inherits( Orchestrator, BiDirectionalSocket );

Orchestrator.prototype.broadcast = function(){

  this.socks.forEach( function( sock ){
    if( sock.writable ){

      // generate an 'id' for the current socket
      var sockid = BiDirectionalSocket.generateId( sock._peername );

      var buf = this.pack([{
        cmd: 'peers',
        body: this.peers.deps[ sockid ]
      }]);

      sock.write( buf );
    }
  }, this);
}

Orchestrator.prototype.debug = function(){
  BiDirectionalSocket.debug.apply( this, [
    'orchestrator',
    this.id
  ].concat( Array.prototype.slice.call( arguments ) ) );
}

Orchestrator.prototype.bindMessageHandlers = function(){
  this.on( 'message', function( msg, sockid ){
    this.debug( 'RECV_MESSAGE', msg );
    if( 'object' == typeof msg ){
      switch( msg.cmd ){
        case 'announce' :
          if( msg.hasOwnProperty( 'body' ) ){
            this.peers.registerPeer( msg.body, sockid );
            this.broadcast();
          } else {
            this.debug( 'invalid announce' );
          }
          break;
        default:
          this.debug( 'unknown command', msg.cmd );
      }
    } else {
      this.debug( 'invalid msg envelope' );
    }
  }.bind(this));
}

Orchestrator.prototype.bindDebugErrorHandlers = function(){
  this.on( 'connect', function( sock ){
    this.debug( 'CLIENT_CONNECT', sock._peername );
  }.bind(this));
  this.on( 'disconnect', function( sock ){
    this.debug( 'CLIENT_DISCONNECT', sock._peername );
  }.bind(this));
}

module.exports = Orchestrator;