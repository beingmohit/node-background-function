const uuidv4 = require('uuid/v4');
const funcster = require('funcster');
const debug = require('debug')('function');

var Function = function(func, requires) {
    this.id = uuidv4();
    this.func = funcster.serialize(func);
    this.requires = requires || {};
}

module.exports = Function;