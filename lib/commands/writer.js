/*
    Writer

    Compiles template files and writes to file system
    author: @nick-jonas
    date: 12/18/12
*/

var _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    mkdirp = require('mkdirp'),
    shell = require('../shell'),
    prompt = require('prompt'),
    doT = require('doT'),
    compiler = require(path.resolve(__dirname, 'compiler')),
    Config = require('../models/config').Config,
    current_directory = path.normalize(process.cwd());


var _currentIndex = 0,
    _newDirectories = [],
    _traceLog = [], // collect console.log statements for when execution is complete
    _vars = {},
    _replaceAll = false,
    _callback = null;

// customize prompt message
prompt.message = 'AssembleJS'.magenta;

/**
 * Writes file
 *
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files, 'name' is required
 * @api public
 */
var _execute = function(templateDir, path, callback){
    _vars = {};
    _callback = callback;
    _currentIndex = 0;
    _replaceAll = false;
    _traceLog = [];

    // prompt user for dependencies
    compiler.getDependenciesFromDir(templateDir, function(err, depInfo){
        if(err) fail(err);
        // get user input
        var deps = _.union(_.flatten(_.pluck(depInfo, 'deps')));
        prompt.get(deps, function(err, result){
            if(err) fail(err);

            // set vars for template
            _vars = result;

            // set output directory
            _setOutputDir(path);

            // init config
            Config = new Config(templateDir, _vars, depInfo, function(err, dirs, files){
                _filesToWrite = files.length;
                // write out directories that don't exist
                _newDirectories = _.where(dirs, {'exists': false});
                _writeDirectories(_writeNextFile);
            });
        });

    });
};

// resolves dir, creates dir if needs to, and cd's into it
var _setOutputDir = function(userInputPath){
    if(userInputPath){
        current_directory = path.resolve(current_directory, userInputPath);
        if(!fs.existsSync(current_directory)){
            try{
                fs.mkdirSync(current_directory);
            }catch(e){
                _fail(e);
            }
        }
        shell.cd(current_directory);
    }
};

/**
 * Asyncronously writes new directories
 *
 * @api private
 */
var _writeDirectories = function(completeFn){
    if(_currentIndex < _newDirectories.length){
        mkdirp(_newDirectories[_currentIndex].path, function(err){
            if(err) _fail(err);
            _writeDirectories(completeFn);
        });
        _currentIndex++;
    }else{
        // finished writing new directories
        _currentIndex = 0;
        completeFn();
    }
};


/**
 * Check if file exists, prompt user if they want to replace, then write file
 *
 * @api private
 */
var _writeNextFile = function(){
    var thisFile = Config.files[_currentIndex],
        isExisting = fs.existsSync(thisFile.output.path);
    if(isExisting && !_replaceAll){
        // file already exists, make sure user wants to overwrite
        prompt.get([{
            'name': 'yesno',
            'validator': /y[es]*|n[o]*|a[ll]?/,
            'warning': 'Must respond [y]es, [n]o, or [a]ll to replace all.',
            'required': true,
            'message': 'Replace ' + (thisFile.output.filename + '?').blue + ' (\'all\' to replace all)',
            'default': 'no'
        }],
        function(err, result){
            if(result.yesno === 'yes' || result.yesno === 'y'){
                // user wants to replace file
                _writeFile(thisFile, _onWriteFileComplete);
            }
            else if(result.yesno === 'a' || result.yesno === 'all'){
                // user wants to replace this and all further files
                _replaceAll = true;
                _writeFile(thisFile, _onWriteFileComplete);
            }
            else{
                // continue on, don't replace file
                _onWriteFileComplete();
            }
        });
    }else{
        _writeFile(thisFile, _onWriteFileComplete);
    }
};

/**
 * Writes output file
 *
 * @param {String} input file
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files
 * @api private
 */
var _writeFile = function(file, onComplete){
    // if templated file, compile and write
    if(file.vars.length > 0){
        compiler.compileFile(path.join(Config.templateDir, file.input.path), _vars, function(err, templateOutput){
            if(err) _fail(err);
            fs.writeFile(file.output.path, templateOutput, function(err){
                if(err) _fail(err);
                _traceLog.push('✓ templated: ' + file.output.path);
                if(onComplete) onComplete();
            });
        });
    }
    // otherwise just copy and paste with output_file_name into output_file_dir
    else{
        try{
            var src = path.join(Config.templateDir, file.input.path),
                dest = path.join(current_directory, file.output.path);

            shell.cp('-f', src, dest);
            _traceLog.push('✓ copied: ' + dest);
            if(onComplete) onComplete();
        }catch(e){
            throw new Error(e);
        }
    }
};


/**
 * When file is written, check index and write next file
 *
 * @api private
 */
var _onWriteFileComplete = function(){
    _currentIndex++;
    if(_currentIndex >= Config.files.length){
        _onWriteAllFilesComplete();
    }else{
        _writeNextFile();
    }
};

/**
 * ALL files are completed, trace log
 *
 * @api private
 */
var _onWriteAllFilesComplete = function(){
    _callback(null, _vars, current_directory);
};

var _fail = function(err){
    _callback(err);
};

module.exports = {execute: _execute};