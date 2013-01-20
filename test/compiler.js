var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
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
    },
    'test helpers': {
        topic: function(){
            return compiler.compileStr('<html><body><div class="it-name <%@capitalize it.val%>"><%@className it.val2%></div></body></html>', {
                'val': 'this should be capitalized',
                'val2': 'my class name'
            });
        },
        'returns compiled output filtered through helpers': function(out){
            assert.notEqual(out.indexOf('This should be capitalized'), -1);
            assert.notEqual(out.indexOf('MyClassName'), -1);
        }
    },
    'test conditional': {
        topic: function(){
            fs.readFile(path.resolve(__dirname, 'bed/cond.html'), this.callback);
        },
        'conditionals apply': function(err, data){
            var out1 = compiler.compileStr(data.toString(), {'hasLiveReload': "false"});
            assert.equal(out1.indexOf('<script id="live-reload">'), -1);
            var out2 = compiler.compileStr(data.toString(), {'hasLiveReload': false});
            assert.equal(out2.indexOf('<script id="live-reload">'), -1);
            var out3 = compiler.compileStr(data.toString(), {'hasLiveReload': "no"});
            assert.equal(out3.indexOf('<script id="live-reload">'), -1);
            var out4 = compiler.compileStr(data.toString(), {'hasLiveReload': "n"});
            assert.equal(out4.indexOf('<script id="live-reload">'), -1);
        }
    }
}).export(module);