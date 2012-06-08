var EventEmitter = require('events').EventEmitter
  , emit = EventEmitter.prototype.emit
  , htmlUtil = require('html-util')
  , parseHtml = htmlUtil.parse
  , trimLeading = htmlUtil.trimLeading
  , unescapeEntities = htmlUtil.unescapeEntities
  , escapeHtml = htmlUtil.escapeHtml
  , escapeAttribute = htmlUtil.escapeAttribute
  , isVoid = htmlUtil.isVoid
  , conditionalComment = htmlUtil.conditionalComment
  , lookup = require('racer/lib/path').lookup
  , markup = require('./markup')
  , viewPath = require('./viewPath')
  , wrapRemainder = viewPath.wrapRemainder
  , ctxPath = viewPath.ctxPath
  , extractPlaceholder = viewPath.extractPlaceholder
  , dataValue = viewPath.dataValue
  , pathFnArgs = viewPath.pathFnArgs
  , arraySlice = Array.prototype.slice;

module.exports = View;

function empty() {
  return '';
}

function notFound(name, ns) {
  if (ns) name = ns + ':' + name;
  throw new Error("Can't find view: " + name);
}

var defaultCtx = {
  $depth: 0
, $aliases: {}
, $paths: []
, $indices: []
};

var defaultGetFns = {
  equal: function(a, b) {
    return a === b;
  }
, not: function(value) {
    return !value;
  }
};

var defaultSetFns = {
  equal: function(value, a) {
    return value ? [a] : [];
  }
, not: function(value) {
    return [!value];
  }
};

function View(libraries, appExports) {
  this._libraries = libraries || [];
  this._appExports = appExports;
  this._inline = '';
  this.clear();
  this.getFns = Object.create(defaultGetFns);
  this.setFns = Object.create(defaultSetFns);
}

