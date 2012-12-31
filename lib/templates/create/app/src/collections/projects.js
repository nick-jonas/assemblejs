define([
    'underscore',
    'backbone',
    'models/project'
], function(_, Backbone, ProjectModel){

    var ProjectCollection = Backbone.Collection.extend({
        model: ProjectModel,
        // TOO: url: '/projects'
    });

    return ProjectCollection;

});
