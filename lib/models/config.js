var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
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
        defaultFilter = ['!' + CONFIG_FILE];

    // define public properties
    this.data = {};
    this.templates = [];
    this.templateDir = templateDir;
    this.files = []; // {in:xx.js, out:xxx.js}
    this.fileFilter = [];

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
            that.fileFilter = _.union(defaultFilter, that.fileFilter);

            // get all input/output files
            reader.readDir(templateDir, function(files){
                for(var i = 0; i < files.length; i++){
                    var inputFile = path.join(files[i].filedir + files[i].filename),
                        outputDir = that.getOutputDir(inputFile, files[i].filedir),
                        outputFilename = that.getOutputFilename(inputFile, files[i].filename),
                        outputFilePath = path.join(outputDir, outputFilename);
                    that.files.push({
                        'input': {'dir': files[i].filedir, 'path': inputFile, 'filename': files[i].filename},
                        'output': {'dir': outputDir, 'path': outputFilePath, 'filename': outputFilename},
                        'isTemplated': (that.getTemplateModelFromInputFile(inputFile) !== null)
                    });
                }

                // config is complete
                that.emit('init');

            }, that.fileFilter);
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