View.prototype = {
  clear: function() {
    this._views = Object.create(this.defaultViews);
    this._made = {};
    this._renders = {};
    this._idCount = 0;
  }

  // All automatically created ids start with a dollar sign
, _uniqueId: function() {
    return '$' + (this._idCount++).toString(36);
  }

, defaultViews: {
    doctype: function() {
      return '<!DOCTYPE html>';
    }
  , root: empty
  , charset: function() {
      return '<meta charset=utf-8>';
    }
  , title$s: empty
  , head: empty
  , header: empty
  , body: empty
  , footer: empty
  , scripts: empty
  , tail: empty
  }

, _selfNs: 'app'

, make: function(name, template, options, templatePath, boundMacro) {
    var view = this
      , onBind, renderer, render, matchTitle, ns, isString;
    // Cache any templates that are made so that they can be
    // re-parsed with different items bound when using macros
    this._made[name] = [template, options, templatePath];

    if (templatePath && (render = this._renders[templatePath])) {
      this._views[name] = render;
      return
    }

    name = name.toLowerCase();
    matchTitle = /(?:^|\:)title(\$s)?$/.exec(name);
    if (matchTitle) {
      isString = !!matchTitle[1];
      if (isString) {
        onBind = function(events, name) {
          var macro = false;
          return bindEvents(events, macro, name, render, ['$_doc', 'prop', 'title']);
        };
      } else {
        this.make(name + '$s', template, options, templatePath);
      }
    }

    renderer = function(ctx, model, triggerPath, triggerId) {
      renderer = parse(view, name, template, isString, onBind, boundMacro);
      return renderer(ctx, model, triggerPath, triggerId);
    }
    render = function(ctx, model, triggerPath, triggerId) {
      return renderer(ctx, model, triggerPath, triggerId);
    }

    render.nonvoid = options && 'nonvoid' in options;

    this._views[name] = render;
    if (templatePath) this._renders[templatePath] = render;
  }

, _makeAll: function(templates, instances) {
    var name, instance, options, templatePath;
    if (!instances) return;
    this.clear();
    for (name in instances) {
      instance = instances[name];
      templatePath = instance[0];
      options = instance[1];
      this.make(name, templates[templatePath], options, templatePath);
    }
  }

, _makeComponents: function(components) {
  var librariesMap = this._libraries.map
    , name, component, view;
  for (name in components) {
    component = components[name];
    view = librariesMap[name].view;
    view._makeAll(component.templates, component.instances);
  }
}

, _findItem: function(name, ns, prop) {
    var items = this[prop]
      , item, last, i, segments, testNs;
    if (ns) {
      ns = ns.toLowerCase();
      item = items[ns + ':' + name];
      if (item) return item;

      segments = ns.split(':');
      last = segments.length - 1;
      if (last > 0) {
        for (i = last; i--;) {
          testNs = segments.slice(0, i).join(':');
          item = items[testNs + ':' + name];
          if (item) return item;
        }
      }
    }
    return items[name];
  }

, _find: function(name, ns, boundMacro) {
    var hash, hashedName, out, item, template, options, templatePath;
    if (boundMacro && (hash = keyHash(boundMacro))) {
      hash = '$b:' + hash;
      hashedName = name + hash;
      out = this._findItem(hashedName, ns, '_views');
      if (out) return out;

      item = this._findItem(name, ns, '_made') || notFound(name, ns);
      template = item[0];
      options = item[1];
      templatePath = item[2] + hash;
      this.make(hashedName, template, options, templatePath, boundMacro);
      return this._find(hashedName, ns);
    }
    return this._findItem(name, ns, '_views') || notFound(name, ns);
  }

, get: function(name, ns, ctx) {
    if (typeof ns === 'object') {
      ctx = ns;
      ns = '';
    }
    ctx = ctx ? extend(ctx, defaultCtx) : Object.create(defaultCtx);
    ctx.$fnCtx = [this._appExports];
    return this._find(name, ns)(ctx);
  }

, inline: empty

, fn: function(name, fn) {
    var get, set;
    if (typeof fn === 'object') {
      get = fn.get;
      set = fn.set;
    } else {
      get = fn;
    }
    this.getFns[name] = get;
    if (set) this.setFns[name] = set;
  }

, render: function(model, ns, ctx, silent) {
    if (typeof ns === 'object') {
      silent = ctx;
      ctx = ns;
      ns = '';
    }
    this.model = model;
    this._idCount = 0;
    this.model.__pathMap.clear();
    this.model.__events.clear();
    this.model.__blockPaths = {};
    this.model.del('_$component');
    this.dom.clear();

    var title = this.get('title$s', ns, ctx)
      , rootHtml = this.get('root', ns, ctx)
      , bodyHtml = this.get('header', ns, ctx) +
          this.get('body', ns, ctx) +
          this.get('footer', ns, ctx);
    //if (silent) return;

    var doc = document
      , documentElement = doc.documentElement
      , attrs = documentElement.attributes
      , i, attr, fakeRoot, body;

    // Remove all current attributes on the documentElement and replace
    // them with the attributes in the rendered rootHtml
    for (i = attrs.length; i--;) {
      attr = attrs[i];
      documentElement.removeAttribute(attr.name);
    }
    // Using the DOM to get the attributes on an <html> tag would require
    // some sort of iframe hack until DOMParser has better browser support.
    // String parsing the html should be simpler and more efficient
    parseHtml(rootHtml, {
      start: function(tag, tagName, attrs) {
        if (tagName !== 'html') return;
        for (var attr in attrs) {
          documentElement.setAttribute(attr, attrs[attr]);
        }
      }
    });

    fakeRoot = doc.createElement('html');
    fakeRoot.innerHTML = bodyHtml;
    body = fakeRoot.getElementsByTagName('body')[0];
    documentElement.replaceChild(body, doc.body);
    doc.title = title;
  }

, escapeHtml: escapeHtml
, escapeAttribute: escapeAttribute
}

function keyHash(obj) {
  var keys = []
    , key;
  for (key in obj) {
    keys.push(key);
  }
  return keys.sort().join(',');
}

function extend(parent, obj) {
  var out = Object.create(parent)
    , key;
  if (typeof obj !== 'object' || Array.isArray(obj)) {
    return out;
  }
  for (key in obj) {
    out[key] = obj[key];
  }
  return out;
}

function modelListener(params, triggerId, blockPaths, pathId, partial, ctx) {
  var listener = typeof params === 'function'
    ? params(triggerId, blockPaths, pathId)
    : params;
  listener.partial = partial;
  listener.ctx = ctx.$stringCtx || ctx;
  return listener;
}

