var _ = require('lodash'),
    fs = require('fs-extra'),
    readdirp = require('readdirp'),
    doT = require('dot');

// configure template engine
doT.templateSettings = {
        evaluate:    /\<\%([\s\S]+?)\%\>/g,
        interpolate: /\<\%=([\s\S]+?)\%\>/g,
        encode:      /\<\%!([\s\S]+?)\%\>/g,
        use:         /\<\%#([\s\S]+?)\%\>/g,
        define:      /\<\%##\s*([\w\.$]+)\s*(\:|=)([\s\S]+?)#\%\>/g,
        conditional: /\<\%\?(\?)?\s*([\s\S]*?)\s*\%\>/g,
        iterate:     /\<\%~\s*(?:\}\}|([\s\S]+?)\s*\:\s*([\w$]+)\s*(?:\:\s*([\w$]+))?\s*\%\>)/g,
        varname: 'it',
        strip: false,
        append: true,
        selfcontained: false
    };

/**
 * Compiles template file
 *
 * @param {String} input file
 * @param {String} input template dir path relative to bin (i.e. '../lib/templates/view/')
 * @param {Object} variables passed along to template files
 * @api private
 */
var _compileFile = function(fullFilePath, vars, onCompleteFn){
    var templateOutput = '';
    // read template file
    fs.readFile(fullFilePath, function(err, file){
        if(err) onCompleteFn(err);
        // compile template with data
        try{
            templateOutput = _compileStr(file.toString(), vars);
            onCompleteFn(null, templateOutput);
        }catch(e){
            onCompleteFn(e);
        }
    });
};

var _compileStr = function(strValue, data){
    var templateFn = doT.template(strValue);
    templateOutput = templateFn(data);
    return templateOutput;
};

/*
    callback returns (err, res)
    res format:
    [
        {
            fileInfo: {
                parentDir     :  'test/bed/root_dir1',
                fullParentDir :  '/User/dev/readdirp/test/bed/root_dir1',
                name          :  'root_dir1_subdir1',
                path          :  'test/bed/root_dir1/root_dir1_subdir1',
                fullPath      :  '/User/dev/readdirp/test/bed/root_dir1/root_dir1_subdir1',
                stat          :  [ ... ]}
            },
            deps: []
        },
        ...
    ]
*/
var _getDependenciesFromDir = function(dir, completeFn){
    var deps = [];
    readdirp({ 'root': dir }, function(err, res){
        var i = -1,
            len = res.files.length;
        if (err) {
            err.forEach(function (err) {
                completeFn(err);
            });
        }
        while(++i < len){
            var filePath = res.files[i].fullPath,
                fileStr = fs.readFileSync(filePath).toString(),
                fileDeps = _getDependenciesFromString(fileStr);
            if(fileDeps.length > 0){
                deps.push({'fileInfo' : res.files[i], 'deps': fileDeps});
            }
        }
        completeFn(null, deps);
    });
};

var _getDependenciesFromString = function(strValue){
    return doT.getDependencies(strValue);
};


module.exports = {compileFile: _compileFile,
                    compileStr: _compileStr,
                    getDependenciesFromString: _getDependenciesFromString,
                    getDependenciesFromDir: _getDependenciesFromDir
                };