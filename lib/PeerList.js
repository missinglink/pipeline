
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var PeerList = function( pipeline ){
  EventEmitter.call(this);
  this._pipeline = pipeline;
  this._peers = {};
  this._buildDependencyMap();
}

util.inherits( PeerList, EventEmitter );

PeerList.prototype.registerPeer = function( peer, value ){
  this.registerPeerUniqId( peer.id + ':' + peer.role, value );
}

PeerList.prototype.registerPeerUniqId = function( uniq, value ){
  if( !this._peers.hasOwnProperty( uniq ) ){
    this.emit( 'register' );
  }
  this._peers[ uniq ] = value;
  this._buildDependencyMap();
}

PeerList.prototype.unregisterPeer = function( peer ){
  this.unregisterPeerUniqId( peer.id + ':' + peer.role );
}

PeerList.prototype.unregisterPeerUniqId = function( uniq ){
  if( this._peers.hasOwnProperty( uniq ) ){
    this.emit( 'unregister' );
  }
  delete this._peers[ uniq ];
  this._buildDependencyMap();
}

PeerList.prototype.import = function( nodelist ){

  var nodeListKeys = Object.keys( nodelist );

  // remove peers not in nodelist
  for( var uniq in this._peers ){
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
  return this._peers;
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

PeerList.prototype.for = function( id ){
  return this._providers[ id ];
}

PeerList.prototype._buildDependencyMap = function(){
  
  // reset dependency list
  this._providers = {};

  // iterate peer list
  for( var uniq in this._peers ){

    // find current consumer in peers
    var controlsockid = this._peers[ uniq ];

    // create an array to store a list of peers which
    // can act as a provider for this consumer
    this._providers[ controlsockid ] = [];

    // parse the consumer uniq
    var parsed = PeerList.parseUniqId( uniq );

    // find provider role name for consumer role
    var providerRole = this._pipeline.reverse[ parsed.role ];

    // build a list of providers for that role
    for( var uniq2 in this._peers ){

      if( uniq === uniq2 ) continue; // skip itself

      // parse peer uniq
      var parsed2 = PeerList.parseUniqId( uniq2 );

      // match peer to consumer
      if( parsed2.role === providerRole ){

        // append peer id to list of providers for this consumer
        this._providers[ controlsockid ].push( parsed2.id );

      }
    }
  }
}

module.exports = PeerList;