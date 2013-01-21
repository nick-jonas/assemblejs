var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
    fs = require('fs'),
    os = require('os'),
    writer = require('../lib/commands/writer');


var TEST_DIR = path.join(__dirname, 'testproj');

// test walk
vows.describe('`create/init` command').addBatch({
    'with spaces in front of name and description': {
        topic: function(){
            writer.execute(path.join(__dirname, '../templates/init/'), this.callback, {'name' : 'test', 'outputDir': TEST_DIR}, true);
        },
        'is created': function(err, vars, result){
            assert.isNull(err);
            assert.isNotNull(result);
            assert.isNotNull(vars);
            assert.equal(result, TEST_DIR);
            assert.isTrue(fs.existsSync(TEST_DIR));
        }
    }
}).export(module);