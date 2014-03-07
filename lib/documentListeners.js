var textDiff = require('./textDiff');

exports.add = addDocumentListeners;

function addDocumentListeners(doc) {
  doc.addEventListener('input', documentInput, true);
  doc.addEventListener('change', documentChange, true);
}

function documentInput(e) {
  var target = e.target;
  if (!target) return;
  var tagName = target.tagName.toLowerCase();
  var pass = {$event: e};

  switch (tagName) {
    case 'input':
      var bindAttributes = target.$bindAttributes;
      if (!bindAttributes) return;
      binding = bindAttributes.value;
      break;
    case 'textarea':
      var node = target.childNodes[0];
      if (!node) return;
      binding = node.$bindNode;
      break;
  }

  if ((tagName === 'input' || tagName === 'textarea') && binding) {
    if ('selectionStart' in target) {
      textDiffBinding(binding, target.value, pass);
    } else {
      binding.template.expression.set(binding.context, target.value);
    }

  } else if (target.isContentEditable) {
    // TODO
  }
}

function documentChange(e) {
  var target = e.target;
  if (!target) return;
  var bindAttributes = target.$bindAttributes;
  var tagName = target.tagName.toLowerCase();

  if (tagName === 'input') {
    if (bindAttributes && bindAttributes.checked) {
      var binding = bindAttributes.checked;
      binding.template.expression.set(binding.context, target.checked);
    }

  } else if (tagName === 'select') {
    setOptionBindings(target);
  }
}

function textDiffBinding(binding, value, pass) {
  var expression = binding.template.expression;
  var segments = expression.pathSegments(binding.context);
  if (segments) {
    var model = binding.context.controller.model.pass(pass);
    textDiff.onTextInput(model, segments, value);
  } else if (expression.set) {
    expression.set(binding.context, value);
  }
}

function setOptionBindings(parent) {
  for (var node = parent.firstChild; node; node = node.nextSibling) {
    if (node.tagName && node.tagName.toLowerCase() === 'option') {
      var binding = node.$bindAttributes && node.$bindAttributes.selected;
      if (binding) binding.template.expression.set(binding.context, node.selected);
    } else if (node.hasChildNodes()) {
      setOptionBindings(node);
    }
  }
}
