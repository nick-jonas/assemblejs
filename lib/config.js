var _ = require('lodash'),
    prompt = require('prompt'),
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
        CONFIG_FILE = '.assembleconfig';
    this.data = {};
    this.depInfo = depInfo;
    this.completeFn = completeFn;
    this.templates = [];
    this.templateDir = templateDir;
    this.dirs = [];
    this.files = [];
    this.fileFilter = [];
    this.defaultFileFilter = ['!' + CONFIG_FILE];
    this.dirFilter = [];
    this.file_mapping = [];

    fs.readFile(path.join(templateDir, CONFIG_FILE), function(err, file){
        if(err) {
            completeFn(err);
        }else{
            if(!vars){
                var schema = {properties: {}},
                    deps = _.union(_.flatten(_.pluck(depInfo, 'deps'))),
                    i = 0;

                // Create prompt schema
                //----------------------
                // set defaults for each dependency
                for(i; i < deps.length; i++){
                    schema['properties'][deps[i]] = {
                        required: true,
                        message: 'Enter a value for \'' + deps[i].cyan + '\''
                    };
                }
                var varMapping = JSON.parse(file.toString()).var_mapping;
                // extend with var mappings in config file
                schema.properties = _.extend(schema.properties, varMapping);
                // prompt user
                prompt.get(schema, function(err, result){
                    if(err) completeFn(err);
                    // set vars for template
                    that.vars = result;
                    that.parseConfig(file);
                });
            }else{
                that.vars = vars;
                that.parseConfig(file);
            }
        }
    });
};

Config.prototype.parseConfig = function(file){
    var that = this;
    // if config file has variables, compile it
    var fileStr = file.toString();
    if(compiler.getDependenciesFromString(fileStr).length > 0){
        fileStr = compiler.compileStr(fileStr, that.vars);
    }
    // parse config file
    that.data = JSON.parse(fileStr);
    // get all file mappings
    this.getFileMapping();
    // get file and directory filters
    this.getFilters();
    // read all files in template directory
    this.getFiles();
};

Config.prototype.getFiles = function(){
    var that = this;
    readdirp({ 'root': this.templateDir,
            'fileFilter': this.fileFilter,
            'directoryFilter': this.dirFilter }, function (errors, res) {
        if (errors) {
            errors.forEach(function (err) {
                that.completeFn(err);
            });
        }
        // save output file paths
        for(var i = 0; i < res.files.length; i++){
            var f = res.files[i],
                inputFile = f.path,
                outputDir = that.getOutputDir(inputFile, f.parentDir),
                outputFilePath = that.getOutputFilePath(inputFile, f.path),
                outputFilename = path.basename(outputFilePath);

            that.files.push({
                'input': {'dir': f.parentDir, 'path': inputFile, 'filename': f.name},
                'output': {'dir': outputDir, 'path': outputFilePath, 'filename': outputFilename},
                'vars': _getVariables(res.files[i].fullPath, that.depInfo)
            });

            that.dirs.push({
                'path': outputDir,
                'exists': fs.existsSync(outputDir)
            });
        }
        // FINITO!
        that.completeFn(null, that.dirs, that.files, that.vars, that.data.output_file_dir);
    });
};

Config.prototype.getFileMapping = function(){
    // get file mapping
    if(this.data.file_mapping !== undefined){
        if(_.isArray(this.data.file_mapping)){
            this.file_mapping = this.data.file_mapping;
        }
    }
};

Config.prototype.getFilters = function(){
    if(this.data.file_filter) this.fileFilter = this.data.file_filter;
    if(this.data.dir_filter) this.dirFilter = this.data.dir_filter;
    this.fileFilter = _.union(this.defaultFileFilter, this.fileFilter);
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
 * @param {String} path to file, including the filename, relative to project root
 * @return {String} output directory for the template file, relative to project root
 * @api public
 */
Config.prototype.getOutputDir = function(inputFile, inputFileParentDir){
    var dir = inputFileParentDir;
        templ = this.getTemplateModelFromInputFile(inputFile);
    if(templ){
        dir = path.dirname(templ.output);
    }
    return dir;
};

/**
 *  Get output filename for template if specified, original name otherwise
 *
 * @param {String} path to file, including the filename, relative to project root
 * @return {String} new file name if specified in .assemble_config, or null
 * @api public
 */
Config.prototype.getOutputFilePath = function(inputFile, inputFilename){
    var templ = this.getTemplateModelFromInputFile(inputFile);
    if(templ){
        return templ.output;
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
    for(i; i < this.file_mapping.length; i++){
        thisTemplate = this.file_mapping[i].input;
        if(path.join(this.templateDir, thisTemplate) === path.join(this.templateDir, inputFile)){
            return this.file_mapping[i];
        }
    }
    return null;
};

Config.prototype.__proto__ = EventEmitter.prototype;

exports.Config = Config;