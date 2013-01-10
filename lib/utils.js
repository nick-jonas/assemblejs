/*
    Takes user input and sanitizes for a class name
    example: zoo keeper -> ZooKeeper
*/
var _sanitizeClassName = function(name){
    var sName = name,
        allWords = sName.split(/\s+/g),
        i = 0;

    // split and capitalize first letter of each word
    for(i; i < allWords.length; i++){
        // TODO: replace numbers with the number written out (i.e. 9 -> Nine)
        allWords[i] = allWords[i].charAt(0).toUpperCase() + allWords[i].slice(1);
    }

    // join into one word
    sName = allWords.join('').trim();
    if(name !== sName) console.log('Sanitized class name: ' + name + ' -> ' + sName);

    return sName;
};

module.exports = {
    sanitizeClassName: _sanitizeClassName
};