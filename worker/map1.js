
var Worker = require('../Worker');

var map1 = new Worker({
  role: 'map1',
  orchestrator: { port: 5000 }
});

map1.on( 'stdin', function(){
  console.log( 'worker got message', arguments );
});

// @todo: needs to buffer messages until clients connect to stdout
map1.socks.stdout.on( 'connect', function(){
  setInterval( function(){
    map1.emit( 'stdout', 'map1 says kia ora!' );
  }, 100 );
})