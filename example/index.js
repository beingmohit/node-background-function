const WorkersMaster = require('../index');


var Workers = new WorkersMaster({
    requires: { 
        debug: 'debug' // Inject dependencies (npm modules) 
    },
    threads: 2 // Defaults to number of CPU's
});

// Example 1
var exampleTask = Workers.task(function(n) {
    for (var i = 0; i < n; ++i)
    {
        // Any CPU intensive task
    }
    
    return 'Hello';
});

exampleTask(10000000).then(function(result) {
    console.log(result); // Output: Hello
});


// Example 2
 
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
fibo(40).then(function(result) {
    console.log('fibo(40) = ', result);
});