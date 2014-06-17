
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var Socket = require('./lib/sockets/Socket');
var DuplexSocket = require('./lib/sockets/DuplexSocket');

var Worker = function( config ){

  EventEmitter.call(this);

  this.config = config || {};
  this._validateSettings();

  // sockets
  this.socks = {
    stdin:        new Socket(),
    stdout:       new DuplexSocket(),
    // stderr:       process.stderr,
    orchestrator: new DuplexSocket()
  }

  // forward inbound data to local emitter
  this.socks.stdin.on( 'data', this.emit.bind( this, 'data' ) );

  // bind local event emitter to socket
  this._bind( 0 );
}

util.inherits( Worker, EventEmitter );

Worker.prototype.write = function(){
  this.socks.stdout.write.apply( this.socks.stdout, arguments );
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

Worker.prototype._start = function( inPort ){

  this._debug( 'CONNECTING TO:', inPort );

  this.socks.stdin.on( 'connect', function(){
    this._debug( 'CONNECTED_TO_PEER', 'at: ' + inPort );
    this.emit( 'start' );
  }.bind(this));

  this.socks.stdin.connect( Number(inPort) );
}

Worker.prototype.pause = function(){
  this._debug( 'SOCK_PAUSE' );
  // this.socks.stdin.close();
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
              this._start( msg.body[ 0 ].split(':')[2] );
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