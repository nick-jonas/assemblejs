require(
[
    "jquery",
    "underscore",
    "backbone",
    "handlebars",
    "utils/env",
    "views/AppView",
    "router",
    "views/BaseView",
    "plugins/ba-debug" // wraps console.log: debug.log( this, 'that', { the: 'other' } );,
], function($, _, Backbone, Handlebars, Env, AppView, AppRouter, BaseView){

    var router  = new AppRouter({'appView': new AppView()}); // Create Application Router

    // set environment specific paths
    Env.initialize();

    Backbone.history.start({pushState: true, root: "/"});

});

