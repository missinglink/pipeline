
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Buffer = function( config, from, to ){
  this.config = {};
  this.config.max = ( config && config.max ) || 50;
  this.waiting = 0;
  this.flooding = false;
}

util.inherits( Buffer, EventEmitter );

Buffer.prototype.inbound = function( from, to ){

  from.on( 'data', function(){

    this.waiting++;
    if( this.waiting >= this.config.max ){
      this.emit( 'flood' );
      this.flooding = true;
    }

    var cb = function(){
      if( !cb.exec ){
        cb.exec = true; // prevent cb firing twice
        this.waiting--;

        if( !this.waiting && this.flooding ){
          this.flooding = false;
          this.emit( 'resume' );
        }
      }
    }.bind(this);
    cb.exec = false;

    var args = Array.prototype.slice.call( arguments );
    args = args.filter( function( a ){ return a; } ); // filter null values

    to.emit.apply( to, [ 'data' ].concat( args ).concat( cb ) );

  }.bind(this));
}

module.exports = Buffer;