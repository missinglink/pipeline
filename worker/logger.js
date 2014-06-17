
var pipeline = require('../');

var logger = new pipeline.Worker({
  role: 'logger',
  orchestrator: { port: 5000 }
});

logger.on( 'data', function( msg ){
  logger._debug( 'logger got message', msg );
});