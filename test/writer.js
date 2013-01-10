var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    shell = require('../lib/shell'),
    utils = require('../lib/utils'),
    fs = require('fs'),
    os = require('os'),
    writer = require('../lib/commands/writer');


var TEST_DIR = path.resolve(__dirname, 'testproj');

// test walk
vows.describe('`create/init` command').addBatch({
    'with spaces in front of name and description': {
        topic: function(){
            writer.execute(path.join(__dirname, '../lib/templates/create/'),
                {name: utils.sanitizeClassName(' my project'), description: ' my test project xxx', path: TEST_DIR}, this.callback);
        },
        'is created': function(err, vars, result){
            assert.isNull(err);
            assert.isNotNull(result);
            assert.isNotNull(vars);
            assert.equal(result, TEST_DIR);
            assert.strictEqual(vars.name, 'MyProject');
            assert.isTrue(fs.existsSync(TEST_DIR));
        }
    }
}).export(module);