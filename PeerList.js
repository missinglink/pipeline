
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var PeerList = function(){
  EventEmitter.call(this);
  this.peers = {};
}

util.inherits( PeerList, EventEmitter );

PeerList.prototype.registerPeer = function( peer, value ){
  this.registerPeerUniqId( peer.id + ':' + peer.role, value );
}

PeerList.prototype.registerPeerUniqId = function( uniq, value ){
  if( !this.peers.hasOwnProperty( uniq ) ){
    this.emit( 'register' );
  }
  this.peers[ uniq ] = value;
}

PeerList.prototype.unregisterPeer = function( peer ){
  this.unregisterPeerUniqId( peer.id + ':' + peer.role );
}

PeerList.prototype.unregisterPeerUniqId = function( uniq ){
  if( this.peers.hasOwnProperty( uniq ) ){
    this.emit( 'unregister' );
  }
  delete this.peers[ uniq ];
}

PeerList.prototype.import = function( nodelist ){

  var nodeListKeys = Object.keys( nodelist );

  // remove peers not in nodelist
  for( var uniq in this.peers ){
    if( -1 === nodeListKeys.indexOf( uniq ) ){
      this.unregisterPeerUniqId( uniq );
    }
  }

  // add new peers in nodelist
  for( var uniq in nodelist ){
    var lastIndex = uniq.lastIndexOf(':');
    this.registerPeerUniqId( uniq );
  }
}

PeerList.prototype.export = function(){
  return this.peers;
}

// @example IPv4:0.0.0.0:44401:filter1
PeerList.parseUniqId = function( uniq ){
  var lastIndex = uniq.lastIndexOf(':');
  var parts     = uniq.split(':');
  return {
    id:         uniq.substr( 0, lastIndex ),
    role:       uniq.substr( lastIndex +1 ),
    family:     parts[ 0 ],
    address:    parts[ 1 ],
    port:       parts[ 2 ]
  }
}

module.exports = PeerList;