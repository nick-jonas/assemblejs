![GitHub Logo](http://nick-jonas.github.com/assemblejs/logo.png)

[![Build Status](https://travis-ci.org/nick-jonas/assemblejs.png?branch=master)](https://travis-ci.org/nick-jonas/assemblejs)


## Requirements

As far as level of understanding, it would best to be familiar first with Backbone and RequireJS.  When running the build script, you will need node and compass installed.

## Structure

### /app

This is your development/working directory.  It includes your index.html, .hataccess, static asset files (compiled css, img, json, svg, video files), and your javascript application files are all within `src`.  *Note:* It's recommended to use the `build/build.sh` file to create production-ready files.

### /build


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

## Build.sh

For production-ready files, run the build script **build/build.sh** by navigating to the build/ directory and running:

```bash
./build.sh
```
This will do the following things in the following order:

1. compile the SASS into a main.css file

2. copies the entire **app/** folder (except for the **app/src/** folder to **build/output/**)

3. runs r.js to optimize your Javascript source files into one file: **build/output/assets/js/main-build.js**

4. in **output/index.html**, replaces the `src` attribute with the new compiled javascript file, and removes the require-js data-main property

## Credits
