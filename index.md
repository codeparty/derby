---
layout: default
version: 0.5.9
headers:
  - text: Introduction
    type: h1
  - text: Why not use Rails and Backbone?
    type: h2
  - text: Features
    type: h2
  - text: Flexibility without the glue code
    type: h2
  - text: Demos
    type: h2
  - text: Getting started
    type: h1
  - text: Create an app
    type: h2
  - text: Deploy to Heroku
    type: h2
  - text: File structure
    type: h2
  - text: Apps and static pages
    type: h1
  - text: Creating apps
    type: h2
  - text: Connecting servers to apps
    type: h2
  - text: Static pages
    type: h2
  - text: Views
    type: h1
  - text: Creating templates
    type: h2
  - text: Pre-defined templates
    type: h3
  - text: Importing templates
    type: h3
  - text: Template syntax
    type: h2
  - text: Whitespace and HTML conformance
    type: h3
  - text: Variables
    type: h3
  - text: Sections
    type: h3
  - text: Bindings
    type: h3
  - text: Relative model paths and aliases
    type: h3
  - text: View helper functions
    type: h3
  - text: Components
    type: h2
  - text: Component libraries
    type: h3
  - text: HTML extensions
    type: h2
  - text: DOM event binding
    type: h3
  - text: Boolean attributes
    type: h3
  - text: Form elements
    type: h3
  - text: Stylesheets
    type: h2
  - text: Rendering
    type: h2
  - text: app.view
    type: h2
  - text: Controllers
    type: h1
  - text: Routes
    type: h2
  - text: History
    type: h3
  - text: User events
    type: h2
  - text: Model events
    type: h2
  - text: Application logic
    type: h2
  - text: Access control
    type: h2
  - text: Models
    type: h1
  - text: Introduction to Racer
    type: h2
  - text: Creating stores
    type: h2
  - text: Persistence
    type: h3
  - text: Creating models
    type: h2
  - text: Model features
    type: h2
  - text: Paths
    type: h3
  - text: Scoped models
    type: h3
  - text: Queries
    type: h3
  - text: Subscriptions
    type: h3
  - text: References
    type: h3
  - text: Getters and setters
    type: h3
  - text: Events
    type: h3
  - text: Filters and sorts
    type: h3
  - text: Reactive functions
    type: h3
---

# Derby

<p class="promo">MVC framework making it easy to write realtime, collaborative
applications that run in both Node.js and browsers.</p>

<h3 class="javascript">hello.js</h3>
{% highlight javascript %}{% raw %}
var app = require('derby').createApp(module);

// Add template for rendering HTML and model <- -> view bindings
app.view.make('Body',
  'Holler: <input value="{hello.message}"><h1>{hello.message}</h1>'
);

// Add a route, which can render in the browser as well as server
app.get('/', function(page, model) {
  // Specify data to sync
  model.subscribe('hello.message', function() {
    page.render();
  });
});
{% endraw %}{% endhighlight %}

<h3 class="javascript">server.js</h3>
{% highlight javascript %}{% raw %}
var store = require('derby').createStore({
  // Use the mongo adapter to persist data and perform queries
  db: require('livedb-mongo')('localhost:27017/test?auto_reconnect')
  // Keep a journal of all data changes and do PubSub with Redis
, redis: require('redis').createClient()
});

var expressApp = require('express')()
  // Add browserchannel scripts to bundles created by store, and
  // return middleware for responding to remote client messages
  .use(require('racer-browserchannel')(store))
  // Respond to requests for application script bundles
  .use(app.scripts(store))
  // Create models for incoming requests
  .use(store.modelMiddleware())
  // Add the app's routes
  .use(app.router())

require('http').createServer(expressApp).listen(3000);
{% endraw %}{% endhighlight %}

<h3 class="coffeescript">hello.coffee</h3>
{% highlight coffeescript %}{% raw %}
app = require('derby').createApp(module)

# Add template for rendering HTML and model <- -> view bindings
app.view.make 'Body',
  'Holler: <input value="{hello.message}"><h1>{hello.message}</h1>'

# Add a route, which can render in the browser as well as server
app.get '/', (page, model) ->
  # Specify data to sync
  model.subscribe 'hello.message', ->
    page.render()
{% endraw %}{% endhighlight %}

<h3 class="coffeescript">server.coffee</h3>
{% highlight coffeescript %}{% raw %}
store = require('derby').createStore
  # Use the mongo adapter to persist data and perform queries
  db: require('livedb-mongo')('localhost:27017/test?auto_reconnect')
  # Keep a journal of all data changes and do PubSub with Redis
  redis: require('redis').createClient()

expressApp = require('express')()
  # Add browserchannel scripts to bundles created by store, and
  # return middleware for responding to remote client messages
  .use(require('racer-browserchannel')(store))
  # Respond to requests for application script bundles
  .use(app.scripts(store))
  # Create models for incoming requests
  .use(store.modelMiddleware())
  # Add the app's routes
  .use(app.router())

require('http').createServer(expressApp).listen 3000
{% endraw %}{% endhighlight %}

### Add water and...

<iframe src="http://hello.derbyjs.com/" id="hello-iframe" seamless="seamless"> </iframe>

# Introduction

