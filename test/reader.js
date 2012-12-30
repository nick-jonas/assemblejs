var _ = require('lodash'),
    vows = require('vows'),
    path = require('path'),
    assert = require('assert'),
    fs = require('fs'),
    os = require('os'),
    reader = require('../lib/commands/reader');

/*
Structure of test bed:
    .
    ├── root_dir1
    │   ├── root_dir1_file1.ext1
    │   ├── root_dir1_file2.ext2
    │   ├── root_dir1_file3.ext3
    │   ├── root_dir1_subdir1
    │   │   └── root1_dir1_subdir1_file1.ext1
    │   └── root_dir1_subdir2
    │       └── test.js
    ├── root_dir2
    │   ├── root_dir2_file1.ext1
    │   ├── root_dir2_file2.ext2
    │   ├── root_dir2_subdir1
    │   │   └── test.js
    │   └── root_dir2_subdir2
    │       └── test.js
    ├── root_file1.ext1
    ├── root_file2.ext2
    └── root_file3.ext3

    6 directories, 12 files
*/



// test walk
vows.describe('Read Directory').addBatch({
    'with no filter': {
        topic: function(){
            reader.readDir(path.join(__dirname, 'bed'), this.callback);
        },
        'can be accessed': function(err, files){
            assert.isNull(err);
            assert.isArray(files);
        },
        'returns 12 files': function(err, files){
            assert.equal(files.length, 12);
        },
        'first item has properties': function(err, files){
            assert.isObject(files[0]);
            assert.isString(files[0].filedir);
            assert.isString(files[0].filename);
            assert.isObject(files[0].filestat);
        }
    },
    'with excluding file and directory filters': {
        topic: function(){
            reader.readDir(path.join(__dirname, 'bed'), this.callback, {
                'fileFilter': ['!test.js'],
                'dirFilter': ['!root_dir1']
            });
        },
        'can be accessed': function(err, files){
            assert.isNull(err);
            assert.isArray(files);
        },
        'returns 5 files': function(err, files){
            assert.equal(files.length, 5);
        },
        'does not contain test.js files': function(err, files){
            var filenames = _.pluck(files, 'filename');
            assert.equal(_.indexOf(filenames, 'test.js'), -1);
        }
    },
    'with mixed inclusive and exclusive':{
        topic: function(){
            reader.readDir(path.join(__dirname, 'bed'), this.callback, {
                'fileFilter': ['!test.js'],
                'dirFilter': ['root_dir1']
            });
        },
        'can be accessed': function(err, files){
            assert.isNull(err);
            assert.isArray(files);
        },
        'returns 6 files': function(err, files){
            console.log(_.pluck(files, 'filename'));
            assert.equal(files.length, 6);
        },
        'does not contain test.js files': function(err, files){
            var filenames = _.pluck(files, 'filename');
            assert.equal(_.indexOf(filenames, 'test.js'), -1);
        },
        'only recursed into root and `root_dir1` directory': function(err, files){
            var filedirs = _.pluck(files, 'filedir');
            var unexpectedDirs = _.without(filedirs, '/', 'root_dir1/');
            assert.equal(unexpectedDirs.length, 0);
        }
    },
    'with exclusive directory':{
        topic: function(){
            reader.readDir(path.join(__dirname, 'bed'), this.callback, {
                'dirFilter': ['!root_dir1']
            });
        },
        'can be accessed': function(err, files){
            assert.isNull(err);
            assert.isArray(files);
        },
        'returns 7 files': function(err, files){
            assert.equal(files.length, 7);
        },
        'does not contain directory with root_dir1': function(err, files){
            var filedirs = _.pluck(files, 'filedir'),
                i = 0;
            for(i; i < filedirs.length; i++){
                var items = filedirs[i].split(path.sep);
                assert.equal(_.indexOf(items, 'root_dir1'), -1);
            }
        }
    }
}).export(module);