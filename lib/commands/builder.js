var _ = require('lodash'),
    fs = require('fs'),
    exec = require('child_process').exec,
    path = require('path'),
    shell = require('../shell'),
    cheerio = require('cheerio'),
    current_directory = path.normalize(process.cwd()),
    index_file = path.join(current_directory, 'www_public/index.html'),
    sass_dir = path.relative(current_directory, 'app/sass/'),
    op,
    currentOp = 0;


/**
 * Kicks off synchronous build operation list
 *
 * @api public
 */
var _build = function(){
    // kick off operations
    _nextOp();

};

/**
 * Clear public directory before every build
 *
 * @api private
 */
var _clearPublicDir = function(){
    shell.rm('-rf', 'www_public/*');
    _onAsynchOpComplete();
};

/**
 * Copy entire app directory into www_public
 *
 * @api private
 */
var _copyAppDir = function(){
    // cp -r app/. www_public/
    shell.cp('-Rf', 'app/.', 'www_public/');
    _onAsynchOpComplete();
};

/**
 * Remove source files
 *
 * @api private
 */
var _removeSrcDir = function(){
    // rm -rf www_public/src
    shell.rm('-rf', 'www_public/src');
    _onAsynchOpComplete();
};

/**
 * Remove SASS files
 *
 * @api private
 */
var _removeSassDir = function(){
    // rm -rf www_public/src
    shell.rm('-rf', 'www_public/sass');
    _onAsynchOpComplete();
};

/**
 * Remove source files
 *
 * @api private
 */
var _editIndex = function(){
    fs.readFile(index_file, function(err, file){
        if(err) throw err;
        // use cheerio, replacement for jsdom
        var $ = cheerio.load(file.toString());
        // remove live reload
        $('#live-reload').remove();
        // change main src
        $('#require-lib').removeAttr('data-main').attr('src', '/assets/js/main-build.js');
        // write finished file
        fs.writeFile(index_file, $.html(), function(err){
            if(err) throw err;
            _onAsynchOpComplete();
        });
    });
};

/**
 * Executes the next command in the list
 *
 * @api private
 */
var _nextOp = function(){
    var cmd = operations[currentOp].command;
    console.log(operations[currentOp].name + ' ... ');
    if(_.isFunction(cmd)){
        // is function
        cmd();
    }else{
        // is string command
        op = exec(cmd, function (error, stdout, stderr) {
            _logExecCallback(error, stdout, stderr);
            if(!error){
                _onAsynchOpComplete();
            }
        });
    }
};

/**
 * Called on operation complete, increments the counter and executes next command
 *
 * @api private
 */
var _onAsynchOpComplete = function(){
    currentOp++;
    if(currentOp >= operations.length){
        _onComplete();
    }else{
        _nextOp();
    }
};

var _onComplete = function(){
    console.log('completed!');
};


var _logExecCallback = function(error, stdout, stderr){
    if(stdout!==''){
        //console.log('---------stdout: ---------\n' + stdout);
        console.log(stdout);
    }
    if(stderr!==''){
        //console.log('---------stderr: ---------\n' + stderr);
        console.log(stderr);
    }
    if (error !== null) {
        //console.log('---------exec error: ---------\n[' + error+']');
        console.log(error);
    }
};

var operations = [
        { 'name': 'Clear www_public directory', 'command': _clearPublicDir },
        { 'name': 'Compile SASS', 'command': 'compass compile ' + sass_dir + ' -e production --force' },
        { 'name': 'Copy app directory to /www_public', 'command': _copyAppDir },
        { 'name': 'Remove source folder from output', 'command': _removeSrcDir },
        { 'name': 'Remove sass folder from output', 'command': _removeSassDir },
        { 'name': 'Build JS app', 'command': 'node build/r.js -o build/app.build.js' },
        { 'name': 'Edit index.html', 'command': _editIndex}
    ];

module.exports = { execute: _build };