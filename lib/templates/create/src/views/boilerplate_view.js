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

            // pass in event map/aggregator & combine with base view
            this.vent = (options) ? options.vent || {} : {};
            this.events = _.extend({}, this.events, this.genericEvents);
            this.delegateEvents();

            // make sure all methods are executed in correct context
            _.bindAll(this, 'render');

            BaseView.prototype.initialize.call(this, options);

            return this;
        },

        render: function(){
            // compile template
            var compiledTemplate = myTemplate({});
            this.$el.html(compiledTemplate);

            return this;
        }


    });

    return ViewBoilerplate;

});
