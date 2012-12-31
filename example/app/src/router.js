define([
    'jquery',
    'underscore',
    'backbone',
    'views/HeaderView',
    'views/sections/HomeView'
], function($, _, Backbone, HeaderView, HomeView){

    var AppRouter = Backbone.Router.extend({

        routes: {
            // Define routes here
            'docs'          : 'docs',
            'contributors'  : 'contributors',
            'post/:id'      : 'showPost',

            // Default
            '*actions'  : 'home'
        },

        vent: _.extend({}, Backbone.Events), // Event aggregation: inject this into views

        initialize: function(options){
            var that = this;

            this.appView = options.appView;

            // permanent elements
            this.headerView = new HeaderView({'vent': this.vent});
            this.headerView.render();
            $('#header').html(this.headerView.el);


        },

        home: function(){
            var homeView = new HomeView({'vent': this.vent});
            this.appView.showView(homeView);
            $(document).attr('title', 'AssembleJS');
        },

        showPost: function(id){
            // var post = posts.get(id);
            // var postView = new PostView({model:post});
            // this.appView.showView(postView);
        }

    });

    return AppRouter;

});