var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    compiler = require('../lib/commands/compiler'),
    EventEmitter = require('events').EventEmitter;

/**
 *  Config
 *  - Wrapper functionality for .assemble_config files
 *  - Holds a collection of template models for each command
 *
 * @param {String} path to directory for .assemble_config
 * @param {Object} if vars provided, template is compiled with them
 * @param {Object} return object from compiler.getDependenciesFromDir()
 * @param {Function} callback(err, dir, files)
 * @api constructor
 */
var Config = function( templateDir, vars, depInfo, completeFn ){
    var that = this,
        CONFIG_FILE = '.assembleconfig',
        i = 0,
        defaultFileFilter = ['!' + CONFIG_FILE];

    // define public properties
    this.data = {};
    this.vars = vars;
    this.templates = [];
    this.templateDir = templateDir;
    this.dirs = [];
    this.files = [];
    this.fileFilter = [];
    this.dirFilter = [];
    this.file_renames = [];

    fs.readFile(path.join(templateDir, CONFIG_FILE), function(err, file){
        if(err) {
            completeFn(err);
        }else{

            // if config file has variables, compile it
            var fileStr = file.toString();
            if(compiler.getDependenciesFromString(fileStr).length > 0){
                fileStr = compiler.compileStr(fileStr, that.vars);
            }

            // parse config file
            that.data = JSON.parse(fileStr);

            // get templates
            if(that.data.file_renames !== undefined){
                if(_.isArray(that.data.file_renames)){
                    that.file_renames = that.data.file_renames;
                }
            }

            // file filter
            if(that.data.file_filter) that.fileFilter = that.data.file_filter;
            if(that.data.dir_filter) that.dirFilter = that.data.dir_filter;
            that.fileFilter = _.union(defaultFileFilter, that.fileFilter);

            // read all files in template directory
            readdirp({ 'root': templateDir,
                    'fileFilter': that.fileFilter,
                    'directoryFilter': that.dirFilter }, function (errors, res) {
                if (errors) {
                    errors.forEach(function (err) {
                        completeFn(err);
                    });
                }
                // save output file paths
                for(var i = 0; i < res.files.length; i++){
                    var f = res.files[i],
                        inputFile = f.path,
                        outputDir = that.getOutputDir(inputFile, f.parentDir),
                        outputFilename = that.getOutputFilename(inputFile, f.name),
                        outputFilePath = path.join(outputDir, outputFilename);

                    that.files.push({
                        'input': {'dir': f.parentDir, 'path': inputFile, 'filename': f.name},
                        'output': {'dir': outputDir, 'path': outputFilePath, 'filename': outputFilename},
                        'vars': _getVariables(res.files[i].fullPath, depInfo)
                    });

                    that.dirs.push({
                        'path': outputDir,
                        'exists': fs.existsSync(outputDir)
                    });
                }

                // FINITO!
                completeFn(null, that.dirs, that.files);
            });
        }
    });
};

// helper fn for getting file dependencies from depInfo object
var _getVariables = function( fullPath, depInfo ){
    var i = -1,
        len = depInfo.length;
    while(++i < len){
        if(depInfo[i].fileInfo.fullPath === fullPath){
            return depInfo[i].deps;
        }
    }
    return [];
};

/**
 *  Get output directory for template
 *
 *  Returns the output file directory of the input file with this priority:
 *  1) 'output_file_dir' of a specified template in config
 *  2) inputFileParentDir
 *
 * @param {String} path to file, including the filename, relative to project root
 * @return {String} output directory for the template file, relative to project root
 * @api public
 */
Config.prototype.getOutputDir = function(inputFile, inputFileParentDir){
    var dir = inputFileParentDir;
        templ = this.getTemplateModelFromInputFile(inputFile);
    if(templ){
        dir = templ.output_file_dir;
    }
    if(dir !== '') dir += '/';
    return dir;
};

/**
 *  Get output filename for template if specified, original name otherwise
 *
 * @param {String} path to file, including the filename, relative to project root
 * @return {String} new file name if specified in .assemble_config, or null
 * @api public
 */
Config.prototype.getOutputFilename = function(inputFile, inputFilename){
    var templ = this.getTemplateModelFromInputFile(inputFile);
    if(templ){
        return templ.output_file_name;
    }
    return inputFilename;
};

/**
 *  Get Template model given the input file path
 *
 * @param {String} path to file, including the filename, relative to project root
 * @return {Template} returns a Template model
 * @api private
 */
Config.prototype.getTemplateModelFromInputFile = function(inputFile){
    var thisTemplate = null,
        i = 0;
    for(i; i < this.file_renames.length; i++){
        thisTemplate = this.file_renames[i].input_file;
        if(path.join(this.templateDir, thisTemplate) === path.join(this.templateDir, inputFile)){
            return this.file_renames[i];
        }
    }
    return null;
};

Config.prototype.__proto__ = EventEmitter.prototype;

exports.Config = Config;