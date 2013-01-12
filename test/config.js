var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
    utils = require('../lib/utils'),
    fs = require('fs'),
    os = require('os'),
    prompt = require('prompt'),
    compiler = require('../lib/commands/compiler'),
    Config = require('../lib/models/config').Config;

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
.addBatch({
    'setup config': {
        topic: function(){
            var that = this,
                deps = _.union(_.flatten(_.pluck(dep, 'deps')));
            prompt.get(deps, function(err, result){
                if(err) fail(err);
                // init config
                Config = new Config(TEST_DIR, result, dep, that.callback);
            });
        },
        'returns correct files and dirs': function(err, dirs, files){
            assert.isNull(err);
            var paths = _.pluck(dirs, 'path').map(function(thisPath){
                return path.normalize(thisPath);
            });
            assert.equal(JSON.stringify([ 'app/sass/sections/',
              'app/src/template/sections/',
              'app/src/views/sections/',
              'src/',
              '/src/new/section/' ]), JSON.stringify(paths));
        }
    }
})
.export(module);