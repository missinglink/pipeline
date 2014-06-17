
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var BiDirectionalSocket = require('./BiDirectionalSocket');

var Worker = function( config ){

  EventEmitter.call(this);

  this.config = config || {};
  this._validateSettings();

  this.socks = {
    stdin:        new BiDirectionalSocket(),
    stdout:       new BiDirectionalSocket(),
    orchestrator: new BiDirectionalSocket()
  }

  // bind local event emitter to socket
  this.socks.stdin.on( 'message', this.emit.bind( this, 'stdin' ) );
  this.on( 'stdout', this.socks.stdout.send.bind( this.socks.stdout, 'message' ) );

  this._bind( 0 );
}

util.inherits( Worker, EventEmitter );

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
    this.socks.orchestrator.send({
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
  this.socks.orchestrator.on( 'message', function( msg ){
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
  BiDirectionalSocket.debug.apply( this, [
    this.config.role,
    this.socks.stdout.id
  ].concat( Array.prototype.slice.call( arguments ) ) );
}

module.exports = Worker;