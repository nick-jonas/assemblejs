var minimatch = require('minimatch'),
    path = require('path'),
    fs = require('fs');

/**
 * Walk directory tree
 *
 * @param {String} directory to explore
 * @param {Function(file,stat)}  called on each file or until an error occurs
 * @param {Function(err)} called one time when process is complete
 * @param {Array} filter of files to include or not to include (i.e. [!.svn, !.gitignore] or [.js, .json])
 * @api private
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
            if(isFilterNegative){
                // don't include if match is found to !xxx
                if(filter.indexOf(lastItem) >= 0){
                    return false;
                }
            }else{
                // match to glob (bar.foo, *.foo -> true)
                for(i; i < filter.length; i++){
                    matched = minimatch(filePath, filter[i]);
                }
                return matched;
            }
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

    // check filter
    if(filter){
        if(Object.prototype.toString.call(filter) === '[object Array]'){
            if(filter.length > 0){
                var negationCount = 0;
                isFiltered = true;
                for(var i = 0; i < filter.length; i++){
                    if(filter[i].substr(0, 1) === '!'){
                        negationCount--;
                        filter[i] = filter[i].substr(1);
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



module.exports = {
    walk: _walk
};