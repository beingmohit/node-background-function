const child_process = require('child_process');
const uuidv4 = require('uuid/v4');
const debug = require('debug')('worker');

var Worker = function(master) {
    this.id = uuidv4();
    this.master = master;
    this.process = null;
    this.task = null;

    this.startProcess();
}

Worker.prototype.startProcess = function() {
    var self = this;
    self.process = child_process.fork(__dirname + '/process.js');
    self.process.on('message', function(message) {
        self.handelMessage(message);
    });
}

Worker.prototype.handelMessage = function(message) {
    debug('message', message.type);
    if (message.type == 'task_resolve') {
        this.task.resolve(message.result);
        this.task = null;
    } else if (message.type == 'task_reject') {
        this.task.reject(message.error);
        this.task = null;
    }
}

Worker.prototype.pushFunction = function(func) {
    debug('pushing function:', func.id);
    this.process.send({
        type: 'function',
        data: func
    });
}

Worker.prototype.execute = function(task) {
    debug('pushing task:', task.id);
    this.task = task;
    this.process.send({
        type: 'task',
        data: task
    });
}

module.exports = Worker;