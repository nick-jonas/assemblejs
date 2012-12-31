var exec = require('child_process').exec,
    op,
    currentOp = 0,
    operations = [
        { 'name': 'Clear www_public directory', 'command': 'rm -rf www_public/*' },
        { 'name': 'Compile SASS', 'command': 'compass compile app/sass -e production --force' },
        { 'name': 'Copy app directory to /www_public', 'command': 'cp -r app/. www_public/' },
        { 'name': 'Remove source folder from output', 'command': 'rm -rf www_public/src' },
        { 'name': 'Build JS app', 'command': 'node build/r.js -o build/app.build.js' },
        { 'name': 'Replace index.html JS main src attribute', 'command': 'sed "s/src\\/libs\\/require.js/assets\\/js\\/main-build.js/g" www_public/index.html > www_public/index.html.temp' },
        { 'name': 'Remove data-main attribute', 'command': 'sed \'s/ data-main="src\\/config"//g\' www_public/index.html.temp > www_public/index.html.temp2' },
        { 'name': 'Remove index.html', 'command': 'rm www_public/index.html' },
        { 'name': 'Remove index.html.temp', 'command': 'rm www_public/index.html.temp' },
        { 'name': 'Rename temp', 'command': 'mv www_public/index.html.temp2 www_public/index.html' }
    ];


var _build = function(){
    // kick off operations
    _nextOp();
};

var _nextOp = function(){
    console.log(operations[currentOp].name + ' ....');
    op = exec(operations[currentOp].command, function (error, stdout, stderr) {
        _logExecCallback(error, stdout, stderr);
        if(!error){
            currentOp++;
            if(currentOp >= operations.length){
                _onComplete();
            }else{
                _nextOp();
            }
        }
    });
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

module.exports = { execute: _build };