function bindEvents(events, macro, name, partial, params) {
  if (~name.indexOf('(')) {
    var args = pathFnArgs(name);
    if (!args.length) return;
    events.push(function(ctx, modelEvents, dom, pathMap, view, blockPaths, triggerId) {
      var listener = modelListener(params, triggerId, blockPaths, null, partial, ctx)
        , path, pathId, i;
      listener.getValue = function(model, triggerPath) {
        patchCtx(ctx, triggerPath);
        return dataValue(view, ctx, model, name, macro);
      }
      for (i = args.length; i--;) {
        path = ctxPath(ctx, args[i], macro);
        pathId = pathMap.id(path + '*');

        modelEvents.ids[path] = listener[0];
        modelEvents.bind(pathId, listener);
      }
    });
    return;
  }

  var match = /(\.*)(.*)/.exec(name)
    , prefix = match[1] || ''
    , relativeName = match[2] || ''
    , segments = relativeName.split('.')
    , bindName, i;
  for (i = segments.length; i; i--) {
    bindName = prefix + segments.slice(0, i).join('.');
    (function(bindName) {
      events.push(function(ctx, modelEvents, dom, pathMap, view, blockPaths, triggerId) {
        var path = ctxPath(ctx, name, macro)
          , listener, pathId;
        if (!path) return;
        pathId = pathMap.id(path);
        listener = modelListener(params, triggerId, blockPaths, pathId, partial, ctx);
        if (name !== bindName) {
          path = ctxPath(ctx, bindName, macro);
          pathId = pathMap.id(path);
          listener.getValue = function(model, triggerPath) {
            patchCtx(ctx, triggerPath);
            return dataValue(view, ctx, model, name, macro);
          };
        }

        modelEvents.ids[path] = listener[0];
        modelEvents.bind(pathId, listener);
      });
    })(bindName);
  }
}

function bindEventsById(events, macro, name, partial, attrs, method, prop, isBlock) {
  function params(triggerId, blockPaths, pathId) {
    var id = attrs._id || attrs.id;
    if (isBlock && pathId) blockPaths[id] = pathId;
    return [id, method, prop];
  }
  bindEvents(events, macro, name, partial, params);
}

function bindEventsByIdString(events, macro, name, partial, attrs, method, prop) {
  function params(triggerId) {
    var id = triggerId || attrs._id || attrs.id;
    return [id, method, prop];
  }
  bindEvents(events, macro, name, partial, params);
}

function addId(view, attrs) {
  if (attrs.id == null) {
    attrs.id = function() {
      return attrs._id = view._uniqueId();
    };
  }
}

function pushValue(html, i, value, isAttr, isId) {
  if (typeof value === 'function') {
    var fn = isId ? function(ctx, model) {
      var id = value(ctx, model);
      html.ids[id] = i + 1;
      return id;
    } : value;
    i = html.push(fn, '') - 1;
  } else {
    if (isId) html.ids[value] = i + 1;
    html[i] += isAttr ? escapeAttribute(value) : value;
  }
  return i;
}

function reduceStack(stack) {
  var html = ['']
    , i = 0
    , attrs, bool, item, key, value, j, len;

  html.ids = {};

  for (j = 0, len = stack.length; j < len; j++) {
    item = stack[j];
    switch (item[0]) {
      case 'start':
        html[i] += '<' + item[1];
        attrs = item[2];
        // Make sure that the id attribute is rendered first
        if ('id' in attrs) {
          html[i] += ' id=';
          i = pushValue(html, i, attrs.id, true, true);
        }
        for (key in attrs) {
          if (key === 'id') continue;
          value = attrs[key];
          if (value != null) {
            if (bool = value.bool) {
              i = pushValue(html, i, bool);
              continue;
            }
            html[i] += ' ' + key + '=';
            i = pushValue(html, i, value, true);
          } else {
            html[i] += ' ' + key;
          }
        }
        html[i] += '>';
        break;
      case 'text':
        i = pushValue(html, i, item[1]);
        break;
      case 'end':
        html[i] += '</' + item[1] + '>';
        break;
      case 'marker':
        html[i] += '<!--' + item[1];
        i = pushValue(html, i, item[2].id, false, !item[1]);
        html[i] += '-->';
    }
  }
  return html;
}

function patchCtx(ctx, triggerPath) {
  var path = ctx.$paths[0];
  if (!(triggerPath && path)) return;

  var segments = path.split('.')
    , triggerSegments = triggerPath.replace(/\*$/, '').split('.')
    , indices = ctx.$indices.slice()
    , index = indices.length
    , i, len, segment, triggerSegment, n;
  for (i = 0, len = segments.length; i < len; i++) {
    segment = segments[i];
    triggerSegment = triggerSegments[i];
    // `(n = +triggerSegment) === n` will be false only if segment is NaN
    if (segment === '$#' && (n = +triggerSegment) === n) {
      indices[--index] = n;
    } else if (segment !== triggerSegment) {
      break;
    }
  }
  ctx.$indices = indices;
}

