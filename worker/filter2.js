
var pipeline = require('../');

var filter2 = new pipeline.Worker({
  role: 'filter',
  orchestrator: { port: 5000 }
});

var ord = 0;

filter2.on( 'data', function( msg, done ){

  filter2._debug( 'filter2 got message', msg );

  var rand = Math.random() * 5000;

  setTimeout( function(){
    filter2.write( { msg: msg.msg + ' | filter2: ' + ord++ }, done );
  }, ( Math.random() * 2000 ) );

});
