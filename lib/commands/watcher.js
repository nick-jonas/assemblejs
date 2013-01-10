var exec = require('child_process').exec,
    connect = require('connect'),
    open = require('open'),
    http = require('http'),
    app,
    sass;


var _watch = function(){

    var port = process.env.PORT || 1111;

    var app = connect()
    .use(connect.favicon())
    .use(connect.logger('dev'))
    .use(connect.static('app'))
    .use(connect.directory('app'))
    .use(connect.cookieParser())
    .use(connect.session({ secret: 'my secret here' }))
    .use(function(req, res){
        res.end('Hello from Connect!\n');
    });

    http.createServer(app).listen(port);

    // watch sass
    sass = exec('compass watch app/sass', function (error, stdout, stderr) {
        _logExecCallback(error, stdout, stderr);
    });

    // open browser
    open('http://localhost:' + port, function(err){
        if(err) throw err;
    });
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

module.exports = { execute: _watch };