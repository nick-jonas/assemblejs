require(
[
    "jquery",
    "underscore",
    "backbone",
    "handlebars",
    "utils/env",
    "views/AppView",
    "router",
    "plugins/ba-debug" // wraps console.log: debug.log( this, 'that', { the: 'other' } );,
], function($, _, Backbone, Handlebars, Env, AppView, AppRouter){

    var router  = new AppRouter({'appView': new AppView()}); // Create Application Router

    // set environment specific paths
    Env.initialize();

    Backbone.history.start({pushState: true, root: "/"});

    // All navigation that is relative should be passed through the navigate
    // method, to be processed by the router. If the link has a `data-bypass`
    // attribute, bypass the delegation completely.
    $(document).on("click", "a:not([data-bypass])", function(evt) {
        // Get the absolute anchor href.
        var href = $(this).attr("href");
        // If the href exists and is a hash route, run it through Backbone.
        if (href && href.indexOf("#") === 0) {
            // Stop the default event to ensure the link will not cause a page
            // refresh.
            evt.preventDefault();

            // `Backbone.history.navigate` is sufficient for all Routers and will
            // trigger the correct events. The Router's internal `navigate` method
            // calls this anyways.  The fragment is sliced from the root.
            Backbone.history.navigate(href, true);
        }
    });

});