function renderer(view, items, events, onRender) {
  return function(ctx, model, triggerPath, triggerId) {
    patchCtx(ctx, triggerPath);

    if (!model) model = view.model;  // Needed, since model parameter is optional
    var pathMap = model.__pathMap
      , modelEvents = model.__events
      , blockPaths = model.__blockPaths
      , idIndices = items.ids
      , dom = view.dom
      , html = []
      , mutated = []
      , onMutator, i, len, item, event, pathIds, id, index;

    if (onRender) ctx = onRender(ctx);

    onMutator = model.on('mutator', function(method, triggerPath) {
      mutated.push(triggerPath)
    });

    for (i = 0, len = items.length; i < len; i++) {
      item = items[i];
      html[i] = (typeof item === 'function') ? item(ctx, model) || '' : item;
    }

    model.removeListener('mutator', onMutator)
    pathIds = modelEvents.ids = {}

    for (i = 0; event = events[i++];) {
      event(ctx, modelEvents, dom, pathMap, view, blockPaths, triggerId);
    }

    // This detects when an already rendered bound value was later updated
    // while rendering the rest of the template. This can happen when performing
    // component initialization code.
    // TODO: This requires creating a whole bunch of extra objects every time
    // things are rendered. Should probably be refactored in a less hacky manner.
    for (i = 0, len = mutated.length; i < len; i++) {
      (id = pathIds[mutated[i]]) &&
      (index = idIndices[id]) &&
      (html[index] = items[index](ctx, model) || '')
    }

    return html.join('');
  }
}

function Component(type, model, view, init, create) {
  this.type = type;
  this.model = model;
  this.view = view;
  this.init = init;
  this.create = create;
}
Component.prototype = Object.create(EventEmitter.prototype);

Component.prototype.emitCancellable = function() {
  var cancelled = false
    , args = arraySlice.call(arguments)

  function cancel() {
    cancelled = true;
  }

  args.push(cancel);
  emit.apply(this, args);
  return cancelled;
};

function createComponent(view, model, ns, name, scope, ctx, macroCtx, boundMacro) {
  var library = view._libraries.map[ns]
    , script = library && library.scripts[name]
  
  if (!script) return false;

  var init = script.init
    , create = script.create
    , scoped = model.at(scope)
    , prefix = scope + '.'
    , type = ns + ':' + name
    , component = new Component(type, scoped, library.view, init, create)
    , parentFnCtx = model.__fnCtx || ctx.$fnCtx
    , fnCtx, i, key, path, value, instanceName, parent;

  ctx.$fnCtx = model.__fnCtx = parentFnCtx.concat(component);

  for (key in macroCtx) {
    value = macroCtx[key];
    if (path = value && value.$macroVar) {
      path = ctxPath(ctx, path);
      model.ref(prefix + key, path, null, true);
      continue;
    }
    if (typeof value === 'function') value = value(ctx, model);
    model.set(prefix + key, value);
  }

  instanceName = scoped.get('name');

  if (init) component.init(scoped);

  parent = true;
  for (i = parentFnCtx.length; fnCtx = parentFnCtx[--i];) {
    if (parent) {
      parent = false;
      fnCtx.emit('init:child', component);
    }
    fnCtx.emit('init:descendant', component);
    if (instanceName) {
      fnCtx.emit('init:' + instanceName, component);
    }
  }

  if (view.isServer) return true;

  setTimeout(function() {
    var parent = true;
    for (i = parentFnCtx.length; fnCtx = parentFnCtx[--i];) {
      if (parent) {
        parent = false;
        fnCtx.emit('create:child', component);
      }
      fnCtx.emit('create:descendant', component);
      if (instanceName) {
        fnCtx.emit('create:' + instanceName, component);
      }
    }
  }, 0);

  if (!create) return true;

  // TODO: This should probably be replaced by events on compoments
  // and apps instead of the model
  var eventPrefix = (macroCtx['name'] || (ns + ':' + name)) + ':'
    , dom = view.dom.componentDom()
    , cancelled;

  dom.element = function(name) {
    var id = ctx.$elements[name];
    return document.getElementById(id);
  };

  component.dom = dom;

  setTimeout(function() {
    component.create(scoped, dom);
  }, 0);

  return true;
}

function extendCtx(ctx, value, name, alias, index, isArray) {
  var path = ctxPath(ctx, name, null, true)
    , aliases;
  ctx = extend(ctx, value);
  ctx["this"] = value;
  if (alias) {
    aliases = ctx.$aliases = Object.create(ctx.$aliases);
    aliases[alias] = ctx.$depth;
  }
  if (path) ctx.$paths = [path].concat(ctx.$paths);
  if (name) ctx.$depth++;
  if (index != null) {
    ctx.$indices = [index].concat(ctx.$indices);
    isArray = true;
  }
  if (isArray && ctx.$paths[0]) {
    ctx.$paths[0] += '.$#';
  }
  return ctx;
}

