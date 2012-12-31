define([
    'jquery',
    'underscore',
    'backbone',
    'views/BaseView',
    'hbs!template/header_template'
], function($, _, Backbone, BaseView, myTemplate){

    var HeaderView = BaseView.extend({

        events: {
            // events here
            'click .site-link': 'onClickSiteLink'
        },

        id: 'header',

        vent: {}, // event map passed in

        initialize: function( options ){

            // pass in event map/aggregator
            this.vent = (options) ? options.vent || {} : {};

            // combine base view events
            this.events = _.extend({}, this.events, this.genericEvents);
            this.delegateEvents();

            // make sure all methods are executed in correct context
            _.bindAll(this, 'render', 'onClickSiteLink');

            BaseView.prototype.initialize.call(this, options);

            return this;
        },

        onClickSiteLink: function(e){
            e.preventDefault();
            this.vent.trigger('header:sitelink:click', $(e.currentTarget).attr('href'));
        },

        render: function(){
            var tmpl = myTemplate({});
            this.$el.append(tmpl);
            return this;
        }


    });

    return HeaderView;

});
