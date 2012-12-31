define([
    'jquery',
    'underscore',
    'backbone',
    'views/BaseView',
    'hbs!template/sections/home_template'
], function($, _, Backbone, BaseView, myTemplate){

    var HomeView = BaseView.extend({

        id: 'home',

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

            BaseView.prototype.initialize.call(this, options);

            return this;
        },

        render: function(){

            // compile template
            var compiledTemplate = myTemplate({});
            this.$el.append(compiledTemplate);
            return this;
        }


    });

    return HomeView;

});
