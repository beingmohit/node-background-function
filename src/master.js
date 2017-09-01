const numCPUs = require('os').cpus().length;
const debug = require('debug')('master');
const Worker = require('./worker');
const Function = require('./function'); 
const Task = require('./task');

var Master = function(options) {
    this.workers = [];
    this.tasks = [];
    this.options = options;

    for (let i = 0; i < (this.options.threads || numCPUs); i++) {
        this.workers.push(new Worker(this));
    }
}

Master.prototype.task = function(func) {
    var self = this;
    var func = new Function(func, self.options.requires || {});

    for (let worker of self.workers) {
        worker.pushFunction(func);
    }

    return function() {
        debug('adding task', func.id);
        let task = new Task(func, arguments);
        self.tasks.push(task);
        process.nextTick(() => self.execute());
        task.promise.then(() => self.execute(), () => self.execute());
        return task.promise;
    };
}

Master.prototype.execute = function() {
    var self = this;

    for (let worker of self.workers) {
        if (worker.task)
            continue;

        let task = self.tasks.shift();

        if (!task)
            break;

        return worker.execute(task);
    }

    if (self.tasks.length > 0)
        setTimeout(self.execute, 500);
}

module.exports = Master;