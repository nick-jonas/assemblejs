var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
    readdirp = require('readdirp'),
    reader = require('../commands/reader'),
    EventEmitter = require('events').EventEmitter,
    Template = require('./template').Template;

/**
 *  Config
 *  - Wrapper functionality for .assemble_config files
 *  - Holds a collection of template models for each command
 *
 * @param {String} path to directory for .assemble_config
 * @param {Object} if vars provided, template is compiled with them
 * @api constructor
 */
var Config = function( templateDir, vars ){
    var that = this,
        CONFIG_FILE = '.assembleconfig',
        i = 0,
        defaultFileFilter = ['!' + CONFIG_FILE];

    // define public properties
    this.data = {};
    this.templates = [];
    this.templateDir = templateDir;
    this.dirs = [];
    this.files = [];
    this.fileFilter = [];
    this.dirFilter = [];

    fs.readFile(templateDir + CONFIG_FILE, function(err, file){
        if(err) {
            console.log('No config file was found for this command.');
        }else{
            var fileStr = file.toString();
            // if variables provided, compile template
            if(vars !== undefined){
                var templateFn = _.template(fileStr);
                fileStr = templateFn(vars);
            }
            // parse file
            that.data = JSON.parse(fileStr);

            // get templates
            if(that.data.templates !== undefined){
                for(i; i < that.data.templates.length; i++){
                    that.templates.push(new Template(that.data.templates[i]));
                }
            }

            // file filter
            if(that.data.file_filter) that.fileFilter = that.data.file_filter;
            if(that.data.dir_filter) that.dirFilter = that.data.file_filter;
            that.fileFilter = _.union(defaultFileFilter, that.fileFilter);

            readdirp({ 'root': templateDir,
                    'fileFilter': that.fileFilter,
                    'directoryFilter': that.dirFilter }, function (errors, res) {
                if (errors) {
                    errors.forEach(function (err) {
                        console.error('Error: ', err);
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
                        'isTemplated': (that.getTemplateModelFromInputFile(inputFile) !== null)
                    });
                }

                // save output directories
                for(var j = 0; j < res.directories.length; j++){
                    var d = res.directories[j];
                    that.dirs.push({
                        'path': d.path,
                        'exists': fs.existsSync(d.path)
                    });
                }

                that.emit('init');
            });
        }
    });
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
        dir = templ.getOutputDir();
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
        return templ.getOutputFilename();
    }
    return inputFilename;
};

/**
 *  Get file filter
 *
 * @return {Array}
 * @api public
 */
// Config.prototype.getFileFilter = function(){
//     var defaults = ['!.assembleconfig'],
//         config = this.data.file_filter || [];
//     return _.union(defaults, config);
// };

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
    for(i; i < this.templates.length; i++){
        thisTemplate = this.templates[i].getInputFile();
        if(path.join(this.templateDir, thisTemplate) === path.join(this.templateDir, inputFile)){
            return this.templates[i];
        }
    }
    return null;
};

Config.prototype.__proto__ = EventEmitter.prototype;

exports.Config = Config;