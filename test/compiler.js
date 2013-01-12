var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
    utils = require('../lib/utils'),
    fs = require('fs'),
    os = require('os'),
    compiler = require('../lib/commands/compiler');

// test dependencies and compile
vows.describe('template').addBatch({
    'get deps from file with none': {
        topic: function(){
            return compiler.getDependenciesFromString('<html><body><div class="it-name"></div></body></html>');
        },
        'returns empty list': function(arr){
            assert.equal(arr.length, 0);
        }
    },
    'get deps from file with deps': {
        topic: function(){
            return compiler.getDependenciesFromString('<html><body><div class="it-name <%=it.color%>"><%=it.name%></div></body></html>');
        },
        'returns empty list': function(arr){
            assert.equal(arr.length, 2);
            assert.equal(JSON.stringify(['color', 'name']), JSON.stringify(arr));
        }
    },
    'get deps from dir with deps': {
        topic: function(){
            return compiler.getDependenciesFromDir(path.resolve(__dirname, 'bed/compiler'), this.callback);
        },
        'returns dep array': function(err, arr){
            assert.isNull(err);
            assert.equal(arr.length, 3);
            //assert.equal(JSON.stringify(['name', 'description']), JSON.stringify(arr));
        }
    }
}).export(module);