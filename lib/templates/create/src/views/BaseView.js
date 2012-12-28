define([
    'jquery',
    'underscore',
    'backbone'
], function($, _, Backbone){

    var BaseView = Backbone.View.extend({

        genericEvents: {
            'click .close' : 'close'
        },

        // default transition is 1) transOut 2) remove 3) transIn next section
        // section id's defined here are sections that transOut() and transIn() occur synchronously with
        synchronousTransitionSections: [],

        genericVent: {}, // event map passed in

        initialize: function( options ){

            _.bindAll(this, 'transIn', 'transInComplete', 'transOut', 'transOutComplete', 'close');

            // pass in event map/aggregator
            this.genericVent = (options) ? options.vent || {} : {};

            return this;
        },

        transIn: function(lastSectionId){
            this.$el.fadeOut(0);
            this.$el.fadeIn(250);
            this.transInComplete();
        },

        transInComplete: function(){
            this.trigger('view:transInComplete');
        },

        transOut: function(nextSectionId){
            this.$el.fadeOut(250, this.transOutComplete);
        },

        transOutComplete: function(){
            this.trigger('view:transOutComplete', this);
        },

        close: function(){
            console.log('BaseView: closing view: ' + this.getName());
            this.remove();
            this.unbind();
            if(typeof this.genericVent.trigger == 'function'){
                this.genericVent.trigger('view:close', this.id);
            }
        },

        // for quicker testing, get template dependencies
        logTemplateInfo: function(){
            console.log(
                'Variables referenced in this template: ',                     myTemplate.vars,
                '\nPartials/templates that this file directly depends on: ',     myTemplate.deps,
                '\nHelpers that this template directly depends on: ',            myTemplate.helpers,
                '\nThe metadata object at the top of the file (if it exists): ', myTemplate.meta
            );
        },

        getName: function(){
            return this.id || this.className || this.tagName;
        }


    });

    return BaseView;

});
