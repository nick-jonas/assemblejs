var _ = require('lodash'),
    fs = require('fs'),
    path = require('path'),
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
var Config = function( path, vars ){
    var that = this,
        i = 0;
    this.data = {};
    this.templates = [];
    this.templateDir = path;
    fs.readFile(path + '.assembleconfig', function(err, file){
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
            that.emit('init');
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
Config.prototype.getFileFilter = function(){
    var defaults = ['!.assembleconfig'],
        config = this.data.file_filter || [];
    return _.union(defaults, config);
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