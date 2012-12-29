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
 * @param {Object} fileFilter:Array, dirFilter:Array
 * @api public
 */
 var _readDir = function(dir, onCompleteFn, options){
    var files = [];
    try{
        _walk(dir, function(filedir, filename, filestat){
            files.push({
                'filedir'   : filedir,
                'filename'  : filename,
                'filestat'  : filestat
            });
        }, function(err){
            if(err) console.log(err);
            if(onCompleteFn) onCompleteFn(files);
        }, options);
    }catch(e){
        throw e;
    }

 };

/**
 * Walk directory tree
 *
 * @param {String} directory to explore
 * @param {Function(file,stat)}  called on each file or until an error occurs
 * @param {Function(err)} called one time when process is complete
 * @param {Object} fileFilter:Array, dirFilter:Array
 * @api public
 */
var _walk = function(dir, action, done, options){
    // will indicate if an error has occured
    var dead = false;
    // will stores the number of pending async operations
    var pending = 0;
    // filters
    var fileFilter = (options) ? _checkFilter(options.fileFilter) : null;
    var dirFilter = (options) ? _checkFilter(options.dirFilter) : null;

    var fail = function(err){
        if(!dead){
            dead = true;
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

    var checkForInclude = function(filePath, filter){
        var items = filePath.split(path.sep),
            lastItem = items[items.length-1];
        if(filter){
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
                            // file passed filter
                            pending++;
                            fs.stat(filePath, function(err, stat){
                                if(!dead){
                                    if(err){
                                        fail(err);
                                    }else{
                                        if(stat && stat.isDirectory()){
                                            if(dirFilter){
                                                // if there is a directory filter
                                                if(checkForInclude(filePath, dirFilter)){
                                                    dive(filePath); // it's a dir, explore recursively
                                                }
                                            }else{
                                                dive(filePath);
                                            }
                                        }else{
                                            if(fileFilter){
                                                // if there is a file filter
                                                if(checkForInclude(filePath, fileFilter)){
                                                    performAction(path.relative(dir, thisDir) + '/', file, stat); // it's not a dir, perform the action
                                                }
                                            }else{
                                                performAction(path.relative(dir, thisDir) + '/', file, stat);
                                            }
                                       }
                                       pending--; checkSuccess(); // async operation complete
                                    }
                                }
                            });
                        }
                    });
                    pending--; checkSuccess();
                }
            }
        });
    };

    // start exploration
    dive(dir);
};

/**
 * Filters the list based on inclusive or exclusive rules
 *
 * @param {Array} original list
 * @param {Array} inclusive glob filter [*.js, *.json] or exclusive [!.DS_Store, !.git]
 * @return {Array} list of files that are the same
 * @api private
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

/**
 * Checks if value passes filter
 *
 * @param {String} value to check
 * @param {Array} inclusive glob filter [*.js, *.json] or exclusive [!.DS_Store, !.git]
 * @return {Boolean} passes?
 * @api private
 */
var _passesFilter = function(value, filter){
    var passes = true,
        i = 0;
    for(i; i < filter.length; i++){
        if(!minimatch(value, filter[i])) passes = false;
    }
    return passes;
};

/**
 * Checks for valid file or directory filter
 *
 * @param {String} value to check
 * @param {Array} inclusive glob filter [*.js, *.json] or exclusive [!.DS_Store, !.git]
 * @return {Boolean} passes?
 * @api private
 */
var _checkFilter = function(filter){
    var outFilter = null;
    if(filter){
        if(_.isArray(filter)){
            if(filter.length > 0){
                var negationCount = 0;
                outFilter = filter;
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
                }
            }
        }else{
            throw new Error('Passed in filter needs to be an Array!');
        }
    }
    return outFilter;
};

module.exports = {
    walk: _walk,
    readDir: _readDir
};