function partialValue(view, ctx, model, name, value, listener, macro) {
  if (listener) return value;
  return name ? dataValue(view, ctx, model, name, macro) : true;
}

function partialFn(view, name, type, alias, render, macroCtx, macro, boundMacro) {
  function conditionalRender(ctx, model, triggerPath, value, index, condition) {
    if (condition) {
      var renderCtx = extendCtx(ctx, value, name, alias, index);
      return render(renderCtx, model, triggerPath);
    }
    return '';
  }

  function withFn(ctx, model, triggerPath, triggerId, value, index, listener) {
    value = partialValue(view, ctx, model, name, value, listener, macro);
    return conditionalRender(ctx, model, triggerPath, value, index, true);
  }

  if (type === 'partial') {
    return function(ctx, model, triggerPath, triggerId, value, index, listener) {
      var parentMacroCtx = ctx.$macroCtx
        , renderCtx, scope, out, hasScope;
      if (alias) {
        scope = '_$component.' + model.id();
        renderCtx = extendCtx(ctx, null, scope, alias);
        hasScope = createComponent(view, model, name[0], name[1], scope, renderCtx, macroCtx, boundMacro);
      } else {
        renderCtx = Object.create(ctx);
      }
      renderCtx.$macroCtx = parentMacroCtx ? extend(parentMacroCtx, macroCtx) : macroCtx;

      out = render(renderCtx, model, triggerPath);
      if (hasScope) model.__fnCtx = model.__fnCtx.slice(0, -1);
      return out;
    }
  }

  if (type === 'with' || type === 'else') {
    return withFn;
  }

  if (type === 'if' || type === 'else if') {
    return function(ctx, model, triggerPath, triggerId, value, index, listener) {
      value = partialValue(view, ctx, model, name, value, listener, macro);
      var condition = !!(Array.isArray(value) ? value.length : value);
      return conditionalRender(ctx, model, triggerPath, value, index, condition);
    }
  }

  if (type === 'unless') {
    return function(ctx, model, triggerPath, triggerId, value, index, listener) {
      value = partialValue(view, ctx, model, name, value, listener, macro);
      var condition = !(Array.isArray(value) ? value.length : value);
      return conditionalRender(ctx, model, triggerPath, value, index, condition);
    }
  }

  if (type === 'each') {
    return function(ctx, model, triggerPath, triggerId, value, index, listener) {
      var indices, isArray, item, out, renderCtx, i, len;
      value = partialValue(view, ctx, model, name, value, listener, macro);
      isArray = Array.isArray(value);

      if (listener && !isArray) {
        return withFn(ctx, model, triggerPath, triggerId, value, index, true);
      }

      if (!isArray) return '';

      ctx = extendCtx(ctx, null, name, alias, null, true);

      out = '';
      indices = ctx.$indices;
      for (i = 0, len = value.length; i < len; i++) {
        item = value[i];
        renderCtx = extend(ctx, item);
        renderCtx["this"] = item;
        renderCtx.$indices = [i].concat(indices);
        out += render(renderCtx, model, triggerPath);
      }
      return out;
    }
  }

  throw new Error('Unknown block type: ' + type);
}

var objectToString = Object.prototype.toString;

function textFn(view, name, escape, macro) {
  return function(ctx, model) {
    var value = dataValue(view, ctx, model, name, macro)
      , text = typeof value === 'string' ? value
          : value == null ? ''
          : value.toString === objectToString ? JSON.stringify(value)
          : value.toString();

    // TODO: DRY. This is duplicating logic in dataValue()
    if (macro) {
      value = lookup(name.toLowerCase(), ctx.$macroCtx);
      if (typeof value === 'function' && value.unescaped) {
        return text;
      }
    }
    return escape ? escape(text) : text;
  }
}

function sectionFn(view, queue) {
  var render = renderer(view, reduceStack(queue.stack), queue.events)
    , block = queue.block
    , type = block.type
    , out = partialFn(view, block.name, type, block.alias, render, null, block.macro)
  out.type = type;
  return out;
}

function blockFn(view, sections) {
  var len = sections.length;
  if (!len) return;
  if (len === 1) {
    return sectionFn(view, sections[0]);

  } else {
    var fns = []
      , i, out;
    for (i = 0; i < len; i++) {
      fns.push(sectionFn(view, sections[i]));
    }
    out = function(ctx, model, triggerPath, triggerId, value, index, listener) {
      var out, fn;
      for (i = 0; i < len; i++) {
        fn = fns[i];
        out = fn(ctx, model, triggerPath, triggerId, value, index, listener);
        if (out) return out;
      }
      return '';
    }
    out.type = 'multi';
    return out;
  }
}

