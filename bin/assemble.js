#!/usr/bin/env node

var commands = require('../lib/commands'),
    _ = require('lodash'),
    path = require('path'),
    program = require('commander'),
    prompt = require('prompt'),
    fs = require('fs');

// initialize program
program
    .version('0.2.1')
    .option('-w, --watch', 'Watch an AssembleJS project')
    .option('-b, --build', 'Build production-ready files')
    .parse(process.argv);

// customize prompt message
// prompt.message + prompt.delimiter + property.message + prompt.delimiter;
prompt.message = 'AssembleJS'.magenta;

// command: watch
if(program.watch){
    commands.watch.execute();
}
else if(program.build){
    commands.build.execute();
}
else{
    var template = program.args[0],
        templateDir = path.resolve(__dirname, '../boilers/' + template);
    if(fs.existsSync(templateDir)){
        commands.write.execute(templateDir, function(err, vars, result){
            if(err) throw err;
            console.log('✓ Successfully completed ' + template.green);
        });
    }else{
        console.error('Template directory \'' + template.red + '\' does not exist!');
    }
}


