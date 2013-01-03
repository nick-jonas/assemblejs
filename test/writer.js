var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
    fs = require('fs'),
    os = require('os'),
    writer = require('../lib/commands/writer');


var TEST_DIR = path.resolve(__dirname, 'testproj');

// test walk
vows.describe('Write `create/init` command').addBatch({
    'with no filter': {
        topic: function(){
            writer.execute(path.join(__dirname, '../lib/templates/create/'),
                {name: ' my project', description: ' my test project xxx', path: TEST_DIR}, this.callback);
        },
        'is created': function(err, result){
            assert.isNull(err);
            assert.isNotNull(result);
            assert.equal(result, TEST_DIR);
            assert.isTrue(fs.existsSync(TEST_DIR));
        }
    }
}).export(module);