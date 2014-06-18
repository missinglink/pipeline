
var pipeline = require('../');

var filter3 = new pipeline.Worker({
  role: 'filter',
  orchestrator: { port: 5000 }
});

filter3.on( 'data', function( msg, done ){

  filter3._debug( 'filter3 got message', msg );
  setTimeout( done, 3000 + ( Math.random() * 3000 ) );

});
