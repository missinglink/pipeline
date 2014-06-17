
var Worker = require('../Worker');

var logger = new Worker({
  role: 'logger',
  orchestrator: { port: 5000 }
});

logger.on( 'data', function( msg ){
  logger._debug( 'logger got message', msg );
});