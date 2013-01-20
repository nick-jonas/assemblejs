/*
    Takes user input and sanitizes for a class name
    example: zoo keeper -> ZooKeeper
*/
var _sanitizeClassName = function(name){
    var sName = name,
        allWords = sName.split(/\s+/g),
        i = 0;
    for(i; i < allWords.length; i++){
        allWords[i] = allWords[i].charAt(0).toUpperCase() + allWords[i].slice(1);
    }
    sName = allWords.join('').trim();

    return sName;
};

module.exports = {
    'fn': _sanitizeClassName
};