
var Worker = require('../Worker');

var filter1 = new Worker({
  role: 'filter1',
  orchestrator: { port: 5000 }
});

filter1.on( 'stdin', function(){
  console.log( 'worker got message', arguments );
});

// filter1.pause();