function parseMarkup(type, attr, tagName, events, attrs, name) {
  var parser = markup[type][attr]
    , anyOut, anyParser, elOut, elParser, out;
  if (!parser) return;
  if (anyParser = parser['*']) {
    anyOut = anyParser(events, attrs, name);
  }
  if (elParser = parser[tagName]) {
    elOut = elParser(events, attrs, name);
  }
  out = anyOut ? extend(anyOut, elOut) : elOut;
  if (out && out.del) delete attrs[attr];
  return out;
}

function pushText(stack, text) {
  if (text) stack.push(['text', text]);
}

function pushVarFn(view, stack, fn, name, escapeFn, macro) {
  if (fn) {
    pushText(stack, fn);
  } else {
    pushText(stack, textFn(view, name, escapeFn, macro));
  }
}

function boundMacroName(boundMacro, name) {
  var macroVar = name.split('.')[0];
  return boundMacro[macroVar];
}

function boundName(boundMacro, match, name) {
  if (!(name && match.macro)) return match.bound && name;
  if (~name.indexOf('(')) {
    var args = pathFnArgs(name)
      , i, len;
    for (i = 0, len = args.length; i < len; i++) {
      if (boundMacroName(boundMacro, args[i])) return name;
    }
    return false;
  }
  return boundMacroName(boundMacro, name);
}

function isPartial(view, partial) {
  var arr = partial.split(':')
    , partialNs = arr[0];
  return arr.length >= 2 &&
    (partialNs === view._selfNs || !!view._libraries.map[partialNs]);
}

function isPartialSection(tagName) {
  return tagName.charAt(0) === '@';
}

function partialSectionName(tagName) {
  return isPartialSection(tagName) ? tagName.slice(1) : null;
}

function splitPartial(view, partial, ns) {
  var i = partial.indexOf(':')
    , partialNs = partial.slice(0, i)
    , partialName = partial.slice(i + 1)
    , partialView;
  if (partialNs !== view._selfNs) {
    partialView = view._libraries.map[partialNs].view;
    partialView._uniqueId = function() {
      return view._uniqueId();
    };
    partialView.model = view.model;
    partialView.dom = view.dom;
  } else {
    partialView = view;
  }
  return [partialNs, partialName, partialView];
}

function findComponent(view, partial, ns) {
  var arr = splitPartial(view, partial, ns)
    , partialName = arr[1]
    , view = arr[2];
  return view._find(partialName, ns);
}

function isVoidComponent(view, partial, ns) {
  return !findComponent(view, partial, ns).nonvoid;
}

function pushVar(view, ns, stack, events, boundMacro, remainder, match, fn) {
  var name = match.name
    , partial = match.partial
    , macro = match.macro
    , escapeFn = match.escaped && escapeHtml
    , attr, attrs, boundOut, last, tagName, wrap, render, parseName, isBlock;

  if (partial) {
    var arr = splitPartial(view, partial, ns)
      , partialNs = arr[0]
      , partialName = arr[1]
      , alias = partialNs === view._selfNs ? '' : 'self'
    render = arr[2]._find(partialName, ns, boundMacro);
    fn = partialFn(view, arr, 'partial', alias, render, match.macroCtx, null, boundMacro);
  }

  if (parseName = boundName(boundMacro, match, name)) {
    last = stack[stack.length - 1];
    wrap = match.pre ||
      !last ||
      (last[0] !== 'start') ||
      isVoid(tagName = last[1]) ||
      wrapRemainder(tagName, remainder);

    if (wrap) {
      stack.push(['marker', '', attrs = {}]);
    } else {
      attrs = last[2];
      for (attr in attrs) {
        parseMarkup('boundParent', attr, tagName, events, attrs, parseName);
      }
      boundOut = parseMarkup('boundParent', '*', tagName, events, attrs, parseName);
      if (boundOut) {
        bindEventsById(events, macro, name, null, attrs, boundOut.method, boundOut.property);
      }
    }
    addId(view, attrs);

    if (!boundOut) {
      isBlock = !!match.type;
      bindEventsById(events, macro, name, fn, attrs, 'html', !fn && escapeFn, isBlock);
    }
  }

  pushVarFn(view, stack, fn, name, escapeFn, macro);
  if (wrap) {
    stack.push([
      'marker'
    , '$'
    , { id: function() { return attrs._id } }
    ]);
  }
}

function pushVarString(view, ns, stack, events, boundMacro, remainder, match, fn) {
  var name = match.name
    , escapeFn = !match.escaped && unescapeEntities;
  function bindOnce(ctx) {
    ctx.$onBind(events, name);
    bindOnce = empty;
  }
  if (boundName(boundMacro, match, name)) {
    events.push(function(ctx) {
      bindOnce(ctx);
    });
  }
  pushVarFn(view, stack, fn, name, escapeFn, match.macro);
}

