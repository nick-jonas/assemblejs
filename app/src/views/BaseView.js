define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){

    var BaseView = Backbone.View.extend({

        genericEvents: {
            'click .close' : 'close'
        },

        genericVent: {}, // event map passed in

        initialize: function( options ){

            _.bindAll(this, 'transIn', 'transInComplete', 'transOut', 'transOutComplete', 'close');

            // pass in event map/aggregator
            this.genericVent = (options) ? options.vent || {} : {};

            return this;
        },

        transIn: function(){
            this.$el.fadeOut(0);
            this.$el.fadeIn(250);
            this.transInComplete();
        },

        transInComplete: function(){
            this.trigger('view:transInComplete');
        },

        transOut: function(){
            this.$el.fadeOut(250, this.transOutComplete);
        },

        transOutComplete: function(){
            this.trigger('view:transOutComplete');
        },

        close: function(){
            console.log('BaseView: closing view...');
            this.remove();
            this.unbind();
            this.genericVent.trigger('view:close', this.id);
        }


    });

    return BaseView;

});
