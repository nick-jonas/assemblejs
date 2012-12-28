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
    Config = require('../models/config').Config,
    current_directory = path.normalize(process.cwd());

_counter = 0;

/**
 * Writes file
 *
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files, 'name' is required
 * @api public
 */
var _execute = function(templateDir, vars){

    // init config
    Config = new Config(templateDir, vars);
    Config.on('init', function(){
        if(vars.name === undefined) throw new Error('The file name needs to be defined.');
        // read files in directory

        reader.walk(templateDir, function(filedir, filename, filestat){
            // TODO, remove return statement yields 'templates not defined' reference error
            _writeFile(templateDir, filedir, filename, vars);
        }, function(err){
            // completed walk
        }, Config.getFileFilter());
    });
};


/**
 * Writes template file
 *
 * @param {String} input file
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files
 * @api private
 */
var _writeFile = function(templateDir, filedir, filename, vars){
    var that = this,
        filePath = filedir + filename,
        isTemplated = (Config.getTemplateModelFromInputFile(filePath) !== null),
        output_file_dir = Config.getOutputDir(filePath, filedir),
        output_file_name = Config.getOutputFilename(filePath, filename),
        output_path = path.join(output_file_dir, output_file_name);

    // create directory
    //mkdir('-p', output_file_dir);
    mkdirp(output_file_dir, function(err){
        if(err) console.log(err);
        // if templated file, compile and write
        if(isTemplated){
            var templateOutput = _compileTemplate(filePath, filename, templateDir, vars);
            fs.writeFile(output_path, templateOutput);
            console.log('✓ templated: ' + output_path);
        }
        // otherwise just copy and paste with output_file_name into output_file_dir
        else{
            try{
                var src = path.join(templateDir, filePath),
                    dest = path.join(current_directory, output_path);

                shell.cp(src, dest);
                console.log('✓ copied: ' + src + ' > ' + dest);
            }catch(e){
                throw new Error(e);
            }


        }


    });
};

/**
 * Compiles template file
 *
 * @param {String} input file
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files
 * @api private
 */
var _compileTemplate = function(filepath, filename, templateDir, vars){
    var templateOutput = '';
    // read template file
    fs.readFile(templateDir + filepath, function(err, file){
        if(err) throw err;
        // compile template with data
        try{
            var templateFn = _.template(file.toString());
            templateOutput = templateFn(vars);
        }catch(e){
            throw new Error('Error templating file: ' + filename);
        }
        return templateOutput;
    });
};

module.exports = {execute: _execute};