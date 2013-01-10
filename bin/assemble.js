#!/usr/bin/env node

var commands = require('../lib/commands'),
    utils = require('../lib/utils'),
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
            'name': 'className',
            'description': 'Enter the project name',
            'type': 'string',
            'required': true
        }, {
            'name': 'classDesc',
            'description': 'Enter a description',
            'type': 'string'
        }, {
            'name': 'path',
            'description': 'Enter the path relative to this directory',
            'default': '.',
            'type': 'string'
        }],
        function(err, result){
            var data = {
                'name' : utils.sanitizeClassName(result.className),
                'description' : result.classDesc,
                'path' : path.resolve(result.path)
            };
        // write files
        commands.write.execute(path.join(__dirname, '../lib/templates/create/'), data, function(err, vars, result){
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
    promptClassBuild('model', function(className, desc){

    });
}

// command: view
if(program.view){
    // prompt user for necessary vars
    promptClassBuild('view', function(className, desc){
        var data = {
            'name' : className,
            'description' : desc
        };
        // write files
        commands.write.execute(path.join(__dirname, '../lib/templates/view/'), data, function(err, vars, result){
            if(err) throw err;
            console.log('✓ Successfully created view files');
        });
    });
}

// command: collection
if(program.collection){
    promptClassBuild('collection', function(className, desc){

    });
}



/*
    Prompts for user inputs, and sends sanitized name to
    onComplete f(n)
*/
function promptClassBuild(name, onComplete){
    prompt.get([{
            name: 'className',
            description: 'Enter the ' + name + ' name',
            type: 'string',
            required: true
        }, {
            name: 'classDesc',
            description: 'Enter a description',
            type: 'string'
        }],
        function(err, result){
            var className = utils.sanitizeClassName(result.className);
            onComplete.apply(this, [className, result.classDesc]);
    });
}

