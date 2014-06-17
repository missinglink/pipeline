
var Worker = require('./Worker');

var w1 = new Worker({
  role: 'map1',
  orchestrator: { port: 5000 }
});

w1.on( 'stdin', function(){
  console.log( 'worker1 got message', arguments );
});

// @todo: needs to buffer messages until clients connect to stdout
w1.socks.stdout.on( 'connect', function(){
  w1.emit( 'stdout', 'w1 says kia ora!' );
})