#!/usr/bin/env node

var commands = require('../lib/commands'),
    _ = require('lodash'),
    path = require('path'),
    program = require('commander'),
    prompt = require('prompt'),
    fs = require('fs');

// initialize program
program
    .version('0.0.1')
    .option('-i, --init', 'Create a new AssembleJS project')
    .option('-w, --watch', 'Watch an AssembleJS project')
    .option('-b, --build', 'Build production-ready files')
    .option('-m, --model', 'Add a model by the specified name')
    .option('-v, --view', 'Add a view by the specified name')
    .option('-r, --reset', 'Reset project')
    .option('-c, --collection', 'Add a collection by the specified name')
    .parse(process.argv);

// customize prompt message
// prompt.message + prompt.delimiter + property.message + prompt.delimiter;
prompt.message = 'AssembleJS'.magenta;


// command: init
if(program.init){
    prompt.get([{
            'name': 'path',
            'description': 'Enter the path relative to this directory',
            'default': '.',
            'type': 'string'
        }],
        function(err, result){
            var data = {
                'path' : path.resolve(result.path)
            };
        // write files
        commands.write.execute(path.join(__dirname, '../templates/create/'), data.path, function(err, vars, result){
            if(err) throw err;
            console.log('✓ Successfully created project');
        });
    });
}

// command: watch
if(program.watch){
    commands.watch.execute();
}

if(program.build){
    commands.build.execute();
}

if(program.reset){
    commands.reset.execute();
}

// command: model
if(program.model){

}

// command: view
if(program.view){
    // write files
    commands.write.execute(path.join(__dirname, '../templates/view/'), null, function(err, vars, result){
        if(err) throw err;
        console.log(result);
        console.log('✓ Successfully created view files');
    });
}

// command: collection
if(program.collection){

}

