
var pipeline = require('../');

var orchestrator = new pipeline.Orchestrator(
  new pipeline.Pipeline()
    .from('map').to('filter')
    .from('filter').to('logger')
);

orchestrator.bind(5000);