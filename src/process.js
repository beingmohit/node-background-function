const debug = require('debug')('process');
const funcster = require('funcster');
const Promise = require("bluebird");

var functions = {};

process.on('message', function(message) {
    debug('message', message.type);

    if (message.type == 'function') 
        add(message.data);
    else if (message.type == 'task') 
        execute(message.data);
});

function add(data) {

    data.requires = data.requires || {};
    data.requires.Promise = 'bluebird';
    
    functions[data.id] = funcster.deepDeserialize(data.func, {
        requires: data.requires || {}
    });
}

function execute(data) {
    try {
        debug('executing function', data.func, data.arg);
        var result = functions[data.func].apply(null, data.arg);
        
        if (result.constructor.name != 'Promise')
            return sendSuccess(result);

        result.then(sendSuccess, sendError);
    } catch(error) {
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