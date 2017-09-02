const uuidv4 = require('uuid/v4');
const debug = require('debug')('function');

var Function = function(func, requires) {
    this.id = uuidv4();
    this.func = func.toString();
    this.requires = requires || {};
}

module.exports = Function;