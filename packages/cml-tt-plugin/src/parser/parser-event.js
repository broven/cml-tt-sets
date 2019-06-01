const { types: t } = require('mvvm-template-parser');
const {
  trim,
  isInlineStatementFn,
  isOriginTagOrNativeComp,
  doublequot2singlequot,
  getInlineStatementArgs
} = require('../util');
const ttMixin = require('../../../cml-tt-mixins/index');

module.exports = function (context) {
  let { path, options, attr, tagName } = context;
  let namespace = attr.name && attr.name.namespace;
  let parentPath = path.parentPath;
  let container = path.container;
  let value = container.value;
  if (namespace && (namespace.name === 'c-bind' || attr.name.namespace.name === 'c-catch')) {
    // 头条文档上并没有找到关于catch的描述。。。。。。
    let handler = attr.value.value && trim(attr.value.value);
    let eventNameKey = namespace.name === 'c-bind' ? 'bind' : 'catch';
    let eventNameVal = attr.name.name.name === 'click' ? 'tap' : attr.name.name.name;
    let eventKey = eventNameVal.toLowerCase();
    let eventName = `${eventNameKey}${eventNameVal}`;
    let match = isInlineStatementFn(handler);
    attr.name = t.jsxIdentifier(eventName);
    // ====这里作用是阻止对 origin-tag标签的事件进行代理
    if (isOriginTagOrNativeComp(tagName, options)) {
      return // 原生标签和原生组件直接不解析
    }
    // ====这里作用是阻止对 origin-tag标签的事件进行代理
    if (!match) {
      parentPath.insertAfter(t.jsxAttribute(t.jsxIdentifier(`data-event${eventKey}`), t.stringLiteral(`{{['${handler}']}}`)))
      value.value = `${ttMixin.eventProxyName}`;
    } else {
      let index = handler.indexOf('(');
      index > 0 && (handler = trim(handler.slice(0, index)));
      value.value = `${ttMixin.inlineStatementEventProxy}`;
      let args = match && doublequot2singlequot(match[1]).trim();
      if (args) { // 内联函数传参
        let inlineArgs = getInlineStatementArgs(args);
        parentPath.insertAfter(t.jsxAttribute(t.jsxIdentifier(`data-event${eventKey}`), t.stringLiteral(`{{['${handler}',${inlineArgs}]}}`)))
      } else { // 内联函数不传参
        parentPath.insertAfter(t.jsxAttribute(t.jsxIdentifier(`data-event${eventKey}`), t.stringLiteral(`{{['${handler}']}}`)))
      }
    }
  }
}