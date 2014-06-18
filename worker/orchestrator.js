
var pipeline = require('../');

var orchestrator = new pipeline.Orchestrator(
  new pipeline.Pipeline()
    .from('map').to('filter')
    .from('foo').to('bar')
);

orchestrator.bind(5000);