[![Build Status](https://travis-ci.org/nick-jonas/assemblejs.png?branch=master)](https://travis-ci.org/nick-jonas/assemblejs)

#AssembleJS

##### A light framework for fast front-end development based on Backbone, RequireJS, SASS, and Twitter Bootstrap.

## Requirements

As far as level of understanding, it would best to be familiar first with Backbone and RequireJS.  When running the build script, you will need node and compass installed.

## Installation

```bash
npm install -g
```

## Usage

```bash
assemble init
```

Creates a new project in the current directory.


```bash
assemble watch
```

Watches your SASS files via Compass.


```bash
assemble view
```

Creates a Backbone View and Handlebars Template based on a name and description


```bash
assemble build
```

This will compile a production-ready build to www_public, doing the following steps:

1. compile the SASS into a main.css file

2. copies the entire **app/** folder (except for the **app/src/** folder to **build/output/**)

3. runs r.js to optimize your Javascript source files into one file: **build/output/assets/js/main-build.js**

4. in **output/index.html**, replaces the `src` attribute with the new compiled javascript file, and removes the require-js data-main property


## Structure

### /app

This is your development/working directory.  It includes your index.html, .hataccess, static asset files (compiled css, img, json, svg, video files), and your javascript application files are all within `src`.  *Note:* It's recommended to use the `build/build.sh` file to create production-ready files.

### /build

This directory contains a useful bash script `update_requirejs.sh` for updating the require.js library, the `r.js` compiler used by the build system, and `app.build.js` which should map to `app/src/config.js`

## Environment Specific Paths

You can set environment specific paths in **utils/env.js**.  By setting the `ajax_prefilter` property, all AJAX requests will prepend this path to the request https://github.com/nick-jonas/assemblejs.  To get the environment id (i.e. "Local", "Dev", "Prod") at any point in the application, make sure you include `utils/env` in your module dependency array, and call

```javascript
Env.getID();
```

To get an environment value, you would call

```javascript
Env.getValue('my-key');
````

## Routing

**router.js** is where the routing is defined, and acts as the controller for the application.  The **.htaccess** file included forces all requests to **index.html**.  Push state is enabled by default, and falls back to #hash if the browser does not support it.

## Credits

Inspiration along the way taken from Grunt, Yeoman & Roots.cx
