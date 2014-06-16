
var util = require('util');
var BiDirectionalSocket = require('./BiDirectionalSocket');
var Worker = require('./Worker');
var PeerList = require('./PeerList');

var Orchestrator = function( pipeline ){
  BiDirectionalSocket.call(this);

  this.pipeline = pipeline;
  this.peers = new PeerList();
  this.dependencyList = {};

  this.on( 'connect', function( sock ){
    this.debug( 'CLIENT_CONNECT', sock._peername );
  }.bind(this));

  this.on( 'disconnect', function( sock ){
    this.debug( 'CLIENT_DISCONNECT', sock._peername );
  }.bind(this));

  var _self = this;
  _self.on( 'message', function( msg, sockid ){

    _self.debug( 'RECV_MESSAGE', msg );

    if( 'object' == typeof msg ){
      if( msg.cmd == 'announce' && msg.hasOwnProperty( 'body' ) ){
        _self.register( msg.body, sockid );
      }
      else {
        console.error( 'invalid announce' );
      }
    } else {
      console.error( 'invalid msg envelope' );
    }
  });
}

util.inherits( Orchestrator, BiDirectionalSocket );

Orchestrator.prototype.register = function( node, controlsockid ){
  this.peers.registerPeer( node, controlsockid );
  this.buildDependencyMap();
  this.broadcast();
}

Orchestrator.prototype.unregister = function( node ){
  this.peers.unregisterPeer( node );
  this.buildDependencyMap();
  this.broadcast();
}

Orchestrator.prototype.buildDependencyMap = function( node ){
  this.dependencyList = {};

  for( var uniq in this.peers.peers ){
    var controlsockid = this.peers.peers[ uniq ];
    this.dependencyList[ controlsockid ] = [];

    // parse this peer uniq
    var parsed = PeerList.parseUniqId( uniq );

    // find provider role name for consumer role
    var providerRole = this.pipeline.reverse[ parsed.role ];

    // build a list of providers for that role
    for( var uniq2 in this.peers.peers ){

      if( uniq === uniq2 ) continue; // skip itself

      var parsed2 = PeerList.parseUniqId( uniq2 );
      if( parsed2.role === providerRole ){
        this.dependencyList[ controlsockid ].push( parsed2.id );
      }

    }
  }
}

Orchestrator.prototype.broadcast = function(){

  this.socks.forEach( function( sock ){
    if( sock.writable ){

      // generate an 'id' for the current socket
      var sockid = [
        sock._peername.family,
        sock._peername.address,
        sock._peername.port
      ].join(':');

      // console.log( 'sockid', sockid );
      // console.log( 'dependencyList', this.dependencyList );
      // console.log( this.dependencyList[ sockid ] );

      var buf = this.pack([{
        cmd: 'peers',
        body: this.dependencyList[ sockid ]
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

module.exports = Orchestrator;