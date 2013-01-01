define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){

    var AppRouter = Backbone.Router.extend({

        routes: {
            // Define routes here

            // SAMPLE --------------------
            // 'docs'          : 'docs',
            // 'contributors'  : 'contributors',
            // 'post/:id'      : 'showPost',

            // Default
            '*actions'  : 'home'
        },

        vent: _.extend({}, Backbone.Events), // Event aggregation: inject this into views

        initialize: function(options){
            var that = this;

            this.appView = options.appView;
        },

        home: function(){
            // SAMPLE ------------------
            // var homeView = new HomeView({'vent': this.vent});
            // this.appView.showView(homeView);
            // $(document).attr('title', 'AssembleJS');
        }

    });

    return AppRouter;

});