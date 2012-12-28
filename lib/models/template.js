var _ = require('lodash');

/**
 *  Templates
 *
 *  Template model for the command config
 *
 * @param {Object} Template object from .assemble_config
 * @api constructor
 */
var Template = function( data ){
    this.data = data;
};

Template.prototype.getInputFile = function(){
    return this.data.input_file;
};

Template.prototype.getOutputDir = function(){
    return this.data.output_file_dir;
};

Template.prototype.getOutputFilename = function(){
    return this.data.output_file_name;
};

exports.Template = Template;