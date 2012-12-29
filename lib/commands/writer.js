/*
    Writer

    Compiles template files and writes to file system
    author: @nick-jonas
    date: 12/18/12
*/

var _ = require('lodash'),
    fs = require('fs-extra'),
    path = require('path'),
    reader = require('../commands/reader'),
    mkdirp = require('mkdirp'),
    shell = require('../shell'),
    prompt = require('prompt'),
    Config = require('../models/config').Config,
    current_directory = path.normalize(process.cwd());


var _currentIndex = 0,
    _traceLog = [], // collect console.log statements for when execution is complete
    _vars = {},
    _replaceAll = false;

/**
 * Writes file
 *
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files, 'name' is required
 * @api public
 */
var _execute = function(templateDir, vars){
    _vars = vars;
    // init config
    Config = new Config(templateDir, vars);

    // reset globals
    _replaceAll = false;
    _traceLog = [];

    Config.on('init', function(){
        if(vars.name === undefined) throw new Error('The file name needs to be defined.');
        _filesToWrite = Config.files.length;
        _writeNextFile();
    });
};


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
            'message': 'The file ' + thisFile.output.filename.blue + ' already exists. Do you wish to overwrite? Type \'all\' to replace all',
            'default': 'no'
        }],
        function(err, result){
            if(result.yesno === 'yes' || result.yesno === 'y'){
                // user wants to replace file
                _writeFile(thisFile, _onWriteFileComplete);
            }
            else if(result.yesno === 'a' || result.yesno === 'all'){
                // user wants to replace this and all further files
                _writeFile(thisFile, _onWriteFileComplete);
                _replaceAll = true;
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

var _onWriteAllFilesComplete = function(){
    for(var i = 0; i < _traceLog.length; i++){
        console.log(_traceLog[i]);
    }
    _traceLog = [];
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
    // create directory
    mkdirp(file.output.dir, function(err){
        if(err) _traceLog.push(err);
        // if templated file, compile and write
        if(file.isTemplated){
            _compileTemplate(path.join(Config.templateDir, file.input.path), function(templateOutput){
                fs.writeFile(file.output.path, templateOutput);
                _traceLog.push('✓ templated: ' + file.output.path);
                if(onComplete) onComplete();
            });
        }
        // otherwise just copy and paste with output_file_name into output_file_dir
        else{
            try{
                var src = path.join(Config.templateDir, file.input.path),
                    dest = path.join(current_directory, file.output.path);

                shell.cp('-f', src, dest);
                _traceLog.push('✓ copied: ' + file.output.filename);
                if(onComplete) onComplete();
            }catch(e){
                throw new Error(e);
            }
        }
    });
};

var _onWriteFileComplete = function(){
    _currentIndex++;
    if(_currentIndex >= Config.files.length){
        _onWriteAllFilesComplete();
    }else{
        _writeNextFile();
    }
};

/**
 * Compiles template file
 *
 * @param {String} input file
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files
 * @api private
 */
var _compileTemplate = function(fullFilePath, onCompleteFn){
    var templateOutput = '';
    // read template file
    fs.readFile(fullFilePath, function(err, file){
        if(err) throw err;
        // compile template with data
        try{
            var templateFn = _.template(file.toString());
            templateOutput = templateFn(_vars);
            onCompleteFn(templateOutput);
        }catch(e){
            throw new Error(e);
        }
    });
};

module.exports = {execute: _execute};