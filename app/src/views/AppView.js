define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){

    /*
        AppView

        Manages the view transitions within a specified DOM element

    */
    var AppView = Backbone.View.extend({

        el: $('#app-view-container'),

        vent: {}, // event map passed in

        currentView: null,

        nextView: null,

        initialize: function( options ){

            _.bindAll(this, 'showView', '_showViewNow', '_onCurrentViewTransOutComplete');

            // pass in event map/aggregator
            this.vent = (options) ? options.vent || {} : {};

            return this;
        },

        /*
            Called from router for showing a new view,
            will transition current view out if it exists
        */
        showView: function(view){
            if(this.currentView){
                this.nextView = view;
                this.currentView.bind('view:transOutComplete', this._onCurrentViewTransOutComplete);
                this.currentView.transOut();
            }else{
                this._showViewNow(view);
            }
        },

        _onCurrentViewTransOutComplete: function(){
            this.currentView.unbind('view:transOutComplete', this._onCurrentViewTransOutComplete);
            this.currentView.close();
            this._showViewNow(this.nextView);
        },

        /*
            Renders and appends the new view to the container
        */
        _showViewNow: function(view){
            this.currentView = view;
            this.currentView.render();
            this.$el.append(this.currentView.el);
            this.currentView.transIn();
        }


    });

    return AppView;

});
