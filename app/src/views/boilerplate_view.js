define([
    'jquery',
    'underscore',
    'backbone',
    'views/BaseView',
    'hbs!template/boilerplate_template'
], function($, _, Backbone, BaseView, myTemplate){

    var ViewBoilerplate = BaseView.extend({

        events: {
            // events here
            // 'click .submit': 'submit'
        },

        vent: {}, // event map passed in

        initialize: function( options ){

            // pass in event map/aggregator
            this.vent = (options) ? options.vent || {} : {};

            // combine base view events
            this.events = _.extend({}, this.events, this.genericEvents);
            this.delegateEvents();

            // make sure all methods are executed in correct context
            _.bindAll(this, 'render');

            // for quicker testing, get template dependencies
            console.log(
                'Variables referenced in this template: ',                     myTemplate.vars,
                '\nPartials/templates that this file directly depends on: ',     myTemplate.deps,
                '\nHelpers that this template directly depends on: ',            myTemplate.helpers,
                '\nThe metadata object at the top of the file (if it exists): ', myTemplate.meta
            );

            BaseView.prototype.initialize.call(this, options);

            return this;
        },

        render: function(){

            // compile template
            // var compiledTemplate = myTemplate(this.collection.toJSON());

            this.$el.append('<span>View Boilerplate</span>');
            return this;
        }


    });

    return ViewBoilerplate;

});
