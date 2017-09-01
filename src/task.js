const uuidv4 = require('uuid/v4');
const Promise = require("bluebird");
const debug = require('debug')('task');

var Task = function(func, arg) {
    this.id = uuidv4();
    this.func = func.id;
    this.arg = this.getArguments(arg);
    var self = this;
    this.promise = new Promise(function(resolve, reject){
        self.resolve = resolve;
        self.reject = reject;
    });
}

Task.prototype.getArguments = function(arg) {
    return Object.keys(arg).map(function(key) {
        return arg[key];
    });
}

module.exports = Task;