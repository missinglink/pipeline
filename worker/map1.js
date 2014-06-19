
var pipeline = require('../');

var map1 = new pipeline.Worker({
  role: 'map',
  orchestrator: { port: 5000 }
});

map1.on( 'data', function( msg, done ){
  console.log( 'map1 got message', msg );
  done();
});

// @todo: needs to buffer messages until clients connect to stdout
map1.socks.stdout.on( 'connect', function(){
  //   console.log( map1.socks.stdout.socks.length );
  // process.exit(1);
});

var ord = 0;
var paused = false;

setInterval( function(){

  if( map1.isWritable() ){
    map1.write({ msg: 'map:' + ord++ });
  } else {
    // do nothing
  }

  // map1.emit( 'stdout', 'map1 says kia ora!' );
}, 10 );
