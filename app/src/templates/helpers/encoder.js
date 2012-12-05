define(['handlebars'], function( Handlebars ){

    function helperEncode( myUrl ){
        return encodeURIComponent(myUrl);
    }

    // Handlebars debug helper
    Handlebars.registerHelper("encode", helperEncode);

    return helperEncode;

});