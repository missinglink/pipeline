
var Pipeline = function( pipestring ){
  //this.route = pipestring.split( '|' ).map( Function.prototype.call, String.prototype.trim );
  //console.log( 'route', this.route );
  this.forward = {};
  this.reverse = {};
}

Pipeline.prototype.from = function( fromRole ){
  return { to: function( toRole ){
    this.forward[ fromRole ] = toRole;
    this.reverse[ toRole ] = fromRole;
    return this;
  }.bind(this) };
}

module.exports = Pipeline;