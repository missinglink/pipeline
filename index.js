
var child = require('child_process');

spawn( 'filter1' );
spawn( 'map1' );
spawn( 'orchestrator' );

function spawn( workerName ){
  var worker = child.spawn( 'node', [ 'worker/' + workerName ] );
  worker.stdout.on( 'data', function( buf ) {
    process.stdout.write( String( buf ) );
  });
  worker.stderr.on( 'data', function( buf ) {
    process.stderr.write( String( buf ) );
  });
}