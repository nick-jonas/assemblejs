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
                this.currentView.transOut(view.id);
                // if the view is synchronous, transOut and transIn at the same time
                if(this._isSynchronous(this.currentView, this.nextView)){
                    this._showViewNow(this.nextView);
                }
            }else{
                this._showViewNow(view);
            }
        },

        _onCurrentViewTransOutComplete: function( finishedView ){
            finishedView.unbind('view:transOutComplete', this._onCurrentViewTransOutComplete);
            finishedView.close();
            // only show view if the transition was not synchronous
            if(!this._isSynchronous(finishedView, this.nextView)){
                this._showViewNow(this.nextView);
            }
        },

        /*
            Renders and appends the new view to the container
        */
        _showViewNow: function(view){
            var lastViewId;
            if(this.currentView) lastViewId = this.currentView.id;
            this.currentView = view;
            this.currentView.render();
            this.$el.append(this.currentView.el);
            this.currentView.transIn(lastViewId);
        },

        _isSynchronous: function(currView, nextView){
            return (_.indexOf(currView.synchronousTransitionSections, nextView.id) >= 0 ||
                _.indexOf(nextView.synchronousTransitionSections, currView.id) >= 0);
        }


    });

    return AppView;

});
