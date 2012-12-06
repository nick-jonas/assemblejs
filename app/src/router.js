define([
    'jquery',
    'underscore',
    'backbone',
    'views/HeaderView',
    'views/sections/HomeView',
    'views/sections/DocsView',
    'views/sections/ContributorsView'
], function($, _, Backbone, HeaderView, HomeView, DocsView, ContributorsView){

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

        docs: function(){
            var docsView = new DocsView({'vent': this.vent});
            this.appView.showView(docsView);
            $(document).attr('title', 'AssembleJS / Docs');
        },

        contributors: function(){
            var cView = new ContributorsView({'vent': this.vent});
            this.appView.showView(cView);
            $(document).attr('title', 'AssembleJS / Contributors');
        },

        showPost: function(id){
            // var post = posts.get(id);
            // var postView = new PostView({model:post});
            // this.appView.showView(postView);
        }

    });

    return AppRouter;

});