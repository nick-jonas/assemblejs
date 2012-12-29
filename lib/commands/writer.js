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


var _filesToWrite = 0,
    _currentIndex = 0
    _vars = {};

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

    Config.on('init', function(){
        if(vars.name === undefined) throw new Error('The file name needs to be defined.');

        // // asynch walk template directory
        // reader.walk(templateDir, function(filedir, filename, filestat){
        //     // TODO, remove return statement yields 'templates not defined' reference error
        //     _writeFile(templateDir, filedir, filename, vars);
        // }, function(err){
        //     // completed walk
        // }, Config.fileFilter);

        _filesToWrite = Config.files.length;
        _writeNextFile();

    });
};


var _writeNextFile = function(){
    var thisFile = Config.files[_currentIndex],
        isExisting = fs.existsSync(thisFile.output.path);
    if(isExisting){
        // file already exists, make sure user wants to overwrite
        prompt.get([{
            'name': 'yesno',
            'validator': /y[es]*|n[o]?/,
            'warning': 'Must respond yes or no',
            'required': true,
            'message': 'The file ' + thisFile.output.filename.blue + ' already exists.  Do you wish to overwrite?',
            'default': 'no'
        }],
        function(err, result){
            // user wants to replace file
            if(result.yesno === 'yes'){
                _writeFile(thisFile, _onWriteFileComplete);
            }else{
                // continue on, don't replace file
                _onWriteFileComplete();
            }
    });
    }else{
        _writeFile(thisFile, _onWriteFileComplete);
    }


};

var _onWriteAllFilesComplete = function(){
    console.log('success!');
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
        if(err) console.log(err);
        // if templated file, compile and write
        if(file.isTemplated){
            _compileTemplate(path.join(Config.templateDir, file.input.path), function(templateOutput){
                fs.writeFile(file.output.path, templateOutput);
                if(onComplete) onComplete();
                console.log('✓ templated: ' + file.output.path);
            });
        }
        // otherwise just copy and paste with output_file_name into output_file_dir
        else{
            try{
                var src = file.input.path,
                    dest = path.join(current_directory, file.output.path);

                shell.cp(src, dest);
                if(onComplete) onComplete();
                console.log('✓ copied: ' + src + ' > ' + dest);
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