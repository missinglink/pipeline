
var pipeline = require('../');

var map2 = new pipeline.Worker({
  role: 'map',
  orchestrator: { port: 5000 }
});

map2.on( 'data', function( msg, done ){
  console.log( 'map2 got message', msg );
  done();
});

// @todo: needs to buffer messages until clients connect to stdout
map2.socks.stdout.on( 'connect', function(){
  //   console.log( map2.socks.stdout.socks.length );
  // process.exit(1);
});

var ord = 0;

setInterval( function(){

  if( map2.socks.stdout.socks.length ){
    map2.write({ msg: 'hello from map2: ' + ord++ });
  }

  // map2.emit( 'stdout', 'map2 says kia ora!' );
}, 10 );
