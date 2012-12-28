var Utils = {};

/*
    Given template string, will parse JSON config
    defined at top and remove from final file

    @templateStr
        template file with the following
        formatted definition at the top:
        {{!!config
        {
            key: value
        }
        !!}}

    @callbackFn
        args-
        @@config: parsed JSON object from templateStr
        @@template: final templateStr with config stripped out

*/
Utils.stripTemplateConfig = function(templateStr, callbackFn){
    var startDelim = '{{!!config',
        endDelim = '!!}}',
        config = {},
        startIndex = templateStr.indexOf(startDelim),
        endIndex = 0;

    // parse config from templateStr and strip from top
    if(startIndex >= 0){
        endIndex = templateStr.indexOf(endDelim);
        var configStr = templateStr.substr(startIndex, endIndex).replace(startDelim, '').replace(endDelim, '');
        config = JSON.parse(configStr);
        // strip config && trim initial white space
        templateStr = templateStr.substr(endIndex + endDelim.length).replace(/^\s\s*/, '');
    }
    callbackFn.apply(this, [config, templateStr]);
};

exports.Utils = Utils;