
var util = require('util');
var EventEmitter = require('events').EventEmitter;

var Socket = require('./sockets/Socket');
var ReadSocket = require('./sockets/ReadSocket');
var WriteSocket = require('./sockets/WriteSocket');
var DuplexSocket = require('./sockets/DuplexSocket');

var Buffer = require('./Buffer');

var Worker = function( config ){

  EventEmitter.call(this);

  this.config = config || {};
  this._ports = {};

  this._validateSettings();

  // sockets
  this.socks = {
    stdin:        new ReadSocket(),
    stdout:       new WriteSocket(),
    // stderr:       process.stderr,
    orchestrator: new DuplexSocket()
  }

  this.socks.stdout.use( require('./plugins/queue' )() );
  this.socks.stdout.use( require('./plugins/round-robin' )({ fallback: this.socks.stdout.enqueue }) );

  // this.socks.stdout.on( 'flush', function( len ){
  //   console.log( 'stdout flush', len );
  // });

  // this.socks.stdout.on( 'flood', function(){
  //   console.log( 'stdout flood' );
  // });

  this.socks.stdout.on( 'connect', function(){
    this._debug( 'DOWNSTREAM SOCKET CONNECTED' );
  }.bind(this));

  this.socks.stdout.on( 'disconnect', function(){
    this._debug( 'DOWNSTREAM SOCKET DISCONNECTED' );
  }.bind(this));

  this.socks.stdin.on( 'close', function(){
    this._debug( 'CLOSED UPSTREAM SOCKET' );
  }.bind(this));

  // forward inbound data to local emitter
  var buffer = new Buffer({ max: this.config.concurrency });
  buffer.inbound( this.socks.stdin, this );
  buffer.on( 'flood', this.pause.bind(this) );
  buffer.on( 'resume', this.resume.bind(this) );

  // bind local event emitter to socket
  this._bind( 0 );
}

util.inherits( Worker, EventEmitter );

Worker.prototype.write = function( msg, done ){
  // this._debug( 'SEND MESSAGE' );
  done = ( 'function' == typeof done ) ? done : function(){}; //@todo think about this more
  this.socks.stdout.send.call( this.socks.stdout, msg, done );
}

Worker.prototype.isWritable = function(){
  return !!this.socks.stdout.socks.length;
}

// validate the role & other settings
Worker.prototype._validateSettings = function(){
  if( !this.config.role ||
      !( typeof this.config.role == 'string') ||
      !this.config.role.length ){
    throw new Error( 'invalid role' );
  }
}

// bind worker stdout socket
Worker.prototype._bind = function( port ){

  this.socks.stdout.on( 'bind', function(){
    this._bindOrchestratorMessageHandlers();
    this._announce();
  }.bind(this));

  this.socks.stdout.bind( port || 0 );
}

// announce the sockets availability to the orchestrator
Worker.prototype._announce = function(){

  // listen for connection events to the orchestrator
  this.socks.orchestrator.on( 'connect', function(){
    this._debug( 'CONNECT to orchestrator' );
    // this._debug( 'announce', this.config );

    // accounce
    this.socks.orchestrator.write({
      cmd: 'announce',
      body: {
        id: this.socks.stdout.id,
        role: this.config.role
        // identity: this.socks.stdout.get('identity')
      }
    });
  }.bind(this));

  // connect to the orchestrator
  this.socks.orchestrator.connect(
    this.config.orchestrator.port,
    this.config.orchestrator.host
  );
}

Worker.prototype._start = function(){


  // this.socks.stdin.on( 'connect', function(){
  //   this._debug( 'CONNECTED_TO_PEER', 'at: ' + this._port );
  // }.bind(this));

  Object.keys( this._ports ).forEach( function( port ){
    this._debug( 'CONNECTING TO:', port );
    this.socks.stdin.connect( Number( port ) );
  }, this);
}

Worker.prototype.pause = function(){
  this._debug( 'PAUSE()' );
  this.socks.stdin.close();
}

Worker.prototype.resume = function(){
  this._debug( 'RESUME()' );
  this._start();
}

// listen for messages from the orchestrator
Worker.prototype._bindOrchestratorMessageHandlers = function(){
  this.socks.orchestrator.on( 'data', function( msg ){
    this._debug( 'RECV_MESSAGE from orchestrator', msg );
    if( 'object' == typeof msg ){
      switch( msg.cmd ){
        case 'peers' :
          if( msg.hasOwnProperty( 'body' ) ){
            //@todo: should connect to ALL available peers
            // console.log( 'got list of peers!', msg.body );
            if( msg.body.length > 0 ){
              this._ports = {};
              for( var x=0; x<msg.body.length; x++ ){
                this._ports[ Number( msg.body[ x ].split(':')[2] ) ] = true;
              }
              this._start();
            }
          } else {
            this._debug( 'invalid peers list' );
          }
          break;
        default:
          this._debug( 'unknown command', msg.cmd );
      }
    } else {
      this._debug( 'invalid msg envelope' );
    }
  }.bind(this));
}

Worker.prototype._debug = function(){
  Socket.debug.apply( this.socks.stderr, [
    this.config.role,
    this.socks.stdout.id
  ].concat( Array.prototype.slice.call( arguments ) ) );
}

module.exports = Worker;