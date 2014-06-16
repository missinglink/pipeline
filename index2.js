
var Worker = require('./Worker');
var Orchestrator = require('./Orchestrator');
var Pipeline = require('./Pipeline');

var orchestrator = new Orchestrator(
  new Pipeline()
    .from('map1').to('filter1')
    .from('foo').to('bar')
);

var w2 = new Worker({
  role: 'filter1',
  orchestrator: { port: 5000 }
});

w2.on( 'stdin', function(){
  console.log( 'worker2 got message', arguments );
});

// w2.pause();

// orchestrator.on( 'bind', function(){
//   orchestrator.debug( 'BOUND' );
// });

orchestrator.bind(5000);
