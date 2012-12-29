var vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    reader = require('../lib/commands/reader');

// test walk
vows.describe('Read Directory').addBatch({
    'A file bed': {
        topic: function(){
            reader.readDir(path.join(__dirname, 'bed'), this.callback);
        },
        'should return 12 files': function(files){
            assert.equal(files.length, 12);
        }
    }
}).run();