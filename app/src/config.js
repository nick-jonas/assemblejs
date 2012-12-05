// Set the require.js configuration for your application.
require.config({

  // Initialize the application with the main application file.
  deps: ["main"],

  pragmasOnSave: {
      //removes Handlebars.Parser code (used to compile template strings) set
      //it to `false` if you need to parse template strings even after build
      excludeHbsParser : true,
      // kills the entire plugin set once it's built.
      excludeHbs: true,
      // removes i18n precompiler, handlebars and json2
      excludeAfterBuild: true
  },

  paths: {

    // JavaScript folders.
    libs: "libs",
    plugins: "plugins",

    // Libraries.
    jquery:         "libs/jquery/jquery",
    modernizr:      "libs/modernizr/modernizr",
    // lodash:         "libs/lodash/lodash",
    backbone:       "libs/backbone/backbone",

    // https://github.com/SlexAxton/require-handlebars-plugin
    hbs:            "libs/handlebars/hbs",
    handlebars:     "libs/handlebars/Handlebars",
    // underscore:     "libs/handlebars/hbs/underscore",
    i18nprecompile: "libs/handlebars/hbs/i18nprecompile",
    json2:          "libs/handlebars/hbs/json2",

    underscore:     "libs/lodash/lodash",

    // Just a short cut so we can put our html outside the js dir
    // When you have HTML/CSS designers this aids in keeping them out of the js directory
    templates: "templates"
  },

  locale: "en_ca",

  // default plugin settings, listing here just as a reference
  hbs : {
      templateExtension : 'html',
      // if disableI18n is `true` it won't load locales and the i18n helper
      // won't work as well.
      disableI18n : false,
      disableHelpers: false
  },

  shim: {
    // Backbone library depends on lodash and jQuery.
    "backbone": {
      "deps": ["underscore", "jquery"],
      "exports": "Backbone"
    },

    "plugins/text": ["require"]
  }

});
