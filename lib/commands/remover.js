var exec = require('child_process').exec,
    rm;

var _reset = function(){

    // TODO

};

var _logExecCallback = function(error, stdout, stderr){
    if(stdout!==''){
        console.log('---------stdout: ---------\n' + stdout);
    }
    if(stderr!==''){
        console.log('---------stderr: ---------\n' + stderr);
    }
    if (error !== null) {
        console.log('---------exec error: ---------\n[' + error+']');
    }
};

module.exports = { execute: _reset };