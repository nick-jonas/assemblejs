var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
    fs = require('fs'),
    os = require('os'),
    prompt = require('prompt'),
    compiler = require('../lib/commands/compiler'),
    Config = require('../lib/config').Config;

var TEST_DIR = path.resolve(__dirname, 'bed/config'),
    dep;

// test dependencies and compile
vows.describe('config')
.addBatch({
    'get deps': {
        topic: function(){
            compiler.getDependenciesFromDir(TEST_DIR, this.callback);
        },
        'there are 5 files with dependencies': function(err, depInfo){
            dep = depInfo;
            assert.equal(_.pluck(depInfo, 'fileInfo').length, 5);
        },
        'gets correct dependencies': function(err, depInfo){
            var deps = _.union(_.flatten(_.pluck(depInfo, 'deps')));
            assert.equal(JSON.stringify(deps), JSON.stringify(['name', 'testVar', 'description', 'testDeepVar']));
        }
    }
})
.export(module);