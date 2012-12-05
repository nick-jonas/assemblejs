({

// $ node r.js -o app.build.js

  // The top level directory that contains your app.
  appUrl: "../app/src",

  // By default, all modules are located relative to this path.
  baseUrl: "../app/src",

  pragmasOnSave: {
        //removes Handlebars.Parser code (used to compile template strings) set
        //it to `false` if you need to parse template strings even after build
        excludeHbsParser : true,
        // kills the entire plugin set once it's built.
        excludeHbs: true,
        // removes i18n precompiler, handlebars and json2
        excludeAfterBuild: true
    },

  paths:{
    // path to require, must use different namespace
    requireLib:     "libs/require/require",

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

  shim: {
    // Backbone library depends on lodash and jQuery.
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },

    "plugins/text": ["require"]
  },

  locale: "en_ca",

  hbs : {
      templateExtension : 'html',
      // if disableI18n is `true` it won't load locales and the i18n helper
      // won't work as well.
      disableI18n : false,
      disableHelpers: false
  },

  include:'requireLib',

  name: "main",

  // uncomment for testing build file
  optimize: "uglify",

  // builds the dist file next to the source
  // to use in production, switch in config
  //out: "../app/src/main-build.js"
  out: "output/assets/js/main-build.js"

})


