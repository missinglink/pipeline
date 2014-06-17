
var Orchestrator = require('../Orchestrator');
var Pipeline = require('../Pipeline');

var orchestrator = new Orchestrator(
  new Pipeline()
    .from('map1').to('filter1')
    .from('foo').to('bar')
);

orchestrator.bind(5000);