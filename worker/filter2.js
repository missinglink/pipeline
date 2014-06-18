
var pipeline = require('../');

var filter2 = new pipeline.Worker({
  role: 'filter',
  orchestrator: { port: 5000 }
});

filter2.on( 'data', function( msg, done ){

  filter2._debug( 'filter2 got message', msg );
  setTimeout( done, ( Math.random() * 3000 ) );

});
