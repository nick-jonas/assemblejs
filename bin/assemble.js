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
prompt.delimiter = ":: ".cyan;
prompt.start();


// command: init
if(program.init){
    promptClassBuild('project', function(className, desc){
        var data = {
            'name' : className,
            'description' : desc
        };
        // write files
        commands.write.execute(path.join(__dirname, '../lib/templates/create/'), data);
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
        commands.write.execute(path.join(__dirname, '../lib/templates/view/'), data);
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
            var className = sanitizeClassName(result.className);
            onComplete.apply(this, [className, result.classDesc]);
    });
}

/*
    Takes user input and sanitizes for a class name
    example: zoo keeper -> ZooKeeper
*/
function sanitizeClassName(name){
    var sName = name,
        allWords = sName.split(/\s+/g),
        i = 0;

    // split and capitalize first letter of each word
    for(i; i < allWords.length; i++){
        // TODO: replace numbers with the number written out (i.e. 9 -> Nine)
        allWords[i] = allWords[i].charAt(0).toUpperCase() + allWords[i].slice(1);
    }

    // join into one word
    sName = allWords.join('');
    if(name !== sName) console.log('Sanitized class name: ' + name + ' -> ' + sName);

    return sName;
}