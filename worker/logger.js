
var pipeline = require('../');

var logger = new pipeline.Worker({
  role: 'logger',
  orchestrator: { port: 5000 }
});

logger.on( 'data', function( msg, done ){

  // console.log( arguments );
  
  logger._debug( 'logger got message', msg );
  done();

});

setTimeout( function(){
  logger.pause();
}, 1000 );

setTimeout( function(){
  logger.resume();
}, 2000 );