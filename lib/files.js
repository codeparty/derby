/*
 * files.js
 * loads templates, configurations and other files from disk
 *
 */ 

var fs = require('fs');
var path = require('path');
var less = require('less');
var nib = require('nib');
var stylus = require('stylus');
var util = require('racer').util;
var htmlUtil = require('html-util');

exports.importFileSync = importFileSync;
exports.loadViewsSync = loadViewsSync;
exports.loadStylesSync = loadStylesSync;
exports.cssCompiler = cssCompiler;
exports.lessCompiler = lessCompiler;
exports.stylusCompiler = stylusCompiler;

function FileData(filename) {
  this.file = fs.readFileSync(filename, 'utf8');
  this.filename = filename;
}

function importFileSync(filename, extension) {
  filename = path.join(filename);
  if (fs.existsSync(filename)) {
    var stats = fs.statSync(filename);
    if (stats.isDirectory()) {
      filename += '/index' + extension;
    } else {
      return new FileData(filename);
    }
  } else {
    filename += extension;
  }
  if (fs.existsSync(filename)) {
    return new FileData(filename);
  }
}

function loadViewsSync(sourceFilename, namespace) {
  var views = [];
  var files = [];
  var data = importFileSync(sourceFilename, '.html');
  if (!data) {
    throw new Error('View template file not found: ' + sourceFilename);
  }
  var parsed = parseViews(namespace, data.file, data.filename);
  for (var i = 0, len = parsed.imports.length; i < len; i++) {
    var item = parsed.imports[i];
    var imported = loadViewsSync(item.filename, item.namespace);
    views = views.concat(imported.views);
    files = files.concat(imported.files);
  }
  return {
    views: views.concat(parsed.views)
  , files: files.concat(sourceFilename)
  };
}

function parseViews(namespace, file, filename) {
  var imports = [];
  var views = [];
  var prefix = (namespace) ? namespace + ':' : '';

  htmlUtil.parse(file + '\n', {
    // Force view tags to be treated as raw tags,
    // meaning their contents are not parsed as HTML
    rawTags: /^(?:[^\s=\/!>]+:|style|script)$/i
  , matchEnd: matchEnd
  , start: onStart
  , text: onText
  });

  function matchEnd(tagName) {
    if (tagName.slice(-1) === ':') {
      return /<\/?[^\s=\/!>]+:[\s>]/i;
    }
    return new RegExp('</' + tagName, 'i');
  }

  // These variables pass state from attributes in the start tag to the
  // following view template text
  var name, attrs;

  function onStart(tag, tagName, tagAttrs) {
    var lastChar = tagName.charAt(tagName.length - 1);
    if (lastChar !== ':') {
      var err = new Error('Expected tag ending in colon (:) instead of ' + tag);
      return group()(err);
    }
    name = tagName.slice(0, -1);
    attrs = tagAttrs;
    if (name === 'import') {
      var dir = path.dirname(filename);
      imports.push({
        filename: path.resolve(dir, attrs.src)
      , namespace: prefix + (attrs.ns || path.basename(attrs.src, '.html'))
      });
    }
  }

  function onText(text, isRawText) {
    if (!name || name === 'import') return;
    views.push({
      name: prefix + name
    , source: text
    , options: attrs
    , filename: filename
    });
  }

  return {
    imports: imports
  , views: views
  };
}

function loadStylesSync(app, sourceFilename, options) {
  options || (options = {compress: util.isProduction});
  var css = '';
  var files = [];
  app.styleExtensions.forEach(function(extension) {
    var compiler = app.compilers[extension];
    if (!compiler) {
      throw new Error('Unable to find compiler for: ' + extension);
    }
    var data = importFileSync(sourceFilename, extension);
    // Ignore if style file doesn't exist
    if (!data) return '';
    var compiled = compiler(data.file, data.filename, options);
    css += compiled.css;
    files = files.concat(compiled.files);
  });
  return {css: css, files: files};
}

function cssCompiler(file, filename, options) {
  return {css: file, files: [filename]};
}

function lessCompiler(file, filename, options) {
  var paths = (options.lessPaths || []);
  var dir = path.dirname(filename);
  if (paths.indexOf(dir) === -1) paths.unshift(dir);
  var parser = new less.Parser({
    paths: paths
  , filename: filename
  , syncImport: true
  });
  var out = {};
  parser.parse(file, function(err, tree) {
    if (err) throw err;
    out.css = tree.toCSS(options);
  });
  // TODO: Figure out how to get imported files from less
  out.files = [filename];
  return out;
}

function stylusCompiler(file, filename, options) {
  var css;
  var options = {_imports: []};
  var out = {};
  stylus(file, options)
    .use(nib())
    .set('filename', filename)
    .set('compress', options.compress)
    .set('include css', true)
    .render(function(err, value) {
      if (err) throw err;
      out.css = value;
    });
  out.files = options._imports.map(function(item) {
    return item.path;
  });
  out.files.push(filename);
  return out;
}
