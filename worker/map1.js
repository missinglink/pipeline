
var Worker = require('../Worker');

var map1 = new Worker({
  role: 'map1',
  orchestrator: { port: 5000 }
});

map1.on( 'data', function( msg ){
  console.log( 'worker got message', msg );
});

// @todo: needs to buffer messages until clients connect to stdout
map1.socks.stdout.on( 'connect', function(){
  setInterval( function(){
    // map1.emit( 'stdout', 'map1 says kia ora!' );
    map1.write({ msg: 'map1 says kia ora!' });
  }, 100 );
});