# Background Functions



#### What?
This module provides a way of moving blocking/longish CPU-bound tasks out of Node's event loop to JavaScript threads that run in parallel in the background and that use all the available CPU cores automatically; all from within a single Node process.

#### Why?

After the initialization phase of a Node program, whose purpose is to setup listeners and callbacks to be executed in response to events, the next phase, the proper execution of the program, is orchestrated by the event loop whose duty is to [juggle events, listeners and callbacks quickly and without any hiccups nor interruptions that would ruin its performance](https://youtu.be/D0uA_NOb0PE).

Both the event loop and said listeners and callbacks run sequentially in a single thread of execution, Node's main thread. If any of them ever blocks, nothing else will happen for the duration of the block: no more events will be handled, no more callbacks nor listeners nor timeouts nor setImmediate()ed functions will have the chance to run and do their job, because they won't be called by the blocked event loop, and the program will turn sluggish at best, or appear to be frozen and dead at worst.

#### How?

```
npm install background-functions --save
```

```
const WorkersMaster = require('background-functions');

var Workers = new WorkersMaster({
    requires: { 
        debug: 'debug' // Inject dependencies (npm modules) 
    },
    threads: 2 // Defaults to number of CPU's
});

var fibo = Workers.task(function(n) {
    debug('task')('task executing', n); // `debug` injected
    
    var fibo = function(n) {
        return n > 1 ? fibo(n - 1) + fibo(n - 2) : 1;
    };
    
    // Return promise or any other native js data type
    return new Promise(function(resolve, reject) {
        resolve(fibo(n));
    })
});

// `Workers.task` always returns Promise
fibo(50).then(function(result) {
    console.log('fibo(50) = ', result);
});
```

#### Limitations?
- no browser support.
- only supports function arguments  which can be serialised to json.
- makes sense only when overhead of IPC and serialisation is much less than code execution.

#### Alternatives?
- [Webworker Threads](https://www.npmjs.com/package/webworker-threads) (does not support dependency injection)
- [AsyncTask](https://github.com/gorillatron/async-task) (does not support dependency injection)

#### How does it work? 
It creates nodejs child processes and sends them serialised functions using IPC. When functions are called it sends json serialised function arguments to one of the thread in round robin fasion and returns a promise.