function parseMatchError(text, message) {
  throw new Error(message + '\n\n' + text + '\n');
}

function onBlock(start, end, block, queues, callbacks) {
  var boundMacro, lastQueue, queue;
  if (end) {
    lastQueue = queues.pop();
    queue = queues.last();
    queue.sections.push(lastQueue);
  } else {
    queue = queues.last();
  }

  if (start) {
    boundMacro = Object.create(queue.boundMacro);
    queues.push(queue = {
      stack: []
    , events: []
    , block: block
    , sections: []
    , boundMacro: boundMacro
    });
    callbacks.onStart(queue);
  } else {
    if (end) {
      callbacks.onStart(queue);
      callbacks.onEnd(queue.sections);
      queue.sections = [];
    } else {
      callbacks.onContent(block);
    }
  }
}

function parseMatch(text, match, queues, callbacks) {
  var hash = match.hash
    , type = match.type
    , name = match.name
    , block = queues.last().block
    , blockType = block && block.type
    , startBlock, endBlock;

  if (type === 'if' || type === 'unless' || type === 'each' || type === 'with') {
    if (hash === '#') {
      startBlock = true;
    } else if (hash === '/') {
      endBlock = true;
    } else {
      parseMatchError(text, type + ' blocks must begin with a #');
    }

  } else if (type === 'else' || type === 'else if') {
    if (hash) {
      parseMatchError(text, type + ' blocks may not start with ' + hash);
    }
    if (blockType !== 'if' && blockType !== 'else if' &&
        blockType !== 'unless' && blockType !== 'each') {
      parseMatchError(text, type + ' may only follow `if`, `else if`, `unless`, or `each`');
    }
    startBlock = true;
    endBlock = true;

  } else if (hash === '/') {
    endBlock = true;

  } else if (hash === '#') {
    parseMatchError(text, '# must be followed by `if`, `unless`, `each`, or `with`');
  }

  if (endBlock && !block) {
    parseMatchError(text, 'Unmatched template end tag');
  }

  onBlock(startBlock, endBlock, match, queues, callbacks);
}

function parseAttr(view, viewName, events, boundMacro, tagName, attrs, attr, value) {
  if (typeof value === 'function') return;

  var attrOut = parseMarkup('attr', attr, tagName, events, attrs, value) || {}
    , parseName, boundOut, macro, match, name, render, method, property;
  if (attrOut.addId) addId(view, attrs);

  if (match = extractPlaceholder(value)) {
    name = match.name;
    macro = match.macro;

    if (match.pre || match.post) {
      // Attributes must be a single string, so create a string partial
      addId(view, attrs);
      render = parse(view, viewName, value, true, function(events, name) {
        bindEventsByIdString(events, macro, name, render, attrs, 'attr', attr);
      }, boundMacro);

      attrs[attr] = attr === 'id' ? function(ctx, model) {
        return attrs._id = escapeAttribute(render(ctx, model));
      } : function(ctx, model) {
        return escapeAttribute(render(ctx, model));
      }
      return;
    }

    if (parseName = boundName(boundMacro, match, name)) {
      boundOut = parseMarkup('bound', attr, tagName, events, attrs, parseName) || {};
      addId(view, attrs);
      method = boundOut.method || 'attr';
      property = boundOut.property || attr;
      bindEventsById(events, macro, name, null, attrs, method, property);
    }

    if (!attrOut.del) {
      macro = match.macro;
      attrs[attr] = attrOut.bool ? {
        bool: function(ctx, model) {
          return (dataValue(view, ctx, model, name, macro)) ? ' ' + attr : '';
        }
      } : textFn(view, name, escapeAttribute, macro);
    }
  }
}

function parsePartialAttr(view, viewName, events, attrs, attr, value) {
  var bound = false
    , match = extractPlaceholder(value)
    , name;
  if (attr === 'content') {
    throw new Error('components may not have an attribute named "content"');
  }

  if (match) {
    if (match.pre || match.post) {
      throw new Error('unimplemented: blocks in component attributes');
    }

    name = match.name;
    bound = match.bound;
    attrs[attr] = {$macroVar: name};

  } else if (value === 'true') {
    attrs[attr] = true;
  } else if (value === 'false') {
    attrs[attr] = false;
  } else if (value === 'null') {
    attrs[attr] = null;
  } else if (value && !isNaN(value)) {
    attrs[attr] = +value;
  }

  return bound;
}

