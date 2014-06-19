
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Buffer = function( config, from, to ){
  this.config = {};
  this.config.max = ( config && config.max ) || 50;
}

util.inherits( Buffer, EventEmitter );

Buffer.prototype.inbound = function( from, to ){

  var waiting = 0;
  var flooding = false;

  from.on( 'data', function( msg ){

    // console.log( 'on data', arguments );
    // if( !msg ) return; // @todo think about this more

    waiting++;
    if( waiting >= this.config.max ){
      this.emit( 'flood' );
      flooding = true;
    }

    var cb = function(){
      if( !cb.exec ){
        cb.exec = true; // prevent cb firing twice
        waiting--;

        if( !waiting && flooding ){
          flooding = false;
          this.emit( 'resume' );
        }
      }
    }.bind(this);
    cb.exec = false;

    // var args = Array.prototype.slice.call( arguments );
    // args = args.filter( function( a ){ return a; } ); // filter null values
    // to.emit.apply( to, [ 'data' ].concat( args ).concat( cb ) );

    to.emit.call( to, 'data', msg, cb );

  }.bind(this));
}

// Buffer.prototype.outbound = function( from, to ){

//   var waiting = 0;
//   var flooding = false;

//   from.on( 'write', function(){

//     waiting++;
//     if( waiting >= this.config.max ){
//       this.emit( 'flood' );
//       flooding = true;
//     }

//     var cb = function(){

//       if( !cb.exec ){
//         cb.exec = true; // prevent cb firing twice
//         waiting--;

//         if( !waiting && flooding ){
//           flooding = false;
//           this.emit( 'resume' );
//           console.log('resume');
//         }
//       }
//     }.bind(this);
//     cb.exec = false;

//     var args = Array.prototype.slice.call( arguments );
//     args = args.filter( function( a ){ return a; } ); // filter null values

//     to.send.apply( to, args.concat( cb ) );

//   }.bind(this));
// }

// this.socks.stdout.send.apply( this.socks.stdout, msg, done );

module.exports = Buffer;