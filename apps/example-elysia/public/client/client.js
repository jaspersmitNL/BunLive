"use strict";
(() => {
  var __defProp = Object.defineProperty;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __publicField = (obj, key, value) => {
    __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
    return value;
  };

  // ../../node_modules/diff-dom/dist/module.js
  var Diff = (
    /** @class */
    function() {
      function Diff2(options) {
        var _this = this;
        if (options === void 0) {
          options = {};
        }
        Object.entries(options).forEach(function(_a) {
          var key = _a[0], value = _a[1];
          return _this[key] = value;
        });
      }
      Diff2.prototype.toString = function() {
        return JSON.stringify(this);
      };
      Diff2.prototype.setValue = function(aKey, aValue) {
        this[aKey] = aValue;
        return this;
      };
      return Diff2;
    }()
  );
  function checkElementType(element) {
    var arguments$1 = arguments;
    var elementTypeNames = [];
    for (var _i = 1; _i < arguments.length; _i++) {
      elementTypeNames[_i - 1] = arguments$1[_i];
    }
    if (typeof element === "undefined" || element === null) {
      return false;
    }
    return elementTypeNames.some(function(elementTypeName) {
      var _a, _b;
      return typeof ((_b = (_a = element === null || element === void 0 ? void 0 : element.ownerDocument) === null || _a === void 0 ? void 0 : _a.defaultView) === null || _b === void 0 ? void 0 : _b[elementTypeName]) === "function" && element instanceof element.ownerDocument.defaultView[elementTypeName];
    });
  }
  function objToNode(objNode, insideSvg, options) {
    var node;
    if (objNode.nodeName === "#text") {
      node = options.document.createTextNode(objNode.data);
    } else if (objNode.nodeName === "#comment") {
      node = options.document.createComment(objNode.data);
    } else {
      if (insideSvg) {
        node = options.document.createElementNS("http://www.w3.org/2000/svg", objNode.nodeName);
      } else if (objNode.nodeName.toLowerCase() === "svg") {
        node = options.document.createElementNS("http://www.w3.org/2000/svg", "svg");
        insideSvg = true;
      } else {
        node = options.document.createElement(objNode.nodeName);
      }
      if (objNode.attributes) {
        Object.entries(objNode.attributes).forEach(function(_a) {
          var key = _a[0], value = _a[1];
          return node.setAttribute(key, value);
        });
      }
      if (objNode.childNodes) {
        node = node;
        objNode.childNodes.forEach(function(childNode) {
          return node.appendChild(objToNode(childNode, insideSvg, options));
        });
      }
      if (options.valueDiffing) {
        if (objNode.value && checkElementType(node, "HTMLButtonElement", "HTMLDataElement", "HTMLInputElement", "HTMLLIElement", "HTMLMeterElement", "HTMLOptionElement", "HTMLProgressElement", "HTMLParamElement")) {
          node.value = objNode.value;
        }
        if (objNode.checked && checkElementType(node, "HTMLInputElement")) {
          node.checked = objNode.checked;
        }
        if (objNode.selected && checkElementType(node, "HTMLOptionElement")) {
          node.selected = objNode.selected;
        }
      }
    }
    return node;
  }
  var getFromRoute = function(node, route) {
    route = route.slice();
    while (route.length > 0) {
      var c = route.splice(0, 1)[0];
      node = node.childNodes[c];
    }
    return node;
  };
  function applyDiff(tree, diff, options) {
    var action = diff[options._const.action];
    var route = diff[options._const.route];
    var node;
    if (![options._const.addElement, options._const.addTextElement].includes(action)) {
      node = getFromRoute(tree, route);
    }
    var newNode;
    var reference;
    var nodeArray;
    var info = {
      diff,
      node
    };
    if (options.preDiffApply(info)) {
      return true;
    }
    switch (action) {
      case options._const.addAttribute:
        if (!node || !checkElementType(node, "Element")) {
          return false;
        }
        node.setAttribute(diff[options._const.name], diff[options._const.value]);
        break;
      case options._const.modifyAttribute:
        if (!node || !checkElementType(node, "Element")) {
          return false;
        }
        node.setAttribute(diff[options._const.name], diff[options._const.newValue]);
        if (checkElementType(node, "HTMLInputElement") && diff[options._const.name] === "value") {
          node.value = diff[options._const.newValue];
        }
        break;
      case options._const.removeAttribute:
        if (!node || !checkElementType(node, "Element")) {
          return false;
        }
        node.removeAttribute(diff[options._const.name]);
        break;
      case options._const.modifyTextElement:
        if (!node || !checkElementType(node, "Text")) {
          return false;
        }
        options.textDiff(node, node.data, diff[options._const.oldValue], diff[options._const.newValue]);
        if (checkElementType(node.parentNode, "HTMLTextAreaElement")) {
          node.parentNode.value = diff[options._const.newValue];
        }
        break;
      case options._const.modifyValue:
        if (!node || typeof node.value === "undefined") {
          return false;
        }
        node.value = diff[options._const.newValue];
        break;
      case options._const.modifyComment:
        if (!node || !checkElementType(node, "Comment")) {
          return false;
        }
        options.textDiff(node, node.data, diff[options._const.oldValue], diff[options._const.newValue]);
        break;
      case options._const.modifyChecked:
        if (!node || typeof node.checked === "undefined") {
          return false;
        }
        node.checked = diff[options._const.newValue];
        break;
      case options._const.modifySelected:
        if (!node || typeof node.selected === "undefined") {
          return false;
        }
        node.selected = diff[options._const.newValue];
        break;
      case options._const.replaceElement: {
        var insideSvg = diff[options._const.newValue].nodeName.toLowerCase() === "svg" || node.parentNode.namespaceURI === "http://www.w3.org/2000/svg";
        node.parentNode.replaceChild(objToNode(diff[options._const.newValue], insideSvg, options), node);
        break;
      }
      case options._const.relocateGroup:
        nodeArray = Array.apply(void 0, new Array(diff[options._const.groupLength])).map(function() {
          return node.removeChild(node.childNodes[diff[options._const.from]]);
        });
        nodeArray.forEach(function(childNode, index) {
          if (index === 0) {
            reference = node.childNodes[diff[options._const.to]];
          }
          node.insertBefore(childNode, reference || null);
        });
        break;
      case options._const.removeElement:
        node.parentNode.removeChild(node);
        break;
      case options._const.addElement: {
        var parentRoute = route.slice();
        var c = parentRoute.splice(parentRoute.length - 1, 1)[0];
        node = getFromRoute(tree, parentRoute);
        if (!checkElementType(node, "Element")) {
          return false;
        }
        node.insertBefore(objToNode(diff[options._const.element], node.namespaceURI === "http://www.w3.org/2000/svg", options), node.childNodes[c] || null);
        break;
      }
      case options._const.removeTextElement: {
        if (!node || node.nodeType !== 3) {
          return false;
        }
        var parentNode = node.parentNode;
        parentNode.removeChild(node);
        if (checkElementType(parentNode, "HTMLTextAreaElement")) {
          parentNode.value = "";
        }
        break;
      }
      case options._const.addTextElement: {
        var parentRoute = route.slice();
        var c = parentRoute.splice(parentRoute.length - 1, 1)[0];
        newNode = options.document.createTextNode(diff[options._const.value]);
        node = getFromRoute(tree, parentRoute);
        if (!node.childNodes) {
          return false;
        }
        node.insertBefore(newNode, node.childNodes[c] || null);
        if (checkElementType(node.parentNode, "HTMLTextAreaElement")) {
          node.parentNode.value = diff[options._const.value];
        }
        break;
      }
      default:
        console.log("unknown action");
    }
    options.postDiffApply({
      diff: info.diff,
      node: info.node,
      newNode
    });
    return true;
  }
  function applyDOM(tree, diffs, options) {
    return diffs.every(function(diff) {
      return applyDiff(tree, diff, options);
    });
  }
  function swap(obj, p1, p2) {
    var tmp = obj[p1];
    obj[p1] = obj[p2];
    obj[p2] = tmp;
  }
  function undoDiff(tree, diff, options) {
    switch (diff[options._const.action]) {
      case options._const.addAttribute:
        diff[options._const.action] = options._const.removeAttribute;
        applyDiff(tree, diff, options);
        break;
      case options._const.modifyAttribute:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.removeAttribute:
        diff[options._const.action] = options._const.addAttribute;
        applyDiff(tree, diff, options);
        break;
      case options._const.modifyTextElement:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.modifyValue:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.modifyComment:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.modifyChecked:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.modifySelected:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.replaceElement:
        swap(diff, options._const.oldValue, options._const.newValue);
        applyDiff(tree, diff, options);
        break;
      case options._const.relocateGroup:
        swap(diff, options._const.from, options._const.to);
        applyDiff(tree, diff, options);
        break;
      case options._const.removeElement:
        diff[options._const.action] = options._const.addElement;
        applyDiff(tree, diff, options);
        break;
      case options._const.addElement:
        diff[options._const.action] = options._const.removeElement;
        applyDiff(tree, diff, options);
        break;
      case options._const.removeTextElement:
        diff[options._const.action] = options._const.addTextElement;
        applyDiff(tree, diff, options);
        break;
      case options._const.addTextElement:
        diff[options._const.action] = options._const.removeTextElement;
        applyDiff(tree, diff, options);
        break;
      default:
        console.log("unknown action");
    }
  }
  function undoDOM(tree, diffs, options) {
    diffs = diffs.slice();
    diffs.reverse();
    diffs.forEach(function(diff) {
      undoDiff(tree, diff, options);
    });
  }
  var __assign = function() {
    __assign = Object.assign || function __assign2(t) {
      var arguments$1 = arguments;
      for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments$1[i];
        for (var p in s) {
          if (Object.prototype.hasOwnProperty.call(s, p)) {
            t[p] = s[p];
          }
        }
      }
      return t;
    };
    return __assign.apply(this, arguments);
  };
  typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
  };
  var elementDescriptors = function(el) {
    var output = [];
    output.push(el.nodeName);
    if (el.nodeName !== "#text" && el.nodeName !== "#comment") {
      el = el;
      if (el.attributes) {
        if (el.attributes["class"]) {
          output.push("".concat(el.nodeName, ".").concat(el.attributes["class"].replace(/ /g, ".")));
        }
        if (el.attributes.id) {
          output.push("".concat(el.nodeName, "#").concat(el.attributes.id));
        }
      }
    }
    return output;
  };
  var findUniqueDescriptors = function(li) {
    var uniqueDescriptors = {};
    var duplicateDescriptors = {};
    li.forEach(function(node) {
      elementDescriptors(node).forEach(function(descriptor) {
        var inUnique = descriptor in uniqueDescriptors;
        var inDupes = descriptor in duplicateDescriptors;
        if (!inUnique && !inDupes) {
          uniqueDescriptors[descriptor] = true;
        } else if (inUnique) {
          delete uniqueDescriptors[descriptor];
          duplicateDescriptors[descriptor] = true;
        }
      });
    });
    return uniqueDescriptors;
  };
  var uniqueInBoth = function(l1, l2) {
    var l1Unique = findUniqueDescriptors(l1);
    var l2Unique = findUniqueDescriptors(l2);
    var inBoth = {};
    Object.keys(l1Unique).forEach(function(key) {
      if (l2Unique[key]) {
        inBoth[key] = true;
      }
    });
    return inBoth;
  };
  var removeDone = function(tree) {
    delete tree.outerDone;
    delete tree.innerDone;
    delete tree.valueDone;
    if (tree.childNodes) {
      return tree.childNodes.every(removeDone);
    } else {
      return true;
    }
  };
  var cleanNode = function(diffNode) {
    if (Object.prototype.hasOwnProperty.call(diffNode, "data")) {
      var textNode = {
        nodeName: diffNode.nodeName === "#text" ? "#text" : "#comment",
        data: diffNode.data
      };
      return textNode;
    } else {
      var elementNode = {
        nodeName: diffNode.nodeName
      };
      diffNode = diffNode;
      if (Object.prototype.hasOwnProperty.call(diffNode, "attributes")) {
        elementNode.attributes = __assign({}, diffNode.attributes);
      }
      if (Object.prototype.hasOwnProperty.call(diffNode, "checked")) {
        elementNode.checked = diffNode.checked;
      }
      if (Object.prototype.hasOwnProperty.call(diffNode, "value")) {
        elementNode.value = diffNode.value;
      }
      if (Object.prototype.hasOwnProperty.call(diffNode, "selected")) {
        elementNode.selected = diffNode.selected;
      }
      if (Object.prototype.hasOwnProperty.call(diffNode, "childNodes")) {
        elementNode.childNodes = diffNode.childNodes.map(function(diffChildNode) {
          return cleanNode(diffChildNode);
        });
      }
      return elementNode;
    }
  };
  var isEqual = function(e1, e2) {
    if (!["nodeName", "value", "checked", "selected", "data"].every(function(element) {
      if (e1[element] !== e2[element]) {
        return false;
      }
      return true;
    })) {
      return false;
    }
    if (Object.prototype.hasOwnProperty.call(e1, "data")) {
      return true;
    }
    e1 = e1;
    e2 = e2;
    if (Boolean(e1.attributes) !== Boolean(e2.attributes)) {
      return false;
    }
    if (Boolean(e1.childNodes) !== Boolean(e2.childNodes)) {
      return false;
    }
    if (e1.attributes) {
      var e1Attributes = Object.keys(e1.attributes);
      var e2Attributes = Object.keys(e2.attributes);
      if (e1Attributes.length !== e2Attributes.length) {
        return false;
      }
      if (!e1Attributes.every(function(attribute) {
        if (e1.attributes[attribute] !== e2.attributes[attribute]) {
          return false;
        }
        return true;
      })) {
        return false;
      }
    }
    if (e1.childNodes) {
      if (e1.childNodes.length !== e2.childNodes.length) {
        return false;
      }
      if (!e1.childNodes.every(function(childNode, index) {
        return isEqual(childNode, e2.childNodes[index]);
      })) {
        return false;
      }
    }
    return true;
  };
  var roughlyEqual = function(e1, e2, uniqueDescriptors, sameSiblings, preventRecursion) {
    if (preventRecursion === void 0) {
      preventRecursion = false;
    }
    if (!e1 || !e2) {
      return false;
    }
    if (e1.nodeName !== e2.nodeName) {
      return false;
    }
    if (["#text", "#comment"].includes(e1.nodeName)) {
      return preventRecursion ? true : e1.data === e2.data;
    }
    e1 = e1;
    e2 = e2;
    if (e1.nodeName in uniqueDescriptors) {
      return true;
    }
    if (e1.attributes && e2.attributes) {
      if (e1.attributes.id) {
        if (e1.attributes.id !== e2.attributes.id) {
          return false;
        } else {
          var idDescriptor = "".concat(e1.nodeName, "#").concat(e1.attributes.id);
          if (idDescriptor in uniqueDescriptors) {
            return true;
          }
        }
      }
      if (e1.attributes["class"] && e1.attributes["class"] === e2.attributes["class"]) {
        var classDescriptor = "".concat(e1.nodeName, ".").concat(e1.attributes["class"].replace(/ /g, "."));
        if (classDescriptor in uniqueDescriptors) {
          return true;
        }
      }
    }
    if (sameSiblings) {
      return true;
    }
    var nodeList1 = e1.childNodes ? e1.childNodes.slice().reverse() : [];
    var nodeList2 = e2.childNodes ? e2.childNodes.slice().reverse() : [];
    if (nodeList1.length !== nodeList2.length) {
      return false;
    }
    if (preventRecursion) {
      return nodeList1.every(function(element, index) {
        return element.nodeName === nodeList2[index].nodeName;
      });
    } else {
      var childUniqueDescriptors_1 = uniqueInBoth(nodeList1, nodeList2);
      return nodeList1.every(function(element, index) {
        return roughlyEqual(element, nodeList2[index], childUniqueDescriptors_1, true, true);
      });
    }
  };
  var findCommonSubsets = function(c1, c2, marked1, marked2) {
    var lcsSize = 0;
    var index = [];
    var c1Length = c1.length;
    var c2Length = c2.length;
    var matches = Array.apply(void 0, new Array(c1Length + 1)).map(function() {
      return [];
    });
    var uniqueDescriptors = uniqueInBoth(c1, c2);
    var subsetsSame = c1Length === c2Length;
    if (subsetsSame) {
      c1.some(function(element, i) {
        var c1Desc = elementDescriptors(element);
        var c2Desc = elementDescriptors(c2[i]);
        if (c1Desc.length !== c2Desc.length) {
          subsetsSame = false;
          return true;
        }
        c1Desc.some(function(description, i2) {
          if (description !== c2Desc[i2]) {
            subsetsSame = false;
            return true;
          }
        });
        if (!subsetsSame) {
          return true;
        }
      });
    }
    for (var c1Index = 0; c1Index < c1Length; c1Index++) {
      var c1Element = c1[c1Index];
      for (var c2Index = 0; c2Index < c2Length; c2Index++) {
        var c2Element = c2[c2Index];
        if (!marked1[c1Index] && !marked2[c2Index] && roughlyEqual(c1Element, c2Element, uniqueDescriptors, subsetsSame)) {
          matches[c1Index + 1][c2Index + 1] = matches[c1Index][c2Index] ? matches[c1Index][c2Index] + 1 : 1;
          if (matches[c1Index + 1][c2Index + 1] >= lcsSize) {
            lcsSize = matches[c1Index + 1][c2Index + 1];
            index = [c1Index + 1, c2Index + 1];
          }
        } else {
          matches[c1Index + 1][c2Index + 1] = 0;
        }
      }
    }
    if (lcsSize === 0) {
      return false;
    }
    return {
      oldValue: index[0] - lcsSize,
      newValue: index[1] - lcsSize,
      length: lcsSize
    };
  };
  var makeBooleanArray = function(n, v) {
    return Array.apply(void 0, new Array(n)).map(function() {
      return v;
    });
  };
  var getGapInformation = function(t1, t2, stable) {
    var gaps1 = t1.childNodes ? makeBooleanArray(t1.childNodes.length, true) : [];
    var gaps2 = t2.childNodes ? makeBooleanArray(t2.childNodes.length, true) : [];
    var group = 0;
    stable.forEach(function(subset) {
      var endOld = subset.oldValue + subset.length;
      var endNew = subset.newValue + subset.length;
      for (var j = subset.oldValue; j < endOld; j += 1) {
        gaps1[j] = group;
      }
      for (var j = subset.newValue; j < endNew; j += 1) {
        gaps2[j] = group;
      }
      group += 1;
    });
    return {
      gaps1,
      gaps2
    };
  };
  var markBoth = function(marked1, marked2, subset, i) {
    marked1[subset.oldValue + i] = true;
    marked2[subset.newValue + i] = true;
  };
  var markSubTrees = function(oldTree, newTree) {
    var oldChildren = oldTree.childNodes ? oldTree.childNodes : [];
    var newChildren = newTree.childNodes ? newTree.childNodes : [];
    var marked1 = makeBooleanArray(oldChildren.length, false);
    var marked2 = makeBooleanArray(newChildren.length, false);
    var subsets = [];
    var returnIndex = function() {
      return arguments[1];
    };
    var foundAllSubsets = false;
    var _loop_1 = function() {
      var subset = findCommonSubsets(oldChildren, newChildren, marked1, marked2);
      if (subset) {
        subsets.push(subset);
        var subsetArray = Array.apply(void 0, new Array(subset.length)).map(returnIndex);
        subsetArray.forEach(function(item) {
          return markBoth(marked1, marked2, subset, item);
        });
      } else {
        foundAllSubsets = true;
      }
    };
    while (!foundAllSubsets) {
      _loop_1();
    }
    oldTree.subsets = subsets;
    oldTree.subsetsAge = 100;
    return subsets;
  };
  var DiffTracker = (
    /** @class */
    function() {
      function DiffTracker2() {
        this.list = [];
      }
      DiffTracker2.prototype.add = function(diffs) {
        var _a;
        (_a = this.list).push.apply(_a, diffs);
      };
      DiffTracker2.prototype.forEach = function(fn) {
        this.list.forEach(function(li) {
          return fn(li);
        });
      };
      return DiffTracker2;
    }()
  );
  function getFromVirtualRoute(tree, route) {
    var node = tree;
    var parentNode;
    var nodeIndex;
    route = route.slice();
    while (route.length > 0) {
      nodeIndex = route.splice(0, 1)[0];
      parentNode = node;
      node = node.childNodes ? node.childNodes[nodeIndex] : void 0;
    }
    return {
      node,
      parentNode,
      nodeIndex
    };
  }
  function applyVirtualDiff(tree, diff, options) {
    var _a;
    var node, parentNode, nodeIndex;
    if (![options._const.addElement, options._const.addTextElement].includes(diff[options._const.action])) {
      var routeInfo = getFromVirtualRoute(tree, diff[options._const.route]);
      node = routeInfo.node;
      parentNode = routeInfo.parentNode;
      nodeIndex = routeInfo.nodeIndex;
    }
    var newSubsets = [];
    var info = {
      diff,
      node
    };
    if (options.preVirtualDiffApply(info)) {
      return true;
    }
    var newNode;
    var nodeArray;
    var route;
    switch (diff[options._const.action]) {
      case options._const.addAttribute:
        if (!node.attributes) {
          node.attributes = {};
        }
        node.attributes[diff[options._const.name]] = diff[options._const.value];
        if (diff[options._const.name] === "checked") {
          node.checked = true;
        } else if (diff[options._const.name] === "selected") {
          node.selected = true;
        } else if (node.nodeName === "INPUT" && diff[options._const.name] === "value") {
          node.value = diff[options._const.value];
        }
        break;
      case options._const.modifyAttribute:
        node.attributes[diff[options._const.name]] = diff[options._const.newValue];
        break;
      case options._const.removeAttribute:
        delete node.attributes[diff[options._const.name]];
        if (Object.keys(node.attributes).length === 0) {
          delete node.attributes;
        }
        if (diff[options._const.name] === "checked") {
          node.checked = false;
        } else if (diff[options._const.name] === "selected") {
          delete node.selected;
        } else if (node.nodeName === "INPUT" && diff[options._const.name] === "value") {
          delete node.value;
        }
        break;
      case options._const.modifyTextElement:
        node.data = diff[options._const.newValue];
        if (parentNode.nodeName === "TEXTAREA") {
          parentNode.value = diff[options._const.newValue];
        }
        break;
      case options._const.modifyValue:
        node.value = diff[options._const.newValue];
        break;
      case options._const.modifyComment:
        node.data = diff[options._const.newValue];
        break;
      case options._const.modifyChecked:
        node.checked = diff[options._const.newValue];
        break;
      case options._const.modifySelected:
        node.selected = diff[options._const.newValue];
        break;
      case options._const.replaceElement:
        newNode = cleanNode(diff[options._const.newValue]);
        parentNode.childNodes[nodeIndex] = newNode;
        break;
      case options._const.relocateGroup:
        nodeArray = node.childNodes.splice(diff[options._const.from], diff[options._const.groupLength]).reverse();
        nodeArray.forEach(function(movedNode) {
          return node.childNodes.splice(diff[options._const.to], 0, movedNode);
        });
        if (node.subsets) {
          node.subsets.forEach(function(map) {
            if (diff[options._const.from] < diff[options._const.to] && map.oldValue <= diff[options._const.to] && map.oldValue > diff[options._const.from]) {
              map.oldValue -= diff[options._const.groupLength];
              var splitLength = map.oldValue + map.length - diff[options._const.to];
              if (splitLength > 0) {
                newSubsets.push({
                  oldValue: diff[options._const.to] + diff[options._const.groupLength],
                  newValue: map.newValue + map.length - splitLength,
                  length: splitLength
                });
                map.length -= splitLength;
              }
            } else if (diff[options._const.from] > diff[options._const.to] && map.oldValue > diff[options._const.to] && map.oldValue < diff[options._const.from]) {
              map.oldValue += diff[options._const.groupLength];
              var splitLength = map.oldValue + map.length - diff[options._const.to];
              if (splitLength > 0) {
                newSubsets.push({
                  oldValue: diff[options._const.to] + diff[options._const.groupLength],
                  newValue: map.newValue + map.length - splitLength,
                  length: splitLength
                });
                map.length -= splitLength;
              }
            } else if (map.oldValue === diff[options._const.from]) {
              map.oldValue = diff[options._const.to];
            }
          });
        }
        break;
      case options._const.removeElement:
        parentNode.childNodes.splice(nodeIndex, 1);
        if (parentNode.subsets) {
          parentNode.subsets.forEach(function(map) {
            if (map.oldValue > nodeIndex) {
              map.oldValue -= 1;
            } else if (map.oldValue === nodeIndex) {
              map.delete = true;
            } else if (map.oldValue < nodeIndex && map.oldValue + map.length > nodeIndex) {
              if (map.oldValue + map.length - 1 === nodeIndex) {
                map.length--;
              } else {
                newSubsets.push({
                  newValue: map.newValue + nodeIndex - map.oldValue,
                  oldValue: nodeIndex,
                  length: map.length - nodeIndex + map.oldValue - 1
                });
                map.length = nodeIndex - map.oldValue;
              }
            }
          });
        }
        node = parentNode;
        break;
      case options._const.addElement: {
        route = diff[options._const.route].slice();
        var c_1 = route.splice(route.length - 1, 1)[0];
        node = (_a = getFromVirtualRoute(tree, route)) === null || _a === void 0 ? void 0 : _a.node;
        newNode = cleanNode(diff[options._const.element]);
        if (!node.childNodes) {
          node.childNodes = [];
        }
        if (c_1 >= node.childNodes.length) {
          node.childNodes.push(newNode);
        } else {
          node.childNodes.splice(c_1, 0, newNode);
        }
        if (node.subsets) {
          node.subsets.forEach(function(map) {
            if (map.oldValue >= c_1) {
              map.oldValue += 1;
            } else if (map.oldValue < c_1 && map.oldValue + map.length > c_1) {
              var splitLength = map.oldValue + map.length - c_1;
              newSubsets.push({
                newValue: map.newValue + map.length - splitLength,
                oldValue: c_1 + 1,
                length: splitLength
              });
              map.length -= splitLength;
            }
          });
        }
        break;
      }
      case options._const.removeTextElement:
        parentNode.childNodes.splice(nodeIndex, 1);
        if (parentNode.nodeName === "TEXTAREA") {
          delete parentNode.value;
        }
        if (parentNode.subsets) {
          parentNode.subsets.forEach(function(map) {
            if (map.oldValue > nodeIndex) {
              map.oldValue -= 1;
            } else if (map.oldValue === nodeIndex) {
              map.delete = true;
            } else if (map.oldValue < nodeIndex && map.oldValue + map.length > nodeIndex) {
              if (map.oldValue + map.length - 1 === nodeIndex) {
                map.length--;
              } else {
                newSubsets.push({
                  newValue: map.newValue + nodeIndex - map.oldValue,
                  oldValue: nodeIndex,
                  length: map.length - nodeIndex + map.oldValue - 1
                });
                map.length = nodeIndex - map.oldValue;
              }
            }
          });
        }
        node = parentNode;
        break;
      case options._const.addTextElement: {
        route = diff[options._const.route].slice();
        var c_2 = route.splice(route.length - 1, 1)[0];
        newNode = {
          nodeName: "#text",
          data: diff[options._const.value]
        };
        node = getFromVirtualRoute(tree, route).node;
        if (!node.childNodes) {
          node.childNodes = [];
        }
        if (c_2 >= node.childNodes.length) {
          node.childNodes.push(newNode);
        } else {
          node.childNodes.splice(c_2, 0, newNode);
        }
        if (node.nodeName === "TEXTAREA") {
          node.value = diff[options._const.newValue];
        }
        if (node.subsets) {
          node.subsets.forEach(function(map) {
            if (map.oldValue >= c_2) {
              map.oldValue += 1;
            }
            if (map.oldValue < c_2 && map.oldValue + map.length > c_2) {
              var splitLength = map.oldValue + map.length - c_2;
              newSubsets.push({
                newValue: map.newValue + map.length - splitLength,
                oldValue: c_2 + 1,
                length: splitLength
              });
              map.length -= splitLength;
            }
          });
        }
        break;
      }
      default:
        console.log("unknown action");
    }
    if (node.subsets) {
      node.subsets = node.subsets.filter(function(map) {
        return !map.delete && map.oldValue !== map.newValue;
      });
      if (newSubsets.length) {
        node.subsets = node.subsets.concat(newSubsets);
      }
    }
    options.postVirtualDiffApply({
      node: info.node,
      diff: info.diff,
      newNode
    });
    return;
  }
  function applyVirtual(tree, diffs, options) {
    diffs.forEach(function(diff) {
      applyVirtualDiff(tree, diff, options);
    });
    return true;
  }
  function nodeToObj(aNode, options) {
    if (options === void 0) {
      options = { valueDiffing: true };
    }
    var objNode = {
      nodeName: aNode.nodeName
    };
    if (checkElementType(aNode, "Text", "Comment")) {
      objNode.data = aNode.data;
    } else {
      if (aNode.attributes && aNode.attributes.length > 0) {
        objNode.attributes = {};
        var nodeArray = Array.prototype.slice.call(aNode.attributes);
        nodeArray.forEach(function(attribute) {
          return objNode.attributes[attribute.name] = attribute.value;
        });
      }
      if (aNode.childNodes && aNode.childNodes.length > 0) {
        objNode.childNodes = [];
        var nodeArray = Array.prototype.slice.call(aNode.childNodes);
        nodeArray.forEach(function(childNode) {
          return objNode.childNodes.push(nodeToObj(childNode, options));
        });
      }
      if (options.valueDiffing) {
        if (checkElementType(aNode, "HTMLTextAreaElement")) {
          objNode.value = aNode.value;
        }
        if (checkElementType(aNode, "HTMLInputElement") && ["radio", "checkbox"].includes(aNode.type.toLowerCase()) && aNode.checked !== void 0) {
          objNode.checked = aNode.checked;
        } else if (checkElementType(aNode, "HTMLButtonElement", "HTMLDataElement", "HTMLInputElement", "HTMLLIElement", "HTMLMeterElement", "HTMLOptionElement", "HTMLProgressElement", "HTMLParamElement")) {
          objNode.value = aNode.value;
        }
        if (checkElementType(aNode, "HTMLOptionElement")) {
          objNode.selected = aNode.selected;
        }
      }
    }
    return objNode;
  }
  var tagRE = /<\s*\/*[a-zA-Z:_][a-zA-Z0-9:_\-.]*\s*(?:"[^"]*"['"]*|'[^']*'['"]*|[^'"/>])*\/*\s*>|<!--(?:.|\n|\r)*?-->/g;
  var attrRE = /\s([^'"/\s><]+?)[\s/>]|([^\s=]+)=\s?(".*?"|'.*?')/g;
  function unescape(string) {
    return string.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
  }
  var lookup = {
    area: true,
    base: true,
    br: true,
    col: true,
    embed: true,
    hr: true,
    img: true,
    input: true,
    keygen: true,
    link: true,
    menuItem: true,
    meta: true,
    param: true,
    source: true,
    track: true,
    wbr: true
  };
  var parseTag = function(tag, caseSensitive) {
    var res = {
      nodeName: "",
      attributes: {}
    };
    var voidElement = false;
    var type = "tag";
    var tagMatch = tag.match(/<\/?([^\s]+?)[/\s>]/);
    if (tagMatch) {
      res.nodeName = caseSensitive || tagMatch[1] === "svg" ? tagMatch[1] : tagMatch[1].toUpperCase();
      if (lookup[tagMatch[1]] || tag.charAt(tag.length - 2) === "/") {
        voidElement = true;
      }
      if (res.nodeName.startsWith("!--")) {
        var endIndex = tag.indexOf("-->");
        return {
          type: "comment",
          node: {
            nodeName: "#comment",
            data: endIndex !== -1 ? tag.slice(4, endIndex) : ""
          },
          voidElement
        };
      }
    }
    var reg = new RegExp(attrRE);
    var result = null;
    var done = false;
    while (!done) {
      result = reg.exec(tag);
      if (result === null) {
        done = true;
      } else if (result[0].trim()) {
        if (result[1]) {
          var attr = result[1].trim();
          var arr = [attr, ""];
          if (attr.indexOf("=") > -1) {
            arr = attr.split("=");
          }
          res.attributes[arr[0]] = arr[1];
          reg.lastIndex--;
        } else if (result[2]) {
          res.attributes[result[2]] = result[3].trim().substring(1, result[3].length - 1);
        }
      }
    }
    return {
      type,
      node: res,
      voidElement
    };
  };
  var stringToObj = function(html, options) {
    if (options === void 0) {
      options = {
        valueDiffing: true,
        caseSensitive: false
      };
    }
    var result = [];
    var current;
    var level = -1;
    var arr = [];
    var inComponent = false, insideSvg = false;
    if (html.indexOf("<") !== 0) {
      var end = html.indexOf("<");
      result.push({
        nodeName: "#text",
        data: end === -1 ? html : html.substring(0, end)
      });
    }
    html.replace(tagRE, function(tag, index) {
      var isOpen = tag.charAt(1) !== "/";
      var isComment = tag.startsWith("<!--");
      var start = index + tag.length;
      var nextChar = html.charAt(start);
      if (isComment) {
        var comment = parseTag(tag, options.caseSensitive).node;
        if (level < 0) {
          result.push(comment);
          return "";
        }
        var parent_1 = arr[level];
        if (parent_1 && comment.nodeName) {
          if (!parent_1.node.childNodes) {
            parent_1.node.childNodes = [];
          }
          parent_1.node.childNodes.push(comment);
        }
        return "";
      }
      if (isOpen) {
        current = parseTag(tag, options.caseSensitive || insideSvg);
        if (current.node.nodeName === "svg") {
          insideSvg = true;
        }
        level++;
        if (!current.voidElement && !inComponent && nextChar && nextChar !== "<") {
          if (!current.node.childNodes) {
            current.node.childNodes = [];
          }
          var data = unescape(html.slice(start, html.indexOf("<", start)));
          current.node.childNodes.push({
            nodeName: "#text",
            data
          });
          if (options.valueDiffing && current.node.nodeName === "TEXTAREA") {
            current.node.value = data;
          }
        }
        if (level === 0 && current.node.nodeName) {
          result.push(current.node);
        }
        var parent_2 = arr[level - 1];
        if (parent_2 && current.node.nodeName) {
          if (!parent_2.node.childNodes) {
            parent_2.node.childNodes = [];
          }
          parent_2.node.childNodes.push(current.node);
        }
        arr[level] = current;
      }
      if (!isOpen || current.voidElement) {
        if (level > -1 && (current.voidElement || options.caseSensitive && current.node.nodeName === tag.slice(2, -1) || !options.caseSensitive && current.node.nodeName.toUpperCase() === tag.slice(2, -1).toUpperCase())) {
          level--;
          if (level > -1) {
            if (current.node.nodeName === "svg") {
              insideSvg = false;
            }
            current = arr[level];
          }
        }
        if (nextChar !== "<" && nextChar) {
          var childNodes = level === -1 ? result : arr[level].node.childNodes || [];
          var end2 = html.indexOf("<", start);
          var data = unescape(html.slice(start, end2 === -1 ? void 0 : end2));
          childNodes.push({
            nodeName: "#text",
            data
          });
        }
      }
      return "";
    });
    return result[0];
  };
  var DiffFinder = (
    /** @class */
    function() {
      function DiffFinder2(t1Node, t2Node, options) {
        this.options = options;
        this.t1 = typeof Element !== "undefined" && checkElementType(t1Node, "Element") ? nodeToObj(t1Node, this.options) : typeof t1Node === "string" ? stringToObj(t1Node, this.options) : JSON.parse(JSON.stringify(t1Node));
        this.t2 = typeof Element !== "undefined" && checkElementType(t2Node, "Element") ? nodeToObj(t2Node, this.options) : typeof t2Node === "string" ? stringToObj(t2Node, this.options) : JSON.parse(JSON.stringify(t2Node));
        this.diffcount = 0;
        this.foundAll = false;
        if (this.debug) {
          this.t1Orig = typeof Element !== "undefined" && checkElementType(t1Node, "Element") ? nodeToObj(t1Node, this.options) : typeof t1Node === "string" ? stringToObj(t1Node, this.options) : JSON.parse(JSON.stringify(t1Node));
          this.t2Orig = typeof Element !== "undefined" && checkElementType(t2Node, "Element") ? nodeToObj(t2Node, this.options) : typeof t2Node === "string" ? stringToObj(t2Node, this.options) : JSON.parse(JSON.stringify(t2Node));
        }
        this.tracker = new DiffTracker();
      }
      DiffFinder2.prototype.init = function() {
        return this.findDiffs(this.t1, this.t2);
      };
      DiffFinder2.prototype.findDiffs = function(t1, t2) {
        var diffs;
        do {
          if (this.options.debug) {
            this.diffcount += 1;
            if (this.diffcount > this.options.diffcap) {
              throw new Error("surpassed diffcap:".concat(JSON.stringify(this.t1Orig), " -> ").concat(JSON.stringify(this.t2Orig)));
            }
          }
          diffs = this.findNextDiff(t1, t2, []);
          if (diffs.length === 0) {
            if (!isEqual(t1, t2)) {
              if (this.foundAll) {
                console.error("Could not find remaining diffs!");
              } else {
                this.foundAll = true;
                removeDone(t1);
                diffs = this.findNextDiff(t1, t2, []);
              }
            }
          }
          if (diffs.length > 0) {
            this.foundAll = false;
            this.tracker.add(diffs);
            applyVirtual(t1, diffs, this.options);
          }
        } while (diffs.length > 0);
        return this.tracker.list;
      };
      DiffFinder2.prototype.findNextDiff = function(t1, t2, route) {
        var diffs;
        var fdiffs;
        if (this.options.maxDepth && route.length > this.options.maxDepth) {
          return [];
        }
        if (!t1.outerDone) {
          diffs = this.findOuterDiff(t1, t2, route);
          if (this.options.filterOuterDiff) {
            fdiffs = this.options.filterOuterDiff(t1, t2, diffs);
            if (fdiffs) {
              diffs = fdiffs;
            }
          }
          if (diffs.length > 0) {
            t1.outerDone = true;
            return diffs;
          } else {
            t1.outerDone = true;
          }
        }
        if (Object.prototype.hasOwnProperty.call(t1, "data")) {
          return [];
        }
        t1 = t1;
        t2 = t2;
        if (!t1.innerDone) {
          diffs = this.findInnerDiff(t1, t2, route);
          if (diffs.length > 0) {
            return diffs;
          } else {
            t1.innerDone = true;
          }
        }
        if (this.options.valueDiffing && !t1.valueDone) {
          diffs = this.findValueDiff(t1, t2, route);
          if (diffs.length > 0) {
            t1.valueDone = true;
            return diffs;
          } else {
            t1.valueDone = true;
          }
        }
        return [];
      };
      DiffFinder2.prototype.findOuterDiff = function(t1, t2, route) {
        var diffs = [];
        var attr;
        var attr1;
        var attr2;
        var attrLength;
        var pos;
        var i;
        if (t1.nodeName !== t2.nodeName) {
          if (!route.length) {
            throw new Error("Top level nodes have to be of the same kind.");
          }
          return [
            new Diff().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, cleanNode(t1)).setValue(this.options._const.newValue, cleanNode(t2)).setValue(this.options._const.route, route)
          ];
        }
        if (route.length && this.options.diffcap < Math.abs((t1.childNodes || []).length - (t2.childNodes || []).length)) {
          return [
            new Diff().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, cleanNode(t1)).setValue(this.options._const.newValue, cleanNode(t2)).setValue(this.options._const.route, route)
          ];
        }
        if (Object.prototype.hasOwnProperty.call(t1, "data") && t1.data !== t2.data) {
          if (t1.nodeName === "#text") {
            return [
              new Diff().setValue(this.options._const.action, this.options._const.modifyTextElement).setValue(this.options._const.route, route).setValue(this.options._const.oldValue, t1.data).setValue(this.options._const.newValue, t2.data)
            ];
          } else {
            return [
              new Diff().setValue(this.options._const.action, this.options._const.modifyComment).setValue(this.options._const.route, route).setValue(this.options._const.oldValue, t1.data).setValue(this.options._const.newValue, t2.data)
            ];
          }
        }
        t1 = t1;
        t2 = t2;
        attr1 = t1.attributes ? Object.keys(t1.attributes).sort() : [];
        attr2 = t2.attributes ? Object.keys(t2.attributes).sort() : [];
        attrLength = attr1.length;
        for (i = 0; i < attrLength; i++) {
          attr = attr1[i];
          pos = attr2.indexOf(attr);
          if (pos === -1) {
            diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeAttribute).setValue(this.options._const.route, route).setValue(this.options._const.name, attr).setValue(this.options._const.value, t1.attributes[attr]));
          } else {
            attr2.splice(pos, 1);
            if (t1.attributes[attr] !== t2.attributes[attr]) {
              diffs.push(new Diff().setValue(this.options._const.action, this.options._const.modifyAttribute).setValue(this.options._const.route, route).setValue(this.options._const.name, attr).setValue(this.options._const.oldValue, t1.attributes[attr]).setValue(this.options._const.newValue, t2.attributes[attr]));
            }
          }
        }
        attrLength = attr2.length;
        for (i = 0; i < attrLength; i++) {
          attr = attr2[i];
          diffs.push(new Diff().setValue(this.options._const.action, this.options._const.addAttribute).setValue(this.options._const.route, route).setValue(this.options._const.name, attr).setValue(this.options._const.value, t2.attributes[attr]));
        }
        return diffs;
      };
      DiffFinder2.prototype.findInnerDiff = function(t1, t2, route) {
        var t1ChildNodes = t1.childNodes ? t1.childNodes.slice() : [];
        var t2ChildNodes = t2.childNodes ? t2.childNodes.slice() : [];
        var last = Math.max(t1ChildNodes.length, t2ChildNodes.length);
        var childNodesLengthDifference = Math.abs(t1ChildNodes.length - t2ChildNodes.length);
        var diffs = [];
        var index = 0;
        if (!this.options.maxChildCount || last < this.options.maxChildCount) {
          var cachedSubtrees = Boolean(t1.subsets && t1.subsetsAge--);
          var subtrees = cachedSubtrees ? t1.subsets : t1.childNodes && t2.childNodes ? markSubTrees(t1, t2) : [];
          if (subtrees.length > 0) {
            diffs = this.attemptGroupRelocation(t1, t2, subtrees, route, cachedSubtrees);
            if (diffs.length > 0) {
              return diffs;
            }
          }
        }
        for (var i = 0; i < last; i += 1) {
          var e1 = t1ChildNodes[i];
          var e2 = t2ChildNodes[i];
          if (childNodesLengthDifference) {
            if (e1 && !e2) {
              if (e1.nodeName === "#text") {
                diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeTextElement).setValue(this.options._const.route, route.concat(index)).setValue(this.options._const.value, e1.data));
                index -= 1;
              } else {
                diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeElement).setValue(this.options._const.route, route.concat(index)).setValue(this.options._const.element, cleanNode(e1)));
                index -= 1;
              }
            } else if (e2 && !e1) {
              if (e2.nodeName === "#text") {
                diffs.push(new Diff().setValue(this.options._const.action, this.options._const.addTextElement).setValue(this.options._const.route, route.concat(index)).setValue(this.options._const.value, e2.data));
              } else {
                diffs.push(new Diff().setValue(this.options._const.action, this.options._const.addElement).setValue(this.options._const.route, route.concat(index)).setValue(this.options._const.element, cleanNode(e2)));
              }
            }
          }
          if (e1 && e2) {
            if (!this.options.maxChildCount || last < this.options.maxChildCount) {
              diffs = diffs.concat(this.findNextDiff(e1, e2, route.concat(index)));
            } else if (!isEqual(e1, e2)) {
              if (t1ChildNodes.length > t2ChildNodes.length) {
                if (e1.nodeName === "#text") {
                  diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeTextElement).setValue(this.options._const.route, route.concat(index)).setValue(this.options._const.value, e1.data));
                } else {
                  diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeElement).setValue(this.options._const.element, cleanNode(e1)).setValue(this.options._const.route, route.concat(index)));
                }
                t1ChildNodes.splice(i, 1);
                i -= 1;
                index -= 1;
                childNodesLengthDifference -= 1;
              } else if (t1ChildNodes.length < t2ChildNodes.length) {
                diffs = diffs.concat([
                  new Diff().setValue(this.options._const.action, this.options._const.addElement).setValue(this.options._const.element, cleanNode(e2)).setValue(this.options._const.route, route.concat(index))
                ]);
                t1ChildNodes.splice(i, 0, cleanNode(e2));
                childNodesLengthDifference -= 1;
              } else {
                diffs = diffs.concat([
                  new Diff().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, cleanNode(e1)).setValue(this.options._const.newValue, cleanNode(e2)).setValue(this.options._const.route, route.concat(index))
                ]);
              }
            }
          }
          index += 1;
        }
        t1.innerDone = true;
        return diffs;
      };
      DiffFinder2.prototype.attemptGroupRelocation = function(t1, t2, subtrees, route, cachedSubtrees) {
        var gapInformation = getGapInformation(t1, t2, subtrees);
        var gaps1 = gapInformation.gaps1;
        var gaps2 = gapInformation.gaps2;
        var t1ChildNodes = t1.childNodes.slice();
        var t2ChildNodes = t2.childNodes.slice();
        var shortest = Math.min(gaps1.length, gaps2.length);
        var destinationDifferent;
        var toGroup;
        var group;
        var node;
        var similarNode;
        var diffs = [];
        for (var index2 = 0, index1 = 0; index2 < shortest; index1 += 1, index2 += 1) {
          if (cachedSubtrees && (gaps1[index2] === true || gaps2[index2] === true))
            ;
          else if (gaps1[index1] === true) {
            node = t1ChildNodes[index1];
            if (node.nodeName === "#text") {
              if (t2ChildNodes[index2].nodeName === "#text") {
                if (node.data !== t2ChildNodes[index2].data) {
                  var testI = index1;
                  while (t1ChildNodes.length > testI + 1 && t1ChildNodes[testI + 1].nodeName === "#text") {
                    testI += 1;
                    if (t2ChildNodes[index2].data === t1ChildNodes[testI].data) {
                      similarNode = true;
                      break;
                    }
                  }
                  if (!similarNode) {
                    diffs.push(new Diff().setValue(this.options._const.action, this.options._const.modifyTextElement).setValue(this.options._const.route, route.concat(index1)).setValue(this.options._const.oldValue, node.data).setValue(this.options._const.newValue, t2ChildNodes[index2].data));
                  }
                }
              } else {
                diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeTextElement).setValue(this.options._const.route, route.concat(index1)).setValue(this.options._const.value, node.data));
                gaps1.splice(index1, 1);
                t1ChildNodes.splice(index1, 1);
                shortest = Math.min(gaps1.length, gaps2.length);
                index1 -= 1;
                index2 -= 1;
              }
            } else if (gaps2[index2] === true) {
              diffs.push(new Diff().setValue(this.options._const.action, this.options._const.replaceElement).setValue(this.options._const.oldValue, cleanNode(node)).setValue(this.options._const.newValue, cleanNode(t2ChildNodes[index2])).setValue(this.options._const.route, route.concat(index1)));
            } else {
              diffs.push(new Diff().setValue(this.options._const.action, this.options._const.removeElement).setValue(this.options._const.route, route.concat(index1)).setValue(this.options._const.element, cleanNode(node)));
              gaps1.splice(index1, 1);
              t1ChildNodes.splice(index1, 1);
              shortest = Math.min(gaps1.length, gaps2.length);
              index1 -= 1;
              index2 -= 1;
            }
          } else if (gaps2[index2] === true) {
            node = t2ChildNodes[index2];
            if (node.nodeName === "#text") {
              diffs.push(new Diff().setValue(this.options._const.action, this.options._const.addTextElement).setValue(this.options._const.route, route.concat(index1)).setValue(this.options._const.value, node.data));
              gaps1.splice(index1, 0, true);
              t1ChildNodes.splice(index1, 0, {
                nodeName: "#text",
                data: node.data
              });
              shortest = Math.min(gaps1.length, gaps2.length);
            } else {
              diffs.push(new Diff().setValue(this.options._const.action, this.options._const.addElement).setValue(this.options._const.route, route.concat(index1)).setValue(this.options._const.element, cleanNode(node)));
              gaps1.splice(index1, 0, true);
              t1ChildNodes.splice(index1, 0, cleanNode(node));
              shortest = Math.min(gaps1.length, gaps2.length);
            }
          } else if (gaps1[index1] !== gaps2[index2]) {
            if (diffs.length > 0) {
              return diffs;
            }
            group = subtrees[gaps1[index1]];
            toGroup = Math.min(group.newValue, t1ChildNodes.length - group.length);
            if (toGroup !== group.oldValue) {
              destinationDifferent = false;
              for (var j = 0; j < group.length; j += 1) {
                if (!roughlyEqual(t1ChildNodes[toGroup + j], t1ChildNodes[group.oldValue + j], {}, false, true)) {
                  destinationDifferent = true;
                }
              }
              if (destinationDifferent) {
                return [
                  new Diff().setValue(this.options._const.action, this.options._const.relocateGroup).setValue(this.options._const.groupLength, group.length).setValue(this.options._const.from, group.oldValue).setValue(this.options._const.to, toGroup).setValue(this.options._const.route, route)
                ];
              }
            }
          }
        }
        return diffs;
      };
      DiffFinder2.prototype.findValueDiff = function(t1, t2, route) {
        var diffs = [];
        if (t1.selected !== t2.selected) {
          diffs.push(new Diff().setValue(this.options._const.action, this.options._const.modifySelected).setValue(this.options._const.oldValue, t1.selected).setValue(this.options._const.newValue, t2.selected).setValue(this.options._const.route, route));
        }
        if ((t1.value || t2.value) && t1.value !== t2.value && t1.nodeName !== "OPTION") {
          diffs.push(new Diff().setValue(this.options._const.action, this.options._const.modifyValue).setValue(this.options._const.oldValue, t1.value || "").setValue(this.options._const.newValue, t2.value || "").setValue(this.options._const.route, route));
        }
        if (t1.checked !== t2.checked) {
          diffs.push(new Diff().setValue(this.options._const.action, this.options._const.modifyChecked).setValue(this.options._const.oldValue, t1.checked).setValue(this.options._const.newValue, t2.checked).setValue(this.options._const.route, route));
        }
        return diffs;
      };
      return DiffFinder2;
    }()
  );
  var DEFAULT_OPTIONS = {
    debug: false,
    diffcap: 10,
    maxDepth: false,
    maxChildCount: 50,
    valueDiffing: true,
    // syntax: textDiff: function (node, currentValue, expectedValue, newValue)
    textDiff: function(node, currentValue, expectedValue, newValue) {
      node.data = newValue;
      return;
    },
    // empty functions were benchmarked as running faster than both
    // `f && f()` and `if (f) { f(); }`
    preVirtualDiffApply: function() {
    },
    postVirtualDiffApply: function() {
    },
    preDiffApply: function() {
    },
    postDiffApply: function() {
    },
    filterOuterDiff: null,
    compress: false,
    _const: false,
    document: typeof window !== "undefined" && window.document ? window.document : false,
    components: []
    // list of components used for converting from string
  };
  var DiffDOM = (
    /** @class */
    function() {
      function DiffDOM2(options) {
        if (options === void 0) {
          options = {};
        }
        Object.entries(DEFAULT_OPTIONS).forEach(function(_a) {
          var key = _a[0], value = _a[1];
          if (!Object.prototype.hasOwnProperty.call(options, key)) {
            options[key] = value;
          }
        });
        if (!options._const) {
          var varNames = [
            "addAttribute",
            "modifyAttribute",
            "removeAttribute",
            "modifyTextElement",
            "relocateGroup",
            "removeElement",
            "addElement",
            "removeTextElement",
            "addTextElement",
            "replaceElement",
            "modifyValue",
            "modifyChecked",
            "modifySelected",
            "modifyComment",
            "action",
            "route",
            "oldValue",
            "newValue",
            "element",
            "group",
            "groupLength",
            "from",
            "to",
            "name",
            "value",
            "data",
            "attributes",
            "nodeName",
            "childNodes",
            "checked",
            "selected"
          ];
          var constNames_1 = {};
          if (options.compress) {
            varNames.forEach(function(varName, index) {
              return constNames_1[varName] = index;
            });
          } else {
            varNames.forEach(function(varName) {
              return constNames_1[varName] = varName;
            });
          }
          options._const = constNames_1;
        }
        this.options = options;
      }
      DiffDOM2.prototype.apply = function(tree, diffs) {
        return applyDOM(tree, diffs, this.options);
      };
      DiffDOM2.prototype.undo = function(tree, diffs) {
        return undoDOM(tree, diffs, this.options);
      };
      DiffDOM2.prototype.diff = function(t1Node, t2Node) {
        var finder = new DiffFinder(t1Node, t2Node, this.options);
        return finder.init();
      };
      return DiffDOM2;
    }()
  );
  var TraceLogger = (
    /** @class */
    function() {
      function TraceLogger2(obj) {
        var _this = this;
        if (obj === void 0) {
          obj = {};
        }
        this.pad = "\u2502   ";
        this.padding = "";
        this.tick = 1;
        this.messages = [];
        var wrapkey = function(obj2, key2) {
          var oldfn = obj2[key2];
          obj2[key2] = function() {
            var arguments$1 = arguments;
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
              args[_i] = arguments$1[_i];
            }
            _this.fin(key2, Array.prototype.slice.call(args));
            var result = oldfn.apply(obj2, args);
            _this.fout(key2, result);
            return result;
          };
        };
        for (var key in obj) {
          if (typeof obj[key] === "function") {
            wrapkey(obj, key);
          }
        }
        this.log("\u250C TRACELOG START");
      }
      TraceLogger2.prototype.fin = function(fn, args) {
        this.padding += this.pad;
        this.log("\u251C\u2500> entering ".concat(fn), args);
      };
      TraceLogger2.prototype.fout = function(fn, result) {
        this.log("\u2502<\u2500\u2500\u2518 generated return value", result);
        this.padding = this.padding.substring(0, this.padding.length - this.pad.length);
      };
      TraceLogger2.prototype.format = function(s, tick) {
        var nf = function(t) {
          var tStr = "".concat(t);
          while (tStr.length < 4) {
            tStr = "0".concat(t);
          }
          return tStr;
        };
        return "".concat(nf(tick), "> ").concat(this.padding).concat(s);
      };
      TraceLogger2.prototype.log = function() {
        var arguments$1 = arguments;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments$1[_i];
        }
        var stringCollapse = function(v) {
          if (!v) {
            return "<falsey>";
          }
          if (typeof v === "string") {
            return v;
          }
          if (checkElementType(v, "HTMLElement")) {
            return v.outerHTML || "<empty>";
          }
          if (v instanceof Array) {
            return "[".concat(v.map(stringCollapse).join(","), "]");
          }
          return v.toString() || v.valueOf() || "<unknown>";
        };
        var s = args.map(stringCollapse).join(", ");
        this.messages.push(this.format(s, this.tick++));
      };
      TraceLogger2.prototype.toString = function() {
        var cap = "\xD7   ";
        var terminator = "\u2514\u2500\u2500\u2500";
        while (terminator.length <= this.padding.length + this.pad.length) {
          terminator += cap;
        }
        var _ = this.padding;
        this.padding = "";
        terminator = this.format(terminator, this.tick);
        this.padding = _;
        return "".concat(this.messages.join("\n"), "\n").concat(terminator);
      };
      return TraceLogger2;
    }()
  );

  // ../../packages/client/dist/handler.js
  function handleMessage(socket, message) {
    switch (message.type) {
      case "update_component": {
        handleUpdateComponentMessage(socket, message);
      }
    }
  }
  function handleUpdateComponentMessage(socket, message) {
    console.log("[Client] Received update_component message: ", message);
    const element = document.querySelector(`[live-id="${message.data.liveID}"][live-component="${message.data.componentName}"]`);
    if (!element) {
      console.error("[Client] Element not found", message.data.liveID, message.data.componentName);
      window.location.reload();
      return;
    }
    const patch = JSON.parse(message.data.patch);
    const patcher = new DiffDOM();
    patcher.apply(element, patch);
  }

  // ../../packages/client/dist/socket.js
  var LiveSocket = class {
    constructor(url) {
      __publicField(this, "url");
      __publicField(this, "ws");
      this.url = url;
      this.url = url;
    }
    onOpen() {
      console.log("[Client] Connected to " + this.url);
      const liveElements = document.querySelectorAll("[live-component]");
      for (let i = 0; i < liveElements.length; i++) {
        const element = liveElements[i];
        this.register(element);
      }
    }
    onClose() {
      console.log("[Client] Disconnected from " + this.url);
    }
    onMessage(message) {
      console.log("[Client] Received message: ", message.type);
      handleMessage(this, message);
    }
    connect() {
      console.log("[Client] Connecting to " + this.url);
      this.ws = new WebSocket(this.url);
      this.ws.onopen = this.onOpen.bind(this);
      this.ws.onclose = this.onClose.bind(this);
      this.ws.onmessage = (event) => {
        this.onMessage(JSON.parse(event.data));
      };
    }
    send(message) {
      if (this.ws) {
        this.ws.send(JSON.stringify(message));
      }
    }
    register(element) {
      const componentName = element.getAttribute("live-component");
      const liveID = element.getAttribute("live-id");
      if (!componentName || !liveID) {
        return;
      }
      this.send({
        type: "register",
        data: {
          componentName,
          liveID
        }
      });
    }
  };

  // src/client/client.ts
  console.log("client.ts is loading");
  async function main() {
    let protocol = "ws";
    if (window.location.protocol === "https:") {
      protocol = "wss";
    }
    const url = protocol + "://" + window.location.host + "/live";
    const socket = new LiveSocket(url);
    socket.connect();
  }
  main().catch((err) => {
    console.error(err);
  });
})();
//# sourceMappingURL=client.js.map