Derby includes a powerful data synchronization engine called
[Racer](http://racerjs.com/). While it works differently, Racer is to Derby
somewhat like ActiveRecord is to Rails. Racer automatically syncs data between
browsers, servers, and a database. Models subscribe to changes on specific
objects and queries, enabling granular control of data propagation without
defining channels. Racer supports conflict resolution out of the box, which
greatly simplifies writing multi-user applications.

On top of Racer, Derby provides powerful templating, data binding, and routing
features. Every feature of Racer and Derby is written with server and client
rendering in mind. Derby makes it simple to write applications that load as fast
as a search engine, are as interactive as a document editor, and work offline.

## Features

* **Realtime collaboration:** Powered by [ShareJS's](http://sharejs.org/)
  operational transformation of JSON and text, all conflicting data changes are
  automatically resolved. By default, every text input is a collaborative text
  editor, and every bit of data in the model can be collaboratively edited in
  realtime or offline.

* **Client and server routing:** The same routes produce a single-page browser
  app and an [Express](http://expressjs.com/) server app. Links render
  instantly with push/pop state changes in modern browsers, while server
  rendering provides access to search engines and browsers without JavaScript.

* **HTML templates:** [Handlebars](http://handlebarsjs.com/)-like templates are
  rendered into HTML on both the server and client. Because they render on the
  server, pages display immediately---even before any scripts are downloaded.
  Templates are mostly just HTML, so designers can understand and modify them.

* **View bindings:** In addition to HTML rendering, templates specify live
  bindings between the view and model. When model data change, the view updates
  the properties, text, or HTML necessary to reflect the new data. When
  users interact with the page---such as editing the value of a text
  input---the model data update.

## Why not use Rails and Backbone?

Derby represents a new breed of application frameworks, which we believe will
replace currently popular libraries like [Rails](http://rubyonrails.org/) and
[Backbone](http://documentcloud.github.com/backbone/).

Adding dynamic features to apps written with [Rails](http://rubyonrails.org/),
[Django](https://www.djangoproject.com/), and other server-side frameworks
tends to produce a tangled mess. Server code renders various initial states
while jQuery selectors and callbacks desperately attempt to make sense of the
DOM and user events. Adding new features typically involves changing both
server and client code, often in different languages.

Many developers now include a client MVC framework like
[Backbone](http://documentcloud.github.com/backbone/) to better structure
client code. A few have started to use declarative model-view binding
libraries, such as [Knockout](http://knockoutjs.com/) and
[Angular](http://angularjs.org/), to reduce boilerplate DOM manipulation and
event bindings. These are great concepts, and adding some structure certainly
improves client code. However, they still lead to duplicating rendering code
and manually synchronizing changes in increasingly complex server and client
code bases. Not only that, each of these pieces must be manually wired together
and packaged for the client.

Derby radically simplifies this process of adding dynamic interactions. It runs
the same code in servers and browsers, and it syncs data automatically. Derby
takes care of template rendering, packaging, and model-view bindings out of the
box. Since all features are designed to work together, no code duplication and
glue code are needed. Derby equips developers for a future when all data in all
apps are realtime.

## Flexibility without the glue code

Derby eliminates the tedium of wiring together a server, server templating
engine, CSS compiler, script packager, minifier, client MVC framework, client
JavaScript library, client templating and/or bindings engine, client history
library, realtime transport, ORM, and database. It eliminates the complexity of
keeping state synchronized among models and views, clients and servers,
multiple windows, multiple users, and models and databases.

At the same time, it plays well with others. Derby follows the conventions of
[Node.js](http://nodejs.org/), and it is built on top of popular
libraries, including [Express](http://expressjs.com/),
[Browserify](https://github.com/substack/node-browserify),
[Google's BrowserChannel](https://github.com/josephg/node-browserchannel),
[Stylus](http://learnboost.github.com/stylus/docs/iteration.html),
[LESS](http://lesscss.org/), [UglifyJS](https://github.com/mishoo/UglifyJS),
[Redis](http://redis.io/), [MongoDB](http://www.mongodb.org/), and soon other
popular socket libraries and databases. The model engine
[Racer](http://racerjs.com/) as well as the underlying data syncing module
[ShareJS](http://sharejs.org/)
and the underlying can be used separately. Other client
libraries, such as jQuery, and any Node.js module from npm work just as well
along with Derby.

When following the default file structure, templates, styles, and scripts are
automatically packaged and included in the appropriate pages.

## Performance

Derby is architected with speed in mind.

Client-only application frameworks have dramatically slower page loads. Even an extremely optimized client-only renderer causes the browser to wait for the page to load a script (most likely via an additional request), interpret the script, render the template, and update the DOM before it has a chance to start performing layout of the HTML content.

Derby's architecture optimizes time to load the page initially, to re-render sections or the entire page client-side, and to update individual elements in realtime.

## Demos

See [source and installation instructions](https://github.com/codeparty/derby-examples) for the demos

### Chat

[http://chat.derbyjs.com/lobby](http://chat.derbyjs.com/lobby)

A simple chat demo. Note that as you edit your name, it updates in realtime.
Name changes also show up in the page title and other rooms. Check out the
source in the examples directory to see how these bindings are created
automatically.

### Todos

[http://todos.derbyjs.com/derby](http://todos.derbyjs.com/derby)

The requisite MVC demo, but collaborative and realtime!

### Directory

[http://directory.derbyjs.com/](http://directory.derbyjs.com/)

A simple example of an application with multiple pages.

### Sink

[http://sink.derbyjs.com/](http://sink.derbyjs.com/)

A kitchen-sink style example with random features. Largely used for testing.

### Widgets

[http://widgets.derbyjs.com/](http://widgets.derbyjs.com/)

Test of the components in the [Boot](https://github.com/codeparty/derby-ui-boot/) component library.

## Disclaimer

Derby and Racer are beta software. Racer has recently been rewritten to
scale on the backend and to properly cleanup memory in complex applications
with many pages. Derby is being used in production, but it is still undergoing
major development and will have rough edges. APIs are subject to change.

If you have feedback, ideas, or suggestions, please email the [Google
Group](http://groups.google.com/group/derbyjs). If you are interested in
contributing, please reach out to [Nate](https://github.com/nateps),
[Brian](https://github.com/bnoguchi), and [Joseph](https://github.com/josephg).

# Getting started

As with all Node.js modules, first install [Node](http://nodejs.org/#download).
The Node installer will also install [npm](http://npmjs.org/).

Install Derby with:

    $ npm install -g derby

You will also need to install and start [Redis 2.6](http://redis.io/download)
and [MongoDB](http://www.mongodb.org/downloads).

## Create an app

Derby includes a simple project generator:

    $ cd ~
    $ derby new first-project
    $ cd first-project

or, for [CoffeeScript](http://jashkenas.github.com/coffee-script/):

    $ cd ~
    $ derby new --coffee first-project
    $ cd first-project

Then, simply fire up your app:

    $ npm start

## Deploy to Heroku

The default Derby app is already configured for easy deployment to Heroku.
First things first, [signup for Heroku](https://id.heroku.com/signup) and
install [Heroku Toolbelt](https://toolbelt.heroku.com/) if you haven't already.

The first time you use Heroku, run:

    $ heroku login

If not done in the login step, you may also need to upload a public key with:

    $ heroku keys:add

Form then on, all you have to do to get a new Derby project deployed to Heroku
is initialize it as a Git repo,

    $ git init
    $ git add .
    $ git commit -m "init"

create a Heroku app with access to Redis and MongoDB,

    $ heroku create
    $ heroku addons:add rediscloud:20
    $ heroku addons:add mongohq:sandbox
    $ heroku config:set NODE_ENV=production

and push!

    $ git push heroku master
    $ heroku open

Note that while Derby supports multiple servers, it currently requires that
clients repeatedly connect to the same server. Heroku does not support sticky
sessions or WebSockets, so it isn't possible to use more than one dyno. You'll
have to use a different hosting option to scale your app.

For more info, see Heroku's [Getting Started](https://devcenter.heroku.com/articles/quickstart) and [Node.js](https://devcenter.heroku.com/articles/nodejs) guides.

## Using existing data

To make getting started with existing data a bit easier, we've written a [script to initialize the journal](https://github.com/share/igor) in Redis based on a MongoDB database. There is also a [tool to inspect your data](https://github.com/share/godbox) once it is initialized. For more info on using these tools, check out [this video](https://www.youtube.com/watch?v=FoOfNCJkAAA).

## File structure

The default file structure is:

    /lib
      /app
        index.js
      /server
        error.js
        index.js
    /public
    /styles
      /app
        home.styl
        index.styl
        list.styl
      /error
        index.styl
      /ui
        connectionAlert.styl
        index.styl
    /ui
      /connectionAlert
        index.html
        index.js
      index.js
    /views
      /app
        home.html
        index.html
        list.html
      /error
        403.html
        404.html
        500.html
        index.html
    .gitignore
    package.json
    Procfile
    README.md
    server.js

In [CoffeeScript](http://jashkenas.github.com/coffee-script/) projects, script
files are in the `src` directory instead.

Derby uses a filename based convention similar to Node.js modules. A file named
`demo.js` and a directory `demo` containing a file `index.js` both define an
app with the name "demo." The same applies for styles and views, which can
either be `demo.styl` or `demo\index.styl` and `demo.html` or
`demo\index.html`.

Apps are associated with their respective styles and views by filename.
Derby automatically includes them when rendering. Both support importing, so
shared styles and templates may be defined in separate files.

Static files can be placed in the public folder. (Note that the contents of the
public folder map to the root URL, so the image stored at the file
`public/img/logo.png` would be served from the URL `/img/logo.png`.)

The `ui` directory contains a component library, which can be used to create
custom components for the containing project. These are re-usable templates,
scripts, and styles that can be used to create custom HTML tags for use in
applications. General purpose component libraries can be created as separate
npm modules. See [Component Libraries](#component_libraries).

# Apps and static pages

Derby projects support one or more single-page apps as well as static pages.
Apps have a full MVC structure, including a model provided by
[Racer](http://racerjs.com/), a template and styles based view, and controller
code with application logic and routes (which map URLs to actions). Static
pages consist of only templates and styles.

On the server, apps provide a router middleware for Express. One or more app
routers as well as server only routes can be included in the same Express
server.

Derby packages up all of an app's templates, routes, and application code when
rendering. Regardless of which app URL the browser requests initially, the app
is able to render any other state within the same application client-side. If
the app cannot handle a URL, it will fall through and request from the server.
Errors thrown during route handling also cause requests to fall through to the
server.

Derby works great with only a single app, though developers may wish to create
separate apps if only certain sets of pages are likely to be used together. For
example, a project might have a separate desktop web app and mobile web app. Or
a project might have an internal administration panel app and a public content
app.

## Creating apps

Apps are created in the file that defines the app's controller code. They are
then associated with a server by requiring the app within the server file.

> ### `app = `derby.createApp` ( module )`
>
> **module:** Derby uses the module object to create an app. The app's name is
> taken from its filename, and Derby exports a number of methods on the app.
>
> **app:** Returns an app object, which is equivalent to `module.exports`.

The app's filename is used to determine the name of the app. App names are used
to automatically associate an app with template and styles files of the same
name.

The app name is also used as the name of the global variable that the
application exposes in the browser. Therefore, app names should be valid
JavaScript variable names, starting with a letter and containing only
alphanumeric characters and underscores.

The `createApp` method adds a number of methods to the app. On both the client
and the server, these are `use`, `view`, `fn`, `get`, `post`, `put`, `del`,
`enter`, `exit`, and `ready`. On the server only, Derby also adds `router`,
`render`, and `scripts`, for use with Express.

## Connecting servers to apps

The Derby project generator outputs an Express server for a typical setup.
Because Derby shares most code between server and client, Derby server files
can be very minimal.

The server includes an app with a standard Node.js require statement. It can
then use the `app.router()` method to create a router middleware for Express
that handles all of the app's routes.

The server also needs to create a `store` object, which is what creates models,
coordinates data syncing, and interfaces with databases. Stores are created via
the `derby.createStore()` method. See [Creating stores](#creating_stores).

## Static pages

Derby can also render static pages from templates and styles not associated
with an app. This is useful for error pages and other pages that don't need
dynamic content.

> ### `staticPages = `derby.createStatic` ( root )`
>
> **root:** The root path that contains the "views" and "styles" directories.
>
> **staticPages:** Returns a staticPages object, which has a render method.
> (While unused, static is a [reserved JavaScript
> keyword](https://developer.mozilla.org/en/JavaScript/Reference/Reserved_Words),
> and it cannot be a variable name.)

The staticPages object keeps a reference to the directory root and provides a
`staticPages.render()` method. It is intended for use in server-only Express
routes. See [Rendering](#rendering).

# Views

Typically, writing Derby apps begins with HTML templates. These templates define
the rendered HTML as well as model-view bindings.

## Creating templates

Derby compiles a collection of HTML-based templates into a page based on a
number of pre-defined names. Pages usually define at least a `Title` and `Body`
template. Templates may be created programmatically via the `view.make()`
method:

{% highlight javascript %}{% raw %}
var view = require('derby').createApp(module).view;

view.make('Body', '<h1>Howdy!</h1>');
{% endraw %}{% endhighlight %}

{% highlight coffeescript %}{% raw %}
{view} = require('derby').createApp module

view.make 'Body', '<h1>Howdy!</h1>'
{% endraw %}{% endhighlight %}

However, they are generally placed in template files within the `views`
directory. Each app automatically looks for a template file that shares the
same name and calls view.make for each template. Templates placed in a template
file are also automatically bundled with the application scripts so that they
can be rendered on the client.

Template files are also HTML, but each template is wrapped in a tag that names
the template. This name must end in a colon to differentiate it from a normal
HTML tag. These tags need not be closed. For example:

{% highlight html %}{% raw %}
<Title:>
  Silly example

<Body:>
  <h1>Howdy!</h1>
{% endraw %}{% endhighlight %}

### Pre-defined templates

By default, Derby includes templates with the names `Doctype`, `Root`,
`Charset`, `Title`, `Head`, `Header`, `Body`, `Footer`, `Scripts`, and `Tail`
when it renders a page on the server.

In the browser, only the `Root`, `Title`, `Header`, `Body`, and `Footer`
templates are re-rendered. Thus, model-view bindings may only be defined within
these templates.

Some of pre-defined templates have names that also are the names of HTML tags,
but only `Title` wraps the template inside of a `<title>` tag. Derby does *not*
include any non-required HTML elements, such as `<html>`, `<head>`, and
`<body>` by default.

By convention, Pre-defined template names are capitalized to indicate that the
page renderer will include them automatically. However, since HTML tags are
case-insensitive, Derby template names are also case insensitive. Thus, `Body`,
`BODY`, and `body` all represent the same template.

Note that template files don't contain boilerplate HTML, such as doctype
definitions, stylesheets, and script includes. By default, Derby includes these
items in an order optimized for fast load times. Also to optimize load time, it
sends pages a number of chunks:

#### First chunk

1. **`Doctype:`** Standard HTML5 doctype---`<!DOCTYPE html>`---unless overridden
2. **`Root:`** Optional location for an `<html>` element if desired. This template should not include any other elements
3. **`Charset:`** `<meta charset=utf-8>` unless overridden
4. **`Title:`** The text content of the page's `<title>` element
5. **`Head:`** Optional location for meta tags, scripts that must be placed in the HTML `<head>`, and manually included stylesheets
6. CSS is compiled and inserted after the Head template automatically
7. **`Header:`** Optional location for a page header that will be sent with the initial response chunk. Note that this is actually part of the HTML `<body>`, but it should render correctly by itself. It is separated out so that it can be displayed to the user before the rest of the page if the remainder of the page takes a while to download. Typically this includes fixed content, such as a logo and a top navigation bar

#### Second chunk

8. **`Body:`** The page's main content
9. **`Footer:`** Optional location for content to include after the body. Used for copyright notices, footer links, and other content repeated at the bottom of multiple pages

#### Third chunk

10. Inline scripts can be added via the `view.inline()` method. Scripts are typically included this way if they are needed to properly render the page, such as resizing an element based on the window size
11. **`Scripts:`** Optional location for external scripts loaded before the client scripts. Note that this template is just a location within the page, and it is not wrapped in a script tag
12. Client scripts are automatically included via an asynchronously loaded external script
13. JSON bundle of the model data, event bindings, and other data resulting
from rendering the page. This bundle initializes the application once the
external client script loads.
14. **`Tail:`** Optional location for additional scripts to be included at the very end of the page

<style>
ol{counter-reset: item}
ol>li{display: block}
ol>li:before{content: counter(item) ". "; counter-increment: item}
#second_chunk+ol{counter-reset: item 7}
#third_chunk+ol{counter-reset: item 9}
</style>

### Importing templates

Each view template file **must** be explicitly imported, starting from the
main index.html file for an app.

File paths are expressed relatively, similar to how Node.js modules are loaded.
Like in Node.js modules, either `pageName.html` or `pageName/index.html` can be
imported as `pageName`.

{% highlight html %}{% raw %}
<!-- all templates from "./home.html" with the namespace "home" -->
<import: src="home">

<!-- all templates from "./home.html" into the current namespace -->
<import: src="home" ns="">

<!-- one or more specific templates with the namespace "home" -->
<import: src="home" template="message alert">

<!-- one template as a different name in the current namespace -->
<import: src="home" template="message" as="myMessage">
{% endraw %}{% endhighlight %}

Templates defined in a parent namespace are inherited unless they are
overridden by a template with the same name in the child namespace. Thus, it
often makes sense to place common page elements in a main file that imports a
number of other files and override the part of the page that is different.

Template components are referenced relative to their current namespace.
Namespaces are separated by colons, and a namespace can be passed to the
`page.render()` method to render a specific page or application state.

Note that passing a namespace to `page.render()` **does not** cause a template
file to be loaded by filename. All of the app's templates are loaded at once, so
that they can be packaged up to render any page in the browser. It happens to be
that a namespace usually has the same name as the file, because the `<import:>`
tag uses the filename as the default namespace. However, every file must be
explicitly imported, starting at the app's main index.html file.

#### shared.html
{% highlight html %}{% raw %}
<profile:>
  <div class="profile">
    ...
  </div>
{% endraw %}{% endhighlight %}

#### home.html
{% highlight html %}{% raw %}
<import: src="shared">

<Body:>
  Welcome to the home page
  <!-- include component from an imported namespace -->
  <app:shared:profile>
{% endraw %}{% endhighlight %}

#### index.html
{% highlight html %}{% raw %}
<import: src="home">
<import: src="contact">
<import: src="about">

<Body:>
  Default page content

<Footer:>
  <p><small>&copy; {{year}}</small></p>
{% endraw %}{% endhighlight %}

#### Context
{% highlight javascript %}{% raw %}
page.render('home', {
  year: 2012
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
page.render 'home',
  year: 2012
{% endraw %}{% endhighlight %}

See [Components](#components) for more info on defining template components.

## Template syntax

Derby's template syntax is largely based on
[Handlebars](http://handlebarsjs.com/), a popular semantic templating
language similar to [Mustache](http://mustache.github.com/mustache.5.html).

If you use Sublime Text 2 or TextMate, you can use [our fork of the HTML5
bundle](https://github.com/codeparty/html5.tmbundle) to get proper
syntax highlighting of Derby templates. You might want to also try our [Clean
color theme](https://github.com/codeparty/clean-textmate), which
highlights each type of template tag appropriately.

A simple Handlebars template:

{% raw %}
    Hello {{name}}
    You have just won ${{value}}!
    {{#if inCalifornia}}
        Well, ${{taxedValue}}, after taxes.
    {{/if}}
{% endraw %}

Given the following data context:

{% raw %}
    {
        name: "Chris",
        value: 10000,
        taxedValue: 10000 - (10000 * 0.4),
        inCalifornia: true
    }
{% endraw %}

Will produce the following:

{% raw %}
    Hello Chris
    You have just won $10000!
    Well, $6000.0, after taxes.
{% endraw %}

Semantic templates better enforce separation of logic from presentation by
restricting the ability to embed logic within views. Instead of conditional
statements and loops, there is a small set of template tags. During rendering,
data are passed to the template, and template tags are replaced with the
appropriate values. This data is often referred to as the "context."

With Handlebars, application code generates a context object before rendering
the view. It then passes that object along with the template at render time.
Derby templates can be used this way as well. However, in addition to looking
for objects in a context object, Derby assumes that the model is part of the
context. Even better, Derby is able to automatically establish live bindings
between the view and objects in the model. Derby slightly extends the
Handlebars syntax in order to support these features.

The other major difference between Handlebars and Derby templates is that Derby
templates must be valid HTML first. Handlebars is language agnostic---it can be
used to compile anything from HTML to source code to a document. However, Derby
templates are first parsed as HTML so that the parser can understand how to
bind data to the surrounding DOM objects. Template tags are only allowed within
elements or text, within attribute values, and surrounding elements.

#### Invalid template tag placements
{% highlight html %}{% raw %}
<!-- INVALID: Within element names -->
<{{tagName}}>Bad boy!</{{tagName}}>

<!-- INVALID: Within attribute names -->
<b {{attrName}}="confused" {{booleanAttr}}>Bad boy!</b>

<!-- INVALID: Splitting an html tag -->
<b{{#if maybe}}>Bad boy!</b{{/}}>

<!-- INVALID: Splitting an element -->
{{#if maybe}}<b>{{/}}Bad boy!</b>
{% endraw %}{% endhighlight %}

#### Valid placements
{% highlight html %}{% raw %}
<!-- Within an element -->
Let's go <b>{{activity}}</b>!

<!-- Within text -->
<b>Let's go {{activity}}!</b>

<!-- Within attribute values -->
<b style="color:{{displayColor}}">Let's go running!</b>

<!-- Surrounding one or more elements and text -->
{{#if maybe}}<b>Let's go dancing!</b>{{/}}
{% endraw %}{% endhighlight %}

### Whitespace and HTML conformance

Before parsing, all HTML comments, leading and trailing whitespace, and new
lines are removed from templates. This reduces page size, and it keeps template
code more readable when spaces are not desired between inline elements. If you
do want whitespace at the beginning or end or a line, add the non-standard `&sp;`
character entity, which will simply be replaced with a space.

The contents of `<script>` and `<style>` tags are passed through literally,
except for whitespace removal. This whitespace removal can be disabled within
an element by adding an `x-no-minify` attribute.

{% highlight html %}{% raw %}
<script type="application/x-yaml" x-no-minify>
  firstName: Sam
  lastName : Reed
</script>
{% endraw %}{% endhighlight %}

Derby's HTML parser should be able to parse any valid HTML, including elements
that don't require closing tags and unquoted attributes. However, it is
recommended that you **always include closing tags** for elements like `<p>`
and `<li>` that might not require a closing tag. The rules around how tags are
automatically closed are complex, and there are certain cases where template
sections may be included within an unexpected element.

HTML attribute values only need to be quoted if they are the empty string or if
they contain a space, equals sign, or greater than sign. Since Derby templates
are parsed as HTML first, any of these characters within a template tag require
an attribute to be escaped. Using **quotes around all attribute values** is
recommended.

Because it understands the HTML context, Derby's HTML escaping is more
minimal than that of many templating libraries. You may be surprised to see
unescaped `>` and `&` characters. These only need to be escaped in certain
contexts, and Derby only escapes them when needed. If you are skeptical, an
[HTML5 validator](http://html5.validator.nu/) will detect most escaping bugs.

Throughout these docs, the output of templates is shown indented and on
multiple lines for the sake of readability. However, Derby's renderer would not
output any indentation or line breaks. In addition, output attribute values are
quoted, but Derby only includes quotes around attribute values if they are
needed.

### Variables

Variables insert a value from the context or model with a given name. If the
name isn't found, nothing will be inserted. Values are HTML escaped by default.
The `unescaped` keyword may be used to insert a value without escaping.

#### Template

{% highlight html %}{% raw %}
<Body:>
  <p>{{name}}</p>
  <p>{{age}}</p>
  <p>{{location}}</p>
  <p>{{unescaped location}}</p>
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
page.render({ name: 'Parker', location: '<b>500 ft</b> away' });
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
page.render name: 'Parker', location: '<b>500 ft</b> away'
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
<p>Parker</p>
<p></p>
<p>&lt;b>500 ft&lt;/b> away</p>
<p><b>500 ft</b> away</p>
{% endraw %}{% endhighlight %}

### Sections

Sections set the scope of the context for their contents. In the case of `if`,
`unless`, `else if`, `else`, and `each`, they also cause their contents to be
conditionally rendered. `with` is used to only set the scope and always render.
In Handlebars, sections begin and end with the same block type, but Derby
requires only an ending slash.

As in Handlebars, falsey values include all falsey JavaScript values (`false`,
`null`, `undefined`, `0`, `''`, and `NaN`) as well as empty arrays (`[]`). All
other values are truthy.

#### Template

{% highlight html %}{% raw %}
<Body:>
  <h1>
    {{#if visited}}
      Welcome back!
    {{else}}
      Welcome to the party!
    {{/}}
  </h1>
  <ul>
    {{#each users}}
      <li>{{name}}: {{motto}}</li>
    {{/}}
  </ul>
  {{#unless hideFooter}}
    {{#with meta}}
      <small>Copyright &copy; {{year}} Party Like It's.</small>
    {{/}}
  {{/}}
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
page.render({
  visited: true
, users: [
    { name: 'Billy', motto: "Shufflin', shufflin'" }
  , { name: 'Ringo', motto: "Make haste slowly." }
  ]
, meta: {
    year: 1999
  }
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
page.render
  visited: true
  users: [
    { name: 'Billy', motto: "Shufflin', shufflin'" }
    { name: 'Ringo', motto: "Make haste slowly." }
  ]
  meta:
    year: 1999
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
<h1>Welcome back!</h1>
<ul>
  <li>Billy: Shufflin', shufflin'</li>
  <li>Ringo: Make haste slowly</li>
</ul>
<small>Copyright &copy; 1999 Party Like It's.</small>
{% endraw %}{% endhighlight %}

Note how in the above example, the context becomes each array item inside of
the `#each users` section. Similarly, sections set scope when referring to the
name of an object. In addition to the local scope, template tags may refer to
anything in the parent scope.

#### Template

{% highlight html %}{% raw %}
<Body:>
  {{#with users.jill}}
    I like <a href="{{link}}">{{favorite}}</a>.
  {{/}}
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
page.render({
  users: {
    jill: {
      favorite: 'turtles'
    }
  }
, link: 'http://derbyjs.com/'
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
page.render
  users:
    jill:
      favorite: 'turtles'
  link: 'http://derbyjs.com/'
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
I like <a href="http://derbyjs.com/">turtles</a>.
{% endraw %}{% endhighlight %}

### Bindings

Model-view binding is a relatively recent approach to adding dynamic
interaction to a page. Its use of declarative syntax dramatically lowers the
amount of repetitive, error-prone DOM manipulation code in an application. With
Derby's bindings system, it should rarely be necessary to write any DOM code
at all.

Derby templates declare bindings by using single curly braces instead of double
curly braces. If a left curly brace (`{`) character is desired in HTML output,
use the HTML entity `&#123;`.

Bound template tags output their values in the initially rendered HTML just like
unbound tags. In addition, they create bindings that update the view
immediately whenever the model changes. If bindings are used for elements that
change upon user interaction---such as form inputs---Derby will update the
model automatically as their values change.

Any template tag may be live bound, except for within an `id` attribute. The id
must be set at render time and not change until the element is re-rendered,
since it is used to figure out which element to update.

Bindings only work for data in the model. Context data is passed in at render
time, and it doesn't change dynamically. If a binding tag uses a name not in
the context object or the model at render time, it is still bound to the model,
since the path may be defined later.

#### Template

{% highlight html %}{% raw %}
<Body:>
  Holler: <input value="{message}"><h1>{message}</h1>
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
model.set('message', 'Yo, dude.');
page.render();
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
model.set 'message', 'Yo, dude.'
page.render()
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
Holler: <input value="Yo, dude." id="$0"><h1 id="$1">Yo, dude.</h1>
{% endraw %}{% endhighlight %}

Note that the value in the model at render time is inserted into the HTML, as with a non-bound template tag. In addition, Derby establishes an event listener for the input element that sets the value of `message` whenever the user modifies the text of the input element. It also sets up a listeners for both the input and the h1 element to update their displayed values whenever `message` changes.

Rather than re-rendering the entire template when a value changes, only the individual elements are updated. In the case of the input, its `value` property is set; in the case of the h1, its `innerHTML` is set. Since neither of these elements have an `id` attribute specified in the template, Derby automatically creates ids for them. All DOM ids created by Derby begin with a dollar sign ($). If an element already has an id, Derby will use that instead.

Derby associates all DOM event listeners with an `id`, because getting objects by id is a fast DOM operation, it makes dealing with DOM events more efficient, and event listeners continue working even if other scripts modify the DOM unexpectedly. Derby internally tracks events via ids, allowing it to render pages on the server and then re-establish the same event listeners on the client efficiently.

If a bound template tag or section is not fully contained by an HTML element, Derby will wrap the template by placing comment markers before and after the location of the template. Comments are used, because they are valid in any location. A number of HTML elements have restrictions that make it impossible to wrap a template in an additional element. For example, `<tr>` elements may only contain `<td>` and `<th>` elements.

#### Template

{% highlight html %}{% raw %}
<Body:>
  Welcome to our {adjective} city!
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
model.set('adjective', 'funny');
page.render();
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
model.set 'adjective', 'funny'
page.render()
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
Welcome to our <!--$0-->funny<!--$$0--> city!
{% endraw %}{% endhighlight %}


### Relative model paths and aliases

For items in the context object, objects from the parent scope can still be referred to directly from within sections. However, bindings are set up when templates are initially compiled, and objects defined in the model may change. Thus, model paths must refer to the full path regardless of location within the template.

Yet, a template might need to define how each item in an array should be rendered as well as bind to those items. In this case, relative model paths may be used. Paths relative to the current scope begin with a dot (`.`).

#### Template

{% highlight html %}{% raw %}
<Body:>
  <ul>{#each items}<app:item>{/}</ul>

<item:>
  <li><a href="{{url}}">{.name}</a>: ${.price}</li>
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
model.set('items', [
  { name: 'Can', price: 5.99, url: '/p/0' }
, { name: 'Fin', price: 10.99, url: '/p/1' }
, { name: 'Bot', price: 24.95, url: '/p/2' }
]);
page.render();
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
model.set 'items', [
  { name: 'Can', price: 5.99, url: '/p/0' }
  { name: 'Fin', price: 10.99, url: '/p/1' }
  { name: 'Bot', price: 24.95, url: '/p/2' }
]
page.render()
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
<ul id="$0">
  <li><a href="/p/0" id="$1">Can</a>: $<!--$2-->5.99<!--$$2--></li>
  <li><a href="/p/1" id="$3">Fin</a>: $<!--$4-->10.99<!--$$4--></li>
  <li><a href="/p/2" id="$5">Bot</a>: $<!--$6-->24.95<!--$$6--></li>
</ul>
{% endraw %}{% endhighlight %}

In the above example, note that the `url` is not bound, and it does not start with a dot. Since the context will be set to the array item at render time, this will render the value correctly, but it will not update if the value changes. `.name` and `.price` start with a dot, because they are bound to paths in the model relative to the item being rendered. Whenever the name or the price of an item changes, the appropriate fields will be updated in realtime. In addition, the entire list is bound. If a new item is added, an item is removed, or the items are reordered, the list will be updated in realtime.

Aliases to a specific scope may be defined, enabling relative model path references within nested sections. Aliases begin with a colon (`:`), and can be defined at the end of a section tag with the `as` keyword.

#### Template

{% highlight html %}{% raw %}
<Body:>
  <h2>Toys in use:</h2>
  {#each toys as :toy}
    <div>
      {#if :toy.inUse}
        <app:toyStatus>
      {/}
    </div>
  {/}
  <h2>All toys:</h2>
  {#each toys as :toy}
    <app:toyStatus>
  {/}

<toyStatus:>
  <p>{{name}} on the {:toy.location}</p>
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
model.set('toys', [
  { name: 'Ball', location: 'floor', inUse: true }
, { name: 'Blocks', location: 'shelf' }
, { name: 'Truck', location: 'shelf' }
]);
page.render();
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
model.set 'toys', [
  { name: 'Ball', location: 'floor', inUse: true }
  { name: 'Blocks', location: 'shelf' }
  { name: 'Truck', location: 'shelf' }
]
page.render()
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
<h2>Toys in use:</h2>
<!--$0-->
  <!--$1--><p>Ball on the <!--$2-->floor<!--$$2--></p><!--$$1-->
  <!--$3--><!--$$3-->
  <!--$4--><!--$$4-->
<!--$$0-->
<h2>All toys:</h2>
<!--$5-->
  <p>Ball on the <!--$6-->floor<!--$$6--></p>
  <p>Blocks on the <!--$7-->shelf<!--$$7--></p>
  <p>Truck on the <!--$8-->shelf<!--$$8--></p>
<!--$$5-->
{% endraw %}{% endhighlight %}

### View helper functions

Derby follows the semantic templating approach of Handlebars and Mustache, which helps to reduce bleeding of logic into templates. However, because of Derby's automatic bindings between the view and model, it can be useful to have computed values that are created only for the view.

View helper functions are reactive, and they are evaluated when rendering as well as whenever any bound inputs change. In addition, they can work as both getters and setters. This is especially useful when binding to form elements, such as selected options or radio buttons:

#### Controller

{% highlight javascript %}{% raw %}
// Remove all whitespace from a string
view.fn('unspace', function(value) {
  return value && value.replace(/\s/g, '')
})
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
# Remove all whitespace from a string
view.fn 'unspace', (value) ->
  value && value.replace(/\s/g, '')
{% endraw %}{% endhighlight %}

#### Template

{% highlight html %}{% raw %}
<h1 style="color:{unspace(home.title.color)}">
  Welcome in {home.title.color}!
</h1>
<select>
  {#each home.colors}
    <option selected="{equal(home.title.color, .name)}">
      {{.name}}
    </option>
  {/}
</select>
{% endraw %}{% endhighlight %}

There are a handful of default view helper functions listed below. It is also possible to define custom view helper functions, such as `unspace` in the example above. The `equal` and `not` functions can act as both getters and setters. In this example, when the page renders, the option with a name equal to the value of `home.title.color` will have a `selected` attribute and the others will not. When the user selects a different option from the drop down, `home.title.color` will be set to the value of the option that is now selected.

#### Defaul view helper functions

The default view helpers are:

* **equal(a, b)** - Getter and setter function. Returns `a === b` as a getter.
  Sets the output of `a` to current value of `b` if the value is true, and does
  nothing if the value is false when used as a setter.

* **not(value)** - Getter and setter function. Returns `!value` as a getter as
  well as setter.

* **or(args...)** - Accepts any number of arguments and returns the first
  truthy value or the last value. `or(x, y, z)` is equivalent to `x || y || z`
  in JavaScript.

* **and(args...)** - Accepts any number of arguments and returns the first
  falsey value or the last value. `and(x, y, z)` is equivalent to `x && y && z`
  in JavaScript.

* **gt(a, b)** - Returns `a > b`

* **lt(a, b)** - Returns `a < b`

* **gte(a, b)** - Returns `a >= b`

* **lte(a, b)** - Returns `a <= b`

For debugging:

* **log(args...)** - Applies arguments to console.log

* **trace()** - Calls console.trace()

* **debugger()** - Invokes the debugger with a `debugger;` statement

* **path(name)** - Outputs the model path for a template name. Often useful
  when combined with log, such as: `log(path(':item'), :item)`, which might
  log something like `"_page.list.0" {title: 'Pancakes', rating: 5}`

Note that helper functions provide enough flexibility to introduce complex logic into templates, which is considered bad practice. For example:

{% highlight html %}{% raw %}
<!-- WARNING: Not recommended -->
{#if lt(_page.user.score, 5)}
  <b>Let's try that again!</b>
{/}

<!-- A little better: -->
{#if lt(_page.user.score, _page.lowScoreCutoff)}
  <b>Let's try that again!</b>
{/}

<!-- Preferred: -->
{#if isLowScore(_page.user.score)}
  <b>Let's try that again!</b>
{/}
{% endraw %}{% endhighlight %}

The first example is basically just straight logic embedded within the template. This is not recommended, because as business rules change (such as changing scoring so that 20 is now a low score), templates should not need to be modified. It is typically better to define constants in the controller code and store them in the model or pass them in as context data. Better still is to define a function specifically for each purpose, as what determines the low score could change entirely to a function of an additional input and no longer a simple cutoff.

While tempting, lots of embedded logic is likely to produce less maintainable code in the long run.

## Components

Components are similar to Handlebars partials, but they are much more powerful. Like partials, they inherit the scope of the parent context where they are used. In addition, Derby's components let you supply additional arguments as attributes and HTML content. Both for code readability and for more efficient template compilation, it is best to keep individual templates relatively simple and use components for each significant unit.

Any Derby template can be used as a component. They are included like custom HTML tags with a special namespace. Components defined within an app are all accessed from the `app` namespace.

#### Template

{% highlight html %}{% raw %}
<Body:>
  <app:nav>

<nav:>
  <ul>{{each navItems}}<app:navItem>{{/}}</ul>

<navItem:>
  <li><a href="{{link}}">{{title}}</a></li>
{% endraw %}{% endhighlight %}

#### Context

{% highlight javascript %}{% raw %}
page.render({
  navItems: [
    { title: 'Home', link '/' }
  , { title: 'About', link '/about' }
  , { title: 'Contact us', link '/contact' }
  ]
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
page.render
  navItems: [
    { title: 'Home', link '/' }
    { title: 'About', link '/about' }
    { title: 'Contact us', link '/contact' }
  ]
{% endraw %}{% endhighlight %}

#### Output

{% highlight html %}{% raw %}
<ul>
  <li><a href="/">Home</a></li>
  <li><a href="/about">About</a></li>
  <li><a href="/contact">Contact us</a></li>
</ul>
{% endraw %}{% endhighlight %}

Literal values or variable values can be passed to components. These component attributes are available in template tags, prefixed with an `@` character.

{% highlight html %}{% raw %}
<Body:>
  <h1><app:greeting message="Hello" to="{_page.user.name}"></h1>

<greeting:>
  {#if @to}
    {{@message}}, {@to}!
  {else}
    {{@message}}!
  {/}
{% endraw %}{% endhighlight %}

produces the same output as:

{% highlight html %}{% raw %}
<Body:>
  <h1>
    {#if _page.user.name}
      Hello, {_page.user.name}!
    {else}
      Hello!
    {/}
  </h1>
{% endraw %}{% endhighlight %}

By default, all components are void HTML elements. This means that they must only have an opening tag and no closing tag, just like the `<img>` and `<br>` elements. A component can be defined as nonvoid, which means that it must have both a starting and a closing tag. Nonvoid components have access to a special `content` attribute that makes it possible to pass HTML content to the component. For example:

{% highlight html %}{% raw %}
<Body:>
  Welcome!
  <app:fancyButton>
    <b>Click me{{#if isUrgent}} now!{{/}}</b>
  </app:fancyButton>

<fancyButton: nonvoid>
  <button class="fancy">
    {{@content}}
  </button>
{% endraw %}{% endhighlight %}

produces the same output as:

{% highlight html %}{% raw %}
<Body:>
  Welcome!
  <button class="fancy">
    <b>Click me{{#if isUrgent}} now!{{/}}</b>
  </button>
{% endraw %}{% endhighlight %}

### Component libraries

Documentation is forthcoming. Until then, please see the [Widgets example](https://github.com/codeparty/derby-examples/tree/master/widgets) for usage and the [Boot source](https://github.com/codeparty/derby-ui-boot).

## HTML extensions

Derby provides a few extensions to HTML that make it easier to bind models and views.

Custom attributes used during template parsing start with the prefix `x-` to avoid conflicts with future extensions to HTML. Note that Derby uses this prefix instead of `data-`, since that prefix is intended for custom data attributes that are included in the DOM. Derby removes `x-` attributes as it parses, and the output HTML does not include these non-standard attributes.

### DOM event binding

The `x-bind` attribute may be added to any HTML element to bind one or more DOM events to a controller function by name. The bound function must be exported on the app. Bound functions are passed the original event object, the element on which the `x-bind` attribute was placed, and a `next()` function that can be called to continue event bubbling.

Browsers emit DOM events on the target and then each of its parent nodes all the way up to the document's root element, unless a handler calls `e.stopPropogation()`. Derby performs event bubbling more like routes---the handler function for the target element or the first bound parent element is called and then event bubbling stops. The handler can call the `next()` function to continue bubbling the event up.

The `x-capture` attribute may be used if the handler should *always* be called whenever a child element emits a given event. This may be especially useful on the root `<html>` element for handling events like `mousemove`.

If the click event is bound on an `<a>` tag without an `href` attribute, Derby will add the attributes `href="#"` and `onclick="return false"` automatically. If the submit event is bound on a `<form>` tag, `onsubmit="return false"` will be added to prevent a default redirect action.

Event bindings can also delay the callback's execution after a timeout. This can be useful when handling events like paste, which is fired before new content is inserted. The value of the delay in milliseconds is included after the name of the event, such as `x-bind="paste/0: afterPaste"`.

Internally, Derby only binds each type of event once to the `document` and performs event delegation. It uses element ids to keep track of which elements should be bound to which events. Thus, much like with model-view bindings, Derby will add an automatically generated `id` attribute to an element that uses `x-bind` if it does not already have an id.

#### Template

{% highlight html %}{% raw %}
<Root:>
  <!-- always called regardless of event bubbling -->
  <html x-capture="mousemove: move">

<Body:>
  <button x-bind="click: start">Start</button>

  <!-- href="#" and onclick="return false" will be added -->
  <a x-bind="click: cancel">Cancel</a>

  <!-- onsubmit="return false" will be added -->
  <form x-bind="submit: search"> </form>

  <!-- Multiple events on one element -->
  <img src="example.png" x-bind="mousedown: down, mouseup: up">

  <!-- Wait for timeout of 50ms before calling back -->
  <input x-bind="paste/50: afterPaste">
{% endraw %}{% endhighlight %}

It is often useful to relate back a DOM element to the model path that was used to render the item. For example, one might want to remove an item from a list when a button is clicked. Derby extends the `model.at()` method to accept a DOM node or jQuery object. When passed one of these, the method will return a [scoped model](#scoped_models) that is scoped to the context of the closest bound path in the template.

#### Template

{% highlight html %}{% raw %}
<Body:>
  <ul>
    {#each _page.users}
      <li x-bind="click: upcase">{.name}</li>
    {/}
  </ul>
{% endraw %}{% endhighlight %}

#### App

{% highlight javascript %}{% raw %}
exports.upcase = function (e, el, next) {
  user = model.at(el);

  // Logs something like "_page.users.3"
  console.log(user.path());

  user.set('name', user.get('name').toUpperCase());
}
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
exports.upcase = (e, el, next) ->
  user = model.at el

  # Logs something like "_page.users.3"
  console.log user.path()

  user.set 'name', user.get('name').toUpperCase()
{% endraw %}{% endhighlight %}

### Boolean attributes

In HTML, boolean attributes are true when they are included and false when they are excluded. Since Derby only allows template tags inside attribute values, this makes it difficult to bind such attributes to model objects. Therefore, Derby uses a slightly modified syntax that works more naturally with the templating syntax for the attributes `checked`, `selected`, and `disabled`, which are likely to be bound to data.

Boolean attribute values can be inverted via the built-in view helper function `not()`.

{% highlight html %}{% raw %}
<Body:>
  <!-- Outputs:
    <input type="checkbox" checked>
    - or -
    <input type="checkbox">
  -->
  <input type="checkbox" checked="{{active}}">

  <!-- Bound to model -->
  <input type="checkbox" checked="{active}">

  <!-- Inverted value -->
  <input type="checkbox" disabled="{not(active)}">
{% endraw %}{% endhighlight %}

### Form elements

Binding the selected attribute of `<option>` elements in a `<select>` is difficult, because the `change` event is only fired on the `<select>` element, and the `selected` attribute must be place on the options. Therefore, Derby distributes the change event to each of the children of a select element, raising the event on each of the options as well. This makes it possible to bind the selected state on each of the options.

For radio buttons, change events are only fired on the element that is clicked. However, clicking a radio button unchecks the value of all other radio buttons with the same name. Thus, Derby also emits the change event on other elements with the same name so that each radio button's checked attribute may be bound.

## Stylesheets

Derby uses **[Stylus](http://learnboost.github.com/stylus/)** and/or **[LESS](http://lesscss.org/)** to automatically compile and includes styles for each page. Both of these languages extend CSS with variables, mixins, functions, and other awesome features.

Derby also includes **[Nib](http://visionmedia.github.com/nib/)** with Stylus, which adds a number of convenient CSS3 mixins. Nib takes care of adding vendor prefixes, makes CSS gradients *much* easier, and has bunch of other useful features.

Stylus requires that files end in a `.styl` extension. It supports [importing other files](http://learnboost.github.com/stylus/docs/import.html), including support for `index.styl` files. Since Node.js, Derby templates, and Stylus all support similar file importing conventions, it is easy to use the same directory structure for analogous files in the `lib`/`src`, `views`, and `styles` directories.

Derby includes compiled CSS at the top of each page. Inlining CSS almost always decreases load time, and Stylus or LESS importing makes it easy to break up shared styles into files included in the appropriate pages. Note, however, that it is not optimal to include a very large amount of CSS, such as large data URI encoded images, at the top of the page. Large images are best loaded as separate files or inline at the bottom of the page, so that the rest of the page may be displayed first.

## Rendering

Views are rendered in response to [routes](#routes). Most routes should be defined inside of an app so that they can be handled both on the client and the server. Views can also be rendered in response to server only routes.

In each render method, `namespace`, `model`, `context`, and `status` arguments may be in any order or omitted.

> ### page.render` ( [namespace], [context], [status] )`
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Object specifying additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default. Has no effect when rendering on the client.

App routes supply a page object, which provides a consistent interface for rendering an entire page on both server and client. On the server, the page is rendered by calling Node.js response object methods like `res.write`. On the client, Derby renders the page locally. It then replaces the `document.title` and `document.body.innerHTML`, and updates the URL with `history.pushState`.

The page's render function implicitly renders in the context of the app's model. An additional context object may be supplied for items that are only needed at render time.

> ### app.render` ( res, model, [namespace], [context], [status] )`
>
> **res:** Response object passed to the Express routing callback
>
> **model:** A Derby model object used for rendering. The contents of the model will be serialized and initialized into the same state in the browser once the page loads.
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default.

Apps may also be rendered within server only Express routes. In this case, it is necessary to provide the renderer with a response object and model. When using the store.modelMiddleware, the model for a request is retrieved from `req.getModel()`. Otherwise, models can be made directly from the store via the `store.createModel()` method.

> ### staticPages.render` ( name, res, [model], [namespace], [context], [status] )`
>
> **name:** Name of the view and style files to render
>
> **res:** Response object passed to the Express routing callback
>
> **model:** *(optional)* A Derby model object. A model object may be used for rendering, but it will not be serialized and included with a static page. Static pages don't have an associated app, and they don't include scripts by default.
>
> **namespace:** *(optional)* A namespace within which to render. Typically is the name of a page or type of page.
>
> **context:** *(optional)* Additional context objects to use in rendering templates.
>
> **status:** *(optional)* Number specifying the HTTP status code. 200 by default.

For creating error pages and other static pages, Derby provides a `staticPages` object that renders a template and script file specified by name. Typically, this is used without a model object, but it is possible to supply a model object that is used for rendering only. See [Static pages](#static_pages).

## app.view

Derby adds an `app.view` object for creating and rendering views.

> ### view.make` ( name, template )`
>
> **name:** Name of the template
>
> **template:** A string containing the Derby template. Note that this should be only the content of the template, and it should not have a template name element, such as `<Body:>` at the start.

Apps should typically place all templates in a template file in the `views` folder instead of calling `view.make()` directly. However, templates may be added to an app this way as well.

Note that calling `view.make()` only renders the template; it does not include the template in the external script file separately. Thus, it must be called again on the client when the app loads.

> ### view.inline` ( fn )`
>
> **fn:** Function to be inlined in the page and called immediately when the page loads.

This method is intended solely for server use and has no effect when called in the browser.

Scripts should be included inline in the page if needed to properly render the page. For example, a script might adjust the layout based on the window size, or it might autofocus a sign in box in browsers that don't support the HTML5 autofocus attribute.

Usually, it is preferable to place such scripts in a separate file called `inline.js` in the same directory as the app. This file will be automatically inlined when the app is created. Calling `view.inline()` directly does the same thing, but it is redundant to send the script inline and also include it in the app's external script file.

# Controllers

Derby controllers are defined in the script file that invokes `derby.createApp()`. Typically, controllers are located at `lib\app_name\index.js` or `src\app_name\index.coffee`. See [Creating apps](#creating_apps).

Controllers include routes, user event handlers, and application logic. Because Derby provides model-view bindings and syncs models automatically, directly manipulating the DOM and manually sending messages to the server should rarely be necessary.

## Routes

Routes map URL patterns to actions. Derby routes are powered by [Express](http://expressjs.com/), which is similar to [Sinatra](http://www.sinatrarb.com/). Within apps, routes are defined via the `get`, `post`, `put`, and `del` methods of the app created by `derby.createApp()`.

> ### app.get` ( routePattern, callback(page, model, params, next) )`
> ### app.post` ( routePattern, callback(page, model, params, next) )`
> ### app.put` ( routePattern, callback(page, model, params, next) )`
> ### app.del` ( routePattern, callback(page, model, params, next) )`
>
> **pattern:** A string containing a literal URL, an Express route pattern, or a regular expression. See [Express's routing documentation](http://expressjs.com/guide.html#routing) for more info.
>
> **callback:** Function invoked when a request for a URL matching the appropriate HTTP method and pattern is received. Note that this function is called both on the server and the client.
>
> **page:** Object with the methods [`page.render()`](#pagerender)  and `page.redirect()`. All app routes should call one of these two methods or pass control by calling `next()`.
>
> **model:** Derby model object
>
> **params:** An object containing the matching URL parameters. The `url`, `query`, and `body` properties typically available on `req` are also added to this object.
>
> **next:** A function that can be called to pass control to the next matching route. If this is called on the client, control will be passed to the next route defined in the app. If no other routes in the same app match, it will fall through to a server request.

> ### page.redirect` ( url, [status] )`
>
> **url:** Destination of redirect. [Like Express][expressRedirect], may also be the string 'home' (which redirects to '/') or 'back' (which goes back to the previous URL).
>
> **status:** *(optional)* Number specifying HTTP status code. Defaults to 302 on the server. Has no effect on the client.

[expressRedirect]: http://expressjs.com/guide.html#res.redirect()

Unlike Express, which provides direct access to the `req` and `res` objects created by Node HTTP servers, Derby returns `page`, `model`, and `params` objects. These provide the same interface on the client and the server, so that route handlers may be executed in both environments.

Express is used directly on the server. On the client, Derby includes Express's route matching module. When a link is clicked or a form is submitted, Derby first tries to render the new URL on the client.

Derby can also capture form submissions client-side. It provides support for `post`, `put`, and `del` HTTP methods using the same hidden form field [override approach](http://expressjs.com/guide.html#http-methods) as Express.

### Transitional routes

In the client, there are a number of situations where it makes sense to update the URL but only part of the UI needs to update. For example, one might want to show a lightbox on top of a given page or update only the content area of a page and not the surrounding chrome.

In these cases, transitional routes provide a more efficient and flexible solution to updating the page. On the server or from a different page, calling a transitional route renders the entire page like a normal route. However, when coming from the same page in the client, a transitional route only runs code to update the model and the appropriate view bindings.

Transitional routes make it possible to use CSS animations, since only the relevant elements are updated. If the full page were re-rendered, the current HTML elements would be replaced with new ones. Then, the CSS animation would not be able to figure out how a given element's styles had changed.

Transitional routes use the same `get`, `post`, `put`, and `del` methods, but they take both a from and to pattern as well as a forward and back callback. Since transitional routes cannot render the entire page but only update data in the model, their callbacks do not have a `page` argument.

{% highlight javascript %}{% raw %}
get('/photo/:id', function (page, model, params, next) {
  // Normal page rendering code goes here
  ...

  // The transitional route callback will execute right before
  // the render method is called
  page.render();
})

get({from: '/photo/:id', to: '/photo/:id/lightbox'}, {
  forward: function (model, params, next) {
    model.set('_page.showLightbox', true);
  }
, back: function (model, params, next) {
    model.del('_page.showLightbox');
  }
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
get '/photo/:id', (page, model, params, next) ->
  # Normal page rendering code goes here
  ...

  # The transitional route callback will execute right before
  # the render method is called
  page.render()

get from: '/photo/:id', to: '/photo/:id/lightbox',
  forward: (model, params, next) ->
    model.set '_page.showLightbox', true
  back: (model, params, next) ->
    model.del '_page.showLightbox'
{% endraw %}{% endhighlight %}

Transitional routes support literal string routes and patterned routes with named parameters like `:id` and wildcard captures like `*`. However, they do not support arbitrary regular expressions.

When a `to` route is requested on the server or from a different page, the router first pretends like the `from` route was called. It replaces any named parameters and wildcards based on their equivalents in the from route, and then does a lookup for the from route.

After that, the original route is executed up to the `page.render()` call. Next, the `forward` callback of the transitional route is called. This simulates first navigating to the original route and then transitioning to the new route. Finally, `page.render()` is executed.

In the above example, the possible transitions would be:

<table>
  <tr>
    <th>Starting from</th>
    <th>Going to</th>
    <th>Effect</th>
  </tr>
  <tr>
    <td>From server or another page</td>
    <td>/photo/42</td>
    <td>Run the original route normally</td>
  </tr>
  <tr>
    <td>/photo/42</td>
    <td>/photo/42/lightbox</td>
    <td>Run the `forward` callback only</td>
  </tr>
  <tr>
    <td>/photo/42/lightbox</td>
    <td>/photo/42</td>
    <td>Run the `back` callback only</td>
  </tr>
  <tr>
    <td>From server or another page</td>
    <td>/photo/42/lightbox</td>
    <td>Run the original route for `/photo/42` up to `page.render()`, then the `forward` callback, then render</td>
  </tr>
</table>

### History

For the most part, updating the URL client-side should be done with normal HTML links. The default action of requesting a new page from the server is canceled automatically if the app has a route that matches the new URL.

To update the URL after an action other than clicking a link, scripts can call methods on `view.history`. For example, an app might update the URL as the user scrolls and the page loads more content from a paginated list.

> ### view.history.push` ( url, [render], [state], [e] )`
> ### view.history.replace` ( url, [render], [state], [e] )`
>
> **url:** New URL to set for the current window
>
> **render:** *(optional)* Re-render the page after updating the URL if true. Defaults to true
>
> **state:** *(optional)* A state object to pass to the `window.history.pushState` or `window.history.replaceState` method. `$render` and `$method` properties are added to this object for internal use when handling `popstate` events
>
> **e:** *(optional)* An event object whose `stopPropogation` method will be called if the URL can be rendered client-side

Derby's `history.push` and `history.replace` methods will update the URL via `window.history.pushState` or `window.history.replaceState`, respectively. They will fall back to setting `window.location` and server-rendering the new URL if a browser does not support these methods. The `push` method is used to update the URL and create a new entry in the browser's back/forward history. The `replace` method is used to only update the URL without creating an entry in the back/forward history.

> ### view.history.refresh` ( )`
>
> Re-render the current URL client-side

For convenience, the navigational methods of [`window.history`](https://developer.mozilla.org/en/DOM/window.history) can also be called on `view.history`.

> ### view.history.back` ( )`
>
> Call `window.history.back()`, which is equivalent to clicking the browser's back button

> ### view.history.forward` ( )`
>
> Call `window.history.forward()`, which is equivalent to clicking the browser's forward button

> ### view.history.go` ( i )`
>
> Call `window.history.go()`
>
> **i:** An integer specifying the number of times to go back or forward. Navigates back if negative or forward if positive

## User events

Derby automates a great deal of user event handling via [model-view binding](#bindings). This should be used for any data that is tied directly to an element's attribute or HTML content. For example, as users interact with an `<input>`, value and checked properties will be updated. In addition, the `selected` attribute of `<option>` elements and edits to the innerHTML of `contenteditable` elements will update bound model objects.

For other types of user events, such as `click` or `dragover`, Derby's [`x-bind`](#dom_event_binding) attribute can be used to tie DOM events on a specific element to a callback function in the controller. Such functions must be exported on the app module.

Even if controller code is responding to a DOM event, it should typically only update the view indirectly by manipulating data in the model. Since views are bound to model data, the view will update automatically when the correct data is set. While this way of writing client code may take some getting used to, it is ultimately much simpler and less error-prone.

## Model events

[Model events](#model_events) are emitted in response to changes in the model. These may be used directly to update other model items and the resulting views, such as updating a count of the items in a list every time it is modified.

## Application logic

Application logic executes in response to routes, user events, and model events. Code that responds to user events and model events should be placed within an `app.enter()` callback. This provides the model object for the client and makes sure that the code is only executed on the client.

> ### app.enter` ( routePattern, callback(model) )`
> ### app.exit` ( routePattern, callback(model) )`
>
> **routePattern:** A string containing a literal URL, an Express route pattern, or a regular expression. See [Express's routing documentation](http://expressjs.com/guide.html#routing) for more info.
>
> **callback:** Function called as soon as the Derby app is loaded on the client. Note that any code within this callback is only executed on the client and not on the server.
>
> **model:** The Derby model object for the given client

There is also an `app.ready()` method, which is only called on the very first page load and not after any client-side rendered page transitions.

> ### app.ready` ( callback(model) )`
>
> **callback:** Function called as soon as the Derby app is loaded on the client. Note that any code within this callback is only executed on the client and not on the server.
>
> **model:** The Derby model object for the given client

Application logic should be written to share as much code between servers and clients as possible. For security reasons or for direct access to backend services, it may be necessary to only perform certain functions on servers. However, placing as much code as possible in a shared location allows Derby apps to be extremely responsive and work offline by default.

## Access control

A basic acccess control mechanism is implemented, but it isn't documented quite yet. An example is coming soon.

# Models

Derby models are powered by [Racer](http://racerjs.com/), a realtime model synchronization engine. Racer enables multiple users to interact with the same data objects via sophisticated conflict detection and resolution algorithms. At the same time, it provides a simple object accessor and event interface for writing application logic.

## Introduction to Racer

On the server, Racer creates a `store`, which manages data updates. Stores create `model` objects, which provide a synchronous interface similar to interacting directly with objects. Models maintain their own copy of a subset of the global state. This subset is defined via [subscriptions](#subscription) to certain paths. Models perform operations independently, and they automatically synchronize their state with the associated store.

All remotely synced data is stored via [ShareJS](http://sharejs.org/), which means that different clients can modify the same data at the same time. ShareJS uses [Operational Transformation (OT)](http://en.wikipedia.org/wiki/Operational_transformation) to automatically resolve conflicts and update the view for each client.

Model [mutator methods](#getters_and_setters) provide callbacks invoked after the server ultimately commits an operation. These callbacks can be used to wait for the eventual value of an operation before performing further logic, such as waiting for an increment to get a unique count number. Models also emit events when their contents are updated, which Derby uses to update the view in realtime.

## Creating stores

The default server produced by the Derby project generator will create a store and add a modelMiddleware to the Express server before any app routers. The modelMiddleware adds a `req.getModel()` function which can be called to create or get a model (if one was already created) for a given request.

> ### `store = `derby.createStore` ( options )`
>
> **options:** An object that configures the store
>
> **store:** Returns a Racer store object

Typically, a project will have only one store, even if it has multiple apps. It is possible to have multiple stores, though a given page can only have one model, and a model is associated with one store.

### Persistence

Racer stores are backed by ShareJS, which uses [LiveDB](https://github.com/share/livedb) to keep a journal of all operations in Redis, perform PubSub of operations and queries, and store data via a snapshot database wrapper. Currently, LiveDB only supports PubSub via Redis, and the only available database adapter is [livedb-mongo](https://github.com/share/livedb-mongo) for MongoDB. The database adapters are very simple, and writing additional database adapters is straightforward.

Note that LiveDB requires at least Redis 2.6, since it uses Lua scripting to perform journal operations.

See the [MongoSkin](https://github.com/kissjs/node-mongoskin#module) and [Node.js Redis client](https://github.com/mranney/node_redis#rediscreateclientport-host-options) documentation for configuration options.

{% highlight javascript %}{% raw %}
var liveDbMongo = require('livedb-mongo');
var redis = require('redis').createClient();

var mongoUrl = 'mongodb://localhost:27017/database?auto_reconnect';
var store = app.createStore({
  // Arguments are the same as those for MongoSkin
  db: liveDbMongo(mongoUrl, {safe: true})
, redis: redis
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
liveDbMongo = require('livedb-mongo');
redis = require('redis').createClient();

mongoUrl = 'mongodb://localhost:27017/database?auto_reconnect'
store = app.createStore
  # Arguments are the same as those for MongoSkin
  db: liveDbMongo(mongoUrl, {safe: true})
  redis: redis
{% endraw %}{% endhighlight %}

Racer paths are translated into database collections and documents using a natural mapping:

    collection.documentId.documentProperty

LiveDB Mongo will add `_type`, and `_v` properties to Mongo documents for internal use. It will strip out these properties as well as `_id` when it returns the document from Mongo. If a document is an object, it will be stored as the Mongo document directly. If it is another type, it will be nested under a property on the Mongo document caleld `_data`.

It is not possible to set or drop an entire collection, or get the list of collections via the Racer API.

## Creating models

Derby provides a model when calling application routes. On the server, it creates an empty model from the `store` associated with an app. When the server renders the page, the model is serialized. It is then reinitialized into the same state on the client. This model object is passed to app routes rendered on the client.

Derby uses the model supplied by the store.modelMiddleware by calling `req.getModel()`. To pass data from server-side express middleware or routes, the model can be retrieved via this same method and data can be set on it before passing control to the app router. Model's created from `req.getModel()` specify the option `{fetchOnly: true}`. This means that calls to `model.subscribe()` actually only fetch data and don't subscribe. This is more efficient during server-side rendering, since the model is only created for long enough to handle the route and render the page. The model then gets subscribed when it initializes in the browser.

If you would like to get or set data outside of the app on the server, you can create models directly via `store.createModel()`.

> ### `model = `store.createModel` ( options )`
>
> **model:** A Racer model object associated with the given store

## Model features

### Paths

All model operations happen on paths which represent nested JSON objects. These paths must be globally unique within a particular database and Redis journal.

For example, the model:

    {
      title: 'Fruit store',
      fruits: [
        { name: 'banana', color: 'yellow' },
        { name: 'apple', color: 'red' },
        { name: 'lime', color: 'green' }
      ]
    }

Would have paths like `title`, `fruits.1`, and `fruits.0.color`. Any path segment that is a number must be an index of an array.

**WARNING:** If you want to use an id value that is a number as a path segment, be careful to prefix this with another character, such as `_` before setting it. Otherwise, you will accidentally create a gigantic array and probably run out of memory. For example, use a path like: `items._1239182389123.name` and never `items.1239182389123.name`.

#### Local and remote collections

Collection names (i.e. the first path segment) that start with an underscore (`_`) or dollar sign (`$`) are local to a given model and are not synced. All paths that start with another character are remote, and will be synced to servers and other clients via ShareJS. Collections that begin with dollar signs are reserved for use by Racer, Derby, or extensions, and should not be used for application data.

Almost all non-synced data within an application should be stored underneath the `_page` local collection. This enables Derby to automatically cleanup as the user navigates between pages. Right before rendering a new page, Derby calls `model.destroy('_page')`, which removes all data, references, event listeners, and reactive functions underneath the `_page` collection. If you have some data that you would like to be maintained between page renders, it can be stored underneath a different local collection. This is useful for setting data on the server, such as setting `_session.userId` in authentication code. However, be very careful when storing local data outside of `_page`, since bleeding state between pages is likely to be a source of unexpected bugs.

#### Scoped models

Scoped models provide a more convenient way to interact with commonly used paths. They support the same methods, and they provide the path argument to accessors, mutators, event methods, and subscription methods. Also, wherever a path is accepted in a racer method, a scoped model can typically be used as well.

> ### `scoped = `model.at` ( subpath )`
>
> **subpath:** The relative reference path to set. The path is appended if called on a scoped model
>
> **scoped:** Returns a scoped model

> ### `scoped = `model.scope` ( [path] )`
>
> **path:** The absolute reference path to set. This will become the scope even if called on a scoped model. May be called without a path to get a model scoped to the root
>
> **scoped:** Returns a scoped model

> ### `scoped = `model.parent` ( [levels] )`
>
> **levels:** *(optional)* Defaults to 1. The number of path segments to remove from the end of the reference path
>
> **scoped:** Returns a scoped model

> ### `path = `model.path` ( [subpath] )`
>
> **subpath:** A relative reference path to append
>
> **path:** Returns the reference path

> ### `segment = `model.leaf` ( )`
>
> **segment:** Returns the last segment for the reference path. Useful for getting indices, ids, or other properties set at the end of a path

{% highlight javascript %}{% raw %}
room = model.at('_page.room');

// These are equivalent:
room.at('name').set('Fun room');
room.set('name', 'Fun room');

// Logs: {name: 'Fun room'}
console.log(room.get());
// Logs: 'Fun room'
console.log(room.get('name'));
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
room = model.at '_page.room'

# These are equivalent:
room.at('name').set 'Fun room'
room.set 'name', 'Fun room'

# Logs: {name: 'Fun room'}
console.log room.get()
# Logs: 'Fun room'
console.log room.get('name')
{% endraw %}{% endhighlight %}

Note that Derby also extends `model.at` to accept a DOM node as an argument. This is typically used with `e.target` in an event callback. See [x-bind](#dom_event_binding).

#### GUIDs

Models provide a method to create globally unique ids. These can be used as part of a path or within mutator methods.

> ### `guid = `model.id` ( )`
>
> **guid:** Returns a globally unique identifier that can be used for model operations

### Queries

Racer can fetch or subscribe to queries based on a model value or a database-specific query. When fetching or subscribing to a query, all of the documents associated with that query are also fetched or subscribed.

> ### `query = `model.query` ( collectionName, path )`
>
> **collectionName:** The name of a collection from which to get documents
>
> **path:** A model path whose value contains a documentId or an array of documentIds

> ### `query = `model.query` ( collectionName, databaseQuery )`
>
> **collectionName:** The name of a collection from which to get documents
>
> **databaseQuery:** A query in the database native format, such as a MonogDB query

The `livedb-mongo` adapter supports most MongoDB queries that you could pass to the Mongo `find()` method. See the [Mongo DB query documentation](http://docs.mongodb.org/manual/core/read-operations/#read-operations-query-document) and the [query selectors reference](http://docs.mongodb.org/manual/reference/operator/#query-selectors). Note that projections are not supported; only full documents may be returned. Also, cursor methods are not directly available, so `$orderby` should be used for sorting, and skips and limits should be specified as `$skip` and `$limit`. There is currently no `findOne()` equivalent&mdash;Use `$limit: 1` instead.

After a query is subscribed or fetched, its results can be returned directly via `query.get()`. It is also possible to to create a live-updating results set in the model via `query.ref()`.

> ### `results = `query.get` ( )`
>
> **results:** Creates and returns an array of each of the document objects matching the query

> ### `scoped = `query.ref` ( path )`
>
> **path:** Local path at which to create an updating refList of the queries results
>
> **scoped:** Returns a model scoped to the path at which results are output

### Subscriptions

The `subscribe`, `fetch`, `unsubscribe`, and `unfetch` methods are used to load and unload data from a model. These methods don't return data directly. Rather, they load the data into the model. The data are then accessed via model getter methods.

`subscribe` and `fetch` both return data initially, but subscribe also registers with PubSub on the server to receive ongoing updates as the data change.

> ### model.subscribe` ( items..., callback(err) )`
> ### model.fetch` ( items..., callback(err) )`
> ### model.unsubscribe` ( items..., callback(err) )`
> ### model.unfetch` ( items..., callback(err) )`
>
> **items:** Accepts one or more subscribable items, including a path, scoped model, or query
>
> **callback:** Calls back once all of the data for each query and document has been loaded or when an error is encountered

Avoid subscribing or fetching queries by document id like `model.query('users', {_id: xxx})`. You can achieve the same result passing `'users.xxx'` or `model.at('users.xxx')` to subscribe or fetch, and it is much more efficient.

If you only have one argument in your call to subscribe or fetch, you can also call `subscribe`, `fetch`, `unsubscribe`, and `unfetch` on the query or scoped model directly.

{% highlight javascript %}{% raw %}
var user = model.at('users.' + userId);
user.subscribe(function(err) {
  if (err) return next(err);
  var todosQuery = model.query('todos', {creatorId: userId});
  todosQuery.subscribe(function(err) {
    if (err) return next(err);
    model.ref('_page.user', user);
    todosQuery.ref('_page.todosList');
    page.render();
  });
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
user = model.at 'users.' + userId
user.subscribe (err) ->
  return next err if err
  todosQuery = model.query 'todos', {creatorId: userId}
  todosQuery.subscribe (err) ->
    return next err if err
    model.ref '_page.user', user
    todosQuery.ref '_page.todosList'
    page.render()
{% endraw %}{% endhighlight %}

Racer internally keeps track of the context in which you call subscribe or fetch, and it counts the number of times that each item is subscribed or fetched. To actually unload a document from the model, you must call the unsubscribe method the same number of times that subscribe is called and the unfetch method the same number of times that fetch is called. However, you generally don't need to worry about calling unsubscribe and unfetch manually.

Instead, the `model.unload()` method can be called to unsubscribe and unfetch from all of the subscribes and fetches performed since the last call to unload. Derby calls this method on every full page render right before entering a route. By default, the actual unsusbscribe and unfetch happens after a short delay, so if something gets resubscribed during routing, the item will never end up getting unsubscribed and it will callback immediately.

### References

References make it possible to write business logic and templates that interact with the model in a general way. They redirect model operations from a reference path to the underlying data, and they set up event listeners that emit model events on both the reference and the actual object's path.

References must be declared per model, since calling `model.ref` creates a number of event listeners in addition to setting a ref object in the model. When a reference is created or removed, a `change` model event is emitted. References are not actually stored in the model data, but they can be used from getter and setter methods as if they are.

> ### `scoped = `model.ref` ( path, to, [options] )`
>
> **path:** The location at which to create a reference. This must be underneath a [local collection](#local_and_remote_collections) (typically `_page`), since references must be declared per model
>
> **to:** The location that the reference links to. This is where the data is actually stored
>
> **options:** An options object. Supports the option `{updateIndices: true}`, which will update the ref's `to` path if it contains array indices whose parents are modified via array inserts, removes, or moves
>
> **scoped:** Returns a model scoped to the output path for convenience

> ### model.removeRef` ( path )`
>
> **path:** The location at which to remove the reference

{% highlight javascript %}{% raw %}
model.set('colors', {
  red: {hex: '#f00'}
, green: {hex: '#0f0'}
, blue: {hex: '#00f'}
});

// Getting a reference returns the referenced data
model.ref('_page.green', 'colors.green');
// Logs {hex: '#0f0'}
console.log(model.get('_page.green'));

// Setting a property of the reference path modifies
// the underlying data
model.set('_page.green.rgb', [0, 255, 0]);
// Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log(model.get('colors.green'));

// Removing the reference has no effect on the underlying data
model.removeRef('_page.green');
// Logs undefined
console.log(model.get('_page.green'));
// Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log(model.get('colors.green'));
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
model.set 'colors'
  red: {hex: '#f00'}
  green: {hex: '#0f0'}
  blue: {hex: '#00f'}

# Getting a reference returns the referenced data
model.ref '_page.green', 'colors.green'
# Logs {hex: '#0f0'}
console.log model.get('_page.green')

# Setting a property of the reference path modifies
# the underlying data
model.set '_page.green.rgb', [0, 255, 0]
# Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log model.get('colors.green')

# Removing the reference has no effect on the underlying data
model.removeRef '_page.green'
# Logs undefined
console.log model.get('_page.green')
# Logs {hex: '#0f0', rgb: [0, 255, 0]}
console.log model.get('colors.green')
{% endraw %}{% endhighlight %}

Racer also supports a special reference type created via `model.refList`. This type of reference is useful when a number of objects need to be rendered or manipulated as a list even though they are stored as properties of another object. This is also type of reference created by a query. A reference list supports the same mutator methods as an array, so it can be bound in a view template just like an array.

> ### `scoped = `model.refList` ( path, collection, ids, [options] )`
>
> **path:** The location at which to create a reference list. This must be underneath a [local collection](#local_and_remote_collections) (typically `_page`), since references must be declared per model
>
> **collection:** The path of an object that has properties to be mapped onto an array. Each property must be an object with a unique `id` property of the same value
>
> **ids:** A path whose value is an array of ids that map the `collection` object's properties to a given order
>
> **options:** An options object. Supports the option `{deleteRemoved: true}`, which will delete objects from the `collection` path if the corresponding item is removed from the refList's output path
>
> **scoped:** Returns a model scoped to the output path for convenience

> ### model.removeRefList` ( path )`
>
> **path:** The location at which to remove the reference

Note that if objects are inserted into a refList without an `id` property, a unique id from [`model.id()`](#guids) will be automatically added to the object.

{% highlight javascript %}{% raw %}
// refLists should consist of objects with an id matching
// their property on their parent
model.setEach('colors', {
  red: {hex: '#f00', id: 'red'},
  green: {hex: '#0f0', id: 'green'},
  blue: {hex: '#00f', id: 'blue'}
});
model.set('_page.colorIds', ['blue', 'red']);
model.refList('_page.myColors', 'colors', '_page.colorIds');

model.push('_page.myColors', {hex: '#ff0', id: 'yellow'});

// Logs: [
//   {hex: '#00f', id: 'blue'},
//   {hex: '#f00', id: 'red'},
//   {hex: '#ff0', id: 'yellow'}
// ]
console.log(model.get('_page.myColors'));
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
# refLists should consist of objects with an id matching
# their property on their parent
model.setEach 'colors',
  red: {hex: '#f00', id: 'red'}
  green: {hex: '#0f0', id: 'green'}
  blue: {hex: '#00f', id: 'blue'}
model.set '_page.colorIds', ['blue', 'red']
model.refList '_page.myColors', 'colors', '_page.colorIds'

model.push '_page.myColors', {hex: '#ff0', id: 'yellow'}

# Logs: [
#   {hex: '#00f', id: 'blue'},
#   {hex: '#f00', id: 'red'},
#   {hex: '#ff0', id: 'yellow'}
# ]
console.log model.get('_page.myColors')
{% endraw %}{% endhighlight %}

When a collection is cleaned up by `model.destroy()`, the `model.removeAllRefs()` method is invoked to remove all refs and refLists underneath the collection.

> ### model.removeAllRefs` ( from )`
>
> **from:** Path underneath which to remove all refs and refLists

It isn't neccessary to manually dereference model paths, but for debugging, testing, or special cases there is a `model.dereference()` method.

> ### `resolved = `model.dereference` ( from )`
>
> **from:** Path to dereference
>
> **resolved:** Returns the fully dereferenced path, possibly passing through multiple refs or refLists. Will return the input path if no references are found

### Getters and setters

Model mutator methods are applied optimistically. This means that changes are reflected immediately, but they may ultimately fail or be transformed to something else after being sent to the server. All model mutator methods are synchronous and provide an optional callback.

#### Basic methods

These methods can be used on any model path to get, set, or delete an object.

Models allow getting and setting to nested undefined paths. Getting such a path returns `undefined`. Setting such a path first sets each undefined or null parent to an empty object or empty array. Whether or not an implied parent is a created as an object or array is determined by whether the path segment is a number.

{% highlight javascript %}{% raw %}
var model = store.createModel();
model.set('cars.DeLorean.DMC12.color', 'silver');
// Logs: { cars: { DeLorean: { DMC12: { color: 'silver' }}}}
console.log(model.get());
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
model = store.createModel()
model.set 'cars.DeLorean.DMC12.color', 'silver'
# Logs: { cars: { DeLorean: { DMC12: { color: 'silver' }}}}
console.log model.get()
{% endraw %}{% endhighlight %}

> ### `value = `model.get` ( [path] )`
>
> **path:** *(optional)* Path of object to get. Not supplying a path will return all data in the model
>
> **value:** Current value of the object at the given path. Note that objects are returned by reference and should not be modified directly

All model mutators have an optional callback with an error argument `callback(err)`.

> ### `previous = `model.set` ( path, value, [callback] )`
>
> **path:** Model path to set
>
> **value:** Value to assign
>
> **previous:** Returns the value that was set at the path previously
>
> **callback:** *(optional)* Invoked upon completion of a successful or failed operation

> ### `obj = `model.del` ( path, [callback] )`
>
> **path:** Model path of object to delete
>
> **obj:** Returns the deleted object

> ### `obj = `model.setNull` ( path, value, [callback] )`
>
> **path:** Model path to set
>
> **value:** Value to assign only if the path is null or undefined
>
> **obj:** Returns the object at the path if it is not null or undefined. Otherwise, returns the new value

> ### model.setEach` ( path, object, [callback] )`
>
> **path:** Model path underneath which each property will be set
>
> **object:** An object whose properties are each set individually

> ### model.setDiff` ( path, value, [options], [callback] )`
>
> **path:** Model path to set
>
> **value:** Value, which will be deep traversed, setting each property that is different or performing array methods to make the values the same. Will do nothing if the values are equal already. May end up performing zero or many mutations
>
> **options:** An `equal` property may be passed to specify a custom equality function

> ### `num = `model.increment` ( path, [byNum], [callback] )`
>
> **path:** Model path to set
>
> **byNum:** *(optional)* Number specifying amount to increment or decrement if negative. Defaults to 1
>
> **num:** Returns the new value that was set after incrementing

> ### `id = `model.add` ( path, object, [callback] )`
>
> **path:** Model path to set
>
> **object:** A document to add. If the document has an `id` property, it will be set at that value underneath the path. Otherwise, an id from `model.id()` will be set on the object first
>
> **id:** Returns `object.id`

#### Array methods

Array methods can only be used on paths set to arrays, null, or undefined. If the path is null or undefined, the path will first be set to an empty array before applying the method.

> ### `length = `model.push` ( path, value, [callback] )`
>
> **path:** Model path to an array
>
> **value:** An item to add to the *end* of the array
>
> **length:** Returns the length of the array with the new item added

> ### `length = `model.unshift` ( path, value, [callback] )`
>
> **path:** Model path to an array
>
> **value:** An item to add to the *beginning* of the array
>
> **length:** Returns the length of the array with the new item added

> ### `length = `model.insert` ( path, index, values, [callback] )`
>
> **path:** Model path to an array
>
> **index:** Index at which to start inserting. This can also be specified by appending it to the path instead of as a separate argument
>
> **values:** An array of items to insert at the index
>
> **length:** Returns the length of the array with the new items added

> ### `item = `model.pop` ( path, [callback] )`
>
> **path:** Model path to an array
>
> **item:** Removes the last item in the array and returns it

> ### `item = `model.shift` ( path, [callback] )`
>
> **path:** Model path to an array
>
> **item:** Removes the first item in the array and returns it

> ### `removed = `model.remove` ( path, index, [howMany], [callback] )`
>
> **path:** Model path to an array
>
> **index:** Index at which to start removing items
>
> **howMany:** *(optional)* Number of items to remove. Defaults to 1
>
> **removed:** Returns an array of removed items

> ### `moved = `model.move` ( path, from, to, [howMany], [callback] )`
>
> **path:** Model path to an array
>
> **from:** Starting index of the item to move
>
> **to:** New index where the item should be moved
>
> **howMany:** *(optional)* Number of items to move. Defaults to 1
>
> **moved:** Returns an arry of items that were moved

#### String methods

String methods can only be used on paths set to strings, null, or undefined. If the path is null or undefined, the path will first be set to an empty string before applying the method.

The string methods support collaborative text editing, and Derby uses string methods to bind changes to all text inputs and textareas by default.

> ### model.stringInsert` ( path, index, text, [callback] )`
>
> **path:** Model path to a string
>
> **index:** Character index within the string at which to insert
>
> **text:** String to insert

> ### model.stringRemove` ( path, index, howMany, [callback] )`
>
> **path:** Model path to a string
>
> **index:** Starting character index of the string at which to remove
>
> **howMany:** Number of characters to remove

### Events

Models inherit from the standard [Node.js EventEmitter](http://nodejs.org/docs/latest/api/events.html), and they support the same methods: `on`, `once`, `removeListener`, `emit`, etc.

#### Model mutator events

Racer emits events whenever it mutates data via `model.set`, `model.push`, etc. It also emits events when data is remotely updated via a subscription. These events provide an entry point for an app to react to a specific data mutation or pattern of data mutations. The events might not be exactly the same as the methods that created them, since they can be transformed via OT.

`model.on` and `model.once` accept a second argument for these types of events. The second argument is a path pattern that will filter emitted events, calling the handler function only when a mutator matches the pattern. Path patterns support a single segment wildcard (`*`) anywhere in a path, and a multi-segment wildcard (`**`) at the end of the path. The multi-segment wildcard alone (`'**'`) matches all paths.

> ### `listener = `model.on` ( method, path, eventCallback )`
>
> **method:** Name of the mutator method: `'change'`, `'insert'`, `'remove'`, `'move'`, `'stringInsert'`, `'stringRemove'`, `'load'`, `'unload'`, or `'all'`
>
> **path:** Pattern matching the path being mutated. For example: `'_page.user'`, `'users.*.name'`, `'users.*'`, `'users.**'`, `'users**'`, or `'**'`
>
> **eventCallback:** Function to call when a matching method and path are mutated
>
> **listener:** Returns the listener function subscribed to the event emitter. This is the function that should be passed to `model.removeListener`

The event callback receives a number of arguments based on the path pattern and method. The arguments are:

> ### eventCallback` ( captures..., [event], args..., passed )`
>
> **captures:** The path segment or segments that match the wildcards in the path pattern
>
> **event:** The `'all'` event adds the emitted event name after the captures and before the args
>
> **args:** Event specific arguments. See below
>
> **passed:** An object with properties provided via `model.pass`. See description below

#### Model mutator event arguments

> ### changeEvent` ( captures..., value, previous, passed )`
>
> **value:** The current value at the path that was changed. Will be `undefined` for objects that were deleted
>
> **previous:** The previous value at the path. Will be `undefined` for paths set for the first time

> ### insertEvent` ( captures..., index, values, passed )`
>
> **index:** The index at which items were inserted
>
> **values:** An array of values that were inserted. Always an array, even if only one item was pushed, unshifted, or inserted

> ### removeEvent` ( captures..., index, removed, passed )`
>
> **value:** The current value at the path that was changed. Will be `undefined` for objects that were deleted
>
> **removed:** An array of values that were removed. Always an array, even if only one item was popped, shifted, or removed

> ### moveEvent` ( captures..., from, to, howMany, passed )`
>
> **from:** The index from which items were moved
>
> **to:** The index to which items were moved
>
> **howMany:** How many items were moved

> ### stringInsertEvent` ( captures..., index, text, passed )`
>
> **index:** The character index within the string at which text was inserted
>
> **text:** The string that was inserted

> ### stringRemoveEvent` ( captures..., index, howMany, passed )`
>
> **index:** The index within the string at which characters were removed
>
> **howMany:** How many characters were removed

> ### loadEvent` ( captures..., document, passed )`
>
> **document:** This event fires when a document is loaded via a subscription or fetch. It emits the value of the newly loaded document object

> ### unloadEvent` ( captures..., previousDocument, passed )`
>
> **previousDocument:** This event fires when a document is removed from the model via unsubscribe or unfetch. It emits the value of the document object that was unloaded

Note that `stringInsert` and `stringRemove` events are also emitted as `change` to make handling any change to a string value easier. The change event is passed a parameter of `{$original: 'stringInsert'}` or `{$original: 'stringRemove'}`, in case handling the original event and ignoring the change event is preferred.

{% highlight javascript %}{% raw %}
// Matches model.push('messages', message)
model.on('insert', 'messages', function (index, [message]) {
  ...
});

// Matches model.set('todos.4.completed', true), etc.
model.on('change', 'todos.*.completed', function (todoId, isComplete) {
  ...
});

// Matches all events
model.on('all', '**', function (path, event, args...) {
  ...
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
# Matches model.push('messages', message)
model.on 'insert', 'messages', (index, [message]) ->
  ...

# Matches model.set('todos.4.completed', true), etc.
model.on 'set', 'todos.*.completed', (todoId, isComplete) ->
  ...

# Matches all set operations
model.on 'all', '**', (path, event, args...) ->
  ...
{% endraw %}{% endhighlight %}

#### model.pass

This method can be chained before calling a mutator method to pass an argument to model event listeners. You must pass it an object with a property that identifies the name of the parameter.

This value is only passed to local listeners, and it is not sent to the server or other clients. It is typically used to identify the originator of a particular mutation so that multiple responses to the same change and infinite loops may be avoided. Such loops could occur for listeners that respond to paths that they may modify.

{% highlight javascript %}{% raw %}
// Logs:
//   'red', {}
//   'green', {message: 'hi'}

model.on('set', 'color', function (value, out, isLocal, passed) {
  console.log(value, passed);
});
model.set('color', 'red');
model.pass({message: 'hi'}).set('color', 'green');
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
# Logs:
#   'red', {}
#   'green', {message: 'hi'}

model.on 'set', 'color', (value, out, isLocal, passed) ->
  console.log value, passed
model.set 'color', 'red'
model.pass({message: 'hi'}).set 'color', 'green'
{% endraw %}{% endhighlight %}

### Filters and sorts

Filters create a live-updating list from items in an object or another list. They provide an interface similar to the array.filter and array.sort methods of Javascript, but the results automatically update as the input items change.

> ### `filter = `model.filter` ( inputPath, [name] )`
>
> **inputPath:** A path pointing to an object or array. The path's values will be retrieved from the model via `model.get()`, and then each item will be checked against the filter function
>
> **name:** *(optional)* The name of the function defined via `model.fn()`. May instead be a function itself. The function should have the arguments `function(item, key, object)` for collections and objects, and `function(item, index, array)` for arrays. Like functions for [array.filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter), the function should return true for values that match the filter

If `model.filter` is called without a filter function, it will create a list out of all items in the input object. This can be handy as a way to render all subscribed items in a collection, since only arrays can be used as an input to `{#each}` template tags.

> ### `filter = `model.sort` ( inputPath, [name] )`
>
> **inputPath:** A path pointing to an object or array. The path's values will be retrieved from the model via `model.get()`, and then each item will be checked against the filter function
>
> **name:** *(optional)* The name of the function defined via `model.fn()`. May instead be a function itself. The function should should be a compare function with the arguments `function(a, b)`. It should return the same values as compare functions for [array.sort](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort)

There are two default named functions defined for sorting, `asc` and `desc`. If sort is called without a function name, it defaults to using the `asc` function. These functions compare each item with Javascript's less than and greater than operators. See MDN for more info on [sorting non-ASCII characters](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#Sorting_non-ASCII_characters).

You define functions to be used in `model.filter` and `model.sort` via [`model.fn`](#modelfn). See the next section for more info.

A filter may have both a filter function and a sort function by chaining the two calls:

{% highlight javascript %}{% raw %}
app.on('model', function(model) {
  model.fn('expensiveItem', function(item) {
    return item.price > 100;
  });
  model.fn('priceSort', function(a, b) {
    return b.price - a.price;
  });
});

app.get('/expensive-pants', function(page, model, params, next) {
  model.subscribe('pants', function(err) {
    if (err) return next(err);
    var filter = model.filter('pants', 'expensiveItem')
      .sort('priceSort');
    filter.ref '_page.expensivePants';
    page.render('pants');
  });
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
app.on 'model', (model) ->
  model.fn 'expensiveItem', (item) -> item.price > 100
  model.fn 'priceSort', (a, b) -> b.price - a.price

app.get '/expensive-pants', (page, model, params, next) ->
  model.subscribe 'pants', (err) ->
    return next err if err
    filter = model.filter('pants', 'expensiveItem').sort 'priceSort'
    filter.ref '_page.expensivePants'
    page.render 'pants'
{% endraw %}{% endhighlight %}

The output of a filter is typically used by creating a reference from it. This sets the data in the model and keeps it updated.

> ### `scoped = `filter.ref` ( path )`
>
> **path:** The path at which to create a refList of the filter's output
>
> **scoped:** Returns a model scoped to the output path of the ref

The filter's value can also be retrieved directly via `filter.get()`.

> ### `results = `filter.get` ( )`
>
> **results:** Returns an array of results matching the filter

### Reactive functions

Reactive functions provide a simple way to update a computed value whenever one or more objects change. While model events respond to specific model methods and path patterns, reactive functions will be re-evaluated whenever any of thier inputs or nested properties change in any way.

They are defined similar to view helper functions, but instead of being used from templates, their outputs are set in the model.

> ### model.fn` ( name, fns )`
>
> **name:** A name that uniquely identifies the function
>
> **fns:** A getter function or an object with the form `{get: function(), set: function()}`

Reactive functions may be run any number of times, so they should be [pure functions](http://en.wikipedia.org/wiki/Pure_function). In other words, they should always return the same results given the same input arguments, and they should be side effect free. By default, the inputs to the function are retrieved directly from the model, so be sure not to modify any object or array input arguments. For example, slice an array input before you sort it. The output of the model function is deep cloned by default.

{% highlight javascript %}{% raw %}
// Model functions created with just a function act as getters only.
// These functions update the output path when any input changes
model.fn('expensiveItems', function(items) {
  return items && items.filter(function(item) {
    return item.price > 100;
  });
});

// It is also possible to define both a getter and a setter function
// if the input values may be computed from setting the output
model.fn('fullName', {
  // The getter function gets the current value of each of the input
  // arguments when any input might have changed
  get: function(firstName, lastName) {
    return firstName + ' ' + lastName;
  },
  // The setter function is called with the value that was set at
  // the output path as well as the current value of the inputs.
  // It should return an array or object where each property is an
  // index that corresponds to each input argument that should be set.
  // If the function returns null, no items will be set.
  set: function(value, firstName, lastName) {
    return value && value.split(' ');
  }
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
# Model functions created with just a function act as getters only.
# These functions update the output path when any input changes
model.fn 'expensiveItems', (items) ->
  item for item in items when item.price > 100

# It is also possible to define both a getter and a setter function
# if the input values may be computed from setting the output
model.fn 'fullName', ->
  # The getter function gets the current value of each of the input
  # arguments when any input might have changed
  get: (firstName, lastName) ->
    firstName + ' ' + lastName
  # The setter function is called with the value that was set at
  # the output path as well as the current value of the inputs.
  # It should return an array or object where each property is an
  # index that corresponds to each input argument that should be set.
  # If the function returns null, no items will be set.
  set: (value, firstName, lastName) ->
    value?.split(' ')
{% endraw %}{% endhighlight %}

To execute a model function, you then call `model.evaluate()` or `model.start()`. Evaluate runs a function once and returns the result, and start sets up event listeners that continually re-evaluate the function whenever any of its input or output paths are changed.

> ### `value = `model.evaluate` ( name, inputPaths..., [options] )`
>
> **name:** The name of the function defined via `model.fn()`. May instead be a function itself
>
> **inputPaths:** One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs
>
> **options:** An options object. Supports the option `{copy: 'none'}`, `{copy: 'input'}`, or `{copy: 'output'}`. Defaults to `{copy: 'output'}`, which does a deep copy of the output object before it is set. This has no effect in evalutate, since it doesn't set the output in the model
>
> **value:** Returns the value computed by the function

> ### `value = `model.start` ( name, path, inputPaths..., [options] )`
>
> **name:** The name of the function defined via `model.fn()`. May instead be a function itself
>
> **path:** The output path at which to set the value and keep it updated as input paths change. Can also be set if the model function defines a `set` method as well
>
> **inputPaths:** One or more paths whose values will be retrieved from the model via `model.get()` and passed to the function as inputs. May also be set if the model function defines a `set` method
>
> **options:** An options object. Supports the option `{copy: 'none'}`, `{copy: 'input'}`, or `{copy: 'output'}`. Defaults to `{copy: 'output'}`, which does a deep copy of the output object before it is set
>
> **value:** Returns the initial value computed by the function

> ### model.stop` ( path )`
>
> **path:** The path at which the output should no longer update. Note that the value is not deleted; it is just no longer updated

Reactive functions started on the server are reinitialized when the page loads. In order to add functions for use in routes as well as in the client, use the `'model'` event emitted by apps, which occurs right before an app route is called on the server and once immediately upon initialization in the client. Then you can safely start them in the appropriate route, and they will be re-established automatically on the client.

{% highlight javascript %}{% raw %}
app.on('model', function(model) {
  // Sort the players by score and return the top X players. The
  // function will automatically update the value of '_page.leaders'
  // as players are added and removed, their scores change, and the
  // cutoff value changes.
  model.fn('topPlayers', function(players, cutoff) {
    // Note that the input array is copied with slice before sorting
    // it. The function should not modify the values of its inputs.
    return players.slice().sort(function (a, b) {
      return a.score - b.score;
    }).slice(0, cutoff - 1);
  });
});

app.get('/leaderboard/:gameId', function(page, model, params, next) {
  var game = model.at('game.' + params.gameId);
  game.subscribe(function(err) {
    if (err) return next(err);
    game.setNull('players', [
      {name: 'John', score: 4000},
      {name: 'Bill', score: 600},
      {name: 'Kim', score: 9000},
      {name: 'Megan', score: 3000},
      {name: 'Sam', score: 2000}
    ]);
    model.set('_page.cutoff', 3);
    model.start(
      // Name of the function
      'topPlayers',
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff'
    );
    page.render();
  });
});
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
app.on 'model', (model) ->
  # Sort the players by score and return the top X players. The
  # function will automatically update the value of '_page.leaders' as
  # players are added and removed, their scores change, and the
  # cutoff value changes.
  model.fn 'topPlayers', (players, cutoff) ->
    # Note that the input array is copied with slice before sorting
    # it. The function should not modify the values of its inputs.
    players.slice()
      .sort((a, b) -> a.score - b.score)
      .slice(0, cutoff - 1)

app.get '/leaderboard/:gameId', (page, model, params, next) ->
  game = model.at 'game.' + params.gameId
  game.subscribe function(err) ->
    return next err if err
    game.setNull 'players', [
      {name: 'John', score: 4000}
      {name: 'Bill', score: 600}
      {name: 'Kim', score: 9000}
      {name: 'Megan', score: 3000}
      {name: 'Sam', score: 2000}
    ]
    model.set '_page.cutoff', 3
    model.start(
      // Name of the function
      'topPlayers',
      // Output path
      '_page.topPlayers',
      // Input paths
      game.at('players'),
      '_page.cutoff'
    )
    page.render()
{% endraw %}{% endhighlight %}

If a function is passed directly to `model.start()` instead of a function name, it will need to be manually re-initialized on the client. This is usually the best way to define reactive functions inside of component scripts, since thier init method is called both during server and client rendering.

{% highlight javascript %}{% raw %}
// The init method of a component script
exports.init = function(model) {
  function sum(x, y) {
    return x + y;
  }
  model.start(sum, 'total', 'first', 'second');
};
{% endraw %}{% endhighlight %}
{% highlight coffeescript %}{% raw %}
// The init method of a component script
exports.init = (model) ->
  sum = (x, y) -> x + y
  model.start sum, 'total', 'first', 'second'
{% endraw %}{% endhighlight %}
