
var Worker = require('../Worker');

var filter1 = new Worker({
  role: 'filter1',
  orchestrator: { port: 5000 }
});

filter1.on( 'data', function( msg ){
  filter1._debug( 'worker got message', msg );
});

// filter1.pause();
