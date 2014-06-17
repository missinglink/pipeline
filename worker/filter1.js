
var pipeline = require('../');

var filter1 = new pipeline.Worker({
  role: 'filter1',
  orchestrator: { port: 5000 }
});

filter1.on( 'data', function( msg ){
  filter1._debug( 'worker got message', msg );
});

// filter1.pause();
