
var pipeline = require('../');

var filter1 = new pipeline.Worker({
  role: 'filter',
  concurrency: 10,
  orchestrator: { port: 5000 }
});

var ord = 0;

filter1.on( 'data', function( msg, done ){

  filter1._debug( 'filter1 got message', msg );
  
  var rand = Math.random() * 5000;

  setTimeout( function(){
    filter1.write( { msg: msg.msg + ' | filter1: ' + ord++ }, done );
  }, ( Math.random() * 2000 ) );

  // setTimeout( done, ( Math.random() * 2000 ) );
  // if( rand ){
    // console.log( 'done' );
    // done();
  // }
  // else {
    // console.log( 'not done' );
  // }

});

// setTimeout( function(){
//   filter1.pause();
// }, 2000 );

// setTimeout( function(){
//   filter1.resume();
// }, 4000 );

// filter1.pause();
