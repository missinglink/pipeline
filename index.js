
var Socket = require('./Socket');

var s1 = new Socket();
bindErrorHandler(s1);

s1.on( 'message', function( msg ){
  console.log( 's1 got %s', msg );
  s1.send( 'reply' );
});

// s1.on( 'bind', function(){
//   console.log( 's1 bound' );
// });

s1.bind(6700);

setTimeout( function(){

  // console.log( 'timeout' );

  var s2 = new Socket();
  bindErrorHandler(s2);

  s2.on( 'connect', function(){
    console.log( 's2 connected' );
    s2.send( 'hello' );
  });

  s2.on( 'message', function( msg ){
    console.log( 's2 got %s', msg );
  });

  s2.connect(6700);

}, 500 );

function bindErrorHandler( sock )
{
  sock.on( 'error', function(){
    console.log( 'sock error', arguments );
  });

  sock.on( 'socket error', function(){
    console.log( 'socket error', arguments );
  });
}