function parse(view, viewName, template, isString, onBind, boundMacro) {
  if (boundMacro == null) boundMacro = {};
  var queues, stack, events, onRender, push;

  queues = [{
    stack: stack = []
  , events: events = []
  , sections: []
  , boundMacro: boundMacro
  }];
  queues.last = function() {
    return queues[queues.length - 1];
  };

  function onStart(queue) {
    stack = queue.stack;
    events = queue.events;
    boundMacro = queue.boundMacro;
  }

  if (isString) {
    push = pushVarString;
    onRender = function(ctx) {
      if (ctx.$stringCtx) return ctx;
      ctx = Object.create(ctx);
      ctx.$onBind = onBind;
      ctx.$stringCtx = ctx;
      return ctx;
    }
  } else {
    push = pushVar;
  }

  var index = viewName.lastIndexOf(':')
    , ns = ~index ? viewName.slice(0, index) : ''
    , minifyContent = true;

  function parseStart(tag, tagName, attrs) {
    var attr, block, bound, out, parser, value, _boundMacro
    if ('x-no-minify' in attrs) {
      delete attrs['x-no-minify'];
      minifyContent = false;
    } else {
      minifyContent = true;
    }

    if (isPartial(view, tagName)) {
      block = {
        partial: tagName
      , macroCtx: attrs
      };
      onBlock(true, false, block, queues, {onStart: onStart});

      for (attr in attrs) {
        value = attrs[attr];
        bound = parsePartialAttr(view, viewName, events, attrs, attr, value);
        if (bound) {
          boundMacro[attr] = attrs[attr].$macroVar;
        }
      }

      _boundMacro = boundMacro
      if (isVoidComponent(view, tagName, ns)) {
        onBlock(false, true, null, queues, {
          onStart: onStart
        , onEnd: function(queues) {
            push(view, ns, stack, events, _boundMacro, '', block);
          }
        })
      }
      return;
    }

    if (isPartialSection(tagName)) {
      block = {
        partial: tagName
      , macroCtx: queues.last().block.macroCtx
      };
      onBlock(true, false, block, queues, {onStart: onStart});
      return;
    }

    if (parser = markup.element[tagName]) {
      out = parser(events, attrs);
      if (out != null ? out.addId : void 0) {
        addId(view, attrs);
      }
    }

    for (attr in attrs) {
      value = attrs[attr];
      parseAttr(view, viewName, events, boundMacro, tagName, attrs, attr, value);
    }
    stack.push(['start', tagName, attrs]);
  }

  function parseText(text, isRawText, remainder) {
    var match = extractPlaceholder(text)
      , post, pre;
    if (!match || isRawText) {
      if (minifyContent) {
        text = isString ? unescapeEntities(trimLeading(text)) : trimLeading(text);
      }
      pushText(stack, text);
      return;
    }

    pre = match.pre;
    post = match.post;
    if (isString) pre = unescapeEntities(pre);
    pushText(stack, pre);
    remainder = post || remainder;

    parseMatch(text, match, queues, {
      onStart: onStart
    , onEnd: function(sections) {
        var fn = blockFn(view, sections);
        push(view, ns, stack, events, boundMacro, remainder, sections[0].block, fn);
      }
    , onContent: function(match) {
        push(view, ns, stack, events, boundMacro, remainder, match);
      }
    });

    if (post) return parseText(post);
  }

  function parseEnd(tag, tagName) {
    var sectionName = partialSectionName(tagName)
      , endsPartial = isPartial(view, tagName)
      , ctxName = sectionName || endsPartial && 'content'
      , _boundMacro = boundMacro
    if (endsPartial && isVoidComponent(view, tagName, ns)) {
      throw new Error('End tag "' + tag + '" is not allowed for void component')
    }
    if (ctxName) {
      onBlock(false, true, null, queues, {
        onStart: onStart
      , onEnd: function(queues) {
          var queue = queues[0]
            , block = queue.block
            , fn = renderer(view, reduceStack(queue.stack), queue.events)
          fn.unescaped = true;
          block.macroCtx[ctxName] = fn;
          if (sectionName) return;
          push(view, ns, stack, events, _boundMacro, '', block);
        }
      })
      return;
    }
    stack.push(['end', tagName]);
  }

  if (isString) {
    parseText(template);
  } else {
    parseHtml(template, {
      start: parseStart
    , text: parseText
    , end: parseEnd
    , comment: function(tag) {
        if (conditionalComment(tag)) pushText(stack, tag);
      }
    , other: function(tag) {
        pushText(stack, tag);
      }
    });
  }
  return renderer(view, reduceStack(stack), events, onRender);
}
