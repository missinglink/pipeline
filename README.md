
## Pipeline

A distributed non-buffering data pipeline with built in orchestrator and flood control.  
  
** Note: ** In active development - The public API will likely change before the initial release.

----

#### unix philosophy  
  
`unix pipes` provide an amazingly easy-to-use and portable API.

`pipeline` aims to extend that API to TCP sockets while also offering the ability to attach multiple processes to `stdin` `stdout` and `stderr`.

`pipeline` also provides smart flood control mechanisms to avoid buffering data at any branch of the pipe.  
  
```bash  
#unix pipes  
echo '{ hello: "world" }' | filter 2>> error.txt | map 1> out.txt 2>> error.txt  
```  

----

#### orchestrator
  
`pipeline` allows you to create worker processes which run anywhere on your network. Rather than assigning your workers fixed addresses, `pipeline` allows you to delegate addressing to a process called the `orchestractor`.  
  
An example `orchestrator` is provided with the package. You can use this type of `socket` to assign work to other `Worker` processes like this:  
  
```javascript
var pipeline = require('pipeline');

var orchestrator = new pipeline.Orchestrator(
  new pipeline.Pipeline()
    .from('tap').to('filter')
    .from('filter').to('map')
    .from('map').to('sink')
);

orchestrator.bind(5000);
```
    
----
    
#### worker

Each worker must be assigned a `role`. Their unique network addresses don't matter and can change without causing the entire pipeline to error.  
  
As with unix sockets, the worker does not need to know where the data comes from or where it is going next; the `orchestrator` will tell it which other `Worker` sockets to connect to.  
  
Example worker:  
  
```javascript  
var pipeline = require('pipeline');

var filter = new pipeline.Worker({
  role: 'filter',
  concurrency: 10,
  orchestrator: { port: 5000 }
});

filter.on( 'data', function( msg, done ){

  filter._debug( 'filter2 got message', msg );
  
  doSomethingAsnyc( { cmd: 'takes_time' }, function( err, data ){  
    done(); // worker completed this task
  });

});
```  
  
The worker will automatically handle concurrency control; when the maximum number of concurrent jobs are being executed on this process the `stdin` socket(s) will disconnect.  
  
When the worker is again free to process data it will automatically re-connect it's `stdin` socket(s) and start processing messages again.  
  
----  
  
... more to come
