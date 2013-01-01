[![Build Status](https://travis-ci.org/nick-jonas/assemblejs.png?branch=master)](https://travis-ci.org/nick-jonas/assemblejs)

#AssembleJS

##### A light bootstrap for fast front-end development based on Backbone, Handlebars, RequireJS, SASS, and Twitter Bootstrap.

## About

The focus of Assemble is to get up and running quickly with a collaborative application bootstrap, getting as much of the painful overhead out of the way without imposing too many dependencies.  The HTML partials are [Handlebars](http://handlebarsjs.com/)-compiled templates. I decided not to use JS preprocessing (Coffeescript, Typekit), and for CSS pre-processing, I decided to use [Compass](http://compass-style.org/) with the [Twitter Bootstrap](http://twitter.github.com/bootstrap/) [port for SASS](https://github.com/jlong/sass-twitter-bootstrap).

I'd love to get feedback on whether this is too opinionated, or if there are better options to use.  The goal is to allow for dependency options when building a project, similar to [Yeoman](http://yeoman.io/).

## Requirements

As far as level of understanding, it would best to be familiar first with Backbone and RequireJS.  You must the following installed:

-[NodeJS](http://nodejs.org/) >=v0.6.0

-[NPM](https://npmjs.org/)


## Installation

```bash
git clone https://github.com/nick-jonas/assemblejs.git
npm install -g
```

or


```bash
npm install -g assemblejs
```

## Usage

### Create New Project

```bash
assemble init
```

Creates a new project in the current directory.

---

### Watch Project

```bash
assemble watch
```

Automatically compiles your SASS files on save, lints your Javascript, starts a local Python web-server, and opens your browser pointed to it.

---

### Create new view

```bash
assemble view
```

Creates a Backbone View and Handlebars Template based on a provided name and description

---

### Build for production

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

Inspiration along the way taken from Grunt, [Yeoman](http://yeoman.io/) & [Roots](Roots.cx).
