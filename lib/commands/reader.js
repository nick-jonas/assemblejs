var _ = require('lodash'),
    minimatch = require('minimatch'),
    path = require('path'),
    fs = require('fs');

/**
 * Read directory recursively & asynchronously
 *
 * @param {String} directory to explore
 * @param {Function(file,stat)}  called on each file or until an error occurs
 * @param {Function(err)} called one time when process is complete
 * @param {Array} filter of files to include or not to include (i.e. [!.svn, !.gitignore] or [.js, .json])
 * @api public
 */
 var _readDir = function(dir, onCompleteFn, filter){
    var files = [];
    _walk(dir, function(filedir, filename, filestat){
        files.push({
            'filedir'   : filedir,
            'filename'  : filename,
            'filestat'  : filestat
        });
    }, function(err){
        if(err) console.log(err);
        onCompleteFn(files);
    }, filter);
 };

/**
 * Walk directory tree
 *
 * @param {String} directory to explore
 * @param {Function(file,stat)}  called on each file or until an error occurs
 * @param {Function(err)} called one time when process is complete
 * @param {Array} filter of files to include or not to include (i.e. [!.svn, !.gitignore] or [.js, .json])
 * @api public
 */
var _walk = function(dir, action, done, filter){
    // will indicate if an error has occured
    var dead = false;
    // will stores the number of pending async operations
    var pending = 0;
    // filters
    var isFiltered = false;
    var isFilterNegative = true;

    var fail = function(err){
        if(!dead){
            dead = true;
            console.log(err);
            done(err);
        }
    };

    var checkSuccess = function(){
        if(!dead && pending === 0){
            done();
        }
    };

    var performAction = function(dir, file, stat){
        if(!dead){
            try{
                action(dir, file, stat);
            }
            catch(error){
                fail(error);
            }
        }
    };

    var checkForInclude = function(filePath){
        var items = filePath.split(path.sep),
            lastItem = items[items.length-1],
            matched = true,
            i = 0;
        if(isFiltered){
            return _passesFilter(lastItem, filter);
        }
        return true;
    };

    var dive = function(thisDir){
        pending++; // async operation starting after this line
        fs.readdir(thisDir, function(err, list){
            if(!dead){
                if(err){
                    fail(err);
                }
                else{
                    // iterate over files
                    list.forEach(function(file){
                        if(!dead){
                            var filePath = path.join(thisDir + '/', file);
                            if(checkForInclude(filePath)){
                                // file passed filter
                                pending++;
                                fs.stat(filePath, function(err, stat){
                                    if(!dead){
                                        if(err){
                                            fail(err);
                                        }else{
                                            if(stat && stat.isDirectory()){
                                                dive(filePath); // it's a dir, explore recursively
                                            }else{
                                                performAction(path.relative(dir, thisDir) + '/', file, stat); // it's not a dir, perform the action
                                           }
                                           pending--; checkSuccess(); // async operation complete
                                        }
                                    }
                                });
                            }
                        }
                    });
                    pending--; checkSuccess();
                }
            }
        });
    };

    // check filter for mismatched negative and positive
    if(filter){
        if(Object.prototype.toString.call(filter) === '[object Array]'){
            if(filter.length > 0){
                var negationCount = 0;
                isFiltered = true;
                for(var i = 0; i < filter.length; i++){
                    if(filter[i].substr(0, 1) === '!'){
                        negationCount--;
                    }else{
                        negationCount++;
                    }
                }
                if(Math.abs(negationCount) !== filter.length){
                    // mixed '!xxx' and 'xxx' filters, can't allow
                    throw new Error('Cannot mix inclusive and exclusive filters: ' + filter);
                }else{
                    isFilterNegative = (negationCount < 0);
                }
            }
        }else{
            throw new Error('Passed in filter needs to be an Array!');
        }
    }

    // start exploration
    dive(dir);
};

/**
 * Filters the list based on inclusive or exclusive rules
 *
 * @param {Array} original list
 * @param {Array} inclusive glob filter [*.js, *.json] or exclusive [!.DS_Store, !.git]
 * @return {Array} list of files that are the same
 * @api public
 */
var _filter = function(list, filter){
    var output = [],
        i = 0;
    for(i; i < list.length; i++){
        if(_passesFilter(list[i], filter)){
            output.push(list[i]);
        }
    }
    return output;
};

var _passesFilter = function(value, filter){
    var passes = true,
        i = 0;
    for(i; i < filter.length; i++){
        if(!minimatch(value, filter[i])) passes = false;
    }
    return passes;
};


module.exports = {
    walk: _walk,
    readDir: _readDir,
    filter: _filter
};