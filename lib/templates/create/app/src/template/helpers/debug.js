define(['handlebars'], function( Handlebars ){

    function helperDebug( context, optionalValue ){
        console.log("Current Context");
        console.log("====================");
        console.log(this);
        if (optionalValue) {
            console.log("Value");
            console.log("====================");
            console.log(optionalValue);
        }
    }

    // Handlebars debug helper
    Handlebars.registerHelper("debug", helperDebug);

    return helperDebug;

});