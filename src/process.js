const debug = require('debug')('process');
const Promise = require("bluebird");
const util = require('util');
const vm = require('vm');

var functions = {};

process.on('message', function (message) {
    debug('message', message.type);

    if (message.type == 'function')
        add(message.data);
    else if (message.type == 'task')
        execute(message.data);
});

function add(data) {
    data.requires = data.requires || {};
    data.requires.Promise = 'bluebird';
    functions[data.id] = operateFunction(data.func, data.requires);
}

function execute(data) {
    try {
        debug('executing function', data.func, data.arg);
        var func = functions[data.func];
        var arg = data.arg.concat(func.context);
        var result = func.script.apply(null, arg);
    
        if (result.constructor.name != 'Promise')
            return sendSuccess(result);

        result.then(sendSuccess, sendError);
    } catch (error) {
        debug('error', error);
        sendError(error);
    }
}

function sendSuccess(result) {
    process.send({
        type: 'task_resolve',
        result: result
    });
}

function sendError(error) {
    process.send({
        type: 'task_reject',
        error: error
    });
}

function operateFunction(func, requires) {
    var params = getParamNames(func);
    var body = getFunctionBody(func);
    var context = [];
    
    for (var key in requires || {}) {
        params.push(key);
        context.push(require(requires[key]));
    }

    var funString = 'function(';
    funString += params.join(', ');
    funString += ') {';
    funString += body;
    funString += '};';

    return {
        script: new Function('return ' + funString)(),
        context: context
    }
}


function getParamNames(func) {
    var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
    var ARGUMENT_NAMES = /([^\s,]+)/g;

    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

function getFunctionBody(func) {
    return func.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1];
}