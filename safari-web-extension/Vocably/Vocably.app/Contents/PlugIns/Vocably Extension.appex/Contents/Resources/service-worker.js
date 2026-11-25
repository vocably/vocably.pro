/*!
 * Hello to whoever is reading this! I think you are cool 🤜🤛
 *
 * I did not obfuscate the code to help you better understand it.
 * However, I don't know how to disable minification of web components (StencilJS).
 * Sorry, I didn't look too hard!
 * The code of the entire project is available at:
 * https://github.com/vocably/language-learning-tool
 *
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 2763
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";


const validator = __webpack_require__(919);
const XMLParser = __webpack_require__(6226);
const XMLBuilder = __webpack_require__(5181);

module.exports = {
  XMLParser: XMLParser,
  XMLValidator: validator,
  XMLBuilder: XMLBuilder
}

/***/ },

/***/ 9998
(module) {

function getIgnoreAttributesFn(ignoreAttributes) {
    if (typeof ignoreAttributes === 'function') {
        return ignoreAttributes
    }
    if (Array.isArray(ignoreAttributes)) {
        return (attrName) => {
            for (const pattern of ignoreAttributes) {
                if (typeof pattern === 'string' && attrName === pattern) {
                    return true
                }
                if (pattern instanceof RegExp && pattern.test(attrName)) {
                    return true
                }
            }
        }
    }
    return () => false
}

module.exports = getIgnoreAttributesFn

/***/ },

/***/ 1209
(__unused_webpack_module, exports) {

"use strict";


const nameStartChar = ':A-Za-z_\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
const nameChar = nameStartChar + '\\-.\\d\\u00B7\\u0300-\\u036F\\u203F-\\u2040';
const nameRegexp = '[' + nameStartChar + '][' + nameChar + ']*'
const regexName = new RegExp('^' + nameRegexp + '$');

const getAllMatches = function (string, regex) {
  const matches = [];
  let match = regex.exec(string);
  while (match) {
    const allmatches = [];
    allmatches.startIndex = regex.lastIndex - match[0].length;
    const len = match.length;
    for (let index = 0; index < len; index++) {
      allmatches.push(match[index]);
    }
    matches.push(allmatches);
    match = regex.exec(string);
  }
  return matches;
};

const isName = function (string) {
  const match = regexName.exec(string);
  return !(match === null || typeof match === 'undefined');
};

exports.isExist = function (v) {
  return typeof v !== 'undefined';
};

exports.isEmptyObject = function (obj) {
  return Object.keys(obj).length === 0;
};

/**
 * Copy all the properties of a into b.
 * @param {*} target
 * @param {*} a
 */
exports.merge = function (target, a, arrayMode) {
  if (a) {
    const keys = Object.keys(a); // will return an array of own properties
    const len = keys.length; //don't make it inline
    for (let i = 0; i < len; i++) {
      if (arrayMode === 'strict') {
        target[keys[i]] = [a[keys[i]]];
      } else {
        target[keys[i]] = a[keys[i]];
      }
    }
  }
};
/* exports.merge =function (b,a){
  return Object.assign(b,a);
} */

exports.getValue = function (v) {
  if (exports.isExist(v)) {
    return v;
  } else {
    return '';
  }
};

/**
 * Dangerous property names that could lead to prototype pollution or security issues
 */
const DANGEROUS_PROPERTY_NAMES = [
  // '__proto__',
  // 'constructor',
  // 'prototype',
  'hasOwnProperty',
  'toString',
  'valueOf',
  '__defineGetter__',
  '__defineSetter__',
  '__lookupGetter__',
  '__lookupSetter__'
];

const criticalProperties = ["__proto__", "constructor", "prototype"];

exports.isName = isName;
exports.getAllMatches = getAllMatches;
exports.nameRegexp = nameRegexp;
exports.DANGEROUS_PROPERTY_NAMES = DANGEROUS_PROPERTY_NAMES;
exports.criticalProperties = criticalProperties;


/***/ },

/***/ 919
(__unused_webpack_module, exports, __webpack_require__) {

"use strict";


const util = __webpack_require__(1209);

const defaultOptions = {
  allowBooleanAttributes: false, //A tag can have attributes without any value
  unpairedTags: []
};

//const tagsPattern = new RegExp("<\\/?([\\w:\\-_\.]+)\\s*\/?>","g");
exports.validate = function (xmlData, options) {
  options = Object.assign({}, defaultOptions, options);

  //xmlData = xmlData.replace(/(\r\n|\n|\r)/gm,"");//make it single line
  //xmlData = xmlData.replace(/(^\s*<\?xml.*?\?>)/g,"");//Remove XML starting tag
  //xmlData = xmlData.replace(/(<!DOCTYPE[\s\w\"\.\/\-\:]+(\[.*\])*\s*>)/g,"");//Remove DOCTYPE
  const tags = [];
  let tagFound = false;

  //indicates that the root tag has been closed (aka. depth 0 has been reached)
  let reachedRoot = false;

  if (xmlData[0] === '\ufeff') {
    // check for byte order mark (BOM)
    xmlData = xmlData.substr(1);
  }
  
  for (let i = 0; i < xmlData.length; i++) {

    if (xmlData[i] === '<' && xmlData[i+1] === '?') {
      i+=2;
      i = readPI(xmlData,i);
      if (i.err) return i;
    }else if (xmlData[i] === '<') {
      //starting of tag
      //read until you reach to '>' avoiding any '>' in attribute value
      let tagStartPos = i;
      i++;
      
      if (xmlData[i] === '!') {
        i = readCommentAndCDATA(xmlData, i);
        continue;
      } else {
        let closingTag = false;
        if (xmlData[i] === '/') {
          //closing tag
          closingTag = true;
          i++;
        }
        //read tagname
        let tagName = '';
        for (; i < xmlData.length &&
          xmlData[i] !== '>' &&
          xmlData[i] !== ' ' &&
          xmlData[i] !== '\t' &&
          xmlData[i] !== '\n' &&
          xmlData[i] !== '\r'; i++
        ) {
          tagName += xmlData[i];
        }
        tagName = tagName.trim();
        //console.log(tagName);

        if (tagName[tagName.length - 1] === '/') {
          //self closing tag without attributes
          tagName = tagName.substring(0, tagName.length - 1);
          //continue;
          i--;
        }
        if (!validateTagName(tagName)) {
          let msg;
          if (tagName.trim().length === 0) {
            msg = "Invalid space after '<'.";
          } else {
            msg = "Tag '"+tagName+"' is an invalid name.";
          }
          return getErrorObject('InvalidTag', msg, getLineNumberForPosition(xmlData, i));
        }

        const result = readAttributeStr(xmlData, i);
        if (result === false) {
          return getErrorObject('InvalidAttr', "Attributes for '"+tagName+"' have open quote.", getLineNumberForPosition(xmlData, i));
        }
        let attrStr = result.value;
        i = result.index;

        if (attrStr[attrStr.length - 1] === '/') {
          //self closing tag
          const attrStrStart = i - attrStr.length;
          attrStr = attrStr.substring(0, attrStr.length - 1);
          const isValid = validateAttributeString(attrStr, options);
          if (isValid === true) {
            tagFound = true;
            //continue; //text may presents after self closing tag
          } else {
            //the result from the nested function returns the position of the error within the attribute
            //in order to get the 'true' error line, we need to calculate the position where the attribute begins (i - attrStr.length) and then add the position within the attribute
            //this gives us the absolute index in the entire xml, which we can use to find the line at last
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, attrStrStart + isValid.err.line));
          }
        } else if (closingTag) {
          if (!result.tagClosed) {
            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' doesn't have proper closing.", getLineNumberForPosition(xmlData, i));
          } else if (attrStr.trim().length > 0) {
            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' can't have attributes or invalid starting.", getLineNumberForPosition(xmlData, tagStartPos));
          } else if (tags.length === 0) {
            return getErrorObject('InvalidTag', "Closing tag '"+tagName+"' has not been opened.", getLineNumberForPosition(xmlData, tagStartPos));
          } else {
            const otg = tags.pop();
            if (tagName !== otg.tagName) {
              let openPos = getLineNumberForPosition(xmlData, otg.tagStartPos);
              return getErrorObject('InvalidTag',
                "Expected closing tag '"+otg.tagName+"' (opened in line "+openPos.line+", col "+openPos.col+") instead of closing tag '"+tagName+"'.",
                getLineNumberForPosition(xmlData, tagStartPos));
            }

            //when there are no more tags, we reached the root level.
            if (tags.length == 0) {
              reachedRoot = true;
            }
          }
        } else {
          const isValid = validateAttributeString(attrStr, options);
          if (isValid !== true) {
            //the result from the nested function returns the position of the error within the attribute
            //in order to get the 'true' error line, we need to calculate the position where the attribute begins (i - attrStr.length) and then add the position within the attribute
            //this gives us the absolute index in the entire xml, which we can use to find the line at last
            return getErrorObject(isValid.err.code, isValid.err.msg, getLineNumberForPosition(xmlData, i - attrStr.length + isValid.err.line));
          }

          //if the root level has been reached before ...
          if (reachedRoot === true) {
            return getErrorObject('InvalidXml', 'Multiple possible root nodes found.', getLineNumberForPosition(xmlData, i));
          } else if(options.unpairedTags.indexOf(tagName) !== -1){
            //don't push into stack
          } else {
            tags.push({tagName, tagStartPos});
          }
          tagFound = true;
        }

        //skip tag text value
        //It may include comments and CDATA value
        for (i++; i < xmlData.length; i++) {
          if (xmlData[i] === '<') {
            if (xmlData[i + 1] === '!') {
              //comment or CADATA
              i++;
              i = readCommentAndCDATA(xmlData, i);
              continue;
            } else if (xmlData[i+1] === '?') {
              i = readPI(xmlData, ++i);
              if (i.err) return i;
            } else{
              break;
            }
          } else if (xmlData[i] === '&') {
            const afterAmp = validateAmpersand(xmlData, i);
            if (afterAmp == -1)
              return getErrorObject('InvalidChar', "char '&' is not expected.", getLineNumberForPosition(xmlData, i));
            i = afterAmp;
          }else{
            if (reachedRoot === true && !isWhiteSpace(xmlData[i])) {
              return getErrorObject('InvalidXml', "Extra text at the end", getLineNumberForPosition(xmlData, i));
            }
          }
        } //end of reading tag text value
        if (xmlData[i] === '<') {
          i--;
        }
      }
    } else {
      if ( isWhiteSpace(xmlData[i])) {
        continue;
      }
      return getErrorObject('InvalidChar', "char '"+xmlData[i]+"' is not expected.", getLineNumberForPosition(xmlData, i));
    }
  }

  if (!tagFound) {
    return getErrorObject('InvalidXml', 'Start tag expected.', 1);
  }else if (tags.length == 1) {
      return getErrorObject('InvalidTag', "Unclosed tag '"+tags[0].tagName+"'.", getLineNumberForPosition(xmlData, tags[0].tagStartPos));
  }else if (tags.length > 0) {
      return getErrorObject('InvalidXml', "Invalid '"+
          JSON.stringify(tags.map(t => t.tagName), null, 4).replace(/\r?\n/g, '')+
          "' found.", {line: 1, col: 1});
  }

  return true;
};

function isWhiteSpace(char){
  return char === ' ' || char === '\t' || char === '\n'  || char === '\r';
}
/**
 * Read Processing insstructions and skip
 * @param {*} xmlData
 * @param {*} i
 */
function readPI(xmlData, i) {
  const start = i;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] == '?' || xmlData[i] == ' ') {
      //tagname
      const tagname = xmlData.substr(start, i - start);
      if (i > 5 && tagname === 'xml') {
        return getErrorObject('InvalidXml', 'XML declaration allowed only at the start of the document.', getLineNumberForPosition(xmlData, i));
      } else if (xmlData[i] == '?' && xmlData[i + 1] == '>') {
        //check if valid attribut string
        i++;
        break;
      } else {
        continue;
      }
    }
  }
  return i;
}

function readCommentAndCDATA(xmlData, i) {
  if (xmlData.length > i + 5 && xmlData[i + 1] === '-' && xmlData[i + 2] === '-') {
    //comment
    for (i += 3; i < xmlData.length; i++) {
      if (xmlData[i] === '-' && xmlData[i + 1] === '-' && xmlData[i + 2] === '>') {
        i += 2;
        break;
      }
    }
  } else if (
    xmlData.length > i + 8 &&
    xmlData[i + 1] === 'D' &&
    xmlData[i + 2] === 'O' &&
    xmlData[i + 3] === 'C' &&
    xmlData[i + 4] === 'T' &&
    xmlData[i + 5] === 'Y' &&
    xmlData[i + 6] === 'P' &&
    xmlData[i + 7] === 'E'
  ) {
    let angleBracketsCount = 1;
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === '<') {
        angleBracketsCount++;
      } else if (xmlData[i] === '>') {
        angleBracketsCount--;
        if (angleBracketsCount === 0) {
          break;
        }
      }
    }
  } else if (
    xmlData.length > i + 9 &&
    xmlData[i + 1] === '[' &&
    xmlData[i + 2] === 'C' &&
    xmlData[i + 3] === 'D' &&
    xmlData[i + 4] === 'A' &&
    xmlData[i + 5] === 'T' &&
    xmlData[i + 6] === 'A' &&
    xmlData[i + 7] === '['
  ) {
    for (i += 8; i < xmlData.length; i++) {
      if (xmlData[i] === ']' && xmlData[i + 1] === ']' && xmlData[i + 2] === '>') {
        i += 2;
        break;
      }
    }
  }

  return i;
}

const doubleQuote = '"';
const singleQuote = "'";

/**
 * Keep reading xmlData until '<' is found outside the attribute value.
 * @param {string} xmlData
 * @param {number} i
 */
function readAttributeStr(xmlData, i) {
  let attrStr = '';
  let startChar = '';
  let tagClosed = false;
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === doubleQuote || xmlData[i] === singleQuote) {
      if (startChar === '') {
        startChar = xmlData[i];
      } else if (startChar !== xmlData[i]) {
        //if vaue is enclosed with double quote then single quotes are allowed inside the value and vice versa
      } else {
        startChar = '';
      }
    } else if (xmlData[i] === '>') {
      if (startChar === '') {
        tagClosed = true;
        break;
      }
    }
    attrStr += xmlData[i];
  }
  if (startChar !== '') {
    return false;
  }

  return {
    value: attrStr,
    index: i,
    tagClosed: tagClosed
  };
}

/**
 * Select all the attributes whether valid or invalid.
 */
const validAttrStrRegxp = new RegExp('(\\s*)([^\\s=]+)(\\s*=)?(\\s*([\'"])(([\\s\\S])*?)\\5)?', 'g');

//attr, ="sd", a="amit's", a="sd"b="saf", ab  cd=""

function validateAttributeString(attrStr, options) {
  //console.log("start:"+attrStr+":end");

  //if(attrStr.trim().length === 0) return true; //empty string

  const matches = util.getAllMatches(attrStr, validAttrStrRegxp);
  const attrNames = {};

  for (let i = 0; i < matches.length; i++) {
    if (matches[i][1].length === 0) {
      //nospace before attribute name: a="sd"b="saf"
      return getErrorObject('InvalidAttr', "Attribute '"+matches[i][2]+"' has no space in starting.", getPositionFromMatch(matches[i]))
    } else if (matches[i][3] !== undefined && matches[i][4] === undefined) {
      return getErrorObject('InvalidAttr', "Attribute '"+matches[i][2]+"' is without value.", getPositionFromMatch(matches[i]));
    } else if (matches[i][3] === undefined && !options.allowBooleanAttributes) {
      //independent attribute: ab
      return getErrorObject('InvalidAttr', "boolean attribute '"+matches[i][2]+"' is not allowed.", getPositionFromMatch(matches[i]));
    }
    /* else if(matches[i][6] === undefined){//attribute without value: ab=
                    return { err: { code:"InvalidAttr",msg:"attribute " + matches[i][2] + " has no value assigned."}};
                } */
    const attrName = matches[i][2];
    if (!validateAttrName(attrName)) {
      return getErrorObject('InvalidAttr', "Attribute '"+attrName+"' is an invalid name.", getPositionFromMatch(matches[i]));
    }
    if (!attrNames.hasOwnProperty(attrName)) {
      //check for duplicate attribute.
      attrNames[attrName] = 1;
    } else {
      return getErrorObject('InvalidAttr', "Attribute '"+attrName+"' is repeated.", getPositionFromMatch(matches[i]));
    }
  }

  return true;
}

function validateNumberAmpersand(xmlData, i) {
  let re = /\d/;
  if (xmlData[i] === 'x') {
    i++;
    re = /[\da-fA-F]/;
  }
  for (; i < xmlData.length; i++) {
    if (xmlData[i] === ';')
      return i;
    if (!xmlData[i].match(re))
      break;
  }
  return -1;
}

function validateAmpersand(xmlData, i) {
  // https://www.w3.org/TR/xml/#dt-charref
  i++;
  if (xmlData[i] === ';')
    return -1;
  if (xmlData[i] === '#') {
    i++;
    return validateNumberAmpersand(xmlData, i);
  }
  let count = 0;
  for (; i < xmlData.length; i++, count++) {
    if (xmlData[i].match(/\w/) && count < 20)
      continue;
    if (xmlData[i] === ';')
      break;
    return -1;
  }
  return i;
}

function getErrorObject(code, message, lineNumber) {
  return {
    err: {
      code: code,
      msg: message,
      line: lineNumber.line || lineNumber,
      col: lineNumber.col,
    },
  };
}

function validateAttrName(attrName) {
  return util.isName(attrName);
}

// const startsWithXML = /^xml/i;

function validateTagName(tagname) {
  return util.isName(tagname) /* && !tagname.match(startsWithXML) */;
}

//this function returns the line number for the character at the given index
function getLineNumberForPosition(xmlData, index) {
  const lines = xmlData.substring(0, index).split(/\r?\n/);
  return {
    line: lines.length,

    // column number is last line's length + 1, because column numbering starts at 1:
    col: lines[lines.length - 1].length + 1
  };
}

//this function returns the position of the first character of match within attrStr
function getPositionFromMatch(match) {
  return match.startIndex + match[1].length;
}


/***/ },

/***/ 5181
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

//parse Empty Node as self closing node
const buildFromOrderedJs = __webpack_require__(4655);
const getIgnoreAttributesFn = __webpack_require__(9998)

const defaultOptions = {
  attributeNamePrefix: '@_',
  attributesGroupName: false,
  textNodeName: '#text',
  ignoreAttributes: true,
  cdataPropName: false,
  format: false,
  indentBy: '  ',
  suppressEmptyNode: false,
  suppressUnpairedNode: true,
  suppressBooleanAttributes: true,
  tagValueProcessor: function(key, a) {
    return a;
  },
  attributeValueProcessor: function(attrName, a) {
    return a;
  },
  preserveOrder: false,
  commentPropName: false,
  unpairedTags: [],
  entities: [
    { regex: new RegExp("&", "g"), val: "&amp;" },//it must be on top
    { regex: new RegExp(">", "g"), val: "&gt;" },
    { regex: new RegExp("<", "g"), val: "&lt;" },
    { regex: new RegExp("\'", "g"), val: "&apos;" },
    { regex: new RegExp("\"", "g"), val: "&quot;" }
  ],
  processEntities: true,
  stopNodes: [],
  // transformTagName: false,
  // transformAttributeName: false,
  oneListGroup: false
};

function Builder(options) {
  this.options = Object.assign({}, defaultOptions, options);
  if (this.options.ignoreAttributes === true || this.options.attributesGroupName) {
    this.isAttribute = function(/*a*/) {
      return false;
    };
  } else {
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes)
    this.attrPrefixLen = this.options.attributeNamePrefix.length;
    this.isAttribute = isAttribute;
  }

  this.processTextOrObjNode = processTextOrObjNode

  if (this.options.format) {
    this.indentate = indentate;
    this.tagEndChar = '>\n';
    this.newLine = '\n';
  } else {
    this.indentate = function() {
      return '';
    };
    this.tagEndChar = '>';
    this.newLine = '';
  }
}

Builder.prototype.build = function(jObj) {
  if(this.options.preserveOrder){
    return buildFromOrderedJs(jObj, this.options);
  }else {
    if(Array.isArray(jObj) && this.options.arrayNodeName && this.options.arrayNodeName.length > 1){
      jObj = {
        [this.options.arrayNodeName] : jObj
      }
    }
    return this.j2x(jObj, 0, []).val;
  }
};

Builder.prototype.j2x = function(jObj, level, ajPath) {
  let attrStr = '';
  let val = '';
  const jPath = ajPath.join('.')
  for (let key in jObj) {
    if(!Object.prototype.hasOwnProperty.call(jObj, key)) continue;
    if (typeof jObj[key] === 'undefined') {
      // supress undefined node only if it is not an attribute
      if (this.isAttribute(key)) {
        val += '';
      }
    } else if (jObj[key] === null) {
      // null attribute should be ignored by the attribute list, but should not cause the tag closing
      if (this.isAttribute(key)) {
        val += '';
      } else if (key === this.options.cdataPropName) {
        val += '';
      } else if (key[0] === '?') {
        val += this.indentate(level) + '<' + key + '?' + this.tagEndChar;
      } else {
        val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
      }
      // val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
    } else if (jObj[key] instanceof Date) {
      val += this.buildTextValNode(jObj[key], key, '', level);
    } else if (typeof jObj[key] !== 'object') {
      //premitive type
      const attr = this.isAttribute(key);
      if (attr && !this.ignoreAttributesFn(attr, jPath)) {
        attrStr += this.buildAttrPairStr(attr, '' + jObj[key]);
      } else if (!attr) {
        //tag value
        if (key === this.options.textNodeName) {
          let newval = this.options.tagValueProcessor(key, '' + jObj[key]);
          val += this.replaceEntitiesValue(newval);
        } else {
          val += this.buildTextValNode(jObj[key], key, '', level);
        }
      }
    } else if (Array.isArray(jObj[key])) {
      //repeated nodes
      const arrLen = jObj[key].length;
      let listTagVal = "";
      let listTagAttr = "";
      for (let j = 0; j < arrLen; j++) {
        const item = jObj[key][j];
        if (typeof item === 'undefined') {
          // supress undefined node
        } else if (item === null) {
          if(key[0] === "?") val += this.indentate(level) + '<' + key + '?' + this.tagEndChar;
          else val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
          // val += this.indentate(level) + '<' + key + '/' + this.tagEndChar;
        } else if (typeof item === 'object') {
          if(this.options.oneListGroup){
            const result = this.j2x(item, level + 1, ajPath.concat(key));
            listTagVal += result.val;
            if (this.options.attributesGroupName && item.hasOwnProperty(this.options.attributesGroupName)) {
              listTagAttr += result.attrStr
            }
          }else{
            listTagVal += this.processTextOrObjNode(item, key, level, ajPath)
          }
        } else {
          if (this.options.oneListGroup) {
            let textValue = this.options.tagValueProcessor(key, item);
            textValue = this.replaceEntitiesValue(textValue);
            listTagVal += textValue;
          } else {
            listTagVal += this.buildTextValNode(item, key, '', level);
          }
        }
      }
      if(this.options.oneListGroup){
        listTagVal = this.buildObjectNode(listTagVal, key, listTagAttr, level);
      }
      val += listTagVal;
    } else {
      //nested node
      if (this.options.attributesGroupName && key === this.options.attributesGroupName) {
        const Ks = Object.keys(jObj[key]);
        const L = Ks.length;
        for (let j = 0; j < L; j++) {
          attrStr += this.buildAttrPairStr(Ks[j], '' + jObj[key][Ks[j]]);
        }
      } else {
        val += this.processTextOrObjNode(jObj[key], key, level, ajPath)
      }
    }
  }
  return {attrStr: attrStr, val: val};
};

Builder.prototype.buildAttrPairStr = function(attrName, val){
  val = this.options.attributeValueProcessor(attrName, '' + val);
  val = this.replaceEntitiesValue(val);
  if (this.options.suppressBooleanAttributes && val === "true") {
    return ' ' + attrName;
  } else return ' ' + attrName + '="' + val + '"';
}

function processTextOrObjNode (object, key, level, ajPath) {
  const result = this.j2x(object, level + 1, ajPath.concat(key));
  if (object[this.options.textNodeName] !== undefined && Object.keys(object).length === 1) {
    return this.buildTextValNode(object[this.options.textNodeName], key, result.attrStr, level);
  } else {
    return this.buildObjectNode(result.val, key, result.attrStr, level);
  }
}

Builder.prototype.buildObjectNode = function(val, key, attrStr, level) {
  if(val === ""){
    if(key[0] === "?") return  this.indentate(level) + '<' + key + attrStr+ '?' + this.tagEndChar;
    else {
      return this.indentate(level) + '<' + key + attrStr + this.closeTag(key) + this.tagEndChar;
    }
  }else{

    let tagEndExp = '</' + key + this.tagEndChar;
    let piClosingChar = "";
    
    if(key[0] === "?") {
      piClosingChar = "?";
      tagEndExp = "";
    }
  
    // attrStr is an empty string in case the attribute came as undefined or null
    if ((attrStr || attrStr === '') && val.indexOf('<') === -1) {
      return ( this.indentate(level) + '<' +  key + attrStr + piClosingChar + '>' + val + tagEndExp );
    } else if (this.options.commentPropName !== false && key === this.options.commentPropName && piClosingChar.length === 0) {
      return this.indentate(level) + `<!--${val}-->` + this.newLine;
    }else {
      return (
        this.indentate(level) + '<' + key + attrStr + piClosingChar + this.tagEndChar +
        val +
        this.indentate(level) + tagEndExp    );
    }
  }
}

Builder.prototype.closeTag = function(key){
  let closeTag = "";
  if(this.options.unpairedTags.indexOf(key) !== -1){ //unpaired
    if(!this.options.suppressUnpairedNode) closeTag = "/"
  }else if(this.options.suppressEmptyNode){ //empty
    closeTag = "/";
  }else{
    closeTag = `></${key}`
  }
  return closeTag;
}

function buildEmptyObjNode(val, key, attrStr, level) {
  if (val !== '') {
    return this.buildObjectNode(val, key, attrStr, level);
  } else {
    if(key[0] === "?") return  this.indentate(level) + '<' + key + attrStr+ '?' + this.tagEndChar;
    else {
      return  this.indentate(level) + '<' + key + attrStr + '/' + this.tagEndChar;
      // return this.buildTagStr(level,key, attrStr);
    }
  }
}

Builder.prototype.buildTextValNode = function(val, key, attrStr, level) {
  if (this.options.cdataPropName !== false && key === this.options.cdataPropName) {
    return this.indentate(level) + `<![CDATA[${val}]]>` +  this.newLine;
  }else if (this.options.commentPropName !== false && key === this.options.commentPropName) {
    return this.indentate(level) + `<!--${val}-->` +  this.newLine;
  }else if(key[0] === "?") {//PI tag
    return  this.indentate(level) + '<' + key + attrStr+ '?' + this.tagEndChar; 
  }else{
    let textValue = this.options.tagValueProcessor(key, val);
    textValue = this.replaceEntitiesValue(textValue);
  
    if( textValue === ''){
      return this.indentate(level) + '<' + key + attrStr + this.closeTag(key) + this.tagEndChar;
    }else{
      return this.indentate(level) + '<' + key + attrStr + '>' +
         textValue +
        '</' + key + this.tagEndChar;
    }
  }
}

Builder.prototype.replaceEntitiesValue = function(textValue){
  if(textValue && textValue.length > 0 && this.options.processEntities){
    for (let i=0; i<this.options.entities.length; i++) {
      const entity = this.options.entities[i];
      textValue = textValue.replace(entity.regex, entity.val);
    }
  }
  return textValue;
}

function indentate(level) {
  return this.options.indentBy.repeat(level);
}

function isAttribute(name /*, options*/) {
  if (name.startsWith(this.options.attributeNamePrefix) && name !== this.options.textNodeName) {
    return name.substr(this.attrPrefixLen);
  } else {
    return false;
  }
}

module.exports = Builder;


/***/ },

/***/ 4655
(module) {

const EOL = "\n";

/**
 * 
 * @param {array} jArray 
 * @param {any} options 
 * @returns 
 */
function toXml(jArray, options) {
    let indentation = "";
    if (options.format && options.indentBy.length > 0) {
        indentation = EOL;
    }
    return arrToStr(jArray, options, "", indentation);
}

function arrToStr(arr, options, jPath, indentation) {
    let xmlStr = "";
    let isPreviousElementTag = false;


    if (!Array.isArray(arr)) {
        // Non-array values (e.g. string tag values) should be treated as text content
        if (arr !== undefined && arr !== null) {
            let text = arr.toString();
            text = replaceEntitiesValue(text, options);
            return text;
        }
        return "";
    }

    for (let i = 0; i < arr.length; i++) {
        const tagObj = arr[i];
        const tagName = propName(tagObj);
        if (tagName === undefined) continue;

        let newJPath = "";
        if (jPath.length === 0) newJPath = tagName
        else newJPath = `${jPath}.${tagName}`;

        if (tagName === options.textNodeName) {
            let tagText = tagObj[tagName];
            if (!isStopNode(newJPath, options)) {
                tagText = options.tagValueProcessor(tagName, tagText);
                tagText = replaceEntitiesValue(tagText, options);
            }
            if (isPreviousElementTag) {
                xmlStr += indentation;
            }
            xmlStr += tagText;
            isPreviousElementTag = false;
            continue;
        } else if (tagName === options.cdataPropName) {
            if (isPreviousElementTag) {
                xmlStr += indentation;
            }
            xmlStr += `<![CDATA[${tagObj[tagName][0][options.textNodeName]}]]>`;
            isPreviousElementTag = false;
            continue;
        } else if (tagName === options.commentPropName) {
            xmlStr += indentation + `<!--${tagObj[tagName][0][options.textNodeName]}-->`;
            isPreviousElementTag = true;
            continue;
        } else if (tagName[0] === "?") {
            const attStr = attr_to_str(tagObj[":@"], options);
            const tempInd = tagName === "?xml" ? "" : indentation;
            let piTextNodeName = tagObj[tagName][0][options.textNodeName];
            piTextNodeName = piTextNodeName.length !== 0 ? " " + piTextNodeName : ""; //remove extra spacing
            xmlStr += tempInd + `<${tagName}${piTextNodeName}${attStr}?>`;
            isPreviousElementTag = true;
            continue;
        }
        let newIdentation = indentation;
        if (newIdentation !== "") {
            newIdentation += options.indentBy;
        }
        const attStr = attr_to_str(tagObj[":@"], options);
        const tagStart = indentation + `<${tagName}${attStr}`;
        const tagValue = arrToStr(tagObj[tagName], options, newJPath, newIdentation);
        if (options.unpairedTags.indexOf(tagName) !== -1) {
            if (options.suppressUnpairedNode) xmlStr += tagStart + ">";
            else xmlStr += tagStart + "/>";
        } else if ((!tagValue || tagValue.length === 0) && options.suppressEmptyNode) {
            xmlStr += tagStart + "/>";
        } else if (tagValue && tagValue.endsWith(">")) {
            xmlStr += tagStart + `>${tagValue}${indentation}</${tagName}>`;
        } else {
            xmlStr += tagStart + ">";
            if (tagValue && indentation !== "" && (tagValue.includes("/>") || tagValue.includes("</"))) {
                xmlStr += indentation + options.indentBy + tagValue + indentation;
            } else {
                xmlStr += tagValue;
            }
            xmlStr += `</${tagName}>`;
        }
        isPreviousElementTag = true;
    }

    return xmlStr;
}

function propName(obj) {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
        if (key !== ":@") return key;
    }
}

function attr_to_str(attrMap, options) {
    let attrStr = "";
    if (attrMap && !options.ignoreAttributes) {
        for (let attr in attrMap) {
            if (!Object.prototype.hasOwnProperty.call(attrMap, attr)) continue;
            let attrVal = options.attributeValueProcessor(attr, attrMap[attr]);
            attrVal = replaceEntitiesValue(attrVal, options);
            if (attrVal === true && options.suppressBooleanAttributes) {
                attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}`;
            } else {
                attrStr += ` ${attr.substr(options.attributeNamePrefix.length)}="${attrVal}"`;
            }
        }
    }
    return attrStr;
}

function isStopNode(jPath, options) {
    jPath = jPath.substr(0, jPath.length - options.textNodeName.length - 1);
    let tagName = jPath.substr(jPath.lastIndexOf(".") + 1);
    for (let index in options.stopNodes) {
        if (options.stopNodes[index] === jPath || options.stopNodes[index] === "*." + tagName) return true;
    }
    return false;
}

function replaceEntitiesValue(textValue, options) {
    if (textValue && textValue.length > 0 && options.processEntities) {
        for (let i = 0; i < options.entities.length; i++) {
            const entity = options.entities[i];
            textValue = textValue.replace(entity.regex, entity.val);
        }
    }
    return textValue;
}
module.exports = toXml;


/***/ },

/***/ 3233
(module, __unused_webpack_exports, __webpack_require__) {

const util = __webpack_require__(1209);

class DocTypeReader {
    constructor(options) {
        this.suppressValidationErr = !options;
        this.options = options || {};
    }

    readDocType(xmlData, i) {
        const entities = Object.create(null);
        let entityCount = 0;

        if (xmlData[i + 3] === 'O' &&
            xmlData[i + 4] === 'C' &&
            xmlData[i + 5] === 'T' &&
            xmlData[i + 6] === 'Y' &&
            xmlData[i + 7] === 'P' &&
            xmlData[i + 8] === 'E') {

            i = i + 9;
            let angleBracketsCount = 1;
            let hasBody = false, comment = false;
            let exp = "";

            for (; i < xmlData.length; i++) {
                if (xmlData[i] === '<' && !comment) { //Determine the tag type
                    if (hasBody && hasSeq(xmlData, "!ENTITY", i)) {
                        i += 7;
                        let entityName, val;
                        [entityName, val, i] = this.readEntityExp(xmlData, i + 1, this.suppressValidationErr);
                        if (val.indexOf("&") === -1) { //Parameter entities are not supported
                            if (this.options.enabled !== false &&
                                this.options.maxEntityCount != null &&
                                entityCount >= this.options.maxEntityCount) {
                                throw new Error(
                                    `Entity count (${entityCount + 1}) exceeds maximum allowed (${this.options.maxEntityCount})`
                                );
                            }
                            //const escaped = entityName.replace(/[.\-+*:]/g, '\\.');
                            const escaped = entityName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                            entities[entityName] = {
                                regx: RegExp(`&${escaped};`, "g"),
                                val: val
                            };
                            entityCount++;
                        }
                    } else if (hasBody && hasSeq(xmlData, "!ELEMENT", i)) {
                        i += 8; //Not supported
                        const { index } = this.readElementExp(xmlData, i + 1);
                        i = index;
                    } else if (hasBody && hasSeq(xmlData, "!ATTLIST", i)) {
                        i += 8; //Not supported
                        // const {index} = this.readAttlistExp(xmlData,i+1);
                        // i = index;
                    } else if (hasBody && hasSeq(xmlData, "!NOTATION", i)) {
                        i += 9; //Not supported
                        const { index } = this.readNotationExp(xmlData, i + 1, this.suppressValidationErr);
                        i = index;
                    } else if (hasSeq(xmlData, "!--", i)) {
                        comment = true;
                    } else {
                        throw new Error(`Invalid DOCTYPE`);
                    }

                    angleBracketsCount++;
                    exp = "";
                } else if (xmlData[i] === '>') { //Read tag content
                    if (comment) {
                        if (xmlData[i - 1] === "-" && xmlData[i - 2] === "-") {
                            comment = false;
                            angleBracketsCount--;
                        }
                    } else {
                        angleBracketsCount--;
                    }
                    if (angleBracketsCount === 0) {
                        break;
                    }
                } else if (xmlData[i] === '[') {
                    hasBody = true;
                } else {
                    exp += xmlData[i];
                }
            }

            if (angleBracketsCount !== 0) {
                throw new Error(`Unclosed DOCTYPE`);
            }
        } else {
            throw new Error(`Invalid Tag instead of DOCTYPE`);
        }

        return { entities, i };
    }

    readEntityExp(xmlData, i) {
        //External entities are not supported
        //    <!ENTITY ext SYSTEM "http://normal-website.com" >

        //Parameter entities are not supported
        //    <!ENTITY entityname "&anotherElement;">

        //Internal entities are supported
        //    <!ENTITY entityname "replacement text">

        // Skip leading whitespace after <!ENTITY
        i = skipWhitespace(xmlData, i);

        // Read entity name
        let entityName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i]) && xmlData[i] !== '"' && xmlData[i] !== "'") {
            entityName += xmlData[i];
            i++;
        }
        validateEntityName(entityName);

        // Skip whitespace after entity name
        i = skipWhitespace(xmlData, i);

        // Check for unsupported constructs (external entities or parameter entities)
        if (!this.suppressValidationErr) {
            if (xmlData.substring(i, i + 6).toUpperCase() === "SYSTEM") {
                throw new Error("External entities are not supported");
            } else if (xmlData[i] === "%") {
                throw new Error("Parameter entities are not supported");
            }
        }

        // Read entity value (internal entity)
        let entityValue = "";
        [i, entityValue] = this.readIdentifierVal(xmlData, i, "entity");

        // Validate entity size
        if (this.options.enabled !== false &&
            this.options.maxEntitySize != null &&
            entityValue.length > this.options.maxEntitySize) {
            throw new Error(
                `Entity "${entityName}" size (${entityValue.length}) exceeds maximum allowed size (${this.options.maxEntitySize})`
            );
        }

        i--;
        return [entityName, entityValue, i];
    }

    readNotationExp(xmlData, i) {
        // Skip leading whitespace after <!NOTATION
        i = skipWhitespace(xmlData, i);

        // Read notation name
        let notationName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
            notationName += xmlData[i];
            i++;
        }
        !this.suppressValidationErr && validateEntityName(notationName);

        // Skip whitespace after notation name
        i = skipWhitespace(xmlData, i);

        // Check identifier type (SYSTEM or PUBLIC)
        const identifierType = xmlData.substring(i, i + 6).toUpperCase();
        if (!this.suppressValidationErr && identifierType !== "SYSTEM" && identifierType !== "PUBLIC") {
            throw new Error(`Expected SYSTEM or PUBLIC, found "${identifierType}"`);
        }
        i += identifierType.length;

        // Skip whitespace after identifier type
        i = skipWhitespace(xmlData, i);

        // Read public identifier (if PUBLIC)
        let publicIdentifier = null;
        let systemIdentifier = null;

        if (identifierType === "PUBLIC") {
            [i, publicIdentifier] = this.readIdentifierVal(xmlData, i, "publicIdentifier");

            // Skip whitespace after public identifier
            i = skipWhitespace(xmlData, i);

            // Optionally read system identifier
            if (xmlData[i] === '"' || xmlData[i] === "'") {
                [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");
            }
        } else if (identifierType === "SYSTEM") {
            // Read system identifier (mandatory for SYSTEM)
            [i, systemIdentifier] = this.readIdentifierVal(xmlData, i, "systemIdentifier");

            if (!this.suppressValidationErr && !systemIdentifier) {
                throw new Error("Missing mandatory system identifier for SYSTEM notation");
            }
        }

        return { notationName, publicIdentifier, systemIdentifier, index: --i };
    }

    readIdentifierVal(xmlData, i, type) {
        let identifierVal = "";
        const startChar = xmlData[i];
        if (startChar !== '"' && startChar !== "'") {
            throw new Error(`Expected quoted string, found "${startChar}"`);
        }
        i++;

        while (i < xmlData.length && xmlData[i] !== startChar) {
            identifierVal += xmlData[i];
            i++;
        }

        if (xmlData[i] !== startChar) {
            throw new Error(`Unterminated ${type} value`);
        }
        i++;
        return [i, identifierVal];
    }

    readElementExp(xmlData, i) {
        // <!ELEMENT br EMPTY>
        // <!ELEMENT div ANY>
        // <!ELEMENT title (#PCDATA)>
        // <!ELEMENT book (title, author+)>
        // <!ELEMENT name (content-model)>

        // Skip leading whitespace after <!ELEMENT
        i = skipWhitespace(xmlData, i);

        // Read element name
        let elementName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
            elementName += xmlData[i];
            i++;
        }

        // Validate element name
        if (!this.suppressValidationErr && !util.isName(elementName)) {
            throw new Error(`Invalid element name: "${elementName}"`);
        }

        // Skip whitespace after element name
        i = skipWhitespace(xmlData, i);
        let contentModel = "";

        // Expect '(' to start content model
        if (xmlData[i] === "E" && hasSeq(xmlData, "MPTY", i)) {
            i += 4;
        } else if (xmlData[i] === "A" && hasSeq(xmlData, "NY", i)) {
            i += 2;
        } else if (xmlData[i] === "(") {
            i++; // Move past '('

            // Read content model
            while (i < xmlData.length && xmlData[i] !== ")") {
                contentModel += xmlData[i];
                i++;
            }
            if (xmlData[i] !== ")") {
                throw new Error("Unterminated content model");
            }
        } else if (!this.suppressValidationErr) {
            throw new Error(`Invalid Element Expression, found "${xmlData[i]}"`);
        }

        return {
            elementName,
            contentModel: contentModel.trim(),
            index: i
        };
    }

    readAttlistExp(xmlData, i) {
        // Skip leading whitespace after <!ATTLIST
        i = skipWhitespace(xmlData, i);

        // Read element name
        let elementName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
            elementName += xmlData[i];
            i++;
        }

        // Validate element name
        validateEntityName(elementName);

        // Skip whitespace after element name
        i = skipWhitespace(xmlData, i);

        // Read attribute name
        let attributeName = "";
        while (i < xmlData.length && !/\s/.test(xmlData[i])) {
            attributeName += xmlData[i];
            i++;
        }

        // Validate attribute name
        if (!validateEntityName(attributeName)) {
            throw new Error(`Invalid attribute name: "${attributeName}"`);
        }

        // Skip whitespace after attribute name
        i = skipWhitespace(xmlData, i);

        // Read attribute type
        let attributeType = "";
        if (xmlData.substring(i, i + 8).toUpperCase() === "NOTATION") {
            attributeType = "NOTATION";
            i += 8; // Move past "NOTATION"

            // Skip whitespace after "NOTATION"
            i = skipWhitespace(xmlData, i);

            // Expect '(' to start the list of notations
            if (xmlData[i] !== "(") {
                throw new Error(`Expected '(', found "${xmlData[i]}"`);
            }
            i++; // Move past '('

            // Read the list of allowed notations
            let allowedNotations = [];
            while (i < xmlData.length && xmlData[i] !== ")") {
                let notation = "";
                while (i < xmlData.length && xmlData[i] !== "|" && xmlData[i] !== ")") {
                    notation += xmlData[i];
                    i++;
                }

                // Validate notation name
                notation = notation.trim();
                if (!validateEntityName(notation)) {
                    throw new Error(`Invalid notation name: "${notation}"`);
                }

                allowedNotations.push(notation);

                // Skip '|' separator or exit loop
                if (xmlData[i] === "|") {
                    i++; // Move past '|'
                    i = skipWhitespace(xmlData, i); // Skip optional whitespace after '|'
                }
            }

            if (xmlData[i] !== ")") {
                throw new Error("Unterminated list of notations");
            }
            i++; // Move past ')'

            // Store the allowed notations as part of the attribute type
            attributeType += " (" + allowedNotations.join("|") + ")";
        } else {
            // Handle simple types (e.g., CDATA, ID, IDREF, etc.)
            while (i < xmlData.length && !/\s/.test(xmlData[i])) {
                attributeType += xmlData[i];
                i++;
            }

            // Validate simple attribute type
            const validTypes = ["CDATA", "ID", "IDREF", "IDREFS", "ENTITY", "ENTITIES", "NMTOKEN", "NMTOKENS"];
            if (!this.suppressValidationErr && !validTypes.includes(attributeType.toUpperCase())) {
                throw new Error(`Invalid attribute type: "${attributeType}"`);
            }
        }

        // Skip whitespace after attribute type
        i = skipWhitespace(xmlData, i);

        // Read default value
        let defaultValue = "";
        if (xmlData.substring(i, i + 8).toUpperCase() === "#REQUIRED") {
            defaultValue = "#REQUIRED";
            i += 8;
        } else if (xmlData.substring(i, i + 7).toUpperCase() === "#IMPLIED") {
            defaultValue = "#IMPLIED";
            i += 7;
        } else {
            [i, defaultValue] = this.readIdentifierVal(xmlData, i, "ATTLIST");
        }

        return {
            elementName,
            attributeName,
            attributeType,
            defaultValue,
            index: i
        };
    }
}

// Helper functions
const skipWhitespace = (data, index) => {
    while (index < data.length && /\s/.test(data[index])) {
        index++;
    }
    return index;
};

function hasSeq(data, seq, i) {
    for (let j = 0; j < seq.length; j++) {
        if (seq[j] !== data[i + j + 1]) return false;
    }
    return true;
}

function validateEntityName(name) {
    if (util.isName(name))
        return name;
    else
        throw new Error(`Invalid entity name ${name}`);
}

module.exports = DocTypeReader;

/***/ },

/***/ 7063
(__unused_webpack_module, exports, __webpack_require__) {

var __webpack_unused_export__;

const { DANGEROUS_PROPERTY_NAMES, criticalProperties } = __webpack_require__(1209);

const defaultOnDangerousProperty = (name) => {
  if (DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return "__" + name;
  }
  return name;
};
const defaultOptions = {
  preserveOrder: false,
  attributeNamePrefix: '@_',
  attributesGroupName: false,
  textNodeName: '#text',
  ignoreAttributes: true,
  removeNSPrefix: false, // remove NS from tag name or attribute name if true
  allowBooleanAttributes: false, //a tag can have attributes without any value
  //ignoreRootElement : false,
  parseTagValue: true,
  parseAttributeValue: false,
  trimValues: true, //Trim string values of tag and attributes
  cdataPropName: false,
  numberParseOptions: {
    hex: true,
    leadingZeros: true,
    eNotation: true
  },
  tagValueProcessor: function (tagName, val) {
    return val;
  },
  attributeValueProcessor: function (attrName, val) {
    return val;
  },
  stopNodes: [], //nested tags will not be parsed even for errors
  alwaysCreateTextNode: false,
  isArray: () => false,
  commentPropName: false,
  unpairedTags: [],
  processEntities: true,
  htmlEntities: false,
  ignoreDeclaration: false,
  ignorePiTags: false,
  transformTagName: false,
  transformAttributeName: false,
  updateTag: function (tagName, jPath, attrs) {
    return tagName
  },
  // skipEmptyListItem: false
  captureMetaData: false,
  maxNestedTags: 100,
  strictReservedNames: true,
  onDangerousProperty: defaultOnDangerousProperty
};
/**
 * Validates that a property name is safe to use
 * @param {string} propertyName - The property name to validate
 * @param {string} optionName - The option field name (for error message)
 * @throws {Error} If property name is dangerous
 */
function validatePropertyName(propertyName, optionName) {
  if (typeof propertyName !== 'string') {
    return; // Only validate string property names
  }

  const normalized = propertyName.toLowerCase();
  if (DANGEROUS_PROPERTY_NAMES.some(dangerous => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }

  if (criticalProperties.some(dangerous => normalized === dangerous.toLowerCase())) {
    throw new Error(
      `[SECURITY] Invalid ${optionName}: "${propertyName}" is a reserved JavaScript keyword that could cause prototype pollution`
    );
  }
}

/**
 * Normalizes processEntities option for backward compatibility
 * @param {boolean|object} value 
 * @returns {object} Always returns normalized object
 */
function normalizeProcessEntities(value) {
  // Boolean backward compatibility
  if (typeof value === 'boolean') {
    return {
      enabled: value, // true or false
      maxEntitySize: 10000,
      maxExpansionDepth: 10,
      maxTotalExpansions: 1000,
      maxExpandedLength: 100000,
      allowedTags: null,
      tagFilter: null
    };
  }

  // Object config - merge with defaults
  if (typeof value === 'object' && value !== null) {
    return {
      enabled: value.enabled !== false,
      maxEntitySize: Math.max(1, value.maxEntitySize ?? 10000),
      maxExpansionDepth: Math.max(1, value.maxExpansionDepth ?? 10000),
      maxTotalExpansions: Math.max(1, value.maxTotalExpansions ?? Infinity),
      maxExpandedLength: Math.max(1, value.maxExpandedLength ?? 100000),
      maxEntityCount: Math.max(1, value.maxEntityCount ?? 1000),
      allowedTags: value.allowedTags ?? null,
      tagFilter: value.tagFilter ?? null
    };
  }

  // Default to enabled with limits
  return normalizeProcessEntities(true);
}

const buildOptions = function (options) {
  const built = Object.assign({}, defaultOptions, options);


  // Validate property names to prevent prototype pollution
  const propertyNameOptions = [
    { value: built.attributeNamePrefix, name: 'attributeNamePrefix' },
    { value: built.attributesGroupName, name: 'attributesGroupName' },
    { value: built.textNodeName, name: 'textNodeName' },
    { value: built.cdataPropName, name: 'cdataPropName' },
    { value: built.commentPropName, name: 'commentPropName' }
  ];

  for (const { value, name } of propertyNameOptions) {
    if (value) {
      validatePropertyName(value, name);
    }
  }

  if (built.onDangerousProperty === null) {
    built.onDangerousProperty = defaultOnDangerousProperty;
  }

  // Always normalize processEntities for backward compatibility and validation
  built.processEntities = normalizeProcessEntities(built.processEntities);
  //console.debug(built.processEntities)
  return built;
};

exports.buildOptions = buildOptions;
__webpack_unused_export__ = defaultOptions;

/***/ },

/***/ 5139
(module, __unused_webpack_exports, __webpack_require__) {

"use strict";

///@ts-check

const util = __webpack_require__(1209);
const xmlNode = __webpack_require__(5381);
const DocTypeReader = __webpack_require__(3233);
const toNumber = __webpack_require__(8262);
const getIgnoreAttributesFn = __webpack_require__(9998)

// const regx =
//   '<((!\\[CDATA\\[([\\s\\S]*?)(]]>))|((NAME:)?(NAME))([^>]*)>|((\\/)(NAME)\\s*>))([^<]*)'
//   .replace(/NAME/g, util.nameRegexp);

//const tagsRegx = new RegExp("<(\\/?[\\w:\\-\._]+)([^>]*)>(\\s*"+cdataRegx+")*([^<]+)?","g");
//const tagsRegx = new RegExp("<(\\/?)((\\w*:)?([\\w:\\-\._]+))([^>]*)>([^<]*)("+cdataRegx+"([^<]*))*([^<]+)?","g");

class OrderedObjParser {
  constructor(options) {
    this.options = options;
    this.currentNode = null;
    this.tagsNodeStack = [];
    this.docTypeEntities = {};
    this.lastEntities = {
      "apos": { regex: /&(apos|#39|#x27);/g, val: "'" },
      "gt": { regex: /&(gt|#62|#x3E);/g, val: ">" },
      "lt": { regex: /&(lt|#60|#x3C);/g, val: "<" },
      "quot": { regex: /&(quot|#34|#x22);/g, val: "\"" },
    };
    this.ampEntity = { regex: /&(amp|#38|#x26);/g, val: "&" };
    this.htmlEntities = {
      "space": { regex: /&(nbsp|#160);/g, val: " " },
      // "lt" : { regex: /&(lt|#60);/g, val: "<" },
      // "gt" : { regex: /&(gt|#62);/g, val: ">" },
      // "amp" : { regex: /&(amp|#38);/g, val: "&" },
      // "quot" : { regex: /&(quot|#34);/g, val: "\"" },
      // "apos" : { regex: /&(apos|#39);/g, val: "'" },
      "cent": { regex: /&(cent|#162);/g, val: "¢" },
      "pound": { regex: /&(pound|#163);/g, val: "£" },
      "yen": { regex: /&(yen|#165);/g, val: "¥" },
      "euro": { regex: /&(euro|#8364);/g, val: "€" },
      "copyright": { regex: /&(copy|#169);/g, val: "©" },
      "reg": { regex: /&(reg|#174);/g, val: "®" },
      "inr": { regex: /&(inr|#8377);/g, val: "₹" },
      "num_dec": { regex: /&#([0-9]{1,7});/g, val: (_, str) => fromCodePoint(str, 10, "&#") },
      "num_hex": { regex: /&#x([0-9a-fA-F]{1,6});/g, val: (_, str) => fromCodePoint(str, 16, "&#x") },
    };
    this.addExternalEntities = addExternalEntities;
    this.parseXml = parseXml;
    this.parseTextData = parseTextData;
    this.resolveNameSpace = resolveNameSpace;
    this.buildAttributesMap = buildAttributesMap;
    this.isItStopNode = isItStopNode;
    this.replaceEntitiesValue = replaceEntitiesValue;
    this.readStopNodeData = readStopNodeData;
    this.saveTextToParentTag = saveTextToParentTag;
    this.addChild = addChild;
    this.ignoreAttributesFn = getIgnoreAttributesFn(this.options.ignoreAttributes)
    this.entityExpansionCount = 0;
    this.currentExpandedLength = 0;

    if (this.options.stopNodes && this.options.stopNodes.length > 0) {
      this.stopNodesExact = new Set();
      this.stopNodesWildcard = new Set();
      for (let i = 0; i < this.options.stopNodes.length; i++) {
        const stopNodeExp = this.options.stopNodes[i];
        if (typeof stopNodeExp !== 'string') continue;
        if (stopNodeExp.startsWith("*.")) {
          this.stopNodesWildcard.add(stopNodeExp.substring(2));
        } else {
          this.stopNodesExact.add(stopNodeExp);
        }
      }
    }
  }

}

function addExternalEntities(externalEntities) {
  const entKeys = Object.keys(externalEntities);
  for (let i = 0; i < entKeys.length; i++) {
    const ent = entKeys[i];
    const escaped = ent.replace(/[.\-+*:]/g, '\\.');
    this.lastEntities[ent] = {
      regex: new RegExp("&" + escaped + ";", "g"),
      val: externalEntities[ent]
    }
  }
}

/**
 * @param {string} val
 * @param {string} tagName
 * @param {string} jPath
 * @param {boolean} dontTrim
 * @param {boolean} hasAttributes
 * @param {boolean} isLeafNode
 * @param {boolean} escapeEntities
 */
function parseTextData(val, tagName, jPath, dontTrim, hasAttributes, isLeafNode, escapeEntities) {
  if (val !== undefined) {
    if (this.options.trimValues && !dontTrim) {
      val = val.trim();
    }
    if (val.length > 0) {
      if (!escapeEntities) val = this.replaceEntitiesValue(val, tagName, jPath);

      const newval = this.options.tagValueProcessor(tagName, val, jPath, hasAttributes, isLeafNode);
      if (newval === null || newval === undefined) {
        //don't parse
        return val;
      } else if (typeof newval !== typeof val || newval !== val) {
        //overwrite
        return newval;
      } else if (this.options.trimValues) {
        return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
      } else {
        const trimmedVal = val.trim();
        if (trimmedVal === val) {
          return parseValue(val, this.options.parseTagValue, this.options.numberParseOptions);
        } else {
          return val;
        }
      }
    }
  }
}

function resolveNameSpace(tagname) {
  if (this.options.removeNSPrefix) {
    const tags = tagname.split(':');
    const prefix = tagname.charAt(0) === '/' ? '/' : '';
    if (tags[0] === 'xmlns') {
      return '';
    }
    if (tags.length === 2) {
      tagname = prefix + tags[1];
    }
  }
  return tagname;
}

//TODO: change regex to capture NS
//const attrsRegx = new RegExp("([\\w\\-\\.\\:]+)\\s*=\\s*(['\"])((.|\n)*?)\\2","gm");
const attrsRegx = new RegExp('([^\\s=]+)\\s*(=\\s*([\'"])([\\s\\S]*?)\\3)?', 'gm');

function buildAttributesMap(attrStr, jPath, tagName) {
  if (this.options.ignoreAttributes !== true && typeof attrStr === 'string') {
    // attrStr = attrStr.replace(/\r?\n/g, ' ');
    //attrStr = attrStr || attrStr.trim();

    const matches = util.getAllMatches(attrStr, attrsRegx);
    const len = matches.length; //don't make it inline
    const attrs = {};
    for (let i = 0; i < len; i++) {
      const attrName = this.resolveNameSpace(matches[i][1]);
      if (this.ignoreAttributesFn(attrName, jPath)) {
        continue
      }
      let oldVal = matches[i][4];
      let aName = this.options.attributeNamePrefix + attrName;
      if (attrName.length) {
        if (this.options.transformAttributeName) {
          aName = this.options.transformAttributeName(aName);
        }
        aName = sanitizeName(aName, this.options);
        if (oldVal !== undefined) {
          if (this.options.trimValues) {
            oldVal = oldVal.trim();
          }
          oldVal = this.replaceEntitiesValue(oldVal, tagName, jPath);
          const newVal = this.options.attributeValueProcessor(attrName, oldVal, jPath);
          if (newVal === null || newVal === undefined) {
            //don't parse
            attrs[aName] = oldVal;
          } else if (typeof newVal !== typeof oldVal || newVal !== oldVal) {
            //overwrite
            attrs[aName] = newVal;
          } else {
            //parse
            attrs[aName] = parseValue(
              oldVal,
              this.options.parseAttributeValue,
              this.options.numberParseOptions
            );
          }
        } else if (this.options.allowBooleanAttributes) {
          attrs[aName] = true;
        }
      }
    }
    if (!Object.keys(attrs).length) {
      return;
    }
    if (this.options.attributesGroupName) {
      const attrCollection = {};
      attrCollection[this.options.attributesGroupName] = attrs;
      return attrCollection;
    }
    return attrs
  }
}

const parseXml = function (xmlData) {
  xmlData = xmlData.replace(/\r\n?/g, "\n"); //TODO: remove this line
  const xmlObj = new xmlNode('!xml');
  let currentNode = xmlObj;
  let textData = "";
  let jPath = "";

  // Reset entity expansion counters for this document
  this.entityExpansionCount = 0;
  this.currentExpandedLength = 0;

  const docTypeReader = new DocTypeReader(this.options.processEntities);
  for (let i = 0; i < xmlData.length; i++) {//for each char in XML data
    const ch = xmlData[i];
    if (ch === '<') {
      // const nextIndex = i+1;
      // const _2ndChar = xmlData[nextIndex];
      if (xmlData[i + 1] === '/') {//Closing Tag
        const closeIndex = findClosingIndex(xmlData, ">", i, "Closing Tag is not closed.")
        let tagName = xmlData.substring(i + 2, closeIndex).trim();

        if (this.options.removeNSPrefix) {
          const colonIndex = tagName.indexOf(":");
          if (colonIndex !== -1) {
            tagName = tagName.substr(colonIndex + 1);
          }
        }

        if (this.options.transformTagName) {
          tagName = this.options.transformTagName(tagName);
        }

        if (currentNode) {
          textData = this.saveTextToParentTag(textData, currentNode, jPath);
        }

        //check if last tag of nested tag was unpaired tag
        const lastTagName = jPath.substring(jPath.lastIndexOf(".") + 1);
        if (tagName && this.options.unpairedTags.indexOf(tagName) !== -1) {
          throw new Error(`Unpaired tag can not be used as closing tag: </${tagName}>`);
        }
        let propIndex = 0
        if (lastTagName && this.options.unpairedTags.indexOf(lastTagName) !== -1) {
          propIndex = jPath.lastIndexOf('.', jPath.lastIndexOf('.') - 1)
          this.tagsNodeStack.pop();
        } else {
          propIndex = jPath.lastIndexOf(".");
        }
        jPath = jPath.substring(0, propIndex);

        currentNode = this.tagsNodeStack.pop();//avoid recursion, set the parent tag scope
        textData = "";
        i = closeIndex;
      } else if (xmlData[i + 1] === '?') {

        let tagData = readTagExp(xmlData, i, false, "?>");
        if (!tagData) throw new Error("Pi Tag is not closed.");

        textData = this.saveTextToParentTag(textData, currentNode, jPath);
        if ((this.options.ignoreDeclaration && tagData.tagName === "?xml") || this.options.ignorePiTags) {
          //do nothing
        } else {

          const childNode = new xmlNode(tagData.tagName);
          childNode.add(this.options.textNodeName, "");

          if (tagData.tagName !== tagData.tagExp && tagData.attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagData.tagExp, jPath, tagData.tagName);
          }
          this.addChild(currentNode, childNode, jPath, i);
        }


        i = tagData.closeIndex + 1;
      } else if (xmlData.substr(i + 1, 3) === '!--') {
        const endIndex = findClosingIndex(xmlData, "-->", i + 4, "Comment is not closed.")
        if (this.options.commentPropName) {
          const comment = xmlData.substring(i + 4, endIndex - 2);

          textData = this.saveTextToParentTag(textData, currentNode, jPath);

          currentNode.add(this.options.commentPropName, [{ [this.options.textNodeName]: comment }]);
        }
        i = endIndex;
      } else if (xmlData.substr(i + 1, 2) === '!D') {
        const result = docTypeReader.readDocType(xmlData, i);
        this.docTypeEntities = result.entities;
        i = result.i;
      } else if (xmlData.substr(i + 1, 2) === '![') {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "CDATA is not closed.") - 2;
        const tagExp = xmlData.substring(i + 9, closeIndex);

        textData = this.saveTextToParentTag(textData, currentNode, jPath);

        let val = this.parseTextData(tagExp, currentNode.tagname, jPath, true, false, true, true);
        if (val == undefined) val = "";

        //cdata should be set even if it is 0 length string
        if (this.options.cdataPropName) {
          currentNode.add(this.options.cdataPropName, [{ [this.options.textNodeName]: tagExp }]);
        } else {
          currentNode.add(this.options.textNodeName, val);
        }

        i = closeIndex + 2;
      } else {//Opening tag
        let result = readTagExp(xmlData, i, this.options.removeNSPrefix);
        let tagName = result.tagName;
        const rawTagName = result.rawTagName;
        let tagExp = result.tagExp;
        let attrExpPresent = result.attrExpPresent;
        let closeIndex = result.closeIndex;

        if (this.options.transformTagName) {
          //console.log(tagExp, tagName)
          const newTagName = this.options.transformTagName(tagName);
          if (tagExp === tagName) {
            tagExp = newTagName
          }
          tagName = newTagName;
        }

        if (this.options.strictReservedNames &&
          (tagName === this.options.commentPropName
            || tagName === this.options.cdataPropName
            || tagName === this.options.textNodeName
            || tagName === this.options.attributesGroupName
          )) {
          throw new Error(`Invalid tag name: ${tagName}`);
        }

        //save text as child node
        if (currentNode && textData) {
          if (currentNode.tagname !== '!xml') {
            //when nested tag is found
            textData = this.saveTextToParentTag(textData, currentNode, jPath, false);
          }
        }

        //check if last tag was unpaired tag
        const lastTag = currentNode;
        if (lastTag && this.options.unpairedTags.indexOf(lastTag.tagname) !== -1) {
          currentNode = this.tagsNodeStack.pop();
          jPath = jPath.substring(0, jPath.lastIndexOf("."));
        }
        if (tagName !== xmlObj.tagname) {
          jPath += jPath ? "." + tagName : tagName;
        }
        const startIndex = i;
        if (this.isItStopNode(this.stopNodesExact, this.stopNodesWildcard, jPath, tagName)) {
          let tagContent = "";
          //self-closing tag
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") { //remove trailing '/'
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }
            i = result.closeIndex;
          }
          //unpaired tag
          else if (this.options.unpairedTags.indexOf(tagName) !== -1) {

            i = result.closeIndex;
          }
          //normal tag
          else {
            //read until closing tag is found
            const result = this.readStopNodeData(xmlData, rawTagName, closeIndex + 1);
            if (!result) throw new Error(`Unexpected end of ${rawTagName}`);
            i = result.i;
            tagContent = result.tagContent;
          }

          const childNode = new xmlNode(tagName);
          if (tagName !== tagExp && attrExpPresent) {
            childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
          }
          if (tagContent) {
            tagContent = this.parseTextData(tagContent, tagName, jPath, true, attrExpPresent, true, true);
          }

          jPath = jPath.substr(0, jPath.lastIndexOf("."));
          childNode.add(this.options.textNodeName, tagContent);

          this.addChild(currentNode, childNode, jPath, startIndex);
        } else {
          //selfClosing tag
          if (tagExp.length > 0 && tagExp.lastIndexOf("/") === tagExp.length - 1) {
            if (tagName[tagName.length - 1] === "/") { //remove trailing '/'
              tagName = tagName.substr(0, tagName.length - 1);
              jPath = jPath.substr(0, jPath.length - 1);
              tagExp = tagName;
            } else {
              tagExp = tagExp.substr(0, tagExp.length - 1);
            }

            if (this.options.transformTagName) {
              const newTagName = this.options.transformTagName(tagName);
              if (tagExp === tagName) {
                tagExp = newTagName
              }
              tagName = newTagName;
            }

            const childNode = new xmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            jPath = jPath.substr(0, jPath.lastIndexOf("."));
          }
          else if (this.options.unpairedTags.indexOf(tagName) !== -1) {//unpaired tag
            const childNode = new xmlNode(tagName);
            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath);
            }
            this.addChild(currentNode, childNode, jPath, startIndex);
            jPath = jPath.substr(0, jPath.lastIndexOf("."));
            i = result.closeIndex;
            // Continue to next iteration without changing currentNode
            continue;
          }
          //opening tag
          else {
            const childNode = new xmlNode(tagName);
            if (this.tagsNodeStack.length > this.options.maxNestedTags) {
              throw new Error("Maximum nested tags exceeded");
            }
            this.tagsNodeStack.push(currentNode);

            if (tagName !== tagExp && attrExpPresent) {
              childNode[":@"] = this.buildAttributesMap(tagExp, jPath, tagName);
            }
            this.addChild(currentNode, childNode, jPath)
            currentNode = childNode;
          }
          textData = "";
          i = closeIndex;
        }
      }
    } else {
      textData += xmlData[i];
    }
  }
  return xmlObj.child;
}

function addChild(currentNode, childNode, jPath, startIndex) {
  // unset startIndex if not requested
  if (!this.options.captureMetaData) startIndex = undefined;
  const result = this.options.updateTag(childNode.tagname, jPath, childNode[":@"])
  if (result === false) {
    //do nothing
  } else if (typeof result === "string") {
    childNode.tagname = result
    currentNode.addChild(childNode, startIndex);
  } else {
    currentNode.addChild(childNode, startIndex);
  }
}

const replaceEntitiesValue = function (val, tagName, jPath) {
  // Performance optimization: Early return if no entities to replace
  if (val.indexOf('&') === -1) {
    return val;
  }

  const entityConfig = this.options.processEntities;

  if (!entityConfig.enabled) {
    return val;
  }

  // Check tag-specific filtering
  if (entityConfig.allowedTags) {
    if (!entityConfig.allowedTags.includes(tagName)) {
      return val; // Skip entity replacement for current tag as not set
    }
  }

  if (entityConfig.tagFilter) {
    if (!entityConfig.tagFilter(tagName, jPath)) {
      return val; // Skip based on custom filter
    }
  }

  // Replace DOCTYPE entities
  for (let entityName in this.docTypeEntities) {
    const entity = this.docTypeEntities[entityName];
    const matches = val.match(entity.regx);

    if (matches) {
      // Track expansions
      this.entityExpansionCount += matches.length;

      // Check expansion limit
      if (entityConfig.maxTotalExpansions &&
        this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }

      // Store length before replacement
      const lengthBefore = val.length;
      val = val.replace(entity.regx, entity.val);

      // Check expanded length immediately after replacement
      if (entityConfig.maxExpandedLength) {
        this.currentExpandedLength += (val.length - lengthBefore);

        if (this.currentExpandedLength > entityConfig.maxExpandedLength) {
          throw new Error(
            `Total expanded content size exceeded: ${this.currentExpandedLength} > ${entityConfig.maxExpandedLength}`
          );
        }
      }
    }
  }
  if (val.indexOf('&') === -1) return val;  // Early exit

  // Replace standard entities
  for (const entityName of Object.keys(this.lastEntities)) {
    const entity = this.lastEntities[entityName];
    const matches = val.match(entity.regex);
    if (matches) {
      this.entityExpansionCount += matches.length;
      if (entityConfig.maxTotalExpansions &&
        this.entityExpansionCount > entityConfig.maxTotalExpansions) {
        throw new Error(
          `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
        );
      }
    }
    val = val.replace(entity.regex, entity.val);
  }
  if (val.indexOf('&') === -1) return val;  // Early exit

  // Replace HTML entities if enabled
  if (this.options.htmlEntities) {
    for (const entityName of Object.keys(this.htmlEntities)) {
      const entity = this.htmlEntities[entityName];
      const matches = val.match(entity.regex);
      if (matches) {
        //console.log(matches);
        this.entityExpansionCount += matches.length;
        if (entityConfig.maxTotalExpansions &&
          this.entityExpansionCount > entityConfig.maxTotalExpansions) {
          throw new Error(
            `Entity expansion limit exceeded: ${this.entityExpansionCount} > ${entityConfig.maxTotalExpansions}`
          );
        }
      }
      val = val.replace(entity.regex, entity.val);
    }
  }

  // Replace ampersand entity last
  val = val.replace(this.ampEntity.regex, this.ampEntity.val);

  return val;
}

function saveTextToParentTag(textData, parentNode, jPath, isLeafNode) {
  if (textData) { //store previously collected data as textNode
    if (isLeafNode === undefined) isLeafNode = parentNode.child.length === 0

    textData = this.parseTextData(textData,
      parentNode.tagname,
      jPath,
      false,
      parentNode[":@"] ? Object.keys(parentNode[":@"]).length !== 0 : false,
      isLeafNode);

    if (textData !== undefined && textData !== "")
      parentNode.add(this.options.textNodeName, textData);
    textData = "";
  }
  return textData;
}

//TODO: use jPath to simplify the logic
/**
 * @param {Set} stopNodesExact
 * @param {Set} stopNodesWildcard
 * @param {string} jPath
 * @param {string} currentTagName
 */
function isItStopNode(stopNodesExact, stopNodesWildcard, jPath, currentTagName) {
  if (stopNodesWildcard && stopNodesWildcard.has(currentTagName)) return true;
  if (stopNodesExact && stopNodesExact.has(jPath)) return true;
  return false;
}

/**
 * Returns the tag Expression and where it is ending handling single-double quotes situation
 * @param {string} xmlData 
 * @param {number} i starting index
 * @returns 
 */
function tagExpWithClosingIndex(xmlData, i, closingChar = ">") {
  let attrBoundary;
  let tagExp = "";
  for (let index = i; index < xmlData.length; index++) {
    let ch = xmlData[index];
    if (attrBoundary) {
      if (ch === attrBoundary) attrBoundary = "";//reset
    } else if (ch === '"' || ch === "'") {
      attrBoundary = ch;
    } else if (ch === closingChar[0]) {
      if (closingChar[1]) {
        if (xmlData[index + 1] === closingChar[1]) {
          return {
            data: tagExp,
            index: index
          }
        }
      } else {
        return {
          data: tagExp,
          index: index
        }
      }
    } else if (ch === '\t') {
      ch = " "
    }
    tagExp += ch;
  }
}

function findClosingIndex(xmlData, str, i, errMsg) {
  const closingIndex = xmlData.indexOf(str, i);
  if (closingIndex === -1) {
    throw new Error(errMsg)
  } else {
    return closingIndex + str.length - 1;
  }
}

function readTagExp(xmlData, i, removeNSPrefix, closingChar = ">") {
  const result = tagExpWithClosingIndex(xmlData, i + 1, closingChar);
  if (!result) return;
  let tagExp = result.data;
  const closeIndex = result.index;
  const separatorIndex = tagExp.search(/\s/);
  let tagName = tagExp;
  let attrExpPresent = true;
  if (separatorIndex !== -1) {//separate tag name and attributes expression
    tagName = tagExp.substring(0, separatorIndex);
    tagExp = tagExp.substring(separatorIndex + 1).trimStart();
  }

  const rawTagName = tagName;
  if (removeNSPrefix) {
    const colonIndex = tagName.indexOf(":");
    if (colonIndex !== -1) {
      tagName = tagName.substr(colonIndex + 1);
      attrExpPresent = tagName !== result.data.substr(colonIndex + 1);
    }
  }

  return {
    tagName: tagName,
    tagExp: tagExp,
    closeIndex: closeIndex,
    attrExpPresent: attrExpPresent,
    rawTagName: rawTagName,
  }
}
/**
 * find paired tag for a stop node
 * @param {string} xmlData 
 * @param {string} tagName 
 * @param {number} i 
 */
function readStopNodeData(xmlData, tagName, i) {
  const startIndex = i;
  // Starting at 1 since we already have an open tag
  let openTagCount = 1;

  for (; i < xmlData.length; i++) {
    if (xmlData[i] === "<") {
      if (xmlData[i + 1] === "/") {//close tag
        const closeIndex = findClosingIndex(xmlData, ">", i, `${tagName} is not closed`);
        let closeTagName = xmlData.substring(i + 2, closeIndex).trim();
        if (closeTagName === tagName) {
          openTagCount--;
          if (openTagCount === 0) {
            return {
              tagContent: xmlData.substring(startIndex, i),
              i: closeIndex
            }
          }
        }
        i = closeIndex;
      } else if (xmlData[i + 1] === '?') {
        const closeIndex = findClosingIndex(xmlData, "?>", i + 1, "StopNode is not closed.")
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 3) === '!--') {
        const closeIndex = findClosingIndex(xmlData, "-->", i + 3, "StopNode is not closed.")
        i = closeIndex;
      } else if (xmlData.substr(i + 1, 2) === '![') {
        const closeIndex = findClosingIndex(xmlData, "]]>", i, "StopNode is not closed.") - 2;
        i = closeIndex;
      } else {
        const tagData = readTagExp(xmlData, i, '>')

        if (tagData) {
          const openTagName = tagData && tagData.tagName;
          if (openTagName === tagName && tagData.tagExp[tagData.tagExp.length - 1] !== "/") {
            openTagCount++;
          }
          i = tagData.closeIndex;
        }
      }
    }
  }//end for loop
}

function parseValue(val, shouldParse, options) {
  if (shouldParse && typeof val === 'string') {
    //console.log(options)
    const newval = val.trim();
    if (newval === 'true') return true;
    else if (newval === 'false') return false;
    else return toNumber(val, options);
  } else {
    if (util.isExist(val)) {
      return val;
    } else {
      return '';
    }
  }
}

function fromCodePoint(str, base, prefix) {
  const codePoint = Number.parseInt(str, base);

  if (codePoint >= 0 && codePoint <= 0x10FFFF) {
    return String.fromCodePoint(codePoint);
  } else {
    return prefix + str + ";";
  }
}

function sanitizeName(name, options) {
  if (util.criticalProperties.includes(name)) {
    throw new Error(`[SECURITY] Invalid name: "${name}" is a reserved JavaScript keyword that could cause prototype pollution`);
  } else if (util.DANGEROUS_PROPERTY_NAMES.includes(name)) {
    return options.onDangerousProperty(name);
  }
  return name;
}

module.exports = OrderedObjParser;



/***/ },

/***/ 6226
(module, __unused_webpack_exports, __webpack_require__) {

const { buildOptions} = __webpack_require__(7063);
const OrderedObjParser = __webpack_require__(5139);
const { prettify} = __webpack_require__(896);
const validator = __webpack_require__(919);

class XMLParser{
    
    constructor(options){
        this.externalEntities = {};
        this.options = buildOptions(options);
        
    }
    /**
     * Parse XML dats to JS object 
     * @param {string|Buffer} xmlData 
     * @param {boolean|Object} validationOption 
     */
    parse(xmlData,validationOption){
        if(typeof xmlData === "string"){
        }else if( xmlData.toString){
            xmlData = xmlData.toString();
        }else{
            throw new Error("XML data is accepted in String or Bytes[] form.")
        }
        if( validationOption){
            if(validationOption === true) validationOption = {}; //validate with default options
            
            const result = validator.validate(xmlData, validationOption);
            if (result !== true) {
              throw Error( `${result.err.msg}:${result.err.line}:${result.err.col}` )
            }
          }
        const orderedObjParser = new OrderedObjParser(this.options);
        orderedObjParser.addExternalEntities(this.externalEntities);
        const orderedResult = orderedObjParser.parseXml(xmlData);
        if(this.options.preserveOrder || orderedResult === undefined) return orderedResult;
        else return prettify(orderedResult, this.options);
    }

    /**
     * Add Entity which is not by default supported by this library
     * @param {string} key 
     * @param {string} value 
     */
    addEntity(key, value){
        if(value.indexOf("&") !== -1){
            throw new Error("Entity value can't have '&'")
        }else if(key.indexOf("&") !== -1 || key.indexOf(";") !== -1){
            throw new Error("An entity must be set without '&' and ';'. Eg. use '#xD' for '&#xD;'")
        }else if(value === "&"){
            throw new Error("An entity with value '&' is not permitted");
        }else{
            this.externalEntities[key] = value;
        }
    }
}

module.exports = XMLParser;

/***/ },

/***/ 896
(__unused_webpack_module, exports) {

"use strict";


/**
 * 
 * @param {array} node 
 * @param {any} options 
 * @returns 
 */
function prettify(node, options){
  return compress( node, options);
}

/**
 * 
 * @param {array} arr 
 * @param {object} options 
 * @param {string} jPath 
 * @returns object
 */
function compress(arr, options, jPath){
  let text;
  const compressedObj = {};
  for (let i = 0; i < arr.length; i++) {
    const tagObj = arr[i];
    const property = propName(tagObj);
    let newJpath = "";
    if(jPath === undefined) newJpath = property;
    else newJpath = jPath + "." + property;

    if(property === options.textNodeName){
      if(text === undefined) text = tagObj[property];
      else text += "" + tagObj[property];
    }else if(property === undefined){
      continue;
    }else if(tagObj[property]){
      
      let val = compress(tagObj[property], options, newJpath);
      const isLeaf = isLeafTag(val, options);

      if(tagObj[":@"]){
        assignAttributes( val, tagObj[":@"], newJpath, options);
      }else if(Object.keys(val).length === 1 && val[options.textNodeName] !== undefined && !options.alwaysCreateTextNode){
        val = val[options.textNodeName];
      }else if(Object.keys(val).length === 0){
        if(options.alwaysCreateTextNode) val[options.textNodeName] = "";
        else val = "";
      }

      if(compressedObj[property] !== undefined && compressedObj.hasOwnProperty(property)) {
        if(!Array.isArray(compressedObj[property])) {
            compressedObj[property] = [ compressedObj[property] ];
        }
        compressedObj[property].push(val);
      }else{
        //TODO: if a node is not an array, then check if it should be an array
        //also determine if it is a leaf node
        if (options.isArray(property, newJpath, isLeaf )) {
          compressedObj[property] = [val];
        }else{
          compressedObj[property] = val;
        }
      }
    }
    
  }
  // if(text && text.length > 0) compressedObj[options.textNodeName] = text;
  if(typeof text === "string"){
    if(text.length > 0) compressedObj[options.textNodeName] = text;
  }else if(text !== undefined) compressedObj[options.textNodeName] = text;
  return compressedObj;
}

function propName(obj){
  const keys = Object.keys(obj);
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    if(key !== ":@") return key;
  }
}

function assignAttributes(obj, attrMap, jpath, options){
  if (attrMap) {
    const keys = Object.keys(attrMap);
    const len = keys.length; //don't make it inline
    for (let i = 0; i < len; i++) {
      const atrrName = keys[i];
      if (options.isArray(atrrName, jpath + "." + atrrName, true, true)) {
        obj[atrrName] = [ attrMap[atrrName] ];
      } else {
        obj[atrrName] = attrMap[atrrName];
      }
    }
  }
}

function isLeafTag(obj, options){
  const { textNodeName } = options;
  const propCount = Object.keys(obj).length;
  
  if (propCount === 0) {
    return true;
  }

  if (
    propCount === 1 &&
    (obj[textNodeName] || typeof obj[textNodeName] === "boolean" || obj[textNodeName] === 0)
  ) {
    return true;
  }

  return false;
}
exports.prettify = prettify;


/***/ },

/***/ 5381
(module) {

"use strict";


class XmlNode{
  constructor(tagname) {
    this.tagname = tagname;
    this.child = []; //nested tags, text, cdata, comments in order
    this[":@"] = {}; //attributes map
  }
  add(key,val){
    // this.child.push( {name : key, val: val, isCdata: isCdata });
    if(key === "__proto__") key = "#__proto__";
    this.child.push( {[key]: val });
  }
  addChild(node) {
    if(node.tagname === "__proto__") node.tagname = "#__proto__";
    if(node[":@"] && Object.keys(node[":@"]).length > 0){
      this.child.push( { [node.tagname]: node.child, [":@"]: node[":@"] });
    }else{
      this.child.push( { [node.tagname]: node.child });
    }
  };
};


module.exports = XmlNode;

/***/ },

/***/ 8262
(module) {

const hexRegex = /^[-+]?0x[a-fA-F0-9]+$/;
const numRegex = /^([\-\+])?(0*)([0-9]*(\.[0-9]*)?)$/;
// const octRegex = /^0x[a-z0-9]+/;
// const binRegex = /0x[a-z0-9]+/;

 
const consider = {
    hex :  true,
    // oct: false,
    leadingZeros: true,
    decimalPoint: "\.",
    eNotation: true,
    //skipLike: /regex/
};

function toNumber(str, options = {}){
    options = Object.assign({}, consider, options );
    if(!str || typeof str !== "string" ) return str;
    
    let trimmedStr  = str.trim();
    
    if(options.skipLike !== undefined && options.skipLike.test(trimmedStr)) return str;
    else if(str==="0") return 0;
    else if (options.hex && hexRegex.test(trimmedStr)) {
        return parse_int(trimmedStr, 16);
    // }else if (options.oct && octRegex.test(str)) {
    //     return Number.parseInt(val, 8);
    }else if (trimmedStr.search(/[eE]/)!== -1) { //eNotation
        const notation = trimmedStr.match(/^([-\+])?(0*)([0-9]*(\.[0-9]*)?[eE][-\+]?[0-9]+)$/); 
        // +00.123 => [ , '+', '00', '.123', ..
        if(notation){
            // console.log(notation)
            if(options.leadingZeros){ //accept with leading zeros
                trimmedStr = (notation[1] || "") + notation[3];
            }else{
                if(notation[2] === "0" && notation[3][0]=== "."){ //valid number
                }else{
                    return str;
                }
            }
            return options.eNotation ? Number(trimmedStr) : str;
        }else{
            return str;
        }
    // }else if (options.parseBin && binRegex.test(str)) {
    //     return Number.parseInt(val, 2);
    }else{
        //separate negative sign, leading zeros, and rest number
        const match = numRegex.exec(trimmedStr);
        // +00.123 => [ , '+', '00', '.123', ..
        if(match){
            const sign = match[1];
            const leadingZeros = match[2];
            let numTrimmedByZeros = trimZeros(match[3]); //complete num without leading zeros
            //trim ending zeros for floating number
            
            if(!options.leadingZeros && leadingZeros.length > 0 && sign && trimmedStr[2] !== ".") return str; //-0123
            else if(!options.leadingZeros && leadingZeros.length > 0 && !sign && trimmedStr[1] !== ".") return str; //0123
            else if(options.leadingZeros && leadingZeros===str) return 0; //00
            
            else{//no leading zeros or leading zeros are allowed
                const num = Number(trimmedStr);
                const numStr = "" + num;

                if(numStr.search(/[eE]/) !== -1){ //given number is long and parsed to eNotation
                    if(options.eNotation) return num;
                    else return str;
                }else if(trimmedStr.indexOf(".") !== -1){ //floating number
                    if(numStr === "0" && (numTrimmedByZeros === "") ) return num; //0.0
                    else if(numStr === numTrimmedByZeros) return num; //0.456. 0.79000
                    else if( sign && numStr === "-"+numTrimmedByZeros) return num;
                    else return str;
                }
                
                if(leadingZeros){
                    return (numTrimmedByZeros === numStr) || (sign+numTrimmedByZeros === numStr) ? num : str
                }else  {
                    return (trimmedStr === numStr) || (trimmedStr === sign+numStr) ? num : str
                }
            }
        }else{ //non-numeric string
            return str;
        }
    }
}

/**
 * 
 * @param {string} numStr without leading zeros
 * @returns 
 */
function trimZeros(numStr){
    if(numStr && numStr.indexOf(".") !== -1){//float
        numStr = numStr.replace(/0+$/, ""); //remove ending zeros
        if(numStr === ".")  numStr = "0";
        else if(numStr[0] === ".")  numStr = "0"+numStr;
        else if(numStr[numStr.length-1] === ".")  numStr = numStr.substr(0,numStr.length-1);
        return numStr;
    }
    return numStr;
}

function parse_int(numStr, base){
    //polyfill
    if(parseInt) return parseInt(numStr, base);
    else if(Number.parseInt) return Number.parseInt(numStr, base);
    else if(window && window.parseInt) return window.parseInt(numStr, base);
    else throw new Error("parseInt, Number.parseInt, window.parseInt are not supported")
}

module.exports = toNumber;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be in strict mode.
(() => {
"use strict";

;// ../../node_modules/@aws-amplify/core/node_modules/js-cookie/dist/js.cookie.mjs
/*! js-cookie v3.0.8 | MIT */
function js_cookie_assign (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];
    for (var key in source) {
      if (key === '__proto__') continue
      target[key] = source[key];
    }
  }
  return target
}

var defaultConverter = {
  read: function (value) {
    if (value[0] === '"') {
      value = value.slice(1, -1);
    }
    return value.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent)
  },
  write: function (value) {
    return encodeURIComponent(value).replace(
      /%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g,
      decodeURIComponent
    )
  }
};

function init(converter, defaultAttributes) {
  function set(name, value, attributes) {
    if (typeof document === 'undefined') {
      return
    }

    attributes = js_cookie_assign({}, defaultAttributes, attributes);

    if (typeof attributes.expires === 'number') {
      attributes.expires = new Date(Date.now() + attributes.expires * 864e5);
    }
    if (attributes.expires) {
      attributes.expires = attributes.expires.toUTCString();
    }

    name = encodeURIComponent(name)
      .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
      .replace(/[()]/g, escape);

    var stringifiedAttributes = '';
    for (var attributeName in attributes) {
      if (!attributes[attributeName]) {
        continue
      }

      stringifiedAttributes += '; ' + attributeName;

      if (attributes[attributeName] === true) {
        continue
      }

      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      stringifiedAttributes += '=' + attributes[attributeName].split(';')[0];
    }

    return (document.cookie =
      name + '=' + converter.write(value, name) + stringifiedAttributes)
  }

  function get(name) {
    if (typeof document === 'undefined' || (arguments.length && !name)) {
      return
    }

    // To prevent the for loop in the first place assign an empty array
    // in case there are no cookies at all.
    var cookies = document.cookie ? document.cookie.split('; ') : [];
    var jar = {};
    for (var i = 0; i < cookies.length; i++) {
      var parts = cookies[i].split('=');
      var value = parts.slice(1).join('=');

      try {
        var found = decodeURIComponent(parts[0]);
        if (!(found in jar)) jar[found] = converter.read(value, found);
        if (name === found) {
          break
        }
      } catch (_e) {
        // Do nothing...
      }
    }

    return name ? jar[name] : jar
  }

  return Object.create(
    {
      set: set,
      get: get,
      remove: function (name, attributes) {
        set(
          name,
          '',
          js_cookie_assign({}, attributes, {
            expires: -1
          })
        );
      },
      withAttributes: function (attributes) {
        return init(this.converter, js_cookie_assign({}, this.attributes, attributes))
      },
      withConverter: function (converter) {
        return init(js_cookie_assign({}, this.converter, converter), this.attributes)
      }
    },
    {
      attributes: { value: Object.freeze(defaultAttributes) },
      converter: { value: Object.freeze(converter) }
    }
  )
}

var api = init(defaultConverter, { path: '/' });



;// ../../node_modules/@aws-amplify/core/dist/esm/storage/CookieStorage.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
class CookieStorage {
    constructor(data = {}) {
        const { path, domain, expires, sameSite, secure } = data;
        this.domain = domain;
        this.path = path || '/';
        this.expires = Object.prototype.hasOwnProperty.call(data, 'expires')
            ? expires
            : 365;
        this.secure = Object.prototype.hasOwnProperty.call(data, 'secure')
            ? secure
            : true;
        if (Object.prototype.hasOwnProperty.call(data, 'sameSite')) {
            if (!sameSite || !['strict', 'lax', 'none'].includes(sameSite)) {
                throw new Error('The sameSite value of cookieStorage must be "lax", "strict" or "none".');
            }
            if (sameSite === 'none' && !this.secure) {
                throw new Error('sameSite = None requires the Secure attribute in latest browser versions.');
            }
            this.sameSite = sameSite;
        }
    }
    async setItem(key, value) {
        api.set(key, value, this.getData());
    }
    async getItem(key) {
        const item = api.get(key);
        return item ?? null;
    }
    async removeItem(key) {
        api.remove(key, this.getData());
    }
    async clear() {
        const cookie = api.get();
        const promises = Object.keys(cookie).map(key => this.removeItem(key));
        await Promise.all(promises);
    }
    getData() {
        return {
            path: this.path,
            expires: this.expires,
            domain: this.domain,
            secure: this.secure,
            ...(this.sameSite && { sameSite: this.sameSite }),
        };
    }
}


//# sourceMappingURL=CookieStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/types/errors.mjs
var AmplifyErrorCode;
(function (AmplifyErrorCode) {
    AmplifyErrorCode["NoEndpointId"] = "NoEndpointId";
    AmplifyErrorCode["PlatformNotSupported"] = "PlatformNotSupported";
    AmplifyErrorCode["Unknown"] = "Unknown";
    AmplifyErrorCode["NetworkError"] = "NetworkError";
})(AmplifyErrorCode || (AmplifyErrorCode = {}));


//# sourceMappingURL=errors.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/errors/AmplifyError.mjs
class AmplifyError extends Error {
    /**
     *  Constructs an AmplifyError.
     *
     * @param message text that describes the main problem.
     * @param underlyingError the underlying cause of the error.
     * @param recoverySuggestion suggestion to recover from the error.
     *
     */
    constructor({ message, name, recoverySuggestion, underlyingError, metadata, }) {
        super(message);
        this.name = name;
        this.underlyingError = underlyingError;
        this.recoverySuggestion = recoverySuggestion;
        if (metadata) {
            // If metadata exists, explicitly only record the following properties.
            const { extendedRequestId, httpStatusCode, requestId } = metadata;
            this.metadata = { extendedRequestId, httpStatusCode, requestId };
        }
        // Hack for making the custom error class work when transpiled to es5
        // TODO: Delete the following 2 lines after we change the build target to >= es2015
        this.constructor = AmplifyError;
        Object.setPrototypeOf(this, AmplifyError.prototype);
    }
}


//# sourceMappingURL=AmplifyError.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/errors/PlatformNotSupportedError.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
class PlatformNotSupportedError extends AmplifyError {
    constructor() {
        super({
            name: AmplifyErrorCode.PlatformNotSupported,
            message: 'Function not supported on current platform',
        });
    }
}


//# sourceMappingURL=PlatformNotSupportedError.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/KeyValueStorage.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 */
class KeyValueStorage {
    constructor(storage) {
        this.storage = storage;
    }
    /**
     * This is used to set a specific item in storage
     * @param {string} key - the key for the item
     * @param {object} value - the value
     * @returns {string} value that was set
     */
    async setItem(key, value) {
        if (!this.storage)
            throw new PlatformNotSupportedError();
        this.storage.setItem(key, value);
    }
    /**
     * This is used to get a specific key from storage
     * @param {string} key - the key for the item
     * This is used to clear the storage
     * @returns {string} the data item
     */
    async getItem(key) {
        if (!this.storage)
            throw new PlatformNotSupportedError();
        return this.storage.getItem(key);
    }
    /**
     * This is used to remove an item from storage
     * @param {string} key - the key being set
     * @returns {string} value - value that was deleted
     */
    async removeItem(key) {
        if (!this.storage)
            throw new PlatformNotSupportedError();
        this.storage.removeItem(key);
    }
    /**
     * This is used to clear the storage
     * @returns {string} nothing
     */
    async clear() {
        if (!this.storage)
            throw new PlatformNotSupportedError();
        this.storage.clear();
    }
}


//# sourceMappingURL=KeyValueStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/constants.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Logging constants
const AWS_CLOUDWATCH_CATEGORY = 'Logging';
const USER_AGENT_HEADER = 'x-amz-user-agent';
// Error exception code constants
const NO_HUBCALLBACK_PROVIDED_EXCEPTION = 'NoHubcallbackProvidedException';


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Logger/types.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var LogType;
(function (LogType) {
    LogType["DEBUG"] = "DEBUG";
    LogType["ERROR"] = "ERROR";
    LogType["INFO"] = "INFO";
    LogType["WARN"] = "WARN";
    LogType["VERBOSE"] = "VERBOSE";
    LogType["NONE"] = "NONE";
})(LogType || (LogType = {}));


//# sourceMappingURL=types.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Logger/ConsoleLogger.mjs



/* eslint-disable no-console */
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const LOG_LEVELS = {
    VERBOSE: 1,
    DEBUG: 2,
    INFO: 3,
    WARN: 4,
    ERROR: 5,
    NONE: 6,
};
/**
 * Write logs
 * @class Logger
 */
class ConsoleLogger {
    /**
     * @constructor
     * @param {string} name - Name of the logger
     */
    constructor(name, level = LogType.WARN) {
        this.name = name;
        this.level = level;
        this._pluggables = [];
    }
    _padding(n) {
        return n < 10 ? '0' + n : '' + n;
    }
    _ts() {
        const dt = new Date();
        return ([this._padding(dt.getMinutes()), this._padding(dt.getSeconds())].join(':') +
            '.' +
            dt.getMilliseconds());
    }
    configure(config) {
        if (!config)
            return this._config;
        this._config = config;
        return this._config;
    }
    /**
     * Write log
     * @method
     * @memeberof Logger
     * @param {LogType|string} type - log type, default INFO
     * @param {string|object} msg - Logging message or object
     */
    _log(type, ...msg) {
        let loggerLevelName = this.level;
        if (ConsoleLogger.LOG_LEVEL) {
            loggerLevelName = ConsoleLogger.LOG_LEVEL;
        }
        if (typeof window !== 'undefined' && window.LOG_LEVEL) {
            loggerLevelName = window.LOG_LEVEL;
        }
        const loggerLevel = LOG_LEVELS[loggerLevelName];
        const typeLevel = LOG_LEVELS[type];
        if (!(typeLevel >= loggerLevel)) {
            // Do nothing if type is not greater than or equal to logger level (handle undefined)
            return;
        }
        let log = console.log.bind(console);
        if (type === LogType.ERROR && console.error) {
            log = console.error.bind(console);
        }
        if (type === LogType.WARN && console.warn) {
            log = console.warn.bind(console);
        }
        if (ConsoleLogger.BIND_ALL_LOG_LEVELS) {
            if (type === LogType.INFO && console.info) {
                log = console.info.bind(console);
            }
            if (type === LogType.DEBUG && console.debug) {
                log = console.debug.bind(console);
            }
        }
        const prefix = `[${type}] ${this._ts()} ${this.name}`;
        let message = '';
        if (msg.length === 1 && typeof msg[0] === 'string') {
            message = `${prefix} - ${msg[0]}`;
            log(message);
        }
        else if (msg.length === 1) {
            message = `${prefix} ${msg[0]}`;
            log(prefix, msg[0]);
        }
        else if (typeof msg[0] === 'string') {
            let obj = msg.slice(1);
            if (obj.length === 1) {
                obj = obj[0];
            }
            message = `${prefix} - ${msg[0]} ${obj}`;
            log(`${prefix} - ${msg[0]}`, obj);
        }
        else {
            message = `${prefix} ${msg}`;
            log(prefix, msg);
        }
        for (const plugin of this._pluggables) {
            const logEvent = { message, timestamp: Date.now() };
            plugin.pushLogs([logEvent]);
        }
    }
    /**
     * Write General log. Default to INFO
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    log(...msg) {
        this._log(LogType.INFO, ...msg);
    }
    /**
     * Write INFO log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    info(...msg) {
        this._log(LogType.INFO, ...msg);
    }
    /**
     * Write WARN log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    warn(...msg) {
        this._log(LogType.WARN, ...msg);
    }
    /**
     * Write ERROR log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    error(...msg) {
        this._log(LogType.ERROR, ...msg);
    }
    /**
     * Write DEBUG log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    debug(...msg) {
        this._log(LogType.DEBUG, ...msg);
    }
    /**
     * Write VERBOSE log
     * @method
     * @memeberof Logger
     * @param {string|object} msg - Logging message or object
     */
    verbose(...msg) {
        this._log(LogType.VERBOSE, ...msg);
    }
    addPluggable(pluggable) {
        if (pluggable && pluggable.getCategoryName() === AWS_CLOUDWATCH_CATEGORY) {
            this._pluggables.push(pluggable);
            pluggable.configure(this._config);
        }
    }
    listPluggables() {
        return this._pluggables;
    }
}
ConsoleLogger.LOG_LEVEL = null;
ConsoleLogger.BIND_ALL_LOG_LEVELS = false;


//# sourceMappingURL=ConsoleLogger.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/InMemoryStorage.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 */
class InMemoryStorage {
    constructor() {
        this.storage = new Map();
    }
    get length() {
        return this.storage.size;
    }
    key(index) {
        if (index > this.length - 1) {
            return null;
        }
        return Array.from(this.storage.keys())[index];
    }
    setItem(key, value) {
        this.storage.set(key, value);
    }
    getItem(key) {
        return this.storage.get(key) ?? null;
    }
    removeItem(key) {
        this.storage.delete(key);
    }
    clear() {
        this.storage.clear();
    }
}


//# sourceMappingURL=InMemoryStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/utils.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 * @returns Either a reference to window.localStorage or an in-memory storage as fallback
 */
const logger = new ConsoleLogger('CoreStorageUtils');
const getLocalStorageWithFallback = () => {
    try {
        // Attempt to use localStorage directly
        if (typeof window !== 'undefined' && window.localStorage) {
            return window.localStorage;
        }
    }
    catch (e) {
        // Handle any errors related to localStorage access
        logger.info('localStorage not found. InMemoryStorage is used as a fallback.');
    }
    // Return in-memory storage as a fallback if localStorage is not accessible
    return new InMemoryStorage();
};
/**
 * @internal
 * @returns Either a reference to window.sessionStorage or an in-memory storage as fallback
 */
const getSessionStorageWithFallback = () => {
    try {
        // Attempt to use sessionStorage directly
        if (typeof window !== 'undefined' && window.sessionStorage) {
            // Verify we can actually use it by testing access
            window.sessionStorage.getItem('test');
            return window.sessionStorage;
        }
        throw new Error('sessionStorage is not defined');
    }
    catch (e) {
        // Handle any errors related to sessionStorage access
        logger.info('sessionStorage not found. InMemoryStorage is used as a fallback.');
        return new InMemoryStorage();
    }
};


//# sourceMappingURL=utils.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/DefaultStorage.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 */
class DefaultStorage extends KeyValueStorage {
    constructor() {
        super(getLocalStorageWithFallback());
    }
}


//# sourceMappingURL=DefaultStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/SessionStorage.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 */
class SessionStorage extends KeyValueStorage {
    constructor() {
        super(getSessionStorageWithFallback());
    }
}


//# sourceMappingURL=SessionStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/SyncKeyValueStorage.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 */
class SyncKeyValueStorage {
    constructor(storage) {
        this._storage = storage;
    }
    get storage() {
        if (!this._storage)
            throw new PlatformNotSupportedError();
        return this._storage;
    }
    /**
     * This is used to set a specific item in storage
     * @param {string} key - the key for the item
     * @param {object} value - the value
     * @returns {string} value that was set
     */
    setItem(key, value) {
        this.storage.setItem(key, value);
    }
    /**
     * This is used to get a specific key from storage
     * @param {string} key - the key for the item
     * This is used to clear the storage
     * @returns {string} the data item
     */
    getItem(key) {
        return this.storage.getItem(key);
    }
    /**
     * This is used to remove an item from storage
     * @param {string} key - the key being set
     * @returns {string} value - value that was deleted
     */
    removeItem(key) {
        this.storage.removeItem(key);
    }
    /**
     * This is used to clear the storage
     * @returns {string} nothing
     */
    clear() {
        this.storage.clear();
    }
}


//# sourceMappingURL=SyncKeyValueStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/SyncSessionStorage.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @internal
 */
class SyncSessionStorage extends SyncKeyValueStorage {
    constructor() {
        super(getSessionStorageWithFallback());
    }
}


//# sourceMappingURL=SyncSessionStorage.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/storage/index.mjs







// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const defaultStorage = new DefaultStorage();
const sessionStorage = new SessionStorage();
const syncSessionStorage = new SyncSessionStorage();
const sharedInMemoryStorage = new KeyValueStorage(new InMemoryStorage());


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Hub/index.mjs






// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const AMPLIFY_SYMBOL = (typeof Symbol !== 'undefined'
    ? Symbol('amplify_default')
    : '@@amplify_default');
const Hub_logger = new ConsoleLogger('Hub');
class HubClass {
    constructor(name) {
        this.listeners = new Map();
        this.protectedChannels = [
            'core',
            'auth',
            'api',
            'analytics',
            'interactions',
            'pubsub',
            'storage',
            'ui',
            'xr',
        ];
        this.name = name;
    }
    /**
     * Used internally to remove a Hub listener.
     *
     * @remarks
     * This private method is for internal use only. Instead of calling Hub.remove, call the result of Hub.listen.
     */
    _remove(channel, listener) {
        const holder = this.listeners.get(channel);
        if (!holder) {
            Hub_logger.warn(`No listeners for ${channel}`);
            return;
        }
        this.listeners.set(channel, [
            ...holder.filter(({ callback }) => callback !== listener),
        ]);
    }
    dispatch(channel, payload, source, ampSymbol) {
        if (typeof channel === 'string' &&
            this.protectedChannels.indexOf(channel) > -1) {
            const hasAccess = ampSymbol === AMPLIFY_SYMBOL;
            if (!hasAccess) {
                Hub_logger.warn(`WARNING: ${channel} is protected and dispatching on it can have unintended consequences`);
            }
        }
        const capsule = {
            channel,
            payload: { ...payload },
            source,
            patternInfo: [],
        };
        try {
            this._toListeners(capsule);
        }
        catch (e) {
            Hub_logger.error(e);
        }
    }
    listen(channel, callback, listenerName = 'noname') {
        let cb;
        if (typeof callback !== 'function') {
            throw new AmplifyError({
                name: NO_HUBCALLBACK_PROVIDED_EXCEPTION,
                message: 'No callback supplied to Hub',
            });
        }
        else {
            // Needs to be casted as a more generic type
            cb = callback;
        }
        let holder = this.listeners.get(channel);
        if (!holder) {
            holder = [];
            this.listeners.set(channel, holder);
        }
        holder.push({
            name: listenerName,
            callback: cb,
        });
        return () => {
            this._remove(channel, cb);
        };
    }
    _toListeners(capsule) {
        const { channel, payload } = capsule;
        const holder = this.listeners.get(channel);
        if (holder) {
            holder.forEach(listener => {
                Hub_logger.debug(`Dispatching to ${channel} with `, payload);
                try {
                    listener.callback(capsule);
                }
                catch (e) {
                    Hub_logger.error(e);
                }
            });
        }
    }
}
/* We export a __default__ instance of HubClass to use it as a
pseudo Singleton for the main messaging bus, however you can still create
your own instance of HubClass() for a separate "private bus" of events. */
const Hub = new HubClass('__default__');
/**
 * @internal
 *
 * Internal hub used for core Amplify functionality. Not intended for use outside of Amplify.
 *
 */
const HubInternal = new HubClass('internal-hub');


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/deepFreeze.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const deepFreeze = (object) => {
    const propNames = Reflect.ownKeys(object);
    for (const name of propNames) {
        const value = object[name];
        if ((value && typeof value === 'object') || typeof value === 'function') {
            deepFreeze(value);
        }
    }
    return Object.freeze(object);
};


//# sourceMappingURL=deepFreeze.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/constants.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const ADD_OAUTH_LISTENER = Symbol('oauth-listener');


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/parseAWSExports.mjs





// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const parseAWSExports_logger = new ConsoleLogger('parseAWSExports');
const authTypeMapping = {
    API_KEY: 'apiKey',
    AWS_IAM: 'iam',
    AMAZON_COGNITO_USER_POOLS: 'userPool',
    OPENID_CONNECT: 'oidc',
    NONE: 'none',
    AWS_LAMBDA: 'lambda',
    // `LAMBDA` is an incorrect value that was added during the v6 rewrite.
    // Keeping it as a valid value until v7 to prevent breaking customers who might
    // be relying on it as a workaround.
    // ref: https://github.com/aws-amplify/amplify-js/pull/12922
    // TODO: @v7 remove next line
    LAMBDA: 'lambda',
};
/**
 * Converts the object imported from `aws-exports.js` or `amplifyconfiguration.json` files generated by
 * the Amplify CLI into an object that conforms to the {@link ResourcesConfig}.
 *
 * @param config A configuration object imported  from `aws-exports.js` or `amplifyconfiguration.json`.
 *
 * @returns An object that conforms to the {@link ResourcesConfig} .
 */
const parseAWSExports = (config = {}) => {
    if (!Object.prototype.hasOwnProperty.call(config, 'aws_project_region')) {
        throw new AmplifyError({
            name: 'InvalidParameterException',
            message: 'Invalid config parameter.',
            recoverySuggestion: 'Ensure passing the config object imported from  `amplifyconfiguration.json`.',
        });
    }
    const { aws_appsync_apiKey, aws_appsync_authenticationType, aws_appsync_graphqlEndpoint, aws_appsync_region, aws_bots_config, aws_cognito_identity_pool_id, aws_cognito_sign_up_verification_method, aws_cognito_mfa_configuration, aws_cognito_mfa_types, aws_cognito_password_protection_settings, aws_cognito_verification_mechanisms, aws_cognito_signup_attributes, aws_cognito_social_providers, aws_cognito_username_attributes, aws_mandatory_sign_in, aws_mobile_analytics_app_id, aws_mobile_analytics_app_region, aws_user_files_s3_bucket, aws_user_files_s3_bucket_region, aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing, aws_user_pools_id, aws_user_pools_web_client_id, geo, oauth, predictions, aws_cloud_logic_custom, Notifications, modelIntrospection, } = config;
    const amplifyConfig = {};
    // Analytics
    if (aws_mobile_analytics_app_id) {
        amplifyConfig.Analytics = {
            Pinpoint: {
                appId: aws_mobile_analytics_app_id,
                region: aws_mobile_analytics_app_region,
            },
        };
    }
    // Notifications
    const { InAppMessaging, Push } = Notifications ?? {};
    if (InAppMessaging?.AWSPinpoint || Push?.AWSPinpoint) {
        if (InAppMessaging?.AWSPinpoint) {
            const { appId, region } = InAppMessaging.AWSPinpoint;
            amplifyConfig.Notifications = {
                InAppMessaging: {
                    Pinpoint: {
                        appId,
                        region,
                    },
                },
            };
        }
        if (Push?.AWSPinpoint) {
            const { appId, region } = Push.AWSPinpoint;
            amplifyConfig.Notifications = {
                ...amplifyConfig.Notifications,
                PushNotification: {
                    Pinpoint: {
                        appId,
                        region,
                    },
                },
            };
        }
    }
    // Interactions
    if (Array.isArray(aws_bots_config)) {
        amplifyConfig.Interactions = {
            LexV1: Object.fromEntries(aws_bots_config.map(bot => [bot.name, bot])),
        };
    }
    // API
    if (aws_appsync_graphqlEndpoint) {
        const defaultAuthMode = authTypeMapping[aws_appsync_authenticationType];
        if (!defaultAuthMode) {
            parseAWSExports_logger.debug(`Invalid authentication type ${aws_appsync_authenticationType}. Falling back to IAM.`);
        }
        amplifyConfig.API = {
            GraphQL: {
                endpoint: aws_appsync_graphqlEndpoint,
                apiKey: aws_appsync_apiKey,
                region: aws_appsync_region,
                defaultAuthMode: defaultAuthMode ?? 'iam',
            },
        };
        if (modelIntrospection) {
            amplifyConfig.API.GraphQL.modelIntrospection = modelIntrospection;
        }
    }
    // Auth
    const mfaConfig = aws_cognito_mfa_configuration
        ? {
            status: aws_cognito_mfa_configuration &&
                aws_cognito_mfa_configuration.toLowerCase(),
            totpEnabled: aws_cognito_mfa_types?.includes('TOTP') ?? false,
            smsEnabled: aws_cognito_mfa_types?.includes('SMS') ?? false,
        }
        : undefined;
    const passwordFormatConfig = aws_cognito_password_protection_settings
        ? {
            minLength: aws_cognito_password_protection_settings.passwordPolicyMinLength,
            requireLowercase: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes('REQUIRES_LOWERCASE') ?? false,
            requireUppercase: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes('REQUIRES_UPPERCASE') ?? false,
            requireNumbers: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes('REQUIRES_NUMBERS') ?? false,
            requireSpecialCharacters: aws_cognito_password_protection_settings.passwordPolicyCharacters?.includes('REQUIRES_SYMBOLS') ?? false,
        }
        : undefined;
    const mergedUserAttributes = Array.from(new Set([
        ...(aws_cognito_verification_mechanisms ?? []),
        ...(aws_cognito_signup_attributes ?? []),
    ]));
    const userAttributes = mergedUserAttributes.reduce((attributes, key) => ({
        ...attributes,
        // All user attributes generated by the CLI are required
        [key.toLowerCase()]: { required: true },
    }), {});
    const loginWithEmailEnabled = aws_cognito_username_attributes?.includes('EMAIL') ?? false;
    const loginWithPhoneEnabled = aws_cognito_username_attributes?.includes('PHONE_NUMBER') ?? false;
    if (aws_cognito_identity_pool_id || aws_user_pools_id) {
        amplifyConfig.Auth = {
            Cognito: {
                identityPoolId: aws_cognito_identity_pool_id,
                allowGuestAccess: aws_mandatory_sign_in !== 'enable',
                signUpVerificationMethod: aws_cognito_sign_up_verification_method,
                userAttributes,
                userPoolClientId: aws_user_pools_web_client_id,
                userPoolId: aws_user_pools_id,
                mfa: mfaConfig,
                passwordFormat: passwordFormatConfig,
                loginWith: {
                    username: !(loginWithEmailEnabled || loginWithPhoneEnabled),
                    email: loginWithEmailEnabled,
                    phone: loginWithPhoneEnabled,
                },
            },
        };
    }
    const hasOAuthConfig = oauth ? Object.keys(oauth).length > 0 : false;
    const hasSocialProviderConfig = aws_cognito_social_providers
        ? aws_cognito_social_providers.length > 0
        : false;
    if (amplifyConfig.Auth && hasOAuthConfig) {
        amplifyConfig.Auth.Cognito.loginWith = {
            ...amplifyConfig.Auth.Cognito.loginWith,
            oauth: {
                ...getOAuthConfig(oauth),
                ...(hasSocialProviderConfig && {
                    providers: parseSocialProviders(aws_cognito_social_providers),
                }),
            },
        };
    }
    // Storage
    if (aws_user_files_s3_bucket) {
        amplifyConfig.Storage = {
            S3: {
                bucket: aws_user_files_s3_bucket,
                region: aws_user_files_s3_bucket_region,
                dangerouslyConnectToHttpEndpointForTesting: aws_user_files_s3_dangerously_connect_to_http_endpoint_for_testing,
            },
        };
    }
    // Geo
    if (geo) {
        const { amazon_location_service } = geo;
        amplifyConfig.Geo = {
            LocationService: {
                maps: amazon_location_service.maps,
                geofenceCollections: amazon_location_service.geofenceCollections,
                searchIndices: amazon_location_service.search_indices,
                region: amazon_location_service.region,
            },
        };
    }
    // REST API
    if (aws_cloud_logic_custom) {
        amplifyConfig.API = {
            ...amplifyConfig.API,
            REST: aws_cloud_logic_custom.reduce((acc, api) => {
                const { name, endpoint, region, service } = api;
                return {
                    ...acc,
                    [name]: {
                        endpoint,
                        ...(service ? { service } : undefined),
                        ...(region ? { region } : undefined),
                    },
                };
            }, {}),
        };
    }
    // Predictions
    if (predictions) {
        // map VoiceId from speechGenerator defaults to voiceId
        const { VoiceId: voiceId } = predictions?.convert?.speechGenerator?.defaults ?? {};
        amplifyConfig.Predictions = voiceId
            ? {
                ...predictions,
                convert: {
                    ...predictions.convert,
                    speechGenerator: {
                        ...predictions.convert.speechGenerator,
                        defaults: { voiceId },
                    },
                },
            }
            : predictions;
    }
    return amplifyConfig;
};
const getRedirectUrl = (redirectStr) => redirectStr?.split(',') ?? [];
const getOAuthConfig = ({ domain, scope, redirectSignIn, redirectSignOut, responseType, }) => ({
    domain,
    scopes: scope,
    redirectSignIn: getRedirectUrl(redirectSignIn),
    redirectSignOut: getRedirectUrl(redirectSignOut),
    responseType,
});
const parseSocialProviders = (aws_cognito_social_providers) => {
    return aws_cognito_social_providers.map((provider) => {
        const updatedProvider = provider.toLowerCase();
        return updatedProvider.charAt(0).toUpperCase() + updatedProvider.slice(1);
    });
};


//# sourceMappingURL=parseAWSExports.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/parseAmplifyOutputs.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function isAmplifyOutputs(config) {
    // version format initially will be '1' but is expected to be something like x.y where x is major and y minor version
    const { version } = config;
    if (!version) {
        return false;
    }
    return version.startsWith('1');
}
function parseStorage(amplifyOutputsStorageProperties) {
    if (!amplifyOutputsStorageProperties) {
        return undefined;
    }
    const { bucket_name, aws_region, buckets } = amplifyOutputsStorageProperties;
    return {
        S3: {
            bucket: bucket_name,
            region: aws_region,
            buckets: buckets && createBucketInfoMap(buckets),
        },
    };
}
function parseAuth(amplifyOutputsAuthProperties) {
    if (!amplifyOutputsAuthProperties) {
        return undefined;
    }
    const { user_pool_id, user_pool_client_id, identity_pool_id, password_policy, mfa_configuration, mfa_methods, unauthenticated_identities_enabled, oauth, username_attributes, standard_required_attributes, groups, passwordless, } = amplifyOutputsAuthProperties;
    const authConfig = {
        Cognito: {
            userPoolId: user_pool_id,
            userPoolClientId: user_pool_client_id,
            groups,
        },
    };
    if (identity_pool_id) {
        authConfig.Cognito = {
            ...authConfig.Cognito,
            identityPoolId: identity_pool_id,
        };
    }
    if (password_policy) {
        authConfig.Cognito.passwordFormat = {
            requireLowercase: password_policy.require_lowercase,
            requireNumbers: password_policy.require_numbers,
            requireUppercase: password_policy.require_uppercase,
            requireSpecialCharacters: password_policy.require_symbols,
            minLength: password_policy.min_length ?? 6,
        };
    }
    if (mfa_configuration) {
        authConfig.Cognito.mfa = {
            status: getMfaStatus(mfa_configuration),
            smsEnabled: mfa_methods?.includes('SMS'),
            totpEnabled: mfa_methods?.includes('TOTP'),
        };
    }
    if (unauthenticated_identities_enabled) {
        authConfig.Cognito.allowGuestAccess = unauthenticated_identities_enabled;
    }
    if (oauth) {
        authConfig.Cognito.loginWith = {
            oauth: {
                domain: oauth.domain,
                redirectSignIn: oauth.redirect_sign_in_uri,
                redirectSignOut: oauth.redirect_sign_out_uri,
                responseType: oauth.response_type === 'token' ? 'token' : 'code',
                scopes: oauth.scopes,
                providers: getOAuthProviders(oauth.identity_providers),
            },
        };
    }
    if (username_attributes) {
        authConfig.Cognito.loginWith = {
            ...authConfig.Cognito.loginWith,
            email: username_attributes.includes('email'),
            phone: username_attributes.includes('phone_number'),
            // Signing in with a username is not currently supported in Gen2, this should always evaluate to false
            username: username_attributes.includes('username'),
        };
    }
    if (standard_required_attributes) {
        authConfig.Cognito.userAttributes = standard_required_attributes.reduce((acc, curr) => ({ ...acc, [curr]: { required: true } }), {});
    }
    if (passwordless) {
        authConfig.Cognito.passwordless = {
            emailOtpEnabled: passwordless.email_otp_enabled,
            smsOtpEnabled: passwordless.sms_otp_enabled,
            webAuthn: passwordless.web_authn
                ? {
                    relyingPartyId: passwordless.web_authn.relying_party_id,
                    userVerification: passwordless.web_authn.user_verification,
                }
                : undefined,
            preferredChallenge: passwordless.preferred_challenge,
        };
    }
    return authConfig;
}
function parseAnalytics(amplifyOutputsAnalyticsProperties) {
    if (!amplifyOutputsAnalyticsProperties?.amazon_pinpoint) {
        return undefined;
    }
    const { amazon_pinpoint } = amplifyOutputsAnalyticsProperties;
    return {
        Pinpoint: {
            appId: amazon_pinpoint.app_id,
            region: amazon_pinpoint.aws_region,
        },
    };
}
function parseGeo(amplifyOutputsAnalyticsProperties) {
    if (!amplifyOutputsAnalyticsProperties) {
        return undefined;
    }
    const { aws_region, geofence_collections, maps, search_indices } = amplifyOutputsAnalyticsProperties;
    return {
        LocationService: {
            region: aws_region,
            searchIndices: search_indices,
            geofenceCollections: geofence_collections,
            maps,
        },
    };
}
function parseData(amplifyOutputsDataProperties) {
    if (!amplifyOutputsDataProperties) {
        return undefined;
    }
    const { aws_region, default_authorization_type, url, api_key, model_introspection, } = amplifyOutputsDataProperties;
    const GraphQL = {
        endpoint: url,
        defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
        region: aws_region,
        apiKey: api_key,
        modelIntrospection: model_introspection,
    };
    return {
        GraphQL,
    };
}
function parseCustom(amplifyOutputsCustomProperties) {
    if (!amplifyOutputsCustomProperties?.events) {
        return undefined;
    }
    const { url, aws_region, api_key, default_authorization_type } = amplifyOutputsCustomProperties.events;
    const Events = {
        endpoint: url,
        defaultAuthMode: getGraphQLAuthMode(default_authorization_type),
        region: aws_region,
        apiKey: api_key,
    };
    return {
        Events,
    };
}
function parseNotifications(amplifyOutputsNotificationsProperties) {
    if (!amplifyOutputsNotificationsProperties) {
        return undefined;
    }
    const { aws_region, channels, amazon_pinpoint_app_id, amazon_connect } = amplifyOutputsNotificationsProperties;
    const supportedChannels = channels ?? [];
    const hasInAppMessaging = supportedChannels.includes('IN_APP_MESSAGING');
    const hasPushNotification = supportedChannels.includes('APNS') || supportedChannels.includes('FCM');
    const hasCustomerProfilesPush = !!amazon_connect;
    if (!(hasInAppMessaging || hasPushNotification || hasCustomerProfilesPush)) {
        return undefined;
    }
    // At this point, we know the Amplify outputs contains at least one supported channel
    const notificationsConfig = {};
    if (hasInAppMessaging && amazon_pinpoint_app_id && aws_region) {
        notificationsConfig.InAppMessaging = {
            Pinpoint: {
                appId: amazon_pinpoint_app_id,
                region: aws_region,
            },
        };
    }
    // Push device registration can be backed by Amazon Pinpoint and/or Amazon
    // Connect Customer Profiles. Each provider is emitted independently when its
    // configuration is present, mirroring how analytics is parsed.
    const pushNotificationConfig = {};
    if (hasPushNotification && amazon_pinpoint_app_id && aws_region) {
        pushNotificationConfig.Pinpoint = {
            appId: amazon_pinpoint_app_id,
            region: aws_region,
        };
    }
    if (amazon_connect) {
        pushNotificationConfig.CustomerProfiles = {
            endpoint: amazon_connect.endpoint,
            region: amazon_connect.aws_region,
        };
    }
    if (Object.keys(pushNotificationConfig).length > 0) {
        notificationsConfig.PushNotification =
            pushNotificationConfig;
    }
    return notificationsConfig;
}
function parseAmplifyOutputs(amplifyOutputs) {
    const resourcesConfig = {};
    if (amplifyOutputs.storage) {
        resourcesConfig.Storage = parseStorage(amplifyOutputs.storage);
    }
    if (amplifyOutputs.auth) {
        resourcesConfig.Auth = parseAuth(amplifyOutputs.auth);
    }
    if (amplifyOutputs.analytics) {
        resourcesConfig.Analytics = parseAnalytics(amplifyOutputs.analytics);
    }
    if (amplifyOutputs.geo) {
        resourcesConfig.Geo = parseGeo(amplifyOutputs.geo);
    }
    if (amplifyOutputs.data) {
        resourcesConfig.API = parseData(amplifyOutputs.data);
    }
    if (amplifyOutputs.custom) {
        const customConfig = parseCustom(amplifyOutputs.custom);
        if (customConfig && 'Events' in customConfig) {
            resourcesConfig.API = { ...resourcesConfig.API, ...customConfig };
        }
    }
    if (amplifyOutputs.notifications) {
        resourcesConfig.Notifications = parseNotifications(amplifyOutputs.notifications);
    }
    return resourcesConfig;
}
const authModeNames = {
    AMAZON_COGNITO_USER_POOLS: 'userPool',
    API_KEY: 'apiKey',
    AWS_IAM: 'iam',
    AWS_LAMBDA: 'lambda',
    OPENID_CONNECT: 'oidc',
};
function getGraphQLAuthMode(authType) {
    return authModeNames[authType];
}
const providerNames = {
    GOOGLE: 'Google',
    LOGIN_WITH_AMAZON: 'Amazon',
    FACEBOOK: 'Facebook',
    SIGN_IN_WITH_APPLE: 'Apple',
};
function getOAuthProviders(providers = []) {
    return providers.reduce((oAuthProviders, provider) => {
        if (providerNames[provider] !== undefined) {
            oAuthProviders.push(providerNames[provider]);
        }
        return oAuthProviders;
    }, []);
}
function getMfaStatus(mfaConfiguration) {
    if (mfaConfiguration === 'OPTIONAL')
        return 'optional';
    if (mfaConfiguration === 'REQUIRED')
        return 'on';
    return 'off';
}
function createBucketInfoMap(buckets) {
    const mappedBuckets = {};
    buckets.forEach(({ name, bucket_name: bucketName, aws_region: region, paths }) => {
        if (name in mappedBuckets) {
            throw new Error(`Duplicate friendly name found: ${name}. Name must be unique.`);
        }
        const sanitizedPaths = paths
            ? Object.entries(paths).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {})
            : undefined;
        mappedBuckets[name] = {
            bucketName,
            region,
            paths: sanitizedPaths,
        };
    });
    return mappedBuckets;
}


//# sourceMappingURL=parseAmplifyOutputs.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/parseAmplifyConfig.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Parses the variety of configuration shapes that Amplify can accept into a ResourcesConfig.
 *
 * @param amplifyConfig An Amplify configuration object conforming to one of the supported schemas.
 * @return A ResourcesConfig for the provided configuration object.
 */
const parseAmplifyConfig = (amplifyConfig) => {
    if (Object.keys(amplifyConfig).some(key => key.startsWith('aws_'))) {
        return parseAWSExports(amplifyConfig);
    }
    else if (isAmplifyOutputs(amplifyConfig)) {
        return parseAmplifyOutputs(amplifyConfig);
    }
    else {
        return amplifyConfig;
    }
};


//# sourceMappingURL=parseAmplifyConfig.mjs.map

;// ../../node_modules/@aws-crypto/sha256-js/node_modules/tslib/tslib.es6.mjs
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
  extendStatics = Object.setPrototypeOf ||
      ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
      function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
  return extendStatics(d, b);
};

function __extends(d, b) {
  if (typeof b !== "function" && b !== null)
      throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
  extendStatics(d, b);
  function __() { this.constructor = d; }
  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var __assign = function() {
  __assign = Object.assign || function __assign(t) {
      for (var s, i = 1, n = arguments.length; i < n; i++) {
          s = arguments[i];
          for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
  }
  return __assign.apply(this, arguments);
}

function __rest(s, e) {
  var t = {};
  for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
              t[p[i]] = s[p[i]];
      }
  return t;
}

function __decorate(decorators, target, key, desc) {
  var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
  if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
  else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
  return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function __param(paramIndex, decorator) {
  return function (target, key) { decorator(target, key, paramIndex); }
}

function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
  function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
  var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
  var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
  var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
  var _, done = false;
  for (var i = decorators.length - 1; i >= 0; i--) {
      var context = {};
      for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
      for (var p in contextIn.access) context.access[p] = contextIn.access[p];
      context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
      var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
      if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
      }
      else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
      }
  }
  if (target) Object.defineProperty(target, contextIn.name, descriptor);
  done = true;
};

function __runInitializers(thisArg, initializers, value) {
  var useValue = arguments.length > 2;
  for (var i = 0; i < initializers.length; i++) {
      value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
  }
  return useValue ? value : void 0;
};

function __propKey(x) {
  return typeof x === "symbol" ? x : "".concat(x);
};

function __setFunctionName(f, name, prefix) {
  if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
  return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
};

function __metadata(metadataKey, metadataValue) {
  if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function __awaiter(thisArg, _arguments, P, generator) {
  function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
  return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
      function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
      function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
  });
}

function __generator(thisArg, body) {
  var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
  return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
  function verb(n) { return function (v) { return step([n, v]); }; }
  function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
              case 0: case 1: t = op; break;
              case 4: _.label++; return { value: op[1], done: false };
              case 5: _.label++; y = op[1]; op = [0]; continue;
              case 7: op = _.ops.pop(); _.trys.pop(); continue;
              default:
                  if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                  if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                  if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                  if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                  if (t[2]) _.ops.pop();
                  _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
      } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
      if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
  }
}

var __createBinding = Object.create ? (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
  }
  Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});

function __exportStar(m, o) {
  for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}

function __values(o) {
  var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
  if (m) return m.call(o);
  if (o && typeof o.length === "number") return {
      next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
      }
  };
  throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o), r, ar = [], e;
  try {
      while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  }
  catch (error) { e = { error: error }; }
  finally {
      try {
          if (r && !r.done && (m = i["return"])) m.call(i);
      }
      finally { if (e) throw e.error; }
  }
  return ar;
}

/** @deprecated */
function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++)
      ar = ar.concat(__read(arguments[i]));
  return ar;
}

/** @deprecated */
function __spreadArrays() {
  for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
  for (var r = Array(s), k = 0, i = 0; i < il; i++)
      for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
          r[k] = a[j];
  return r;
}

function __spreadArray(to, from, pack) {
  if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
      if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
      }
  }
  return to.concat(ar || Array.prototype.slice.call(from));
}

function __await(v) {
  return this instanceof __await ? (this.v = v, this) : new __await(v);
}

function __asyncGenerator(thisArg, _arguments, generator) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var g = generator.apply(thisArg, _arguments || []), i, q = [];
  return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
  function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
  function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
  function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
  function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
  function fulfill(value) { resume("next", value); }
  function reject(value) { resume("throw", value); }
  function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function __asyncDelegator(o) {
  var i, p;
  return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
  function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
}

function __asyncValues(o) {
  if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
  var m = o[Symbol.asyncIterator], i;
  return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
  function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
  function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function __makeTemplateObject(cooked, raw) {
  if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
  return cooked;
};

var __setModuleDefault = Object.create ? (function(o, v) {
  Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
  o["default"] = v;
};

var ownKeys = function(o) {
  ownKeys = Object.getOwnPropertyNames || function (o) {
    var ar = [];
    for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
    return ar;
  };
  return ownKeys(o);
};

function __importStar(mod) {
  if (mod && mod.__esModule) return mod;
  var result = {};
  if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
  __setModuleDefault(result, mod);
  return result;
}

function __importDefault(mod) {
  return (mod && mod.__esModule) ? mod : { default: mod };
}

function __classPrivateFieldGet(receiver, state, kind, f) {
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
  return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function __classPrivateFieldSet(receiver, state, value, kind, f) {
  if (kind === "m") throw new TypeError("Private method is not writable");
  if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
  if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
  return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function __classPrivateFieldIn(state, receiver) {
  if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
  return typeof state === "function" ? receiver === state : state.has(receiver);
}

function __addDisposableResource(env, value, async) {
  if (value !== null && value !== void 0) {
    if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
    var dispose, inner;
    if (async) {
      if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
      dispose = value[Symbol.asyncDispose];
    }
    if (dispose === void 0) {
      if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
      dispose = value[Symbol.dispose];
      if (async) inner = dispose;
    }
    if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
    if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
    env.stack.push({ value: value, dispose: dispose, async: async });
  }
  else if (async) {
    env.stack.push({ async: true });
  }
  return value;
}

var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
  var e = new Error(message);
  return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

function __disposeResources(env) {
  function fail(e) {
    env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
    env.hasError = true;
  }
  var r, s = 0;
  function next() {
    while (r = env.stack.pop()) {
      try {
        if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
        if (r.dispose) {
          var result = r.dispose.call(r.value);
          if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
        }
        else s |= 1;
      }
      catch (e) {
        fail(e);
      }
    }
    if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
    if (env.hasError) throw env.error;
  }
  return next();
}

function __rewriteRelativeImportExtension(path, preserveJsx) {
  if (typeof path === "string" && /^\.\.?\//.test(path)) {
      return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function (m, tsx, d, ext, cm) {
          return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : (d + ext + "." + cm.toLowerCase() + "js");
      });
  }
  return path;
}

/* harmony default export */ const tslib_es6 = ({
  __extends,
  __assign,
  __rest,
  __decorate,
  __param,
  __esDecorate,
  __runInitializers,
  __propKey,
  __setFunctionName,
  __metadata,
  __awaiter,
  __generator,
  __createBinding,
  __exportStar,
  __values,
  __read,
  __spread,
  __spreadArrays,
  __spreadArray,
  __await,
  __asyncGenerator,
  __asyncDelegator,
  __asyncValues,
  __makeTemplateObject,
  __importStar,
  __importDefault,
  __classPrivateFieldGet,
  __classPrivateFieldSet,
  __classPrivateFieldIn,
  __addDisposableResource,
  __disposeResources,
  __rewriteRelativeImportExtension,
});

;// ../../node_modules/@aws-crypto/sha256-js/build/module/constants.js
/**
 * @internal
 */
var BLOCK_SIZE = 64;
/**
 * @internal
 */
var DIGEST_LENGTH = 32;
/**
 * @internal
 */
var KEY = new Uint32Array([
    0x428a2f98,
    0x71374491,
    0xb5c0fbcf,
    0xe9b5dba5,
    0x3956c25b,
    0x59f111f1,
    0x923f82a4,
    0xab1c5ed5,
    0xd807aa98,
    0x12835b01,
    0x243185be,
    0x550c7dc3,
    0x72be5d74,
    0x80deb1fe,
    0x9bdc06a7,
    0xc19bf174,
    0xe49b69c1,
    0xefbe4786,
    0x0fc19dc6,
    0x240ca1cc,
    0x2de92c6f,
    0x4a7484aa,
    0x5cb0a9dc,
    0x76f988da,
    0x983e5152,
    0xa831c66d,
    0xb00327c8,
    0xbf597fc7,
    0xc6e00bf3,
    0xd5a79147,
    0x06ca6351,
    0x14292967,
    0x27b70a85,
    0x2e1b2138,
    0x4d2c6dfc,
    0x53380d13,
    0x650a7354,
    0x766a0abb,
    0x81c2c92e,
    0x92722c85,
    0xa2bfe8a1,
    0xa81a664b,
    0xc24b8b70,
    0xc76c51a3,
    0xd192e819,
    0xd6990624,
    0xf40e3585,
    0x106aa070,
    0x19a4c116,
    0x1e376c08,
    0x2748774c,
    0x34b0bcb5,
    0x391c0cb3,
    0x4ed8aa4a,
    0x5b9cca4f,
    0x682e6ff3,
    0x748f82ee,
    0x78a5636f,
    0x84c87814,
    0x8cc70208,
    0x90befffa,
    0xa4506ceb,
    0xbef9a3f7,
    0xc67178f2
]);
/**
 * @internal
 */
var INIT = [
    0x6a09e667,
    0xbb67ae85,
    0x3c6ef372,
    0xa54ff53a,
    0x510e527f,
    0x9b05688c,
    0x1f83d9ab,
    0x5be0cd19
];
/**
 * @internal
 */
var MAX_HASHABLE_LENGTH = Math.pow(2, 53) - 1;
//# sourceMappingURL=constants.js.map
;// ../../node_modules/@aws-crypto/sha256-js/build/module/RawSha256.js

/**
 * @internal
 */
var RawSha256 = /** @class */ (function () {
    function RawSha256() {
        this.state = Int32Array.from(INIT);
        this.temp = new Int32Array(64);
        this.buffer = new Uint8Array(64);
        this.bufferLength = 0;
        this.bytesHashed = 0;
        /**
         * @internal
         */
        this.finished = false;
    }
    RawSha256.prototype.update = function (data) {
        if (this.finished) {
            throw new Error("Attempted to update an already finished hash.");
        }
        var position = 0;
        var byteLength = data.byteLength;
        this.bytesHashed += byteLength;
        if (this.bytesHashed * 8 > MAX_HASHABLE_LENGTH) {
            throw new Error("Cannot hash more than 2^53 - 1 bits");
        }
        while (byteLength > 0) {
            this.buffer[this.bufferLength++] = data[position++];
            byteLength--;
            if (this.bufferLength === BLOCK_SIZE) {
                this.hashBuffer();
                this.bufferLength = 0;
            }
        }
    };
    RawSha256.prototype.digest = function () {
        if (!this.finished) {
            var bitsHashed = this.bytesHashed * 8;
            var bufferView = new DataView(this.buffer.buffer, this.buffer.byteOffset, this.buffer.byteLength);
            var undecoratedLength = this.bufferLength;
            bufferView.setUint8(this.bufferLength++, 0x80);
            // Ensure the final block has enough room for the hashed length
            if (undecoratedLength % BLOCK_SIZE >= BLOCK_SIZE - 8) {
                for (var i = this.bufferLength; i < BLOCK_SIZE; i++) {
                    bufferView.setUint8(i, 0);
                }
                this.hashBuffer();
                this.bufferLength = 0;
            }
            for (var i = this.bufferLength; i < BLOCK_SIZE - 8; i++) {
                bufferView.setUint8(i, 0);
            }
            bufferView.setUint32(BLOCK_SIZE - 8, Math.floor(bitsHashed / 0x100000000), true);
            bufferView.setUint32(BLOCK_SIZE - 4, bitsHashed);
            this.hashBuffer();
            this.finished = true;
        }
        // The value in state is little-endian rather than big-endian, so flip
        // each word into a new Uint8Array
        var out = new Uint8Array(DIGEST_LENGTH);
        for (var i = 0; i < 8; i++) {
            out[i * 4] = (this.state[i] >>> 24) & 0xff;
            out[i * 4 + 1] = (this.state[i] >>> 16) & 0xff;
            out[i * 4 + 2] = (this.state[i] >>> 8) & 0xff;
            out[i * 4 + 3] = (this.state[i] >>> 0) & 0xff;
        }
        return out;
    };
    RawSha256.prototype.hashBuffer = function () {
        var _a = this, buffer = _a.buffer, state = _a.state;
        var state0 = state[0], state1 = state[1], state2 = state[2], state3 = state[3], state4 = state[4], state5 = state[5], state6 = state[6], state7 = state[7];
        for (var i = 0; i < BLOCK_SIZE; i++) {
            if (i < 16) {
                this.temp[i] =
                    ((buffer[i * 4] & 0xff) << 24) |
                        ((buffer[i * 4 + 1] & 0xff) << 16) |
                        ((buffer[i * 4 + 2] & 0xff) << 8) |
                        (buffer[i * 4 + 3] & 0xff);
            }
            else {
                var u = this.temp[i - 2];
                var t1_1 = ((u >>> 17) | (u << 15)) ^ ((u >>> 19) | (u << 13)) ^ (u >>> 10);
                u = this.temp[i - 15];
                var t2_1 = ((u >>> 7) | (u << 25)) ^ ((u >>> 18) | (u << 14)) ^ (u >>> 3);
                this.temp[i] =
                    ((t1_1 + this.temp[i - 7]) | 0) + ((t2_1 + this.temp[i - 16]) | 0);
            }
            var t1 = ((((((state4 >>> 6) | (state4 << 26)) ^
                ((state4 >>> 11) | (state4 << 21)) ^
                ((state4 >>> 25) | (state4 << 7))) +
                ((state4 & state5) ^ (~state4 & state6))) |
                0) +
                ((state7 + ((KEY[i] + this.temp[i]) | 0)) | 0)) |
                0;
            var t2 = ((((state0 >>> 2) | (state0 << 30)) ^
                ((state0 >>> 13) | (state0 << 19)) ^
                ((state0 >>> 22) | (state0 << 10))) +
                ((state0 & state1) ^ (state0 & state2) ^ (state1 & state2))) |
                0;
            state7 = state6;
            state6 = state5;
            state5 = state4;
            state4 = (state3 + t1) | 0;
            state3 = state2;
            state2 = state1;
            state1 = state0;
            state0 = (t1 + t2) | 0;
        }
        state[0] += state0;
        state[1] += state1;
        state[2] += state2;
        state[3] += state3;
        state[4] += state4;
        state[5] += state5;
        state[6] += state6;
        state[7] += state7;
    };
    return RawSha256;
}());

//# sourceMappingURL=RawSha256.js.map
;// ../../node_modules/@aws-crypto/util/node_modules/@smithy/util-utf8/dist-es/fromUtf8.browser.js
const fromUtf8 = (input) => new TextEncoder().encode(input);

;// ../../node_modules/@aws-crypto/util/build/module/convertToBuffer.js
// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Quick polyfill
var convertToBuffer_fromUtf8 = typeof Buffer !== "undefined" && Buffer.from
    ? function (input) { return Buffer.from(input, "utf8"); }
    : fromUtf8;
function convertToBuffer(data) {
    // Already a Uint8, do nothing
    if (data instanceof Uint8Array)
        return data;
    if (typeof data === "string") {
        return convertToBuffer_fromUtf8(data);
    }
    if (ArrayBuffer.isView(data)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength / Uint8Array.BYTES_PER_ELEMENT);
    }
    return new Uint8Array(data);
}
//# sourceMappingURL=convertToBuffer.js.map
;// ../../node_modules/@aws-crypto/util/build/module/isEmptyData.js
// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function isEmptyData(data) {
    if (typeof data === "string") {
        return data.length === 0;
    }
    return data.byteLength === 0;
}
//# sourceMappingURL=isEmptyData.js.map
;// ../../node_modules/@aws-crypto/util/build/module/index.js
// Copyright Amazon.com Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0




//# sourceMappingURL=index.js.map
;// ../../node_modules/@aws-crypto/sha256-js/build/module/jsSha256.js




var Sha256 = /** @class */ (function () {
    function Sha256(secret) {
        this.secret = secret;
        this.hash = new RawSha256();
        this.reset();
    }
    Sha256.prototype.update = function (toHash) {
        if (isEmptyData(toHash) || this.error) {
            return;
        }
        try {
            this.hash.update(convertToBuffer(toHash));
        }
        catch (e) {
            this.error = e;
        }
    };
    /* This synchronous method keeps compatibility
     * with the v2 aws-sdk.
     */
    Sha256.prototype.digestSync = function () {
        if (this.error) {
            throw this.error;
        }
        if (this.outer) {
            if (!this.outer.finished) {
                this.outer.update(this.hash.digest());
            }
            return this.outer.digest();
        }
        return this.hash.digest();
    };
    /* The underlying digest method here is synchronous.
     * To keep the same interface with the other hash functions
     * the default is to expose this as an async method.
     * However, it can sometimes be useful to have a sync method.
     */
    Sha256.prototype.digest = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.digestSync()];
            });
        });
    };
    Sha256.prototype.reset = function () {
        this.hash = new RawSha256();
        if (this.secret) {
            this.outer = new RawSha256();
            var inner = bufferFromSecret(this.secret);
            var outer = new Uint8Array(BLOCK_SIZE);
            outer.set(inner);
            for (var i = 0; i < BLOCK_SIZE; i++) {
                inner[i] ^= 0x36;
                outer[i] ^= 0x5c;
            }
            this.hash.update(inner);
            this.outer.update(outer);
            // overwrite the copied key in memory
            for (var i = 0; i < inner.byteLength; i++) {
                inner[i] = 0;
            }
        }
    };
    return Sha256;
}());

function bufferFromSecret(secret) {
    var input = convertToBuffer(secret);
    if (input.byteLength > BLOCK_SIZE) {
        var bufferHash = new RawSha256();
        bufferHash.update(input);
        input = bufferHash.digest();
    }
    var buffer = new Uint8Array(BLOCK_SIZE);
    buffer.set(input);
    return buffer;
}
//# sourceMappingURL=jsSha256.js.map
;// ../../node_modules/@aws-crypto/sha256-js/build/module/index.js

//# sourceMappingURL=index.js.map
;// ../../node_modules/@aws-amplify/core/node_modules/@smithy/util-hex-encoding/dist-es/index.js
const SHORT_TO_HEX = {};
const HEX_TO_SHORT = {};
for (let i = 0; i < 256; i++) {
    let encodedByte = i.toString(16).toLowerCase();
    if (encodedByte.length === 1) {
        encodedByte = `0${encodedByte}`;
    }
    SHORT_TO_HEX[i] = encodedByte;
    HEX_TO_SHORT[encodedByte] = i;
}
function fromHex(encoded) {
    if (encoded.length % 2 !== 0) {
        throw new Error("Hex encoded strings must have an even number length");
    }
    const out = new Uint8Array(encoded.length / 2);
    for (let i = 0; i < encoded.length; i += 2) {
        const encodedByte = encoded.slice(i, i + 2).toLowerCase();
        if (encodedByte in HEX_TO_SHORT) {
            out[i / 2] = HEX_TO_SHORT[encodedByte];
        }
        else {
            throw new Error(`Cannot decode unrecognized sequence ${encodedByte} as hexadecimal`);
        }
    }
    return out;
}
function toHex(bytes) {
    let out = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        out += SHORT_TO_HEX[bytes[i]];
    }
    return out;
}

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/Auth/index.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const Auth_logger = new ConsoleLogger('Auth');
class AuthClass {
    /**
     * Configure Auth category
     *
     * @internal
     *
     * @param authResourcesConfig - Resources configurations required by Auth providers.
     * @param authOptions - Client options used by library
     *
     * @returns void
     */
    configure(authResourcesConfig, authOptions) {
        this.authConfig = authResourcesConfig;
        this.authOptions = authOptions;
        if (authResourcesConfig && authResourcesConfig.Cognito?.userPoolEndpoint) {
            Auth_logger.warn(getCustomEndpointWarningMessage('Amazon Cognito User Pool'));
        }
        if (authResourcesConfig &&
            authResourcesConfig.Cognito?.identityPoolEndpoint) {
            Auth_logger.warn(getCustomEndpointWarningMessage('Amazon Cognito Identity Pool'));
        }
    }
    /**
     * Fetch the auth tokens, and the temporary AWS credentials and identity if they are configured. By default it
     * will automatically refresh expired auth tokens if a valid refresh token is present. You can force a refresh
     * of non-expired tokens with `{ forceRefresh: true }` input.
     *
     * @param options - Options configuring the fetch behavior.
     *
     * @returns Promise of current auth session {@link AuthSession}.
     */
    async fetchAuthSession(options = {}) {
        let credentialsAndIdentityId;
        let userSub;
        // Get tokens will throw if session cannot be refreshed (network or service error) or return null if not available
        const tokens = await this.getTokens(options);
        if (tokens) {
            userSub = tokens.accessToken?.payload?.sub;
            // getCredentialsAndIdentityId will throw if cannot get credentials (network or service error)
            credentialsAndIdentityId =
                await this.authOptions?.credentialsProvider?.getCredentialsAndIdentityId({
                    authConfig: this.authConfig,
                    tokens,
                    authenticated: true,
                    forceRefresh: options.forceRefresh,
                });
        }
        else {
            // getCredentialsAndIdentityId will throw if cannot get credentials (network or service error)
            credentialsAndIdentityId =
                await this.authOptions?.credentialsProvider?.getCredentialsAndIdentityId({
                    authConfig: this.authConfig,
                    authenticated: false,
                    forceRefresh: options.forceRefresh,
                });
        }
        return {
            tokens,
            credentials: credentialsAndIdentityId?.credentials,
            identityId: credentialsAndIdentityId?.identityId,
            userSub,
        };
    }
    async clearCredentials() {
        await this.authOptions?.credentialsProvider?.clearCredentialsAndIdentityId();
    }
    async getTokens(options) {
        return ((await this.authOptions?.tokenProvider?.getTokens(options)) ?? undefined);
    }
}
const getCustomEndpointWarningMessage = (target) => `You are using a custom Amazon ${target} endpoint, ensure the endpoint is correct.`;


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/Amplify.mjs




















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
class AmplifyClass {
    constructor() {
        this.oAuthListener = undefined;
        this.isConfigured = false;
        this.resourcesConfig = {};
        this.libraryOptions = {};
        this.Auth = new AuthClass();
    }
    /**
     * Configures Amplify for use with your back-end resources.
     *
     * @remarks
     * This API does not perform any merging of either `resourcesConfig` or `libraryOptions`. The most recently
     * provided values will be used after configuration.
     *
     * @remarks
     * `configure` can be used to specify additional library options where available for supported categories.
     *
     * @param resourceConfig - Back-end resource configuration. Typically provided via the `aws-exports.js` file.
     * @param libraryOptions - Additional options for customizing the behavior of the library.
     */
    configure(resourcesConfig, libraryOptions) {
        const resolvedResourceConfig = parseAmplifyConfig(resourcesConfig);
        this.resourcesConfig = resolvedResourceConfig;
        if (libraryOptions) {
            this.libraryOptions = libraryOptions;
        }
        // Make resource config immutable
        this.resourcesConfig = deepFreeze(this.resourcesConfig);
        this.Auth.configure(this.resourcesConfig.Auth, this.libraryOptions.Auth);
        // Warn if Pinpoint is configured
        if (this.resourcesConfig.Analytics?.Pinpoint ||
            this.resourcesConfig.Notifications?.InAppMessaging?.Pinpoint ||
            this.resourcesConfig.Notifications?.PushNotification?.Pinpoint) {
            // eslint-disable-next-line no-console
            console.warn('AWS will end support for Amazon Pinpoint on October 30, 2026. ' +
                'The guidance is to use AWS End User Messaging for push notifications and SMS, ' +
                'Amazon Simple Email Service for sending emails, Amazon Connect for campaigns, journeys, endpoints, and engagement analytics. ' +
                'Pinpoint recommends Amazon Kinesis for event collection and mobile analytics.');
        }
        Hub.dispatch('core', {
            event: 'configure',
            data: this.resourcesConfig,
        }, 'Configure', AMPLIFY_SYMBOL);
        this.notifyOAuthListener();
        this.isConfigured = true;
    }
    /**
     * Provides access to the current back-end resource configuration for the Library.
     *
     * @returns Returns the immutable back-end resource configuration.
     */
    getConfig() {
        if (!this.isConfigured) {
            // eslint-disable-next-line no-console
            console.warn(`Amplify has not been configured. Please call Amplify.configure() before using this service.`);
        }
        return this.resourcesConfig;
    }
    /** @internal */
    [ADD_OAUTH_LISTENER](listener) {
        if (this.resourcesConfig.Auth?.Cognito.loginWith?.oauth) {
            // when Amplify has been configured with a valid OAuth config while adding the listener, run it directly
            listener(this.resourcesConfig.Auth?.Cognito);
        }
        else {
            // otherwise register the listener and run it later when Amplify gets configured with a valid oauth config
            this.oAuthListener = listener;
        }
    }
    notifyOAuthListener() {
        if (!this.resourcesConfig.Auth?.Cognito.loginWith?.oauth ||
            !this.oAuthListener) {
            return;
        }
        this.oAuthListener(this.resourcesConfig.Auth?.Cognito);
        // the listener should only be notified once with a valid oauth config
        this.oAuthListener = undefined;
    }
}
/**
 * The `Amplify` utility is used to configure the library.
 *
 * @remarks
 * `Amplify` orchestrates cross-category communication within the library.
 */
const Amplify = new AmplifyClass();


//# sourceMappingURL=Amplify.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/types.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var Framework;
(function (Framework) {
    // < 100 - Web frameworks
    Framework["WebUnknown"] = "0";
    Framework["React"] = "1";
    Framework["NextJs"] = "2";
    Framework["Angular"] = "3";
    Framework["VueJs"] = "4";
    Framework["Nuxt"] = "5";
    Framework["Svelte"] = "6";
    // 100s - Server side frameworks
    Framework["ServerSideUnknown"] = "100";
    Framework["ReactSSR"] = "101";
    Framework["NextJsSSR"] = "102";
    Framework["AngularSSR"] = "103";
    Framework["VueJsSSR"] = "104";
    Framework["NuxtSSR"] = "105";
    Framework["SvelteSSR"] = "106";
    // 200s - Mobile framework
    Framework["ReactNative"] = "201";
    Framework["Expo"] = "202";
})(Framework || (Framework = {}));
var Category;
(function (Category) {
    Category["AI"] = "ai";
    Category["API"] = "api";
    Category["Auth"] = "auth";
    Category["Analytics"] = "analytics";
    Category["DataStore"] = "datastore";
    Category["Geo"] = "geo";
    Category["InAppMessaging"] = "inappmessaging";
    Category["Interactions"] = "interactions";
    Category["Predictions"] = "predictions";
    Category["PubSub"] = "pubsub";
    Category["PushNotification"] = "pushnotification";
    Category["Storage"] = "storage";
})(Category || (Category = {}));
var AiAction;
(function (AiAction) {
    AiAction["CreateConversation"] = "1";
    AiAction["GetConversation"] = "2";
    AiAction["ListConversations"] = "3";
    AiAction["DeleteConversation"] = "4";
    AiAction["SendMessage"] = "5";
    AiAction["ListMessages"] = "6";
    AiAction["OnMessage"] = "7";
    AiAction["Generation"] = "8";
    AiAction["UpdateConversation"] = "9";
})(AiAction || (AiAction = {}));
var AnalyticsAction;
(function (AnalyticsAction) {
    AnalyticsAction["Record"] = "1";
    AnalyticsAction["IdentifyUser"] = "2";
})(AnalyticsAction || (AnalyticsAction = {}));
var ApiAction;
(function (ApiAction) {
    ApiAction["GraphQl"] = "1";
    ApiAction["Get"] = "2";
    ApiAction["Post"] = "3";
    ApiAction["Put"] = "4";
    ApiAction["Patch"] = "5";
    ApiAction["Del"] = "6";
    ApiAction["Head"] = "7";
})(ApiAction || (ApiAction = {}));
var AuthAction;
(function (AuthAction) {
    AuthAction["SignUp"] = "1";
    AuthAction["ConfirmSignUp"] = "2";
    AuthAction["ResendSignUpCode"] = "3";
    AuthAction["SignIn"] = "4";
    AuthAction["FetchMFAPreference"] = "6";
    AuthAction["UpdateMFAPreference"] = "7";
    AuthAction["SetUpTOTP"] = "10";
    AuthAction["VerifyTOTPSetup"] = "11";
    AuthAction["ConfirmSignIn"] = "12";
    AuthAction["DeleteUserAttributes"] = "15";
    AuthAction["DeleteUser"] = "16";
    AuthAction["UpdateUserAttributes"] = "17";
    AuthAction["FetchUserAttributes"] = "18";
    AuthAction["ConfirmUserAttribute"] = "22";
    AuthAction["SignOut"] = "26";
    AuthAction["UpdatePassword"] = "27";
    AuthAction["ResetPassword"] = "28";
    AuthAction["ConfirmResetPassword"] = "29";
    AuthAction["FederatedSignIn"] = "30";
    AuthAction["RememberDevice"] = "32";
    AuthAction["ForgetDevice"] = "33";
    AuthAction["FetchDevices"] = "34";
    AuthAction["SendUserAttributeVerificationCode"] = "35";
    AuthAction["SignInWithRedirect"] = "36";
    AuthAction["StartWebAuthnRegistration"] = "37";
    AuthAction["CompleteWebAuthnRegistration"] = "38";
    AuthAction["ListWebAuthnCredentials"] = "39";
    AuthAction["DeleteWebAuthnCredential"] = "40";
})(AuthAction || (AuthAction = {}));
var DataStoreAction;
(function (DataStoreAction) {
    DataStoreAction["Subscribe"] = "1";
    DataStoreAction["GraphQl"] = "2";
})(DataStoreAction || (DataStoreAction = {}));
var GeoAction;
(function (GeoAction) {
    GeoAction["SearchByText"] = "0";
    GeoAction["SearchByCoordinates"] = "1";
    GeoAction["SearchForSuggestions"] = "2";
    GeoAction["SearchByPlaceId"] = "3";
    GeoAction["SaveGeofences"] = "4";
    GeoAction["GetGeofence"] = "5";
    GeoAction["ListGeofences"] = "6";
    GeoAction["DeleteGeofences"] = "7";
})(GeoAction || (GeoAction = {}));
var InAppMessagingAction;
(function (InAppMessagingAction) {
    InAppMessagingAction["SyncMessages"] = "1";
    InAppMessagingAction["IdentifyUser"] = "2";
    InAppMessagingAction["NotifyMessageInteraction"] = "3";
})(InAppMessagingAction || (InAppMessagingAction = {}));
var InteractionsAction;
(function (InteractionsAction) {
    InteractionsAction["None"] = "0";
})(InteractionsAction || (InteractionsAction = {}));
var PredictionsAction;
(function (PredictionsAction) {
    PredictionsAction["Convert"] = "1";
    PredictionsAction["Identify"] = "2";
    PredictionsAction["Interpret"] = "3";
})(PredictionsAction || (PredictionsAction = {}));
var PubSubAction;
(function (PubSubAction) {
    PubSubAction["Subscribe"] = "1";
})(PubSubAction || (PubSubAction = {}));
var PushNotificationAction;
(function (PushNotificationAction) {
    PushNotificationAction["InitializePushNotifications"] = "1";
    PushNotificationAction["IdentifyUser"] = "2";
    PushNotificationAction["RegisterDevice"] = "3";
    PushNotificationAction["RemoveDevice"] = "4";
})(PushNotificationAction || (PushNotificationAction = {}));
var StorageAction;
(function (StorageAction) {
    StorageAction["UploadData"] = "1";
    StorageAction["DownloadData"] = "2";
    StorageAction["List"] = "3";
    StorageAction["Copy"] = "4";
    StorageAction["Remove"] = "5";
    StorageAction["GetProperties"] = "6";
    StorageAction["GetUrl"] = "7";
    StorageAction["GetDataAccess"] = "8";
    StorageAction["ListCallerAccessGrants"] = "9";
})(StorageAction || (StorageAction = {}));


//# sourceMappingURL=types.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/version.mjs
// generated by genversion
const version = '6.20.0';


//# sourceMappingURL=version.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/helpers.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const globalExists = () => {
    return typeof __webpack_require__.g !== 'undefined';
};
const globalThisExists = () => {
    return typeof globalThis !== 'undefined';
};
const windowExists = () => {
    return typeof window !== 'undefined';
};
const documentExists = () => {
    return typeof document !== 'undefined';
};
const processExists = () => {
    return typeof process !== 'undefined';
};
const keyPrefixMatch = (object, prefix) => {
    return !!Object.keys(object).find(key => key.startsWith(prefix));
};


//# sourceMappingURL=helpers.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/React.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with react 18.2 - built using Vite
function reactWebDetect() {
    const elementKeyPrefixedWithReact = (key) => {
        return key.startsWith('_react') || key.startsWith('__react');
    };
    const elementIsReactEnabled = (element) => {
        return Object.keys(element).find(elementKeyPrefixedWithReact);
    };
    const allElementsWithId = () => Array.from(document.querySelectorAll('[id]'));
    return documentExists() && allElementsWithId().some(elementIsReactEnabled);
}
function reactSSRDetect() {
    return (processExists() &&
        typeof process.env !== 'undefined' &&
        !!Object.keys(process.env).find(key => key.includes('react')));
}
// use the some


//# sourceMappingURL=React.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Vue.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with vue 3.3.2
function vueWebDetect() {
    return windowExists() && keyPrefixMatch(window, '__VUE');
}
function vueSSRDetect() {
    return globalExists() && keyPrefixMatch(__webpack_require__.g, '__VUE');
}


//# sourceMappingURL=Vue.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Svelte.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with svelte 3.59
function svelteWebDetect() {
    return windowExists() && keyPrefixMatch(window, '__SVELTE');
}
function svelteSSRDetect() {
    return (processExists() &&
        typeof process.env !== 'undefined' &&
        !!Object.keys(process.env).find(key => key.includes('svelte')));
}


//# sourceMappingURL=Svelte.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Next.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with next 13.4 / react 18.2
function nextWebDetect() {
    return (windowExists() &&
        window.next &&
        typeof window.next === 'object');
}
function nextSSRDetect() {
    return (globalExists() &&
        (keyPrefixMatch(__webpack_require__.g, '__next') || keyPrefixMatch(__webpack_require__.g, '__NEXT')));
}


//# sourceMappingURL=Next.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Nuxt.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with nuxt 2.15 / vue 2.7
function nuxtWebDetect() {
    return (windowExists() &&
        (window.__NUXT__ !== undefined ||
            window.$nuxt !== undefined));
}
function nuxtSSRDetect() {
    return (globalExists() && typeof __webpack_require__.g.__NUXT_PATHS__ !== 'undefined');
}


//# sourceMappingURL=Nuxt.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Angular.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with @angular/core 16.0.0
function angularWebDetect() {
    const angularVersionSetInDocument = Boolean(documentExists() && document.querySelector('[ng-version]'));
    const angularContentSetInWindow = Boolean(windowExists() && typeof window.ng !== 'undefined');
    return angularVersionSetInDocument || angularContentSetInWindow;
}
function angularSSRDetect() {
    return ((processExists() &&
        typeof process.env === 'object' &&
        "npm run build-prod --prefix ../extension-popup && rimraf dist && webpack --env production && npm run build-dev --prefix ../extension-popup "?.startsWith('ng ')) ||
        false);
}


//# sourceMappingURL=Angular.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/ReactNative.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with react-native 0.17.7
function reactNativeDetect() {
    return (typeof navigator !== 'undefined' &&
        typeof navigator.product !== 'undefined' &&
        navigator.product === 'ReactNative');
}


//# sourceMappingURL=ReactNative.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Expo.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Tested with expo 48 / react-native 0.71.3
function expoDetect() {
    return globalExists() && typeof __webpack_require__.g.expo !== 'undefined';
}


//# sourceMappingURL=Expo.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/Web.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function webDetect() {
    return windowExists();
}


//# sourceMappingURL=Web.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detection/index.mjs











// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// These are in the order of detection where when both are detectable, the early Framework will be reported
const detectionMap = [
    // First, detect mobile
    { platform: Framework.Expo, detectionMethod: expoDetect },
    { platform: Framework.ReactNative, detectionMethod: reactNativeDetect },
    // Next, detect web frameworks
    { platform: Framework.NextJs, detectionMethod: nextWebDetect },
    { platform: Framework.Nuxt, detectionMethod: nuxtWebDetect },
    { platform: Framework.Angular, detectionMethod: angularWebDetect },
    { platform: Framework.React, detectionMethod: reactWebDetect },
    { platform: Framework.VueJs, detectionMethod: vueWebDetect },
    { platform: Framework.Svelte, detectionMethod: svelteWebDetect },
    { platform: Framework.WebUnknown, detectionMethod: webDetect },
    // Last, detect ssr frameworks
    { platform: Framework.NextJsSSR, detectionMethod: nextSSRDetect },
    { platform: Framework.NuxtSSR, detectionMethod: nuxtSSRDetect },
    { platform: Framework.ReactSSR, detectionMethod: reactSSRDetect },
    { platform: Framework.VueJsSSR, detectionMethod: vueSSRDetect },
    { platform: Framework.AngularSSR, detectionMethod: angularSSRDetect },
    { platform: Framework.SvelteSSR, detectionMethod: svelteSSRDetect },
];
function detect() {
    return (detectionMap.find(detectionEntry => detectionEntry.detectionMethod())
        ?.platform || Framework.ServerSideUnknown);
}


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/detectFramework.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// We want to cache detection since the framework won't change
let frameworkCache;
const frameworkChangeObservers = [];
// Setup the detection reset tracking / timeout delays
let resetTriggered = false;
const SSR_RESET_TIMEOUT = 10; // ms
const WEB_RESET_TIMEOUT = 10; // ms
const PRIME_FRAMEWORK_DELAY = 1000; // ms
const detectFramework = () => {
    if (!frameworkCache) {
        frameworkCache = detect();
        if (resetTriggered) {
            // The final run of detectFramework:
            // Starting from this point, the `frameworkCache` becomes "final".
            // So we don't need to notify the observers again so the observer
            // can be removed after the final notice.
            while (frameworkChangeObservers.length) {
                frameworkChangeObservers.pop()?.();
            }
        }
        else {
            // The first run of detectFramework:
            // Every time we update the cache, call each observer function
            frameworkChangeObservers.forEach(fcn => {
                fcn();
            });
        }
        // Retry once for either Unknown type after a delay (explained below)
        resetTimeout(Framework.ServerSideUnknown, SSR_RESET_TIMEOUT);
        resetTimeout(Framework.WebUnknown, WEB_RESET_TIMEOUT);
    }
    return frameworkCache;
};
/**
 * @internal Setup observer callback that will be called everytime the framework changes
 */
const observeFrameworkChanges = (fcn) => {
    // When the `frameworkCache` won't be updated again, we ignore all incoming
    // observers.
    if (resetTriggered) {
        return;
    }
    frameworkChangeObservers.push(fcn);
};
function clearCache() {
    frameworkCache = undefined;
}
// For a framework type and a delay amount, setup the event to re-detect
//   During the runtime boot, it is possible that framework detection will
//   be triggered before the framework has made modifications to the
//   global/window/etc needed for detection. When no framework is detected
//   we will reset and try again to ensure we don't use a cached
//   non-framework detection result for all requests.
function resetTimeout(framework, delay) {
    if (frameworkCache === framework && !resetTriggered) {
        setTimeout(() => {
            clearCache();
            resetTriggered = true;
            setTimeout(detectFramework, PRIME_FRAMEWORK_DELAY);
        }, delay);
    }
}


//# sourceMappingURL=detectFramework.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/customUserAgent.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// Maintains custom user-agent state set by external consumers.
const customUserAgentState = {};
/**
 * Sets custom user agent state which will be appended to applicable requests. Returns a function that can be used to
 * clean up any custom state set with this API.
 *
 * @note
 * This API operates globally. Calling this API multiple times will result in the most recently set values for a
 * particular API being used.
 *
 * @note
 * This utility IS NOT compatible with SSR.
 *
 * @param input - SetCustomUserAgentInput that defines custom state to apply to the specified APIs.
 */
const setCustomUserAgent = (input) => {
    // Save custom user-agent state & increment reference counter
    // TODO Remove `any` when we upgrade to TypeScript 5.2, see: https://github.com/microsoft/TypeScript/issues/44373
    customUserAgentState[input.category] = input.apis.reduce((acc, api) => ({
        ...acc,
        [api]: {
            refCount: acc[api]?.refCount ? acc[api].refCount + 1 : 1,
            additionalDetails: input.additionalDetails,
        },
    }), customUserAgentState[input.category] ?? {});
    // Callback that cleans up state for APIs recorded by this call
    let cleanUpCallbackCalled = false;
    const cleanUpCallback = () => {
        // Only allow the cleanup callback to be called once
        if (cleanUpCallbackCalled) {
            return;
        }
        cleanUpCallbackCalled = true;
        input.apis.forEach(api => {
            const apiRefCount = customUserAgentState[input.category][api].refCount;
            if (apiRefCount > 1) {
                customUserAgentState[input.category][api].refCount = apiRefCount - 1;
            }
            else {
                delete customUserAgentState[input.category][api];
                // Clean up category if no more APIs set
                if (!Object.keys(customUserAgentState[input.category]).length) {
                    delete customUserAgentState[input.category];
                }
            }
        });
    };
    return cleanUpCallback;
};
const getCustomUserAgent = (category, api) => customUserAgentState[category]?.[api]?.additionalDetails;


//# sourceMappingURL=customUserAgent.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/Platform/index.mjs





// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const BASE_USER_AGENT = `aws-amplify`;
/** Sanitize Amplify version string be removing special character + and character post the special character  */
const sanitizeAmplifyVersion = (amplifyVersion) => amplifyVersion.replace(/\+.*/, '');
class PlatformBuilder {
    constructor() {
        this.userAgent = `${BASE_USER_AGENT}/${sanitizeAmplifyVersion(version)}`;
    }
    get framework() {
        return detectFramework();
    }
    get isReactNative() {
        return (this.framework === Framework.ReactNative ||
            this.framework === Framework.Expo);
    }
    observeFrameworkChanges(fcn) {
        observeFrameworkChanges(fcn);
    }
}
const Platform = new PlatformBuilder();
const getAmplifyUserAgentObject = ({ category, action, } = {}) => {
    const userAgent = [
        [BASE_USER_AGENT, sanitizeAmplifyVersion(version)],
    ];
    if (category) {
        userAgent.push([category, action]);
    }
    userAgent.push(['framework', detectFramework()]);
    if (category && action) {
        const customState = getCustomUserAgent(category, action);
        if (customState) {
            customState.forEach(state => {
                userAgent.push(state);
            });
        }
    }
    return userAgent;
};
const getAmplifyUserAgent = (customUserAgentDetails) => {
    const userAgent = getAmplifyUserAgentObject(customUserAgentDetails);
    const userAgentString = userAgent
        .map(([agentKey, agentValue]) => agentKey && agentValue ? `${agentKey}/${agentValue}` : agentKey)
        .join(' ');
    return userAgentString;
};


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/serde/responseInfo.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const parseMetadata = (response) => {
    const { headers, statusCode } = response;
    return {
        ...(isMetadataBearer(response) ? response.$metadata : {}),
        httpStatusCode: statusCode,
        requestId: headers['x-amzn-requestid'] ??
            headers['x-amzn-request-id'] ??
            headers['x-amz-request-id'],
        extendedRequestId: headers['x-amz-id-2'],
        cfId: headers['x-amz-cf-id'],
    };
};
const isMetadataBearer = (response) => typeof response?.$metadata === 'object';


//# sourceMappingURL=responseInfo.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/serde/json.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Utility functions for serializing and deserializing of JSON protocol in general(including: REST-JSON, JSON-RPC, etc.)
 */
/**
 * Error parser for AWS JSON protocol.
 */
const parseJsonError = async (response) => {
    if (!response || response.statusCode < 300) {
        return;
    }
    const body = await parseJsonBody(response);
    const sanitizeErrorCode = (rawValue) => {
        const [cleanValue] = rawValue.toString().split(/[,:]+/);
        if (cleanValue.includes('#')) {
            return cleanValue.split('#')[1];
        }
        return cleanValue;
    };
    const code = sanitizeErrorCode(response.headers['x-amzn-errortype'] ??
        body.code ??
        body.__type ??
        'UnknownError');
    const message = body.message ?? body.Message ?? 'Unknown error';
    const error = new Error(message);
    return Object.assign(error, {
        name: code,
        $metadata: parseMetadata(response),
    });
};
/**
 * Parse JSON response body to JavaScript object.
 */
const parseJsonBody = async (response) => {
    if (!response.body) {
        throw new Error('Missing response payload');
    }
    const output = await response.body.json();
    return Object.assign(output, {
        $metadata: parseMetadata(response),
    });
};


//# sourceMappingURL=json.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/internal/composeServiceApi.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Compose a service API handler that accepts input as defined shape and responds conforming to defined output shape.
 * A service API handler is composed with:
 * * A transfer handler
 * * A serializer function
 * * A deserializer function
 * * A default config object
 *
 * The returned service API handler, when called, will trigger the following workflow:
 * 1. When calling the service API handler function, the default config object is merged into the input config
 * object to assign the default values of some omitted configs, resulting to a resolved config object.
 * 2. The `endpointResolver` function from the default config object will be invoked with the resolved config object and
 * API input object resulting to an endpoint instance.
 * 3. The serializer function is invoked with API input object and the endpoint instance resulting to an HTTP request
 * instance.
 * 4. The HTTP request instance and the resolved config object is passed to the transfer handler function.
 * 5. The transfer handler function resolves to an HTTP response instance(can be either successful or failed status code).
 * 6. The deserializer function is invoked with the HTTP response instance resulting to the API output object, and
 * return to the caller.
 *
 *
 * @param transferHandler Async function for dispatching HTTP requests and returning HTTP response.
 * @param serializer  Async function for converting object in defined input shape into HTTP request targeting a given
 * 	endpoint.
 * @param deserializer Async function for converting HTTP response into output object in defined output shape, or error
 * 	shape.
 * @param defaultConfig  object containing default options to be consumed by transfer handler, serializer and
 *  deserializer.
 * @returns a async service API handler function that accepts a config object and input object in defined shape, returns
 * 	an output object in defined shape. It may also throw error instance in defined shape in deserializer. The config
 *  object type is composed with options type of transferHandler, endpointResolver function as well as endpointResolver
 *  function's input options type, region string. The config object property will be marked as optional if it's also
 * 	defined in defaultConfig.
 *
 * @internal
 */
const composeServiceApi = (transferHandler, serializer, deserializer, defaultConfig) => {
    return async (config, input) => {
        const resolvedConfig = {
            ...defaultConfig,
            ...config,
        };
        // We need to allow different endpoints based on both given config(other than region) and input.
        // However for most of non-S3 services, region is the only input for endpoint resolver.
        const endpoint = await resolvedConfig.endpointResolver(resolvedConfig, input);
        // Unlike AWS SDK clients, a serializer should NOT populate the `host` or `content-length` headers.
        // Both of these headers are prohibited per Spec(https://developer.mozilla.org/en-US/docs/Glossary/Forbidden_header_name).
        // They will be populated automatically by browser, or node-fetch polyfill.
        const request = await serializer(input, endpoint);
        const response = await transferHandler(request, {
            ...resolvedConfig,
        });
        return deserializer(response);
    };
};


//# sourceMappingURL=composeServiceApi.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/retry/constants.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const MAX_DELAY_MS = 5 * 60 * 1000;


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/retry/jitteredBackoff.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * @private
 * Internal use of Amplify only
 */
function jitteredBackoff(maxDelayMs = MAX_DELAY_MS) {
    const BASE_TIME_MS = 100;
    const JITTER_FACTOR = 100;
    return attempt => {
        const delay = 2 ** attempt * BASE_TIME_MS + JITTER_FACTOR * Math.random();
        return delay > maxDelayMs ? false : delay;
    };
}


//# sourceMappingURL=jitteredBackoff.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/constants.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const DEFAULT_RETRY_ATTEMPTS = 3;
const AMZ_SDK_INVOCATION_ID_HEADER = 'amz-sdk-invocation-id';
const AMZ_SDK_REQUEST_HEADER = 'amz-sdk-request';
const DEFAULT_MAX_DELAY_MS = 5 * 60 * 1000;


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/jitteredBackoff.mjs







// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// TODO: [v6] The separate retry utility is used by Data packages now and will replaced by retry middleware.
const jitteredBackoff_jitteredBackoff = attempt => {
    const delayFunction = jitteredBackoff(DEFAULT_MAX_DELAY_MS);
    const delay = delayFunction(attempt);
    // The delayFunction returns false when the delay is greater than the max delay(5 mins).
    // In this case, the retry middleware will delay 5 mins instead, as a ceiling of the delay.
    return delay === false ? DEFAULT_MAX_DELAY_MS : delay;
};


//# sourceMappingURL=jitteredBackoff.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/isClockSkewError.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// via https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L8
const CLOCK_SKEW_ERROR_CODES = [
    'AuthFailure',
    'InvalidSignatureException',
    'RequestExpired',
    'RequestInTheFuture',
    'RequestTimeTooSkewed',
    'SignatureDoesNotMatch',
    'BadRequestException', // API Gateway
];
/**
 * Given an error code, returns true if it is related to a clock skew error.
 *
 * @param errorCode String representation of some error.
 * @returns True if given error is present in `CLOCK_SKEW_ERROR_CODES`, false otherwise.
 *
 * @internal
 */
const isClockSkewError = (errorCode) => !!errorCode && CLOCK_SKEW_ERROR_CODES.includes(errorCode);


//# sourceMappingURL=isClockSkewError.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/defaultRetryDecider.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Get retry decider function
 * @param errorParser Function to load JavaScript error from HTTP response
 */
const getRetryDecider = (errorParser) => async (response, error) => {
    const parsedError = error ??
        (await errorParser(response)) ??
        undefined;
    const errorCode = parsedError?.code || parsedError?.name;
    const statusCode = response?.statusCode;
    const isRetryable = isConnectionError(error) ||
        isThrottlingError(statusCode, errorCode) ||
        isClockSkewError(errorCode) ||
        isServerSideError(statusCode, errorCode);
    return {
        retryable: isRetryable,
    };
};
// reference: https://github.com/aws/aws-sdk-js-v3/blob/ab0e7be36e7e7f8a0c04834357aaad643c7912c3/packages/service-error-classification/src/constants.ts#L22-L37
const THROTTLING_ERROR_CODES = [
    'BandwidthLimitExceeded',
    'EC2ThrottledException',
    'LimitExceededException',
    'PriorRequestNotComplete',
    'ProvisionedThroughputExceededException',
    'RequestLimitExceeded',
    'RequestThrottled',
    'RequestThrottledException',
    'SlowDown',
    'ThrottledException',
    'Throttling',
    'ThrottlingException',
    'TooManyRequestsException',
];
const TIMEOUT_ERROR_CODES = [
    'TimeoutError',
    'RequestTimeout',
    'RequestTimeoutException',
];
const isThrottlingError = (statusCode, errorCode) => statusCode === 429 ||
    (!!errorCode && THROTTLING_ERROR_CODES.includes(errorCode));
const isConnectionError = (error) => [
    AmplifyErrorCode.NetworkError,
    // TODO(vNext): unify the error code `ERR_NETWORK` used by the Storage XHR handler
    'ERR_NETWORK',
].includes(error?.name);
const isServerSideError = (statusCode, errorCode) => (!!statusCode && [500, 502, 503, 504].includes(statusCode)) ||
    (!!errorCode && TIMEOUT_ERROR_CODES.includes(errorCode));


//# sourceMappingURL=defaultRetryDecider.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/constants.mjs



















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * The service name used to sign requests if the API requires authentication.
 */
const COGNITO_IDENTITY_SERVICE_NAME = 'cognito-identity';
const DEFAULT_SERVICE_CLIENT_API_CONFIG = {
    service: COGNITO_IDENTITY_SERVICE_NAME,
    retryDecider: getRetryDecider(parseJsonError),
    computeDelay: jitteredBackoff_jitteredBackoff,
    cache: 'no-store',
};


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/retryMiddleware.mjs


/**
 * Middleware that executes the retry logic.
 */
const retryMiddlewareFactory = ({ maxAttempts = DEFAULT_RETRY_ATTEMPTS, retryDecider, computeDelay, abortSignal, }) => {
    if (maxAttempts < 1) {
        throw new Error('maxAttempts must be greater than 0');
    }
    return (next, context) => async function retryMiddleware(request) {
        let error;
        let attemptsCount = context.attemptsCount ?? 0;
        let response;
        // When retry is not needed or max attempts is reached, either error or response will be set. This function handles either cases.
        const handleTerminalErrorOrResponse = () => {
            if (response) {
                addOrIncrementMetadataAttempts(response, attemptsCount);
                return response;
            }
            else {
                addOrIncrementMetadataAttempts(error, attemptsCount);
                throw error;
            }
        };
        while (!abortSignal?.aborted && attemptsCount < maxAttempts) {
            try {
                response = await next(request);
                error = undefined;
            }
            catch (e) {
                error = e;
                response = undefined;
            }
            // context.attemptsCount may be updated after calling next handler which may retry the request by itself.
            attemptsCount =
                (context.attemptsCount ?? 0) > attemptsCount
                    ? (context.attemptsCount ?? 0)
                    : attemptsCount + 1;
            context.attemptsCount = attemptsCount;
            const { isCredentialsExpiredError, retryable } = await retryDecider(response, error, context);
            if (retryable) {
                // Setting isCredentialsInvalid flag to notify signing middleware to forceRefresh credentials provider.
                context.isCredentialsExpired = !!isCredentialsExpiredError;
                if (!abortSignal?.aborted && attemptsCount < maxAttempts) {
                    // prevent sleep for last attempt or cancelled request;
                    const delay = computeDelay(attemptsCount);
                    await cancellableSleep(delay, abortSignal);
                }
                continue;
            }
            else {
                return handleTerminalErrorOrResponse();
            }
        }
        if (abortSignal?.aborted) {
            throw new Error('Request aborted.');
        }
        else {
            return handleTerminalErrorOrResponse();
        }
    };
};
const cancellableSleep = (timeoutMs, abortSignal) => {
    if (abortSignal?.aborted) {
        return Promise.resolve();
    }
    let timeoutId;
    let sleepPromiseResolveFn;
    const sleepPromise = new Promise(resolve => {
        sleepPromiseResolveFn = resolve;
        timeoutId = setTimeout(resolve, timeoutMs);
    });
    abortSignal?.addEventListener('abort', function cancelSleep(_) {
        clearTimeout(timeoutId);
        abortSignal?.removeEventListener('abort', cancelSleep);
        sleepPromiseResolveFn();
    });
    return sleepPromise;
};
const addOrIncrementMetadataAttempts = (nextHandlerOutput, attempts) => {
    if (Object.prototype.toString.call(nextHandlerOutput) !== '[object Object]') {
        return;
    }
    nextHandlerOutput.$metadata = {
        ...(nextHandlerOutput.$metadata ?? {}),
        attempts,
    };
};


//# sourceMappingURL=retryMiddleware.mjs.map

;// ../../node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/native.js
const randomUUID = typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID.bind(crypto);
/* harmony default export */ const esm_browser_native = ({ randomUUID });

;// ../../node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/rng.js
let getRandomValues;
const rnds8 = new Uint8Array(16);
function rng() {
    if (!getRandomValues) {
        if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
            throw new Error('crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported');
        }
        getRandomValues = crypto.getRandomValues.bind(crypto);
    }
    return getRandomValues(rnds8);
}

;// ../../node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/stringify.js
/* unused harmony import specifier */ var validate;

const byteToHex = [];
for (let i = 0; i < 256; ++i) {
    byteToHex.push((i + 0x100).toString(16).slice(1));
}
function unsafeStringify(arr, offset = 0) {
    return (byteToHex[arr[offset + 0]] +
        byteToHex[arr[offset + 1]] +
        byteToHex[arr[offset + 2]] +
        byteToHex[arr[offset + 3]] +
        '-' +
        byteToHex[arr[offset + 4]] +
        byteToHex[arr[offset + 5]] +
        '-' +
        byteToHex[arr[offset + 6]] +
        byteToHex[arr[offset + 7]] +
        '-' +
        byteToHex[arr[offset + 8]] +
        byteToHex[arr[offset + 9]] +
        '-' +
        byteToHex[arr[offset + 10]] +
        byteToHex[arr[offset + 11]] +
        byteToHex[arr[offset + 12]] +
        byteToHex[arr[offset + 13]] +
        byteToHex[arr[offset + 14]] +
        byteToHex[arr[offset + 15]]).toLowerCase();
}
function stringify(arr, offset = 0) {
    const uuid = unsafeStringify(arr, offset);
    if (!validate(uuid)) {
        throw TypeError('Stringified UUID is invalid');
    }
    return uuid;
}
/* harmony default export */ const esm_browser_stringify = ((/* unused pure expression or super */ null && (stringify)));

;// ../../node_modules/@aws-amplify/core/node_modules/uuid/dist/esm-browser/v4.js



function v4(options, buf, offset) {
    if (esm_browser_native.randomUUID && !buf && !options) {
        return esm_browser_native.randomUUID();
    }
    options = options || {};
    const rnds = options.random ?? options.rng?.() ?? rng();
    if (rnds.length < 16) {
        throw new Error('Random bytes length must be >= 16');
    }
    rnds[6] = (rnds[6] & 0x0f) | 0x40;
    rnds[8] = (rnds[8] & 0x3f) | 0x80;
    if (buf) {
        offset = offset || 0;
        if (offset < 0 || offset + 16 > buf.length) {
            throw new RangeError(`UUID byte range ${offset}:${offset + 15} is out of buffer bounds`);
        }
        for (let i = 0; i < 16; ++i) {
            buf[offset + i] = rnds[i];
        }
        return buf;
    }
    return unsafeStringify(rnds);
}
/* harmony default export */ const esm_browser_v4 = (v4);

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/amplifyUuid/index.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const amplifyUuid = esm_browser_v4;


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/amzSdkInvocationIdHeaderMiddleware.mjs

















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Middleware injects a UUID string to `amz-sdk-invocation-id` header.
 * if the header is not set already. This header is helpful to provide
 * observability to group the requests caused by automatic retry.
 *
 * This middleware is standalone because of extra UUID dependency, we will
 * NOT use this middleware for API categories.
 *
 * Ref: https://sdk.amazonaws.com/kotlin/api/smithy-kotlin/api/1.0.9/http-client/aws.smithy.kotlin.runtime.http.operation/-http-operation-context/-sdk-invocation-id.html
 */
const amzSdkInvocationIdHeaderMiddlewareFactory = () => next => {
    return async function amzSdkInvocationIdHeaderMiddleware(request) {
        if (!request.headers[AMZ_SDK_INVOCATION_ID_HEADER]) {
            request.headers[AMZ_SDK_INVOCATION_ID_HEADER] = amplifyUuid();
        }
        return next(request);
    };
};


//# sourceMappingURL=amzSdkInvocationIdHeaderMiddleware.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/retry/amzSdkRequestHeaderMiddleware.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Middleware injects `amz-sdk-request` header to indicate the retry state at the time an HTTP request is made.
 * This middleware should co-exist with retryMiddleware as it relies on the retryAttempts value in middleware context
 * set by the retry middleware.
 *
 * Example header: `amz-sdk-request: attempt=1; max=3`.
 *
 * This middleware is standalone because of extra headers may conflict with custom endpoint settings(e.g. CORS), we will
 * NOT use this middleware for API categories.
 */
const amzSdkRequestHeaderMiddlewareFactory = ({ maxAttempts = DEFAULT_RETRY_ATTEMPTS }) => (next, context) => {
    return async function amzSdkRequestHeaderMiddleware(request) {
        const attemptsCount = context.attemptsCount ?? 0;
        request.headers[AMZ_SDK_REQUEST_HEADER] =
            `attempt=${attemptsCount + 1}; max=${maxAttempts}`;
        return next(request);
    };
};


//# sourceMappingURL=amzSdkRequestHeaderMiddleware.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/middleware/userAgent/middleware.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Middleware injects user agent string to specified header(default to 'x-amz-user-agent'),
 * if the header is not set already.
 *
 * TODO: incorporate new user agent design
 */
const userAgentMiddlewareFactory = ({ userAgentHeader = 'x-amz-user-agent', userAgentValue = '', }) => next => {
    return async function userAgentMiddleware(request) {
        if (userAgentValue.trim().length === 0) {
            const result = await next(request);
            return result;
        }
        else {
            const headerName = userAgentHeader.toLowerCase();
            request.headers[headerName] = request.headers[headerName]
                ? `${request.headers[headerName]} ${userAgentValue}`
                : userAgentValue;
            const response = await next(request);
            return response;
        }
    };
};


//# sourceMappingURL=middleware.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/internal/composeTransferHandler.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Compose a transfer handler with a core transfer handler and a list of middleware.
 * @param coreHandler Core transfer handler
 * @param middleware	List of middleware
 * @returns A transfer handler whose option type is the union of the core
 * 	transfer handler's option type and the middleware's option type.
 * @internal
 */
const composeTransferHandler = (coreHandler, middleware) => (request, options) => {
    const context = {};
    let composedHandler = (composeHandlerRequest) => coreHandler(composeHandlerRequest, options);
    for (let i = middleware.length - 1; i >= 0; i--) {
        const m = middleware[i];
        const resolvedMiddleware = m(options);
        composedHandler = resolvedMiddleware(composedHandler, context);
    }
    return composedHandler(request);
};


//# sourceMappingURL=composeTransferHandler.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/utils/memoization.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Cache the payload of a response body. It allows multiple calls to the body,
 * for example, when reading the body in both retry decider and error deserializer.
 * Caching body is allowed here because we call the body accessor(blob(), json(),
 * etc.) when body is small or streaming implementation is not available(RN).
 *
 * @internal
 */
const withMemoization = (payloadAccessor) => {
    let cached;
    return () => {
        if (!cached) {
            // Explicitly not awaiting. Intermediate await would add overhead and
            // introduce a possible race in the event that this wrapper is called
            // again before the first `payloadAccessor` call resolves.
            cached = payloadAccessor();
        }
        return cached;
    };
};


//# sourceMappingURL=memoization.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/handlers/fetch.mjs





// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const shouldSendBody = (method) => !['HEAD', 'GET'].includes(method.toUpperCase());
// TODO[AllanZhengYP]: we need to provide isCanceledError utility
const fetchTransferHandler = async ({ url, method, headers, body }, { abortSignal, cache, withCrossDomainCredentials }) => {
    let resp;
    try {
        resp = await fetch(url, {
            method,
            headers,
            body: shouldSendBody(method) ? body : undefined,
            signal: abortSignal,
            cache,
            credentials: withCrossDomainCredentials ? 'include' : 'same-origin',
        });
    }
    catch (e) {
        if (e instanceof TypeError) {
            throw new AmplifyError({
                name: AmplifyErrorCode.NetworkError,
                message: 'A network error has occurred.',
                underlyingError: e,
            });
        }
        throw e;
    }
    const responseHeaders = {};
    resp.headers?.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
    });
    const httpResponse = {
        statusCode: resp.status,
        headers: responseHeaders,
        body: null,
    };
    // resp.body is a ReadableStream according to Fetch API spec, but React Native
    // does not implement it.
    const bodyWithMixin = Object.assign(resp.body ?? {}, {
        text: withMemoization(() => resp.text()),
        blob: withMemoization(() => resp.blob()),
        json: withMemoization(() => resp.json()),
    });
    return {
        ...httpResponse,
        body: bodyWithMixin,
    };
};


//# sourceMappingURL=fetch.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/handlers/aws/unauthenticated.mjs











// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const unauthenticatedHandler = composeTransferHandler(fetchTransferHandler, [
    userAgentMiddlewareFactory,
    amzSdkInvocationIdHeaderMiddlewareFactory,
    retryMiddlewareFactory,
    amzSdkRequestHeaderMiddlewareFactory,
]);


//# sourceMappingURL=unauthenticated.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/middleware/createDisableCacheMiddleware.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
const createDisableCacheMiddleware = () => next => async function disableCacheMiddleware(request) {
    request.headers['cache-control'] = 'no-store';
    return next(request);
};


//# sourceMappingURL=createDisableCacheMiddleware.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/handler/cognitoIdentityTransferHandler.mjs



















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
const cognitoIdentityTransferHandler = composeTransferHandler(unauthenticatedHandler, [createDisableCacheMiddleware]);


//# sourceMappingURL=cognitoIdentityTransferHandler.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/serde/createClientSerializer.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createClientSerializer = (operation) => (input, endpoint) => {
    const headers = getSharedHeaders(operation);
    const body = JSON.stringify(input);
    return buildHttpRpcRequest(endpoint, headers, body);
};
const getSharedHeaders = (operation) => ({
    'content-type': 'application/x-amz-json-1.1',
    'x-amz-target': `AWSCognitoIdentityService.${operation}`,
});
const buildHttpRpcRequest = ({ url }, headers, body) => ({
    headers,
    url,
    body,
    method: 'POST',
});


//# sourceMappingURL=createClientSerializer.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/createGetCredentialsForIdentityClient.mjs






















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createGetCredentialsForIdentityClient = (config) => composeServiceApi(cognitoIdentityTransferHandler, createClientSerializer('GetCredentialsForIdentity'), getCredentialsForIdentityDeserializer, {
    ...DEFAULT_SERVICE_CLIENT_API_CONFIG,
    ...config,
    userAgentValue: getAmplifyUserAgent(),
});
const getCredentialsForIdentityDeserializer = async (response) => {
    if (response.statusCode >= 300) {
        const error = await parseJsonError(response);
        throw error;
    }
    const body = await parseJsonBody(response);
    return {
        IdentityId: body.IdentityId,
        Credentials: deserializeCredentials(body.Credentials),
        $metadata: parseMetadata(response),
    };
};
const deserializeCredentials = ({ Expiration, ...rest } = {}) => ({
    ...rest,
    Expiration: Expiration && new Date(Expiration * 1000),
});


//# sourceMappingURL=createGetCredentialsForIdentityClient.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/globalHelpers/index.mjs
/* unused harmony import specifier */ var globalHelpers_AmplifyError;




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const getCrypto = () => {
    if (typeof window === 'object' && typeof window.crypto === 'object') {
        return window.crypto;
    }
    // Next.js global polyfill
    if (typeof crypto === 'object') {
        return crypto;
    }
    throw new globalHelpers_AmplifyError({
        name: 'MissingPolyfill',
        message: 'Cannot resolve the `crypto` function from the environment.',
    });
};
const getBtoa = () => {
    // browser
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
        return window.btoa;
    }
    // Next.js global polyfill
    if (typeof btoa === 'function') {
        return btoa;
    }
    throw new globalHelpers_AmplifyError({
        name: 'Base64EncoderError',
        message: 'Cannot resolve the `btoa` function from the environment.',
    });
};
const getAtob = () => {
    // browser
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
        return window.atob;
    }
    // Next.js global polyfill
    if (typeof atob === 'function') {
        return atob;
    }
    throw new AmplifyError({
        name: 'Base64EncoderError',
        message: 'Cannot resolve the `atob` function from the environment.',
    });
};


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/convert/base64/base64Decoder.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const base64Decoder = {
    convert(input, options) {
        let inputStr = input;
        // urlSafe character replacement options conform to the base64 url spec
        // https://datatracker.ietf.org/doc/html/rfc4648#page-7
        if (options?.urlSafe) {
            inputStr = inputStr.replace(/-/g, '+').replace(/_/g, '/');
        }
        return getAtob()(inputStr);
    },
};


//# sourceMappingURL=base64Decoder.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/errors/createAssertionFunction.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createAssertionFunction = (errorMap, AssertionError = AmplifyError) => (assertion, name, additionalContext) => {
    const { message, recoverySuggestion } = errorMap[name];
    if (!assertion) {
        throw new AssertionError({
            name,
            message: additionalContext
                ? `${message} ${additionalContext}`
                : message,
            recoverySuggestion,
        });
    }
};


//# sourceMappingURL=createAssertionFunction.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/Auth/utils/errorHelpers.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var AuthConfigurationErrorCode;
(function (AuthConfigurationErrorCode) {
    AuthConfigurationErrorCode["AuthTokenConfigException"] = "AuthTokenConfigException";
    AuthConfigurationErrorCode["AuthUserPoolAndIdentityPoolException"] = "AuthUserPoolAndIdentityPoolException";
    AuthConfigurationErrorCode["AuthUserPoolException"] = "AuthUserPoolException";
    AuthConfigurationErrorCode["InvalidIdentityPoolIdException"] = "InvalidIdentityPoolIdException";
    AuthConfigurationErrorCode["OAuthNotConfigureException"] = "OAuthNotConfigureException";
})(AuthConfigurationErrorCode || (AuthConfigurationErrorCode = {}));
const authConfigurationErrorMap = {
    [AuthConfigurationErrorCode.AuthTokenConfigException]: {
        message: 'Auth Token Provider not configured.',
        recoverySuggestion: 'Make sure to call Amplify.configure in your app.',
    },
    [AuthConfigurationErrorCode.AuthUserPoolAndIdentityPoolException]: {
        message: 'Auth UserPool or IdentityPool not configured.',
        recoverySuggestion: 'Make sure to call Amplify.configure in your app with UserPoolId and IdentityPoolId.',
    },
    [AuthConfigurationErrorCode.AuthUserPoolException]: {
        message: 'Auth UserPool not configured.',
        recoverySuggestion: 'Make sure to call Amplify.configure in your app with userPoolId and userPoolClientId.',
    },
    [AuthConfigurationErrorCode.InvalidIdentityPoolIdException]: {
        message: 'Invalid identity pool id provided.',
        recoverySuggestion: 'Make sure a valid identityPoolId is given in the config.',
    },
    [AuthConfigurationErrorCode.OAuthNotConfigureException]: {
        message: 'oauth param not configured.',
        recoverySuggestion: 'Make sure to call Amplify.configure with oauth parameter in your app.',
    },
};
const assert = createAssertionFunction(authConfigurationErrorMap);


//# sourceMappingURL=errorHelpers.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/Auth/utils/index.mjs
/* unused harmony import specifier */ var utils_assert;
/* unused harmony import specifier */ var utils_AuthConfigurationErrorCode;





// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function assertTokenProviderConfig(cognitoConfig) {
    let assertionValid = true; // assume valid until otherwise proveed
    if (!cognitoConfig) {
        assertionValid = false;
    }
    else {
        assertionValid =
            !!cognitoConfig.userPoolId && !!cognitoConfig.userPoolClientId;
    }
    assert(assertionValid, AuthConfigurationErrorCode.AuthUserPoolException);
}
function assertOAuthConfig(cognitoConfig) {
    const validOAuthConfig = !!cognitoConfig?.loginWith?.oauth?.domain &&
        !!cognitoConfig?.loginWith?.oauth?.redirectSignOut &&
        !!cognitoConfig?.loginWith?.oauth?.redirectSignIn &&
        !!cognitoConfig?.loginWith?.oauth?.responseType;
    utils_assert(validOAuthConfig, utils_AuthConfigurationErrorCode.OAuthNotConfigureException);
}
function assertIdentityPoolIdConfig(cognitoConfig) {
    const validConfig = !!cognitoConfig?.identityPoolId;
    assert(validConfig, AuthConfigurationErrorCode.InvalidIdentityPoolIdException);
}
/**
 * Decodes payload of JWT token
 *
 * @param {String} token A string representing a token to be decoded
 * @throws {@link Error} - Throws error when token is invalid or payload malformed.
 */
function decodeJWT(token) {
    const tokenParts = token.split('.');
    if (tokenParts.length !== 3) {
        throw new Error('Invalid token');
    }
    try {
        const base64WithUrlSafe = tokenParts[1];
        const base64 = base64WithUrlSafe.replace(/-/g, '+').replace(/_/g, '/');
        const jsonStr = decodeURIComponent(base64Decoder
            .convert(base64)
            .split('')
            .map(char => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
            .join(''));
        const payload = JSON.parse(jsonStr);
        return {
            toString: () => token,
            payload,
        };
    }
    catch (err) {
        throw new Error('Invalid token payload');
    }
}


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/errors/AuthError.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
class AuthError extends AmplifyError {
    constructor(params) {
        super(params);
        // Hack for making the custom error class work when transpiled to es5
        // TODO: Delete the following 2 lines after we change the build target to >= es2015
        this.constructor = AuthError;
        Object.setPrototypeOf(this, AuthError.prototype);
    }
}


//# sourceMappingURL=AuthError.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/errors/utils/assertServiceError.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function assertServiceError(error) {
    if (!error ||
        error.name === 'Error' ||
        error instanceof TypeError) {
        throw new AuthError({
            name: AmplifyErrorCode.Unknown,
            message: 'An unknown error has occurred.',
            underlyingError: error,
        });
    }
}


//# sourceMappingURL=assertServiceError.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/parsers/regionParsers.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function getRegionFromUserPoolId(userPoolId) {
    const region = userPoolId?.split('_')[0];
    if (!userPoolId ||
        userPoolId.indexOf('_') < 0 ||
        !region ||
        typeof region !== 'string')
        throw new AuthError({
            name: 'InvalidUserPoolId',
            message: 'Invalid user pool id provided.',
        });
    return region;
}
function getRegionFromIdentityPoolId(identityPoolId) {
    if (!identityPoolId || !identityPoolId.includes(':')) {
        throw new AuthError({
            name: 'InvalidIdentityPoolIdException',
            message: 'Invalid identity pool id provided.',
            recoverySuggestion: 'Make sure a valid identityPoolId is given in the config.',
        });
    }
    return identityPoolId.split(':')[0];
}


//# sourceMappingURL=regionParsers.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/errors/constants.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const USER_UNAUTHENTICATED_EXCEPTION = 'UserUnAuthenticatedException';
const USER_ALREADY_AUTHENTICATED_EXCEPTION = 'UserAlreadyAuthenticatedException';
const DEVICE_METADATA_NOT_FOUND_EXCEPTION = 'DeviceMetadataNotFoundException';
const AUTO_SIGN_IN_EXCEPTION = 'AutoSignInException';
const INVALID_REDIRECT_EXCEPTION = 'InvalidRedirectException';
const INVALID_APP_SCHEME_EXCEPTION = 'InvalidAppSchemeException';
const INVALID_PREFERRED_REDIRECT_EXCEPTION = 'InvalidPreferredRedirectUrlException';
const invalidRedirectException = new AuthError({
    name: INVALID_REDIRECT_EXCEPTION,
    message: 'signInRedirect or signOutRedirect had an invalid format or was not found.',
    recoverySuggestion: 'Please make sure the signIn/Out redirect in your oauth config is valid.',
});
const invalidAppSchemeException = new AuthError({
    name: INVALID_APP_SCHEME_EXCEPTION,
    message: 'A valid non-http app scheme was not found in the config.',
    recoverySuggestion: 'Please make sure a valid custom app scheme is present in the config.',
});
const invalidPreferredRedirectUrlException = new AuthError({
    name: INVALID_PREFERRED_REDIRECT_EXCEPTION,
    message: 'The given preferredRedirectUrl does not match any items in the redirectSignOutUrls array from the config.',
    recoverySuggestion: 'Please make sure a matching preferredRedirectUrl is provided.',
});
const INVALID_ORIGIN_EXCEPTION = 'InvalidOriginException';
const invalidOriginException = new AuthError({
    name: INVALID_ORIGIN_EXCEPTION,
    message: 'redirect is coming from a different origin. The oauth flow needs to be initiated from the same origin',
    recoverySuggestion: 'Please call signInWithRedirect from the same origin.',
});
const OAUTH_SIGNOUT_EXCEPTION = 'OAuthSignOutException';
const TOKEN_REFRESH_EXCEPTION = 'TokenRefreshException';
const UNEXPECTED_SIGN_IN_INTERRUPTION_EXCEPTION = 'UnexpectedSignInInterruptionException';


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/utils/types.mjs
/* unused harmony import specifier */ var types_AuthError;
/* unused harmony import specifier */ var types_DEVICE_METADATA_NOT_FOUND_EXCEPTION;



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function isTypeUserPoolConfig(authConfig) {
    if (authConfig &&
        authConfig.Cognito.userPoolId &&
        authConfig.Cognito.userPoolClientId) {
        return true;
    }
    return false;
}
function assertAuthTokens(tokens) {
    if (!tokens || !tokens.accessToken) {
        throw new AuthError({
            name: USER_UNAUTHENTICATED_EXCEPTION,
            message: 'User needs to be authenticated to call this API.',
            recoverySuggestion: 'Sign in before calling this API again.',
        });
    }
}
function assertIdTokenInAuthTokens(tokens) {
    if (!tokens || !tokens.idToken) {
        throw new AuthError({
            name: USER_UNAUTHENTICATED_EXCEPTION,
            message: 'User needs to be authenticated to call this API.',
            recoverySuggestion: 'Sign in before calling this API again.',
        });
    }
}
const oAuthTokenRefreshException = new AuthError({
    name: TOKEN_REFRESH_EXCEPTION,
    message: `Token refresh is not supported when authenticated with the 'implicit grant' (token) oauth flow. 
	Please change your oauth configuration to use 'code grant' flow.`,
    recoverySuggestion: `Please logout and change your Amplify configuration to use "code grant" flow. 
	E.g { responseType: 'code' }`,
});
const tokenRefreshException = new AuthError({
    name: USER_UNAUTHENTICATED_EXCEPTION,
    message: 'User needs to be authenticated to call this API.',
    recoverySuggestion: 'Sign in before calling this API again.',
});
function assertAuthTokensWithRefreshToken(tokens) {
    if (isAuthenticatedWithImplicitOauthFlow(tokens)) {
        throw oAuthTokenRefreshException;
    }
    if (!isAuthenticatedWithRefreshToken(tokens)) {
        throw tokenRefreshException;
    }
}
function assertDeviceMetadata(deviceMetadata) {
    if (!deviceMetadata ||
        !deviceMetadata.deviceKey ||
        !deviceMetadata.deviceGroupKey ||
        !deviceMetadata.randomPassword) {
        throw new types_AuthError({
            name: types_DEVICE_METADATA_NOT_FOUND_EXCEPTION,
            message: 'Either deviceKey, deviceGroupKey or secretPassword were not found during the sign-in process.',
            recoverySuggestion: 'Make sure to not clear storage after calling the signIn API.',
        });
    }
}
const OAuthStorageKeys = {
    inflightOAuth: 'inflightOAuth',
    oauthSignIn: 'oauthSignIn',
    oauthPKCE: 'oauthPKCE',
    oauthState: 'oauthState',
};
function isAuthenticated(tokens) {
    return tokens?.accessToken || tokens?.idToken;
}
function isAuthenticatedWithRefreshToken(tokens) {
    return isAuthenticated(tokens) && tokens?.refreshToken;
}
function isAuthenticatedWithImplicitOauthFlow(tokens) {
    return isAuthenticated(tokens) && !tokens?.refreshToken;
}


//# sourceMappingURL=types.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/endpoints/partitions.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Default partition for AWS services. This is used when the region is not provided or the region is not recognized.
 *
 * @internal
 */
const defaultPartition = {
    id: 'aws',
    outputs: {
        dnsSuffix: 'amazonaws.com',
    },
    regionRegex: '^(us|eu|ap|sa|ca|me|af)\\-\\w+\\-\\d+$',
    regions: ['aws-global'],
};
/**
 * This data is adapted from the partition file from AWS SDK shared utilities but remove some contents for bundle size
 * concern. Information removed are `dualStackDnsSuffix`, `supportDualStack`, `supportFIPS`, restricted partitions, and
 * list of regions for each partition other than global regions.
 *
 * * Ref: https://docs.aws.amazon.com/general/latest/gr/rande.html#regional-endpoints
 * * Ref: https://github.com/aws/aws-sdk-js-v3/blob/0201baef03c2379f1f6f7150b9d401d4b230d488/packages/util-endpoints/src/lib/aws/partitions.json#L1
 *
 * @internal
 */
const partitionsInfo = {
    partitions: [
        defaultPartition,
        {
            id: 'aws-cn',
            outputs: {
                dnsSuffix: 'amazonaws.com.cn',
            },
            regionRegex: '^cn\\-\\w+\\-\\d+$',
            regions: ['aws-cn-global'],
        },
    ],
};


//# sourceMappingURL=partitions.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/clients/endpoints/getDnsSuffix.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Get the AWS Services endpoint URL's DNS suffix for a given region. A typical AWS regional service endpoint URL will
 * follow this pattern: {endpointPrefix}.{region}.{dnsSuffix}. For example, the endpoint URL for Cognito Identity in
 * us-east-1 will be cognito-identity.us-east-1.amazonaws.com. Here the DnsSuffix is `amazonaws.com`.
 *
 * @param region
 * @returns The DNS suffix
 *
 * @internal
 */
const getDnsSuffix = (region) => {
    const { partitions } = partitionsInfo;
    for (const { regions, outputs, regionRegex } of partitions) {
        const regex = new RegExp(regionRegex);
        if (regions.includes(region) || regex.test(region)) {
            return outputs.dnsSuffix;
        }
    }
    return defaultPartition.outputs.dnsSuffix;
};


//# sourceMappingURL=getDnsSuffix.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/amplifyUrl/index.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const AmplifyUrl = URL;
const AmplifyUrlSearchParams = (/* unused pure expression or super */ null && (URLSearchParams));


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/cognitoIdentityPoolEndpointResolver.mjs



















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const cognitoIdentityPoolEndpointResolver = ({ region, }) => ({
    url: new AmplifyUrl(`https://${COGNITO_IDENTITY_SERVICE_NAME}.${region}.${getDnsSuffix(region)}`),
});


//# sourceMappingURL=cognitoIdentityPoolEndpointResolver.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/factories/createCognitoIdentityPoolEndpointResolver.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createCognitoIdentityPoolEndpointResolver = ({ endpointOverride }) => (input) => {
    if (endpointOverride) {
        return { url: new AmplifyUrl(endpointOverride) };
    }
    return cognitoIdentityPoolEndpointResolver(input);
};


//# sourceMappingURL=createCognitoIdentityPoolEndpointResolver.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/foundation/factories/serviceClients/cognitoIdentity/createGetIdClient.mjs






















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createGetIdClient = (config) => composeServiceApi(cognitoIdentityTransferHandler, createClientSerializer('GetId'), getIdDeserializer, {
    ...DEFAULT_SERVICE_CLIENT_API_CONFIG,
    ...config,
    userAgentValue: getAmplifyUserAgent(),
});
const getIdDeserializer = async (response) => {
    if (response.statusCode >= 300) {
        const error = await parseJsonError(response);
        throw error;
    }
    const body = await parseJsonBody(response);
    return {
        IdentityId: body.IdentityId,
        $metadata: parseMetadata(response),
    };
};


//# sourceMappingURL=createGetIdClient.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/credentialsProvider/utils.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function formLoginsMap(idToken) {
    const issuer = decodeJWT(idToken).payload.iss;
    const res = {};
    if (!issuer) {
        throw new AuthError({
            name: 'InvalidIdTokenException',
            message: 'Invalid Idtoken.',
        });
    }
    const domainName = issuer.replace(/(^\w+:|^)\/\//, '');
    res[domainName] = idToken;
    return res;
}


//# sourceMappingURL=utils.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/credentialsProvider/IdentityIdProvider.mjs









// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Provides a Cognito identityId
 *
 * @param tokens - The AuthTokens received after SignIn
 * @returns string
 * @throws configuration exceptions: `InvalidIdentityPoolIdException`
 *  - Auth errors that may arise from misconfiguration.
 * @throws service exceptions: {@link GetIdException }
 */
async function cognitoIdentityIdProvider({ tokens, authConfig, identityIdStore, }) {
    identityIdStore.setAuthConfig({ Cognito: authConfig });
    // will return null only if there is no identityId cached or if there is an error retrieving it
    const identityId = await identityIdStore.loadIdentityId();
    if (identityId) {
        return identityId.id;
    }
    const logins = tokens?.idToken
        ? formLoginsMap(tokens.idToken.toString())
        : {};
    const generatedIdentityId = await generateIdentityId(logins, authConfig);
    // Store generated identityId
    identityIdStore.storeIdentityId({
        id: generatedIdentityId,
        type: tokens ? 'primary' : 'guest',
    });
    return generatedIdentityId;
}
async function generateIdentityId(logins, authConfig) {
    const identityPoolId = authConfig?.identityPoolId;
    const region = getRegionFromIdentityPoolId(identityPoolId);
    const getId = createGetIdClient({
        endpointResolver: createCognitoIdentityPoolEndpointResolver({
            endpointOverride: authConfig.identityPoolEndpoint,
        }),
    });
    // IdentityId is absent so get it using IdentityPoolId with Cognito's GetId API
    let idResult;
    // for a first-time user, this will return a brand new identity
    // for a returning user, this will retrieve the previous identity assocaited with the logins
    try {
        idResult = (await getId({
            region,
        }, {
            IdentityPoolId: identityPoolId,
            Logins: logins,
        })).IdentityId;
    }
    catch (e) {
        assertServiceError(e);
        throw new AuthError(e);
    }
    if (!idResult) {
        throw new AuthError({
            name: 'GetIdResponseException',
            message: 'Received undefined response from getId operation',
            recoverySuggestion: 'Make sure to pass a valid identityPoolId in the configuration.',
        });
    }
    return idResult;
}


//# sourceMappingURL=IdentityIdProvider.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/credentialsProvider/credentialsProvider.mjs











// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const credentialsProvider_logger = new ConsoleLogger('CognitoCredentialsProvider');
const CREDENTIALS_TTL = 50 * 60 * 1000; // 50 min, can be modified on config if required in the future
class CognitoAWSCredentialsAndIdentityIdProvider {
    constructor(identityIdStore) {
        this._nextCredentialsRefresh = 0;
        this._identityIdStore = identityIdStore;
    }
    async clearCredentialsAndIdentityId() {
        credentialsProvider_logger.debug('Clearing out credentials and identityId');
        this._credentialsAndIdentityId = undefined;
        await this._identityIdStore.clearIdentityId();
    }
    async clearCredentials() {
        credentialsProvider_logger.debug('Clearing out in-memory credentials');
        this._credentialsAndIdentityId = undefined;
    }
    async getCredentialsAndIdentityId(getCredentialsOptions) {
        const isAuthenticated = getCredentialsOptions.authenticated;
        const { tokens } = getCredentialsOptions;
        const { authConfig } = getCredentialsOptions;
        try {
            assertIdentityPoolIdConfig(authConfig?.Cognito);
        }
        catch {
            // No identity pool configured, skipping
            return;
        }
        if (!isAuthenticated && !authConfig.Cognito.allowGuestAccess) {
            // TODO(V6): return partial result like Native platforms
            return;
        }
        const { forceRefresh } = getCredentialsOptions;
        const tokenHasChanged = this.hasTokenChanged(tokens);
        const identityId = await cognitoIdentityIdProvider({
            tokens,
            authConfig: authConfig.Cognito,
            identityIdStore: this._identityIdStore,
        });
        // Clear cached credentials when forceRefresh is true OR the cache token has changed
        if (forceRefresh || tokenHasChanged) {
            this.clearCredentials();
        }
        if (!isAuthenticated) {
            return this.getGuestCredentials(identityId, authConfig.Cognito);
        }
        else {
            assertIdTokenInAuthTokens(tokens);
            return this.credsForOIDCTokens(authConfig.Cognito, tokens, identityId);
        }
    }
    async getGuestCredentials(identityId, authConfig) {
        // Return existing in-memory cached credentials only if it exists, is not past it's lifetime and is unauthenticated credentials
        if (this._credentialsAndIdentityId &&
            !this.isPastTTL() &&
            this._credentialsAndIdentityId.isAuthenticatedCreds === false) {
            credentialsProvider_logger.info('returning stored credentials as they neither past TTL nor expired.');
            return this._credentialsAndIdentityId;
        }
        // Clear to discard if any authenticated credentials are set and start with a clean slate
        this.clearCredentials();
        const region = getRegionFromIdentityPoolId(authConfig.identityPoolId);
        const getCredentialsForIdentity = createGetCredentialsForIdentityClient({
            endpointResolver: createCognitoIdentityPoolEndpointResolver({
                endpointOverride: authConfig.identityPoolEndpoint,
            }),
        });
        // use identityId to obtain guest credentials
        // save credentials in-memory
        // No logins params should be passed for guest creds:
        // https://docs.aws.amazon.com/cognitoidentity/latest/APIReference/API_GetCredentialsForIdentity.html
        let clientResult;
        try {
            clientResult = await getCredentialsForIdentity({ region }, {
                IdentityId: identityId,
            });
        }
        catch (e) {
            assertServiceError(e);
            throw new AuthError(e);
        }
        if (clientResult?.Credentials?.AccessKeyId &&
            clientResult?.Credentials?.SecretKey) {
            this._nextCredentialsRefresh = new Date().getTime() + CREDENTIALS_TTL;
            const res = {
                credentials: {
                    accessKeyId: clientResult.Credentials.AccessKeyId,
                    secretAccessKey: clientResult.Credentials.SecretKey,
                    sessionToken: clientResult.Credentials.SessionToken,
                    expiration: clientResult.Credentials.Expiration,
                },
                identityId,
            };
            if (clientResult.IdentityId) {
                res.identityId = clientResult.IdentityId;
                this._identityIdStore.storeIdentityId({
                    id: clientResult.IdentityId,
                    type: 'guest',
                });
            }
            this._credentialsAndIdentityId = {
                ...res,
                isAuthenticatedCreds: false,
            };
            return res;
        }
        else {
            throw new AuthError({
                name: 'CredentialsNotFoundException',
                message: `Cognito did not respond with either Credentials, AccessKeyId or SecretKey.`,
            });
        }
    }
    async credsForOIDCTokens(authConfig, authTokens, identityId) {
        if (this._credentialsAndIdentityId &&
            !this.isPastTTL() &&
            this._credentialsAndIdentityId.isAuthenticatedCreds === true) {
            credentialsProvider_logger.debug('returning stored credentials as they neither past TTL nor expired.');
            return this._credentialsAndIdentityId;
        }
        // Clear to discard if any unauthenticated credentials are set and start with a clean slate
        this.clearCredentials();
        const logins = authTokens.idToken
            ? formLoginsMap(authTokens.idToken.toString())
            : {};
        const region = getRegionFromIdentityPoolId(authConfig.identityPoolId);
        const getCredentialsForIdentity = createGetCredentialsForIdentityClient({
            endpointResolver: createCognitoIdentityPoolEndpointResolver({
                endpointOverride: authConfig.identityPoolEndpoint,
            }),
        });
        let clientResult;
        try {
            clientResult = await getCredentialsForIdentity({ region }, {
                IdentityId: identityId,
                Logins: logins,
            });
        }
        catch (e) {
            assertServiceError(e);
            throw new AuthError(e);
        }
        if (clientResult?.Credentials?.AccessKeyId &&
            clientResult?.Credentials?.SecretKey) {
            this._nextCredentialsRefresh = new Date().getTime() + CREDENTIALS_TTL;
            const res = {
                credentials: {
                    accessKeyId: clientResult.Credentials.AccessKeyId,
                    secretAccessKey: clientResult.Credentials.SecretKey,
                    sessionToken: clientResult.Credentials.SessionToken,
                    expiration: clientResult.Credentials.Expiration,
                },
                identityId,
            };
            if (clientResult.IdentityId) {
                res.identityId = clientResult.IdentityId;
                // note: the following call removes guest identityId from the persistent store (localStorage)
                this._identityIdStore.storeIdentityId({
                    id: clientResult.IdentityId,
                    type: 'primary',
                });
            }
            // Store the credentials in-memory along with the expiration
            this._credentialsAndIdentityId = {
                ...res,
                isAuthenticatedCreds: true,
                associatedIdToken: authTokens.idToken?.toString(),
            };
            return res;
        }
        else {
            throw new AuthError({
                name: 'CredentialsException',
                message: `Cognito did not respond with either Credentials, AccessKeyId or SecretKey.`,
            });
        }
    }
    isPastTTL() {
        return this._nextCredentialsRefresh === undefined
            ? true
            : this._nextCredentialsRefresh <= Date.now();
    }
    hasTokenChanged(tokens) {
        return (!!tokens &&
            !!this._credentialsAndIdentityId?.associatedIdToken &&
            tokens.idToken?.toString() !==
                this._credentialsAndIdentityId.associatedIdToken);
    }
}


//# sourceMappingURL=credentialsProvider.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/types.mjs
const AuthTokenStorageKeys = {
    accessToken: 'accessToken',
    idToken: 'idToken',
    oidcProvider: 'oidcProvider',
    clockDrift: 'clockDrift',
    refreshToken: 'refreshToken',
    deviceKey: 'deviceKey',
    randomPasswordKey: 'randomPasswordKey',
    deviceGroupKey: 'deviceGroupKey',
    signInDetails: 'signInDetails',
    oauthMetadata: 'oauthMetadata',
};


//# sourceMappingURL=types.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/errorHelpers.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
var TokenProviderErrorCode;
(function (TokenProviderErrorCode) {
    TokenProviderErrorCode["InvalidAuthTokens"] = "InvalidAuthTokens";
})(TokenProviderErrorCode || (TokenProviderErrorCode = {}));
const tokenValidationErrorMap = {
    [TokenProviderErrorCode.InvalidAuthTokens]: {
        message: 'Invalid tokens.',
        recoverySuggestion: 'Make sure the tokens are valid.',
    },
};
const errorHelpers_assert = createAssertionFunction(tokenValidationErrorMap);


//# sourceMappingURL=errorHelpers.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/constants.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const AUTH_KEY_PREFIX = 'CognitoIdentityServiceProvider';


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/TokenStore.mjs






class DefaultTokenStore {
    getKeyValueStorage() {
        if (!this.keyValueStorage) {
            throw new AuthError({
                name: 'KeyValueStorageNotFoundException',
                message: 'KeyValueStorage was not found in TokenStore',
            });
        }
        return this.keyValueStorage;
    }
    setKeyValueStorage(keyValueStorage) {
        this.keyValueStorage = keyValueStorage;
    }
    setAuthConfig(authConfig) {
        this.authConfig = authConfig;
    }
    async loadTokens() {
        // TODO(v6): migration logic should be here
        // Reading V5 tokens old format
        try {
            const authKeys = await this.getAuthKeys();
            const accessTokenString = await this.getKeyValueStorage().getItem(authKeys.accessToken);
            if (!accessTokenString) {
                throw new AuthError({
                    name: 'NoSessionFoundException',
                    message: 'Auth session was not found. Make sure to call signIn.',
                });
            }
            const accessToken = decodeJWT(accessTokenString);
            const itString = await this.getKeyValueStorage().getItem(authKeys.idToken);
            const idToken = itString ? decodeJWT(itString) : undefined;
            const refreshToken = (await this.getKeyValueStorage().getItem(authKeys.refreshToken)) ??
                undefined;
            const clockDriftString = (await this.getKeyValueStorage().getItem(authKeys.clockDrift)) ?? '0';
            const clockDrift = Number.parseInt(clockDriftString);
            const signInDetails = await this.getKeyValueStorage().getItem(authKeys.signInDetails);
            const tokens = {
                accessToken,
                idToken,
                refreshToken,
                deviceMetadata: (await this.getDeviceMetadata()) ?? undefined,
                clockDrift,
                username: await this.getLastAuthUser(),
            };
            if (signInDetails) {
                tokens.signInDetails = JSON.parse(signInDetails);
            }
            return tokens;
        }
        catch (err) {
            return null;
        }
    }
    async storeTokens(tokens) {
        errorHelpers_assert(tokens !== undefined, TokenProviderErrorCode.InvalidAuthTokens);
        const lastAuthUser = tokens.username;
        await this.getKeyValueStorage().setItem(this.getLastAuthUserKey(), lastAuthUser);
        const authKeys = await this.getAuthKeys();
        await this.getKeyValueStorage().setItem(authKeys.accessToken, tokens.accessToken.toString());
        if (tokens.idToken) {
            await this.getKeyValueStorage().setItem(authKeys.idToken, tokens.idToken.toString());
        }
        else {
            await this.getKeyValueStorage().removeItem(authKeys.idToken);
        }
        if (tokens.refreshToken) {
            await this.getKeyValueStorage().setItem(authKeys.refreshToken, tokens.refreshToken);
        }
        else {
            await this.getKeyValueStorage().removeItem(authKeys.refreshToken);
        }
        if (tokens.deviceMetadata) {
            if (tokens.deviceMetadata.deviceKey) {
                await this.getKeyValueStorage().setItem(authKeys.deviceKey, tokens.deviceMetadata.deviceKey);
            }
            if (tokens.deviceMetadata.deviceGroupKey) {
                await this.getKeyValueStorage().setItem(authKeys.deviceGroupKey, tokens.deviceMetadata.deviceGroupKey);
            }
            await this.getKeyValueStorage().setItem(authKeys.randomPasswordKey, tokens.deviceMetadata.randomPassword);
        }
        if (tokens.signInDetails) {
            await this.getKeyValueStorage().setItem(authKeys.signInDetails, JSON.stringify(tokens.signInDetails));
        }
        else {
            await this.getKeyValueStorage().removeItem(authKeys.signInDetails);
        }
        await this.getKeyValueStorage().setItem(authKeys.clockDrift, `${tokens.clockDrift}`);
    }
    async clearTokens() {
        const authKeys = await this.getAuthKeys();
        // Not calling clear because it can remove data that is not managed by AuthTokenStore
        await Promise.all([
            this.getKeyValueStorage().removeItem(authKeys.accessToken),
            this.getKeyValueStorage().removeItem(authKeys.idToken),
            this.getKeyValueStorage().removeItem(authKeys.clockDrift),
            this.getKeyValueStorage().removeItem(authKeys.refreshToken),
            this.getKeyValueStorage().removeItem(authKeys.signInDetails),
            this.getKeyValueStorage().removeItem(this.getLastAuthUserKey()),
            this.getKeyValueStorage().removeItem(authKeys.oauthMetadata),
        ]);
    }
    async getDeviceMetadata(username) {
        const authKeys = await this.getAuthKeys(username);
        const deviceKey = await this.getKeyValueStorage().getItem(authKeys.deviceKey);
        const deviceGroupKey = await this.getKeyValueStorage().getItem(authKeys.deviceGroupKey);
        const randomPassword = await this.getKeyValueStorage().getItem(authKeys.randomPasswordKey);
        return randomPassword && deviceGroupKey && deviceKey
            ? {
                deviceKey,
                deviceGroupKey,
                randomPassword,
            }
            : null;
    }
    async clearDeviceMetadata(username) {
        const authKeys = await this.getAuthKeys(username);
        await Promise.all([
            this.getKeyValueStorage().removeItem(authKeys.deviceKey),
            this.getKeyValueStorage().removeItem(authKeys.deviceGroupKey),
            this.getKeyValueStorage().removeItem(authKeys.randomPasswordKey),
        ]);
    }
    async getAuthKeys(username) {
        assertTokenProviderConfig(this.authConfig?.Cognito);
        const lastAuthUser = username ?? (await this.getLastAuthUser());
        return createKeysForAuthStorage(AUTH_KEY_PREFIX, `${this.authConfig.Cognito.userPoolClientId}.${lastAuthUser}`);
    }
    getLastAuthUserKey() {
        assertTokenProviderConfig(this.authConfig?.Cognito);
        const identifier = this.authConfig.Cognito.userPoolClientId;
        return `${AUTH_KEY_PREFIX}.${identifier}.LastAuthUser`;
    }
    async getLastAuthUser() {
        const lastAuthUser = (await this.getKeyValueStorage().getItem(this.getLastAuthUserKey())) ??
            'username';
        return lastAuthUser;
    }
    async setOAuthMetadata(metadata) {
        const { oauthMetadata: oauthMetadataKey } = await this.getAuthKeys();
        await this.getKeyValueStorage().setItem(oauthMetadataKey, JSON.stringify(metadata));
    }
    async getOAuthMetadata() {
        const { oauthMetadata: oauthMetadataKey } = await this.getAuthKeys();
        const oauthMetadata = await this.getKeyValueStorage().getItem(oauthMetadataKey);
        return oauthMetadata && JSON.parse(oauthMetadata);
    }
}
const createKeysForAuthStorage = (provider, identifier) => {
    return getAuthStorageKeys(AuthTokenStorageKeys)(`${provider}`, identifier);
};
function getAuthStorageKeys(authKeys) {
    const keys = Object.values({ ...authKeys });
    return (prefix, identifier) => keys.reduce((acc, authKey) => ({
        ...acc,
        [authKey]: `${prefix}.${identifier}.${authKey}`,
    }), {});
}


//# sourceMappingURL=TokenStore.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/credentialsProvider/types.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const IdentityIdStorageKeys = {
    identityId: 'identityId',
};


//# sourceMappingURL=types.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/credentialsProvider/IdentityIdStore.mjs





// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const IdentityIdStore_logger = new ConsoleLogger('DefaultIdentityIdStore');
class DefaultIdentityIdStore {
    setAuthConfig(authConfigParam) {
        assertIdentityPoolIdConfig(authConfigParam.Cognito);
        this.authConfig = authConfigParam;
        this._authKeys = IdentityIdStore_createKeysForAuthStorage('Cognito', authConfigParam.Cognito.identityPoolId);
    }
    constructor(keyValueStorage) {
        this._authKeys = {};
        this._hasGuestIdentityId = false;
        this.keyValueStorage = keyValueStorage;
    }
    async loadIdentityId() {
        assertIdentityPoolIdConfig(this.authConfig?.Cognito);
        try {
            if (this._primaryIdentityId) {
                return {
                    id: this._primaryIdentityId,
                    type: 'primary',
                };
            }
            else {
                const storedIdentityId = await this.keyValueStorage.getItem(this._authKeys.identityId);
                if (storedIdentityId) {
                    this._hasGuestIdentityId = true;
                    return {
                        id: storedIdentityId,
                        type: 'guest',
                    };
                }
                return null;
            }
        }
        catch (err) {
            IdentityIdStore_logger.log('Error getting stored IdentityId.', err);
            return null;
        }
    }
    async storeIdentityId(identity) {
        assertIdentityPoolIdConfig(this.authConfig?.Cognito);
        if (identity.type === 'guest') {
            this.keyValueStorage.setItem(this._authKeys.identityId, identity.id);
            // Clear in-memory storage of primary identityId
            this._primaryIdentityId = undefined;
            this._hasGuestIdentityId = true;
        }
        else {
            this._primaryIdentityId = identity.id;
            // Clear locally stored guest id
            if (this._hasGuestIdentityId) {
                this.keyValueStorage.removeItem(this._authKeys.identityId);
                this._hasGuestIdentityId = false;
            }
        }
    }
    async clearIdentityId() {
        this._primaryIdentityId = undefined;
        await this.keyValueStorage.removeItem(this._authKeys.identityId);
    }
}
const IdentityIdStore_createKeysForAuthStorage = (provider, identifier) => {
    return getAuthStorageKeys(IdentityIdStorageKeys)(`com.amplify.${provider}`, identifier);
};


//# sourceMappingURL=IdentityIdStore.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/credentialsProvider/index.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Cognito specific implmentation of the CredentialsProvider interface
 * that manages setting and getting of AWS Credentials.
 *
 * @throws configuration expections: `InvalidIdentityPoolIdException`
 *  - Auth errors that may arise from misconfiguration.
 * @throws service expections: {@link GetCredentialsForIdentityException}, {@link GetIdException}
 *
 */
const cognitoCredentialsProvider = new CognitoAWSCredentialsAndIdentityIdProvider(new DefaultIdentityIdStore(defaultStorage));


//# sourceMappingURL=index.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/deDupeAsyncFunction.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * returns in-flight promise if there is one
 *
 * @param asyncFunction - asyncFunction to be deduped.
 * @returns - the return type of the callback
 */
const deDupeAsyncFunction = (asyncFunction) => {
    let inflightPromise;
    return async (...args) => {
        if (inflightPromise)
            return inflightPromise;
        inflightPromise = new Promise((resolve, reject) => {
            asyncFunction(...args)
                .then(result => {
                resolve(result);
            })
                .catch(error => {
                reject(error);
            })
                .finally(() => {
                inflightPromise = undefined;
            });
        });
        return inflightPromise;
    };
};


//# sourceMappingURL=deDupeAsyncFunction.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/constants.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * The service name used to sign requests if the API requires authentication.
 */
const COGNITO_IDP_SERVICE_NAME = 'cognito-idp';


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/cognitoUserPoolEndpointResolver.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const cognitoUserPoolEndpointResolver = ({ region, }) => ({
    url: new AmplifyUrl(`https://${COGNITO_IDP_SERVICE_NAME}.${region}.${getDnsSuffix(region)}`),
});


//# sourceMappingURL=cognitoUserPoolEndpointResolver.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/factories/createCognitoUserPoolEndpointResolver.mjs



const createCognitoUserPoolEndpointResolver = ({ endpointOverride }) => (input) => {
    if (endpointOverride) {
        return { url: new AmplifyUrl(endpointOverride) };
    }
    return cognitoUserPoolEndpointResolver(input);
};


//# sourceMappingURL=createCognitoUserPoolEndpointResolver.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/factories/serviceClients/cognitoIdentityProvider/shared/serde/createUserPoolSerializer.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createUserPoolSerializer = (operation) => (input, endpoint) => {
    const headers = createUserPoolSerializer_getSharedHeaders(operation);
    const body = JSON.stringify(input);
    return createUserPoolSerializer_buildHttpRpcRequest(endpoint, headers, body);
};
const createUserPoolSerializer_getSharedHeaders = (operation) => ({
    'content-type': 'application/x-amz-json-1.1',
    'x-amz-target': `AWSCognitoIdentityProviderService.${operation}`,
});
const createUserPoolSerializer_buildHttpRpcRequest = ({ url }, headers, body) => ({
    headers,
    url,
    body,
    method: 'POST',
});


//# sourceMappingURL=createUserPoolSerializer.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/factories/serviceClients/cognitoIdentityProvider/shared/serde/createUserPoolDeserializer.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createUserPoolDeserializer = () => async (response) => {
    if (response.statusCode >= 300) {
        const error = await parseJsonError(response);
        assertServiceError(error);
        throw new AuthError({
            name: error.name,
            message: error.message,
            metadata: error.$metadata,
        });
    }
    return parseJsonBody(response);
};


//# sourceMappingURL=createUserPoolDeserializer.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/factories/serviceClients/cognitoIdentityProvider/shared/handler/cognitoUserPoolTransferHandler.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * A Cognito Identity-specific middleware that disables caching for all requests.
 */
const disableCacheMiddlewareFactory = () => (next, _) => async function disableCacheMiddleware(request) {
    request.headers = {
        ...request.headers,
        'cache-control': 'no-store',
        ...(await Amplify.libraryOptions?.Auth?.headers?.()),
    };
    return next(request);
};
/**
 * A Cognito Identity-specific transfer handler that does NOT sign requests, and
 * disables caching.
 *
 * @internal
 */
const cognitoUserPoolTransferHandler = composeTransferHandler(unauthenticatedHandler, [disableCacheMiddlewareFactory]);


//# sourceMappingURL=cognitoUserPoolTransferHandler.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/factories/serviceClients/cognitoIdentityProvider/constants.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const constants_DEFAULT_SERVICE_CLIENT_API_CONFIG = {
    service: COGNITO_IDP_SERVICE_NAME,
    retryDecider: getRetryDecider(parseJsonError),
    computeDelay: jitteredBackoff_jitteredBackoff,
    get userAgentValue() {
        return getAmplifyUserAgent();
    },
    cache: 'no-store',
};


//# sourceMappingURL=constants.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/factories/serviceClients/cognitoIdentityProvider/createGetTokensFromRefreshTokenClient.mjs








// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createGetTokensFromRefreshTokenClient = (config) => composeServiceApi(cognitoUserPoolTransferHandler, createUserPoolSerializer('GetTokensFromRefreshToken'), createUserPoolDeserializer(), {
    ...constants_DEFAULT_SERVICE_CLIENT_API_CONFIG,
    ...config,
});


//# sourceMappingURL=createGetTokensFromRefreshTokenClient.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/utils/refreshAuthTokens.mjs















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const refreshAuthTokensFunction = async ({ tokens, authConfig, username, clientMetadata, }) => {
    assertTokenProviderConfig(authConfig?.Cognito);
    const { userPoolId, userPoolClientId, userPoolEndpoint } = authConfig.Cognito;
    const region = getRegionFromUserPoolId(userPoolId);
    assertAuthTokensWithRefreshToken(tokens);
    const getTokensFromRefreshToken = createGetTokensFromRefreshTokenClient({
        endpointResolver: createCognitoUserPoolEndpointResolver({
            endpointOverride: userPoolEndpoint,
        }),
    });
    const { AuthenticationResult } = await getTokensFromRefreshToken({ region }, {
        ClientId: userPoolClientId,
        RefreshToken: tokens.refreshToken,
        DeviceKey: tokens.deviceMetadata?.deviceKey,
        ClientMetadata: clientMetadata,
    });
    const accessToken = decodeJWT(AuthenticationResult?.AccessToken ?? '');
    const idToken = AuthenticationResult?.IdToken
        ? decodeJWT(AuthenticationResult.IdToken)
        : undefined;
    const { iat } = accessToken.payload;
    // This should never happen. If it does, it's a bug from the service.
    if (!iat) {
        throw new AuthError({
            name: 'iatNotFoundException',
            message: 'iat not found in access token',
        });
    }
    const clockDrift = iat * 1000 - new Date().getTime();
    return {
        accessToken,
        idToken,
        clockDrift,
        refreshToken: AuthenticationResult?.RefreshToken ?? tokens.refreshToken,
        username,
    };
};
const refreshAuthTokens = deDupeAsyncFunction(refreshAuthTokensFunction);
const refreshAuthTokensWithoutDedupe = (/* unused pure expression or super */ null && (refreshAuthTokensFunction));


//# sourceMappingURL=refreshAuthTokens.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/isBrowser.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const isBrowser = () => typeof window !== 'undefined' && typeof window.document !== 'undefined';


//# sourceMappingURL=isBrowser.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/utils/isTokenExpired.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
function isTokenExpired({ expiresAt, clockDrift, tolerance = 5000, }) {
    const currentTime = Date.now();
    return currentTime + clockDrift + tolerance > expiresAt;
}


//# sourceMappingURL=isTokenExpired.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/utils/signInWithRedirectStore.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const V5_HOSTED_UI_KEY = 'amplify-signin-with-hostedUI';
const signInWithRedirectStore_name = 'CognitoIdentityServiceProvider';
class DefaultOAuthStore {
    constructor(keyValueStorage) {
        this.keyValueStorage = keyValueStorage;
    }
    async clearOAuthInflightData() {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        await Promise.all([
            this.keyValueStorage.removeItem(authKeys.inflightOAuth),
            this.keyValueStorage.removeItem(authKeys.oauthPKCE),
            this.keyValueStorage.removeItem(authKeys.oauthState),
        ]);
    }
    async clearOAuthData() {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        await this.clearOAuthInflightData();
        await this.keyValueStorage.removeItem(V5_HOSTED_UI_KEY); // remove in case a customer migrated an App from v5 to v6
        return this.keyValueStorage.removeItem(authKeys.oauthSignIn);
    }
    loadOAuthState() {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        return this.keyValueStorage.getItem(authKeys.oauthState);
    }
    storeOAuthState(state) {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        return this.keyValueStorage.setItem(authKeys.oauthState, state);
    }
    loadPKCE() {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        return this.keyValueStorage.getItem(authKeys.oauthPKCE);
    }
    storePKCE(pkce) {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        return this.keyValueStorage.setItem(authKeys.oauthPKCE, pkce);
    }
    setAuthConfig(authConfigParam) {
        this.cognitoConfig = authConfigParam;
    }
    async loadOAuthInFlight() {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        return ((await this.keyValueStorage.getItem(authKeys.inflightOAuth)) === 'true');
    }
    async storeOAuthInFlight(inflight) {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        await this.keyValueStorage.setItem(authKeys.inflightOAuth, `${inflight}`);
    }
    async loadOAuthSignIn() {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        const isLegacyHostedUISignIn = await this.keyValueStorage.getItem(V5_HOSTED_UI_KEY);
        const [isOAuthSignIn, preferPrivateSession] = (await this.keyValueStorage.getItem(authKeys.oauthSignIn))?.split(',') ??
            [];
        return {
            isOAuthSignIn: isOAuthSignIn === 'true' || isLegacyHostedUISignIn === 'true',
            preferPrivateSession: preferPrivateSession === 'true',
        };
    }
    async storeOAuthSignIn(oauthSignIn, preferPrivateSession = false) {
        assertTokenProviderConfig(this.cognitoConfig);
        const authKeys = signInWithRedirectStore_createKeysForAuthStorage(signInWithRedirectStore_name, this.cognitoConfig.userPoolClientId);
        await this.keyValueStorage.setItem(authKeys.oauthSignIn, `${oauthSignIn},${preferPrivateSession}`);
    }
}
const signInWithRedirectStore_createKeysForAuthStorage = (provider, identifier) => {
    return getAuthStorageKeys(OAuthStorageKeys)(provider, identifier);
};


//# sourceMappingURL=signInWithRedirectStore.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/utils/oauth/oAuthStore.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const oAuthStore = new DefaultOAuthStore(defaultStorage);


//# sourceMappingURL=oAuthStore.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/utils/oauth/inflightPromise.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const inflightPromises = [];
const addInflightPromise = (resolver) => {
    inflightPromises.push(resolver);
};
const resolveAndClearInflightPromises = () => {
    while (inflightPromises.length) {
        inflightPromises.pop()?.();
    }
};


//# sourceMappingURL=inflightPromise.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/TokenOrchestrator.mjs







// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
class TokenOrchestrator {
    constructor() {
        this.waitForInflightOAuth = isBrowser()
            ? async () => {
                if (!(await oAuthStore.loadOAuthInFlight())) {
                    return;
                }
                if (this.inflightPromise) {
                    return this.inflightPromise;
                }
                // when there is valid oauth config and there is an inflight oauth flow, try
                // to block async calls that require fetching tokens before the oauth flow completes
                // e.g. getCurrentUser, fetchAuthSession etc.
                this.inflightPromise = new Promise((resolve, _reject) => {
                    addInflightPromise(resolve);
                });
                return this.inflightPromise;
            }
            : async () => {
                // no-op for non-browser environments
            };
    }
    setAuthConfig(authConfig) {
        oAuthStore.setAuthConfig(authConfig.Cognito);
        this.authConfig = authConfig;
    }
    setTokenRefresher(tokenRefresher) {
        this.tokenRefresher = tokenRefresher;
    }
    setAuthTokenStore(tokenStore) {
        this.tokenStore = tokenStore;
    }
    getTokenStore() {
        if (!this.tokenStore) {
            throw new AuthError({
                name: 'EmptyTokenStoreException',
                message: 'TokenStore not set',
            });
        }
        return this.tokenStore;
    }
    getTokenRefresher() {
        if (!this.tokenRefresher) {
            throw new AuthError({
                name: 'EmptyTokenRefresherException',
                message: 'TokenRefresher not set',
            });
        }
        return this.tokenRefresher;
    }
    setClientMetadataProvider(clientMetadataProvider) {
        this.clientMetadataProvider = clientMetadataProvider;
    }
    async getTokens(options) {
        let tokens;
        try {
            assertTokenProviderConfig(this.authConfig?.Cognito);
        }
        catch (_err) {
            // Token provider not configured
            return null;
        }
        await this.waitForInflightOAuth();
        this.inflightPromise = undefined;
        tokens = await this.getTokenStore().loadTokens();
        const username = await this.getTokenStore().getLastAuthUser();
        if (tokens === null) {
            return null;
        }
        const idTokenExpired = !!tokens?.idToken &&
            isTokenExpired({
                expiresAt: (tokens.idToken?.payload?.exp ?? 0) * 1000,
                clockDrift: tokens.clockDrift ?? 0,
            });
        const accessTokenExpired = isTokenExpired({
            expiresAt: (tokens.accessToken?.payload?.exp ?? 0) * 1000,
            clockDrift: tokens.clockDrift ?? 0,
        });
        if (options?.forceRefresh || idTokenExpired || accessTokenExpired) {
            tokens = await this.refreshTokens({
                tokens,
                username,
                clientMetadata: options?.clientMetadata ?? (await this.clientMetadataProvider?.()),
            });
            if (tokens === null) {
                return null;
            }
        }
        return {
            accessToken: tokens?.accessToken,
            idToken: tokens?.idToken,
            signInDetails: tokens?.signInDetails,
        };
    }
    async refreshTokens({ tokens, username, clientMetadata, }) {
        try {
            const { signInDetails } = tokens;
            const newTokens = await this.getTokenRefresher()({
                tokens,
                authConfig: this.authConfig,
                username,
                clientMetadata,
            });
            newTokens.signInDetails = signInDetails;
            await this.setTokens({ tokens: newTokens });
            Hub.dispatch('auth', { event: 'tokenRefresh' }, 'Auth', AMPLIFY_SYMBOL);
            return newTokens;
        }
        catch (err) {
            return this.handleErrors(err);
        }
    }
    handleErrors(err) {
        assertServiceError(err);
        // Only clear tokens for definitive authentication failures
        // Do NOT clear tokens for transient errors like service issues, rate limits, etc.
        const shouldClearTokens = this.isAuthenticationError(err);
        if (shouldClearTokens) {
            this.clearTokens();
        }
        Hub.dispatch('auth', {
            event: 'tokenRefresh_failure',
            data: { error: err },
        }, 'Auth', AMPLIFY_SYMBOL);
        if (err.name.startsWith('NotAuthorizedException')) {
            return null;
        }
        throw err;
    }
    isAuthenticationError(err) {
        // Only clear tokens for errors that definitively indicate the tokens are invalid
        // and re-authentication is required. All other errors (service errors, rate limits, etc.)
        // should preserve the tokens to allow for retry.
        // See: https://github.com/aws-amplify/amplify-js/issues/14534
        const authErrorNames = [
            'NotAuthorizedException', // Refresh token is expired or invalid
            'TokenRevokedException', // Token was revoked by admin
            'UserNotFoundException', // User no longer exists
            'PasswordResetRequiredException', // User must reset password
            'UserNotConfirmedException', // User account is not confirmed
            'RefreshTokenReuseException', // Refresh token invalidated by rotation
        ];
        return authErrorNames.some(errorName => err?.name?.startsWith?.(errorName));
    }
    async setTokens({ tokens }) {
        return this.getTokenStore().storeTokens(tokens);
    }
    async clearTokens() {
        return this.getTokenStore().clearTokens();
    }
    getDeviceMetadata(username) {
        return this.getTokenStore().getDeviceMetadata(username);
    }
    clearDeviceMetadata(username) {
        return this.getTokenStore().clearDeviceMetadata(username);
    }
    setOAuthMetadata(metadata) {
        return this.getTokenStore().setOAuthMetadata(metadata);
    }
    getOAuthMetadata() {
        return this.getTokenStore().getOAuthMetadata();
    }
}


//# sourceMappingURL=TokenOrchestrator.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/CognitoUserPoolsTokenProvider.mjs





// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
class CognitoUserPoolsTokenProvider {
    constructor() {
        this.authTokenStore = new DefaultTokenStore();
        this.authTokenStore.setKeyValueStorage(defaultStorage);
        this.tokenOrchestrator = new TokenOrchestrator();
        this.tokenOrchestrator.setAuthTokenStore(this.authTokenStore);
        this.tokenOrchestrator.setTokenRefresher(refreshAuthTokens);
    }
    getTokens(options = {}) {
        return this.tokenOrchestrator.getTokens(options);
    }
    setKeyValueStorage(keyValueStorage) {
        this.authTokenStore.setKeyValueStorage(keyValueStorage);
    }
    setClientMetadataProvider(clientMetadataProvider) {
        this.tokenOrchestrator.setClientMetadataProvider(clientMetadataProvider);
    }
    setAuthConfig(authConfig) {
        this.authTokenStore.setAuthConfig(authConfig);
        this.tokenOrchestrator.setAuthConfig(authConfig);
    }
}


//# sourceMappingURL=CognitoUserPoolsTokenProvider.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/tokenProvider/tokenProvider.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * The default provider for the JWT access token and ID token issued from the configured Cognito user pool. It manages
 * the refresh and storage of the tokens. It stores the tokens in `window.localStorage` if available, and falls back to
 * in-memory storage if not.
 */
const cognitoUserPoolsTokenProvider = new CognitoUserPoolsTokenProvider();
const { tokenOrchestrator } = cognitoUserPoolsTokenProvider;


//# sourceMappingURL=tokenProvider.mjs.map

;// ../../node_modules/aws-amplify/dist/esm/initSingleton.mjs




// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const DefaultAmplify = {
    /**
     * Configures Amplify with the {@link resourceConfig} and {@link libraryOptions}.
     *
     * @param resourceConfig The {@link ResourcesConfig} object that is typically imported from the
     * `amplifyconfiguration.json` file. It can also be an object literal created inline when calling `Amplify.configure`.
     * @param libraryOptions The {@link LibraryOptions} additional options for the library.
     *
     * @example
     * import config from './amplifyconfiguration.json';
     *
     * Amplify.configure(config);
     */
    configure(resourceConfig, libraryOptions) {
        const resolvedResourceConfig = parseAmplifyConfig(resourceConfig);
        const cookieBasedKeyValueStorage = new CookieStorage({ sameSite: 'lax' });
        const resolvedKeyValueStorage = libraryOptions?.ssr
            ? cookieBasedKeyValueStorage
            : defaultStorage;
        const resolvedCredentialsProvider = libraryOptions?.ssr
            ? new CognitoAWSCredentialsAndIdentityIdProvider(new DefaultIdentityIdStore(cookieBasedKeyValueStorage))
            : cognitoCredentialsProvider;
        if (!resolvedResourceConfig.Auth || libraryOptions?.Auth) {
            Amplify.configure(resolvedResourceConfig, libraryOptions);
            return;
        }
        cognitoUserPoolsTokenProvider.setAuthConfig(resolvedResourceConfig.Auth);
        cognitoUserPoolsTokenProvider.setKeyValueStorage(
        // TODO: allow configure with a public interface
        resolvedKeyValueStorage);
        Amplify.configure(resolvedResourceConfig, {
            ...libraryOptions,
            Auth: {
                tokenProvider: cognitoUserPoolsTokenProvider,
                credentialsProvider: resolvedCredentialsProvider,
            },
        });
    },
    /**
     * Returns the {@link ResourcesConfig} object passed in as the `resourceConfig` parameter when calling
     * `Amplify.configure`.
     *
     * @returns An {@link ResourcesConfig} object.
     */
    getConfig() {
        return Amplify.getConfig();
    },
};


//# sourceMappingURL=initSingleton.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/internal/getCurrentUser.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const getCurrentUser = async (amplify) => {
    const authConfig = amplify.getConfig().Auth?.Cognito;
    assertTokenProviderConfig(authConfig);
    const tokens = await amplify.Auth.getTokens({ forceRefresh: false });
    assertAuthTokens(tokens);
    const { 'cognito:username': username, sub } = tokens.idToken?.payload ?? {};
    const authUser = {
        username: username,
        userId: sub,
    };
    const signInDetails = getSignInDetailsFromTokens(tokens);
    if (signInDetails) {
        authUser.signInDetails = signInDetails;
    }
    return authUser;
};
function getSignInDetailsFromTokens(tokens) {
    return tokens?.signInDetails;
}


//# sourceMappingURL=getCurrentUser.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/getCurrentUser.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Gets the current user from the idToken.
 *
 * @param input -  The GetCurrentUserInput object.
 * @returns GetCurrentUserOutput
 * @throws - {@link InitiateAuthException} - Thrown when the service fails to refresh the tokens.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
const getCurrentUser_getCurrentUser = async () => {
    return getCurrentUser(Amplify);
};


//# sourceMappingURL=getCurrentUser.mjs.map

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/apis/internal/fetchAuthSession.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const fetchAuthSession = (amplify, options) => {
    return amplify.Auth.fetchAuthSession(options);
};


//# sourceMappingURL=fetchAuthSession.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/utils/apiHelpers.mjs
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Transforms a user attributes object into an array of AttributeType objects.
 * @param attributes user attributes to be mapped to AttributeType objects.
 * @returns an array of AttributeType objects.
 */
function toAttributeType(attributes) {
    return Object.entries(attributes).map(([key, value]) => ({
        Name: key,
        Value: value,
    }));
}
/**
 * Transforms an array of AttributeType objects into a user attributes object.
 *
 * @param attributes - an array of AttributeType objects.
 * @returns AuthUserAttributes object.
 */
function toAuthUserAttribute(attributes) {
    const userAttributes = {};
    attributes?.forEach(attribute => {
        if (attribute.Name)
            userAttributes[attribute.Name] = attribute.Value;
    });
    return userAttributes;
}


//# sourceMappingURL=apiHelpers.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/utils/getAuthUserAgentValue.mjs


// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const getAuthUserAgentValue = (action, customUserAgentDetails) => getAmplifyUserAgent({
    category: Category.Auth,
    action,
    ...customUserAgentDetails,
});


//# sourceMappingURL=getAuthUserAgentValue.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/foundation/factories/serviceClients/cognitoIdentityProvider/createGetUserClient.mjs








// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const createGetUserClient = (config) => composeServiceApi(cognitoUserPoolTransferHandler, createUserPoolSerializer('GetUser'), createUserPoolDeserializer(), {
    ...constants_DEFAULT_SERVICE_CLIENT_API_CONFIG,
    ...config,
});


//# sourceMappingURL=createGetUserClient.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/internal/fetchUserAttributes.mjs
















// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const fetchUserAttributes = async (amplify) => {
    const authConfig = amplify.getConfig().Auth?.Cognito;
    assertTokenProviderConfig(authConfig);
    const { userPoolEndpoint, userPoolId } = authConfig;
    const { tokens } = await fetchAuthSession(amplify, {
        forceRefresh: false,
    });
    assertAuthTokens(tokens);
    const getUser = createGetUserClient({
        endpointResolver: createCognitoUserPoolEndpointResolver({
            endpointOverride: userPoolEndpoint,
        }),
    });
    const { UserAttributes } = await getUser({
        region: getRegionFromUserPoolId(userPoolId),
        userAgentValue: getAuthUserAgentValue(AuthAction.FetchUserAttributes),
    }, {
        AccessToken: tokens.accessToken.toString(),
    });
    return toAuthUserAttribute(UserAttributes);
};


//# sourceMappingURL=fetchUserAttributes.mjs.map

;// ../../node_modules/@aws-amplify/auth/dist/esm/providers/cognito/apis/fetchUserAttributes.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Fetches the current user attributes while authenticated.
 *
 * @throws - {@link GetUserException} - Cognito service errors thrown when the service is not able to get the user.
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 */
const fetchUserAttributes_fetchUserAttributes = () => {
    return fetchUserAttributes(Amplify);
};


//# sourceMappingURL=fetchUserAttributes.mjs.map

;// ../model-operations/dist/esm/buildTagMap.js
const buildTagMap = (tags) => {
    return tags.reduce((acc, tag) => ({
        ...acc,
        [tag.id]: tag,
    }), {});
};

;// ../../node_modules/lodash-es/_arrayMap.js
/**
 * A specialized version of `_.map` for arrays without support for iteratee
 * shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the new mapped array.
 */
function arrayMap(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length,
      result = Array(length);

  while (++index < length) {
    result[index] = iteratee(array[index], index, array);
  }
  return result;
}

/* harmony default export */ const _arrayMap = (arrayMap);

;// ../../node_modules/lodash-es/_listCacheClear.js
/**
 * Removes all key-value entries from the list cache.
 *
 * @private
 * @name clear
 * @memberOf ListCache
 */
function listCacheClear() {
  this.__data__ = [];
  this.size = 0;
}

/* harmony default export */ const _listCacheClear = (listCacheClear);

;// ../../node_modules/lodash-es/eq.js
/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/* harmony default export */ const lodash_es_eq = (eq);

;// ../../node_modules/lodash-es/_assocIndexOf.js


/**
 * Gets the index at which the `key` is found in `array` of key-value pairs.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} key The key to search for.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function assocIndexOf(array, key) {
  var length = array.length;
  while (length--) {
    if (lodash_es_eq(array[length][0], key)) {
      return length;
    }
  }
  return -1;
}

/* harmony default export */ const _assocIndexOf = (assocIndexOf);

;// ../../node_modules/lodash-es/_listCacheDelete.js


/** Used for built-in method references. */
var arrayProto = Array.prototype;

/** Built-in value references. */
var splice = arrayProto.splice;

/**
 * Removes `key` and its value from the list cache.
 *
 * @private
 * @name delete
 * @memberOf ListCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function listCacheDelete(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    return false;
  }
  var lastIndex = data.length - 1;
  if (index == lastIndex) {
    data.pop();
  } else {
    splice.call(data, index, 1);
  }
  --this.size;
  return true;
}

/* harmony default export */ const _listCacheDelete = (listCacheDelete);

;// ../../node_modules/lodash-es/_listCacheGet.js


/**
 * Gets the list cache value for `key`.
 *
 * @private
 * @name get
 * @memberOf ListCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function listCacheGet(key) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  return index < 0 ? undefined : data[index][1];
}

/* harmony default export */ const _listCacheGet = (listCacheGet);

;// ../../node_modules/lodash-es/_listCacheHas.js


/**
 * Checks if a list cache value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf ListCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function listCacheHas(key) {
  return _assocIndexOf(this.__data__, key) > -1;
}

/* harmony default export */ const _listCacheHas = (listCacheHas);

;// ../../node_modules/lodash-es/_listCacheSet.js


/**
 * Sets the list cache `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf ListCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the list cache instance.
 */
function listCacheSet(key, value) {
  var data = this.__data__,
      index = _assocIndexOf(data, key);

  if (index < 0) {
    ++this.size;
    data.push([key, value]);
  } else {
    data[index][1] = value;
  }
  return this;
}

/* harmony default export */ const _listCacheSet = (listCacheSet);

;// ../../node_modules/lodash-es/_ListCache.js






/**
 * Creates an list cache object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function ListCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `ListCache`.
ListCache.prototype.clear = _listCacheClear;
ListCache.prototype['delete'] = _listCacheDelete;
ListCache.prototype.get = _listCacheGet;
ListCache.prototype.has = _listCacheHas;
ListCache.prototype.set = _listCacheSet;

/* harmony default export */ const _ListCache = (ListCache);

;// ../../node_modules/lodash-es/_stackClear.js


/**
 * Removes all key-value entries from the stack.
 *
 * @private
 * @name clear
 * @memberOf Stack
 */
function stackClear() {
  this.__data__ = new _ListCache;
  this.size = 0;
}

/* harmony default export */ const _stackClear = (stackClear);

;// ../../node_modules/lodash-es/_stackDelete.js
/**
 * Removes `key` and its value from the stack.
 *
 * @private
 * @name delete
 * @memberOf Stack
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function stackDelete(key) {
  var data = this.__data__,
      result = data['delete'](key);

  this.size = data.size;
  return result;
}

/* harmony default export */ const _stackDelete = (stackDelete);

;// ../../node_modules/lodash-es/_stackGet.js
/**
 * Gets the stack value for `key`.
 *
 * @private
 * @name get
 * @memberOf Stack
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function stackGet(key) {
  return this.__data__.get(key);
}

/* harmony default export */ const _stackGet = (stackGet);

;// ../../node_modules/lodash-es/_stackHas.js
/**
 * Checks if a stack value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Stack
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function stackHas(key) {
  return this.__data__.has(key);
}

/* harmony default export */ const _stackHas = (stackHas);

;// ../../node_modules/lodash-es/_freeGlobal.js
/** Detect free variable `global` from Node.js. */
var freeGlobal = typeof __webpack_require__.g == 'object' && __webpack_require__.g && __webpack_require__.g.Object === Object && __webpack_require__.g;

/* harmony default export */ const _freeGlobal = (freeGlobal);

;// ../../node_modules/lodash-es/_root.js


/** Detect free variable `self`. */
var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

/** Used as a reference to the global object. */
var root = _freeGlobal || freeSelf || Function('return this')();

/* harmony default export */ const _root = (root);

;// ../../node_modules/lodash-es/_Symbol.js


/** Built-in value references. */
var _Symbol_Symbol = _root.Symbol;

/* harmony default export */ const _Symbol = (_Symbol_Symbol);

;// ../../node_modules/lodash-es/_getRawTag.js


/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _getRawTag_hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var nativeObjectToString = objectProto.toString;

/** Built-in value references. */
var symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the raw `toStringTag`.
 */
function getRawTag(value) {
  var isOwn = _getRawTag_hasOwnProperty.call(value, symToStringTag),
      tag = value[symToStringTag];

  try {
    value[symToStringTag] = undefined;
    var unmasked = true;
  } catch (e) {}

  var result = nativeObjectToString.call(value);
  if (unmasked) {
    if (isOwn) {
      value[symToStringTag] = tag;
    } else {
      delete value[symToStringTag];
    }
  }
  return result;
}

/* harmony default export */ const _getRawTag = (getRawTag);

;// ../../node_modules/lodash-es/_objectToString.js
/** Used for built-in method references. */
var _objectToString_objectProto = Object.prototype;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var _objectToString_nativeObjectToString = _objectToString_objectProto.toString;

/**
 * Converts `value` to a string using `Object.prototype.toString`.
 *
 * @private
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 */
function objectToString(value) {
  return _objectToString_nativeObjectToString.call(value);
}

/* harmony default export */ const _objectToString = (objectToString);

;// ../../node_modules/lodash-es/_baseGetTag.js




/** `Object#toString` result references. */
var nullTag = '[object Null]',
    undefinedTag = '[object Undefined]';

/** Built-in value references. */
var _baseGetTag_symToStringTag = _Symbol ? _Symbol.toStringTag : undefined;

/**
 * The base implementation of `getTag` without fallbacks for buggy environments.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
function baseGetTag(value) {
  if (value == null) {
    return value === undefined ? undefinedTag : nullTag;
  }
  return (_baseGetTag_symToStringTag && _baseGetTag_symToStringTag in Object(value))
    ? _getRawTag(value)
    : _objectToString(value);
}

/* harmony default export */ const _baseGetTag = (baseGetTag);

;// ../../node_modules/lodash-es/isObject.js
/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return value != null && (type == 'object' || type == 'function');
}

/* harmony default export */ const lodash_es_isObject = (isObject);

;// ../../node_modules/lodash-es/isFunction.js



/** `Object#toString` result references. */
var asyncTag = '[object AsyncFunction]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]',
    proxyTag = '[object Proxy]';

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  if (!lodash_es_isObject(value)) {
    return false;
  }
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 9 which returns 'object' for typed arrays and other constructors.
  var tag = _baseGetTag(value);
  return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
}

/* harmony default export */ const lodash_es_isFunction = (isFunction);

;// ../../node_modules/lodash-es/_coreJsData.js


/** Used to detect overreaching core-js shims. */
var coreJsData = _root['__core-js_shared__'];

/* harmony default export */ const _coreJsData = (coreJsData);

;// ../../node_modules/lodash-es/_isMasked.js


/** Used to detect methods masquerading as native. */
var maskSrcKey = (function() {
  var uid = /[^.]+$/.exec(_coreJsData && _coreJsData.keys && _coreJsData.keys.IE_PROTO || '');
  return uid ? ('Symbol(src)_1.' + uid) : '';
}());

/**
 * Checks if `func` has its source masked.
 *
 * @private
 * @param {Function} func The function to check.
 * @returns {boolean} Returns `true` if `func` is masked, else `false`.
 */
function isMasked(func) {
  return !!maskSrcKey && (maskSrcKey in func);
}

/* harmony default export */ const _isMasked = (isMasked);

;// ../../node_modules/lodash-es/_toSource.js
/** Used for built-in method references. */
var funcProto = Function.prototype;

/** Used to resolve the decompiled source of functions. */
var funcToString = funcProto.toString;

/**
 * Converts `func` to its source code.
 *
 * @private
 * @param {Function} func The function to convert.
 * @returns {string} Returns the source code.
 */
function toSource(func) {
  if (func != null) {
    try {
      return funcToString.call(func);
    } catch (e) {}
    try {
      return (func + '');
    } catch (e) {}
  }
  return '';
}

/* harmony default export */ const _toSource = (toSource);

;// ../../node_modules/lodash-es/_baseIsNative.js





/**
 * Used to match `RegExp`
 * [syntax characters](http://ecma-international.org/ecma-262/7.0/#sec-patterns).
 */
var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;

/** Used to detect host constructors (Safari). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/** Used for built-in method references. */
var _baseIsNative_funcProto = Function.prototype,
    _baseIsNative_objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var _baseIsNative_funcToString = _baseIsNative_funcProto.toString;

/** Used to check objects for own properties. */
var _baseIsNative_hasOwnProperty = _baseIsNative_objectProto.hasOwnProperty;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  _baseIsNative_funcToString.call(_baseIsNative_hasOwnProperty).replace(reRegExpChar, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * The base implementation of `_.isNative` without bad shim checks.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function,
 *  else `false`.
 */
function baseIsNative(value) {
  if (!lodash_es_isObject(value) || _isMasked(value)) {
    return false;
  }
  var pattern = lodash_es_isFunction(value) ? reIsNative : reIsHostCtor;
  return pattern.test(_toSource(value));
}

/* harmony default export */ const _baseIsNative = (baseIsNative);

;// ../../node_modules/lodash-es/_getValue.js
/**
 * Gets the value at `key` of `object`.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function getValue(object, key) {
  return object == null ? undefined : object[key];
}

/* harmony default export */ const _getValue = (getValue);

;// ../../node_modules/lodash-es/_getNative.js



/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = _getValue(object, key);
  return _baseIsNative(value) ? value : undefined;
}

/* harmony default export */ const _getNative = (getNative);

;// ../../node_modules/lodash-es/_Map.js



/* Built-in method references that are verified to be native. */
var _Map_Map = _getNative(_root, 'Map');

/* harmony default export */ const _Map = (_Map_Map);

;// ../../node_modules/lodash-es/_nativeCreate.js


/* Built-in method references that are verified to be native. */
var nativeCreate = _getNative(Object, 'create');

/* harmony default export */ const _nativeCreate = (nativeCreate);

;// ../../node_modules/lodash-es/_hashClear.js


/**
 * Removes all key-value entries from the hash.
 *
 * @private
 * @name clear
 * @memberOf Hash
 */
function hashClear() {
  this.__data__ = _nativeCreate ? _nativeCreate(null) : {};
  this.size = 0;
}

/* harmony default export */ const _hashClear = (hashClear);

;// ../../node_modules/lodash-es/_hashDelete.js
/**
 * Removes `key` and its value from the hash.
 *
 * @private
 * @name delete
 * @memberOf Hash
 * @param {Object} hash The hash to modify.
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function hashDelete(key) {
  var result = this.has(key) && delete this.__data__[key];
  this.size -= result ? 1 : 0;
  return result;
}

/* harmony default export */ const _hashDelete = (hashDelete);

;// ../../node_modules/lodash-es/_hashGet.js


/** Used to stand-in for `undefined` hash values. */
var HASH_UNDEFINED = '__lodash_hash_undefined__';

/** Used for built-in method references. */
var _hashGet_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _hashGet_hasOwnProperty = _hashGet_objectProto.hasOwnProperty;

/**
 * Gets the hash value for `key`.
 *
 * @private
 * @name get
 * @memberOf Hash
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function hashGet(key) {
  var data = this.__data__;
  if (_nativeCreate) {
    var result = data[key];
    return result === HASH_UNDEFINED ? undefined : result;
  }
  return _hashGet_hasOwnProperty.call(data, key) ? data[key] : undefined;
}

/* harmony default export */ const _hashGet = (hashGet);

;// ../../node_modules/lodash-es/_hashHas.js


/** Used for built-in method references. */
var _hashHas_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _hashHas_hasOwnProperty = _hashHas_objectProto.hasOwnProperty;

/**
 * Checks if a hash value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf Hash
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function hashHas(key) {
  var data = this.__data__;
  return _nativeCreate ? (data[key] !== undefined) : _hashHas_hasOwnProperty.call(data, key);
}

/* harmony default export */ const _hashHas = (hashHas);

;// ../../node_modules/lodash-es/_hashSet.js


/** Used to stand-in for `undefined` hash values. */
var _hashSet_HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Sets the hash `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Hash
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the hash instance.
 */
function hashSet(key, value) {
  var data = this.__data__;
  this.size += this.has(key) ? 0 : 1;
  data[key] = (_nativeCreate && value === undefined) ? _hashSet_HASH_UNDEFINED : value;
  return this;
}

/* harmony default export */ const _hashSet = (hashSet);

;// ../../node_modules/lodash-es/_Hash.js






/**
 * Creates a hash object.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Hash(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `Hash`.
Hash.prototype.clear = _hashClear;
Hash.prototype['delete'] = _hashDelete;
Hash.prototype.get = _hashGet;
Hash.prototype.has = _hashHas;
Hash.prototype.set = _hashSet;

/* harmony default export */ const _Hash = (Hash);

;// ../../node_modules/lodash-es/_mapCacheClear.js




/**
 * Removes all key-value entries from the map.
 *
 * @private
 * @name clear
 * @memberOf MapCache
 */
function mapCacheClear() {
  this.size = 0;
  this.__data__ = {
    'hash': new _Hash,
    'map': new (_Map || _ListCache),
    'string': new _Hash
  };
}

/* harmony default export */ const _mapCacheClear = (mapCacheClear);

;// ../../node_modules/lodash-es/_isKeyable.js
/**
 * Checks if `value` is suitable for use as unique object key.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is suitable, else `false`.
 */
function isKeyable(value) {
  var type = typeof value;
  return (type == 'string' || type == 'number' || type == 'symbol' || type == 'boolean')
    ? (value !== '__proto__')
    : (value === null);
}

/* harmony default export */ const _isKeyable = (isKeyable);

;// ../../node_modules/lodash-es/_getMapData.js


/**
 * Gets the data for `map`.
 *
 * @private
 * @param {Object} map The map to query.
 * @param {string} key The reference key.
 * @returns {*} Returns the map data.
 */
function getMapData(map, key) {
  var data = map.__data__;
  return _isKeyable(key)
    ? data[typeof key == 'string' ? 'string' : 'hash']
    : data.map;
}

/* harmony default export */ const _getMapData = (getMapData);

;// ../../node_modules/lodash-es/_mapCacheDelete.js


/**
 * Removes `key` and its value from the map.
 *
 * @private
 * @name delete
 * @memberOf MapCache
 * @param {string} key The key of the value to remove.
 * @returns {boolean} Returns `true` if the entry was removed, else `false`.
 */
function mapCacheDelete(key) {
  var result = _getMapData(this, key)['delete'](key);
  this.size -= result ? 1 : 0;
  return result;
}

/* harmony default export */ const _mapCacheDelete = (mapCacheDelete);

;// ../../node_modules/lodash-es/_mapCacheGet.js


/**
 * Gets the map value for `key`.
 *
 * @private
 * @name get
 * @memberOf MapCache
 * @param {string} key The key of the value to get.
 * @returns {*} Returns the entry value.
 */
function mapCacheGet(key) {
  return _getMapData(this, key).get(key);
}

/* harmony default export */ const _mapCacheGet = (mapCacheGet);

;// ../../node_modules/lodash-es/_mapCacheHas.js


/**
 * Checks if a map value for `key` exists.
 *
 * @private
 * @name has
 * @memberOf MapCache
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function mapCacheHas(key) {
  return _getMapData(this, key).has(key);
}

/* harmony default export */ const _mapCacheHas = (mapCacheHas);

;// ../../node_modules/lodash-es/_mapCacheSet.js


/**
 * Sets the map `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf MapCache
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the map cache instance.
 */
function mapCacheSet(key, value) {
  var data = _getMapData(this, key),
      size = data.size;

  data.set(key, value);
  this.size += data.size == size ? 0 : 1;
  return this;
}

/* harmony default export */ const _mapCacheSet = (mapCacheSet);

;// ../../node_modules/lodash-es/_MapCache.js






/**
 * Creates a map cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function MapCache(entries) {
  var index = -1,
      length = entries == null ? 0 : entries.length;

  this.clear();
  while (++index < length) {
    var entry = entries[index];
    this.set(entry[0], entry[1]);
  }
}

// Add methods to `MapCache`.
MapCache.prototype.clear = _mapCacheClear;
MapCache.prototype['delete'] = _mapCacheDelete;
MapCache.prototype.get = _mapCacheGet;
MapCache.prototype.has = _mapCacheHas;
MapCache.prototype.set = _mapCacheSet;

/* harmony default export */ const _MapCache = (MapCache);

;// ../../node_modules/lodash-es/_stackSet.js




/** Used as the size to enable large array optimizations. */
var LARGE_ARRAY_SIZE = 200;

/**
 * Sets the stack `key` to `value`.
 *
 * @private
 * @name set
 * @memberOf Stack
 * @param {string} key The key of the value to set.
 * @param {*} value The value to set.
 * @returns {Object} Returns the stack cache instance.
 */
function stackSet(key, value) {
  var data = this.__data__;
  if (data instanceof _ListCache) {
    var pairs = data.__data__;
    if (!_Map || (pairs.length < LARGE_ARRAY_SIZE - 1)) {
      pairs.push([key, value]);
      this.size = ++data.size;
      return this;
    }
    data = this.__data__ = new _MapCache(pairs);
  }
  data.set(key, value);
  this.size = data.size;
  return this;
}

/* harmony default export */ const _stackSet = (stackSet);

;// ../../node_modules/lodash-es/_Stack.js







/**
 * Creates a stack cache object to store key-value pairs.
 *
 * @private
 * @constructor
 * @param {Array} [entries] The key-value pairs to cache.
 */
function Stack(entries) {
  var data = this.__data__ = new _ListCache(entries);
  this.size = data.size;
}

// Add methods to `Stack`.
Stack.prototype.clear = _stackClear;
Stack.prototype['delete'] = _stackDelete;
Stack.prototype.get = _stackGet;
Stack.prototype.has = _stackHas;
Stack.prototype.set = _stackSet;

/* harmony default export */ const _Stack = (Stack);

;// ../../node_modules/lodash-es/_arrayEach.js
/**
 * A specialized version of `_.forEach` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns `array`.
 */
function arrayEach(array, iteratee) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (iteratee(array[index], index, array) === false) {
      break;
    }
  }
  return array;
}

/* harmony default export */ const _arrayEach = (arrayEach);

;// ../../node_modules/lodash-es/_defineProperty.js


var defineProperty = (function() {
  try {
    var func = _getNative(Object, 'defineProperty');
    func({}, '', {});
    return func;
  } catch (e) {}
}());

/* harmony default export */ const _defineProperty = (defineProperty);

;// ../../node_modules/lodash-es/_baseAssignValue.js


/**
 * The base implementation of `assignValue` and `assignMergeValue` without
 * value checks.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function baseAssignValue(object, key, value) {
  if (key == '__proto__' && _defineProperty) {
    _defineProperty(object, key, {
      'configurable': true,
      'enumerable': true,
      'value': value,
      'writable': true
    });
  } else {
    object[key] = value;
  }
}

/* harmony default export */ const _baseAssignValue = (baseAssignValue);

;// ../../node_modules/lodash-es/_assignValue.js



/** Used for built-in method references. */
var _assignValue_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _assignValue_hasOwnProperty = _assignValue_objectProto.hasOwnProperty;

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(_assignValue_hasOwnProperty.call(object, key) && lodash_es_eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

/* harmony default export */ const _assignValue = (assignValue);

;// ../../node_modules/lodash-es/_copyObject.js



/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  var isNew = !object;
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    if (newValue === undefined) {
      newValue = source[key];
    }
    if (isNew) {
      _baseAssignValue(object, key, newValue);
    } else {
      _assignValue(object, key, newValue);
    }
  }
  return object;
}

/* harmony default export */ const _copyObject = (copyObject);

;// ../../node_modules/lodash-es/_baseTimes.js
/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/* harmony default export */ const _baseTimes = (baseTimes);

;// ../../node_modules/lodash-es/isObjectLike.js
/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return value != null && typeof value == 'object';
}

/* harmony default export */ const lodash_es_isObjectLike = (isObjectLike);

;// ../../node_modules/lodash-es/_baseIsArguments.js



/** `Object#toString` result references. */
var argsTag = '[object Arguments]';

/**
 * The base implementation of `_.isArguments`.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 */
function baseIsArguments(value) {
  return lodash_es_isObjectLike(value) && _baseGetTag(value) == argsTag;
}

/* harmony default export */ const _baseIsArguments = (baseIsArguments);

;// ../../node_modules/lodash-es/isArguments.js



/** Used for built-in method references. */
var isArguments_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var isArguments_hasOwnProperty = isArguments_objectProto.hasOwnProperty;

/** Built-in value references. */
var propertyIsEnumerable = isArguments_objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
var isArguments = _baseIsArguments(function() { return arguments; }()) ? _baseIsArguments : function(value) {
  return lodash_es_isObjectLike(value) && isArguments_hasOwnProperty.call(value, 'callee') &&
    !propertyIsEnumerable.call(value, 'callee');
};

/* harmony default export */ const lodash_es_isArguments = (isArguments);

;// ../../node_modules/lodash-es/isArray.js
/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/* harmony default export */ const lodash_es_isArray = (isArray);

;// ../../node_modules/lodash-es/stubFalse.js
/**
 * This method returns `false`.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {boolean} Returns `false`.
 * @example
 *
 * _.times(2, _.stubFalse);
 * // => [false, false]
 */
function stubFalse() {
  return false;
}

/* harmony default export */ const lodash_es_stubFalse = (stubFalse);

;// ../../node_modules/lodash-es/isBuffer.js



/** Detect free variable `exports`. */
var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var moduleExports = freeModule && freeModule.exports === freeExports;

/** Built-in value references. */
var isBuffer_Buffer = moduleExports ? _root.Buffer : undefined;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeIsBuffer = isBuffer_Buffer ? isBuffer_Buffer.isBuffer : undefined;

/**
 * Checks if `value` is a buffer.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a buffer, else `false`.
 * @example
 *
 * _.isBuffer(new Buffer(2));
 * // => true
 *
 * _.isBuffer(new Uint8Array(2));
 * // => false
 */
var isBuffer = nativeIsBuffer || lodash_es_stubFalse;

/* harmony default export */ const lodash_es_isBuffer = (isBuffer);

;// ../../node_modules/lodash-es/_isIndex.js
/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  var type = typeof value;
  length = length == null ? MAX_SAFE_INTEGER : length;

  return !!length &&
    (type == 'number' ||
      (type != 'symbol' && reIsUint.test(value))) &&
        (value > -1 && value % 1 == 0 && value < length);
}

/* harmony default export */ const _isIndex = (isIndex);

;// ../../node_modules/lodash-es/isLength.js
/** Used as references for various `Number` constants. */
var isLength_MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= isLength_MAX_SAFE_INTEGER;
}

/* harmony default export */ const lodash_es_isLength = (isLength);

;// ../../node_modules/lodash-es/_baseIsTypedArray.js




/** `Object#toString` result references. */
var _baseIsTypedArray_argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    _baseIsTypedArray_funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[_baseIsTypedArray_argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[_baseIsTypedArray_funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/**
 * The base implementation of `_.isTypedArray` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 */
function baseIsTypedArray(value) {
  return lodash_es_isObjectLike(value) &&
    lodash_es_isLength(value.length) && !!typedArrayTags[_baseGetTag(value)];
}

/* harmony default export */ const _baseIsTypedArray = (baseIsTypedArray);

;// ../../node_modules/lodash-es/_baseUnary.js
/**
 * The base implementation of `_.unary` without support for storing metadata.
 *
 * @private
 * @param {Function} func The function to cap arguments for.
 * @returns {Function} Returns the new capped function.
 */
function baseUnary(func) {
  return function(value) {
    return func(value);
  };
}

/* harmony default export */ const _baseUnary = (baseUnary);

;// ../../node_modules/lodash-es/_nodeUtil.js


/** Detect free variable `exports`. */
var _nodeUtil_freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var _nodeUtil_freeModule = _nodeUtil_freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var _nodeUtil_moduleExports = _nodeUtil_freeModule && _nodeUtil_freeModule.exports === _nodeUtil_freeExports;

/** Detect free variable `process` from Node.js. */
var freeProcess = _nodeUtil_moduleExports && _freeGlobal.process;

/** Used to access faster Node.js helpers. */
var nodeUtil = (function() {
  try {
    // Use `util.types` for Node.js 10+.
    var types = _nodeUtil_freeModule && _nodeUtil_freeModule.require && _nodeUtil_freeModule.require('util').types;

    if (types) {
      return types;
    }

    // Legacy `process.binding('util')` for Node.js < 10.
    return freeProcess && freeProcess.binding && freeProcess.binding('util');
  } catch (e) {}
}());

/* harmony default export */ const _nodeUtil = (nodeUtil);

;// ../../node_modules/lodash-es/isTypedArray.js




/* Node.js helper references. */
var nodeIsTypedArray = _nodeUtil && _nodeUtil.isTypedArray;

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a typed array, else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
var isTypedArray = nodeIsTypedArray ? _baseUnary(nodeIsTypedArray) : _baseIsTypedArray;

/* harmony default export */ const lodash_es_isTypedArray = (isTypedArray);

;// ../../node_modules/lodash-es/_arrayLikeKeys.js







/** Used for built-in method references. */
var _arrayLikeKeys_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _arrayLikeKeys_hasOwnProperty = _arrayLikeKeys_objectProto.hasOwnProperty;

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  var isArr = lodash_es_isArray(value),
      isArg = !isArr && lodash_es_isArguments(value),
      isBuff = !isArr && !isArg && lodash_es_isBuffer(value),
      isType = !isArr && !isArg && !isBuff && lodash_es_isTypedArray(value),
      skipIndexes = isArr || isArg || isBuff || isType,
      result = skipIndexes ? _baseTimes(value.length, String) : [],
      length = result.length;

  for (var key in value) {
    if ((inherited || _arrayLikeKeys_hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (
           // Safari 9 has enumerable `arguments.length` in strict mode.
           key == 'length' ||
           // Node.js 0.10 has enumerable non-index properties on buffers.
           (isBuff && (key == 'offset' || key == 'parent')) ||
           // PhantomJS 2 has enumerable non-index properties on typed arrays.
           (isType && (key == 'buffer' || key == 'byteLength' || key == 'byteOffset')) ||
           // Skip index properties.
           _isIndex(key, length)
        ))) {
      result.push(key);
    }
  }
  return result;
}

/* harmony default export */ const _arrayLikeKeys = (arrayLikeKeys);

;// ../../node_modules/lodash-es/_isPrototype.js
/** Used for built-in method references. */
var _isPrototype_objectProto = Object.prototype;

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || _isPrototype_objectProto;

  return value === proto;
}

/* harmony default export */ const _isPrototype = (isPrototype);

;// ../../node_modules/lodash-es/_overArg.js
/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/* harmony default export */ const _overArg = (overArg);

;// ../../node_modules/lodash-es/_nativeKeys.js


/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = _overArg(Object.keys, Object);

/* harmony default export */ const _nativeKeys = (nativeKeys);

;// ../../node_modules/lodash-es/_baseKeys.js



/** Used for built-in method references. */
var _baseKeys_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _baseKeys_hasOwnProperty = _baseKeys_objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!_isPrototype(object)) {
    return _nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (_baseKeys_hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/* harmony default export */ const _baseKeys = (baseKeys);

;// ../../node_modules/lodash-es/isArrayLike.js



/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && lodash_es_isLength(value.length) && !lodash_es_isFunction(value);
}

/* harmony default export */ const lodash_es_isArrayLike = (isArrayLike);

;// ../../node_modules/lodash-es/keys.js




/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return lodash_es_isArrayLike(object) ? _arrayLikeKeys(object) : _baseKeys(object);
}

/* harmony default export */ const lodash_es_keys = (keys);

;// ../../node_modules/lodash-es/_baseAssign.js



/**
 * The base implementation of `_.assign` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssign(object, source) {
  return object && _copyObject(source, lodash_es_keys(source), object);
}

/* harmony default export */ const _baseAssign = (baseAssign);

;// ../../node_modules/lodash-es/_nativeKeysIn.js
/**
 * This function is like
 * [`Object.keys`](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * except that it includes inherited enumerable properties.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function nativeKeysIn(object) {
  var result = [];
  if (object != null) {
    for (var key in Object(object)) {
      result.push(key);
    }
  }
  return result;
}

/* harmony default export */ const _nativeKeysIn = (nativeKeysIn);

;// ../../node_modules/lodash-es/_baseKeysIn.js




/** Used for built-in method references. */
var _baseKeysIn_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _baseKeysIn_hasOwnProperty = _baseKeysIn_objectProto.hasOwnProperty;

/**
 * The base implementation of `_.keysIn` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeysIn(object) {
  if (!lodash_es_isObject(object)) {
    return _nativeKeysIn(object);
  }
  var isProto = _isPrototype(object),
      result = [];

  for (var key in object) {
    if (!(key == 'constructor' && (isProto || !_baseKeysIn_hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

/* harmony default export */ const _baseKeysIn = (baseKeysIn);

;// ../../node_modules/lodash-es/keysIn.js




/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  return lodash_es_isArrayLike(object) ? _arrayLikeKeys(object, true) : _baseKeysIn(object);
}

/* harmony default export */ const lodash_es_keysIn = (keysIn);

;// ../../node_modules/lodash-es/_baseAssignIn.js



/**
 * The base implementation of `_.assignIn` without support for multiple sources
 * or `customizer` functions.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @returns {Object} Returns `object`.
 */
function baseAssignIn(object, source) {
  return object && _copyObject(source, lodash_es_keysIn(source), object);
}

/* harmony default export */ const _baseAssignIn = (baseAssignIn);

;// ../../node_modules/lodash-es/_cloneBuffer.js


/** Detect free variable `exports`. */
var _cloneBuffer_freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

/** Detect free variable `module`. */
var _cloneBuffer_freeModule = _cloneBuffer_freeExports && typeof module == 'object' && module && !module.nodeType && module;

/** Detect the popular CommonJS extension `module.exports`. */
var _cloneBuffer_moduleExports = _cloneBuffer_freeModule && _cloneBuffer_freeModule.exports === _cloneBuffer_freeExports;

/** Built-in value references. */
var _cloneBuffer_Buffer = _cloneBuffer_moduleExports ? _root.Buffer : undefined,
    allocUnsafe = _cloneBuffer_Buffer ? _cloneBuffer_Buffer.allocUnsafe : undefined;

/**
 * Creates a clone of  `buffer`.
 *
 * @private
 * @param {Buffer} buffer The buffer to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Buffer} Returns the cloned buffer.
 */
function cloneBuffer(buffer, isDeep) {
  if (isDeep) {
    return buffer.slice();
  }
  var length = buffer.length,
      result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);

  buffer.copy(result);
  return result;
}

/* harmony default export */ const _cloneBuffer = (cloneBuffer);

;// ../../node_modules/lodash-es/_copyArray.js
/**
 * Copies the values of `source` to `array`.
 *
 * @private
 * @param {Array} source The array to copy values from.
 * @param {Array} [array=[]] The array to copy values to.
 * @returns {Array} Returns `array`.
 */
function copyArray(source, array) {
  var index = -1,
      length = source.length;

  array || (array = Array(length));
  while (++index < length) {
    array[index] = source[index];
  }
  return array;
}

/* harmony default export */ const _copyArray = (copyArray);

;// ../../node_modules/lodash-es/_arrayFilter.js
/**
 * A specialized version of `_.filter` for arrays without support for
 * iteratee shorthands.
 *
 * @private
 * @param {Array} [array] The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {Array} Returns the new filtered array.
 */
function arrayFilter(array, predicate) {
  var index = -1,
      length = array == null ? 0 : array.length,
      resIndex = 0,
      result = [];

  while (++index < length) {
    var value = array[index];
    if (predicate(value, index, array)) {
      result[resIndex++] = value;
    }
  }
  return result;
}

/* harmony default export */ const _arrayFilter = (arrayFilter);

;// ../../node_modules/lodash-es/stubArray.js
/**
 * This method returns a new empty array.
 *
 * @static
 * @memberOf _
 * @since 4.13.0
 * @category Util
 * @returns {Array} Returns the new empty array.
 * @example
 *
 * var arrays = _.times(2, _.stubArray);
 *
 * console.log(arrays);
 * // => [[], []]
 *
 * console.log(arrays[0] === arrays[1]);
 * // => false
 */
function stubArray() {
  return [];
}

/* harmony default export */ const lodash_es_stubArray = (stubArray);

;// ../../node_modules/lodash-es/_getSymbols.js



/** Used for built-in method references. */
var _getSymbols_objectProto = Object.prototype;

/** Built-in value references. */
var _getSymbols_propertyIsEnumerable = _getSymbols_objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbols = !nativeGetSymbols ? lodash_es_stubArray : function(object) {
  if (object == null) {
    return [];
  }
  object = Object(object);
  return _arrayFilter(nativeGetSymbols(object), function(symbol) {
    return _getSymbols_propertyIsEnumerable.call(object, symbol);
  });
};

/* harmony default export */ const _getSymbols = (getSymbols);

;// ../../node_modules/lodash-es/_copySymbols.js



/**
 * Copies own symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbols(source, object) {
  return _copyObject(source, _getSymbols(source), object);
}

/* harmony default export */ const _copySymbols = (copySymbols);

;// ../../node_modules/lodash-es/_arrayPush.js
/**
 * Appends the elements of `values` to `array`.
 *
 * @private
 * @param {Array} array The array to modify.
 * @param {Array} values The values to append.
 * @returns {Array} Returns `array`.
 */
function arrayPush(array, values) {
  var index = -1,
      length = values.length,
      offset = array.length;

  while (++index < length) {
    array[offset + index] = values[index];
  }
  return array;
}

/* harmony default export */ const _arrayPush = (arrayPush);

;// ../../node_modules/lodash-es/_getPrototype.js


/** Built-in value references. */
var getPrototype = _overArg(Object.getPrototypeOf, Object);

/* harmony default export */ const _getPrototype = (getPrototype);

;// ../../node_modules/lodash-es/_getSymbolsIn.js





/* Built-in method references for those with the same name as other `lodash` methods. */
var _getSymbolsIn_nativeGetSymbols = Object.getOwnPropertySymbols;

/**
 * Creates an array of the own and inherited enumerable symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of symbols.
 */
var getSymbolsIn = !_getSymbolsIn_nativeGetSymbols ? lodash_es_stubArray : function(object) {
  var result = [];
  while (object) {
    _arrayPush(result, _getSymbols(object));
    object = _getPrototype(object);
  }
  return result;
};

/* harmony default export */ const _getSymbolsIn = (getSymbolsIn);

;// ../../node_modules/lodash-es/_copySymbolsIn.js



/**
 * Copies own and inherited symbols of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy symbols from.
 * @param {Object} [object={}] The object to copy symbols to.
 * @returns {Object} Returns `object`.
 */
function copySymbolsIn(source, object) {
  return _copyObject(source, _getSymbolsIn(source), object);
}

/* harmony default export */ const _copySymbolsIn = (copySymbolsIn);

;// ../../node_modules/lodash-es/_baseGetAllKeys.js



/**
 * The base implementation of `getAllKeys` and `getAllKeysIn` which uses
 * `keysFunc` and `symbolsFunc` to get the enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @param {Function} symbolsFunc The function to get the symbols of `object`.
 * @returns {Array} Returns the array of property names and symbols.
 */
function baseGetAllKeys(object, keysFunc, symbolsFunc) {
  var result = keysFunc(object);
  return lodash_es_isArray(object) ? result : _arrayPush(result, symbolsFunc(object));
}

/* harmony default export */ const _baseGetAllKeys = (baseGetAllKeys);

;// ../../node_modules/lodash-es/_getAllKeys.js




/**
 * Creates an array of own enumerable property names and symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeys(object) {
  return _baseGetAllKeys(object, lodash_es_keys, _getSymbols);
}

/* harmony default export */ const _getAllKeys = (getAllKeys);

;// ../../node_modules/lodash-es/_getAllKeysIn.js




/**
 * Creates an array of own and inherited enumerable property names and
 * symbols of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names and symbols.
 */
function getAllKeysIn(object) {
  return _baseGetAllKeys(object, lodash_es_keysIn, _getSymbolsIn);
}

/* harmony default export */ const _getAllKeysIn = (getAllKeysIn);

;// ../../node_modules/lodash-es/_DataView.js



/* Built-in method references that are verified to be native. */
var _DataView_DataView = _getNative(_root, 'DataView');

/* harmony default export */ const _DataView = (_DataView_DataView);

;// ../../node_modules/lodash-es/_Promise.js



/* Built-in method references that are verified to be native. */
var _Promise_Promise = _getNative(_root, 'Promise');

/* harmony default export */ const _Promise = (_Promise_Promise);

;// ../../node_modules/lodash-es/_Set.js



/* Built-in method references that are verified to be native. */
var _Set_Set = _getNative(_root, 'Set');

/* harmony default export */ const _Set = (_Set_Set);

;// ../../node_modules/lodash-es/_WeakMap.js



/* Built-in method references that are verified to be native. */
var WeakMap = _getNative(_root, 'WeakMap');

/* harmony default export */ const _WeakMap = (WeakMap);

;// ../../node_modules/lodash-es/_getTag.js








/** `Object#toString` result references. */
var _getTag_mapTag = '[object Map]',
    _getTag_objectTag = '[object Object]',
    promiseTag = '[object Promise]',
    _getTag_setTag = '[object Set]',
    _getTag_weakMapTag = '[object WeakMap]';

var _getTag_dataViewTag = '[object DataView]';

/** Used to detect maps, sets, and weakmaps. */
var dataViewCtorString = _toSource(_DataView),
    mapCtorString = _toSource(_Map),
    promiseCtorString = _toSource(_Promise),
    setCtorString = _toSource(_Set),
    weakMapCtorString = _toSource(_WeakMap);

/**
 * Gets the `toStringTag` of `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @returns {string} Returns the `toStringTag`.
 */
var getTag = _baseGetTag;

// Fallback for data views, maps, sets, and weak maps in IE 11 and promises in Node.js < 6.
if ((_DataView && getTag(new _DataView(new ArrayBuffer(1))) != _getTag_dataViewTag) ||
    (_Map && getTag(new _Map) != _getTag_mapTag) ||
    (_Promise && getTag(_Promise.resolve()) != promiseTag) ||
    (_Set && getTag(new _Set) != _getTag_setTag) ||
    (_WeakMap && getTag(new _WeakMap) != _getTag_weakMapTag)) {
  getTag = function(value) {
    var result = _baseGetTag(value),
        Ctor = result == _getTag_objectTag ? value.constructor : undefined,
        ctorString = Ctor ? _toSource(Ctor) : '';

    if (ctorString) {
      switch (ctorString) {
        case dataViewCtorString: return _getTag_dataViewTag;
        case mapCtorString: return _getTag_mapTag;
        case promiseCtorString: return promiseTag;
        case setCtorString: return _getTag_setTag;
        case weakMapCtorString: return _getTag_weakMapTag;
      }
    }
    return result;
  };
}

/* harmony default export */ const _getTag = (getTag);

;// ../../node_modules/lodash-es/_initCloneArray.js
/** Used for built-in method references. */
var _initCloneArray_objectProto = Object.prototype;

/** Used to check objects for own properties. */
var _initCloneArray_hasOwnProperty = _initCloneArray_objectProto.hasOwnProperty;

/**
 * Initializes an array clone.
 *
 * @private
 * @param {Array} array The array to clone.
 * @returns {Array} Returns the initialized clone.
 */
function initCloneArray(array) {
  var length = array.length,
      result = new array.constructor(length);

  // Add properties assigned by `RegExp#exec`.
  if (length && typeof array[0] == 'string' && _initCloneArray_hasOwnProperty.call(array, 'index')) {
    result.index = array.index;
    result.input = array.input;
  }
  return result;
}

/* harmony default export */ const _initCloneArray = (initCloneArray);

;// ../../node_modules/lodash-es/_Uint8Array.js


/** Built-in value references. */
var _Uint8Array_Uint8Array = _root.Uint8Array;

/* harmony default export */ const _Uint8Array = (_Uint8Array_Uint8Array);

;// ../../node_modules/lodash-es/_cloneArrayBuffer.js


/**
 * Creates a clone of `arrayBuffer`.
 *
 * @private
 * @param {ArrayBuffer} arrayBuffer The array buffer to clone.
 * @returns {ArrayBuffer} Returns the cloned array buffer.
 */
function cloneArrayBuffer(arrayBuffer) {
  var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
  new _Uint8Array(result).set(new _Uint8Array(arrayBuffer));
  return result;
}

/* harmony default export */ const _cloneArrayBuffer = (cloneArrayBuffer);

;// ../../node_modules/lodash-es/_cloneDataView.js


/**
 * Creates a clone of `dataView`.
 *
 * @private
 * @param {Object} dataView The data view to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned data view.
 */
function cloneDataView(dataView, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(dataView.buffer) : dataView.buffer;
  return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
}

/* harmony default export */ const _cloneDataView = (cloneDataView);

;// ../../node_modules/lodash-es/_cloneRegExp.js
/** Used to match `RegExp` flags from their coerced string values. */
var reFlags = /\w*$/;

/**
 * Creates a clone of `regexp`.
 *
 * @private
 * @param {Object} regexp The regexp to clone.
 * @returns {Object} Returns the cloned regexp.
 */
function cloneRegExp(regexp) {
  var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
  result.lastIndex = regexp.lastIndex;
  return result;
}

/* harmony default export */ const _cloneRegExp = (cloneRegExp);

;// ../../node_modules/lodash-es/_cloneSymbol.js


/** Used to convert symbols to primitives and strings. */
var symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolValueOf = symbolProto ? symbolProto.valueOf : undefined;

/**
 * Creates a clone of the `symbol` object.
 *
 * @private
 * @param {Object} symbol The symbol object to clone.
 * @returns {Object} Returns the cloned symbol object.
 */
function cloneSymbol(symbol) {
  return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
}

/* harmony default export */ const _cloneSymbol = (cloneSymbol);

;// ../../node_modules/lodash-es/_cloneTypedArray.js


/**
 * Creates a clone of `typedArray`.
 *
 * @private
 * @param {Object} typedArray The typed array to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the cloned typed array.
 */
function cloneTypedArray(typedArray, isDeep) {
  var buffer = isDeep ? _cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
  return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
}

/* harmony default export */ const _cloneTypedArray = (cloneTypedArray);

;// ../../node_modules/lodash-es/_initCloneByTag.js






/** `Object#toString` result references. */
var _initCloneByTag_boolTag = '[object Boolean]',
    _initCloneByTag_dateTag = '[object Date]',
    _initCloneByTag_mapTag = '[object Map]',
    _initCloneByTag_numberTag = '[object Number]',
    _initCloneByTag_regexpTag = '[object RegExp]',
    _initCloneByTag_setTag = '[object Set]',
    _initCloneByTag_stringTag = '[object String]',
    symbolTag = '[object Symbol]';

var _initCloneByTag_arrayBufferTag = '[object ArrayBuffer]',
    _initCloneByTag_dataViewTag = '[object DataView]',
    _initCloneByTag_float32Tag = '[object Float32Array]',
    _initCloneByTag_float64Tag = '[object Float64Array]',
    _initCloneByTag_int8Tag = '[object Int8Array]',
    _initCloneByTag_int16Tag = '[object Int16Array]',
    _initCloneByTag_int32Tag = '[object Int32Array]',
    _initCloneByTag_uint8Tag = '[object Uint8Array]',
    _initCloneByTag_uint8ClampedTag = '[object Uint8ClampedArray]',
    _initCloneByTag_uint16Tag = '[object Uint16Array]',
    _initCloneByTag_uint32Tag = '[object Uint32Array]';

/**
 * Initializes an object clone based on its `toStringTag`.
 *
 * **Note:** This function only supports cloning values with tags of
 * `Boolean`, `Date`, `Error`, `Map`, `Number`, `RegExp`, `Set`, or `String`.
 *
 * @private
 * @param {Object} object The object to clone.
 * @param {string} tag The `toStringTag` of the object to clone.
 * @param {boolean} [isDeep] Specify a deep clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneByTag(object, tag, isDeep) {
  var Ctor = object.constructor;
  switch (tag) {
    case _initCloneByTag_arrayBufferTag:
      return _cloneArrayBuffer(object);

    case _initCloneByTag_boolTag:
    case _initCloneByTag_dateTag:
      return new Ctor(+object);

    case _initCloneByTag_dataViewTag:
      return _cloneDataView(object, isDeep);

    case _initCloneByTag_float32Tag: case _initCloneByTag_float64Tag:
    case _initCloneByTag_int8Tag: case _initCloneByTag_int16Tag: case _initCloneByTag_int32Tag:
    case _initCloneByTag_uint8Tag: case _initCloneByTag_uint8ClampedTag: case _initCloneByTag_uint16Tag: case _initCloneByTag_uint32Tag:
      return _cloneTypedArray(object, isDeep);

    case _initCloneByTag_mapTag:
      return new Ctor;

    case _initCloneByTag_numberTag:
    case _initCloneByTag_stringTag:
      return new Ctor(object);

    case _initCloneByTag_regexpTag:
      return _cloneRegExp(object);

    case _initCloneByTag_setTag:
      return new Ctor;

    case symbolTag:
      return _cloneSymbol(object);
  }
}

/* harmony default export */ const _initCloneByTag = (initCloneByTag);

;// ../../node_modules/lodash-es/_baseCreate.js


/** Built-in value references. */
var objectCreate = Object.create;

/**
 * The base implementation of `_.create` without support for assigning
 * properties to the created object.
 *
 * @private
 * @param {Object} proto The object to inherit from.
 * @returns {Object} Returns the new object.
 */
var baseCreate = (function() {
  function object() {}
  return function(proto) {
    if (!lodash_es_isObject(proto)) {
      return {};
    }
    if (objectCreate) {
      return objectCreate(proto);
    }
    object.prototype = proto;
    var result = new object;
    object.prototype = undefined;
    return result;
  };
}());

/* harmony default export */ const _baseCreate = (baseCreate);

;// ../../node_modules/lodash-es/_initCloneObject.js




/**
 * Initializes an object clone.
 *
 * @private
 * @param {Object} object The object to clone.
 * @returns {Object} Returns the initialized clone.
 */
function initCloneObject(object) {
  return (typeof object.constructor == 'function' && !_isPrototype(object))
    ? _baseCreate(_getPrototype(object))
    : {};
}

/* harmony default export */ const _initCloneObject = (initCloneObject);

;// ../../node_modules/lodash-es/_baseIsMap.js



/** `Object#toString` result references. */
var _baseIsMap_mapTag = '[object Map]';

/**
 * The base implementation of `_.isMap` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 */
function baseIsMap(value) {
  return lodash_es_isObjectLike(value) && _getTag(value) == _baseIsMap_mapTag;
}

/* harmony default export */ const _baseIsMap = (baseIsMap);

;// ../../node_modules/lodash-es/isMap.js




/* Node.js helper references. */
var nodeIsMap = _nodeUtil && _nodeUtil.isMap;

/**
 * Checks if `value` is classified as a `Map` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a map, else `false`.
 * @example
 *
 * _.isMap(new Map);
 * // => true
 *
 * _.isMap(new WeakMap);
 * // => false
 */
var isMap = nodeIsMap ? _baseUnary(nodeIsMap) : _baseIsMap;

/* harmony default export */ const lodash_es_isMap = (isMap);

;// ../../node_modules/lodash-es/_baseIsSet.js



/** `Object#toString` result references. */
var _baseIsSet_setTag = '[object Set]';

/**
 * The base implementation of `_.isSet` without Node.js optimizations.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 */
function baseIsSet(value) {
  return lodash_es_isObjectLike(value) && _getTag(value) == _baseIsSet_setTag;
}

/* harmony default export */ const _baseIsSet = (baseIsSet);

;// ../../node_modules/lodash-es/isSet.js




/* Node.js helper references. */
var nodeIsSet = _nodeUtil && _nodeUtil.isSet;

/**
 * Checks if `value` is classified as a `Set` object.
 *
 * @static
 * @memberOf _
 * @since 4.3.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a set, else `false`.
 * @example
 *
 * _.isSet(new Set);
 * // => true
 *
 * _.isSet(new WeakSet);
 * // => false
 */
var isSet = nodeIsSet ? _baseUnary(nodeIsSet) : _baseIsSet;

/* harmony default export */ const lodash_es_isSet = (isSet);

;// ../../node_modules/lodash-es/_baseClone.js























/** Used to compose bitmasks for cloning. */
var CLONE_DEEP_FLAG = 1,
    CLONE_FLAT_FLAG = 2,
    CLONE_SYMBOLS_FLAG = 4;

/** `Object#toString` result references. */
var _baseClone_argsTag = '[object Arguments]',
    _baseClone_arrayTag = '[object Array]',
    _baseClone_boolTag = '[object Boolean]',
    _baseClone_dateTag = '[object Date]',
    _baseClone_errorTag = '[object Error]',
    _baseClone_funcTag = '[object Function]',
    _baseClone_genTag = '[object GeneratorFunction]',
    _baseClone_mapTag = '[object Map]',
    _baseClone_numberTag = '[object Number]',
    _baseClone_objectTag = '[object Object]',
    _baseClone_regexpTag = '[object RegExp]',
    _baseClone_setTag = '[object Set]',
    _baseClone_stringTag = '[object String]',
    _baseClone_symbolTag = '[object Symbol]',
    _baseClone_weakMapTag = '[object WeakMap]';

var _baseClone_arrayBufferTag = '[object ArrayBuffer]',
    _baseClone_dataViewTag = '[object DataView]',
    _baseClone_float32Tag = '[object Float32Array]',
    _baseClone_float64Tag = '[object Float64Array]',
    _baseClone_int8Tag = '[object Int8Array]',
    _baseClone_int16Tag = '[object Int16Array]',
    _baseClone_int32Tag = '[object Int32Array]',
    _baseClone_uint8Tag = '[object Uint8Array]',
    _baseClone_uint8ClampedTag = '[object Uint8ClampedArray]',
    _baseClone_uint16Tag = '[object Uint16Array]',
    _baseClone_uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values supported by `_.clone`. */
var cloneableTags = {};
cloneableTags[_baseClone_argsTag] = cloneableTags[_baseClone_arrayTag] =
cloneableTags[_baseClone_arrayBufferTag] = cloneableTags[_baseClone_dataViewTag] =
cloneableTags[_baseClone_boolTag] = cloneableTags[_baseClone_dateTag] =
cloneableTags[_baseClone_float32Tag] = cloneableTags[_baseClone_float64Tag] =
cloneableTags[_baseClone_int8Tag] = cloneableTags[_baseClone_int16Tag] =
cloneableTags[_baseClone_int32Tag] = cloneableTags[_baseClone_mapTag] =
cloneableTags[_baseClone_numberTag] = cloneableTags[_baseClone_objectTag] =
cloneableTags[_baseClone_regexpTag] = cloneableTags[_baseClone_setTag] =
cloneableTags[_baseClone_stringTag] = cloneableTags[_baseClone_symbolTag] =
cloneableTags[_baseClone_uint8Tag] = cloneableTags[_baseClone_uint8ClampedTag] =
cloneableTags[_baseClone_uint16Tag] = cloneableTags[_baseClone_uint32Tag] = true;
cloneableTags[_baseClone_errorTag] = cloneableTags[_baseClone_funcTag] =
cloneableTags[_baseClone_weakMapTag] = false;

/**
 * The base implementation of `_.clone` and `_.cloneDeep` which tracks
 * traversed objects.
 *
 * @private
 * @param {*} value The value to clone.
 * @param {boolean} bitmask The bitmask flags.
 *  1 - Deep clone
 *  2 - Flatten inherited properties
 *  4 - Clone symbols
 * @param {Function} [customizer] The function to customize cloning.
 * @param {string} [key] The key of `value`.
 * @param {Object} [object] The parent object of `value`.
 * @param {Object} [stack] Tracks traversed objects and their clone counterparts.
 * @returns {*} Returns the cloned value.
 */
function baseClone(value, bitmask, customizer, key, object, stack) {
  var result,
      isDeep = bitmask & CLONE_DEEP_FLAG,
      isFlat = bitmask & CLONE_FLAT_FLAG,
      isFull = bitmask & CLONE_SYMBOLS_FLAG;

  if (customizer) {
    result = object ? customizer(value, key, object, stack) : customizer(value);
  }
  if (result !== undefined) {
    return result;
  }
  if (!lodash_es_isObject(value)) {
    return value;
  }
  var isArr = lodash_es_isArray(value);
  if (isArr) {
    result = _initCloneArray(value);
    if (!isDeep) {
      return _copyArray(value, result);
    }
  } else {
    var tag = _getTag(value),
        isFunc = tag == _baseClone_funcTag || tag == _baseClone_genTag;

    if (lodash_es_isBuffer(value)) {
      return _cloneBuffer(value, isDeep);
    }
    if (tag == _baseClone_objectTag || tag == _baseClone_argsTag || (isFunc && !object)) {
      result = (isFlat || isFunc) ? {} : _initCloneObject(value);
      if (!isDeep) {
        return isFlat
          ? _copySymbolsIn(value, _baseAssignIn(result, value))
          : _copySymbols(value, _baseAssign(result, value));
      }
    } else {
      if (!cloneableTags[tag]) {
        return object ? value : {};
      }
      result = _initCloneByTag(value, tag, isDeep);
    }
  }
  // Check for circular references and return its corresponding clone.
  stack || (stack = new _Stack);
  var stacked = stack.get(value);
  if (stacked) {
    return stacked;
  }
  stack.set(value, result);

  if (lodash_es_isSet(value)) {
    value.forEach(function(subValue) {
      result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
    });
  } else if (lodash_es_isMap(value)) {
    value.forEach(function(subValue, key) {
      result.set(key, baseClone(subValue, bitmask, customizer, key, value, stack));
    });
  }

  var keysFunc = isFull
    ? (isFlat ? _getAllKeysIn : _getAllKeys)
    : (isFlat ? lodash_es_keysIn : lodash_es_keys);

  var props = isArr ? undefined : keysFunc(value);
  _arrayEach(props || value, function(subValue, key) {
    if (props) {
      key = subValue;
      subValue = value[key];
    }
    // Recursively populate clone (susceptible to call stack limits).
    _assignValue(result, key, baseClone(subValue, bitmask, customizer, key, value, stack));
  });
  return result;
}

/* harmony default export */ const _baseClone = (baseClone);

;// ../../node_modules/lodash-es/isSymbol.js



/** `Object#toString` result references. */
var isSymbol_symbolTag = '[object Symbol]';

/**
 * Checks if `value` is classified as a `Symbol` primitive or object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
 * @example
 *
 * _.isSymbol(Symbol.iterator);
 * // => true
 *
 * _.isSymbol('abc');
 * // => false
 */
function isSymbol(value) {
  return typeof value == 'symbol' ||
    (lodash_es_isObjectLike(value) && _baseGetTag(value) == isSymbol_symbolTag);
}

/* harmony default export */ const lodash_es_isSymbol = (isSymbol);

;// ../../node_modules/lodash-es/_isKey.js



/** Used to match property names within property paths. */
var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,
    reIsPlainProp = /^\w*$/;

/**
 * Checks if `value` is a property name and not a property path.
 *
 * @private
 * @param {*} value The value to check.
 * @param {Object} [object] The object to query keys on.
 * @returns {boolean} Returns `true` if `value` is a property name, else `false`.
 */
function isKey(value, object) {
  if (lodash_es_isArray(value)) {
    return false;
  }
  var type = typeof value;
  if (type == 'number' || type == 'symbol' || type == 'boolean' ||
      value == null || lodash_es_isSymbol(value)) {
    return true;
  }
  return reIsPlainProp.test(value) || !reIsDeepProp.test(value) ||
    (object != null && value in Object(object));
}

/* harmony default export */ const _isKey = (isKey);

;// ../../node_modules/lodash-es/memoize.js


/** Error message constants. */
var FUNC_ERROR_TEXT = 'Expected a function';

/**
 * Creates a function that memoizes the result of `func`. If `resolver` is
 * provided, it determines the cache key for storing the result based on the
 * arguments provided to the memoized function. By default, the first argument
 * provided to the memoized function is used as the map cache key. The `func`
 * is invoked with the `this` binding of the memoized function.
 *
 * **Note:** The cache is exposed as the `cache` property on the memoized
 * function. Its creation may be customized by replacing the `_.memoize.Cache`
 * constructor with one whose instances implement the
 * [`Map`](http://ecma-international.org/ecma-262/7.0/#sec-properties-of-the-map-prototype-object)
 * method interface of `clear`, `delete`, `get`, `has`, and `set`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Function
 * @param {Function} func The function to have its output memoized.
 * @param {Function} [resolver] The function to resolve the cache key.
 * @returns {Function} Returns the new memoized function.
 * @example
 *
 * var object = { 'a': 1, 'b': 2 };
 * var other = { 'c': 3, 'd': 4 };
 *
 * var values = _.memoize(_.values);
 * values(object);
 * // => [1, 2]
 *
 * values(other);
 * // => [3, 4]
 *
 * object.a = 2;
 * values(object);
 * // => [1, 2]
 *
 * // Modify the result cache.
 * values.cache.set(object, ['a', 'b']);
 * values(object);
 * // => ['a', 'b']
 *
 * // Replace `_.memoize.Cache`.
 * _.memoize.Cache = WeakMap;
 */
function memoize(func, resolver) {
  if (typeof func != 'function' || (resolver != null && typeof resolver != 'function')) {
    throw new TypeError(FUNC_ERROR_TEXT);
  }
  var memoized = function() {
    var args = arguments,
        key = resolver ? resolver.apply(this, args) : args[0],
        cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }
    var result = func.apply(this, args);
    memoized.cache = cache.set(key, result) || cache;
    return result;
  };
  memoized.cache = new (memoize.Cache || _MapCache);
  return memoized;
}

// Expose `MapCache`.
memoize.Cache = _MapCache;

/* harmony default export */ const lodash_es_memoize = (memoize);

;// ../../node_modules/lodash-es/_memoizeCapped.js


/** Used as the maximum memoize cache size. */
var MAX_MEMOIZE_SIZE = 500;

/**
 * A specialized version of `_.memoize` which clears the memoized function's
 * cache when it exceeds `MAX_MEMOIZE_SIZE`.
 *
 * @private
 * @param {Function} func The function to have its output memoized.
 * @returns {Function} Returns the new memoized function.
 */
function memoizeCapped(func) {
  var result = lodash_es_memoize(func, function(key) {
    if (cache.size === MAX_MEMOIZE_SIZE) {
      cache.clear();
    }
    return key;
  });

  var cache = result.cache;
  return result;
}

/* harmony default export */ const _memoizeCapped = (memoizeCapped);

;// ../../node_modules/lodash-es/_stringToPath.js


/** Used to match property names within property paths. */
var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;

/** Used to match backslashes in property paths. */
var reEscapeChar = /\\(\\)?/g;

/**
 * Converts `string` to a property path array.
 *
 * @private
 * @param {string} string The string to convert.
 * @returns {Array} Returns the property path array.
 */
var stringToPath = _memoizeCapped(function(string) {
  var result = [];
  if (string.charCodeAt(0) === 46 /* . */) {
    result.push('');
  }
  string.replace(rePropName, function(match, number, quote, subString) {
    result.push(quote ? subString.replace(reEscapeChar, '$1') : (number || match));
  });
  return result;
});

/* harmony default export */ const _stringToPath = (stringToPath);

;// ../../node_modules/lodash-es/_baseToString.js





/** Used as references for various `Number` constants. */
var INFINITY = 1 / 0;

/** Used to convert symbols to primitives and strings. */
var _baseToString_symbolProto = _Symbol ? _Symbol.prototype : undefined,
    symbolToString = _baseToString_symbolProto ? _baseToString_symbolProto.toString : undefined;

/**
 * The base implementation of `_.toString` which doesn't convert nullish
 * values to empty strings.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  // Exit early for strings to avoid a performance hit in some environments.
  if (typeof value == 'string') {
    return value;
  }
  if (lodash_es_isArray(value)) {
    // Recursively convert values (susceptible to call stack limits).
    return _arrayMap(value, baseToString) + '';
  }
  if (lodash_es_isSymbol(value)) {
    return symbolToString ? symbolToString.call(value) : '';
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -INFINITY) ? '-0' : result;
}

/* harmony default export */ const _baseToString = (baseToString);

;// ../../node_modules/lodash-es/toString.js


/**
 * Converts `value` to a string. An empty string is returned for `null`
 * and `undefined` values. The sign of `-0` is preserved.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {string} Returns the converted string.
 * @example
 *
 * _.toString(null);
 * // => ''
 *
 * _.toString(-0);
 * // => '-0'
 *
 * _.toString([1, 2, 3]);
 * // => '1,2,3'
 */
function toString_toString(value) {
  return value == null ? '' : _baseToString(value);
}

/* harmony default export */ const lodash_es_toString = (toString_toString);

;// ../../node_modules/lodash-es/_castPath.js





/**
 * Casts `value` to a path array if it's not one.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {Object} [object] The object to query keys on.
 * @returns {Array} Returns the cast property path array.
 */
function castPath(value, object) {
  if (lodash_es_isArray(value)) {
    return value;
  }
  return _isKey(value, object) ? [value] : _stringToPath(lodash_es_toString(value));
}

/* harmony default export */ const _castPath = (castPath);

;// ../../node_modules/lodash-es/last.js
/**
 * Gets the last element of `array`.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to query.
 * @returns {*} Returns the last element of `array`.
 * @example
 *
 * _.last([1, 2, 3]);
 * // => 3
 */
function last(array) {
  var length = array == null ? 0 : array.length;
  return length ? array[length - 1] : undefined;
}

/* harmony default export */ const lodash_es_last = (last);

;// ../../node_modules/lodash-es/_toKey.js


/** Used as references for various `Number` constants. */
var _toKey_INFINITY = 1 / 0;

/**
 * Converts `value` to a string key if it's not a string or symbol.
 *
 * @private
 * @param {*} value The value to inspect.
 * @returns {string|symbol} Returns the key.
 */
function toKey(value) {
  if (typeof value == 'string' || lodash_es_isSymbol(value)) {
    return value;
  }
  var result = (value + '');
  return (result == '0' && (1 / value) == -_toKey_INFINITY) ? '-0' : result;
}

/* harmony default export */ const _toKey = (toKey);

;// ../../node_modules/lodash-es/_baseGet.js



/**
 * The base implementation of `_.get` without support for default values.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path of the property to get.
 * @returns {*} Returns the resolved value.
 */
function baseGet(object, path) {
  path = _castPath(path, object);

  var index = 0,
      length = path.length;

  while (object != null && index < length) {
    object = object[_toKey(path[index++])];
  }
  return (index && index == length) ? object : undefined;
}

/* harmony default export */ const _baseGet = (baseGet);

;// ../../node_modules/lodash-es/_baseSlice.js
/**
 * The base implementation of `_.slice` without an iteratee call guard.
 *
 * @private
 * @param {Array} array The array to slice.
 * @param {number} [start=0] The start position.
 * @param {number} [end=array.length] The end position.
 * @returns {Array} Returns the slice of `array`.
 */
function baseSlice(array, start, end) {
  var index = -1,
      length = array.length;

  if (start < 0) {
    start = -start > length ? 0 : (length + start);
  }
  end = end > length ? length : end;
  if (end < 0) {
    end += length;
  }
  length = start > end ? 0 : ((end - start) >>> 0);
  start >>>= 0;

  var result = Array(length);
  while (++index < length) {
    result[index] = array[index + start];
  }
  return result;
}

/* harmony default export */ const _baseSlice = (baseSlice);

;// ../../node_modules/lodash-es/_parent.js



/**
 * Gets the parent value at `path` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array} path The path to get the parent value of.
 * @returns {*} Returns the parent value.
 */
function _parent_parent(object, path) {
  return path.length < 2 ? object : _baseGet(object, _baseSlice(path, 0, -1));
}

/* harmony default export */ const _parent = (_parent_parent);

;// ../../node_modules/lodash-es/_baseUnset.js





/**
 * The base implementation of `_.unset`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The property path to unset.
 * @returns {boolean} Returns `true` if the property is deleted, else `false`.
 */
function baseUnset(object, path) {
  path = _castPath(path, object);
  object = _parent(object, path);
  return object == null || delete object[_toKey(lodash_es_last(path))];
}

/* harmony default export */ const _baseUnset = (baseUnset);

;// ../../node_modules/lodash-es/isPlainObject.js




/** `Object#toString` result references. */
var isPlainObject_objectTag = '[object Object]';

/** Used for built-in method references. */
var isPlainObject_funcProto = Function.prototype,
    isPlainObject_objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var isPlainObject_funcToString = isPlainObject_funcProto.toString;

/** Used to check objects for own properties. */
var isPlainObject_hasOwnProperty = isPlainObject_objectProto.hasOwnProperty;

/** Used to infer the `Object` constructor. */
var objectCtorString = isPlainObject_funcToString.call(Object);

/**
 * Checks if `value` is a plain object, that is, an object created by the
 * `Object` constructor or one with a `[[Prototype]]` of `null`.
 *
 * @static
 * @memberOf _
 * @since 0.8.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * _.isPlainObject(new Foo);
 * // => false
 *
 * _.isPlainObject([1, 2, 3]);
 * // => false
 *
 * _.isPlainObject({ 'x': 0, 'y': 0 });
 * // => true
 *
 * _.isPlainObject(Object.create(null));
 * // => true
 */
function isPlainObject(value) {
  if (!lodash_es_isObjectLike(value) || _baseGetTag(value) != isPlainObject_objectTag) {
    return false;
  }
  var proto = _getPrototype(value);
  if (proto === null) {
    return true;
  }
  var Ctor = isPlainObject_hasOwnProperty.call(proto, 'constructor') && proto.constructor;
  return typeof Ctor == 'function' && Ctor instanceof Ctor &&
    isPlainObject_funcToString.call(Ctor) == objectCtorString;
}

/* harmony default export */ const lodash_es_isPlainObject = (isPlainObject);

;// ../../node_modules/lodash-es/_customOmitClone.js


/**
 * Used by `_.omit` to customize its `_.cloneDeep` use to only clone plain
 * objects.
 *
 * @private
 * @param {*} value The value to inspect.
 * @param {string} key The key of the property to inspect.
 * @returns {*} Returns the uncloned value or `undefined` to defer cloning to `_.cloneDeep`.
 */
function customOmitClone(value) {
  return lodash_es_isPlainObject(value) ? undefined : value;
}

/* harmony default export */ const _customOmitClone = (customOmitClone);

;// ../../node_modules/lodash-es/_isFlattenable.js




/** Built-in value references. */
var spreadableSymbol = _Symbol ? _Symbol.isConcatSpreadable : undefined;

/**
 * Checks if `value` is a flattenable `arguments` object or array.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is flattenable, else `false`.
 */
function isFlattenable(value) {
  return lodash_es_isArray(value) || lodash_es_isArguments(value) ||
    !!(spreadableSymbol && value && value[spreadableSymbol]);
}

/* harmony default export */ const _isFlattenable = (isFlattenable);

;// ../../node_modules/lodash-es/_baseFlatten.js



/**
 * The base implementation of `_.flatten` with support for restricting flattening.
 *
 * @private
 * @param {Array} array The array to flatten.
 * @param {number} depth The maximum recursion depth.
 * @param {boolean} [predicate=isFlattenable] The function invoked per iteration.
 * @param {boolean} [isStrict] Restrict to values that pass `predicate` checks.
 * @param {Array} [result=[]] The initial result value.
 * @returns {Array} Returns the new flattened array.
 */
function baseFlatten(array, depth, predicate, isStrict, result) {
  var index = -1,
      length = array.length;

  predicate || (predicate = _isFlattenable);
  result || (result = []);

  while (++index < length) {
    var value = array[index];
    if (depth > 0 && predicate(value)) {
      if (depth > 1) {
        // Recursively flatten arrays (susceptible to call stack limits).
        baseFlatten(value, depth - 1, predicate, isStrict, result);
      } else {
        _arrayPush(result, value);
      }
    } else if (!isStrict) {
      result[result.length] = value;
    }
  }
  return result;
}

/* harmony default export */ const _baseFlatten = (baseFlatten);

;// ../../node_modules/lodash-es/flatten.js


/**
 * Flattens `array` a single level deep.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to flatten.
 * @returns {Array} Returns the new flattened array.
 * @example
 *
 * _.flatten([1, [2, [3, [4]], 5]]);
 * // => [1, 2, [3, [4]], 5]
 */
function flatten(array) {
  var length = array == null ? 0 : array.length;
  return length ? _baseFlatten(array, 1) : [];
}

/* harmony default export */ const lodash_es_flatten = (flatten);

;// ../../node_modules/lodash-es/_apply.js
/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/* harmony default export */ const _apply = (apply);

;// ../../node_modules/lodash-es/_overRest.js


/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeMax = Math.max;

/**
 * A specialized version of `baseRest` which transforms the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @param {Function} transform The rest array transform.
 * @returns {Function} Returns the new function.
 */
function overRest(func, start, transform) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = transform(array);
    return _apply(func, this, otherArgs);
  };
}

/* harmony default export */ const _overRest = (overRest);

;// ../../node_modules/lodash-es/constant.js
/**
 * Creates a function that returns `value`.
 *
 * @static
 * @memberOf _
 * @since 2.4.0
 * @category Util
 * @param {*} value The value to return from the new function.
 * @returns {Function} Returns the new constant function.
 * @example
 *
 * var objects = _.times(2, _.constant({ 'a': 1 }));
 *
 * console.log(objects);
 * // => [{ 'a': 1 }, { 'a': 1 }]
 *
 * console.log(objects[0] === objects[1]);
 * // => true
 */
function constant(value) {
  return function() {
    return value;
  };
}

/* harmony default export */ const lodash_es_constant = (constant);

;// ../../node_modules/lodash-es/identity.js
/**
 * This method returns the first argument it receives.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Util
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'a': 1 };
 *
 * console.log(_.identity(object) === object);
 * // => true
 */
function identity(value) {
  return value;
}

/* harmony default export */ const lodash_es_identity = (identity);

;// ../../node_modules/lodash-es/_baseSetToString.js




/**
 * The base implementation of `setToString` without support for hot loop shorting.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var baseSetToString = !_defineProperty ? lodash_es_identity : function(func, string) {
  return _defineProperty(func, 'toString', {
    'configurable': true,
    'enumerable': false,
    'value': lodash_es_constant(string),
    'writable': true
  });
};

/* harmony default export */ const _baseSetToString = (baseSetToString);

;// ../../node_modules/lodash-es/_shortOut.js
/** Used to detect hot functions by number of calls within a span of milliseconds. */
var HOT_COUNT = 800,
    HOT_SPAN = 16;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeNow = Date.now;

/**
 * Creates a function that'll short out and invoke `identity` instead
 * of `func` when it's called `HOT_COUNT` or more times in `HOT_SPAN`
 * milliseconds.
 *
 * @private
 * @param {Function} func The function to restrict.
 * @returns {Function} Returns the new shortable function.
 */
function shortOut(func) {
  var count = 0,
      lastCalled = 0;

  return function() {
    var stamp = nativeNow(),
        remaining = HOT_SPAN - (stamp - lastCalled);

    lastCalled = stamp;
    if (remaining > 0) {
      if (++count >= HOT_COUNT) {
        return arguments[0];
      }
    } else {
      count = 0;
    }
    return func.apply(undefined, arguments);
  };
}

/* harmony default export */ const _shortOut = (shortOut);

;// ../../node_modules/lodash-es/_setToString.js



/**
 * Sets the `toString` method of `func` to return `string`.
 *
 * @private
 * @param {Function} func The function to modify.
 * @param {Function} string The `toString` result.
 * @returns {Function} Returns `func`.
 */
var setToString = _shortOut(_baseSetToString);

/* harmony default export */ const _setToString = (setToString);

;// ../../node_modules/lodash-es/_flatRest.js




/**
 * A specialized version of `baseRest` which flattens the rest array.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @returns {Function} Returns the new function.
 */
function flatRest(func) {
  return _setToString(_overRest(func, undefined, lodash_es_flatten), func + '');
}

/* harmony default export */ const _flatRest = (flatRest);

;// ../../node_modules/lodash-es/omit.js









/** Used to compose bitmasks for cloning. */
var omit_CLONE_DEEP_FLAG = 1,
    omit_CLONE_FLAT_FLAG = 2,
    omit_CLONE_SYMBOLS_FLAG = 4;

/**
 * The opposite of `_.pick`; this method creates an object composed of the
 * own and inherited enumerable property paths of `object` that are not omitted.
 *
 * **Note:** This method is considerably slower than `_.pick`.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to omit.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.omit(object, ['a', 'c']);
 * // => { 'b': '2' }
 */
var omit = _flatRest(function(object, paths) {
  var result = {};
  if (object == null) {
    return result;
  }
  var isDeep = false;
  paths = _arrayMap(paths, function(path) {
    path = _castPath(path, object);
    isDeep || (isDeep = path.length > 1);
    return path;
  });
  _copyObject(object, _getAllKeysIn(object), result);
  if (isDeep) {
    result = _baseClone(result, omit_CLONE_DEEP_FLAG | omit_CLONE_FLAT_FLAG | omit_CLONE_SYMBOLS_FLAG, _customOmitClone);
  }
  var length = paths.length;
  while (length--) {
    _baseUnset(result, paths[length]);
  }
  return result;
});

/* harmony default export */ const lodash_es_omit = (omit);

;// ../model-operations/dist/esm/deckSerializer.js


const serializeDeck = (deck) => {
    return {
        ...deck,
        cards: deck.cards.map((card) => ({
            ...card,
            data: {
                ...lodash_es_omit(card.data, 'tags'),
                tagIds: card.data.tags.map((tag) => tag.id),
            },
        })),
    };
};
const deserializeDeck = (serializedDeck) => {
    const tagMap = buildTagMap(serializedDeck.tags ?? []);
    return {
        ...serializedDeck,
        cards: serializedDeck.cards.map((card) => ({
            ...card,
            data: {
                ...lodash_es_omit(card.data, 'tagIds'),
                tags: (card.data.tagIds ?? [])
                    .filter((tagId) => tagMap[tagId])
                    .map((tagId) => tagMap[tagId]),
            },
        })),
        tags: serializedDeck.tags ?? [],
        settings: serializedDeck.settings ?? {},
    };
};

;// ../model/dist/esm/analysis.js
const isTranslation = (o) => {
    return (o &&
        typeof o['source'] === 'string' &&
        typeof o['sourceLanguage'] === 'string' &&
        typeof o['target'] === 'string' &&
        typeof o['targetLanguage'] === 'string');
};
const isDirectAnalyzePayload = (o) => {
    return !(!o || !o.source || !o.targetLanguage);
};
const isReverseAnalyzePayload = (o) => {
    return !(!o || !o.target || !o.sourceLanguage || !o.targetLanguage);
};
const isAnalysisNumber = (o) => {
    return ['plural', 'singular'].includes(o);
};
const isTense = (o) => {
    return ['present', 'past', 'future'].includes(o);
};
const inputTypes = (/* unused pure expression or super */ null && ([
    'word',
    'collocation',
    'phrasal verb',
    'phrase',
    'sentence',
    'idiom',
]));
const isDetectedInputType = (inputType) => {
    return inputTypes.includes(inputType);
};
const unitOfSpeechTypes = (/* unused pure expression or super */ null && ([
    'word',
    'collocation',
    'phrasal verb',
    'idiom',
]));
const isReverseAnalysis = (o) => {
    return !(!o || !o.target);
};

;// ../model/dist/esm/language-list.js
const languageList = {
    af: 'Afrikaans',
    sq: 'Albanian',
    am: 'Amharic',
    ar: 'Arabic',
    hy: 'Armenian',
    hyw: 'Armenian (Western)',
    az: 'Azerbaijani',
    eu: 'Basque',
    be: 'Belarusian',
    bn: 'Bengali',
    bs: 'Bosnian',
    bg: 'Bulgarian',
    ca: 'Catalan',
    zh: 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    co: 'Corsican',
    hr: 'Croatian',
    cs: 'Czech',
    da: 'Danish',
    nl: 'Dutch',
    en: 'English (US)',
    'en-GB': 'English (British)',
    eo: 'Esperanto',
    et: 'Estonian',
    fi: 'Finnish',
    fr: 'French',
    fy: 'Frisian',
    gl: 'Galician',
    ka: 'Georgian',
    de: 'German',
    el: 'Greek',
    gu: 'Gujarati',
    ht: 'Haitian Creole',
    ha: 'Hausa',
    haw: 'Hawaiian',
    he: 'Hebrew',
    hi: 'Hindi',
    hmn: 'Hmong',
    hu: 'Hungarian',
    is: 'Icelandic',
    ig: 'Igbo',
    id: 'Indonesian',
    ga: 'Irish',
    it: 'Italian',
    ja: 'Japanese',
    jv: 'Javanese',
    kn: 'Kannada',
    kk: 'Kazakh',
    km: 'Khmer',
    rw: 'Kinyarwanda',
    ko: 'Korean',
    ku: 'Kurdish',
    ky: 'Kyrgyz',
    lo: 'Lao',
    lv: 'Latvian',
    lt: 'Lithuanian',
    lb: 'Luxembourgish',
    mk: 'Macedonian',
    mg: 'Malagasy',
    ms: 'Malay',
    ml: 'Malayalam',
    mt: 'Maltese',
    mi: 'Maori',
    mr: 'Marathi',
    mn: 'Mongolian',
    my: 'Myanmar (Burmese)',
    ne: 'Nepali',
    no: 'Norwegian',
    ny: 'Nyanja (Chichewa)',
    or: 'Odia (Oriya)',
    ps: 'Pashto',
    fa: 'Persian',
    pl: 'Polish',
    pt: 'Portuguese (Brazilian)',
    'pt-PT': 'Portuguese (European)',
    pa: 'Punjabi',
    ro: 'Romanian',
    ru: 'Russian',
    sm: 'Samoan',
    gd: 'Scots Gaelic',
    sr: 'Serbian',
    st: 'Sesotho',
    sn: 'Shona',
    sd: 'Sindhi',
    si: 'Sinhala (Sinhalese)',
    sk: 'Slovak',
    sl: 'Slovenian',
    so: 'Somali',
    es: 'Spanish',
    su: 'Sundanese',
    sw: 'Swahili',
    sv: 'Swedish',
    tl: 'Tagalog (Filipino)',
    tg: 'Tajik',
    ta: 'Tamil',
    tt: 'Tatar',
    te: 'Telugu',
    th: 'Thai',
    tr: 'Turkish',
    tk: 'Turkmen',
    uk: 'Ukrainian',
    ur: 'Urdu',
    ug: 'Uyghur',
    uz: 'Uzbek',
    vi: 'Vietnamese',
    cy: 'Welsh',
    xh: 'Xhosa',
    yi: 'Yiddish',
    yo: 'Yoruba',
    zu: 'Zulu',
};
const getFullLanguageName = (code) => {
    // @ts-ignore
    return languageList[code] ?? code;
};
const shortenedLanguageList = {
    'en-GB': 'English (UK)',
    tl: 'Tagalog',
    si: 'Sinhala',
    zh: 'Chinese (S)',
    'zh-TW': 'Chinese (Tr)',
    'pt-PT': 'Portuguese (PT)',
    pt: 'Portuguese (BR)',
    hyw: 'Armenian (W)',
};

;// ../model/dist/esm/study-stats.js
const defaultStudyStreak = {
    days: 0,
    longestStreak: 0,
    lastStudyDay: '0000-01-01',
    lastStudyTimezone: 'Asia/Jerusalem',
};

;// ../model/dist/esm/translation-cards.js
const isCardItem = (item) => {
    return item.id !== undefined;
};
const isDetachedCardItem = (item) => {
    return item.id === undefined;
};

;// ../sulna/dist/esm/stringArray.js
const join = (lines) => {
    if (!lines || lines.length === 0) {
        return '';
    }
    if (lines.length === 1) {
        return lines[0];
    }
    return lines.map((line) => `* ${line}`).join(`\n`);
};
const explode = (lines) => {
    if (!lines) {
        return [];
    }
    return lines
        .split(`\n`)
        .map((line) => line.replace(/^\* */, '').replace(/ +$/, ''))
        .filter((line) => line !== '');
};

;// ../sulna/dist/esm/trimArticle.js
const frenchLeLa = /^(le|la)\s/i;
const dropL = /^(l)['’‘‛′ʼʹꞌ＇]/i;
const trimRegexes = {
    en: [/^(a)\s/i],
    nl: [/^(de|het|de.het|het.de)\s/i],
    de: [/^(der|die|das|ein|eine)\s/i],
    es: [/^(el|la|los|las|el.la|la.el)\s/i],
    fr: [/^(les|un|une|des|du|de)\s/i, frenchLeLa, dropL],
    it: [/^(il|lo|la|i|gli|le|un|uno|una)\s/i, dropL],
    pt: [/^(o|a|os|as|um|uma|uns|umas)\s/i],
    no: [/^(en|ei|et)\s/i],
    da: [/^(en|et)\s/i],
};
const trimArticle = (language, source) => {
    if (trimRegexes[language] === undefined) {
        return {
            source,
        };
    }
    for (let regex of trimRegexes[language]) {
        const articleMatch = source.match(regex);
        if (articleMatch === null) {
            continue;
        }
        return {
            source: source.replace(regex, '').trim(),
        };
    }
    return {
        source,
    };
};
const trimSenselessArticle = (language, source) => {
    if (language === 'fr') {
        return source.replace(dropL, '').trim().replace(frenchLeLa, '').trim();
    }
    if (language !== 'en') {
        return source;
    }
    return trimArticle(language, source).source;
};

;// ../sulna/dist/esm/auth.js
/**
 * Email + password helpers shared by the web app and the mobile app.
 *
 * The username of an email/password account *is* the normalized email: the
 * user pool has no username_attributes or alias_attributes, so uniqueness of
 * the address relies on every client normalizing it the same way.
 */
const normalizeEmail = (email) => email.trim().toLowerCase();
/**
 * Same shape the pre sign-up trigger accepts, so the form never submits an
 * address the trigger would reject.
 */
const isValidEmail = (email) => /^[^\s"\\@]+@[^\s"\\@]+\.[^\s"\\@]+$/.test(normalizeEmail(email));
const PASSWORD_MIN_LENGTH = 8;
/**
 * Cognito's list of special characters. The space counts as one too.
 */
const PASSWORD_SYMBOLS = '^$*.[]{}()?"!@#%&/\\,><\':;|_~`=+- ';
/**
 * Mirrors the default Cognito password policy of the user pool.
 */
const checkPassword = (password) => ({
    minLength: password.length >= PASSWORD_MIN_LENGTH,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    digit: /[0-9]/.test(password),
    symbol: [...password].some((char) => PASSWORD_SYMBOLS.includes(char)),
});
const isPasswordValid = (password) => Object.values(checkPassword(password)).every(Boolean);
const errorCodesByName = {
    NotAuthorizedException: 'invalidCredentials',
    UserNotFoundException: 'invalidCredentials',
    UserNotConfirmedException: 'userNotConfirmed',
    UsernameExistsException: 'usernameExists',
    AliasExistsException: 'usernameExists',
    CodeMismatchException: 'codeMismatch',
    ExpiredCodeException: 'codeExpired',
    LimitExceededException: 'tooManyAttempts',
    TooManyRequestsException: 'tooManyAttempts',
    TooManyFailedAttemptsException: 'tooManyAttempts',
    InvalidPasswordException: 'invalidPassword',
    NetworkError: 'network',
    UserCancelledException: 'cancelled',
};
const decode = (message) => {
    try {
        return decodeURIComponent(message.replace(/\+/g, ' '));
    }
    catch {
        return message;
    }
};
/**
 * The pre sign-up trigger's messages (see packages/auth-lambdas) arrive as
 * text only: in a UserLambdaValidationException from SignUp, and as the
 * error_description of a failed Google/Apple redirect.
 */
const errorCodeFromMessage = (message) => {
    const text = decode(message);
    if (text.includes('An account with this email already exists')) {
        if (text.includes('Google or Apple')) {
            return 'emailTakenGoogleOrApple';
        }
        if (text.includes('Google')) {
            return 'emailTakenGoogle';
        }
        if (text.includes('Apple')) {
            return 'emailTakenApple';
        }
        return 'emailTakenPassword';
    }
    if (text.includes('An email address is required')) {
        return 'invalidEmail';
    }
    // Amplify's own wording for a Google/Apple window the user closed.
    if (text.includes('User cancelled OAuth flow') ||
        text.includes('has been canceled') ||
        // What the React Native in-app browser reports when it is closed.
        text.trim() === 'canceled') {
        return 'cancelled';
    }
    if (text.includes('Password attempts exceeded')) {
        return 'tooManyAttempts';
    }
    return undefined;
};
/**
 * Classifies whatever Amplify throws (or dispatches through Hub) so that the
 * clients can show a translated message. The Cognito text itself is English
 * only and is never meant to be shown as is.
 */
const getAuthErrorCode = (error) => {
    if (typeof error === 'string') {
        return errorCodeFromMessage(error) ?? 'unknown';
    }
    if (typeof error !== 'object' || error === null) {
        return 'unknown';
    }
    const { name, message } = error;
    const fromMessage = typeof message === 'string' ? errorCodeFromMessage(message) : undefined;
    if (fromMessage) {
        return fromMessage;
    }
    if (typeof name === 'string' && errorCodesByName[name]) {
        return errorCodesByName[name];
    }
    return 'unknown';
};

;// ../sulna/dist/esm/index.js




















;// ../model/dist/esm/units-of-speech-generation.js
/* unused harmony import specifier */ var isSafeObject;
/* unused harmony import specifier */ var units_of_speech_generation_isObject;
/* unused harmony import specifier */ var isString;
/* unused harmony import specifier */ var isGoogleLanguage;



const isUnitOfSpeech = (data) => {
    return (isSafeObject(data) &&
        typeof data['headword'] === 'string' &&
        typeof data['partOfSpeech'] === 'string');
};
const isUnitOfSpeechGenerationMessageAssistant = (message) => {
    return (units_of_speech_generation_isObject(message) &&
        message['role'] === 'assistant' &&
        isString(message['text']) &&
        Array.isArray(message['unitsOfSpeech']) &&
        message['unitsOfSpeech'].every(isUnitOfSpeech));
};
const isUnitOfSpeechGenerationMessageUser = (message) => {
    return message['role'] === 'user' && typeof message['text'] === 'string';
};
const isUnitOfSpeechGenerationMessage = (message) => {
    return (isUnitOfSpeechGenerationMessageAssistant(message) ||
        isUnitOfSpeechGenerationMessageUser(message));
};
const isUnitOfSpeechGenerationPayload = (payload) => {
    return (isSafeObject(payload) &&
        Array.isArray(payload['messages']) &&
        payload['messages'].every(isUnitOfSpeechGenerationMessage) &&
        isGoogleLanguage(payload['sourceLanguage']));
};
const isBatchUnitOfSpeechAnalyzePayload = (payload) => {
    return (isSafeObject(payload) &&
        isGoogleLanguage(payload['sourceLanguage']) &&
        isGoogleLanguage(payload['targetLanguage']) &&
        Array.isArray(payload['unitsOfSpeech']) &&
        payload['unitsOfSpeech'].every(isUnitOfSpeech));
};

;// ../model/dist/esm/user.js
const mapUserAttributes = ({ username, attributes, }) => {
    const email = attributes['email'];
    const sub = attributes['sub'];
    if (!email || !sub) {
        throw Error('Can find email and sub in user data.');
    }
    const nextBillDate = attributes['custom:next_bill_date'];
    const unitPrice = attributes['custom:unit_price'];
    const cancellationDate = attributes['custom:cancellation_date'];
    const productId = attributes['custom:product_id'];
    return {
        username,
        email,
        sub,
        status: attributes['custom:status'],
        updateUrl: attributes['custom:update_url'],
        cancelUrl: attributes['custom:cancel_url'],
        nextBillDate: nextBillDate ? new Date(nextBillDate) : undefined,
        unitPrice: unitPrice ? parseFloat(unitPrice) : undefined,
        cancellationDate: cancellationDate ? new Date(cancellationDate) : undefined,
        productId: productId ? parseInt(productId) : undefined,
        planName: attributes['custom:plan_name'],
    };
};
const isEligibleForTrial = (userData) => {
    return userData.status !== 'deleted';
};

;// ../model/dist/esm/user-metadata.js
const locales = [
    'en',
    'ru',
    'uk',
    'vi',
    'tr',
    'es',
    'pt',
    'zh',
    'zh-TW',
];
/**
 * Maps a BCP 47 tag ("ru-RU", "PT", "zh-Hant-HK") to a supported interface
 * locale. Chinese resolves by script: Traditional tags ("zh-Hant", "zh-TW",
 * "zh-HK", "zh-MO") become "zh-TW", everything else ("zh", "zh-CN",
 * "zh-Hans-TW", "zh-SG") becomes Simplified "zh".
 */
const parseLocale = (tag) => {
    const parts = (tag ?? '').toLowerCase().split(/[-_]/);
    if (parts[0] === 'zh') {
        if (parts.includes('hans')) {
            return 'zh';
        }
        return parts.some((part) => ['hant', 'tw', 'hk', 'mo'].includes(part))
            ? 'zh-TW'
            : 'zh';
    }
    return locales.find((locale) => locale === parts[0]);
};
const defaultUserMetadata = {
    onboardingFlow: {
        allowed: false,
        extensionSent: true,
        mobileAppSent: true,
        language: null,
    },
    rate: {
        ios: undefined,
        android: undefined,
        chromeExtension: undefined,
        edgeExtension: undefined,
        safariExtension: undefined,
    },
    lastUpdated: 0,
};
const mergeUserMetadata = (md1, md2) => {
    return {
        ...md1,
        ...md2,
        rate: {
            ...md1.rate,
            ...md2.rate,
        },
        onboardingFlow: {
            ...md1.onboardingFlow,
            ...md2.onboardingFlow,
        },
    };
};
const mapUserMetadata = (metadata) => {
    return mergeUserMetadata(defaultUserMetadata, metadata);
};

;// ../model/dist/esm/user-static-metadata.js
const defaultUserStaticMetadata = {
    premium: false,
    premium_status: 'NONE',
    premium_expiration_at_ms: null,
    premium_last_event_ms: 0,
    max_cards: 50,
    cards_per_day: 5,
    thanks_trial: 'none',
    management_url: null,
};
const mergeUserStaticMetadata = (md1, md2) => {
    return {
        ...md1,
        ...md2,
    };
};
const mapUserStaticMetadata = (metadata) => {
    return mergeUserStaticMetadata(defaultUserStaticMetadata, metadata);
};

;// ../model/dist/esm/tts.js
const isTTSResponse = (payload) => {
    return typeof payload.audioContent === 'string';
};

;// ../model/dist/esm/index.js




























;// ../model-operations/dist/esm/languageToLexicalaLanguage.js
/* unused harmony import specifier */ var LexicalaLanguages;

const languageToLexicalaLanguage = (language) => {
    if (language === 'zh-TW') {
        return 'tw';
    }
    return (LexicalaLanguages.find((lexicalaLanguage) => lexicalaLanguage === language) ?? null);
};

;// ../../node_modules/lodash-es/_assignMergeValue.js



/**
 * This function is like `assignValue` except that it doesn't assign
 * `undefined` values.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignMergeValue(object, key, value) {
  if ((value !== undefined && !lodash_es_eq(object[key], value)) ||
      (value === undefined && !(key in object))) {
    _baseAssignValue(object, key, value);
  }
}

/* harmony default export */ const _assignMergeValue = (assignMergeValue);

;// ../../node_modules/lodash-es/_createBaseFor.js
/**
 * Creates a base function for methods like `_.forIn` and `_.forOwn`.
 *
 * @private
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {Function} Returns the new base function.
 */
function createBaseFor(fromRight) {
  return function(object, iteratee, keysFunc) {
    var index = -1,
        iterable = Object(object),
        props = keysFunc(object),
        length = props.length;

    while (length--) {
      var key = props[fromRight ? length : ++index];
      if (iteratee(iterable[key], key, iterable) === false) {
        break;
      }
    }
    return object;
  };
}

/* harmony default export */ const _createBaseFor = (createBaseFor);

;// ../../node_modules/lodash-es/_baseFor.js


/**
 * The base implementation of `baseForOwn` which iterates over `object`
 * properties returned by `keysFunc` and invokes `iteratee` for each property.
 * Iteratee functions may exit iteration early by explicitly returning `false`.
 *
 * @private
 * @param {Object} object The object to iterate over.
 * @param {Function} iteratee The function invoked per iteration.
 * @param {Function} keysFunc The function to get the keys of `object`.
 * @returns {Object} Returns `object`.
 */
var baseFor = _createBaseFor();

/* harmony default export */ const _baseFor = (baseFor);

;// ../../node_modules/lodash-es/isArrayLikeObject.js



/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return lodash_es_isObjectLike(value) && lodash_es_isArrayLike(value);
}

/* harmony default export */ const lodash_es_isArrayLikeObject = (isArrayLikeObject);

;// ../../node_modules/lodash-es/_safeGet.js
/**
 * Gets the value at `key`, unless `key` is "__proto__" or "constructor".
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the property to get.
 * @returns {*} Returns the property value.
 */
function safeGet(object, key) {
  if (key === 'constructor' && typeof object[key] === 'function') {
    return;
  }

  if (key == '__proto__') {
    return;
  }

  return object[key];
}

/* harmony default export */ const _safeGet = (safeGet);

;// ../../node_modules/lodash-es/toPlainObject.js



/**
 * Converts `value` to a plain object flattening inherited enumerable string
 * keyed properties of `value` to own properties of the plain object.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to convert.
 * @returns {Object} Returns the converted plain object.
 * @example
 *
 * function Foo() {
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.assign({ 'a': 1 }, new Foo);
 * // => { 'a': 1, 'b': 2 }
 *
 * _.assign({ 'a': 1 }, _.toPlainObject(new Foo));
 * // => { 'a': 1, 'b': 2, 'c': 3 }
 */
function toPlainObject(value) {
  return _copyObject(value, lodash_es_keysIn(value));
}

/* harmony default export */ const lodash_es_toPlainObject = (toPlainObject);

;// ../../node_modules/lodash-es/_baseMergeDeep.js
















/**
 * A specialized version of `baseMerge` for arrays and objects which performs
 * deep merges and tracks traversed objects enabling objects with circular
 * references to be merged.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {string} key The key of the value to merge.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} mergeFunc The function to merge values.
 * @param {Function} [customizer] The function to customize assigned values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
  var objValue = _safeGet(object, key),
      srcValue = _safeGet(source, key),
      stacked = stack.get(srcValue);

  if (stacked) {
    _assignMergeValue(object, key, stacked);
    return;
  }
  var newValue = customizer
    ? customizer(objValue, srcValue, (key + ''), object, source, stack)
    : undefined;

  var isCommon = newValue === undefined;

  if (isCommon) {
    var isArr = lodash_es_isArray(srcValue),
        isBuff = !isArr && lodash_es_isBuffer(srcValue),
        isTyped = !isArr && !isBuff && lodash_es_isTypedArray(srcValue);

    newValue = srcValue;
    if (isArr || isBuff || isTyped) {
      if (lodash_es_isArray(objValue)) {
        newValue = objValue;
      }
      else if (lodash_es_isArrayLikeObject(objValue)) {
        newValue = _copyArray(objValue);
      }
      else if (isBuff) {
        isCommon = false;
        newValue = _cloneBuffer(srcValue, true);
      }
      else if (isTyped) {
        isCommon = false;
        newValue = _cloneTypedArray(srcValue, true);
      }
      else {
        newValue = [];
      }
    }
    else if (lodash_es_isPlainObject(srcValue) || lodash_es_isArguments(srcValue)) {
      newValue = objValue;
      if (lodash_es_isArguments(objValue)) {
        newValue = lodash_es_toPlainObject(objValue);
      }
      else if (!lodash_es_isObject(objValue) || lodash_es_isFunction(objValue)) {
        newValue = _initCloneObject(srcValue);
      }
    }
    else {
      isCommon = false;
    }
  }
  if (isCommon) {
    // Recursively merge objects and arrays (susceptible to call stack limits).
    stack.set(srcValue, newValue);
    mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
    stack['delete'](srcValue);
  }
  _assignMergeValue(object, key, newValue);
}

/* harmony default export */ const _baseMergeDeep = (baseMergeDeep);

;// ../../node_modules/lodash-es/_baseMerge.js








/**
 * The base implementation of `_.merge` without support for multiple sources.
 *
 * @private
 * @param {Object} object The destination object.
 * @param {Object} source The source object.
 * @param {number} srcIndex The index of `source`.
 * @param {Function} [customizer] The function to customize merged values.
 * @param {Object} [stack] Tracks traversed source values and their merged
 *  counterparts.
 */
function baseMerge(object, source, srcIndex, customizer, stack) {
  if (object === source) {
    return;
  }
  _baseFor(source, function(srcValue, key) {
    stack || (stack = new _Stack);
    if (lodash_es_isObject(srcValue)) {
      _baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
    }
    else {
      var newValue = customizer
        ? customizer(_safeGet(object, key), srcValue, (key + ''), object, source, stack)
        : undefined;

      if (newValue === undefined) {
        newValue = srcValue;
      }
      _assignMergeValue(object, key, newValue);
    }
  }, lodash_es_keysIn);
}

/* harmony default export */ const _baseMerge = (baseMerge);

;// ../../node_modules/lodash-es/_baseRest.js




/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  return _setToString(_overRest(func, start, lodash_es_identity), func + '');
}

/* harmony default export */ const _baseRest = (baseRest);

;// ../../node_modules/lodash-es/_isIterateeCall.js





/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!lodash_es_isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (lodash_es_isArrayLike(object) && _isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return lodash_es_eq(object[index], value);
  }
  return false;
}

/* harmony default export */ const _isIterateeCall = (isIterateeCall);

;// ../../node_modules/lodash-es/_createAssigner.js



/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return _baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && _isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/* harmony default export */ const _createAssigner = (createAssigner);

;// ../../node_modules/lodash-es/merge.js



/**
 * This method is like `_.assign` except that it recursively merges own and
 * inherited enumerable string keyed properties of source objects into the
 * destination object. Source properties that resolve to `undefined` are
 * skipped if a destination value exists. Array and plain object properties
 * are merged recursively. Other objects and value types are overridden by
 * assignment. Source objects are applied from left to right. Subsequent
 * sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object`.
 *
 * @static
 * @memberOf _
 * @since 0.5.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @example
 *
 * var object = {
 *   'a': [{ 'b': 2 }, { 'd': 4 }]
 * };
 *
 * var other = {
 *   'a': [{ 'c': 3 }, { 'e': 5 }]
 * };
 *
 * _.merge(object, other);
 * // => { 'a': [{ 'b': 2, 'c': 3 }, { 'd': 4, 'e': 5 }] }
 */
var merge = _createAssigner(function(object, source, srcIndex) {
  _baseMerge(object, source, srcIndex);
});

/* harmony default export */ const lodash_es_merge = (merge);

;// ../model-operations/dist/esm/restClient.js

const request = async (url, init) => {
    try {
        const headers = {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        };
        const response = await fetch(url, lodash_es_merge(init, {
            headers,
        }));
        if (!response.ok) {
            console.error('API error', await response.text());
            return {
                success: false,
                errorCode: response.status === 401
                    ? 'API_REQUEST_UNAUTHORIZED'
                    : 'API_REQUEST_NOT_OK',
                reason: 'The API has returned failed status.',
                extra: response,
            };
        }
        if (response.headers.has('Content-Type') &&
            response.headers.get('Content-Type').startsWith('application/json') &&
            response.headers.get('Content-Length') !== '0') {
            return {
                success: true,
                value: await response.json(),
            };
        }
        return {
            success: true,
            value: await response.text(),
        };
    }
    catch (e) {
        if (e.name === 'AbortError') {
            return {
                success: false,
                errorCode: 'API_REQUEST_ABORTED',
                reason: 'The request was aboarted by another user operation.',
                extra: e,
            };
        }
        if (e.message === 'Failed to fetch' ||
            e.message === 'Network request failed') {
            return {
                success: false,
                errorCode: 'NETWORK_REQUEST_ERROR',
                reason: 'Network request failed',
                extra: e,
            };
        }
        return {
            success: false,
            errorCode: 'API_REQUEST_UNHANDLED_ERROR',
            reason: 'Un unexpected error has occurred during the request.',
            extra: e,
        };
    }
};

;// ../model-operations/dist/esm/retry.js
/* unused harmony import specifier */ var isError;

const retry = async (func, attempts = 3, delay = 100) => {
    let lastException;
    let lastError;
    for (let i = 1; i <= attempts; i++) {
        try {
            const result = await func();
            if (!isError(result)) {
                return result;
            }
            else {
                lastException = undefined;
                lastError = result;
            }
        }
        catch (e) {
            lastError = undefined;
            lastException = e;
        }
        await new Promise((resolve) => setTimeout(resolve, delay));
    }
    if (lastError) {
        return lastError;
    }
    throw lastException;
};

;// ../model-operations/dist/esm/setStreak.js
/* unused harmony import specifier */ var addDays;

const setStreak = (existingStreak, today, timezone) => {
    if (existingStreak.lastStudyDay === today) {
        return existingStreak;
    }
    if (existingStreak.lastStudyDay === addDays(today, -1)) {
        return {
            days: existingStreak.days + 1,
            longestStreak: Math.max(existingStreak.days + 1, existingStreak.longestStreak),
            lastStudyDay: today,
            lastStudyTimezone: timezone,
        };
    }
    return {
        days: 1,
        longestStreak: Math.max(existingStreak.longestStreak, 1),
        lastStudyDay: today,
        lastStudyTimezone: timezone,
    };
};

;// ../../node_modules/lodash-es/_baseSet.js






/**
 * The base implementation of `_.set`.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {Array|string} path The path of the property to set.
 * @param {*} value The value to set.
 * @param {Function} [customizer] The function to customize path creation.
 * @returns {Object} Returns `object`.
 */
function baseSet(object, path, value, customizer) {
  if (!lodash_es_isObject(object)) {
    return object;
  }
  path = _castPath(path, object);

  var index = -1,
      length = path.length,
      lastIndex = length - 1,
      nested = object;

  while (nested != null && ++index < length) {
    var key = _toKey(path[index]),
        newValue = value;

    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return object;
    }

    if (index != lastIndex) {
      var objValue = nested[key];
      newValue = customizer ? customizer(objValue, key, nested) : undefined;
      if (newValue === undefined) {
        newValue = lodash_es_isObject(objValue)
          ? objValue
          : (_isIndex(path[index + 1]) ? [] : {});
      }
    }
    _assignValue(nested, key, newValue);
    nested = nested[key];
  }
  return object;
}

/* harmony default export */ const _baseSet = (baseSet);

;// ../../node_modules/lodash-es/_basePickBy.js




/**
 * The base implementation of  `_.pickBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @param {Function} predicate The function invoked per property.
 * @returns {Object} Returns the new object.
 */
function basePickBy(object, paths, predicate) {
  var index = -1,
      length = paths.length,
      result = {};

  while (++index < length) {
    var path = paths[index],
        value = _baseGet(object, path);

    if (predicate(value, path)) {
      _baseSet(result, _castPath(path, object), value);
    }
  }
  return result;
}

/* harmony default export */ const _basePickBy = (basePickBy);

;// ../../node_modules/lodash-es/_baseHasIn.js
/**
 * The base implementation of `_.hasIn` without support for deep paths.
 *
 * @private
 * @param {Object} [object] The object to query.
 * @param {Array|string} key The key to check.
 * @returns {boolean} Returns `true` if `key` exists, else `false`.
 */
function baseHasIn(object, key) {
  return object != null && key in Object(object);
}

/* harmony default export */ const _baseHasIn = (baseHasIn);

;// ../../node_modules/lodash-es/_hasPath.js







/**
 * Checks if `path` exists on `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @param {Function} hasFunc The function to check properties.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 */
function hasPath(object, path, hasFunc) {
  path = _castPath(path, object);

  var index = -1,
      length = path.length,
      result = false;

  while (++index < length) {
    var key = _toKey(path[index]);
    if (!(result = object != null && hasFunc(object, key))) {
      break;
    }
    object = object[key];
  }
  if (result || ++index != length) {
    return result;
  }
  length = object == null ? 0 : object.length;
  return !!length && lodash_es_isLength(length) && _isIndex(key, length) &&
    (lodash_es_isArray(object) || lodash_es_isArguments(object));
}

/* harmony default export */ const _hasPath = (hasPath);

;// ../../node_modules/lodash-es/hasIn.js



/**
 * Checks if `path` is a direct or inherited property of `object`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Object
 * @param {Object} object The object to query.
 * @param {Array|string} path The path to check.
 * @returns {boolean} Returns `true` if `path` exists, else `false`.
 * @example
 *
 * var object = _.create({ 'a': _.create({ 'b': 2 }) });
 *
 * _.hasIn(object, 'a');
 * // => true
 *
 * _.hasIn(object, 'a.b');
 * // => true
 *
 * _.hasIn(object, ['a', 'b']);
 * // => true
 *
 * _.hasIn(object, 'b');
 * // => false
 */
function hasIn(object, path) {
  return object != null && _hasPath(object, path, _baseHasIn);
}

/* harmony default export */ const lodash_es_hasIn = (hasIn);

;// ../../node_modules/lodash-es/_basePick.js



/**
 * The base implementation of `_.pick` without support for individual
 * property identifiers.
 *
 * @private
 * @param {Object} object The source object.
 * @param {string[]} paths The property paths to pick.
 * @returns {Object} Returns the new object.
 */
function basePick(object, paths) {
  return _basePickBy(object, paths, function(value, path) {
    return lodash_es_hasIn(object, path);
  });
}

/* harmony default export */ const _basePick = (basePick);

;// ../../node_modules/lodash-es/pick.js



/**
 * Creates an object composed of the picked `object` properties.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The source object.
 * @param {...(string|string[])} [paths] The property paths to pick.
 * @returns {Object} Returns the new object.
 * @example
 *
 * var object = { 'a': 1, 'b': '2', 'c': 3 };
 *
 * _.pick(object, ['a', 'c']);
 * // => { 'a': 1, 'c': 3 }
 */
var pick = _flatRest(function(object, paths) {
  return object == null ? {} : _basePick(object, paths);
});

/* harmony default export */ const lodash_es_pick = (pick);

;// ../srs/dist/esm/getMultiChoice.js
/* unused harmony import specifier */ var get;
/* unused harmony import specifier */ var shuffle;

const posMap = {
    noun: ['noun', 'pronoun'],
    pronoun: ['noun', 'pronoun'],
    adjective: ['adjective', 'adverb'],
    adverb: ['adjective', 'adverb'],
};
const areSynonyms = (a, b) => {
    const aTranslations = a.data.translation.toLowerCase().split(', ');
    const bTranslations = b.data.translation.toLowerCase().split(', ');
    return aTranslations.some((aTranslation) => bTranslations.includes(aTranslation));
};
const getMultiChoice = (card, collection) => {
    if (!card.data.partOfSpeech) {
        return null;
    }
    const allowedPartsOfSpeech = get(posMap, card.data.partOfSpeech, [
        card.data.partOfSpeech,
    ]);
    const candidates = collection.filter((collectionItem) => {
        if (collectionItem.id === card.id) {
            return false;
        }
        if (areSynonyms(card, collectionItem)) {
            return false;
        }
        return allowedPartsOfSpeech.includes(collectionItem.data.partOfSpeech);
    });
    if (candidates.length < 3) {
        return null;
    }
    return shuffle(candidates).slice(0, 3);
};

;// ../srs/dist/esm/craftTheStrategy.js
/* unused harmony import specifier */ var craftTheStrategy_getMultiChoice;
/* unused harmony import specifier */ var isSuitableForArrangingByLetters;
/* unused harmony import specifier */ var spreadStrategy;



const craftTheStrategy = ({ studySteps, card, allCards, prerenderedCards, }) => {
    const multiChoiceItems = craftTheStrategy_getMultiChoice(card, allCards) ?? craftTheStrategy_getMultiChoice(card, prerenderedCards);
    const filteredSteps = studySteps.filter((item) => {
        if (item.type === 'arrange' && !isSuitableForArrangingByLetters(card)) {
            return false;
        }
        if (item.type === 'multichoice' &&
            !card.data.translation &&
            !card.data.definition) {
            return false;
        }
        if (item.type !== 'multichoice') {
            return true;
        }
        if (multiChoiceItems === null) {
            return false;
        }
        return true;
    });
    const swipeStrategy = [
        { step: 'sf', allowedFailures: null },
        { step: 'sb', allowedFailures: null },
    ];
    if (filteredSteps.length === 0) {
        const { currentState } = spreadStrategy(card.data.state, swipeStrategy);
        return {
            strategy: swipeStrategy,
            immediateStep: {
                step: currentState.s === 'sf' || currentState.s === 'sb'
                    ? currentState.s
                    : 'sf',
            },
        };
    }
    // @ts-ignore
    const strategy = filteredSteps.map((item) => {
        switch (item.id) {
            case 'mf':
                return { step: 'mf', allowedFailures: null };
            case 'sf':
                return { step: 'sf', allowedFailures: 0 };
            case 'mb':
                return { step: 'mb', allowedFailures: null };
            case 'ab':
                return { step: 'ab', allowedFailures: null };
            case 'sb':
                return { step: 'sb', allowedFailures: 0 };
            default:
                return { step: 'sf', allowedFailures: 0 };
        }
    });
    const { currentState } = spreadStrategy(card.data.state, strategy);
    return {
        strategy,
        immediateStep: {
            step: currentState.s,
            multiChoice: multiChoiceItems,
        },
    };
};

;// ../srs/dist/esm/grade.js
/* unused harmony import specifier */ var grade_last;
/* unused harmony import specifier */ var buildDueDate;
/* unused harmony import specifier */ var pickNextItemState;
/* unused harmony import specifier */ var isToday;




const stepWeights = {
    sf: 0.8,
    sb: 0.8,
    ab: 0.25,
    mf: 0.25,
    mb: 0.25,
};
const isLastStrategyResponse = (item, studyStrategy) => {
    if (!item.state) {
        return false;
    }
    const lastStep = grade_last(studyStrategy);
    if (!lastStep) {
        return false;
    }
    return lastStep.step === item.state.s;
};
const strongSteps = (/* unused pure expression or super */ null && (['sf', 'sb']));
const grade = (item, score, studyStrategy, createdTimestamp, now = new Date()) => {
    let nextInterval;
    let nextRepetition;
    let nextEFactor;
    let dueDate;
    const todayTs = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
    const daysDifference = Math.round(Math.max(0, item.dueDate - todayTs) / 86_400_000);
    const currentStrategyStep = item.state
        ? item.state.s
        : studyStrategy[0].step;
    const isStrongStep = strongSteps.includes(currentStrategyStep) ||
        !studyStrategy.some((s) => strongSteps.includes(s.step));
    const hasStudiedToday = isToday(item.lastStudied ?? 0, now);
    if (score === 5) {
        // The first cycle is always 1 day
        if (item.repetition < studyStrategy.length - 1) {
            nextInterval = 1;
            nextRepetition = item.repetition + 1;
            dueDate = Math.max(item.dueDate, buildDueDate(1));
            // The last step of first cycle
        }
        else if (item.repetition === studyStrategy.length - 1) {
            nextInterval = Math.max(2, studyStrategy.length - daysDifference);
            dueDate = Math.max(item.dueDate, buildDueDate(nextInterval));
            nextRepetition = item.repetition + 1;
            // Any other day
        }
        else if (item.repetition + 1 >= studyStrategy.length * 2 ||
            isLastStrategyResponse(item, studyStrategy) ||
            (item.repetition + 1) % studyStrategy.length === 0) {
            nextInterval =
                isStrongStep && !hasStudiedToday
                    ? Math.max(item.interval, Math.round(item.interval * item.eFactor) - daysDifference)
                    : item.interval;
            nextRepetition = item.repetition + 1;
            dueDate = isStrongStep
                ? Math.max(item.dueDate, buildDueDate(nextInterval))
                : Math.max(item.dueDate, buildDueDate(1));
            // A day of the second cycle
        }
        else {
            nextInterval = item.interval;
            nextRepetition = item.repetition + 1;
            dueDate = Math.max(item.dueDate, buildDueDate(1));
        }
        nextEFactor =
            isStrongStep && !hasStudiedToday
                ? item.eFactor +
                    (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02)) *
                        (stepWeights[currentStrategyStep] ?? 1)
                : item.eFactor;
    }
    else if (score >= 3) {
        nextInterval = item.interval;
        nextRepetition = item.repetition;
        dueDate = Math.max(item.dueDate, buildDueDate(1));
        nextEFactor =
            item.eFactor + (0.1 - (5 - score) * (0.08 + (5 - score) * 0.02));
    }
    else {
        nextInterval = Math.min(item.interval, 2);
        nextRepetition = item.repetition;
        dueDate = buildDueDate(1);
        nextEFactor = item.eFactor + (0.1 - (5 - 3) * (0.08 + (5 - 3) * 0.02));
    }
    if (nextEFactor < 1.3)
        nextEFactor = 1.3;
    const nextState = pickNextItemState(item, score, studyStrategy);
    let firstStudied = item.firstStudied ?? new Date().getTime();
    // The firstStudied field was introduced way after lastStudied
    // The IF below is the attempt to make "adequate" firstStudied
    if (!item.firstStudied && item.lastStudied) {
        firstStudied = createdTimestamp;
    }
    return {
        repetition: nextRepetition,
        interval: daysDifference <= 1 || item.interval > nextInterval
            ? nextInterval
            : item.interval,
        eFactor: daysDifference <= 1 || item.eFactor > nextEFactor
            ? Math.round(nextEFactor * 100) / 100
            : item.eFactor,
        dueDate: daysDifference <= 1 || item.dueDate > dueDate ? dueDate : item.dueDate,
        state: nextState,
        firstStudied: firstStudied,
        lastStudied: new Date().getTime(),
    };
};

;// ../srs/dist/esm/dueDate.js
const dueDate_buildDueDate = (interval) => {
    const now = new Date();
    return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + interval);
};

;// ../srs/dist/esm/item.js

const INITIAL_INTERVAL = 0;
const INITIAL_REPETITION = 0;
const INITIAL_E_FACTOR = 2.5;
const createSrsItem = () => ({
    interval: INITIAL_INTERVAL,
    repetition: INITIAL_REPETITION,
    eFactor: INITIAL_E_FACTOR,
    dueDate: dueDate_buildDueDate(0),
});

;// ../srs/dist/esm/studyPlan.js
/* unused harmony import specifier */ var byDate;
/* unused harmony import specifier */ var studyPlan_isToday;
/* unused harmony import specifier */ var isNew;



const startOfUtcDay = (date, dayOffset = 0) => Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + dayOffset);
/**
 * Whether the card belongs to the new cards of the plan, as
 * opposed to cards that are due (today or expired).
 */
const isNotStarted = (today) => (item) => item.data.dueDate < startOfUtcDay(today) && isNew(item);
const countNewCardsPickedUpToday = (list, today) => list.filter((item) => item.data.firstStudied !== undefined &&
    studyPlan_isToday(item.data.firstStudied, today)).length;
/**
 * Splits the list into plan sections. `today` holds the cards to study
 * today, picked the same way `slice` picks a session:
 *
 * 1. cards due today,
 * 2. expired cards, most recently due first,
 * 3. new cards, newest first, as long as fewer than
 *    `maxNewCards` were picked up today,
 *
 * up to `maxCards` in total. Due cards that do not fit stay in `expired`,
 * new cards that do not fit stay in `notStarted`. Every card ends up in
 * exactly one section.
 */
const studyPlan = ({ today, list, maxCards, maxNewCards, }) => {
    const todayTs = startOfUtcDay(today);
    const tomorrowTs = startOfUtcDay(today, 1);
    const dueToday = [];
    const expired = [];
    const notStarted = [];
    const tomorrow = [];
    const future = [];
    list.forEach((item) => {
        if (isNew(item)) {
            notStarted.push(item);
        }
        else if (item.data.dueDate === todayTs) {
            dueToday.push(item);
        }
        else if (item.data.dueDate === tomorrowTs) {
            tomorrow.push(item);
        }
        else if (item.data.dueDate > todayTs) {
            future.push(item);
        }
        else {
            expired.push(item);
        }
    });
    dueToday.sort(byDate);
    expired.sort((a, b) => b.data.dueDate - a.data.dueDate);
    notStarted.sort((a, b) => b.created - a.created);
    future.sort((a, b) => a.data.dueDate - b.data.dueDate);
    const limit = Math.max(0, maxCards);
    const due = [...dueToday, ...expired];
    const todayCards = due.slice(0, limit);
    const newCardsAllowance = Math.max(0, Math.min(limit - todayCards.length, maxNewCards - countNewCardsPickedUpToday(list, today)));
    todayCards.unshift(...notStarted.slice(0, newCardsAllowance));
    return {
        today: todayCards,
        expired: due.slice(limit),
        notStarted: notStarted.slice(newCardsAllowance),
        tomorrow,
        future,
    };
};

;// ../srs/dist/esm/slice.js
/* unused harmony import specifier */ var slice_shuffle;
/* unused harmony import specifier */ var slice_studyPlan;
/* unused harmony import specifier */ var slice_isNotStarted;


const STUDY_DELAY_MS = 1_800_000; // 1_800_000 is 30 minutes in milliseconds
const hasStudied = (now) => (item) => {
    if (!item.data.lastStudied) {
        return true;
    }
    return now - item.data.lastStudied > STUDY_DELAY_MS;
};
const slice = (today, maxCards, maxNewCards, list, planSection) => {
    if (list.length === 0) {
        return [];
    }
    const plan = slice_studyPlan({ today, list, maxCards, maxNewCards });
    const now = new Date().getTime();
    if (planSection && plan[planSection]) {
        const candidates = slice_shuffle(plan[planSection].filter(hasStudied(now)));
        if (candidates.length > 0) {
            return candidates.slice(0, maxCards);
        }
        return slice_shuffle(plan[planSection]).slice(0, maxCards);
    }
    if (plan.today.length > 0) {
        // Due cards come in random order, new cards go last
        const notStarted = slice_isNotStarted(today);
        return [
            ...slice_shuffle(plan.today.filter((item) => !notStarted(item))),
            ...plan.today.filter(notStarted),
        ];
    }
    const tomorrowCandidates = slice_shuffle(plan.tomorrow.filter(hasStudied(now)));
    if (tomorrowCandidates.length > 0) {
        return tomorrowCandidates.slice(0, maxCards);
    }
    const futureCards = slice_shuffle(plan.tomorrow).concat(plan.future);
    let futureCandidates = futureCards.filter(hasStudied(now));
    if (futureCandidates.length === 0) {
        futureCandidates = futureCards;
    }
    return futureCandidates.slice(0, maxCards);
};

;// ../srs/dist/esm/studyFlow.js
const defaultStudyFlow = [
    {
        id: 'mf',
        enabled: true,
        type: 'multichoice',
    },
    {
        id: 'sf',
        enabled: true,
        type: 'card',
    },
    {
        id: 'mb',
        enabled: true,
        type: 'multichoice',
    },
    {
        id: 'ab',
        enabled: true,
        type: 'arrange',
    },
    {
        id: 'sb',
        enabled: true,
        type: 'card',
    },
];
const filterStudyFlow = (flow, isPremium) => {
    const excludedPremium = flow.filter((item) => {
        if (item.id === 'ab' && !isPremium) {
            return false;
        }
        return true;
    });
    const filteredFlow = excludedPremium.filter((item) => item.enabled);
    return filteredFlow.length === 0 ? excludedPremium : filteredFlow;
};

;// ../srs/dist/esm/index.js










;// ../model-operations/dist/esm/analysisItemToCard.js



const analysisItemToCard = ({ language, analysisItem, }) => {
    return {
        language,
        source: analysisItem.source,
        ipa: analysisItem.ipa,
        example: join(analysisItem.examples ?? []),
        definition: join(analysisItem.definitions),
        translation: analysisItem.translation,
        partOfSpeech: analysisItem.partOfSpeech ?? '',
        number: analysisItem.number,
        pastTenses: analysisItem.pastTenses,
        presentTenses: analysisItem.presentTenses,
        tense: analysisItem.tense,
        pluralForm: analysisItem.pluralForm,
        tags: [],
        ...lodash_es_pick(analysisItem, ['g', 'frequency']),
        ...createSrsItem(),
    };
};

;// ../model-operations/dist/esm/createTranslationCards.js
/* unused harmony import specifier */ var createTranslationCards_join;
/* unused harmony import specifier */ var createTranslationCards_explode;
/* unused harmony import specifier */ var createTranslationCards_merge;
/* unused harmony import specifier */ var byCard;
/* unused harmony import specifier */ var equalCards;
/* unused harmony import specifier */ var createTranslationCards_analysisItemToCard;




const getCardCandidates = (collection, cardCandidates) => {
    return cardCandidates.map((card) => {
        const existingItem = collection.find(byCard(card));
        if (existingItem === undefined) {
            return {
                data: card,
            };
        }
        return createTranslationCards_merge({ data: card }, existingItem);
    });
};
const combineCards = (acc, card) => {
    const existingIndex = acc.findIndex(equalCards(card));
    if (existingIndex === -1) {
        return [...acc, card];
    }
    return acc.map((existingCard, index) => {
        if (index !== existingIndex) {
            return existingCard;
        }
        return {
            ...existingCard,
            definition: createTranslationCards_join([
                ...createTranslationCards_explode(existingCard.definition),
                ...createTranslationCards_explode(card.definition),
            ]),
        };
    });
};
const createTranslationCards = ({ collection, analysisItems, language, }) => {
    return getCardCandidates(collection, analysisItems
        .map((analysisItem) => createTranslationCards_analysisItemToCard({
        language,
        analysisItem,
    }))
        .reduce(combineCards, []));
};

;// ../model-operations/dist/esm/compareCards.js
const compareCards_equalCards = (a) => (b) => a.source.toLowerCase() === b.source.toLowerCase() &&
    a.partOfSpeech === b.partOfSpeech;
const compareCards_byCard = (card) => (item) => compareCards_equalCards(card)(item.data);

;// ../model-operations/dist/esm/updateDetachedCard.js


const makeUpdateItem = ({ card, data, translationCards }) => (item) => {
    const analysisCard = analysisItemToCard({
        language: translationCards.sourceLanguage,
        analysisItem: item,
    });
    if (compareCards_equalCards(card.data)(analysisCard)) {
        return {
            ...item,
            ...data,
        };
    }
    return item;
};
const updateDetachedCard = ({ translationCards, card, data, }) => {
    const updateItem = makeUpdateItem({ card, data, translationCards });
    return {
        success: true,
        value: {
            ...translationCards,
            items: translationCards.items.map(updateItem),
            extraItems: (translationCards.extraItems ?? []).map(updateItem),
        },
    };
};

;// ../model-operations/dist/esm/cardsToCsv.js
/* unused harmony import specifier */ var cardsToCsv_byDate;
/* unused harmony import specifier */ var cardsToCsv_languageToLexicalaLanguage;


const columnLabels = {
    source: 'Word/Phrase',
    translation: 'Translation',
    partOfSpeech: 'Part of Speech',
    g: 'Gender',
    ipa: 'IPA',
    definition: 'Definition',
    example: 'Example',
    tense: 'Tense',
    presentTenses: 'Present Tenses',
    pastTenses: 'Past Tenses',
    number: 'Number',
    pluralForm: 'Plural Form',
    tags: 'Tags',
};
const cardsToCsv_getValue = (card, column) => {
    if (column === 'tags') {
        return card.data.tags.map((t) => t.data.title).join(', ');
    }
    return card.data[column] ?? '';
};
const getColumns = (cards) => {
    return Object.keys(columnLabels).filter((column) => {
        return cards.some((card) => !!cardsToCsv_getValue(card, column));
    });
};
const prepareColumn = (value, colDelimiter, rowDelimiter) => {
    if (!value.includes('\n') &&
        !value.includes('\t') &&
        !value.includes(colDelimiter) &&
        !value.includes(rowDelimiter)) {
        return value;
    }
    return `"${value.replace(/\"/gm, '""')}"`;
};
const cardsToCsv = ({ cards: c, language, colDelimiter = `\t`, rowDelimiter = `\n`, }) => {
    const isLexicalaLanguage = cardsToCsv_languageToLexicalaLanguage(language) !== null;
    const cards = c.sort(cardsToCsv_byDate).filter((card) => {
        if (isLexicalaLanguage) {
            // Lexicala was disabled on 27/10/2025 at 09:33:44 UTC
            return card.created > 1761557624697;
        }
        return true;
    });
    const lexicalaSkipped = cards.length < c.length;
    const columns = getColumns(cards);
    const csv = [
        columns.map((column) => columnLabels[column]).join(colDelimiter),
        ...cards.map((card) => {
            return columns
                .map((column) => {
                return prepareColumn(cardsToCsv_getValue(card, column), colDelimiter, rowDelimiter);
            })
                .join(colDelimiter);
        }),
    ].join(rowDelimiter);
    return {
        csv,
        lexicalaSkipped,
    };
};

;// ../model-operations/dist/esm/cardToLocationHash.js
/* unused harmony import specifier */ var toLocationHash;

const cardToLocationHash = (card) => {
    return '#' + toLocationHash(`${card.source}-${card.partOfSpeech}`);
};

;// ../model-operations/dist/esm/analysisToTranslationCards.js

/**
 * Combines an analysis with the collection it has to be shown against.
 *
 * A signed out user has no collection, so `deck` defaults to an empty one in
 * the analysis source language: every card comes out as addable.
 */
const analysisToTranslationCards = (analysis, deck = {
    language: analysis.sourceLanguage,
    cards: [],
    tags: [],
}) => ({
    deck,
    explanation: analysis.explanation ?? '',
    source: analysis.source,
    ...(isReverseAnalysis(analysis) ? { target: analysis.target } : {}),
    sourceLanguage: analysis.sourceLanguage,
    targetLanguage: analysis.targetLanguage,
    isDirect: analysis.isDirect,
    detectedInputType: analysis.detectedInputType,
    aiThinksItIs: analysis.aiThinksItIs,
    items: analysis.items,
});

;// ../model-operations/dist/esm/seoPage.js
/* unused harmony import specifier */ var seoPage_isGoogleLanguage;
/* unused harmony import specifier */ var seoPage_languageList;
/* unused harmony import specifier */ var trimLanguage;


const seoLanguagePairToString = ({ sourceLanguage, targetLanguage, }) => `${sourceLanguage}-${targetLanguage}`;
/**
 * Language codes may contain a hyphen themselves (pt-PT, zh-TW), so every
 * hyphen is tried as the separator.
 */
const parseSeoLanguagePair = (pair) => {
    for (let i = pair.indexOf('-'); i !== -1; i = pair.indexOf('-', i + 1)) {
        const sourceLanguage = pair.slice(0, i);
        const targetLanguage = pair.slice(i + 1);
        if (seoPage_isGoogleLanguage(sourceLanguage) && seoPage_isGoogleLanguage(targetLanguage)) {
            return { sourceLanguage, targetLanguage };
        }
    }
    return undefined;
};
const slugify = (text) => text.toLowerCase().replace(/\P{L}/gu, '-');
/**
 * The word as it appears in the page URL ("a bag" → "a-bag"). It is lossy:
 * "a bag" and "a-bag" share it, so the search data is keyed by this slug
 * rather than by the word, from seo/search-data/<pair>.json to the bucket.
 */
const getSeoWordSlug = (word) => slugify(word);
/** The "-in-german" part of the page slug. */
const getSeoLanguageSuffix = (sourceLanguage) => slugify(` in ${trimLanguage(seoPage_languageList[sourceLanguage])}`);
/**
 * The word slug of a page slug ("a-bag-in-german" → "a-bag"), or undefined
 * when the page slug doesn't end with the language of the pair.
 */
const parseSeoPageSlug = (pageSlug, sourceLanguage) => {
    const suffix = getSeoLanguageSuffix(sourceLanguage);
    return pageSlug.endsWith(suffix) && pageSlug.length > suffix.length
        ? pageSlug.slice(0, -suffix.length)
        : undefined;
};
/**
 * The path of the page of a word slug (see getSeoWordSlug) without the
 * leading slash: "a-bag" → "de-en/a-bag-in-german.html".
 */
const getSeoPagePath = (wordSlug, pair) => `${seoLanguagePairToString(pair)}/${wordSlug}${getSeoLanguageSuffix(pair.sourceLanguage)}.html`;
const getSeoPageName = (word, sourceLanguage) => `"${word}" in ${trimLanguage(seoPage_languageList[sourceLanguage])}`;

;// ../model-operations/dist/esm/index.js


















;// ../api/dist/esm/config.js
let apiOptions = {
    publicBaseUrl: '',
    baseUrl: '',
    region: '',
    cardsBucket: '',
    getJwtToken: () => Promise.resolve(''),
};
const configureApi = (options) => {
    apiOptions = options;
};

;// ../api/dist/esm/restClient.js



const restClient_request = async (url, init) => {
    const token = await apiOptions.getJwtToken();
    let headers = {
        Authorization: `Bearer ${token}`,
    };
    let result = await request(apiOptions.baseUrl + url, lodash_es_merge(init, {
        headers,
    }));
    if (!result.success && result.errorCode === 'API_REQUEST_UNAUTHORIZED') {
        console.warn(`API_REQUEST_UNAUTHORIZED, retrying in 2 seconds...`, {
            tokenLength: token.length,
            result,
        });
        await new Promise((resolve) => setTimeout(resolve, 2000));
        headers = {
            Authorization: `Bearer ${await apiOptions.getJwtToken()}`,
        };
        result = await request(apiOptions.baseUrl + url, lodash_es_merge(init, {
            headers,
        }));
        console.debug('retry result', result);
    }
    if (!result.success && apiOptions.onError) {
        apiOptions.onError(result);
    }
    return result;
};

;// ../api/dist/esm/analyze.js

const analyze = async (payload, abortController) => {
    try {
        return await restClient_request('/analyze', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/analyzeUnitsOfSpeech.js
/* unused harmony import specifier */ var analyzeUnitsOfSpeech_request;

const analyzeUnitsOfSpeech = async (payload, abortController) => {
    try {
        return await analyzeUnitsOfSpeech_request('/analyze-units-of-speech', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/bulkAnalyze.js
/* unused harmony import specifier */ var bulkAnalyze_request;

const bulkAnalyze = async (payload, abortController) => {
    if (payload.sources.length === 0) {
        return {
            success: true,
            value: {
                sourceLanguage: payload.sourceLanguage,
                analysis: [],
            },
        };
    }
    try {
        return await bulkAnalyze_request('/bulk-analyze', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/chat-with-card.js
/* unused harmony import specifier */ var chat_with_card_request;

const chatWithCard = async (payload, abortController) => {
    try {
        return await chat_with_card_request('/chat-with-card', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            reason: 'The chat with card request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/explain.js

const explain = async (payload, abortController) => {
    try {
        return await restClient_request('/explain', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/generateUnitsOfSpeech.js
/* unused harmony import specifier */ var generateUnitsOfSpeech_request;

const generateUnitsOfSpeech = async (payload, abortController) => {
    try {
        return await generateUnitsOfSpeech_request('/generate-units-of-speech', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

// EXTERNAL MODULE: ../../node_modules/fast-xml-parser/src/fxp.js
var fxp = __webpack_require__(2763);
;// ../api/dist/esm/languageDecks.js
/* unused harmony import specifier */ var languageDecks_request;



const parser = new fxp.XMLParser();
const saveLanguageDeck = async (languageDeck) => {
    try {
        return await restClient_request(`/languages/${languageDeck.language}`, {
            method: 'PUT',
            body: JSON.stringify(serializeDeck(languageDeck)),
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'LANGUAGE_DECK_SAVE_ERROR',
            reason: 'An error during the saving of a language deck has occurred.',
            extra: e,
        };
    }
};
const loadLanguageDeck = async (language) => {
    try {
        const result = await restClient_request(`/languages/${language}`, {
            method: 'GET',
        });
        if (result.success === false) {
            return result;
        }
        if (!result.value) {
            return {
                success: true,
                value: {
                    language,
                    cards: [],
                    tags: [],
                    settings: {},
                },
            };
        }
        return {
            ...result,
            value: deserializeDeck(result.value),
        };
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'LANGUAGE_DECK_LOAD_ERROR',
            reason: 'An error during the loading of a language deck has occurred.',
            extra: e,
        };
    }
};
const listLanguages = async () => {
    try {
        const result = await restClient_request(`/languages`, {
            method: 'GET',
        });
        if (result.success === false) {
            return result;
        }
        const jsonResult = parser.parse(result.value);
        let contents = jsonResult?.ListBucketResult?.Contents ?? [];
        if (!Array.isArray(contents)) {
            contents = [contents];
        }
        const languages = contents
            .map((r) => r.Key)
            .map((fileName) => fileName.split('/').pop());
        return {
            success: true,
            value: languages,
        };
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'LANGUAGE_DECKS_LIST_ERROR',
            reason: 'An error during the retrieving of available language decks has occurred.',
            extra: e,
        };
    }
};
const deleteLanguageDeck = async (language) => {
    try {
        return await languageDecks_request(`/languages/${language}`, {
            method: 'DELETE',
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'LANGUAGE_DECK_DELETE_ERROR',
            reason: 'An error during the deletion of a language deck has occurred.',
            extra: e,
        };
    }
};
const deleteTag = async (language, id) => {
    const loadResult = await loadLanguageDeck(language);
    if (loadResult.success === false) {
        return loadResult;
    }
    const newDeck = {
        ...loadResult.value,
        cards: loadResult.value.cards.map((card) => {
            if (!card.data.tags) {
                return card;
            }
            return {
                ...card,
                data: {
                    ...card.data,
                    tags: card.data.tags.filter((tag) => tag.id !== id),
                },
            };
        }),
        tags: (loadResult.value.tags ?? []).filter((tagItem) => tagItem.id !== id),
    };
    const saveResult = await saveLanguageDeck(newDeck);
    if (saveResult.success === false) {
        return saveResult;
    }
    return {
        success: true,
        value: newDeck,
    };
};
const updateTag = async (language, tag) => {
    const loadResult = await loadLanguageDeck(language);
    if (loadResult.success === false) {
        return loadResult;
    }
    const newDeck = {
        ...loadResult.value,
        cards: loadResult.value.cards.map((card) => {
            if (!card.data.tags) {
                return card;
            }
            return {
                ...card,
                data: {
                    ...card.data,
                    tags: card.data.tags.map((cardTag) => cardTag.id === tag.id ? tag : cardTag),
                },
            };
        }),
        tags: (loadResult.value.tags ?? []).map((tagItem) => tagItem.id === tag.id ? tag : tagItem),
    };
    const saveResult = await saveLanguageDeck(newDeck);
    if (saveResult.success === false) {
        return saveResult;
    }
    return {
        success: true,
        value: newDeck,
    };
};

;// ../api/dist/esm/notifications.js
/* unused harmony import specifier */ var notifications_request;

const getNotificationTime = async (language) => {
    try {
        return await notifications_request('/notification-time?' +
            new URLSearchParams({
                language,
            }), {
            method: 'GET',
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'NOTIFICATION_TIME_REQUEST_FAILED',
            reason: 'Get notification time request failed.',
            extra: e,
        };
    }
};
const setNotificationTime = async (payload, abortController) => {
    try {
        return await notifications_request('/notification-time', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'NOTIFICATION_TIME_REQUEST_FAILED',
            reason: 'Set notification time request failed.',
            extra: e,
        };
    }
};
const deleteNotificationTime = async (language, abortController) => {
    try {
        return await notifications_request('/notification-time?' +
            new URLSearchParams({
                language,
            }), {
            method: 'DELETE',
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'NOTIFICATION_TIME_REQUEST_FAILED',
            reason: 'Delete notification time request failed.',
            extra: e,
        };
    }
};
const recalibrateNotifications = async (payload) => {
    try {
        return await notifications_request('/recalibrate-notifications', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'RECALIBRATE_NOTIFICATIONS_REQUEST_FAILED',
            reason: 'Recalibrate notification request failed.',
            extra: e,
        };
    }
};
const registerPushToken = async (payload) => {
    try {
        return await notifications_request('/push-token', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'REGISTER_PUSH_TOKEN_REQUEST_FAILED',
            reason: 'Register push token request failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/onboarding.js

const postOnboardingAction = async (action) => {
    return await restClient_request('/onboard', {
        method: 'POST',
        body: JSON.stringify(action),
    });
};

;// ../api/dist/esm/playSound.js
/* unused harmony import specifier */ var playSound_request;

const playSound = async (payload) => {
    try {
        return await playSound_request('/audio?' + new URLSearchParams(payload), {
            method: 'GET',
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicRestClient.js


const publicRequest = async (url, init) => {
    return request(apiOptions.publicBaseUrl + url, init);
};

;// ../api/dist/esm/publicAnalyze.js

const publicAnalyze = async (payload, abortController) => {
    try {
        return await publicRequest('/analyze', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_ANALYZE_REQUEST_FAILED',
            reason: 'The analyze request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicAnalyzeUnitsOfSpeech.js

const publicAnalyzeUnitsOfSpeech = async (payload, abortController) => {
    try {
        return await publicRequest('/analyze-units-of-speech', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_ANALYZE_UNITS_OF_SPEECH_REQUEST_FAILED',
            reason: 'The analyze units of speech request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicChatWithCard.js
/* unused harmony import specifier */ var publicChatWithCard_publicRequest;

const publicChatWithCard = async (payload, abortController) => {
    try {
        return await publicChatWithCard_publicRequest('/chat-with-card', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_CHAT_WITH_CARD_REQUEST_FAILED',
            reason: 'The chat with card request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicGenerateUnitsOfSpeech.js
/* unused harmony import specifier */ var publicGenerateUnitsOfSpeech_publicRequest;

const publicGenerateUnitsOfSpeech = async (payload, abortController) => {
    try {
        return await publicGenerateUnitsOfSpeech_publicRequest('/generate-units-of-speech', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_GENERATE_UNITS_OF_SPEECH_REQUEST_FAILED',
            reason: 'The generate units of speech request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicPlaySound.js
/* unused harmony import specifier */ var publicPlaySound_publicRequest;

const publicPlaySound = async (payload) => {
    try {
        return await publicPlaySound_publicRequest('/audio?' + new URLSearchParams(payload), {
            method: 'GET',
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_PLAY_SOUND_REQUEST_FAILED',
            reason: 'Play sound request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicStaticFile.js
/* unused harmony import specifier */ var httpRequest;
/* unused harmony import specifier */ var publicStaticFile_apiOptions;


const publicStaticFile = async (file, abortController) => {
    try {
        return await httpRequest(`${publicStaticFile_apiOptions.baseUrl}/public-static-files/${file}`, {
            method: 'GET',
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_STATIC_FILE_REQUEST_FAILED',
            reason: 'The analyze request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicPredefinedOptions.js
/* unused harmony import specifier */ var publicPredefinedOptions_isArray;
/* unused harmony import specifier */ var publicPredefinedOptions_isString;
/* unused harmony import specifier */ var publicPredefinedOptions_publicRequest;
/* unused harmony import specifier */ var publicPredefinedOptions_publicStaticFile;
/* unused harmony import specifier */ var parseJson;




const publicPredefinedOptionsApiRequest = async (sourceLanguage, targetLanguage, abortController) => {
    try {
        const searchParams = new URLSearchParams({
            sourceLanguage,
            targetLanguage,
        });
        return await publicPredefinedOptions_publicRequest(`/predefined-options?${searchParams.toString()}`, {
            method: 'GET',
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_PREDEFINED_OPTIONS_REQUEST_FAILED',
            reason: 'The predefined options request has failed.',
            extra: e,
        };
    }
};
const publicPredefinedOptions = async (sourceLanguage, targetLanguage, abortController) => {
    const staticFileResult = await publicPredefinedOptions_publicStaticFile(`predefined-options/${sourceLanguage}-${targetLanguage}.json`, abortController);
    if (staticFileResult.success) {
        if (publicPredefinedOptions_isArray(staticFileResult.value)) {
            return staticFileResult;
        }
        if (publicPredefinedOptions_isString(staticFileResult.value)) {
            const parseResult = parseJson(staticFileResult.value);
            if (parseResult.success && publicPredefinedOptions_isArray(parseResult.value))
                return {
                    success: true,
                    value: parseResult.value,
                };
        }
    }
    return publicPredefinedOptionsApiRequest(sourceLanguage, targetLanguage, abortController);
};

;// ../api/dist/esm/publicUserFeedback.js
/* unused harmony import specifier */ var publicUserFeedback_publicRequest;

const sendPublicUserFeedback = async (payload) => {
    try {
        return await publicUserFeedback_publicRequest('/feedback', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'USER_FEEDBACK_REQUEST_FAILED',
            reason: 'The user feedback request failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/studyStats.js
/* unused harmony import specifier */ var studyStats_defaultStudyStreak;
/* unused harmony import specifier */ var studyStats_request;


const fetchStudyStreak = async () => {
    const response = await studyStats_request('/files/study-streak.json', {
        method: 'GET',
    });
    if (response.success === false) {
        return response;
    }
    return {
        success: true,
        value: response.value || studyStats_defaultStudyStreak,
    };
};
const putStudyStreak = async (studyStreak) => {
    const saveResult = await studyStats_request('/files/study-streak.json', {
        method: 'PUT',
        body: JSON.stringify(studyStreak),
    });
    if (!saveResult.success) {
        return saveResult;
    }
    return {
        success: true,
        value: null,
    };
};

;// ../api/dist/esm/userFeedback.js
/* unused harmony import specifier */ var userFeedback_request;

const sendUserFeedback = async (payload) => {
    try {
        return await userFeedback_request('/feedback', {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'USER_FEEDBACK_REQUEST_FAILED',
            reason: 'The user feedback request failed.',
            extra: e,
        };
    }
};

;// ../../node_modules/lodash-es/isString.js




/** `Object#toString` result references. */
var isString_stringTag = '[object String]';

/**
 * Checks if `value` is classified as a `String` primitive or object.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a string, else `false`.
 * @example
 *
 * _.isString('abc');
 * // => true
 *
 * _.isString(1);
 * // => false
 */
function isString_isString(value) {
  return typeof value == 'string' ||
    (!lodash_es_isArray(value) && lodash_es_isObjectLike(value) && _baseGetTag(value) == isString_stringTag);
}

/* harmony default export */ const lodash_es_isString = (isString_isString);

;// ../api/dist/esm/parseJson.js
const parseJson_parseJson = (text) => {
    try {
        return {
            success: true,
            value: JSON.parse(text),
        };
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'JSON_PARSE_ERROR',
            reason: 'Unable to parse the JSON string',
            extra: {
                error: e,
                text,
            },
        };
    }
};

;// ../api/dist/esm/userMetadata.js




const getUserMetadata = async () => {
    const response = await restClient_request('/files/metadata.json', {
        method: 'GET',
    });
    if (response.success === false) {
        return response;
    }
    let responseJson = response.value;
    if (lodash_es_isString(responseJson)) {
        const parseJsonResult = parseJson_parseJson(responseJson || '{}');
        if (parseJsonResult.success === false) {
            return parseJsonResult;
        }
        responseJson = parseJsonResult.value;
    }
    return {
        success: true,
        value: mapUserMetadata(responseJson),
    };
};
const saveUserMetadata = async (metadata) => {
    const userMetadataResult = await getUserMetadata();
    if (userMetadataResult.success === false) {
        return userMetadataResult;
    }
    const toBeSaved = mergeUserMetadata(userMetadataResult.value, {
        ...metadata,
        lastUpdated: new Date().getTime(),
    });
    const saveResult = await restClient_request('/files/metadata.json', {
        method: 'PUT',
        body: JSON.stringify(toBeSaved),
    });
    if (!saveResult.success) {
        return saveResult;
    }
    return {
        success: true,
        value: toBeSaved,
    };
};

;// ../api/dist/esm/userStaticMetadata.js




const getUserStaticMetadata = async () => {
    const response = await restClient_request('/static-files/static-metadata.json', {
        method: 'GET',
    });
    if (response.success === false) {
        return response;
    }
    let responseJson = response.value;
    if (lodash_es_isString(responseJson)) {
        if (responseJson.length > 0) {
            const parseJsonResult = parseJson_parseJson(responseJson || '{}');
            if (parseJsonResult.success === false) {
                return parseJsonResult;
            }
            responseJson = parseJsonResult.value;
        }
        else {
            responseJson = {};
        }
    }
    return {
        success: true,
        value: mapUserStaticMetadata(responseJson),
    };
};

;// ../api/dist/esm/publicExplain.js

const publicExplain = async (payload, abortController) => {
    try {
        return await publicRequest('/explain', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_TRANSLATION_REQUEST_FAILED',
            reason: 'The translation request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/publicFixGrammar.js
/* unused harmony import specifier */ var publicFixGrammar_publicRequest;

const publicFixGrammar = async (payload, abortController) => {
    try {
        return await publicFixGrammar_publicRequest('/fix-grammar', {
            method: 'POST',
            body: JSON.stringify(payload),
            signal: abortController?.signal,
        });
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'API_PUBLIC_FIX_GRAMMAR_REQUEST_FAILED',
            reason: 'The fix-grammar request has failed.',
            extra: e,
        };
    }
};

;// ../api/dist/esm/tts.js


const tts = async (baseUrl, payload, abortController) => {
    const response = await request(baseUrl + '/tts', {
        method: 'POST',
        body: JSON.stringify(payload),
        signal: abortController?.signal,
    });
    if (response.success === false) {
        return response;
    }
    if (!isTTSResponse(response.value)) {
        return {
            success: false,
            reason: 'The TTS response is invalid.',
            errorCode: 'TTS_ERROR',
            extra: response.value,
        };
    }
    return response;
};

;// ../api/dist/esm/index.js




























;// ../../node_modules/nanoid/index.browser.js



let random = bytes => crypto.getRandomValues(new Uint8Array(bytes))

let customRandom = (alphabet, defaultSize, getRandom) => {
  let mask = (2 << (Math.log(alphabet.length - 1) / Math.LN2)) - 1



  let step = -~((1.6 * mask * defaultSize) / alphabet.length)

  return (size = defaultSize) => {
    if (size <= 0) return ''
    let id = ''
    while (true) {
      let bytes = getRandom(step)
      let j = step | 0
      while (j--) {
        id += alphabet[bytes[j] & mask] || ''
        if (id.length === size) return id
      }
    }
  }
}

let customAlphabet = (alphabet, size = 21) =>
  customRandom(alphabet, size, random)

let nanoid = (size = 21) =>
  crypto.getRandomValues(new Uint8Array(size)).reduce((id, byte) => {
    byte &= 63
    if (byte < 36) {
      id += byte.toString(36)
    } else if (byte < 62) {
      id += (byte - 26).toString(36).toUpperCase()
    } else if (byte > 62) {
      id += '-'
    } else {
      id += '_'
    }
    return id
  }, '')



;// ../crud/dist/esm/index.js

const byId = (id) => (item) => {
    return item.id === id;
};
const makeCreate = (collection) => (data) => {
    const now = +new Date();
    const item = {
        id: nanoid(5),
        created: now,
        data,
    };
    collection.push(item);
    return item;
};
const makeUpdate = (collection) => (id, data) => {
    const itemToUpdate = collection.find(byId(id));
    if (itemToUpdate === undefined) {
        return {
            success: false,
            errorCode: 'CRUD_UNABLE_TO_FIND_ITEM',
            reason: `Unable to find item with ID ${id}`,
        };
    }
    itemToUpdate.updated = +new Date();
    itemToUpdate.data = {
        ...itemToUpdate.data,
        ...data,
    };
    return {
        success: true,
        value: itemToUpdate,
    };
};
const makeDelete = (collection) => (id) => {
    const index = collection.findIndex(byId(id));
    if (index === -1) {
        return {
            success: false,
            errorCode: 'CRUD_UNABLE_TO_FIND_ITEM',
            reason: `Unable to find item with ID ${id}`,
        };
    }
    collection.splice(index, 1);
    return {
        success: true,
        value: true,
    };
};
const makeRestore = (collection) => (item) => {
    const index = collection.findIndex(byId(item.id));
    if (index !== -1) {
        return {
            success: false,
            errorCode: 'CRUD_ITEM_EXISTS',
            reason: `Item with ID ${item.id} already exists`,
        };
    }
    collection.push(item);
    return {
        success: true,
        value: true,
    };
};
const isItem = (value) => {
    return value['id'] && value['created'] && value['data'];
};

;// ../../node_modules/@vocably/hermes/dist/esm/index.js
let browserEnv;
if (typeof chrome !== 'undefined') {
    browserEnv = chrome;
    // @ts-ignore
}
else if (typeof browser !== 'undefined') {
    // @ts-ignore
    browserEnv = browser;
}
const makeSend = (identifier) => (data, extensionId) => {
    return new Promise((resolve, reject) => {
        if (!browserEnv) {
            reject('browserEnv environment is not defined');
            return;
        }
        if (!browserEnv.runtime) {
            reject('browserEnv.runtime is not defined defined');
            return;
        }
        const sendParams = [
            { identifier, data },
            (response) => {
                if (browserEnv.runtime.lastError) {
                    return reject(browserEnv.runtime.lastError);
                }
                resolve(response);
            },
        ];
        if (extensionId) {
            sendParams.unshift(extensionId);
        }
        browserEnv.runtime.sendMessage(...sendParams);
    });
};
const makeListener = (identifier, callback) => (request, sender, nativeSendResponse) => {
    if (typeof request !== 'object' ||
        request === null ||
        request.identifier !== identifier) {
        return;
    }
    const data = request.data;
    const sendResponse = (r) => {
        nativeSendResponse(r);
        return r;
    };
    callback(sendResponse, data);
    return true;
};
const createMessage = (identifier) => {
    const subscribe = (callback) => {
        browserEnv.runtime.onMessage.addListener(makeListener(identifier, callback));
    };
    return [makeSend(identifier), subscribe];
};
const createExternalMessage = (identifier) => {
    const send = makeSend(identifier);
    const subscribe = (callback) => {
        browserEnv.runtime.onMessageExternal.addListener(makeListener(identifier, callback));
    };
    return [
        (extensionId, data) => send(data, extensionId),
        subscribe,
    ];
};

;// ../extension-messages/dist/esm/index.js

const createScope = (scope) => (identifier) => createMessage(`${scope}.${identifier}`);
const createScopedMessage = createScope('vocably');
const [isLoggedIn, onIsLoggedInRequest] = createScopedMessage('isLoggedIn');
const [getSettings, onGetSettingsRequest] = createScopedMessage('getSettings');
const [setSettings, onSetSettingsRequest] = createScopedMessage('setSettings');
const [getSettingsExternal, onGetSettingsExternalRequest] = createExternalMessage('vocably.getSettingsExternal');
const [setSettingsExternal, onSetSettingsExternalRequest] = createExternalMessage('vocably.setSettingsExternal');
const [isActive, onIsActiveRequest] = createScopedMessage('isActive');
const [esm_isEligibleForTrial, onIsEligibleForTrialRequest] = createScopedMessage('isEligibleForTrial');
const [getCardsLimit, onGetCardsLimitRequest] = createScopedMessage('getCardsLimit');
const [getUserEmail, onGetUserEmail] = createScopedMessage('getUserEmail');
const [esm_analyze, onAnalyzeRequest] = createScopedMessage('analyze');
const [esm_explain, onExplainRequest] = createScopedMessage('explain');
const [removeCard, onRemoveCardRequest] = createScopedMessage('removeCard');
const [addCard, onAddCardRequest] = createScopedMessage('addCard');
const [esm_listLanguages, onListLanguagesRequest] = createScopedMessage('listLanguages');
const [listTargetLanguages, onListTargetLanguagesRequest] = createScopedMessage('listTargetLanguages');
const [getLocationLanguage, onGetLocationLanguageRequest] = createScopedMessage('getLocationLanguage');
const [saveLocationLanguage, onSaveLocationLanguageRequest] = createScopedMessage('saveLocationLanguage');
const [getLanguagePairs, onGetLanguagePairs] = createScopedMessage('getLanguagePairs');
const [getExternalLanguagePairs, onGetExternalLanguagePairs] = createExternalMessage('vocably.getExternalLanguagePairs');
const [setExternalLanguagePairs, onSetExternalLanguagePairs] = createExternalMessage('vocably.setExternalLanguagePairs');
const [ping, onPing] = createScopedMessage('ping');
const [getInternalProxyLanguage, onGetInternalProxyLanuage] = createScopedMessage('getInternalProxyLanguage');
const [setInternalProxyLanguage, onSetInternalProxyLanguage] = createScopedMessage('setInternalProxyLanguage');
const [getInternalSourceLanguage, onGetInternalSourceLanguage] = createScopedMessage('getInternalSourceLanguage');
const [setInternalSourceLanguage, onSetInternalSourceLanguage] = createScopedMessage('setInternalSourceLanguage');
const [isUserKnowsHowToAdd, onIsUserKnowsHowToAdd] = createScopedMessage('isUserKnowsHowToAdd');
const [setUserKnowsHowToAdd, onSetUserKnowsHowToAdd] = createScopedMessage('setUserKnowsHowToAdd');
const [pingExternal, onPingExternal] = createExternalMessage('vocably.ping-external');
const [setProxyLanguage, onSetProxyLanguage] = createExternalMessage('vocably.setProxyLanguage');
const [getProxyLanguage, onGetProxyLanguage] = createExternalMessage('vocably.getProxyLanguage');
const [setSourceLanguage, onSetSourceLanguage] = createExternalMessage('vocably.setSourceLanguage');
const [getSourceLanguage, onGetSourceLanguage] = createExternalMessage('vocably.getSourceLanguage');
const [getAudioPronunciation, onGetAudioPronunciation] = createScopedMessage('getAudioPronunciation');
const [askForRating, onAskForRating] = createScopedMessage('askForRating');
const [saveAskForRatingResponse, onSaveAskForRatingResponse] = createScopedMessage('askForRatingResponse');
const [playAudioPronunciation, onPlayAudioPronunciation] = createScopedMessage('playAudioPronunciation');
const [playAudioPronunciationOffscreen, onPlayAudioPronunciationOffscreen,] = createScopedMessage('playAudioPronunciationOffscreen');
const [canPlayOffScreen, onCanPlayOffScreen] = createScopedMessage('canPlayOffScreen');
const [updateCard, onUpdateCard] = createScopedMessage('updateCard');
const [attachTag, onAttachTag] = createScopedMessage('attachTag');
const [detachTag, onDetachTag] = createScopedMessage('detachTag');
const [esm_updateTag, onUpdateTag] = createScopedMessage('updateTag');
const [esm_deleteTag, onDeleteTag] = createScopedMessage('deleteTag');
const [esm_analyzeUnitsOfSpeech, onAnalyzeUnitsOfSpeech] = createScopedMessage('analyzeUnitsOfSpeech');
const [esm_loadLanguageDeck, onLoadLanguageDeck] = createScopedMessage('loadLanguageDeck');
const [qualityVote, onQualityVote] = createScopedMessage('qualityVote');
const [sendAnalyticsCapture, onAnalyticsCapture] = createScopedMessage('analyticsCapture');
const analyticsCapture = (event, properties) => sendAnalyticsCapture({ event, properties });


;// ../../node_modules/lodash-es/_setCacheAdd.js
/** Used to stand-in for `undefined` hash values. */
var _setCacheAdd_HASH_UNDEFINED = '__lodash_hash_undefined__';

/**
 * Adds `value` to the array cache.
 *
 * @private
 * @name add
 * @memberOf SetCache
 * @alias push
 * @param {*} value The value to cache.
 * @returns {Object} Returns the cache instance.
 */
function setCacheAdd(value) {
  this.__data__.set(value, _setCacheAdd_HASH_UNDEFINED);
  return this;
}

/* harmony default export */ const _setCacheAdd = (setCacheAdd);

;// ../../node_modules/lodash-es/_setCacheHas.js
/**
 * Checks if `value` is in the array cache.
 *
 * @private
 * @name has
 * @memberOf SetCache
 * @param {*} value The value to search for.
 * @returns {number} Returns `true` if `value` is found, else `false`.
 */
function setCacheHas(value) {
  return this.__data__.has(value);
}

/* harmony default export */ const _setCacheHas = (setCacheHas);

;// ../../node_modules/lodash-es/_SetCache.js




/**
 *
 * Creates an array cache object to store unique values.
 *
 * @private
 * @constructor
 * @param {Array} [values] The values to cache.
 */
function SetCache(values) {
  var index = -1,
      length = values == null ? 0 : values.length;

  this.__data__ = new _MapCache;
  while (++index < length) {
    this.add(values[index]);
  }
}

// Add methods to `SetCache`.
SetCache.prototype.add = SetCache.prototype.push = _setCacheAdd;
SetCache.prototype.has = _setCacheHas;

/* harmony default export */ const _SetCache = (SetCache);

;// ../../node_modules/lodash-es/_baseFindIndex.js
/**
 * The base implementation of `_.findIndex` and `_.findLastIndex` without
 * support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} predicate The function invoked per iteration.
 * @param {number} fromIndex The index to search from.
 * @param {boolean} [fromRight] Specify iterating from right to left.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseFindIndex(array, predicate, fromIndex, fromRight) {
  var length = array.length,
      index = fromIndex + (fromRight ? 1 : -1);

  while ((fromRight ? index-- : ++index < length)) {
    if (predicate(array[index], index, array)) {
      return index;
    }
  }
  return -1;
}

/* harmony default export */ const _baseFindIndex = (baseFindIndex);

;// ../../node_modules/lodash-es/_baseIsNaN.js
/**
 * The base implementation of `_.isNaN` without support for number objects.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is `NaN`, else `false`.
 */
function baseIsNaN(value) {
  return value !== value;
}

/* harmony default export */ const _baseIsNaN = (baseIsNaN);

;// ../../node_modules/lodash-es/_strictIndexOf.js
/**
 * A specialized version of `_.indexOf` which performs strict equality
 * comparisons of values, i.e. `===`.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function strictIndexOf(array, value, fromIndex) {
  var index = fromIndex - 1,
      length = array.length;

  while (++index < length) {
    if (array[index] === value) {
      return index;
    }
  }
  return -1;
}

/* harmony default export */ const _strictIndexOf = (strictIndexOf);

;// ../../node_modules/lodash-es/_baseIndexOf.js




/**
 * The base implementation of `_.indexOf` without `fromIndex` bounds checks.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {*} value The value to search for.
 * @param {number} fromIndex The index to search from.
 * @returns {number} Returns the index of the matched value, else `-1`.
 */
function baseIndexOf(array, value, fromIndex) {
  return value === value
    ? _strictIndexOf(array, value, fromIndex)
    : _baseFindIndex(array, _baseIsNaN, fromIndex);
}

/* harmony default export */ const _baseIndexOf = (baseIndexOf);

;// ../../node_modules/lodash-es/_arrayIncludes.js


/**
 * A specialized version of `_.includes` for arrays without support for
 * specifying an index to search from.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludes(array, value) {
  var length = array == null ? 0 : array.length;
  return !!length && _baseIndexOf(array, value, 0) > -1;
}

/* harmony default export */ const _arrayIncludes = (arrayIncludes);

;// ../../node_modules/lodash-es/_arrayIncludesWith.js
/**
 * This function is like `arrayIncludes` except that it accepts a comparator.
 *
 * @private
 * @param {Array} [array] The array to inspect.
 * @param {*} target The value to search for.
 * @param {Function} comparator The comparator invoked per element.
 * @returns {boolean} Returns `true` if `target` is found, else `false`.
 */
function arrayIncludesWith(array, value, comparator) {
  var index = -1,
      length = array == null ? 0 : array.length;

  while (++index < length) {
    if (comparator(value, array[index])) {
      return true;
    }
  }
  return false;
}

/* harmony default export */ const _arrayIncludesWith = (arrayIncludesWith);

;// ../../node_modules/lodash-es/_cacheHas.js
/**
 * Checks if a `cache` value for `key` exists.
 *
 * @private
 * @param {Object} cache The cache to query.
 * @param {string} key The key of the entry to check.
 * @returns {boolean} Returns `true` if an entry for `key` exists, else `false`.
 */
function cacheHas(cache, key) {
  return cache.has(key);
}

/* harmony default export */ const _cacheHas = (cacheHas);

;// ../../node_modules/lodash-es/noop.js
/**
 * This method returns `undefined`.
 *
 * @static
 * @memberOf _
 * @since 2.3.0
 * @category Util
 * @example
 *
 * _.times(2, _.noop);
 * // => [undefined, undefined]
 */
function noop() {
  // No operation performed.
}

/* harmony default export */ const lodash_es_noop = (noop);

;// ../../node_modules/lodash-es/_setToArray.js
/**
 * Converts `set` to an array of its values.
 *
 * @private
 * @param {Object} set The set to convert.
 * @returns {Array} Returns the values.
 */
function setToArray(set) {
  var index = -1,
      result = Array(set.size);

  set.forEach(function(value) {
    result[++index] = value;
  });
  return result;
}

/* harmony default export */ const _setToArray = (setToArray);

;// ../../node_modules/lodash-es/_createSet.js




/** Used as references for various `Number` constants. */
var _createSet_INFINITY = 1 / 0;

/**
 * Creates a set object of `values`.
 *
 * @private
 * @param {Array} values The values to add to the set.
 * @returns {Object} Returns the new set.
 */
var createSet = !(_Set && (1 / _setToArray(new _Set([,-0]))[1]) == _createSet_INFINITY) ? lodash_es_noop : function(values) {
  return new _Set(values);
};

/* harmony default export */ const _createSet = (createSet);

;// ../../node_modules/lodash-es/_baseUniq.js







/** Used as the size to enable large array optimizations. */
var _baseUniq_LARGE_ARRAY_SIZE = 200;

/**
 * The base implementation of `_.uniqBy` without support for iteratee shorthands.
 *
 * @private
 * @param {Array} array The array to inspect.
 * @param {Function} [iteratee] The iteratee invoked per element.
 * @param {Function} [comparator] The comparator invoked per element.
 * @returns {Array} Returns the new duplicate free array.
 */
function baseUniq(array, iteratee, comparator) {
  var index = -1,
      includes = _arrayIncludes,
      length = array.length,
      isCommon = true,
      result = [],
      seen = result;

  if (comparator) {
    isCommon = false;
    includes = _arrayIncludesWith;
  }
  else if (length >= _baseUniq_LARGE_ARRAY_SIZE) {
    var set = iteratee ? null : _createSet(array);
    if (set) {
      return _setToArray(set);
    }
    isCommon = false;
    includes = _cacheHas;
    seen = new _SetCache;
  }
  else {
    seen = iteratee ? [] : result;
  }
  outer:
  while (++index < length) {
    var value = array[index],
        computed = iteratee ? iteratee(value) : value;

    value = (comparator || value !== 0) ? value : 0;
    if (isCommon && computed === computed) {
      var seenIndex = seen.length;
      while (seenIndex--) {
        if (seen[seenIndex] === computed) {
          continue outer;
        }
      }
      if (iteratee) {
        seen.push(computed);
      }
      result.push(value);
    }
    else if (!includes(seen, computed, comparator)) {
      if (seen !== result) {
        seen.push(computed);
      }
      result.push(value);
    }
  }
  return result;
}

/* harmony default export */ const _baseUniq = (baseUniq);

;// ../../node_modules/lodash-es/uniq.js


/**
 * Creates a duplicate-free version of an array, using
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons, in which only the first occurrence of each element
 * is kept. The order of result values is determined by the order they occur
 * in the array.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Array
 * @param {Array} array The array to inspect.
 * @returns {Array} Returns the new duplicate free array.
 * @example
 *
 * _.uniq([2, 1, 2]);
 * // => [2, 1]
 */
function uniq(array) {
  return (array && array.length) ? _baseUniq(array) : [];
}

/* harmony default export */ const lodash_es_uniq = (uniq);

;// ../../node_modules/posthog-js/dist/module.no-external.js
function e(e,t,i,s,r,n,o){try{var a=e[n](o),l=a.value}catch(e){return void i(e)}a.done?t(l):Promise.resolve(l).then(s,r)}function t(t){return function(){var i=this,s=arguments;return new Promise((function(r,n){var o=t.apply(i,s);function a(t){e(o,r,n,a,l,"next",t)}function l(t){e(o,r,n,a,l,"throw",t)}a(void 0)}))}}function i(){return i=Object.assign?Object.assign.bind():function(e){for(var t=1;arguments.length>t;t++){var i=arguments[t];for(var s in i)({}).hasOwnProperty.call(i,s)&&(e[s]=i[s])}return e},i.apply(null,arguments)}function s(e,t){if(null==e)return{};var i={};for(var s in e)if({}.hasOwnProperty.call(e,s)){if(-1!==t.indexOf(s))continue;i[s]=e[s]}return i}var r="1.382.0",n={DEBUG:!1,LIB_VERSION:r,LIB_NAME:"web",JS_SDK_VERSION:r},o="$people_distinct_id",a="$device_id",l="__alias",u="__timers",c="$autocapture_disabled_server_side",d="$heatmaps_enabled_server_side",_="$exception_capture_enabled_server_side",h="$error_tracking_suppression_rules",p="$error_tracking_capture_extension_exceptions",g="$web_vitals_enabled_server_side",v="$dead_clicks_enabled_server_side",f="$product_tours_enabled_server_side",m="$web_vitals_allowed_metrics",y="$session_recording_remote_config",b="$replay_override_sampling",w="$replay_override_linked_flag",E="$replay_override_url_trigger",S="$replay_override_event_trigger",x="$sesid",k="$session_is_sampled",T="$enabled_feature_flags",P="$active_feature_flags",I="$early_access_features",C="$feature_flag_details",R="$feature_flag_payloads",F="$feature_flag_request_id",L="$override_feature_flags",O="$override_feature_flag_payloads",M="$stored_person_properties",A="$stored_group_properties",D="$surveys",N="$surveys_activated",U="ph_product_tours",H="$flag_call_reported",q="$flag_call_reported_session_id",z="$feature_flag_errors",B="$feature_flag_evaluated_at",j="$user_state",V="$client_session_props",W="$capture_rate_limit",G="$initial_campaign_params",K="$initial_referrer_info",Y="$initial_person_info",J="$epp",X="__POSTHOG_TOOLBAR__",Q="$posthog_cookieless",Z="$sdk_debug_extensions_init_method",ee="$sdk_debug_extensions_init_time_ms",te="$sdk_debug_recording_script_not_loaded",ie="PostHog loadExternalDependency extension not found.",se="on_reject",re="always",ne="anonymous",oe="identified",ae="identified_only",le="visibilitychange",ue="beforeunload",ce="$pageview",de="$pageleave",_e="$identify",he="$groupidentify",pe="undefined"!=typeof window?window:void 0,ge="undefined"!=typeof globalThis?globalThis:pe;"undefined"==typeof self&&(ge.self=ge),"undefined"==typeof File&&(ge.File=function(){});var ve,fe=null==ge?void 0:ge.navigator,me=null==ge?void 0:ge.document,ye=null==ge?void 0:ge.location,be=null==ge?void 0:ge.fetch,we=null!=ge&&ge.XMLHttpRequest&&"withCredentials"in new ge.XMLHttpRequest?ge.XMLHttpRequest:void 0,Ee=null==ge?void 0:ge.AbortController,Se=null==ge?void 0:ge.CompressionStream,xe=null==fe?void 0:fe.userAgent,ke=null!=pe?pe:{},Te=function(e){return e.GZipJS="gzip-js",e.Base64="base64",e}({}),Pe=["$snapshot","$pageview","$pageleave","$set","survey dismissed","survey sent","survey shown","$identify","$groupidentify","$create_alias","$$client_ingestion_warning","$web_experiment_applied","$feature_enrollment_update","$feature_flag_called"],Ie="NativeGzipValidationError",Ce=e=>e.length>=2&&31===e[0]&&139===e[1],Re=e=>!(!e||"object"!=typeof e)&&"NotReadableError"===("name"in e?String(e.name):""),Fe=e=>{var t=new Error("Native gzip produced invalid output: "+e);throw t.name=Ie,t},Le=function(){var e=t((function*(e,t){18>e.size&&Fe("too-short");var i=new Uint8Array(yield e.slice(0,10).arrayBuffer());Ce(i)&&8===i[2]||Fe("invalid-header");var s=new DataView(yield e.slice(e.size-8).arrayBuffer());s.getUint32(0,!0)!==(e=>{for(var t=(()=>{if(ve)return ve;ve=[];for(var e=0;256>e;e++){for(var t=e,i=0;8>i;i++)t=1&t?3988292384^t>>>1:t>>>1;ve[e]=t>>>0}return ve})(),i=4294967295,s=0;e.length>s;s++)i=t[255&(i^e[s])]^i>>>8;return(4294967295^i)>>>0})(t)&&Fe("invalid-crc");var r=t.length>>>0;s.getUint32(4,!0)!==r&&Fe("invalid-size")}));return function(t,i){return e.apply(this,arguments)}}();function $e(){return $e=t((function*(e,i,s){void 0===i&&(i=!0);try{var r=(new TextEncoder).encode(e),n=new CompressionStream("gzip"),o=n.writable.getWriter(),a=o.write(r).then((()=>o.close())).catch(function(){var e=t((function*(e){try{yield o.abort(e)}catch(e){}throw e}));return function(t){return e.apply(this,arguments)}}()),l=new Response(n.readable).blob(),[u]=yield Promise.all([l,a]);return yield Le(u,r),u}catch(e){if(null!=s&&s.rethrow)throw e;return i&&console.error("Failed to gzip compress data",e),null}})),$e.apply(this,arguments)}var Oe=["amazonbot","amazonproductbot","app.hypefactors.com","applebot","archive.org_bot","awariobot","backlinksextendedbot","baiduspider","bingbot","bingpreview","chrome-lighthouse","dataforseobot","deepscan","duckduckbot","facebookexternal","facebookcatalog","http://yandex.com/bots","hubspot","ia_archiver","leikibot","linkedinbot","meta-externalagent","mj12bot","msnbot","nessus","petalbot","pinterest","prerender","rogerbot","screaming frog","sebot-wa","sitebulb","slackbot","slurp","trendictionbot","turnitin","twitterbot","vercel-screenshot","vercelbot","yahoo! slurp","yandexbot","zoombot","bot.htm","bot.php","(bot;","bot/","crawler","ahrefsbot","ahrefssiteaudit","semrushbot","siteauditbot","splitsignalbot","gptbot","oai-searchbot","chatgpt-user","perplexitybot","better uptime bot","sentryuptimebot","uptimerobot","headlesschrome","cypress","google-hoteladsverifier","adsbot-google","apis-google","duplexweb-google","feedfetcher-google","google favicon","google web preview","google-read-aloud","googlebot","googleother","google-cloudvertexbot","googleweblight","mediapartners-google","storebot-google","google-inspectiontool","bytespider"],Me=function(e,t){if(void 0===t&&(t=[]),!e)return!1;var i=e.toLowerCase();return Oe.concat(t).some((e=>{var t=e.toLowerCase();return-1!==i.indexOf(t)}))};function Ae(e,t){return-1!==e.indexOf(t)}var De=function(e){return e.trim()},Ne=function(e){return e.replace(/^\$/,"")},Ue=Object.prototype,He=Ue.hasOwnProperty,qe=Ue.toString,ze=Array.isArray||function(e){return"[object Array]"===qe.call(e)},Be=e=>"function"==typeof e,je=e=>e===Object(e)&&!ze(e),Ve=e=>{if(je(e)){for(var t in e)if(He.call(e,t))return!1;return!0}return!1},We=e=>void 0===e,Ge=e=>"[object String]"==qe.call(e),Ke=e=>Ge(e)&&0===e.trim().length,Ye=e=>null===e,Je=e=>We(e)||Ye(e),Xe=e=>"[object Number]"==qe.call(e)&&e==e,Qe=e=>Xe(e)&&e>0,Ze=e=>"[object Boolean]"===qe.call(e),et=e=>e instanceof FormData,tt=e=>Ae(Pe,e);function it(e){return null===e||"object"!=typeof e}function st(e,t){return{}.toString.call(e)==="[object "+t+"]"}function rt(e){return"undefined"!=typeof Event&&function(e,t){try{return e instanceof t}catch(e){return!1}}(e,Event)}var nt=[!0,"true",1,"1","yes"],ot=e=>Ae(nt,e),at=[!1,"false",0,"0","no"];function lt(e,t,i,s,r){return t>i&&(s.warn("min cannot be greater than max."),t=i),Xe(e)?e>i?(s.warn(" cannot be  greater than max: "+i+". Using max value instead."),i):t>e?(s.warn(" cannot be less than min: "+t+". Using min value instead."),t):e:(s.warn(" must be a number. using max or fallback. max: "+i+", fallback: "+r),lt(r||i,t,i,s))}class ut{constructor(e){this._buckets={},this._onBucketRateLimited=e._onBucketRateLimited,this._bucketSize=lt(e.bucketSize,0,100,e._logger),this._refillRate=lt(e.refillRate,0,this._bucketSize,e._logger),this._refillInterval=lt(e.refillInterval,0,864e5,e._logger)}_applyRefill(e,t){var i=Math.floor((t-e.lastAccess)/this._refillInterval);i>0&&(e.tokens=Math.min(e.tokens+i*this._refillRate,this._bucketSize),e.lastAccess=e.lastAccess+i*this._refillInterval)}consumeRateLimit(e){var t,i=Date.now(),s=String(e),r=this._buckets[s];return r?this._applyRefill(r,i):this._buckets[s]=r={tokens:this._bucketSize,lastAccess:i},0===r.tokens||(r.tokens--,0===r.tokens&&(null==(t=this._onBucketRateLimited)||t.call(this,e)),0===r.tokens)}stop(){this._buckets={}}}var ct,dt,_t,ht="Mobile",pt="iOS",gt="Android",vt="Tablet",ft=gt+" "+vt,mt="iPad",yt="Apple",bt=yt+" Watch",wt="Safari",Et="BlackBerry",St="Samsung",xt=St+"Browser",kt=St+" Internet",Tt="Chrome",Pt=Tt+" OS",It=Tt+" "+pt,Ct="Internet Explorer",Rt=Ct+" "+ht,Ft="Opera",Lt=Ft+" Mini",$t="Edge",Ot="Microsoft "+$t,Mt="Firefox",At=Mt+" "+pt,Dt="Nintendo",Nt="PlayStation",Ut="Xbox",Ht=gt+" "+ht,qt=ht+" "+wt,zt="Windows",Bt=zt+" Phone",jt="Nokia",Vt="Ouya",Wt="Generic",Gt=Wt+" "+ht.toLowerCase(),Kt=Wt+" "+vt.toLowerCase(),Yt="Konqueror",Jt="Oculus Browser",Xt="Vivaldi",Qt="Yandex",Zt="Whale",ei="DuckDuckGo",ti="Pale Moon",ii="Waterfox",si="Brave",ri="(\\d+(\\.\\d+)?)",ni=new RegExp("Version/"+ri),oi=new RegExp(Ut,"i"),ai=new RegExp(Nt+" \\w+","i"),li=new RegExp(Dt+" \\w+","i"),ui=new RegExp(Et+"|PlayBook|BB10","i"),ci={"NT3.51":"NT 3.11","NT4.0":"NT 4.0","5.0":"2000",5.1:"XP",5.2:"XP","6.0":"Vista",6.1:"7",6.2:"8",6.3:"8.1",6.4:"10","10.0":"10"},di=function(e,t,i){t=t||"";var s=function(e){return null!=e&&e.brave?si:null}(i);return s||(Ae(e," OPR/")&&Ae(e,"Mini")?Lt:Ae(e," OPR/")?Ft:ui.test(e)?Et:Ae(e,"IE"+ht)||Ae(e,"WPDesktop")?Rt:Ae(e,"OculusBrowser")?Jt:Ae(e,xt)?kt:Ae(e,$t)||Ae(e,"Edg/")?Ot:Ae(e,Xt+"/")?Xt:Ae(e,"YaBrowser/")?Qt:Ae(e,Zt+"/")?Zt:Ae(e,ei+"/")||Ae(e,"Ddg/")?ei:Ae(e,"FBIOS")?"Facebook "+ht:Ae(e,"UCWEB")||Ae(e,"UCBrowser")?"UC Browser":Ae(e,"CriOS")?It:Ae(e,"CrMo")||Ae(e,Tt)?Tt:Ae(e,gt)&&Ae(e,wt)?Ht:Ae(e,"FxiOS")?At:Ae(e.toLowerCase(),Yt.toLowerCase())?Yt:Ae(e,si+"/")?si:((e,t)=>t&&Ae(t,yt)||function(e){return Ae(e,wt)&&!Ae(e,Tt)&&!Ae(e,gt)}(e))(e,t)?Ae(e,ht)?qt:wt:Ae(e,"PaleMoon/")?ti:Ae(e,ii+"/")?ii:Ae(e,Mt)?Mt:Ae(e,"MSIE")||Ae(e,"Trident/")?Ct:Ae(e,"Gecko")?Mt:"")},_i={[Rt]:[new RegExp("rv:"+ri)],[Ot]:[new RegExp($t+"?\\/"+ri)],[Tt]:[new RegExp("("+Tt+"|CrMo)\\/"+ri)],[It]:[new RegExp("CriOS\\/"+ri)],"UC Browser":[new RegExp("(UCBrowser|UCWEB)\\/"+ri)],[wt]:[ni],[qt]:[ni],[Ft]:[new RegExp("(Opera|OPR)\\/"+ri)],[Mt]:[new RegExp(Mt+"\\/"+ri)],[At]:[new RegExp("FxiOS\\/"+ri)],[Yt]:[new RegExp("Konqueror[:/]?"+ri,"i")],[Et]:[new RegExp(Et+" "+ri),ni],[Ht]:[new RegExp("android\\s"+ri,"i")],[kt]:[new RegExp(xt+"\\/"+ri)],[Jt]:[new RegExp("OculusBrowser\\/"+ri)],[Xt]:[new RegExp(Xt+"\\/"+ri)],[Qt]:[new RegExp("YaBrowser\\/"+ri)],[Zt]:[new RegExp(Zt+"\\/"+ri)],[si]:[new RegExp(si+"\\/"+ri)],[ei]:[new RegExp("(DuckDuckGo|Ddg)\\/"+ri)],[ti]:[new RegExp("PaleMoon\\/"+ri)],[ii]:[new RegExp(ii+"\\/"+ri)],[Ct]:[new RegExp("(rv:|MSIE )"+ri)],Mozilla:[new RegExp("rv:"+ri)]},hi=function(e,t,i){var s=di(e,t,i),r=_i[s];if(We(r))return null;for(var n=0;r.length>n;n++){var o=e.match(r[n]);if(o)return parseFloat(o[o.length-2])}return null},pi=[[new RegExp(Ut+"; "+Ut+" (.*?)[);]","i"),e=>[Ut,e&&e[1]||""]],[new RegExp(Dt,"i"),[Dt,""]],[new RegExp(Nt,"i"),[Nt,""]],[ui,[Et,""]],[new RegExp(zt,"i"),(e,t)=>{if(/Phone/.test(t)||/WPDesktop/.test(t))return[Bt,""];if(new RegExp(ht).test(t)&&!/IEMobile\b/.test(t))return[zt+" "+ht,""];var i=/Windows NT ([0-9.]+)/i.exec(t);if(i&&i[1]){var s=ci[i[1]]||"";return/arm/i.test(t)&&(s="RT"),[zt,s]}return[zt,""]}],[/((iPhone|iPad|iPod).*?OS (\d+)_(\d+)_?(\d+)?|iPhone)/,e=>e&&e[3]?[pt,[e[3],e[4],e[5]||"0"].join(".")]:[pt,""]],[/(watch.*\/(\d+\.\d+\.\d+)|watch os,(\d+\.\d+),)/i,e=>{var t="";return e&&e.length>=3&&(t=We(e[2])?e[3]:e[2]),["watchOS",t]}],[new RegExp("("+gt+" (\\d+)\\.(\\d+)\\.?(\\d+)?|"+gt+")","i"),e=>e&&e[2]?[gt,[e[2],e[3],e[4]||"0"].join(".")]:[gt,""]],[/Mac OS X (\d+)[_.](\d+)[_.]?(\d+)?/i,e=>{var t=["Mac OS X",""];return e&&e[1]&&(t[1]=[e[1],e[2],e[3]||"0"].join(".")),t}],[/Mac/i,["Mac OS X",""]],[/CrOS/,[Pt,""]],[/Linux|debian/i,["Linux",""]]],gi=function(e){return li.test(e)?Dt:ai.test(e)?Nt:oi.test(e)?Ut:new RegExp(Vt,"i").test(e)?Vt:new RegExp("("+Bt+"|WPDesktop)","i").test(e)?Bt:/iPad/.test(e)?mt:/iPod/.test(e)?"iPod Touch":/iPhone/.test(e)?"iPhone":/(watch)(?: ?os[,/]|\d,\d\/)[\d.]+/i.test(e)?bt:ui.test(e)?Et:/(kobo)\s(ereader|touch)/i.test(e)?"Kobo":new RegExp(jt,"i").test(e)?jt:/(kf[a-z]{2}wi|aeo[c-r]{2})( bui|\))/i.test(e)||/(kf[a-z]+)( bui|\)).+silk\//i.test(e)?"Kindle Fire":/(Android|ZTE)/i.test(e)?new RegExp(ht).test(e)&&!/(9138B|TB782B|Nexus [97]|pixel c|HUAWEISHT|BTV|noble nook|smart ultra 6)/i.test(e)||/pixel[\daxl ]{1,6}/i.test(e)&&!/pixel c/i.test(e)||/(huaweimed-al00|tah-|APA|SM-G92|i980|zte|U304AA)/i.test(e)||/lmy47v/i.test(e)&&!/QTAQZ3/i.test(e)?gt:ft:new RegExp("(pda|"+ht+")","i").test(e)?Gt:new RegExp(vt,"i").test(e)&&!new RegExp(vt+" pc","i").test(e)?Kt:""},vi=e=>e instanceof Error,fi={trace:{text:"TRACE",number:1},debug:{text:"DEBUG",number:5},info:{text:"INFO",number:9},warn:{text:"WARN",number:13},error:{text:"ERROR",number:17},fatal:{text:"FATAL",number:21}},mi=fi.info;function yi(e){if(Ze(e))return{boolValue:e};if("number"==typeof e)return Number.isFinite(e)?Number.isInteger(e)?{intValue:e}:{doubleValue:e}:{stringValue:String(e)};if("string"==typeof e)return{stringValue:e};if(ze(e))return{arrayValue:{values:e.map((e=>yi(e)))}};try{return{stringValue:JSON.stringify(e)}}catch(t){return{stringValue:String(e)}}}function bi(e){var t=[];for(var i in e){var s=e[i];Ye(s)||We(s)||t.push({key:i,value:yi(s)})}return t}function wi(e){var t=globalThis._posthogChunkIds;if(t){var i=Object.keys(t);return _t&&i.length===dt||(dt=i.length,_t=i.reduce(((i,s)=>{ct||(ct={});var r=ct[s];if(r)i[r[0]]=r[1];else for(var n=e(s),o=n.length-1;o>=0;o--){var a=n[o],l=null==a?void 0:a.filename,u=t[s];if(l&&u){i[l]=u,ct[s]=[l,u];break}}return i}),{})),_t}}class Ei{constructor(e,t,i){void 0===i&&(i=[]),this.coercers=e,this.stackParser=t,this.modifiers=i}buildFromUnknown(e,t){void 0===t&&(t={});var i=t&&t.mechanism||{handled:!0,type:"generic"},s=this.buildCoercingContext(i,t,0).apply(e),r=this.buildParsingContext(t),n=this.parseStacktrace(s,r);return{$exception_list:this.convertToExceptionList(n,i),$exception_level:"error"}}modifyFrames(e){var i=this;return t((function*(){for(var t of e)t.stacktrace&&t.stacktrace.frames&&ze(t.stacktrace.frames)&&(t.stacktrace.frames=yield i.applyModifiers(t.stacktrace.frames));return e}))()}coerceFallback(e){var t;return{type:"Error",value:"Unknown error",stack:null==(t=e.syntheticException)?void 0:t.stack,synthetic:!0}}parseStacktrace(e,t){var s,r;return null!=e.cause&&(s=this.parseStacktrace(e.cause,t)),""!=e.stack&&null!=e.stack&&(r=this.applyChunkIds(this.stackParser(e.stack,e.synthetic?t.skipFirstLines:0),t.chunkIdMap)),i({},e,{cause:s,stack:r})}applyChunkIds(e,t){return e.map((e=>(e.filename&&t&&(e.chunk_id=t[e.filename]),e)))}applyCoercers(e,t){for(var i of this.coercers)if(i.match(e))return i.coerce(e,t);return this.coerceFallback(t)}applyModifiers(e){var i=this;return t((function*(){var t=e;for(var s of i.modifiers)t=yield s(t);return t}))()}convertToExceptionList(e,t){var s,r,n,o={type:e.type,value:e.value,mechanism:{type:null!==(s=t.type)&&void 0!==s?s:"generic",handled:null===(r=t.handled)||void 0===r||r,synthetic:null!==(n=e.synthetic)&&void 0!==n&&n}};e.stack&&(o.stacktrace={type:"raw",frames:e.stack});var a=[o];return null!=e.cause&&a.push(...this.convertToExceptionList(e.cause,i({},t,{handled:!0}))),a}buildParsingContext(e){var t;return{chunkIdMap:wi(this.stackParser),skipFirstLines:null!==(t=e.skipFirstLines)&&void 0!==t?t:1}}buildCoercingContext(e,t,s){void 0===s&&(s=0);var r=(i,s)=>{if(4>=s){var r=this.buildCoercingContext(e,t,s);return this.applyCoercers(i,r)}};return i({},t,{syntheticException:0==s?t.syntheticException:void 0,mechanism:e,apply:e=>r(e,s),next:e=>r(e,s+1)})}}var Si="?";function xi(e,t,i,s,r){var n={platform:e,filename:t,function:"<anonymous>"===i?Si:i,in_app:!0};return We(s)||(n.lineno=s),We(r)||(n.colno=r),n}var ki=(e,t)=>{var i=-1!==e.indexOf("safari-extension"),s=-1!==e.indexOf("safari-web-extension");return i||s?[-1!==e.indexOf("@")?e.split("@")[0]:Si,i?"safari-extension:"+t:"safari-web-extension:"+t]:[e,t]},Ti=/^\s*at (\S+?)(?::(\d+))(?::(\d+))\s*$/i,Pi=/^\s*at (?:(.+?\)(?: \[.+\])?|.*?) ?\((?:address at )?)?(?:async )?((?:<anonymous>|[-a-z]+:|.*bundle|\/)?.*?)(?::(\d+))?(?::(\d+))?\)?\s*$/i,Ii=/\((\S*)(?::(\d+))(?::(\d+))\)/,Ci=(e,t)=>{var i=Ti.exec(e);if(i){var[,s,r,n]=i;return xi(t,s,Si,+r,+n)}var o=Pi.exec(e);if(o){if(o[2]&&0===o[2].indexOf("eval")){var a=Ii.exec(o[2]);a&&(o[2]=a[1],o[3]=a[2],o[4]=a[3])}var[l,u]=ki(o[1]||Si,o[2]);return xi(t,u,l,o[3]?+o[3]:void 0,o[4]?+o[4]:void 0)}},Ri=/^\s*(.*?)(?:\((.*?)\))?(?:^|@)?((?:[-a-z]+)?:\/.*?|\[native code\]|[^@]*(?:bundle|\d+\.js)|\/[\w\-. /=]+)(?::(\d+))?(?::(\d+))?\s*$/i,Fi=/(\S+) line (\d+)(?: > eval line \d+)* > eval/i,Li=(e,t)=>{var i=Ri.exec(e);if(i){if(i[3]&&i[3].indexOf(" > eval")>-1){var s=Fi.exec(i[3]);s&&(i[1]=i[1]||"eval",i[3]=s[1],i[4]=s[2],i[5]="")}var r=i[3],n=i[1]||Si;return[n,r]=ki(n,r),xi(t,r,n,i[4]?+i[4]:void 0,i[5]?+i[5]:void 0)}},$i=/\(error: (.*)\)/;class Oi{match(e){return this.isDOMException(e)||this.isDOMError(e)}coerce(e,t){var i=Ge(e.stack);return{type:this.getType(e),value:this.getValue(e),stack:i?e.stack:void 0,cause:e.cause?t.next(e.cause):void 0,synthetic:!1}}getType(e){return this.isDOMError(e)?"DOMError":"DOMException"}getValue(e){var t=e.name||(this.isDOMError(e)?"DOMError":"DOMException");return e.message?t+": "+e.message:t}isDOMException(e){return st(e,"DOMException")}isDOMError(e){return st(e,"DOMError")}}class Mi{match(e){return(e=>e instanceof Error)(e)}coerce(e,t){return{type:this.getType(e),value:this.getMessage(e,t),stack:this.getStack(e),cause:e.cause?t.next(e.cause):void 0,synthetic:!1}}getType(e){return e.name||e.constructor.name}getMessage(e,t){var i=e.message;return String(i.error&&"string"==typeof i.error.message?i.error.message:i)}getStack(e){return e.stacktrace||e.stack||void 0}}class Ai{constructor(){}match(e){return st(e,"ErrorEvent")&&null!=e.error}coerce(e,t){var i;return t.apply(e.error)||{type:"ErrorEvent",value:e.message,stack:null==(i=t.syntheticException)?void 0:i.stack,synthetic:!0}}}var Di=/^(?:[Uu]ncaught (?:exception: )?)?(?:((?:Eval|Internal|Range|Reference|Syntax|Type|URI|)Error): )?(.*)$/i;class Ni{match(e){return"string"==typeof e}coerce(e,t){var i,[s,r]=this.getInfos(e);return{type:null!=s?s:"Error",value:null!=r?r:e,stack:null==(i=t.syntheticException)?void 0:i.stack,synthetic:!0}}getInfos(e){var t="Error",i=e,s=e.match(Di);return s&&(t=s[1],i=s[2]),[t,i]}}var Ui=["fatal","error","warning","log","info","debug"];function Hi(e,t){void 0===t&&(t=40);var i=Object.keys(e);if(i.sort(),!i.length)return"[object has no keys]";for(var s=i.length;s>0;s--){var r=i.slice(0,s).join(", ");if(t>=r.length)return s===i.length?r:r.length>t?r.slice(0,t)+"...":r}return""}class qi{match(e){return"object"==typeof e&&null!==e}coerce(e,t){var i,s=this.getErrorPropertyFromObject(e);return s?t.apply(s):{type:this.getType(e),value:this.getValue(e),stack:null==(i=t.syntheticException)?void 0:i.stack,level:this.isSeverityLevel(e.level)?e.level:"error",synthetic:!0}}getType(e){return rt(e)?e.constructor.name:"Error"}getValue(e){if("name"in e&&"string"==typeof e.name){var t="'"+e.name+"' captured as exception";return"message"in e&&"string"==typeof e.message&&(t+=" with message: '"+e.message+"'"),t}if("message"in e&&"string"==typeof e.message)return e.message;var i=this.getObjectClassName(e);return(i&&"Object"!==i?"'"+i+"'":"Object")+" captured as exception with keys: "+Hi(e)}isSeverityLevel(e){return Ge(e)&&!Ke(e)&&Ui.indexOf(e)>=0}getErrorPropertyFromObject(e){for(var t in e)if({}.hasOwnProperty.call(e,t)){var i=e[t];if(vi(i))return i}}getObjectClassName(e){try{var t=Object.getPrototypeOf(e);return t?t.constructor.name:void 0}catch(e){return}}}class zi{match(e){return rt(e)}coerce(e,t){var i,s=e.constructor.name;return{type:s,value:s+" captured as exception with keys: "+Hi(e),stack:null==(i=t.syntheticException)?void 0:i.stack,synthetic:!0}}}class Bi{match(e){return it(e)}coerce(e,t){var i;return{type:"Error",value:"Primitive value captured as exception: "+String(e),stack:null==(i=t.syntheticException)?void 0:i.stack,synthetic:!0}}}class ji{match(e){return st(e,"PromiseRejectionEvent")||this.isCustomEventWrappingRejection(e)}isCustomEventWrappingRejection(e){if(!rt(e))return!1;try{var t=e.detail;return null!=t&&"object"==typeof t&&"reason"in t}catch(e){return!1}}coerce(e,t){var i,s=this.getUnhandledRejectionReason(e);return it(s)?{type:"UnhandledRejection",value:"Non-Error promise rejection captured with value: "+String(s),stack:null==(i=t.syntheticException)?void 0:i.stack,synthetic:!0}:t.apply(s)}getUnhandledRejectionReason(e){try{if("reason"in e)return e.reason;if("detail"in e&&null!=e.detail&&"object"==typeof e.detail&&"reason"in e.detail)return e.detail.reason}catch(e){}return e}}var Vi="$message",Wi="$timestamp",Gi=new Set([Vi,Wi]),Ki={enabled:!0,max_bytes:32768};function Yi(e){var t;return e?{enabled:null!==(t=e.enabled)&&void 0!==t?t:Ki.enabled,max_bytes:Xi(e.max_bytes,Ki.max_bytes)}:i({},Ki)}class Ji{constructor(e){this._entries=[],this._totalBytes=0,this._config=Yi(e)}setConfig(e){this._config=Yi(e),this._trimToMaxBytes()}add(e){var t=function(e){var t=function(e){var t=new WeakSet;try{return JSON.stringify(e,((e,i)=>{if("bigint"==typeof i)return i.toString();if("function"!=typeof i&&"symbol"!=typeof i){if(i instanceof Date)return i.toISOString();if(i instanceof Error)return{name:i.name,message:i.message,stack:i.stack};if(i&&"object"==typeof i){if(t.has(i))return"[Circular]";t.add(i)}return i}}))}catch(e){return}}(e);if(t)try{var i=JSON.parse(t);if(!je(i))return;var s=i,r=s[Vi],n=s[Wi];if(!Ge(r)||0===r.trim().length)return;if(!Ge(n)&&!Xe(n))return;return{step:s,json:t}}catch(e){return}}(e);if(t){var i=function(e){if("undefined"!=typeof TextEncoder)return(new TextEncoder).encode(e).length;for(var t=encodeURIComponent(e),i=0,s=0;t.length>s;s++)"%"===t[s]?(i+=1,s+=2):i+=1;return i}(t.json);i>this._config.max_bytes||(this._entries.push({step:t.step,bytes:i}),this._totalBytes+=i,this._trimToMaxBytes())}}getAttachable(){return this._entries.map((e=>e.step))}clear(){this._entries=[],this._totalBytes=0}size(){return this._entries.length}_trimToMaxBytes(){for(;this._totalBytes>this._config.max_bytes&&this._entries.length>0;){var e=this._entries.shift();e&&(this._totalBytes-=e.bytes)}}}function Xi(e,t){if(!Xe(e)||e===1/0||e===-1/0)return t;var i=Math.floor(e);return 0>i?t:i}var Qi=function(e,t){var{debugEnabled:i}=void 0===t?{}:t,s={_log(t){if(pe&&(n.DEBUG||ke.POSTHOG_DEBUG||i)&&!We(pe.console)&&pe.console){for(var s=("__rrweb_original__"in pe.console[t]?pe.console[t].__rrweb_original__:pe.console[t]),r=arguments.length,o=new Array(r>1?r-1:0),a=1;r>a;a++)o[a-1]=arguments[a];s(e,...o)}},debug(){for(var e=arguments.length,t=new Array(e),i=0;e>i;i++)t[i]=arguments[i];s._log("debug",...t)},info(){for(var e=arguments.length,t=new Array(e),i=0;e>i;i++)t[i]=arguments[i];s._log("log",...t)},warn(){for(var e=arguments.length,t=new Array(e),i=0;e>i;i++)t[i]=arguments[i];s._log("warn",...t)},error(){for(var e=arguments.length,t=new Array(e),i=0;e>i;i++)t[i]=arguments[i];s._log("error",...t)},critical(){for(var t=arguments.length,i=new Array(t),s=0;t>s;s++)i[s]=arguments[s];console.error(e,...i)},uninitializedWarning(e){s.error("You must initialize PostHog before calling "+e)},createLogger:(t,i)=>Qi(e+" "+t,i)};return s},Zi=Qi("[PostHog.js]"),es=Zi.createLogger;function ts(e,t){ze(e)&&e.forEach(t)}function is(e,t){if(!Je(e))if(ze(e))e.forEach(t);else if(et(e))e.forEach(((e,i)=>t(e,i)));else for(var i in e)He.call(e,i)&&t(e[i],i)}var ss=function(e){for(var t=arguments.length,i=new Array(t>1?t-1:0),s=1;t>s;s++)i[s-1]=arguments[s];for(var r of i)for(var n in r)void 0!==r[n]&&(e[n]=r[n]);return e};function rs(e){for(var t=Object.keys(e),i=t.length,s=new Array(i);i--;)s[i]=[t[i],e[t[i]]];return s}var ns=function(e){try{return e()}catch(e){return}},os=function(e){return function(){try{for(var t=arguments.length,i=new Array(t),s=0;t>s;s++)i[s]=arguments[s];return e.apply(this,i)}catch(e){Zi.critical("Implementation error. Please turn on debug mode and open a ticket on https://app.posthog.com/home#panel=support%3Asupport%3A."),Zi.critical(e)}}},as=function(e){var t={};return is(e,(function(e,i){(Ge(e)&&e.length>0||Xe(e))&&(t[i]=e)})),t};var ls=["herokuapp.com","vercel.app","netlify.app"];function us(e){var t=null==e?void 0:e.hostname;if(!Ge(t))return!1;var i=t.split(".").slice(-2).join(".");for(var s of ls)if(i===s)return!1;return!0}function cs(e,t,i,s){var{capture:r=!1,passive:n=!0}=null!=s?s:{};null==e||e.addEventListener(t,i,{capture:r,passive:n})}function ds(e){return"ph_toolbar_internal"===e.name}Math.trunc||(Math.trunc=function(e){return 0>e?Math.ceil(e):Math.floor(e)}),Number.isInteger||(Number.isInteger=function(e){return Xe(e)&&isFinite(e)&&Math.floor(e)===e});class _s{constructor(e){if(this.bytes=e,16!==e.length)throw new TypeError("not 128-bit length")}static fromFieldsV7(e,t,i,s){if(!Number.isInteger(e)||!Number.isInteger(t)||!Number.isInteger(i)||!Number.isInteger(s)||0>e||0>t||0>i||0>s||e>0xffffffffffff||t>4095||i>1073741823||s>4294967295)throw new RangeError("invalid field value");var r=new Uint8Array(16);return r[0]=e/Math.pow(2,40),r[1]=e/Math.pow(2,32),r[2]=e/Math.pow(2,24),r[3]=e/Math.pow(2,16),r[4]=e/Math.pow(2,8),r[5]=e,r[6]=112|t>>>8,r[7]=t,r[8]=128|i>>>24,r[9]=i>>>16,r[10]=i>>>8,r[11]=i,r[12]=s>>>24,r[13]=s>>>16,r[14]=s>>>8,r[15]=s,new _s(r)}toString(){for(var e="",t=0;this.bytes.length>t;t++)e=e+(this.bytes[t]>>>4).toString(16)+(15&this.bytes[t]).toString(16),3!==t&&5!==t&&7!==t&&9!==t||(e+="-");if(36!==e.length)throw new Error("Invalid UUIDv7 was generated");return e}clone(){return new _s(this.bytes.slice(0))}equals(e){return 0===this.compareTo(e)}compareTo(e){for(var t=0;16>t;t++){var i=this.bytes[t]-e.bytes[t];if(0!==i)return Math.sign(i)}return 0}}class hs{constructor(){this._timestamp=0,this._counter=0,this._random=new vs}generate(){var e=this.generateOrAbort();if(We(e)){this._timestamp=0;var t=this.generateOrAbort();if(We(t))throw new Error("Could not generate UUID after timestamp reset");return t}return e}generateOrAbort(){var e=Date.now();if(e>this._timestamp)this._timestamp=e,this._resetCounter();else{if(this._timestamp>=e+1e4)return;this._counter++,this._counter>4398046511103&&(this._timestamp++,this._resetCounter())}return _s.fromFieldsV7(this._timestamp,Math.trunc(this._counter/Math.pow(2,30)),this._counter&Math.pow(2,30)-1,this._random.nextUint32())}_resetCounter(){this._counter=1024*this._random.nextUint32()+(1023&this._random.nextUint32())}}var ps,gs=e=>{if("undefined"!=typeof UUIDV7_DENY_WEAK_RNG&&UUIDV7_DENY_WEAK_RNG)throw new Error("no cryptographically strong RNG available");for(var t=0;e.length>t;t++)e[t]=65536*Math.trunc(65536*Math.random())+Math.trunc(65536*Math.random());return e};pe&&!We(pe.crypto)&&crypto.getRandomValues&&(gs=e=>crypto.getRandomValues(e));class vs{constructor(){this._buffer=new Uint32Array(8),this._cursor=1/0}nextUint32(){return this._buffer.length>this._cursor||(gs(this._buffer),this._cursor=0),this._buffer[this._cursor++]}}var fs=()=>ms().toString(),ms=()=>(ps||(ps=new hs)).generate(),ys="",bs=/[a-z0-9][a-z0-9-]+\.[a-z]{2,}$/i;var ws={_is_supported:()=>!!me,_error(e){Zi.error("cookieStore error: "+e)},_get(e){if(me){try{for(var t=e+"=",i=me.cookie.split(";").filter((e=>e.length)),s=0;i.length>s;s++){for(var r=i[s];" "==r.charAt(0);)r=r.substring(1,r.length);if(0===r.indexOf(t))return decodeURIComponent(r.substring(t.length,r.length))}}catch(e){}return null}},_parse(e){var t;try{t=JSON.parse(ws._get(e))||{}}catch(e){}return t},_set(e,t,i,s,r){if(me)try{var n="",o="",a=function(e,t){if(t){var i=function(e,t){if(void 0===t&&(t=me),ys)return ys;if(!t)return"";if(["localhost","127.0.0.1"].includes(e))return"";for(var i=e.split("."),s=Math.min(i.length,8),r="dmn_chk_"+fs();!ys&&s--;){var n=i.slice(s).join("."),o=r+"=1;domain=."+n+";path=/";t.cookie=o+";max-age=3",t.cookie.includes(r)&&(t.cookie=o+";max-age=0",ys=n)}return ys}(e);if(!i){var s=(e=>{var t=e.match(bs);return t?t[0]:""})(e);s!==i&&Zi.info("Warning: cookie subdomain discovery mismatch",s,i),i=s}return i?"; domain=."+i:""}return""}(me.location.hostname,s);if(i){var l=new Date;l.setTime(l.getTime()+864e5*i),n="; expires="+l.toUTCString()}r&&(o="; secure");var u=e+"="+encodeURIComponent(JSON.stringify(t))+n+"; SameSite=Lax; path=/"+a+o;return u.length>3686.4&&Zi.warn("cookieStore warning: large cookie, len="+u.length),me.cookie=u,u}catch(e){return}},_remove(e,t){if(null!=me&&me.cookie)try{ws._set(e,"",-1,t)}catch(e){return}}},Es=null,Ss={_is_supported(){if(!Ye(Es))return Es;var e=!0;if(We(pe))e=!1;else try{var t="__mplssupport__";Ss._set(t,"xyz"),'"xyz"'!==Ss._get(t)&&(e=!1),Ss._remove(t)}catch(t){e=!1}return e||Zi.error("localStorage unsupported; falling back to cookie store"),Es=e,e},_error(e){Zi.error("localStorage error: "+e)},_get(e){try{return null==pe?void 0:pe.localStorage.getItem(e)}catch(e){Ss._error(e)}return null},_parse(e){try{return JSON.parse(Ss._get(e))||{}}catch(e){}return null},_set(e,t){try{null==pe||pe.localStorage.setItem(e,JSON.stringify(t))}catch(e){Ss._error(e)}},_remove(e){try{null==pe||pe.localStorage.removeItem(e)}catch(e){Ss._error(e)}}},xs=[a,"distinct_id",x,k,J,Y,j],ks={},Ts={_is_supported:()=>!0,_error(e){Zi.error("memoryStorage error: "+e)},_get:e=>ks[e]||null,_parse:e=>ks[e]||null,_set(e,t){ks[e]=t},_remove(e){delete ks[e]}},Ps=null,Is={_is_supported(){if(!Ye(Ps))return Ps;if(Ps=!0,We(pe))Ps=!1;else try{var e="__support__";Is._set(e,"xyz"),'"xyz"'!==Is._get(e)&&(Ps=!1),Is._remove(e)}catch(e){Ps=!1}return Ps},_error(e){Zi.error("sessionStorage error: ",e)},_get(e){try{return null==pe?void 0:pe.sessionStorage.getItem(e)}catch(e){Is._error(e)}return null},_parse(e){try{return JSON.parse(Is._get(e))||null}catch(e){}return null},_set(e,t){try{null==pe||pe.sessionStorage.setItem(e,JSON.stringify(t))}catch(e){Is._error(e)}},_remove(e){try{null==pe||pe.sessionStorage.removeItem(e)}catch(e){Is._error(e)}}};class Cs{constructor(e){this._instance=e}get _config(){return this._instance.config}get consent(){return this._getDnt()?0:this._storedConsent}isOptedOut(){return this._config.cookieless_mode===re||this.isRejected()||-1===this.consent&&this._config.cookieless_mode===se}isOptedIn(){return!this.isOptedOut()}isExplicitlyOptedOut(){return 0===this.consent}isRejected(){return 0===this.consent||-1===this.consent&&this._config.opt_out_capturing_by_default}optInOut(e){this._storage._set(this._storageKey,e?1:0,this._config.cookie_expiration,this._config.cross_subdomain_cookie,this._config.secure_cookie)}reset(){this._storage._remove(this._storageKey,this._config.cross_subdomain_cookie)}get _storageKey(){var{token:e,opt_out_capturing_cookie_prefix:t,consent_persistence_name:i}=this._instance.config;return i||(t?t+e:"__ph_opt_in_out_"+e)}get _storedConsent(){var e=this._storage._get(this._storageKey);return ot(e)?1:Ae(at,e)?0:-1}get _storage(){var e=this._config.opt_out_capturing_persistence_type,t="localStorage"===e?Ss:ws;if(!this._persistentStore||this._persistentStore!==t){this._persistentStore=t;var i="localStorage"===e?ws:Ss;i._get(this._storageKey)&&(this._persistentStore._get(this._storageKey)||this.optInOut(ot(i._get(this._storageKey))),i._remove(this._storageKey,this._config.cross_subdomain_cookie))}return this._persistentStore}_getDnt(){return!!this._config.respect_dnt&&[null==fe?void 0:fe.doNotTrack,null==fe?void 0:fe.msDoNotTrack,ke.doNotTrack].some((e=>ot(e)))}}var Rs=1,Fs=3,Ls=11;function $s(e){return e instanceof Element&&(e.id===X||!(null==e.closest||!e.closest(".toolbar-global-fade-container")))}function Os(e){return!!e&&e.nodeType===Rs}function Ms(e,t){return!!e&&!!e.tagName&&e.tagName.toLowerCase()===t.toLowerCase()}function As(e){return!!e&&e.nodeType===Fs}function Ds(e){return!!e&&e.nodeType===Ls&&Os(e.host)}function Ns(e){return e?De(e).split(/\s+/):[]}function Us(e){var t=null==pe?void 0:pe.location.href;return!!(t&&e&&e.some((e=>t.match(e))))}function Hs(e){var t="";switch(typeof e.className){case"string":t=e.className;break;case"object":t=(e.className&&"baseVal"in e.className?e.className.baseVal:null)||e.getAttribute("class")||"";break;default:t=""}return Ns(t)}function qs(e){return Je(e)?null:De(e).split(/(\s+)/).filter((e=>ur(e))).join("").replace(/[\r\n]/g," ").replace(/[ ]+/g," ").substring(0,255)}function zs(e){var t="";return tr(e)&&!ir(e)&&e.childNodes&&e.childNodes.length&&is(e.childNodes,(function(e){var i;As(e)&&e.textContent&&(t+=null!==(i=qs(e.textContent))&&void 0!==i?i:"")})),De(t)}function Bs(e){return We(e.target)?e.srcElement||null:null!=(t=e.target)&&t.shadowRoot?e.composedPath()[0]||null:e.target||null;// removed by dead control flow
 var t; }var js=["a","button","form","input","select","textarea","label"];function Vs(e,t){if(We(t))return!0;var i,s=function(e){if(t.some((t=>e.matches(t))))return{v:!0}};for(var r of e)if(i=s(r))return i.v;return!1}function Ws(e){var t=e.parentNode;return!(!t||!Os(t))&&t}var Gs=["next","previous","prev",">","<"],Ks=[...Gs,"+","-","−","–"],Ys=(e,t)=>/[a-z0-9]/i.test(t)?e.includes(t):e===t,Js=[".ph-no-rageclick",".ph-no-capture"],Xs=["","text","search","email","password","url","tel","number"];function Qs(e,t){if(!pe||Zs(e))return!1;var i,s,r,n,o;if(Ze(t)?(i=!!t&&Js,s=void 0,r=!1):(i=null!==(n=null==t?void 0:t.css_selector_ignorelist)&&void 0!==n?n:Js,s=null==t?void 0:t.content_ignorelist,r=null!==(o=null==t?void 0:t.ignore_text_selection)&&void 0!==o&&o),!1===i)return!1;if(r&&function(e){return!(!e||!Os(e))&&(!!Ms(e,"textarea")||(Ms(e,"input")?Ae(Xs,(e.getAttribute("type")||"").toLowerCase()):function(e){if(e.isContentEditable)return!0;var t=null==e.getAttribute?void 0:e.getAttribute("contenteditable");return"true"===t||""===t}(e)))}(e))return!1;var{targetElementList:a}=er(e,!1);return!function(e,t){if(!1===e||We(e))return!1;var i;if(!0===e)i=Gs;else{if(!ze(e))return!1;if(e.length>10)return Zi.error("[PostHog] content_ignorelist array cannot exceed 10 items. Use css_selector_ignorelist for more complex matching."),!1;i=e.map((e=>e.toLowerCase()))}return t.some((e=>{var{safeText:t,ariaLabel:s}=e;return i.some((e=>Ys(t,e)||Ys(s,e)))}))}(s,a.map((e=>{var t;return{safeText:zs(e).toLowerCase(),ariaLabel:(null==(t=e.getAttribute("aria-label"))?void 0:t.toLowerCase().trim())||""}})))&&!Vs(a,i)}var Zs=e=>!e||Ms(e,"html")||!Os(e),er=(e,t)=>{if(!pe||Zs(e))return{parentIsUsefulElement:!1,targetElementList:[]};for(var i=!1,s=[e],r=e;r.parentNode&&!Ms(r,"body");)if(Ds(r.parentNode))s.push(r.parentNode.host),r=r.parentNode.host;else{var n=Ws(r);if(!n)break;if(t||js.indexOf(n.tagName.toLowerCase())>-1)i=!0;else{var o=pe.getComputedStyle(n);o&&"pointer"===o.getPropertyValue("cursor")&&(i=!0)}s.push(n),r=n}return{parentIsUsefulElement:i,targetElementList:s}};function tr(e){for(var t=e;t.parentNode&&!Ms(t,"body");t=t.parentNode){var i=Hs(t);if(Ae(i,"ph-sensitive")||Ae(i,"ph-no-capture"))return!1}if(Ae(Hs(e),"ph-include"))return!0;var s=e.type||"";if(Ge(s))switch(s.toLowerCase()){case"hidden":case"password":return!1}var r=e.name||e.id||"";return!Ge(r)||!/^cc|cardnum|ccnum|creditcard|csc|cvc|cvv|exp|pass|pwd|routing|seccode|securitycode|securitynum|socialsec|socsec|ssn/i.test(r.replace(/[^a-zA-Z0-9]/g,""))}function ir(e){return!!(Ms(e,"input")&&!["button","checkbox","submit","reset"].includes(e.type)||Ms(e,"select")||Ms(e,"textarea")||"true"===e.getAttribute("contenteditable"))}var sr="(4[0-9]{12}(?:[0-9]{3})?)|(5[1-5][0-9]{14})|(6(?:011|5[0-9]{2})[0-9]{12})|(3[47][0-9]{13})|(3(?:0[0-5]|[68][0-9])[0-9]{11})|((?:2131|1800|35[0-9]{3})[0-9]{11})",rr=new RegExp("^(?:"+sr+")$"),nr=new RegExp(sr),or="\\d{3}-?\\d{2}-?\\d{4}",ar=new RegExp("^("+or+")$"),lr=new RegExp("("+or+")");function ur(e,t){if(void 0===t&&(t=!0),Je(e))return!1;if(Ge(e)){if(e=De(e),(t?rr:nr).test((e||"").replace(/[- ]/g,"")))return!1;if((t?ar:lr).test(e))return!1}return!0}function cr(e){var t=zs(e);return ur(t=(t+" "+dr(e)).trim())?t:""}function dr(e){var t="";return e&&e.childNodes&&e.childNodes.length&&is(e.childNodes,(function(e){var i;if(e&&"span"===(null==(i=e.tagName)?void 0:i.toLowerCase()))try{var s=zs(e);t=(t+" "+s).trim(),e.childNodes&&e.childNodes.length&&(t=(t+" "+dr(e)).trim())}catch(e){Zi.error("[AutoCapture]",e)}})),t}function _r(e){return e.replace(/"|\\"/g,'\\"')}function hr(e){var t=e.attr__class;return t?ze(t)?t:Ns(t):void 0}var pr=es("[Dead Clicks]"),gr=()=>!0,vr=e=>{var t,i=!(null==(t=e.instance.persistence)||!t.get_property(v)),s=e.instance.config.capture_dead_clicks;return Ze(s)?s:!!je(s)||i};class fr{get lazyLoadedDeadClicksAutocapture(){return this._lazyLoadedDeadClicksAutocapture}constructor(e,t,i){this.instance=e,this.isEnabled=t,this.onCapture=i,this.startIfEnabledOrStop()}onRemoteConfig(e){"captureDeadClicks"in e&&(this.instance.persistence&&this.instance.persistence.register({[v]:e.captureDeadClicks}),this.startIfEnabledOrStop())}startIfEnabledOrStop(){this.isEnabled(this)?this._loadScript((()=>{this._start()})):this.stop()}_loadScript(e){var t,i;null!=(t=ke.__PosthogExtensions__)&&t.initDeadClicksAutocapture&&e(),null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this.instance,"dead-clicks-autocapture",(t=>{t?pr.error("failed to load script",t):e()}))}_start(){var e;if(me){if(!this._lazyLoadedDeadClicksAutocapture&&null!=(e=ke.__PosthogExtensions__)&&e.initDeadClicksAutocapture){var t=je(this.instance.config.capture_dead_clicks)?this.instance.config.capture_dead_clicks:{};t.__onCapture=this.onCapture,this._lazyLoadedDeadClicksAutocapture=ke.__PosthogExtensions__.initDeadClicksAutocapture(this.instance,t),this._lazyLoadedDeadClicksAutocapture.start(me),pr.info("starting...")}}else pr.error("`document` not found. Cannot start.")}stop(){this._lazyLoadedDeadClicksAutocapture&&(this._lazyLoadedDeadClicksAutocapture.stop(),this._lazyLoadedDeadClicksAutocapture=void 0,pr.info("stopping..."))}}var mr=es("[SegmentIntegration]");var yr="posthog-js";function br(e,t){var{organization:s,projectId:r,prefix:n,severityAllowList:o=["error"],sendExceptionsToPostHog:a=!0}=void 0===t?{}:t;return t=>{var l,u,c,d,_;if("*"!==o&&!o.includes(t.level)||!e.__loaded)return t;t.tags||(t.tags={});var h=e.requestRouter.endpointFor("ui","/project/"+e.config.token+"/person/"+e.get_distinct_id());t.tags["PostHog Person URL"]=h,e.sessionRecordingStarted()&&(t.tags["PostHog Recording URL"]=e.get_session_replay_url({withTimestamp:!0}));var p,g=(null==(l=t.exception)?void 0:l.values)||[],v=g.map((e=>i({},e,{stacktrace:e.stacktrace?i({},e.stacktrace,{type:"raw",frames:(e.stacktrace.frames||[]).map((e=>i({},e,{platform:"web:javascript"})))}):void 0}))),f={$exception_message:(null==(u=g[0])?void 0:u.value)||t.message,$exception_type:null==(c=g[0])?void 0:c.type,$exception_level:t.level,$exception_list:v,$sentry_event_id:t.event_id,$sentry_exception:t.exception,$sentry_exception_message:(null==(d=g[0])?void 0:d.value)||t.message,$sentry_exception_type:null==(_=g[0])?void 0:_.type,$sentry_tags:t.tags};return s&&r&&(f.$sentry_url=(n||"https://sentry.io/organizations/")+s+"/issues/?project="+r+"&query="+t.event_id),a&&(null==(p=e.exceptions)||p.sendExceptionEvent(f)),t}}class wr{constructor(e,t,i,s,r,n){this.name=yr,this.setupOnce=function(o){o(br(e,{organization:t,projectId:i,prefix:s,severityAllowList:r,sendExceptionsToPostHog:null==n||n}))}}}class Er{constructor(e){this._onSessionIdChange=(e,t,i)=>{i&&(i.noSessionId||i.activityTimeout||i.sessionPastMaximumLength)&&(Zi.info("[PageViewManager] Session rotated, clearing pageview state",{sessionId:e,changeReason:i}),this._currentPageview=void 0,this._instance.scrollManager.resetContext())},this._instance=e,this._setupSessionRotationHandler()}_setupSessionRotationHandler(){var e;this._unsubscribeSessionId=null==(e=this._instance.sessionManager)?void 0:e.onSessionId(this._onSessionIdChange)}destroy(){var e;null==(e=this._unsubscribeSessionId)||e.call(this),this._unsubscribeSessionId=void 0}doPageView(e,t){var i,s=this._previousPageViewProperties(e,t);return this._currentPageview={pathname:null!==(i=null==pe?void 0:pe.location.pathname)&&void 0!==i?i:"",pageViewId:t,timestamp:e},this._instance.scrollManager.resetContext(),s}doPageLeave(e){var t;return this._previousPageViewProperties(e,null==(t=this._currentPageview)?void 0:t.pageViewId)}doEvent(){var e;return{$pageview_id:null==(e=this._currentPageview)?void 0:e.pageViewId}}_previousPageViewProperties(e,t){var i=this._currentPageview;if(!i)return{$pageview_id:t};var s={$pageview_id:t,$prev_pageview_id:i.pageViewId},r=this._instance.scrollManager.getContext();if(r&&!this._instance.config.disable_scroll_properties){var{maxScrollHeight:n,lastScrollY:o,maxScrollY:a,maxContentHeight:l,lastContentY:u,maxContentY:c}=r;if(!(We(n)||We(o)||We(a)||We(l)||We(u)||We(c))){n=Math.ceil(n),o=Math.ceil(o),a=Math.ceil(a),l=Math.ceil(l),u=Math.ceil(u),c=Math.ceil(c);var d=n>1?lt(o/n,0,1,Zi):1,_=n>1?lt(a/n,0,1,Zi):1,h=l>1?lt(u/l,0,1,Zi):1,p=l>1?lt(c/l,0,1,Zi):1;s=ss(s,{$prev_pageview_last_scroll:o,$prev_pageview_last_scroll_percentage:d,$prev_pageview_max_scroll:a,$prev_pageview_max_scroll_percentage:_,$prev_pageview_last_content:u,$prev_pageview_last_content_percentage:h,$prev_pageview_max_content:c,$prev_pageview_max_content_percentage:p})}}return i.pathname&&(s.$prev_pageview_pathname=i.pathname),i.timestamp&&(s.$prev_pageview_duration=(e.getTime()-i.timestamp.getTime())/1e3),s}}var Sr={[o]:{exposure:"hidden"},[l]:{exposure:"hidden"},__cmpns:{exposure:"hidden"},[u]:{exposure:"hidden"},[c]:{exposure:"event"},[d]:{exposure:"hidden"},[_]:{exposure:"event"},[h]:{exposure:"hidden"},[p]:{exposure:"event"},[g]:{exposure:"event"},[v]:{exposure:"event"},[f]:{exposure:"hidden"},[m]:{exposure:"event"},[y]:{exposure:"hidden"},$session_recording_enabled_server_side:{exposure:"hidden"},[x]:{exposure:"hidden"},[k]:{exposure:"event"},$session_past_minimum_duration:{exposure:"event"},$session_recording_url_trigger_activated_session:{exposure:"event"},$session_recording_event_trigger_activated_session:{exposure:"event"},$debug_first_full_snapshot_timestamp:{exposure:"event"},[T]:{exposure:"derived",shouldSkipFromEventProperties:(e,t)=>t(),transformToEventProperties(e){if(!je(e))return{};for(var t={},i=Object.keys(e),s=0;i.length>s;s++)t["$feature/"+i[s]]=e[i[s]];return t}},[P]:{exposure:"event"},[I]:{exposure:"hidden"},[C]:{exposure:"hidden"},[R]:{exposure:"event"},[F]:{exposure:"event"},[L]:{exposure:"event"},[O]:{exposure:"hidden"},[M]:{exposure:"hidden"},[A]:{exposure:"hidden"},[D]:{exposure:"hidden"},[N]:{exposure:"event"},[U]:{exposure:"hidden"},$product_tours_activated:{exposure:"hidden"},$conversations_widget_session_id:{exposure:"event"},$conversations_ticket_id:{exposure:"event"},$conversations_widget_state:{exposure:"event"},$conversations_user_traits:{exposure:"event"},[H]:{exposure:"hidden"},[q]:{exposure:"hidden"},[z]:{exposure:"hidden"},[B]:{exposure:"hidden"},[j]:{exposure:"hidden"},[V]:{exposure:"hidden"},[W]:{exposure:"hidden"},[G]:{exposure:"hidden"},[K]:{exposure:"hidden"},[Y]:{exposure:"hidden"},[J]:{exposure:"hidden"},[b]:{exposure:"event"},[w]:{exposure:"event"},[E]:{exposure:"event"},[S]:{exposure:"event"},[Z]:{exposure:"event"},[ee]:{exposure:"event"},[te]:{exposure:"event"},$sdk_debug_replay_event_trigger_status:{exposure:"event"},$sdk_debug_replay_linked_flag_trigger_status:{exposure:"event"},$sdk_debug_replay_matched_recording_trigger_groups:{exposure:"event"},$sdk_debug_replay_remote_trigger_matching_config:{exposure:"event"},$sdk_debug_replay_trigger_groups_count:{exposure:"event"},$sdk_debug_replay_url_trigger_status:{exposure:"event"},$session_recording_start_reason:{exposure:"event"}},xr=[["$posthog_sr_group_event_trigger_",{exposure:"hidden"}],["$posthog_sr_group_url_trigger_",{exposure:"hidden"}],["$posthog_sr_group_sampling_",{exposure:"hidden"}]],kr=e=>{var t=null==me?void 0:me.createElement("a");return We(t)?null:(t.href=e,t)},Tr=function(e,t){for(var i,s=((e.split("#")[0]||"").split(/\?(.*)/)[1]||"").replace(/^\?+/g,"").split("&"),r=0;s.length>r;r++){var n=s[r].split("=");if(n[0]===t){i=n;break}}if(!ze(i)||2>i.length)return"";var o=i[1];try{o=decodeURIComponent(o)}catch(e){Zi.error("Skipping decoding for malformed query param: "+o)}return o.replace(/\+/g," ")},Pr=function(e,t,i){if(!e||!t||!t.length)return e;for(var s=e.split("#"),r=s[1],n=(s[0]||"").split("?"),o=n[1],a=n[0],l=(o||"").split("&"),u=[],c=0;l.length>c;c++){var d=l[c].split("=");ze(d)&&(t.includes(d[0])?u.push(d[0]+"="+i):u.push(l[c]))}var _=a;return null!=o&&(_+="?"+u.join("&")),null!=r&&(_+="#"+r),_},Ir=function(e,t){var i=e.match(new RegExp(t+"=([^&]*)"));return i?i[1]:null},Cr="https?://(.*)",Rr=["gclid","gclsrc","dclid","gbraid","wbraid","fbclid","msclkid","twclid","li_fat_id","igshid","ttclid","rdt_cid","epik","qclid","sccid","irclid","_kx"],Fr=["utm_source","utm_medium","utm_campaign","utm_content","utm_term","gad_source","mc_cid",...Rr],Lr="<masked>",$r=["li_fat_id"];function Or(e,t,i){if(!me)return{};var s,r=t?[...Rr,...i||[]]:[],n=Mr(Pr(me.URL,r,Lr),e),o=(s={},is($r,(function(e){var t=ws._get(e);s[e]=t||null})),s);return ss(o,n)}function Mr(e,t){var i=Fr.concat(t||[]),s={};return is(i,(function(t){var i=Tr(e,t);s[t]=i||null})),s}function Ar(e){var t=function(e){return e?0===e.search(Cr+"google.([^/?]*)")?"google":0===e.search(Cr+"bing.com")?"bing":0===e.search(Cr+"yahoo.com")?"yahoo":0===e.search(Cr+"duckduckgo.com")?"duckduckgo":null:null}(e),i="yahoo"!=t?"q":"p",s={};if(!Ye(t)){s.$search_engine=t;var r=me?Tr(me.referrer,i):"";r.length&&(s.ph_keyword=r)}return s}function Dr(){return navigator.language||navigator.userLanguage}var Nr="$direct";function Ur(){return(null==me?void 0:me.referrer)||Nr}function Hr(e,t){var i=e?[...Rr,...t||[]]:[],s=null==ye?void 0:ye.href.substring(0,1e3);return{r:Ur().substring(0,1e3),u:s?Pr(s,i,Lr):void 0}}function qr(e){var t,{r:i,u:s}=e,r={$referrer:i,$referring_domain:null==i?void 0:i==Nr?Nr:null==(t=kr(i))?void 0:t.host};if(s){r.$current_url=s;var n=kr(s);r.$host=null==n?void 0:n.host,r.$pathname=null==n?void 0:n.pathname;var o=Mr(s);ss(r,o)}if(i){var a=Ar(i);ss(r,a)}return r}function zr(){try{return Intl.DateTimeFormat().resolvedOptions().timeZone}catch(e){return}}function Br(){try{return(new Date).getTimezoneOffset()}catch(e){return}}var jr=["cookie","localstorage","localstorage+cookie","sessionstorage","memory"];class Vr{constructor(e,t){if(this._config=e,this.props={},this._campaign_params_saved=!1,this._name=(e=>{var t="";return e.token&&(t=e.token.replace(/\+/g,"PL").replace(/\//g,"SL").replace(/=/g,"EQ")),e.persistence_name?"ph_"+e.persistence_name:"ph_"+t+"_posthog"})(e),this._storage=this._buildStorage(e),this.load(),e.debug&&Zi.info("Persistence loaded",e.persistence,i({},this.props)),this.update_config(e,e,t),this.save(),pe){var s=()=>this.flush();cs(pe,"beforeunload",s,{capture:!1}),cs(pe,"pagehide",s,{capture:!1})}}_saveDebounceMs(){var e,t=null==(e=this._config)?void 0:e.persistence_save_debounce_ms;return Xe(t)&&t>0?t:0}isDisabled(){return!!this._disabled}_buildStorage(e){-1===jr.indexOf(e.persistence.toLowerCase())&&(Zi.critical("Unknown persistence type "+e.persistence+"; falling back to localStorage+cookie"),e.persistence="localStorage+cookie");var t=function(e,t){void 0===e&&(e=[]),void 0===t&&(t=!1);var s=[...xs,...e];return i({},Ss,{_parse(e){try{var i={};try{i=ws._parse(e)||{}}catch(e){}var s,r=JSON.parse(Ss._get(e)||"{}");if(t){var n={};for(var o in i){var a=i[o];Ye(a)||""===a||(n[o]=a)}s=ss(r,n)}else s=ss(i,r);return Ss._set(e,s),s}catch(e){}return null},_set(e,t,i,r,n,o){try{Ss._set(e,t,void 0,void 0,o);var a={};s.forEach((e=>{t[e]&&(a[e]=t[e])})),Object.keys(a).length&&ws._set(e,a,i,r,n,o)}catch(e){Ss._error(e)}},_remove(e,t){try{null==pe||pe.localStorage.removeItem(e),ws._remove(e,t)}catch(e){Ss._error(e)}}})}(e.cookie_persisted_properties||[],e.__preview_cookie_wins_on_conflict||!1),s=e.persistence.toLowerCase();return"localstorage"===s&&Ss._is_supported()?Ss:"localstorage+cookie"===s&&t._is_supported()?t:"sessionstorage"===s&&Is._is_supported()?Is:"memory"===s?Ts:"cookie"===s?ws:t._is_supported()?t:ws}_isFeatureFlagCacheStale(e){var t=null!=e?e:this._config.feature_flag_cache_ttl_ms;if(!t||0>=t)return!1;var i=this.props[B];return!i||"number"!=typeof i||Date.now()-i>t}properties(){var e={};return is(this.props,((t,i)=>{var s=(e=>{var t=Sr[e];if(t)return t;for(var[i,s]of xr)if(0===e.indexOf(i))return s})(i);if("derived"===(null==s?void 0:s.exposure)){if(null!=s.shouldSkipFromEventProperties&&s.shouldSkipFromEventProperties(t,i===T?()=>this._isFeatureFlagCacheStale():()=>!1))return;s.transformToEventProperties&&ss(e,s.transformToEventProperties(t))}else s&&"event"!==s.exposure||(e[i]=t)})),e}load(){if(!this._disabled){var e=this._storage._parse(this._name);e&&(this.props=ss({},e))}}refreshKey(e){if(!this._disabled){var t=this._storage._parse(this._name);t&&e in t?this._setProp(e,t[e]):this._deleteProp(e)}}save(){if(!this._disabled){var e=this._saveDebounceMs();e>0?We(this._pendingSaveTimer)&&(this._pendingSaveTimer=setTimeout((()=>{this._pendingSaveTimer=void 0,this._writeNow()}),e)):this._writeNow()}}flush(){We(this._pendingSaveTimer)||(clearTimeout(this._pendingSaveTimer),this._pendingSaveTimer=void 0,this._writeNow())}_writeNow(){if(!this._disabled){try{var e=JSON.stringify(this.props)+"|"+this._expire_days+"|"+this._cross_subdomain+"|"+this._secure;if(e===this._lastSavedSerialized)return;this._lastSavedSerialized=e}catch(e){}this._storage._set(this._name,this.props,this._expire_days,this._cross_subdomain,this._secure,this._config.debug)}}remove(){We(this._pendingSaveTimer)||(clearTimeout(this._pendingSaveTimer),this._pendingSaveTimer=void 0),this._storage._remove(this._name,!1),this._storage._remove(this._name,!0),this._lastSavedSerialized=void 0}clear(){this.remove(),this.props={}}register_once(e,t,i){if(je(e)){We(t)&&(t="None"),this._expire_days=We(i)?this._default_expiry:i;var s=!1;if(is(e,((e,i)=>{this.props.hasOwnProperty(i)&&this.props[i]!==t||(this._setProp(i,e),s=!0)})),s)return this.save(),!0}return!1}register(e,t){if(je(e)){this._expire_days=We(t)?this._default_expiry:t;var i=!1;if(is(e,((t,s)=>{e.hasOwnProperty(s)&&this.props[s]!==t&&(this._setProp(s,t),i=!0)})),i)return this.save(),!0}return!1}unregister(e){e in this.props&&(this._deleteProp(e),this.save())}update_campaign_params(){if(!this._campaign_params_saved){var e=Or(this._config.custom_campaign_params,this._config.mask_personal_data_properties,this._config.custom_personal_data_properties);Ve(as(e))||this.register(e),this._campaign_params_saved=!0}}update_search_keyword(){var e;this.register((e=null==me?void 0:me.referrer)?Ar(e):{})}update_referrer_info(){var e;this.register_once({$referrer:Ur(),$referring_domain:null!=me&&me.referrer&&(null==(e=kr(me.referrer))?void 0:e.host)||Nr},void 0)}set_initial_person_info(){this.props[G]||this.props[K]||this.register_once({[Y]:Hr(this._config.mask_personal_data_properties,this._config.custom_personal_data_properties)},void 0)}get_initial_props(){var e={};is([K,G],(t=>{var i=this.props[t];i&&is(i,(function(t,i){e["$initial_"+Ne(i)]=t}))}));var t,i,s=this.props[Y];if(s){var r=(t=qr(s),i={},is(t,(function(e,t){i["$initial_"+Ne(t)]=e})),i);ss(e,r)}return e}safe_merge(e){return is(this.props,(function(t,i){i in e||(e[i]=t)})),e}update_config(e,t,i){if(this._default_expiry=this._expire_days=e.cookie_expiration,this.set_disabled(e.disable_persistence||!!i),this.set_cross_subdomain(e.cross_subdomain_cookie),this.set_secure(e.secure_cookie),e.persistence!==t.persistence||!((e,t)=>{if(e.length!==t.length)return!1;var i=[...e].sort(),s=[...t].sort();return i.every(((e,t)=>e===s[t]))})(e.cookie_persisted_properties||[],t.cookie_persisted_properties||[])){var s=this._buildStorage(e),r=this.props;this.clear(),this._storage=s,this.props=r,this.save()}}set_disabled(e){this._disabled=e,this._disabled?this.remove():this.save()}set_cross_subdomain(e){e!==this._cross_subdomain&&(this._cross_subdomain=e,this.remove(),this.save())}set_secure(e){e!==this._secure&&(this._secure=e,this.remove(),this.save())}set_event_timer(e,t){var i=this.props[u]||{};i[e]=t,this._setProp(u,i),this.save()}remove_event_timer(e){var t=this.props[u]||{},i=t[e];return We(i)||(delete t[e],this._setProp(u,t),this.save()),i}get_property(e){return this.props[e]}set_property(e,t){this._setProp(e,t),this.save()}_setProp(e,t){this.props[e]=t}_deleteProp(e){delete this.props[e]}}var Wr={Activation:"events",Cancellation:"cancelEvents"},Gr={Button:"button",Tab:"tab",Selector:"selector"},Kr={TopLeft:"top_left",TopRight:"top_right",TopCenter:"top_center",MiddleLeft:"middle_left",MiddleRight:"middle_right",MiddleCenter:"middle_center",Left:"left",Center:"center",Right:"right",NextToTrigger:"next_to_trigger"},Yr={Top:"top",Left:"left",Right:"right",Bottom:"bottom"},Jr={Popover:"popover",API:"api",Widget:"widget",ExternalSurvey:"external_survey"},Xr={Open:"open",MultipleChoice:"multiple_choice",SingleChoice:"single_choice",Rating:"rating",Link:"link"},Qr={NextQuestion:"next_question",End:"end",ResponseBased:"response_based",SpecificQuestion:"specific_question"},Zr={Once:"once",Recurring:"recurring",Always:"always"},en={SHOWN:"survey shown",DISMISSED:"survey dismissed",SENT:"survey sent",ABANDONED:"survey abandoned"},tn={SURVEY_ID:"$survey_id",SURVEY_NAME:"$survey_name",SURVEY_RESPONSE:"$survey_response",SURVEY_ITERATION:"$survey_iteration",SURVEY_ITERATION_START_DATE:"$survey_iteration_start_date",SURVEY_PARTIALLY_COMPLETED:"$survey_partially_completed",SURVEY_SUBMISSION_ID:"$survey_submission_id",SURVEY_QUESTIONS:"$survey_questions",SURVEY_COMPLETED:"$survey_completed",PRODUCT_TOUR_ID:"$product_tour_id",SURVEY_LAST_SEEN_DATE:"$survey_last_seen_date",SURVEY_LANGUAGE:"$survey_language"},sn={Popover:"popover",Inline:"inline"},rn={backgroundColor:"#ffffff",textColor:"#1d1f27",buttonColor:"#1d1f27",borderRadius:8,buttonBorderRadius:6,borderColor:"#e5e7eb",fontFamily:"system-ui",boxShadow:"0 4px 12px rgba(0, 0, 0, 0.15)",showOverlay:!0,whiteLabel:!1,dismissOnClickOutside:!0,zIndex:2147483646},nn={SHOWN:"product tour shown",DISMISSED:"product tour dismissed",COMPLETED:"product tour completed",STEP_SHOWN:"product tour step shown",STEP_COMPLETED:"product tour step completed",BUTTON_CLICKED:"product tour button clicked",STEP_SELECTOR_FAILED:"product tour step selector failed",BANNER_CONTAINER_SELECTOR_FAILED:"product tour banner container selector failed",BANNER_ACTION_CLICKED:"product tour banner action clicked"},on={TOUR_ID:"$product_tour_id",TOUR_NAME:"$product_tour_name",TOUR_ITERATION:"$product_tour_iteration",TOUR_RENDER_REASON:"$product_tour_render_reason",TOUR_STEP_ID:"$product_tour_step_id",TOUR_STEP_ORDER:"$product_tour_step_order",TOUR_STEP_TYPE:"$product_tour_step_type",TOUR_DISMISS_REASON:"$product_tour_dismiss_reason",TOUR_BUTTON_TEXT:"$product_tour_button_text",TOUR_BUTTON_ACTION:"$product_tour_button_action",TOUR_BUTTON_LINK:"$product_tour_button_link",TOUR_BUTTON_TOUR_ID:"$product_tour_button_tour_id",TOUR_STEPS_COUNT:"$product_tour_steps_count",TOUR_STEP_SELECTOR:"$product_tour_step_selector",TOUR_STEP_SELECTOR_FOUND:"$product_tour_step_selector_found",TOUR_STEP_ELEMENT_TAG:"$product_tour_step_element_tag",TOUR_STEP_ELEMENT_ID:"$product_tour_step_element_id",TOUR_STEP_ELEMENT_CLASSES:"$product_tour_step_element_classes",TOUR_STEP_ELEMENT_TEXT:"$product_tour_step_element_text",TOUR_ERROR:"$product_tour_error",TOUR_MATCHES_COUNT:"$product_tour_matches_count",TOUR_FAILURE_PHASE:"$product_tour_failure_phase",TOUR_WAITED_FOR_ELEMENT:"$product_tour_waited_for_element",TOUR_WAIT_DURATION_MS:"$product_tour_wait_duration_ms",TOUR_BANNER_SELECTOR:"$product_tour_banner_selector",TOUR_LINKED_SURVEY_ID:"$product_tour_linked_survey_id",USE_MANUAL_SELECTOR:"$use_manual_selector",INFERENCE_DATA_PRESENT:"$inference_data_present",TOUR_LAST_SEEN_DATE:"$product_tour_last_seen_date",TOUR_TYPE:"$product_tour_type"},an=es("[RateLimiter]");class ln{constructor(e){this.serverLimits={},this.lastEventRateLimited=!1,this.checkForLimiting=e=>{var t=e.text;if(t&&t.length)try{(JSON.parse(t).quota_limited||[]).forEach((e=>{an.info((e||"events")+" is quota limited."),this.serverLimits[e]=(new Date).getTime()+6e4}))}catch(e){return void an.warn('could not rate limit - continuing. Error: "'+(null==e?void 0:e.message)+'"',{text:t})}},this.instance=e,this.lastEventRateLimited=this.clientRateLimitContext(!0).isRateLimited}get captureEventsPerSecond(){var e;return(null==(e=this.instance.config.rate_limiting)?void 0:e.events_per_second)||10}get captureEventsBurstLimit(){var e;return Math.max((null==(e=this.instance.config.rate_limiting)?void 0:e.events_burst_limit)||10*this.captureEventsPerSecond,this.captureEventsPerSecond)}clientRateLimitContext(e){var t,i,s;void 0===e&&(e=!1);var{captureEventsBurstLimit:r,captureEventsPerSecond:n}=this,o=(new Date).getTime(),a=null!==(t=null==(i=this.instance.persistence)?void 0:i.get_property(W))&&void 0!==t?t:{tokens:r,last:o};a.tokens+=(o-a.last)/1e3*n,a.last=o,a.tokens>r&&(a.tokens=r);var l=1>a.tokens;return l||e||(a.tokens=Math.max(0,a.tokens-1)),!l||this.lastEventRateLimited||e||this.instance.capture("$$client_ingestion_warning",{$$client_ingestion_warning_message:"posthog-js client rate limited. Config is set to "+n+" events per second and "+r+" events burst limit."},{skip_client_rate_limiting:!0}),this.lastEventRateLimited=l,null==(s=this.instance.persistence)||s.set_property(W,a),{isRateLimited:l,remainingTokens:a.tokens}}isServerRateLimited(e){var t=this.serverLimits[e||"events"]||!1;return!1!==t&&(new Date).getTime()<t}}var un=es("[RemoteConfig]");class cn{constructor(e){this._instance=e}get remoteConfig(){var e;return null==(e=ke._POSTHOG_REMOTE_CONFIG)||null==(e=e[this._instance.config.token])?void 0:e.config}_loadRemoteConfigJs(e){var t,i;null!=(t=ke.__PosthogExtensions__)&&t.loadExternalDependency?null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this._instance,"remote-config",(()=>e(this.remoteConfig))):e()}_loadRemoteConfigJSON(e){this._instance._send_request({method:"GET",url:this._instance.requestRouter.endpointFor("assets","/array/"+this._instance.config.token+"/config"),callback(t){e(t.json)}})}load(){try{if(this.remoteConfig)return un.info("Using preloaded remote config",this.remoteConfig),this._onRemoteConfig(this.remoteConfig),void this._startRefreshInterval();if(this._instance._shouldDisableFlags())return void un.warn("Remote config is disabled. Falling back to local config.");this._loadRemoteConfigJs((e=>{if(!e)return un.info("No config found after loading remote JS config. Falling back to JSON."),void this._loadRemoteConfigJSON((e=>{this._onRemoteConfig(e),this._startRefreshInterval()}));this._onRemoteConfig(e),this._startRefreshInterval()}))}catch(e){un.error("Error loading remote config",e)}}stop(){this._refreshInterval&&(clearInterval(this._refreshInterval),this._refreshInterval=void 0)}refresh(){!this._instance._shouldDisableFlags()&&me&&"hidden"!==me.visibilityState&&this._instance.reloadFeatureFlags()}_startRefreshInterval(){var e;if(!this._refreshInterval){var t=null!==(e=this._instance.config.remote_config_refresh_interval_ms)&&void 0!==e?e:3e5;0!==t&&(this._refreshInterval=setInterval((()=>{this.refresh()}),t))}}_onRemoteConfig(e){var t;e||un.error("Failed to fetch remote config from PostHog."),this._instance._onRemoteConfig(null!=e?e:{}),!1!==(null==e?void 0:e.hasFeatureFlags)&&(this._instance.config.advanced_disable_feature_flags_on_first_load||null==(t=this._instance.featureFlags)||t.ensureFlagsLoaded())}}var dn=(/* unused pure expression or super */ null && (["fatal","error","warning","log","info","debug"])),_n={GZipJS:"gzip-js",Base64:"base64"},hn=Uint8Array,pn=Uint16Array,gn=Uint32Array,vn=new hn([0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0,0,0,0]),fn=new hn([0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13,0,0]),mn=new hn([16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15]),yn=function(e,t){for(var i=new pn(31),s=0;31>s;++s)i[s]=t+=1<<e[s-1];var r=new gn(i[30]);for(s=1;30>s;++s)for(var n=i[s];i[s+1]>n;++n)r[n]=n-i[s]<<5|s;return[i,r]},bn=yn(vn,2),wn=bn[1];bn[0][28]=258,wn[258]=28;for(var En=yn(fn,0)[1],Sn=new pn(32768),xn=0;32768>xn;++xn){var kn=(43690&xn)>>>1|(21845&xn)<<1;Sn[xn]=((65280&(kn=(61680&(kn=(52428&kn)>>>2|(13107&kn)<<2))>>>4|(3855&kn)<<4))>>>8|(255&kn)<<8)>>>1}var Tn=function(e,t,i){for(var s=e.length,r=0,n=new pn(t);s>r;++r)++n[e[r]-1];var o,a=new pn(t);for(r=0;t>r;++r)a[r]=a[r-1]+n[r-1]<<1;if(i){o=new pn(1<<t);var l=15-t;for(r=0;s>r;++r)if(e[r])for(var u=r<<4|e[r],c=t-e[r],d=a[e[r]-1]++<<c,_=d|(1<<c)-1;_>=d;++d)o[Sn[d]>>>l]=u}else for(o=new pn(s),r=0;s>r;++r)o[r]=Sn[a[e[r]-1]++]>>>15-e[r];return o},Pn=new hn(288);for(xn=0;144>xn;++xn)Pn[xn]=8;for(xn=144;256>xn;++xn)Pn[xn]=9;for(xn=256;280>xn;++xn)Pn[xn]=7;for(xn=280;288>xn;++xn)Pn[xn]=8;var In=new hn(32);for(xn=0;32>xn;++xn)In[xn]=5;var Cn=Tn(Pn,9,0),Rn=Tn(In,5,0),Fn=function(e){return(e/8>>0)+(7&e&&1)},Ln=function(e,t,i){(null==i||i>e.length)&&(i=e.length);var s=new(e instanceof pn?pn:e instanceof gn?gn:hn)(i-t);return s.set(e.subarray(t,i)),s},$n=function(e,t,i){var s=t/8>>0;e[s]|=i<<=7&t,e[s+1]|=i>>>8},On=function(e,t,i){var s=t/8>>0;e[s]|=i<<=7&t,e[s+1]|=i>>>8,e[s+2]|=i>>>16},Mn=function(e,t){for(var i=[],s=0;e.length>s;++s)e[s]&&i.push({s:s,f:e[s]});var r=i.length,n=i.slice();if(!r)return[new hn(0),0];if(1==r){var o=new hn(i[0].s+1);return o[i[0].s]=1,[o,1]}i.sort((function(e,t){return e.f-t.f})),i.push({s:-1,f:25001});var a=i[0],l=i[1],u=0,c=1,d=2;for(i[0]={s:-1,f:a.f+l.f,l:a,r:l};c!=r-1;)a=i[i[d].f>i[u].f?u++:d++],l=i[u!=c&&i[d].f>i[u].f?u++:d++],i[c++]={s:-1,f:a.f+l.f,l:a,r:l};var _=n[0].s;for(s=1;r>s;++s)n[s].s>_&&(_=n[s].s);var h=new pn(_+1),p=An(i[c-1],h,0);if(p>t){s=0;var g=0,v=p-t,f=1<<v;for(n.sort((function(e,t){return h[t.s]-h[e.s]||e.f-t.f}));r>s;++s){var m=n[s].s;if(t>=h[m])break;g+=f-(1<<p-h[m]),h[m]=t}for(g>>>=v;g>0;){var y=n[s].s;t>h[y]?g-=1<<t-h[y]++-1:++s}for(;s>=0&&g;--s){var b=n[s].s;h[b]==t&&(--h[b],++g)}p=t}return[new hn(h),p]},An=function(e,t,i){return-1==e.s?Math.max(An(e.l,t,i+1),An(e.r,t,i+1)):t[e.s]=i},Dn=function(e){for(var t=e.length;t&&!e[--t];);for(var i=new pn(++t),s=0,r=e[0],n=1,o=function(e){i[s++]=e},a=1;t>=a;++a)if(e[a]==r&&a!=t)++n;else{if(!r&&n>2){for(;n>138;n-=138)o(32754);n>2&&(o(n>10?n-11<<5|28690:n-3<<5|12305),n=0)}else if(n>3){for(o(r),--n;n>6;n-=6)o(8304);n>2&&(o(n-3<<5|8208),n=0)}for(;n--;)o(r);n=1,r=e[a]}return[i.subarray(0,s),t]},Nn=function(e,t){for(var i=0,s=0;t.length>s;++s)i+=e[s]*t[s];return i},Un=function(e,t,i){var s=i.length,r=Fn(t+2);e[r]=255&s,e[r+1]=s>>>8,e[r+2]=255^e[r],e[r+3]=255^e[r+1];for(var n=0;s>n;++n)e[r+n+4]=i[n];return 8*(r+4+s)},Hn=function(e,t,i,s,r,n,o,a,l,u,c){$n(t,c++,i),++r[256];for(var d=Mn(r,15),_=d[0],h=d[1],p=Mn(n,15),g=p[0],v=p[1],f=Dn(_),m=f[0],y=f[1],b=Dn(g),w=b[0],E=b[1],S=new pn(19),x=0;m.length>x;++x)S[31&m[x]]++;for(x=0;w.length>x;++x)S[31&w[x]]++;for(var k=Mn(S,7),T=k[0],P=k[1],I=19;I>4&&!T[mn[I-1]];--I);var C,R,F,L,O=u+5<<3,M=Nn(r,Pn)+Nn(n,In)+o,A=Nn(r,_)+Nn(n,g)+o+14+3*I+Nn(S,T)+(2*S[16]+3*S[17]+7*S[18]);if(M>=O&&A>=O)return Un(t,c,e.subarray(l,l+u));if($n(t,c,1+(M>A)),c+=2,M>A){C=Tn(_,h,0),R=_,F=Tn(g,v,0),L=g;var D=Tn(T,P,0);for($n(t,c,y-257),$n(t,c+5,E-1),$n(t,c+10,I-4),c+=14,x=0;I>x;++x)$n(t,c+3*x,T[mn[x]]);c+=3*I;for(var N=[m,w],U=0;2>U;++U){var H=N[U];for(x=0;H.length>x;++x)$n(t,c,D[q=31&H[x]]),c+=T[q],q>15&&($n(t,c,H[x]>>>5&127),c+=H[x]>>>12)}}else C=Cn,R=Pn,F=Rn,L=In;for(x=0;a>x;++x)if(s[x]>255){var q;On(t,c,C[257+(q=s[x]>>>18&31)]),c+=R[q+257],q>7&&($n(t,c,s[x]>>>23&31),c+=vn[q]);var z=31&s[x];On(t,c,F[z]),c+=L[z],z>3&&(On(t,c,s[x]>>>5&8191),c+=fn[z])}else On(t,c,C[s[x]]),c+=R[s[x]];return On(t,c,C[256]),c+R[256]},qn=new gn([65540,131080,131088,131104,262176,1048704,1048832,2114560,2117632]),zn=function(){for(var e=new gn(256),t=0;256>t;++t){for(var i=t,s=9;--s;)i=(1&i&&3988292384)^i>>>1;e[t]=i}return e}(),Bn=function(e,t,i){for(;i;++t)e[t]=i,i>>>=8};function jn(e,t){void 0===t&&(t={});var i=function(){var e=4294967295;return{p(t){for(var i=e,s=0;t.length>s;++s)i=zn[255&i^t[s]]^i>>>8;e=i},d(){return 4294967295^e}}}(),s=e.length;i.p(e);var r,n,o,a,l,u=(a=10+((r=t).filename&&r.filename.length+1||0),l=8,function(e,t,i,s,r,n){var o=e.length,a=new hn(s+o+5*(1+Math.floor(o/7e3))+r),l=a.subarray(s,a.length-r),u=0;if(!t||8>o)for(var c=0;o>=c;c+=65535){var d=c+65535;o>d?u=Un(l,u,e.subarray(c,d)):(l[c]=!0,u=Un(l,u,e.subarray(c,o)))}else{for(var _=qn[t-1],h=_>>>13,p=8191&_,g=(1<<i)-1,v=new pn(32768),f=new pn(g+1),m=Math.ceil(i/3),y=2*m,b=function(t){return(e[t]^e[t+1]<<m^e[t+2]<<y)&g},w=new gn(25e3),E=new pn(288),S=new pn(32),x=0,k=0,T=(c=0,0),P=0,I=0;o>c;++c){var C=b(c),R=32767&c,F=f[C];if(v[R]=F,f[C]=R,c>=P){var L=o-c;if((x>7e3||T>24576)&&L>423){u=Hn(e,l,0,w,E,S,k,T,I,c-I,u),T=x=k=0,I=c;for(var O=0;286>O;++O)E[O]=0;for(O=0;30>O;++O)S[O]=0}var M=2,A=0,D=p,N=R-F&32767;if(L>2&&C==b(c-N))for(var U=Math.min(h,L)-1,H=Math.min(32767,c),q=Math.min(258,L);H>=N&&--D&&R!=F;){if(e[c+M]==e[c+M-N]){for(var z=0;q>z&&e[c+z]==e[c+z-N];++z);if(z>M){if(M=z,A=N,z>U)break;var B=Math.min(N,z-2),j=0;for(O=0;B>O;++O){var V=c-N+O+32768&32767,W=V-v[V]+32768&32767;W>j&&(j=W,F=V)}}}N+=(R=F)-(F=v[R])+32768&32767}if(A){w[T++]=268435456|wn[M]<<18|En[A];var G=31&wn[M],K=31&En[A];k+=vn[G]+fn[K],++E[257+G],++S[K],P=c+M,++x}else w[T++]=e[c],++E[e[c]]}}u=Hn(e,l,!0,w,E,S,k,T,I,c-I,u)}return Ln(a,0,s+Fn(u)+r)}(n=e,null==(o=t).level?6:o.level,null==o.mem?Math.ceil(1.5*Math.max(8,Math.min(13,Math.log(n.length)))):12+o.mem,a,l)),c=u.length;return function(e,t){var i=t.filename;if(e[0]=31,e[1]=139,e[2]=8,e[8]=2>t.level?4:9==t.level?2:0,e[9]=3,0!=t.mtime&&Bn(e,4,Math.floor(new Date(t.mtime||Date.now())/1e3)),i){e[3]=8;for(var s=0;i.length>=s;++s)e[s+10]=i.charCodeAt(s)}}(u,t),Bn(u,c-8,i.d()),Bn(u,c-4,s),u}var Vn=!!we||!!be,Wn="text/plain",Gn=!1,Kn=(e,t)=>{var[i,s]=e.split("#"),[r,n]=i.split("?");if(!n)return e;var o=n.split("&").filter((e=>e.split("=")[0]!==t)).join("&");return r+(o?"?"+o:"")+(s?"#"+s:"")},Yn=function(e,t,s){var r;void 0===s&&(s=!0);var[n,o]=e.split("?"),a=i({},t),l=null!==(r=null==o?void 0:o.split("&").map((e=>{var t,[i,r]=e.split("="),n=s&&null!==(t=a[i])&&void 0!==t?t:r;return delete a[i],i+"="+n})))&&void 0!==r?r:[],u=function(e,t){var i,s;void 0===t&&(t="&");var r=[];return is(e,(function(e,t){We(e)||We(t)||"undefined"===t||(i=encodeURIComponent((e=>e instanceof File)(e)?e.name:e.toString()),s=encodeURIComponent(t),r[r.length]=s+"="+i)})),r.join(t)}(a);return u&&l.push(u),n+"?"+l.join("&")},Jn=(e,t)=>JSON.stringify(e,((e,t)=>"bigint"==typeof t?t.toString():t),t),Xn=e=>{if(e._encodedBody)return e._encodedBody;var{data:t,compression:i}=e;if(t){if(i===_n.GZipJS){var s=jn(function(e,t){var i=e.length;if("undefined"!=typeof TextEncoder)return(new TextEncoder).encode(e);for(var s=new hn(e.length+(e.length>>>1)),r=0,n=function(e){s[r++]=e},o=0;i>o;++o){if(r+5>s.length){var a=new hn(r+8+(i-o<<1));a.set(s),s=a}var l=e.charCodeAt(o);128>l?n(l):2048>l?(n(192|l>>>6),n(128|63&l)):l>55295&&57344>l?(n(240|(l=65536+(1047552&l)|1023&e.charCodeAt(++o))>>>18),n(128|l>>>12&63),n(128|l>>>6&63),n(128|63&l)):(n(224|l>>>12),n(128|l>>>6&63),n(128|63&l))}return Ln(s,0,r)}(Jn(t)),{mtime:0});return{contentType:Wn,body:s.buffer.slice(s.byteOffset,s.byteOffset+s.byteLength),estimatedSize:s.byteLength}}if(i===_n.Base64){var r=function(e){return e?btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,((e,t)=>String.fromCharCode(parseInt(t,16))))):e}(Jn(t)),n=(e=>"data="+encodeURIComponent("string"==typeof e?e:Jn(e)))(r);return{contentType:"application/x-www-form-urlencoded",body:n,estimatedSize:new Blob([n]).size}}var o=Jn(t);return{contentType:"application/json",body:o,estimatedSize:new Blob([o]).size}}},Qn=e=>{var t,s,r,n=Xn(e);return!n||(s=e.compression,r=Tr(e.url,"compression"),s!==Te.GZipJS&&r!==Te.GZipJS&&"gzip"!==r)||((t=n.body)instanceof ArrayBuffer?Ce(new Uint8Array(t)):ArrayBuffer.isView(t)&&Ce(new Uint8Array(t.buffer,t.byteOffset,t.byteLength)))?{url:e.url,encodedBody:n}:(Gn=!0,{url:Kn(e.url,"compression"),encodedBody:Xn(i({},e,{compression:void 0,_encodedBody:void 0}))})},Zn=function(){var e=t((function*(e){var t=Jn(e.data),s=yield function(e,t,i){return $e.apply(this,arguments)}(t,n.DEBUG,{rethrow:!0});if(!s)return e;var r=yield s.arrayBuffer();return i({},e,{_encodedBody:{contentType:Wn,body:r,estimatedSize:r.byteLength}})}));return function(t){return e.apply(this,arguments)}}(),eo=(e,t)=>Yn(e,{_:(new Date).getTime().toString(),ver:n.JS_SDK_VERSION,compression:t}),to=[];be&&to.push({transport:"fetch",method(e){var t,{url:s,encodedBody:r}=Qn(e),{contentType:n,body:o,estimatedSize:a}=null!=r?r:{},l=new Headers;is(e.headers,(function(e,t){l.append(t,e)})),n&&l.append("Content-Type",n);var u=null;if(Ee){var c=new Ee;u={signal:c.signal,timeout:setTimeout((()=>c.abort()),e.timeout)}}be(s,i({method:(null==e?void 0:e.method)||"GET",headers:l,keepalive:"POST"===e.method&&52428.8>(a||0),body:o,signal:null==(t=u)?void 0:t.signal},e.fetchOptions)).then((t=>t.text().then((i=>{var s={statusCode:t.status,text:i};if(200===t.status)try{s.json=JSON.parse(i)}catch(e){Zi.error(e)}null==e.callback||e.callback(s)})))).catch((t=>{Zi.error(t),null==e.callback||e.callback({statusCode:0,error:t})})).finally((()=>u?clearTimeout(u.timeout):null))}}),we&&to.push({transport:"XHR",method(e){var t=new we,{url:i,encodedBody:s}=Qn(e);t.open(e.method||"GET",i,!0);var{contentType:r,body:n}=null!=s?s:{};is(e.headers,(function(e,i){t.setRequestHeader(i,e)})),r&&t.setRequestHeader("Content-Type",r),e.timeout&&(t.timeout=e.timeout),e.disableXHRCredentials||(t.withCredentials=!0),t.onreadystatechange=()=>{if(4===t.readyState){var i={statusCode:t.status,text:t.responseText};if(200===t.status)try{i.json=JSON.parse(t.responseText)}catch(e){}null==e.callback||e.callback(i)}},t.send(n)}}),null!=fe&&fe.sendBeacon&&to.push({transport:"sendBeacon",method(e){try{var{url:t,encodedBody:i}=Qn(e),s=Yn(t,{beacon:"1"}),{contentType:r,body:n}=null!=i?i:{};if(!n)return;var o=n instanceof Blob?n:new Blob([n],{type:r});fe.sendBeacon(s,o)}catch(e){}}});var io=3e3;class so{constructor(e,t){this._isPaused=!0,this._queue=[],this._flushTimeoutMs=lt((null==t?void 0:t.flush_interval_ms)||io,250,5e3,Zi.createLogger("flush interval"),io),this._sendRequest=e}enqueue(e){this._queue.push(e),this._flushTimeout||this._setFlushTimeout()}unload(){this._clearFlushTimeout();var e=this._queue.length>0?this._formatQueue():{},t=Object.values(e);[...t.filter((e=>0===e.url.indexOf("/e"))),...t.filter((e=>0!==e.url.indexOf("/e")))].map((e=>{this._sendRequest(i({},e,{transport:"sendBeacon"}))}))}enable(){this._isPaused=!1,this._setFlushTimeout()}_setFlushTimeout(){var e=this;this._isPaused||(this._flushTimeout=setTimeout((()=>{if(this._clearFlushTimeout(),this._queue.length>0){var t=this._formatQueue(),i=function(){var i=t[s],r=(new Date).getTime();i.data&&ze(i.data)&&is(i.data,(e=>{e.offset=Math.abs(e.timestamp-r),delete e.timestamp})),e._sendRequest(i)};for(var s in t)i()}}),this._flushTimeoutMs))}_clearFlushTimeout(){clearTimeout(this._flushTimeout),this._flushTimeout=void 0}_formatQueue(){var e={};return is(this._queue,(t=>{var s,r=t,n=(r?r.batchKey:null)||r.url;We(e[n])&&(e[n]=i({},r,{data:[]})),null==(s=e[n].data)||s.push(r.data)})),this._queue=[],e}}var ro=["retriesPerformedSoFar"];class no{constructor(e){this._isPolling=!1,this._pollIntervalMs=3e3,this._queue=[],this._instance=e,this._queue=[],this._areWeOnline=!0,!We(pe)&&"onLine"in pe.navigator&&(this._areWeOnline=pe.navigator.onLine,this._onlineListener=()=>{this._areWeOnline=!0,this._flush()},this._offlineListener=()=>{this._areWeOnline=!1},cs(pe,"online",this._onlineListener),cs(pe,"offline",this._offlineListener))}get length(){return this._queue.length}retriableRequest(e){var{retriesPerformedSoFar:t}=e,r=s(e,ro);Qe(t)&&(r.url=Yn(r.url,{retry_count:t})),this._instance._send_request(i({},r,{callback:e=>{200===e.statusCode||e.statusCode>=400&&500>e.statusCode||(null!=t?t:0)>=10?null==r.callback||r.callback(e):this._enqueue(i({retriesPerformedSoFar:t},r))}}))}_enqueue(e){var t=e.retriesPerformedSoFar||0;e.retriesPerformedSoFar=t+1;var i=function(e){var t=3e3*Math.pow(2,e),i=t/2,s=Math.min(18e5,t),r=Math.random()-.5;return Math.ceil(s+r*(s-i))}(t),s=Date.now()+i;this._queue.push({retryAt:s,requestOptions:e});var r="Enqueued failed request for retry in "+i;navigator.onLine||(r+=" (Browser is offline)"),Zi.warn(r),this._isPolling||(this._isPolling=!0,this._poll())}_poll(){if(this._poller&&clearTimeout(this._poller),0===this._queue.length)return this._isPolling=!1,void(this._poller=void 0);this._poller=setTimeout((()=>{this._areWeOnline&&this._queue.length>0&&this._flush(),this._poll()}),this._pollIntervalMs)}_flush(){var e=Date.now(),t=[],i=this._queue.filter((i=>e>i.retryAt||(t.push(i),!1)));if(this._queue=t,i.length>0)for(var{requestOptions:s}of i)this.retriableRequest(s)}unload(){for(var{requestOptions:e}of(this._poller&&(clearTimeout(this._poller),this._poller=void 0),this._isPolling=!1,We(pe)||(this._onlineListener&&(pe.removeEventListener("online",this._onlineListener),this._onlineListener=void 0),this._offlineListener&&(pe.removeEventListener("offline",this._offlineListener),this._offlineListener=void 0)),this._queue))try{this._instance._send_request(i({},e,{transport:"sendBeacon"}))}catch(e){Zi.error(e)}this._queue=[]}}class oo{constructor(e){this._updateScrollData=()=>{var e,t,i,s;this._context||(this._context={});var r=this.scrollElement(),n=this.scrollY(),o=r?Math.max(0,r.scrollHeight-r.clientHeight):0,a=n+((null==r?void 0:r.clientHeight)||0),l=(null==r?void 0:r.scrollHeight)||0;this._context.lastScrollY=Math.ceil(n),this._context.maxScrollY=Math.max(n,null!==(e=this._context.maxScrollY)&&void 0!==e?e:0),this._context.maxScrollHeight=Math.max(o,null!==(t=this._context.maxScrollHeight)&&void 0!==t?t:0),this._context.lastContentY=a,this._context.maxContentY=Math.max(a,null!==(i=this._context.maxContentY)&&void 0!==i?i:0),this._context.maxContentHeight=Math.max(l,null!==(s=this._context.maxContentHeight)&&void 0!==s?s:0)},this._instance=e}get _scrollRoot(){return this._instance.config.scroll_root_selector}getContext(){return this._context}resetContext(){var e=this._context;return setTimeout(this._updateScrollData,0),e}startMeasuringScrollPosition(){cs(pe,"scroll",this._updateScrollData,{capture:!0}),cs(pe,"scrollend",this._updateScrollData,{capture:!0}),cs(pe,"resize",this._updateScrollData)}scrollElement(){if(!this._scrollRoot)return null==pe?void 0:pe.document.documentElement;var e=ze(this._scrollRoot)?this._scrollRoot:[this._scrollRoot];for(var t of e){var i=null==pe?void 0:pe.document.querySelector(t);if(i)return i}}scrollY(){if(this._scrollRoot){var e=this.scrollElement();return e&&e.scrollTop||0}return pe&&(pe.scrollY||pe.pageYOffset||pe.document.documentElement.scrollTop)||0}scrollX(){if(this._scrollRoot){var e=this.scrollElement();return e&&e.scrollLeft||0}return pe&&(pe.scrollX||pe.pageXOffset||pe.document.documentElement.scrollLeft)||0}}var ao=e=>Hr(null==e?void 0:e.config.mask_personal_data_properties,null==e?void 0:e.config.custom_personal_data_properties);class lo{constructor(e,t,i,s){this._onSessionIdCallback=e=>{var t=this._getStored();if(!t||t.sessionId!==e){var i={sessionId:e,props:this._sessionSourceParamGenerator(this._instance)};this._persistence.register({[V]:i})}},this._instance=e,this._sessionIdManager=t,this._persistence=i,this._sessionSourceParamGenerator=s||ao,this._sessionIdManager.onSessionId(this._onSessionIdCallback)}_getStored(){return this._persistence.props[V]}getSetOnceProps(){var e,t=null==(e=this._getStored())?void 0:e.props;return t?"r"in t?qr(t):{$referring_domain:t.referringDomain,$pathname:t.initialPathName,utm_source:t.utm_source,utm_campaign:t.utm_campaign,utm_medium:t.utm_medium,utm_content:t.utm_content,utm_term:t.utm_term}:{}}getSessionProps(){var e={};return is(as(this.getSetOnceProps()),((t,i)=>{"$current_url"===i&&(i="url"),e["$session_entry_"+Ne(i)]=t})),e}}class uo{constructor(){this._events={}}on(e,t){return this._events[e]||(this._events[e]=[]),this._events[e].push(t),()=>{this._events[e]=this._events[e].filter((e=>e!==t))}}emit(e,t){for(var i of this._events[e]||[])i(t);for(var s of this._events["*"]||[])s(e,t)}}var co=es("[SessionId]");class _o{on(e,t){return this._eventEmitter.on(e,t)}constructor(e,t,i){var s;if(this._lastPersistedActivityTimestamp=null,this._sessionIdChangedHandlers=[],this._beforeUnloadListener=void 0,this._eventEmitter=new uo,this._sessionHasBeenIdleTooLong=(e,t)=>!(!Qe(e)||!Qe(t))&&Math.abs(e-t)>this.sessionTimeoutMs,!e.persistence)throw new Error("SessionIdManager requires a PostHogPersistence instance");if(e.config.cookieless_mode===re)throw new Error('SessionIdManager cannot be used with cookieless_mode="always"');this._config=e.config,this._persistence=e.persistence,this._windowId=void 0,this._sessionId=void 0,this._sessionStartTimestamp=null,this._sessionActivityTimestamp=null,this._sessionIdGenerator=t||fs,this._windowIdGenerator=i||fs;var r=this._config.persistence_name||this._config.token;if(this._sessionTimeoutMs=1e3*lt(this._config.session_idle_timeout_seconds||1800,60,36e3,co.createLogger("session_idle_timeout_seconds"),1800),e.register({$configured_session_timeout_ms:this._sessionTimeoutMs}),this._resetIdleTimer(),this._window_id_storage_key="ph_"+r+"_window_id",this._primary_window_exists_storage_key="ph_"+r+"_primary_window_exists",this._canUseSessionStorage()){var n=Is._parse(this._window_id_storage_key),o=Is._parse(this._primary_window_exists_storage_key);n&&!o?this._windowId=n:Is._remove(this._window_id_storage_key),Is._set(this._primary_window_exists_storage_key,!0)}if(null!=(s=this._config.bootstrap)&&s.sessionID)try{var a=(e=>{var t=this._config.bootstrap.sessionID.replace(/-/g,"");if(32!==t.length)throw new Error("Not a valid UUID");if("7"!==t[12])throw new Error("Not a UUIDv7");return parseInt(t.substring(0,12),16)})();this._setSessionId(this._config.bootstrap.sessionID,(new Date).getTime(),a)}catch(e){co.error("Invalid sessionID in bootstrap",e)}this._listenToReloadWindow()}get sessionTimeoutMs(){return this._sessionTimeoutMs}onSessionId(e){return We(this._sessionIdChangedHandlers)&&(this._sessionIdChangedHandlers=[]),this._sessionIdChangedHandlers.push(e),this._sessionId&&e(this._sessionId,this._windowId),()=>{this._sessionIdChangedHandlers=this._sessionIdChangedHandlers.filter((t=>t!==e))}}_canUseSessionStorage(){return"memory"!==this._config.persistence&&!this._persistence._disabled&&Is._is_supported()}_setWindowId(e){e!==this._windowId&&(this._windowId=e,this._canUseSessionStorage()&&Is._set(this._window_id_storage_key,e))}_getWindowId(){return this._windowId?this._windowId:this._canUseSessionStorage()?Is._parse(this._window_id_storage_key):null}_isActivityChangeBelowGranularity(e){var t=this._lastPersistedActivityTimestamp;return!Ye(t)&&!Ye(e)&&5e3>Math.abs(e-t)}_setSessionId(e,t,i){var s=t!==this._sessionActivityTimestamp,r=!(e!==this._sessionId||i!==this._sessionStartTimestamp);this._sessionStartTimestamp=i,this._sessionActivityTimestamp=t,this._sessionId=e,r&&!s||r&&this._isActivityChangeBelowGranularity(t)||(this._lastPersistedActivityTimestamp=t,this._persistence.register({[x]:[t,e,i]}))}_useCrossTabRefreshHardening(){var e,t=null==(e=this._config)?void 0:e.persistence_save_debounce_ms;return Qe(t)&&t>0}_flushPendingActivityTimestamp(){var e;if(!Ye(this._sessionActivityTimestamp)&&this._sessionActivityTimestamp!==this._lastPersistedActivityTimestamp){this._useCrossTabRefreshHardening()?this._persistence.refreshKey(x):(this._persistence.flush(),this._persistence.load());var[,t,i]=this._getSessionId();t===this._sessionId&&i===this._sessionStartTimestamp&&(this._lastPersistedActivityTimestamp=this._sessionActivityTimestamp,this._persistence.register({[x]:[this._sessionActivityTimestamp,null!==(e=this._sessionId)&&void 0!==e?e:null,this._sessionStartTimestamp]}),this._persistence.flush())}}_freshestActivityTimestamp(){var[e]=this._getSessionId(),t=Qe(e)?e:0,i=Qe(this._sessionActivityTimestamp)?this._sessionActivityTimestamp:0;return Math.max(t,i)}_getSessionId(){var e=this._persistence.props[x];return ze(e)&&2===e.length&&e.push(e[0]),e||[0,null,0]}resetSessionId(){this._lastPersistedActivityTimestamp=null,clearTimeout(this._enforceIdleTimeout),this._enforceIdleTimeout=void 0,this._setSessionId(null,null,null)}destroy(){this._flushPendingActivityTimestamp(),clearTimeout(this._enforceIdleTimeout),this._enforceIdleTimeout=void 0,this._beforeUnloadListener&&pe&&(pe.removeEventListener(ue,this._beforeUnloadListener,{capture:!1}),this._beforeUnloadListener=void 0),this._sessionIdChangedHandlers=[]}_listenToReloadWindow(){this._beforeUnloadListener=()=>{this._flushPendingActivityTimestamp(),this._canUseSessionStorage()&&Is._remove(this._primary_window_exists_storage_key)},cs(pe,ue,this._beforeUnloadListener,{capture:!1})}checkAndGetSessionAndWindowId(e,t){if(void 0===e&&(e=!1),void 0===t&&(t=null),this._config.cookieless_mode===re)throw new Error('checkAndGetSessionAndWindowId should not be called with cookieless_mode="always"');var i=t||(new Date).getTime(),[,s,r]=this._getSessionId(),n=this._freshestActivityTimestamp(),o=this._getWindowId(),a=Qe(r)&&Math.abs(i-r)>864e5,l=!1,u=!s,c=!u&&!e&&this._sessionHasBeenIdleTooLong(i,n);u||c||a?(s=this._sessionIdGenerator(),o=this._windowIdGenerator(),co.info("new session ID generated",{sessionId:s,windowId:o,changeReason:{noSessionId:u,activityTimeout:c,sessionPastMaximumLength:a}}),r=i,l=!0):o||(o=this._windowIdGenerator(),l=!0);var d=Qe(n)&&e&&!a?n:i,_=Qe(r)?r:(new Date).getTime();return this._setWindowId(o),this._setSessionId(s,d,_),e||this._resetIdleTimer(),l&&this._sessionIdChangedHandlers.forEach((e=>e(s,o,l?{noSessionId:u,activityTimeout:c,sessionPastMaximumLength:a}:void 0))),{sessionId:s,windowId:o,sessionStartTimestamp:_,changeReason:l?{noSessionId:u,activityTimeout:c,sessionPastMaximumLength:a}:void 0,lastActivityTimestamp:n}}_resetIdleTimer(){clearTimeout(this._enforceIdleTimeout),this._enforceIdleTimeout=setTimeout((()=>{var e=this._freshestActivityTimestamp();if(this._sessionHasBeenIdleTooLong((new Date).getTime(),e)){var t=this._sessionId;this.resetSessionId(),this._eventEmitter.emit("forcedIdleReset",{idleSessionId:t})}}),1.1*this.sessionTimeoutMs)}}var ho=function(e,t){if(!e)return!1;var i=e.userAgent;if(i&&Me(i,t))return!0;try{var s=null==e?void 0:e.userAgentData;if(null!=s&&s.brands&&s.brands.some((e=>Me(null==e?void 0:e.brand,t))))return!0}catch(e){}return!!e.webdriver},po=function(e,t){if(!function(e){try{new RegExp(e)}catch(e){return!1}return!0}(t))return!1;try{return new RegExp(t).test(e)}catch(e){return!1}};function go(e,t,i){return Jn({distinct_id:e,userPropertiesToSet:t,userPropertiesToSetOnce:i})}var vo={exact:(e,t)=>t.some((t=>e.some((e=>t===e)))),is_not:(e,t)=>t.every((t=>e.every((e=>t!==e)))),regex:(e,t)=>t.some((t=>e.some((e=>po(t,e))))),not_regex:(e,t)=>t.every((t=>e.every((e=>!po(t,e))))),icontains:(e,t)=>t.map(fo).some((t=>e.map(fo).some((e=>t.includes(e))))),not_icontains:(e,t)=>t.map(fo).every((t=>e.map(fo).every((e=>!t.includes(e))))),gt:(e,t)=>t.some((t=>{var i=parseFloat(t);return!isNaN(i)&&e.some((e=>i>parseFloat(e)))})),lt:(e,t)=>t.some((t=>{var i=parseFloat(t);return!isNaN(i)&&e.some((e=>i<parseFloat(e)))}))},fo=e=>e.toLowerCase();function mo(e,t){return!e||Object.entries(e).every((e=>{var[i,s]=e,r=null==t?void 0:t[i];if(We(r)||Ye(r))return!1;var n=[String(r)],o=vo[s.operator];return!!o&&o(s.values,n)}))}var yo="custom",bo="i.posthog.com",wo=/^\/static\//;class Eo{constructor(e){this._regionCache={},this.instance=e}get apiHost(){var e=this.instance.config.api_host.trim().replace(/\/$/,"");return"https://app.posthog.com"===e?"https://us.i.posthog.com":e}get flagsApiHost(){var e=this.instance.config.flags_api_host;return e?e.trim().replace(/\/$/,""):this.apiHost}get uiHost(){var e,t=null==(e=this.instance.config.ui_host)?void 0:e.replace(/\/$/,"");return t||(t=this.apiHost.replace("."+bo,".posthog.com")),"https://app.posthog.com"===t?"https://us.posthog.com":t}get region(){return this._regionCache[this.apiHost]||(this._regionCache[this.apiHost]=/https:\/\/(app|us|us-assets)(\.i)?\.posthog\.com/i.test(this.apiHost)?"us":/https:\/\/(eu|eu-assets)(\.i)?\.posthog\.com/i.test(this.apiHost)?"eu":yo),this._regionCache[this.apiHost]}_staticAssetHostOverride(e){var t=this.instance.config.__preview_external_dependency_versioned_paths;if("string"==typeof t&&wo.test(e))return t.trim().replace(/\/$/,"")||void 0}endpointFor(e,t){if(void 0===t&&(t=""),t&&(t="/"===t[0]?t:"/"+t),"ui"===e)return this.uiHost+t;if("flags"===e)return this.flagsApiHost+t;if("assets"===e){var i=this._staticAssetHostOverride(t);if(i)return""+i+t}if(this.region===yo)return this.apiHost+t;var s=bo+t;switch(e){case"assets":return"https://"+this.region+"-assets."+s;case"api":return"https://"+this.region+"."+s}}}var So=es("[Surveys]"),xo="seenSurvey_",ko=[Jr.Popover,Jr.Widget,Jr.API],To={ignoreConditions:!1,ignoreDelay:!1,displayType:sn.Popover},Po=es("[PostHog ExternalIntegrations]"),Io={intercom:"intercom-integration",crispChat:"crisp-chat-integration"};class Co{constructor(e){this._instance=e}_loadScript(e,t){var i;null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this._instance,e,(e=>{if(e)return Po.error("failed to load script",e);t()}))}startIfEnabledOrStop(){var e=this,t=function(t){var i,r,n;!s||null!=(i=ke.__PosthogExtensions__)&&null!=(i=i.integrations)&&i[t]||e._loadScript(Io[t],(()=>{var i;null==(i=ke.__PosthogExtensions__)||null==(i=i.integrations)||null==(i=i[t])||i.start(e._instance)})),!s&&null!=(r=ke.__PosthogExtensions__)&&null!=(r=r.integrations)&&r[t]&&(null==(n=ke.__PosthogExtensions__)||null==(n=n.integrations)||null==(n=n[t])||n.stop())};for(var[i,s]of Object.entries(null!==(r=this._instance.config.integrations)&&void 0!==r?r:{})){var r;t(i)}}}var Ro,Fo={},Lo=0,$o=()=>{},Oo='Consent opt in/out is not valid with cookieless_mode="always" and will be ignored',Mo="Surveys module not available",Ao="sanitize_properties is deprecated. Use before_send instead",Do="Invalid value for property_denylist config: ",No="posthog",Uo=!Vn&&-1===(null==xe?void 0:xe.indexOf("MSIE"))&&-1===(null==xe?void 0:xe.indexOf("Mozilla")),Ho=e=>{var t;return i({api_host:"https://us.i.posthog.com",flags_api_host:null,ui_host:null,token:"",autocapture:!0,cross_subdomain_cookie:us(null==me?void 0:me.location),persistence:"localStorage+cookie",persistence_name:"",cookie_persisted_properties:[],loaded:$o,save_campaign_params:!0,custom_campaign_params:[],custom_blocked_useragents:[],save_referrer:!0,capture_pageleave:"if_capture_pageview",defaults:null!=e?e:"unset",__preview_deferred_init_extensions:!1,__preview_external_dependency_versioned_paths:!1,__preview_cookie_wins_on_conflict:!1,debug:ye&&Ge(null==ye?void 0:ye.search)&&-1!==ye.search.indexOf("__posthog_debug=true")||!1,cookie_expiration:365,upgrade:!1,disable_session_recording:!1,disable_persistence:!1,disable_web_experiments:!0,disable_surveys:!1,disable_surveys_automatic_display:!1,disable_conversations:!1,disable_product_tours:!1,disable_external_dependency_loading:!1,enable_recording_console_log:void 0,secure_cookie:"https:"===(null==pe||null==(t=pe.location)?void 0:t.protocol),ip:!1,opt_out_capturing_by_default:!1,opt_out_persistence_by_default:!1,opt_out_useragent_filter:!1,opt_out_capturing_persistence_type:"localStorage",consent_persistence_name:null,opt_out_capturing_cookie_prefix:null,opt_in_site_apps:!1,property_denylist:[],respect_dnt:!1,sanitize_properties:null,request_headers:{},request_batching:!0,properties_string_max_length:65535,mask_all_element_attributes:!1,mask_all_text:!1,mask_personal_data_properties:!1,custom_personal_data_properties:[],advanced_disable_flags:!1,advanced_disable_decide:!1,advanced_disable_feature_flags:!1,advanced_disable_feature_flags_on_first_load:!1,advanced_only_evaluate_survey_feature_flags:!1,advanced_feature_flags_dedup_per_session:!1,advanced_enable_surveys:!1,advanced_disable_toolbar_metrics:!1,feature_flag_request_timeout_ms:3e3,surveys_request_timeout_ms:1e4,on_request_error(e){Zi.error("Bad HTTP status: "+e.statusCode+" "+e.text)},get_device_id:e=>e,capture_performance:void 0,name:"posthog",bootstrap:{},disable_compression:!1,session_idle_timeout_seconds:1800,person_profiles:ae,before_send:void 0,request_queue_config:{flush_interval_ms:io},error_tracking:{},_onCapture:$o,__preview_eager_load_replay:!1},(e=>({rageclick:e&&e>="2026-05-30"?{content_ignorelist:Ks,ignore_text_selection:!0}:!e||"2025-11-30">e||{content_ignorelist:!0},capture_pageview:!e||"2025-05-24">e||"history_change",session_recording:e&&e>="2025-11-30"?{strictMinimumDuration:!0}:{},external_scripts_inject_target:e&&e>="2026-01-30"?"head":"body",internal_or_test_user_hostname:e&&e>="2026-01-30"?/^(localhost|127\.0\.0\.1)$/:void 0,persistence_save_debounce_ms:e&&e>="2026-05-30"?250:0}))(e))},qo=[["process_person","person_profiles"],["xhr_headers","request_headers"],["cookie_name","persistence_name"],["disable_cookie","disable_persistence"],["store_google","save_campaign_params"],["verbose","debug"]],zo=e=>{var t={};for(var[i,s]of qo)We(e[i])||(t[s]=e[i]);var r=ss({},t,e);return ze(e.property_blacklist)&&(We(e.property_denylist)?r.property_denylist=e.property_blacklist:ze(e.property_denylist)?r.property_denylist=[...e.property_blacklist,...e.property_denylist]:Zi.error(Do+e.property_denylist)),r};class Bo{constructor(){this.__forceAllowLocalhost=!1}get _forceAllowLocalhost(){return this.__forceAllowLocalhost}set _forceAllowLocalhost(e){Zi.error("WebPerformanceObserver is deprecated and has no impact on network capture. Use `_forceAllowLocalhostNetworkCapture` on `posthog.sessionRecording`"),this.__forceAllowLocalhost=e}}class jo{_replaceExtension(e,t){if(e){var i=this._extensions.indexOf(e);-1!==i&&this._extensions.splice(i,1)}return this._extensions.push(t),null==t.initialize||t.initialize(),t}_inCookielessMode(){return this.config.cookieless_mode===re||this.config.cookieless_mode===se&&this.consent.isRejected()}get decideEndpointWasHit(){var e,t;return null!==(e=null==(t=this.featureFlags)?void 0:t.hasLoadedFlags)&&void 0!==e&&e}get flagsEndpointWasHit(){var e,t;return null!==(e=null==(t=this.featureFlags)?void 0:t.hasLoadedFlags)&&void 0!==e&&e}constructor(){var e;this.webPerformance=new Bo,this._personProcessingSetOncePropertiesSent=!1,this.version=n.LIB_VERSION,this._internalEventEmitter=new uo,this._extensions=[],this._calculate_event_properties=this.calculateEventProperties.bind(this),this.config=Ho(),this.SentryIntegration=wr,this.sentryIntegration=e=>function(e,t){var i=br(e,t);return{name:yr,processEvent:e=>i(e)}}(this,e),this.__request_queue=[],this.__loaded=!1,this.analyticsDefaultEndpoint="/e/",this._initialPageviewCaptured=!1,this._visibilityStateListener=null,this._initialPersonProfilesConfig=null,this._cachedPersonProperties=null,this.scrollManager=new oo(this),this.pageViewManager=new Er(this),this.rateLimiter=new ln(this),this.requestRouter=new Eo(this),this.consent=new Cs(this),this.externalIntegrations=new Co(this);var t=null!==(e=jo.__defaultExtensionClasses)&&void 0!==e?e:{};this.featureFlags=t.featureFlags&&new t.featureFlags(this),this.toolbar=t.toolbar&&new t.toolbar(this),this.surveys=t.surveys&&new t.surveys(this),this.conversations=t.conversations&&new t.conversations(this),this.logs=t.logs&&new t.logs(this),this.experiments=t.experiments&&new t.experiments(this),this.exceptions=t.exceptions&&new t.exceptions(this),this.people={set:(e,t,i)=>{var s=Ge(e)?{[e]:t}:e;this.setPersonProperties(s),null==i||i({})},set_once:(e,t,i)=>{var s=Ge(e)?{[e]:t}:e;this.setPersonProperties(void 0,s),null==i||i({})}},this.on("eventCaptured",(e=>Zi.info('send "'+(null==e?void 0:e.event)+'"',e)))}init(e,t,i){if(i&&i!==No){var s,r=null!==(s=Fo[i])&&void 0!==s?s:new jo;return r._init(e,t,i),Fo[i]=r,Fo[No][i]=r,r}return this._init(e,t,i)}_init(e,t,s){var r,o;void 0===t&&(t={});var a=Ge(e)?e.trim():"";if(!a)return Zi.critical("PostHog was initialized without a token. This likely indicates a misconfiguration. Please check the first argument passed to posthog.init()"),this;if(this.__loaded)return console.warn("[PostHog.js]","You have already initialized PostHog! Re-initializing is a no-op"),this;this.__loaded=!0,this.config={},t.debug=this._checkLocalStorageForDebug(t.debug),this._originalUserConfig=t,this._triggered_notifs=[],t.person_profiles?this._initialPersonProfilesConfig=t.person_profiles:t.process_person&&(this._initialPersonProfilesConfig=t.process_person);var l=Ho(t.defaults),u=zo(t),c=ss({},l,u,{name:s,token:a});je(l.rageclick)&&je(u.rageclick)&&(c.rageclick=ss({},l.rageclick,u.rageclick)),this.set_config(c),this.config.on_xhr_error&&Zi.error("on_xhr_error is deprecated. Use on_request_error instead"),this.compression=t.disable_compression?void 0:_n.GZipJS;var d=this._is_persistence_disabled();this.persistence=new Vr(this.config,d),this.sessionPersistence="sessionStorage"===this.config.persistence||"memory"===this.config.persistence?this.persistence:new Vr(i({},this.config,{persistence:"sessionStorage"}),d);var _=i({},this.persistence.props),h=i({},this.sessionPersistence.props);this.register({$initialization_time:(new Date).toISOString()}),this._requestQueue=new so((e=>this._send_retriable_request(e)),this.config.request_queue_config),this._retryQueue=new no(this),this.__request_queue=[];var p=this._inCookielessMode();if(p||(this.sessionManager=new _o(this),this.sessionPropsManager=new lo(this,this.sessionManager,this.persistence)),this.config.__preview_deferred_init_extensions?(Zi.info("Deferring extension initialization to improve startup performance"),setTimeout((()=>{this._initExtensions(p)}),0)):(Zi.info("Initializing extensions synchronously"),this._initExtensions(p)),n.DEBUG=n.DEBUG||this.config.debug,n.DEBUG&&Zi.info("Starting in debug mode",{this:this,config:t,thisC:i({},this.config),p:_,s:h}),!this.config.identity_distinct_id||null!=(r=t.bootstrap)&&r.distinctID||(t.bootstrap=i({},t.bootstrap,{distinctID:this.config.identity_distinct_id,isIdentifiedID:!0})),void 0!==(null==(o=t.bootstrap)?void 0:o.distinctID)){var g=t.bootstrap.distinctID,v=this.get_distinct_id(),f=this.persistence.get_property(j);if(t.bootstrap.isIdentifiedID&&null!=v&&v!==g&&f===ne)this.identify(g);else if(t.bootstrap.isIdentifiedID&&null!=v&&v!==g&&f===oe)Zi.warn("Bootstrap distinctID differs from an already-identified user. The existing identity is preserved. Call reset() before reinitializing if you intend to switch users.");else{var m=this.config.get_device_id(fs()),y=t.bootstrap.isIdentifiedID?m:g;this.persistence.set_property(j,t.bootstrap.isIdentifiedID?oe:ne),this.register({distinct_id:g,$device_id:y})}}if(p)this.register_once({distinct_id:Q,$device_id:null},"");else if(!this.get_distinct_id()){var b=this.config.get_device_id(fs());this.register_once({distinct_id:b,$device_id:b},""),this.persistence.set_property(j,ne)}return cs(pe,"onpagehide"in self?"pagehide":"unload",this._handle_unload.bind(this),{passive:!1}),t.segment?function(e,t){var i=e.config.segment;if(!i)return t();!function(e,t){var i=e.config.segment;if(!i)return t();var s=i=>{var s=()=>i.anonymousId()||fs();e.config.get_device_id=s,i.id()&&(e.register({distinct_id:i.id(),$device_id:s()}),e.persistence.set_property(j,oe)),t()},r=i.user();"then"in r&&Be(r.then)?r.then(s):s(r)}(e,(()=>{i.register((e=>{Promise&&Promise.resolve||mr.warn("This browser does not have Promise support, and can not use the segment integration");var t=(t,i)=>{if(!i)return t;t.event.userId||t.event.anonymousId===e.get_distinct_id()||(mr.info("No userId set, resetting PostHog"),e.reset()),t.event.userId&&t.event.userId!==e.get_distinct_id()&&(mr.info("UserId set, identifying with PostHog"),e.identify(t.event.userId));var s=e.calculateEventProperties(i,t.event.properties);return t.event.properties=Object.assign({},s,t.event.properties),t};return{name:"PostHog JS",type:"enrichment",version:"1.0.0",isLoaded:()=>!0,load:()=>Promise.resolve(),track:e=>t(e,e.event.event),page:e=>t(e,ce),identify:e=>t(e,_e),screen:e=>t(e,"$screen")}})(e)).then((()=>{t()}))}))}(this,(()=>this._loaded())):this._loaded(),Be(this.config._onCapture)&&this.config._onCapture!==$o&&(Zi.warn("onCapture is deprecated. Please use `before_send` instead"),this.on("eventCaptured",(e=>this.config._onCapture(e.event,e)))),this.config.ip&&Zi.warn('The `ip` config option has NO EFFECT AT ALL and has been deprecated. Use a custom transformation or "Discard IP data" project setting instead. See https://posthog.com/tutorials/web-redact-properties#hiding-customer-ip-address for more information.'),this}_initExtensions(e){var t,s,r,n,o,a,l,u=performance.now(),c=i({},jo.__defaultExtensionClasses,this.config.__extensionClasses),d=[];c.featureFlags&&this._extensions.push(this.featureFlags=null!==(t=this.featureFlags)&&void 0!==t?t:new c.featureFlags(this)),c.exceptions&&this._extensions.push(this.exceptions=null!==(s=this.exceptions)&&void 0!==s?s:new c.exceptions(this)),c.historyAutocapture&&this._extensions.push(this.historyAutocapture=new c.historyAutocapture(this)),c.tracingHeaders&&this._extensions.push(this.tracingHeaders=new c.tracingHeaders(this)),c.siteApps&&this._extensions.push(this.siteApps=new c.siteApps(this)),c.sessionRecording&&!e&&this._extensions.push(this.sessionRecording=new c.sessionRecording(this)),this.config.disable_scroll_properties||d.push((()=>{this.scrollManager.startMeasuringScrollPosition()})),c.autocapture&&this._extensions.push(this.autocapture=new c.autocapture(this)),c.surveys&&this._extensions.push(this.surveys=null!==(r=this.surveys)&&void 0!==r?r:new c.surveys(this)),c.logs&&this._extensions.push(this.logs=null!==(n=this.logs)&&void 0!==n?n:new c.logs(this)),c.conversations&&this._extensions.push(this.conversations=null!==(o=this.conversations)&&void 0!==o?o:new c.conversations(this)),c.productTours&&this._extensions.push(this.productTours=new c.productTours(this)),c.heatmaps&&this._extensions.push(this.heatmaps=new c.heatmaps(this)),c.webVitalsAutocapture&&this._extensions.push(this.webVitalsAutocapture=new c.webVitalsAutocapture(this)),c.exceptionObserver&&this._extensions.push(this.exceptionObserver=new c.exceptionObserver(this)),c.deadClicksAutocapture&&this._extensions.push(this.deadClicksAutocapture=new c.deadClicksAutocapture(this,vr)),c.toolbar&&this._extensions.push(this.toolbar=null!==(a=this.toolbar)&&void 0!==a?a:new c.toolbar(this)),c.experiments&&this._extensions.push(this.experiments=null!==(l=this.experiments)&&void 0!==l?l:new c.experiments(this)),this._extensions.forEach((e=>{e.initialize&&d.push((()=>{null==e.initialize||e.initialize()}))})),d.push((()=>{if(this._pendingRemoteConfig){var e=this._pendingRemoteConfig;this._pendingRemoteConfig=void 0,this._onRemoteConfig(e)}})),this._processInitTaskQueue(d,u)}_processInitTaskQueue(e,t){for(;e.length>0;){if(this.config.__preview_deferred_init_extensions&&performance.now()-t>=30&&e.length>0)return void setTimeout((()=>{this._processInitTaskQueue(e,t)}),0);var i=e.shift();if(i)try{i()}catch(e){Zi.error("Error initializing extension:",e)}}var s=Math.round(performance.now()-t);this.register_for_session({[Z]:this.config.__preview_deferred_init_extensions?"deferred":"synchronous",[ee]:s}),this.config.__preview_deferred_init_extensions&&Zi.info("PostHog extensions initialized ("+s+"ms)")}_onRemoteConfig(e){var t;if(!me||!me.body)return Zi.info("document not ready yet, trying again in 500 milliseconds..."),void setTimeout((()=>{this._onRemoteConfig(e)}),500);this.config.__preview_deferred_init_extensions&&(this._pendingRemoteConfig=e),this._lastRemoteConfig=e,this.compression=void 0,e.supportedCompression&&!this.config.disable_compression&&(this.compression=Ae(e.supportedCompression,_n.GZipJS)?_n.GZipJS:Ae(e.supportedCompression,_n.Base64)?_n.Base64:void 0),null!=(t=e.analytics)&&t.endpoint&&(this.analyticsDefaultEndpoint=e.analytics.endpoint),this.set_config({person_profiles:this._initialPersonProfilesConfig?this._initialPersonProfilesConfig:ae}),this._extensions.forEach((t=>null==t.onRemoteConfig?void 0:t.onRemoteConfig(e)))}_loaded(){try{this.config.loaded(this)}catch(e){Zi.critical("`loaded` function failed",e)}if(this._start_queue_if_opted_in(),this.config.internal_or_test_user_hostname&&null!=ye&&ye.hostname){var e=ye.hostname,t=this.config.internal_or_test_user_hostname;("string"==typeof t?e===t:t.test(e))&&this.setInternalOrTestUser()}this.config.capture_pageview&&setTimeout((()=>{(this.consent.isOptedIn()||this._inCookielessMode())&&this._captureInitialPageview()}),1),this._remoteConfigLoader=new cn(this),this._remoteConfigLoader.load()}_start_queue_if_opted_in(){var e;this.is_capturing()&&this.config.request_batching&&(null==(e=this._requestQueue)||e.enable())}_dom_loaded(){this.is_capturing()&&ts(this.__request_queue,(e=>this._send_retriable_request(e))),this.__request_queue=[],this._start_queue_if_opted_in()}_handle_unload(){var e,t,i,s;null==(e=this.surveys)||e.handlePageUnload(),this.config.request_batching?(this._shouldCapturePageleave()&&this.capture(de),null==(t=this.logs)||t.flushLogs("sendBeacon"),null==(i=this._requestQueue)||i.unload(),null==(s=this._retryQueue)||s.unload()):this._shouldCapturePageleave()&&this.capture(de,null,{transport:"sendBeacon"})}_send_request(e){this.__loaded&&(Uo?this.__request_queue.push(e):this.rateLimiter.isServerRateLimited(e.batchKey)||(e.transport=e.transport||this.config.api_transport,e.url=Yn(e.url,{ip:this.config.ip?1:0}),e.headers=i({},this.config.request_headers,e.headers),e.compression="best-available"===e.compression?this.compression:e.compression,e.disableXHRCredentials=this.config.__preview_disable_xhr_credentials,this.config.__preview_disable_beacon&&(e.disableTransport=["sendBeacon"]),e.fetchOptions=e.fetchOptions||this.config.fetch_options,(e=>{var t,s,r,n=i({},e);n.timeout=n.timeout||6e4,n.url=eo(n.url,n.compression);var o=null!==(t=n.transport)&&void 0!==t?t:"fetch",a=to.filter((e=>!n.disableTransport||!e.transport||!n.disableTransport.includes(e.transport))),l=null!==(s=null==(r=function(e,t){for(var i=0;e.length>i;i++)if(e[i].transport===o)return e[i]}(a))?void 0:r.method)&&void 0!==s?s:a[0].method;if(!l)throw new Error("No available transport method");"sendBeacon"!==o&&n.data&&n.compression===_n.GZipJS&&Se&&!Gn?Zn(n).then((e=>{l(e)})).catch((t=>{if(Re(t))return Gn=!0,void l(i({},n,{compression:void 0,url:eo(e.url,void 0)}));(e=>{if(!e||"object"!=typeof e)return!1;var t="name"in e?String(e.name):"";return Re(e)||t===Ie})(t)&&(Gn=!0),l(n)})):l(n)})(i({},e,{callback:t=>{var i,s;this.rateLimiter.checkForLimiting(t),400>t.statusCode||null==(i=(s=this.config).on_request_error)||i.call(s,t),null==e.callback||e.callback(t)}}))))}_send_retriable_request(e){this._retryQueue?this._retryQueue.retriableRequest(e):this._send_request(e)}_execute_array(e){Lo++;try{var t,i=[],s=[],r=[];ts(e,(e=>{if(e)if(ze(t=e[0]))r.push(e);else if(Be(e))try{e.call(this)}catch(t){Zi.error("Error executing queued PostHog call",e,t)}else ze(e)&&"alias"===t?i.push(e):ze(e)&&-1!==t.indexOf("capture")&&Be(this[t])?r.push(e):s.push(e)}));var n=function(e,t){ts(e,(function(e){try{if(ze(e[0])){var i=t;is(e,(function(e){i=i[e[0]].apply(i,e.slice(1))}))}else t[e[0]].apply(t,e.slice(1))}catch(t){Zi.error("Error executing queued PostHog call",e,t)}}))};n(i,this),n(s,this),n(r,this)}finally{Lo--}}push(e){if(Lo>0&&ze(e)&&Ge(e[0])){var t=jo.prototype[e[0]];Be(t)&&t.apply(this,e.slice(1))}else this._execute_array([e])}capture(e,t,s){var r,n,o,a,l;if(this.__loaded&&this.persistence&&this.sessionPersistence&&this._requestQueue){if(this.is_capturing())if(!We(e)&&Ge(e)){var u=!this.config.opt_out_useragent_filter&&this._is_bot();if(!u||this.config.__preview_capture_bot_pageviews){var c=null!=s&&s.skip_client_rate_limiting?void 0:this.rateLimiter.clientRateLimitContext();if(null==c||!c.isRateLimited){null!=t&&t.$current_url&&!Ge(null==t?void 0:t.$current_url)&&(Zi.error("Invalid `$current_url` property provided to `posthog.capture`. Input must be a string. Ignoring provided value."),null==t||delete t.$current_url),"$exception"!==e||null!=s&&s._originatedFromCaptureException||Zi.warn("Using `posthog.capture('$exception')` is unreliable because it does not attach required metadata. Use `posthog.captureException(error)` instead, which attaches required metadata automatically."),this.sessionPersistence.update_search_keyword(),this.config.save_campaign_params&&this.sessionPersistence.update_campaign_params(),this.config.save_referrer&&this.sessionPersistence.update_referrer_info(),(this.config.save_campaign_params||this.config.save_referrer)&&this.persistence.set_initial_person_info();var d=new Date,_=(null==s?void 0:s.timestamp)||d,h=(null==s?void 0:s.uuid)||fs(),p={uuid:h,event:e,properties:this.calculateEventProperties(e,t||{},_,h)};e===ce&&this.config.__preview_capture_bot_pageviews&&u&&(p.event="$bot_pageview",p.properties.$browser_type="bot"),c&&(p.properties.$lib_rate_limit_remaining_tokens=c.remainingTokens),(null==s?void 0:s.$set)&&(p.$set=null==s?void 0:s.$set);var g,v,f,m=this._calculate_set_once_properties(null==s?void 0:s.$set_once,e!==he,e===_e);if(m&&(p.$set_once=m),null!=s&&s._noTruncate||(n=this.config.properties_string_max_length,o=p,a=e=>Ge(e)?e.slice(0,n):e,l=new Set,p=function e(t,i){return t!==Object(t)?a?a(t):t:l.has(t)?void 0:(l.add(t),ze(t)?(s=[],ts(t,(t=>{s.push(e(t))}))):(s={},is(t,((t,i)=>{l.has(t)||(s[i]=e(t,i))}))),s);// removed by dead control flow
 var s; }(o)),p.timestamp=_,We(null==s?void 0:s.timestamp)||(p.properties.$event_time_override_provided=!0,p.properties.$event_time_override_system_time=d),e===en.DISMISSED||e===en.SENT){var y=null==t?void 0:t[tn.SURVEY_ID],b=null==t?void 0:t[tn.SURVEY_ITERATION];(e=>{try{var t=(e=>((e,t)=>{var i=""+xo+t.id;return t.current_iteration&&t.current_iteration>0&&(i=""+xo+t.id+"_"+t.current_iteration),i})(0,e))(e);if(localStorage.getItem(t))return;localStorage.setItem(t,"true")}catch(e){So.error("Failed to persist survey seen state",e)}})({id:y,current_iteration:b}),p.$set=i({},p.$set,{[(g={id:y,current_iteration:b},v=e===en.SENT?"responded":"dismissed",f="$survey_"+v+"/"+g.id,g.current_iteration&&g.current_iteration>0&&(f="$survey_"+v+"/"+g.id+"/"+g.current_iteration),f)]:!0})}else e===en.SHOWN&&(p.$set=i({},p.$set,{[tn.SURVEY_LAST_SEEN_DATE]:(new Date).toISOString()}));if(e===nn.SHOWN){var w=null==t?void 0:t[on.TOUR_TYPE];w&&(p.$set=i({},p.$set,{[on.TOUR_LAST_SEEN_DATE+"/"+w]:(new Date).toISOString()}))}var E=i({},p.properties.$set,p.$set);if(Ve(E)||this.setPersonPropertiesForFlags(E),!Je(this.config.before_send)){var S=this._runBeforeSend(p);if(!S)return;p=S}this._internalEventEmitter.emit("eventCaptured",p);var x={method:"POST",url:null!==(r=null==s?void 0:s._url)&&void 0!==r?r:this.requestRouter.endpointFor("api",this.analyticsDefaultEndpoint),data:p,compression:"best-available",batchKey:null==s?void 0:s._batchKey,transport:null==s?void 0:s.transport};return!this.config.request_batching||s&&(null==s||!s._batchKey)||null!=s&&s.send_instantly?this._send_retriable_request(x):this._requestQueue.enqueue(x),p}Zi.critical("This capture call is ignored due to client rate limiting.")}}else Zi.error("No event name provided to posthog.capture")}else Zi.uninitializedWarning("posthog.capture")}_addCaptureHook(e){return this.on("eventCaptured",(t=>e(t.event,t)))}calculateEventProperties(e,t,s,r,o){if(s=s||new Date,!this.persistence||!this.sessionPersistence)return t;var a=o?void 0:this.persistence.remove_event_timer(e),l=i({},t);if(l.token=this.config.token,l.$config_defaults=this.config.defaults,this._inCookielessMode()&&(l.$cookieless_mode=!0),"$snapshot"===e){var u=i({},this.persistence.properties(),this.sessionPersistence.properties());return l.distinct_id=u.distinct_id,(!Ge(l.distinct_id)&&!Xe(l.distinct_id)||Ke(l.distinct_id))&&Zi.error("Invalid distinct_id for replay event. This indicates a bug in your implementation"),l}var c,d=function(e,t){var i,s,r,o;if(!xe)return{};var a,l,u,c,d,_,h,p,g,v=e?[...Rr,...t||[]]:[],[f,m]=function(e){for(var t=0;pi.length>t;t++){var[i,s]=pi[t],r=i.exec(e),n=r&&(Be(s)?s(r,e):s);if(n)return n}return["",""]}(xe),y=null!=(a="undefined"!=typeof navigator?navigator:void 0)&&a.brave?{brave:!0}:{},b=ss(as({$os:f,$os_version:m,$browser:di(xe,navigator.vendor,y),$device:gi(xe),$device_type:(u=xe,c={userAgentDataPlatform:null==(i=navigator)||null==(i=i.userAgentData)?void 0:i.platform,maxTouchPoints:null==(s=navigator)?void 0:s.maxTouchPoints,screenWidth:null==pe||null==(r=pe.screen)?void 0:r.width,screenHeight:null==pe||null==(o=pe.screen)?void 0:o.height,devicePixelRatio:null==pe?void 0:pe.devicePixelRatio},g=gi(u),g===mt||g===ft||"Kobo"===g||"Kindle Fire"===g||g===Kt?vt:g===Dt||g===Ut||g===Nt||g===Vt?"Console":g===bt?"Wearable":g?ht:"Android"===(null==c?void 0:c.userAgentDataPlatform)&&(null!==(d=null==c?void 0:c.maxTouchPoints)&&void 0!==d?d:0)>0?600>Math.min(null!==(_=null==c?void 0:c.screenWidth)&&void 0!==_?_:0,null!==(h=null==c?void 0:c.screenHeight)&&void 0!==h?h:0)/(null!==(p=null==c?void 0:c.devicePixelRatio)&&void 0!==p?p:1)?ht:vt:"Desktop"),$timezone:zr(),$timezone_offset:Br()}),{$current_url:Pr(null==ye?void 0:ye.href,v,Lr),$host:null==ye?void 0:ye.host,$pathname:null==ye?void 0:ye.pathname,$raw_user_agent:xe.length>1e3?xe.substring(0,997)+"...":xe,$browser_version:hi(xe,navigator.vendor,y),$browser_language:Dr(),$browser_language_prefix:(l=Dr(),"string"==typeof l?l.split("-")[0]:void 0),$screen_height:null==pe?void 0:pe.screen.height,$screen_width:null==pe?void 0:pe.screen.width,$viewport_height:null==pe?void 0:pe.innerHeight,$viewport_width:null==pe?void 0:pe.innerWidth,$lib:n.LIB_NAME,$lib_version:n.LIB_VERSION,$insert_id:Math.random().toString(36).substring(2,10)+Math.random().toString(36).substring(2,10),$time:Date.now()/1e3});return n.SDK_DIST_CHANNEL&&(b.$sdk_dist_channel=n.SDK_DIST_CHANNEL),b}(this.config.mask_personal_data_properties,this.config.custom_personal_data_properties);if(this.sessionManager){var{sessionId:_,windowId:h}=this.sessionManager.checkAndGetSessionAndWindowId(o,s.getTime());l.$session_id=_,l.$window_id=h}this.sessionPropsManager&&ss(l,this.sessionPropsManager.getSessionProps());try{var p;this.sessionRecording&&ss(l,this.sessionRecording.sdkDebugProperties),l.$sdk_debug_retry_queue_size=null==(p=this._retryQueue)?void 0:p.length}catch(e){l.$sdk_debug_error_capturing_properties=String(e)}if(this.requestRouter.region===yo&&(l.$lib_custom_api_host=this.config.api_host),c=e!==ce||o?e!==de||o?this.pageViewManager.doEvent():this.pageViewManager.doPageLeave(s):this.pageViewManager.doPageView(s,r),l=ss(l,c),e===ce&&me&&(l.title=me.title),!We(a)){var g=s.getTime()-a;l.$duration=parseFloat((g/1e3).toFixed(3))}xe&&this.config.opt_out_useragent_filter&&(l.$browser_type=this._is_bot()?"bot":"browser"),(l=ss({},d,this.persistence.properties(),this.sessionPersistence.properties(),l)).$is_identified=this._isIdentified(),ze(this.config.property_denylist)?is(this.config.property_denylist,(function(e){delete l[e]})):Zi.error(Do+this.config.property_denylist+" or property_blacklist config: "+this.config.property_blacklist);var v=this.config.sanitize_properties;v&&(Zi.error(Ao),l=v(l,e));var f=this._hasPersonProcessing();return l.$process_person_profile=f,f&&!o&&this._requirePersonProcessing("_calculate_event_properties"),l}_calculate_set_once_properties(e,t,i){var s;if(void 0===t&&(t=!0),void 0===i&&(i=!1),!this.persistence||!this._hasPersonProcessing())return e;if(this._personProcessingSetOncePropertiesSent&&!i)return e;var r=this.persistence.get_initial_props(),n=null==(s=this.sessionPropsManager)?void 0:s.getSetOnceProps(),o=ss({},r,n||{},e||{}),a=this.config.sanitize_properties;return a&&(Zi.error(Ao),o=a(o,"$set_once")),t&&(this._personProcessingSetOncePropertiesSent=!0),Ve(o)?void 0:o}register(e,t){var i;null==(i=this.persistence)||i.register(e,t)}register_once(e,t,i){var s;null==(s=this.persistence)||s.register_once(e,t,i)}register_for_session(e){var t;null==(t=this.sessionPersistence)||t.register(e)}unregister(e){var t;null==(t=this.persistence)||t.unregister(e)}unregister_for_session(e){var t;null==(t=this.sessionPersistence)||t.unregister(e)}_register_single(e,t){this.register({[e]:t})}getFeatureFlag(e,t){var i;return null==(i=this.featureFlags)?void 0:i.getFeatureFlag(e,t)}getFeatureFlagPayload(e){var t;return null==(t=this.featureFlags)?void 0:t.getFeatureFlagPayload(e)}getFeatureFlagResult(e,t){var i;return null==(i=this.featureFlags)?void 0:i.getFeatureFlagResult(e,t)}isFeatureEnabled(e,t){var i;return null==(i=this.featureFlags)?void 0:i.isFeatureEnabled(e,t)}reloadFeatureFlags(){var e;null==(e=this.featureFlags)||e.reloadFeatureFlags()}updateFlags(e,t,i){var s;null==(s=this.featureFlags)||s.updateFlags(e,t,i)}updateEarlyAccessFeatureEnrollment(e,t,i){var s;null==(s=this.featureFlags)||s.updateEarlyAccessFeatureEnrollment(e,t,i)}getEarlyAccessFeatures(e,t,i){var s;return void 0===t&&(t=!1),null==(s=this.featureFlags)?void 0:s.getEarlyAccessFeatures(e,t,i)}on(e,t){return this._internalEventEmitter.on(e,t)}onFeatureFlags(e){return this.featureFlags?this.featureFlags.onFeatureFlags(e):(e([],{},{errorsLoading:!0}),()=>{})}onSurveysLoaded(e){return this.surveys?this.surveys.onSurveysLoaded(e):(e([],{isLoaded:!1,error:Mo}),()=>{})}onSessionId(e){var t,i;return null!==(t=null==(i=this.sessionManager)?void 0:i.onSessionId(e))&&void 0!==t?t:()=>{}}getSurveys(e,t){void 0===t&&(t=!1),this.surveys?this.surveys.getSurveys(e,t):e([],{isLoaded:!1,error:Mo})}getActiveMatchingSurveys(e,t){void 0===t&&(t=!1),this.surveys?this.surveys.getActiveMatchingSurveys(e,t):e([],{isLoaded:!1,error:Mo})}renderSurvey(e,t){var i;null==(i=this.surveys)||i.renderSurvey(e,t)}displaySurvey(e,t){var i;void 0===t&&(t=To),null==(i=this.surveys)||i.displaySurvey(e,t)}cancelPendingSurvey(e){var t;null==(t=this.surveys)||t.cancelPendingSurvey(e)}canRenderSurvey(e){var t,i;return null!==(t=null==(i=this.surveys)?void 0:i.canRenderSurvey(e))&&void 0!==t?t:{visible:!1,disabledReason:Mo}}canRenderSurveyAsync(e,t){var i,s;return void 0===t&&(t=!1),null!==(i=null==(s=this.surveys)?void 0:s.canRenderSurveyAsync(e,t))&&void 0!==i?i:Promise.resolve({visible:!1,disabledReason:Mo})}_validateIdentifyId(e){return!e||Ke(e)?(Zi.critical("Unique user id has not been set in posthog.identify"),!1):e===Q?(Zi.critical('The string "'+e+'" was set in posthog.identify which indicates an error. This ID is only used as a sentinel value.'),!1):!["distinct_id","distinctid"].includes(e.toLowerCase())&&!["undefined","null"].includes(e.toLowerCase())||(Zi.critical('The string "'+e+'" was set in posthog.identify which indicates an error. This ID should be unique to the user and not a hardcoded string.'),!1)}identify(e,t,i){if(!this.__loaded||!this.persistence)return Zi.uninitializedWarning("posthog.identify");if(Xe(e)&&(e=e.toString(),Zi.warn("The first argument to posthog.identify was a number, but it should be a string. It has been converted to a string.")),this._validateIdentifyId(e)&&this._requirePersonProcessing("posthog.identify")){var s=this.get_distinct_id();this.register({$user_id:e}),this.get_property(a)||this.register_once({$had_persisted_distinct_id:!0,$device_id:s},""),e!==s&&e!==this.get_property(l)&&(this.unregister(l),this.register({distinct_id:e}));var r,n=(this.persistence.get_property(j)||ne)===ne;e!==s&&n?(this.persistence.set_property(j,oe),this.setPersonPropertiesForFlags({$set:t||{},$set_once:i||{}},!1),this.capture(_e,{distinct_id:e,$anon_distinct_id:s},{$set:t||{},$set_once:i||{}}),this._cachedPersonProperties=go(e,t,i),null==(r=this.featureFlags)||r.setAnonymousDistinctId(s)):(t||i)&&this.setPersonProperties(t,i),e!==s&&(this.reloadFeatureFlags(),this.unregister(H))}}setPersonProperties(e,t){if((e||t)&&this._requirePersonProcessing("posthog.setPersonProperties")){var i=go(this.get_distinct_id(),e,t);this._cachedPersonProperties!==i?(this.setPersonPropertiesForFlags({$set:e||{},$set_once:t||{}},!0),this.capture("$set",{$set:e||{},$set_once:t||{}}),this._cachedPersonProperties=i):Zi.info("A duplicate setPersonProperties call was made with the same properties. It has been ignored.")}}group(e,t,s){if(e&&t){var r=this.getGroups(),n=r[e]!==t;if(n&&this.resetGroupPropertiesForFlags(e),this.register({$groups:i({},r,{[e]:t})}),n||s){var o={$group_type:e,$group_key:t};s&&(o.$group_set=s),this.capture(he,o)}s&&this.setGroupPropertiesForFlags({[e]:s}),n&&!s&&this.reloadFeatureFlags()}else Zi.error("posthog.group requires a group type and group key")}resetGroups(){this.register({$groups:{}}),this.resetGroupPropertiesForFlags(),this.reloadFeatureFlags()}setPersonPropertiesForFlags(e,t){var i;void 0===t&&(t=!0),null==(i=this.featureFlags)||i.setPersonPropertiesForFlags(e,t)}resetPersonPropertiesForFlags(){var e;null==(e=this.featureFlags)||e.resetPersonPropertiesForFlags()}setGroupPropertiesForFlags(e,t){var i;void 0===t&&(t=!0),this._requirePersonProcessing("posthog.setGroupPropertiesForFlags")&&(null==(i=this.featureFlags)||i.setGroupPropertiesForFlags(e,t))}resetGroupPropertiesForFlags(e){var t;null==(t=this.featureFlags)||t.resetGroupPropertiesForFlags(e)}reset(e){var t,i,s,r,n,o,l,u;if(Zi.info("reset"),!this.__loaded)return Zi.uninitializedWarning("posthog.reset");var c,d=this.get_property(a),_=this.get_property(y);if(this.consent.reset(),null==(t=this.persistence)||t.clear(),null==(i=this.sessionPersistence)||i.clear(),We(_)||null==(c=this.persistence)||c.register({[y]:_}),null==(s=this.surveys)||s.reset(),null==(r=this._remoteConfigLoader)||r.stop(),null==(n=this.featureFlags)||n.reset(),null==(o=this.conversations)||o.reset(),null==(l=this.persistence)||l.set_property(j,ne),null==(u=this.sessionManager)||u.resetSessionId(),this._cachedPersonProperties=null,this.config.cookieless_mode===re)this.register_once({distinct_id:Q,$device_id:null},"");else{var h=this.config.get_device_id(fs());this.register_once({distinct_id:h,$device_id:e?h:d},"")}this.register({$last_posthog_reset:(new Date).toISOString()},1),delete this.config.identity_distinct_id,delete this.config.identity_hash,this.reloadFeatureFlags()}setIdentity(e,t){var i;this.config.identity_distinct_id=e,this.config.identity_hash=t,this.alias(e),null==(i=this.conversations)||i._onIdentityChanged()}clearIdentity(){var e;delete this.config.identity_distinct_id,delete this.config.identity_hash,null==(e=this.conversations)||e._onIdentityCleared()}get_distinct_id(){return this.get_property("distinct_id")}getGroups(){return this.get_property("$groups")||{}}get_session_id(){var e,t;return null!==(e=null==(t=this.sessionManager)?void 0:t.checkAndGetSessionAndWindowId(!0).sessionId)&&void 0!==e?e:""}get_session_replay_url(e){if(!this.sessionManager)return"";var{sessionId:t,sessionStartTimestamp:i}=this.sessionManager.checkAndGetSessionAndWindowId(!0),s=this.requestRouter.endpointFor("ui","/project/"+this.config.token+"/replay/"+t);if(null!=e&&e.withTimestamp&&i){var r,n=null!==(r=e.timestampLookBack)&&void 0!==r?r:10;if(!i)return s;s+="?t="+Math.max(Math.floor(((new Date).getTime()-i)/1e3)-n,0)}return s}alias(e,t){return e===this.get_property(o)?(Zi.critical("Attempting to create alias for existing People user - aborting."),-2):this._requirePersonProcessing("posthog.alias")?(We(t)&&(t=this.get_distinct_id()),e!==t?(this._register_single(l,e),this.capture("$create_alias",{alias:e,distinct_id:t})):(Zi.warn("alias matches current distinct_id - skipping api call."),this.identify(e),-1)):void 0}set_config(e){var t=i({},this.config);if(je(e)){var s,r,o,a,l,u,c,d,_,h,p;ss(this.config,zo(e));var g=this._is_persistence_disabled();null==(s=this.persistence)||s.update_config(this.config,t,g),this.sessionPersistence="sessionStorage"===this.config.persistence||"memory"===this.config.persistence?this.persistence:new Vr(i({},this.config,{persistence:"sessionStorage"}),g);var v=this._checkLocalStorageForDebug(this.config.debug);Ze(v)&&(this.config.debug=v),Ze(this.config.debug)&&(this.config.debug?(n.DEBUG=!0,Ss._is_supported()&&Ss._set("ph_debug",!0),Zi.info("set_config",{config:e,oldConfig:t,newConfig:i({},this.config)})):(n.DEBUG=!1,Ss._is_supported()&&Ss._remove("ph_debug"))),null==(r=this.exceptionObserver)||r.onConfigChange(),null==(o=this.exceptions)||o.onConfigChange(),null==(a=this.sessionRecording)||a.startIfEnabledOrStop(),null==(l=this.tracingHeaders)||l.startIfEnabledOrStop(),null==(u=this.autocapture)||u.startIfEnabled(),null==(c=this.heatmaps)||c.startIfEnabled(),null==(d=this.exceptionObserver)||d.startIfEnabledOrStop(),null==(_=this.deadClicksAutocapture)||_.startIfEnabledOrStop(),null==(h=this.surveys)||h.loadIfEnabled(),this._sync_opt_out_with_persistence(),null==(p=this.externalIntegrations)||p.startIfEnabledOrStop()}}_overrideSDKInfo(e,t){n.LIB_NAME=e,n.LIB_VERSION=t}startSessionRecording(e){var t,i,s,r,n,o=!0===e,a={sampling:o||!(null==e||!e.sampling),linked_flag:o||!(null==e||!e.linked_flag),url_trigger:o||!(null==e||!e.url_trigger),event_trigger:o||!(null==e||!e.event_trigger)};Object.values(a).some(Boolean)&&(null==(t=this.sessionManager)||t.checkAndGetSessionAndWindowId(),a.sampling&&(null==(i=this.sessionRecording)||i.overrideSampling()),a.linked_flag&&(null==(s=this.sessionRecording)||s.overrideLinkedFlag()),a.url_trigger&&(null==(r=this.sessionRecording)||r.overrideTrigger("url")),a.event_trigger&&(null==(n=this.sessionRecording)||n.overrideTrigger("event")));this.set_config({disable_session_recording:!1})}stopSessionRecording(){this.set_config({disable_session_recording:!0})}sessionRecordingStarted(){var e;return!(null==(e=this.sessionRecording)||!e.started)}captureException(e,t){if(this.exceptions){var s=new Error("PostHog syntheticException"),r=this.exceptions.buildProperties(e,{handled:!0,syntheticException:s});return this.exceptions.sendExceptionEvent(i({},r,t))}}addExceptionStep(e,t){var i;null==(i=this.exceptions)||i.addExceptionStep(e,t)}captureLog(e){var t;null==(t=this.logs)||t.captureLog(e)}get logger(){var e,t;return null!==(e=null==(t=this.logs)?void 0:t.logger)&&void 0!==e?e:jo._noopLogger}startExceptionAutocapture(e){this.set_config({capture_exceptions:null==e||e})}stopExceptionAutocapture(){this.set_config({capture_exceptions:!1})}loadToolbar(e){var t,i;return null!==(t=null==(i=this.toolbar)?void 0:i.loadToolbar(e))&&void 0!==t&&t}get_property(e){var t;return null==(t=this.persistence)?void 0:t.props[e]}getSessionProperty(e){var t;return null==(t=this.sessionPersistence)?void 0:t.props[e]}toString(){var e,t=null!==(e=this.config.name)&&void 0!==e?e:No;return t!==No&&(t=No+"."+t),t}_isIdentified(){var e,t;return(null==(e=this.persistence)?void 0:e.get_property(j))===oe||(null==(t=this.sessionPersistence)?void 0:t.get_property(j))===oe}_hasPersonProcessing(){var e,t;return!("never"===this.config.person_profiles||this.config.person_profiles===ae&&!this._isIdentified()&&Ve(this.getGroups())&&(null==(e=this.persistence)||null==(e=e.props)||!e[l])&&(null==(t=this.persistence)||null==(t=t.props)||!t[J]))}_shouldCapturePageleave(){return!0===this.config.capture_pageleave||"if_capture_pageview"===this.config.capture_pageleave&&(!0===this.config.capture_pageview||"history_change"===this.config.capture_pageview)}createPersonProfile(){this._hasPersonProcessing()||this._requirePersonProcessing("posthog.createPersonProfile")&&this.setPersonProperties({},{})}setInternalOrTestUser(){this._requirePersonProcessing("posthog.setInternalOrTestUser")&&this.setPersonProperties({$internal_or_test_user:!0})}_requirePersonProcessing(e){return"never"===this.config.person_profiles?(Zi.error(e+' was called, but process_person is set to "never". This call will be ignored.'),!1):(this._register_single(J,!0),!0)}_is_persistence_disabled(){if("always"===this.config.cookieless_mode)return!0;var e=this.consent.isOptedOut();return this.config.disable_persistence||e&&!(!this.config.opt_out_persistence_by_default&&this.config.cookieless_mode!==se)}_sync_opt_out_with_persistence(){var e,t,i,s,r=this._is_persistence_disabled();return(null==(e=this.persistence)?void 0:e._disabled)!==r&&(null==(i=this.persistence)||i.set_disabled(r)),(null==(t=this.sessionPersistence)?void 0:t._disabled)!==r&&(null==(s=this.sessionPersistence)||s.set_disabled(r)),r}opt_in_capturing(e){var t;if(this.config.cookieless_mode!==re){if(this._inCookielessMode()){var i,s,r,n,o;this.reset(!0),null==(i=this.sessionManager)||i.destroy(),null==(s=this.pageViewManager)||s.destroy(),this.sessionManager=new _o(this),this.pageViewManager=new Er(this),this.persistence&&(this.sessionPropsManager=new lo(this,this.sessionManager,this.persistence));var a,l=null!==(r=null==(n=this.config.__extensionClasses)?void 0:n.sessionRecording)&&void 0!==r?r:null==(o=jo.__defaultExtensionClasses)?void 0:o.sessionRecording;l&&(this.sessionRecording=this._replaceExtension(this.sessionRecording,new l(this)),this._lastRemoteConfig&&(null==(a=this.sessionRecording)||null==a.onRemoteConfig||a.onRemoteConfig(this._lastRemoteConfig)))}var u,c;this.consent.optInOut(!0),this._sync_opt_out_with_persistence(),this._start_queue_if_opted_in(),null==(t=this.sessionRecording)||t.startIfEnabledOrStop(),this.config.cookieless_mode==se&&(null==(u=this.surveys)||u.loadIfEnabled()),(We(null==e?void 0:e.captureEventName)||null!=e&&e.captureEventName)&&this.capture(null!==(c=null==e?void 0:e.captureEventName)&&void 0!==c?c:"$opt_in",null==e?void 0:e.captureProperties,{send_instantly:!0}),this.config.capture_pageview&&this._captureInitialPageview()}else Zi.warn(Oo)}opt_out_capturing(){var e,t,i;this.config.cookieless_mode!==re?(this.config.cookieless_mode===se&&this.consent.isOptedIn()&&this.reset(!0),this.consent.optInOut(!1),this._sync_opt_out_with_persistence(),this.config.cookieless_mode===se&&(this.register({distinct_id:Q,$device_id:null}),null==(e=this.sessionRecording)||e.stopRecording(),this.sessionRecording=void 0,null==(t=this.sessionManager)||t.destroy(),null==(i=this.pageViewManager)||i.destroy(),this.sessionManager=void 0,this.sessionPropsManager=void 0,this._captureInitialPageview(),this._start_queue_if_opted_in())):Zi.warn(Oo)}has_opted_in_capturing(){return this.consent.isOptedIn()}has_opted_out_capturing(){return this.consent.isOptedOut()}get_explicit_consent_status(){var e=this.consent.consent;return 1===e?"granted":0===e?"denied":"pending"}is_capturing(){return this.config.cookieless_mode===re||(this.config.cookieless_mode===se?this.consent.isRejected()||this.consent.isOptedIn():!this.has_opted_out_capturing())}clear_opt_in_out_capturing(){this.consent.reset(),this._sync_opt_out_with_persistence()}_is_bot(){return fe?ho(fe,this.config.custom_blocked_useragents):void 0}_captureInitialPageview(){me&&("visible"===me.visibilityState?this._initialPageviewCaptured||(this._initialPageviewCaptured=!0,this.capture(ce,{title:me.title},{send_instantly:!0}),this._visibilityStateListener&&(me.removeEventListener(le,this._visibilityStateListener),this._visibilityStateListener=null)):this._visibilityStateListener||(this._visibilityStateListener=this._captureInitialPageview.bind(this),cs(me,le,this._visibilityStateListener)))}debug(e){!1===e?(null==pe||pe.console.log("You've disabled debug mode."),this.set_config({debug:!1})):(null==pe||pe.console.log("You're now in debug mode. All calls to PostHog will be logged in your console.\nYou can disable this with `posthog.debug(false)`."),this.set_config({debug:!0}))}_shouldDisableFlags(){var e,t,i,s,r,n,o=this._originalUserConfig||{};return"advanced_disable_flags"in o?!!o.advanced_disable_flags:!1!==this.config.advanced_disable_flags?!!this.config.advanced_disable_flags:!0===this.config.advanced_disable_decide?(Zi.warn("Config field 'advanced_disable_decide' is deprecated. Please use 'advanced_disable_flags' instead. The old field will be removed in a future major version."),!0):(i="advanced_disable_decide",!1,s=Zi,r=(t="advanced_disable_flags")in(e=o)&&!Je(e[t]),n=i in e&&!Je(e[i]),r?e[t]:!!n&&(s&&s.warn("Config field '"+i+"' is deprecated. Please use '"+t+"' instead. The old field will be removed in a future major version."),e[i]))}_runBeforeSend(e){if(Je(this.config.before_send))return e;var t=ze(this.config.before_send)?this.config.before_send:[this.config.before_send],i=e;for(var s of t){if(i=s(i),Je(i)){var r="Event '"+e.event+"' was rejected in beforeSend function";return tt(e.event)?Zi.warn(r+". This can cause unexpected behavior."):Zi.info(r),null}i.properties&&!Ve(i.properties)||Zi.warn("Event '"+e.event+"' has no properties after beforeSend function, this is likely an error.")}return i}getPageViewId(){var e;return null==(e=this.pageViewManager._currentPageview)?void 0:e.pageViewId}captureTraceFeedback(e,t){this.capture("$ai_feedback",{$ai_trace_id:String(e),$ai_feedback_text:t})}captureTraceMetric(e,t,i){this.capture("$ai_metric",{$ai_trace_id:String(e),$ai_metric_name:t,$ai_metric_value:String(i)})}_checkLocalStorageForDebug(e){var t=Ze(e)&&!e,i=Ss._is_supported()&&"true"===Ss._get("ph_debug");return!t&&(!!i||e)}}jo.__defaultExtensionClasses={},jo._noopLogger={trace:Ro=()=>{},debug:Ro,info:Ro,warn:Ro,error:Ro,fatal:Ro},function(e,t){for(var i=0;t.length>i;i++)e.prototype[t[i]]=os(e.prototype[t[i]])}(jo,["identify"]);class Vo{constructor(e){this.disabled=!1===e;var t=je(e)?e:{};this.thresholdPx=t.threshold_px||30,this.timeoutMs=t.timeout_ms||1e3,this.clickCount=t.click_count||3,this.clicks=[]}isRageClick(e,t,i){if(this.disabled)return!1;var s=this.clicks[this.clicks.length-1];if(s&&Math.abs(e-s.x)+Math.abs(t-s.y)<this.thresholdPx&&this.timeoutMs>i-s.timestamp){if(this.clicks.push({x:e,y:t,timestamp:i}),this.clicks.length===this.clickCount)return!0}else this.clicks=[{x:e,y:t,timestamp:i}];return!1}}var Wo="$copy_autocapture",Go=es("[AutoCapture]");function Ko(e,t){return t.length>e?t.slice(0,e)+"...":t}function Yo(e){if(e.previousElementSibling)return e.previousElementSibling;var t=e;do{t=t.previousSibling}while(t&&!Os(t));return t}function Jo(e,t){var s,r,{e:n,maskAllElementAttributes:o,maskAllText:a,elementAttributeIgnoreList:l,elementsChainAsString:u}=t;if(!Os(e))return{props:{}};for(var c=[e],d=e;d.parentNode&&!Ms(d,"body");)if(Ds(d.parentNode))c.push(d.parentNode.host),d=d.parentNode.host;else{if(!Os(d.parentNode))break;c.push(d.parentNode),d=d.parentNode}var _,h,p=[],g={},v=!1,f=!1;if(is(c,(e=>{var t=tr(e);if(Ms(e,"a")){var i=e.getAttribute("href");v=t&&!!i&&ur(i)&&i}Ae(Hs(e),"ph-no-capture")&&(f=!0),p.push(function(e,t,i,s){var r=e.tagName.toLowerCase(),n={tag_name:r};js.indexOf(r)>-1&&!i&&(n.$el_text="a"===r.toLowerCase()||"button"===r.toLowerCase()?Ko(1024,cr(e)):Ko(1024,zs(e)));var o=Hs(e);o.length>0&&(n.classes=o.filter((function(e){return""!==e}))),is(e.attributes,(function(i){var r;if((!ir(e)||-1!==["name","id","class","aria-label"].indexOf(i.name))&&(null==s||!s.includes(i.name))&&!t&&ur(i.value)&&(!Ge(r=i.name)||"_ngcontent"!==r.substring(0,10)&&"_nghost"!==r.substring(0,7))){var o=i.value;"class"===i.name&&(o=Ns(o).join(" ")),n["attr__"+i.name]=Ko(1024,o)}}));for(var a=1,l=1,u=e;u=Yo(u);)a++,u.tagName===e.tagName&&l++;return n.nth_child=a,n.nth_of_type=l,n}(e,o,a,l));var s=function(e){if(!tr(e))return{};var t={};return is(e.attributes,(function(e){if(e.name&&0===e.name.indexOf("data-ph-capture-attribute")){var i=e.name.replace("data-ph-capture-attribute-",""),s=e.value;i&&s&&ur(s)&&(t[i]=s)}})),t}(e);ss(g,s)})),f)return{props:{},explicitNoCapture:f};if(a||(p[0].$el_text=Ms(e,"a")||Ms(e,"button")?cr(e):zs(e)),v){var m,y;p[0].attr__href=v;var b=null==(m=kr(v))?void 0:m.host,w=null==pe||null==(y=pe.location)?void 0:y.host;b&&w&&b!==w&&(_=v)}return{props:ss({$event_type:n.type,$ce_version:1},u?{}:{$elements:p},{$elements_chain:(h=p,function(e){return e.map((e=>{var t,s,r="";if(e.tag_name&&(r+=e.tag_name),e.attr_class)for(var n of(e.attr_class.sort(),e.attr_class))r+="."+n.replace(/"/g,"");var o=i({},e.text?{text:e.text}:{},{"nth-child":null!==(t=e.nth_child)&&void 0!==t?t:0,"nth-of-type":null!==(s=e.nth_of_type)&&void 0!==s?s:0},e.href?{href:e.href}:{},e.attr_id?{attr_id:e.attr_id}:{},e.attributes),a={};return rs(o).sort(((e,t)=>{var[i]=e,[s]=t;return i.localeCompare(s)})).forEach((e=>{var[t,i]=e;return a[_r(t.toString())]=_r(i.toString())})),(r+=":")+rs(a).map((e=>{var[t,i]=e;return t+'="'+i+'"'})).join("")})).join(";")}(function(e){return e.map((e=>{var t,i,s={text:null==(t=e.$el_text)?void 0:t.slice(0,400),tag_name:e.tag_name,href:null==(i=e.attr__href)?void 0:i.slice(0,2048),attr_class:hr(e),attr_id:e.attr__id,nth_child:e.nth_child,nth_of_type:e.nth_of_type,attributes:{}};return rs(e).filter((e=>{var[t]=e;return 0===t.indexOf("attr__")})).forEach((e=>{var[t,i]=e;return s.attributes[t]=i})),s}))}(h)))},null!=(s=p[0])&&s.$el_text?{$el_text:null==(r=p[0])?void 0:r.$el_text}:{},_&&"click"===n.type?{$external_click_url:_}:{},g)}}var Xo=es("[ExceptionAutocapture]");function Qo(e,t,i){try{if(!(t in e))return()=>{};var s=e[t],r=i(s);return Be(r)&&(r.prototype=r.prototype||{},Object.defineProperties(r,{__posthog_wrapped__:{enumerable:!1,value:!0}})),e[t]=r,()=>{e[t]===r&&(e[t]=s)}}catch(e){return()=>{}}}var Zo=es("[TracingHeaders]"),ea=es("[Web Vitals]"),ta=9e5,ia="disabled",sa="lazy_loading",ra="awaiting_config",na="missing_config";es("[SessionRecording]"),es("[SessionRecording]");var oa="[SessionRecording]",aa=es(oa),la=es("[Heatmaps]");function ua(e){return je(e)&&"clientX"in e&&"clientY"in e&&Xe(e.clientX)&&Xe(e.clientY)}var ca=es("[Product Tours]"),da=["$set_once","$set"],_a=es("[SiteApps]"),ha="Error while initializing PostHog app with config id ";function pa(e,t,i){if(Je(e))return!1;switch(i){case"exact":return e===t;case"contains":var s=t.replace(/[.*+?^${}()|[\]\\]/g,"\\$&").replace(/_/g,".").replace(/%/g,".*");return new RegExp(s,"i").test(e);case"regex":try{return new RegExp(t).test(e)}catch(e){return!1}default:return!1}}class ga{constructor(e){this._debugEventEmitter=new uo,this._checkStep=(e,t)=>this._checkStepEvent(e,t)&&this._checkStepUrl(e,t)&&this._checkStepElement(e,t)&&this._checkStepProperties(e,t),this._checkStepEvent=(e,t)=>null==t||!t.event||(null==e?void 0:e.event)===(null==t?void 0:t.event),this._instance=e,this._actionEvents=new Set,this._actionRegistry=new Set}init(){var e,t;We(null==(e=this._instance)?void 0:e._addCaptureHook)||(null==(t=this._instance)||t._addCaptureHook(((e,t)=>{this.on(e,t)})))}register(e){var t,i;if(!We(null==(t=this._instance)?void 0:t._addCaptureHook)&&(e.forEach((e=>{var t,i;null==(t=this._actionRegistry)||t.add(e),null==(i=e.steps)||i.forEach((e=>{var t;null==(t=this._actionEvents)||t.add((null==e?void 0:e.event)||"")}))})),null!=(i=this._instance)&&i.autocapture)){var s,r=new Set;e.forEach((e=>{var t;null==(t=e.steps)||t.forEach((e=>{null!=e&&e.selector&&r.add(null==e?void 0:e.selector)}))})),null==(s=this._instance)||s.autocapture.setElementSelectors(r)}}on(e,t){var i;null!=t&&0!=e.length&&(this._actionEvents.has(e)||this._actionEvents.has(null==t?void 0:t.event))&&this._actionRegistry&&(null==(i=this._actionRegistry)?void 0:i.size)>0&&this._actionRegistry.forEach((e=>{this._checkAction(t,e)&&this._debugEventEmitter.emit("actionCaptured",e.name)}))}_addActionHook(e){this.onAction("actionCaptured",(t=>e(t)))}_checkAction(e,t){if(null==(null==t?void 0:t.steps))return!1;for(var i of t.steps)if(this._checkStep(e,i))return!0;return!1}onAction(e,t){return this._debugEventEmitter.on(e,t)}_checkStepUrl(e,t){if(null!=t&&t.url){var i,s=null==e||null==(i=e.properties)?void 0:i.$current_url;if(!s||"string"!=typeof s)return!1;if(!pa(s,t.url,t.url_matching||"contains"))return!1}return!0}_checkStepElement(e,t){return!!this._checkStepHref(e,t)&&!!this._checkStepText(e,t)&&!!this._checkStepSelector(e,t)}_checkStepHref(e,t){var i;if(null==t||!t.href)return!0;var s=this._getElementsList(e);if(s.length>0)return s.some((e=>pa(e.href,t.href,t.href_matching||"exact")));var r,n=(null==e||null==(i=e.properties)?void 0:i.$elements_chain)||"";return!!n&&pa((r=n.match(/(?::|")href="(.*?)"/))?r[1]:"",t.href,t.href_matching||"exact")}_checkStepText(e,t){var i;if(null==t||!t.text)return!0;var s=this._getElementsList(e);if(s.length>0)return s.some((e=>pa(e.text,t.text,t.text_matching||"exact")||pa(e.$el_text,t.text,t.text_matching||"exact")));var r,n,o,a=(null==e||null==(i=e.properties)?void 0:i.$elements_chain)||"";return!!a&&(r=function(e){for(var t,i=[],s=/(?::|")text="(.*?)"/g;!Je(t=s.exec(e));)i.includes(t[1])||i.push(t[1]);return i}(a),n=t.text,o=t.text_matching||"exact",r.some((e=>pa(e,n,o))))}_checkStepSelector(e,t){var i,s;if(null==t||!t.selector)return!0;var r=null==e||null==(i=e.properties)?void 0:i.$element_selectors;if(null!=r&&r.includes(t.selector))return!0;var n=(null==e||null==(s=e.properties)?void 0:s.$elements_chain)||"";if(t.selector_regex&&n)try{return new RegExp(t.selector_regex).test(n)}catch(e){return!1}return!1}_getElementsList(e){var t;return null==(null==e||null==(t=e.properties)?void 0:t.$elements)?[]:null==e?void 0:e.properties.$elements}_checkStepProperties(e,t){return null==t||!t.properties||0===t.properties.length||mo(t.properties.reduce(((e,t)=>{var i=ze(t.value)?t.value.map(String):null!=t.value?[String(t.value)]:[];return e[t.key]={values:i,operator:t.operator||"exact"},e}),{}),null==e?void 0:e.properties)}}class va{constructor(e){this._instance=e,this._eventToItems=new Map,this._cancelEventToItems=new Map,this._actionToItems=new Map}_doesEventMatchFilter(e,t){return!!e&&mo(e.propertyFilters,null==t?void 0:t.properties)}_buildEventToItemMap(e,t){var i=new Map;return e.forEach((e=>{var s;null==(s=e.conditions)||null==(s=s[t])||null==(s=s.values)||s.forEach((t=>{if(null!=t&&t.name){var s=i.get(t.name)||[];s.push(e.id),i.set(t.name,s)}}))})),i}_getMatchingItems(e,t,i){var s=(i===Wr.Activation?this._eventToItems:this._cancelEventToItems).get(e),r=[];return this._getItems((e=>{r=e.filter((e=>null==s?void 0:s.includes(e.id)))})),r.filter((s=>{var r,n=null==(r=s.conditions)||null==(r=r[i])||null==(r=r.values)?void 0:r.find((t=>t.name===e));return this._doesEventMatchFilter(n,t)}))}register(e){var t;We(null==(t=this._instance)?void 0:t._addCaptureHook)||(this._setupEventBasedItems(e),this._setupActionBasedItems(e))}_setupActionBasedItems(e){var t=e.filter((e=>{var t,i;return(null==(t=e.conditions)?void 0:t.actions)&&(null==(i=e.conditions)||null==(i=i.actions)||null==(i=i.values)?void 0:i.length)>0}));0!==t.length&&(null==this._actionMatcher&&(this._actionMatcher=new ga(this._instance),this._actionMatcher.init(),this._actionMatcher._addActionHook((e=>{this.onAction(e)}))),t.forEach((e=>{var t,i,s,r,n;e.conditions&&null!=(t=e.conditions)&&t.actions&&null!=(i=e.conditions)&&null!=(i=i.actions)&&i.values&&(null==(s=e.conditions)||null==(s=s.actions)||null==(s=s.values)?void 0:s.length)>0&&(null==(r=this._actionMatcher)||r.register(e.conditions.actions.values),null==(n=e.conditions)||null==(n=n.actions)||null==(n=n.values)||n.forEach((t=>{if(t&&t.name){var i=this._actionToItems.get(t.name);i&&i.push(e.id),this._actionToItems.set(t.name,i||[e.id])}})))})))}_setupEventBasedItems(e){var t,i=e.filter((e=>{var t,i;return(null==(t=e.conditions)?void 0:t.events)&&(null==(i=e.conditions)||null==(i=i.events)||null==(i=i.values)?void 0:i.length)>0})),s=e.filter((e=>{var t,i;return(null==(t=e.conditions)?void 0:t.cancelEvents)&&(null==(i=e.conditions)||null==(i=i.cancelEvents)||null==(i=i.values)?void 0:i.length)>0}));0===i.length&&0===s.length||(null==(t=this._instance)||t._addCaptureHook(((e,t)=>{this.onEvent(e,t)})),this._eventToItems=this._buildEventToItemMap(e,Wr.Activation),this._cancelEventToItems=this._buildEventToItemMap(e,Wr.Cancellation))}onEvent(e,t){var i,s=this._getLogger(),r=this._getActivatedKey(),n=this._getShownEventName(),o=(null==(i=this._instance)||null==(i=i.persistence)?void 0:i.props[r])||[];if(n===e&&t&&o.length>0){var a,l;s.info("event matched, removing item from activated items",{event:e,eventPayload:t,existingActivatedItems:o});var u=(null==t||null==(a=t.properties)?void 0:a.$survey_id)||(null==t||null==(l=t.properties)?void 0:l.$product_tour_id);if(u){var c=o.indexOf(u);0>c||(o.splice(c,1),this._updateActivatedItems(o))}}else{if(this._cancelEventToItems.has(e)){var d=this._getMatchingItems(e,t,Wr.Cancellation);d.length>0&&(s.info("cancel event matched, cancelling items",{event:e,itemsToCancel:d.map((e=>e.id))}),d.forEach((e=>{var t=o.indexOf(e.id);0>t||o.splice(t,1),this._cancelPendingItem(e.id)})),this._updateActivatedItems(o))}if(this._eventToItems.has(e)){s.info("event name matched",{event:e,eventPayload:t,items:this._eventToItems.get(e)});var _=this._getMatchingItems(e,t,Wr.Activation);this._updateActivatedItems(o.concat(_.map((e=>e.id))||[]))}}}onAction(e){var t,i=this._getActivatedKey(),s=(null==(t=this._instance)||null==(t=t.persistence)?void 0:t.props[i])||[];this._actionToItems.has(e)&&this._updateActivatedItems(s.concat(this._actionToItems.get(e)||[]))}_updateActivatedItems(e){var t=this._getLogger(),i=[...new Set(e)].filter((e=>!this._isItemPermanentlyIneligible(e)));t.info("updating activated items",{activatedItems:i}),this._setActivatedItems(i)}getActivatedIds(){var e,t=this._getActivatedKey();return(null==(e=this._instance)||null==(e=e.persistence)?void 0:e.props[t])||[]}getEventToItemsMap(){return this._eventToItems}_getActionMatcher(){return this._actionMatcher}}class fa extends va{constructor(e){super(e)}_getActivatedKey(){return N}_getShownEventName(){return en.SHOWN}_getItems(e){var t;null==(t=this._instance)||t.getSurveys(e)}_cancelPendingItem(e){var t;null==(t=this._instance)||t.cancelPendingSurvey(e)}_getLogger(){return So}_setActivatedItems(e){var t;null==(t=this._instance)||null==(t=t.persistence)||t.register({[N]:e})}_isItemPermanentlyIneligible(){return!1}getSurveys(){return this.getActivatedIds()}getEventToSurveys(){return this.getEventToItemsMap()}}var ma="SDK is not enabled or survey functionality is not yet loaded",ya="Disabled. Not loading surveys.",ba=null!=pe&&pe.location?Ir(pe.location.hash,"__posthog")||Ir(location.hash,"state"):null,wa="_postHogToolbarParams",Ea=es("[Toolbar]"),Sa=es("[FeatureFlags]"),xa=es("[FeatureFlags]",{debugEnabled:!0}),ka="\" failed. Feature flags didn't load in time.",Ta=e=>{for(var t={},i=0;e.length>i;i++)t[e[i]]=!0;return t},Pa=e=>{var t={};for(var[i,s]of rs(e||{}))s&&(t[i]=s);return t},Ia=es("[Error tracking]"),Ca="Refusing to render web experiment since the viewer is a likely bot",Ra={icontains:(e,t)=>!!pe&&t.href.toLowerCase().indexOf(e.toLowerCase())>-1,not_icontains:(e,t)=>!!pe&&-1===t.href.toLowerCase().indexOf(e.toLowerCase()),regex:(e,t)=>!!pe&&po(t.href,e),not_regex:(e,t)=>!!pe&&!po(t.href,e),exact:(e,t)=>t.href===e,is_not:(e,t)=>t.href!==e};class Fa{get _config(){return this._instance.config}constructor(e){var t=this;this.getWebExperimentsAndEvaluateDisplayLogic=function(e){void 0===e&&(e=!1),t.getWebExperiments((e=>{Fa._logInfo("retrieved web experiments from the server"),t._flagToExperiments=new Map,e.forEach((e=>{if(e.feature_flag_key){var i;t._flagToExperiments&&(Fa._logInfo("setting flag key ",e.feature_flag_key," to web experiment ",e),null==(i=t._flagToExperiments)||i.set(e.feature_flag_key,e));var s=t._instance.getFeatureFlag(e.feature_flag_key);Ge(s)&&e.variants[s]&&t._applyTransforms(e.name,s,e.variants[s].transforms)}else if(e.variants)for(var r in e.variants){var n=e.variants[r];Fa._matchesTestVariant(n)&&t._applyTransforms(e.name,r,n.transforms)}}))}),e)},this._instance=e,this._instance.onFeatureFlags((e=>{this.onFeatureFlags(e)}))}initialize(){}onFeatureFlags(e){if(this._is_bot())Fa._logInfo(Ca);else if(!this._config.disable_web_experiments){if(Je(this._flagToExperiments))return this._flagToExperiments=new Map,this.loadIfEnabled(),void this.previewWebExperiment();Fa._logInfo("applying feature flags",e),e.forEach((e=>{var t;if(this._flagToExperiments&&null!=(t=this._flagToExperiments)&&t.has(e)){var i,s=this._instance.getFeatureFlag(e),r=null==(i=this._flagToExperiments)?void 0:i.get(e);s&&null!=r&&r.variants[s]&&this._applyTransforms(r.name,s,r.variants[s].transforms)}}))}}previewWebExperiment(){var e=Fa.getWindowLocation();if(null!=e&&e.search){var t=Tr(null==e?void 0:e.search,"__experiment_id"),i=Tr(null==e?void 0:e.search,"__experiment_variant");t&&i&&(Fa._logInfo("previewing web experiments "+t+" && "+i),this.getWebExperiments((e=>{this._showPreviewWebExperiment(parseInt(t),i,e)}),!1,!0))}}loadIfEnabled(){this._config.disable_web_experiments||this.getWebExperimentsAndEvaluateDisplayLogic()}getWebExperiments(e,t,i){if(this._config.disable_web_experiments&&!i)return e([]);var s=this._instance.get_property("$web_experiments");if(s&&!t)return e(s);this._instance._send_request({url:this._instance.requestRouter.endpointFor("api","/api/web_experiments/?token="+this._config.token),method:"GET",callback:t=>e(200===t.statusCode&&t.json&&t.json.experiments||[])})}_showPreviewWebExperiment(e,t,i){var s=i.filter((t=>t.id===e));s&&s.length>0&&(Fa._logInfo("Previewing web experiment ["+s[0].name+"] with variant ["+t+"]"),this._applyTransforms(s[0].name,t,s[0].variants[t].transforms))}static _matchesTestVariant(e){return!Je(e.conditions)&&Fa._matchUrlConditions(e)&&Fa._matchUTMConditions(e)}static _matchUrlConditions(e){var t;if(Je(e.conditions)||Je(null==(t=e.conditions)?void 0:t.url))return!0;var i,s,r,n=Fa.getWindowLocation();return!!n&&(null==(i=e.conditions)||!i.url||Ra[null!==(s=null==(r=e.conditions)?void 0:r.urlMatchType)&&void 0!==s?s:"icontains"](e.conditions.url,n))}static getWindowLocation(){return null==pe?void 0:pe.location}static _matchUTMConditions(e){var t;if(Je(e.conditions)||Je(null==(t=e.conditions)?void 0:t.utm))return!0;var i=Or();if(i.utm_source){var s,r,n,o,a,l,u,c,d=null==(s=e.conditions)||null==(s=s.utm)||!s.utm_campaign||(null==(r=e.conditions)||null==(r=r.utm)?void 0:r.utm_campaign)==i.utm_campaign,_=null==(n=e.conditions)||null==(n=n.utm)||!n.utm_source||(null==(o=e.conditions)||null==(o=o.utm)?void 0:o.utm_source)==i.utm_source,h=null==(a=e.conditions)||null==(a=a.utm)||!a.utm_medium||(null==(l=e.conditions)||null==(l=l.utm)?void 0:l.utm_medium)==i.utm_medium,p=null==(u=e.conditions)||null==(u=u.utm)||!u.utm_term||(null==(c=e.conditions)||null==(c=c.utm)?void 0:c.utm_term)==i.utm_term;return d&&h&&p&&_}return!1}static _logInfo(e){for(var t=arguments.length,i=new Array(t>1?t-1:0),s=1;t>s;s++)i[s-1]=arguments[s];Zi.info("[WebExperiments] "+e,i)}_applyTransforms(e,t,i){this._is_bot()?Fa._logInfo(Ca):"control"!==t?i.forEach((i=>{if(i.selector){var s;Fa._logInfo("applying transform of variant "+t+" for experiment "+e+" ",i);var r=null==(s=document)?void 0:s.querySelectorAll(i.selector);null==r||r.forEach((e=>{var t=e;i.html&&(t.innerHTML=i.html),i.css&&t.setAttribute("style",i.css)}))}})):Fa._logInfo("Control variants leave the page unmodified.")}_is_bot(){return fe&&this._instance?ho(fe,this._config.custom_blocked_useragents):void 0}}var La=es("[Conversations]"),$a="Conversations not available yet.",Oa={featureFlags:class{constructor(e){this._override_warning=!1,this._hasLoadedFlags=!1,this._requestInFlight=!1,this._reloadingDisabled=!1,this._additionalReloadRequested=!1,this._flagsLoadedFromRemote=!1,this._hasLoggedDeprecationWarning=!1,this._staleCacheRefreshTriggered=!1,this._instance=e,this.featureFlagEventHandlers=[]}get _config(){return this._instance.config}get _persistence(){return this._instance.persistence}_prop(e){return this._instance.get_property(e)}_isCacheStale(){var e,t;return null!==(e=null==(t=this._persistence)?void 0:t._isFeatureFlagCacheStale(this._config.feature_flag_cache_ttl_ms))&&void 0!==e&&e}_checkAndTriggerStaleRefresh(){return!!this._isCacheStale()&&(this._staleCacheRefreshTriggered||this._requestInFlight||(this._staleCacheRefreshTriggered=!0,Sa.warn("Feature flag cache is stale, triggering refresh..."),this.reloadFeatureFlags()),!0)}_getValidEvaluationEnvironments(){var e,t=null!==(e=this._config.evaluation_contexts)&&void 0!==e?e:this._config.evaluation_environments;return!this._config.evaluation_environments||this._config.evaluation_contexts||this._hasLoggedDeprecationWarning||(Sa.warn("evaluation_environments is deprecated. Use evaluation_contexts instead. evaluation_environments will be removed in a future version."),this._hasLoggedDeprecationWarning=!0),null!=t&&t.length?t.filter((e=>{var t=e&&"string"==typeof e&&e.trim().length>0;return t||Sa.error("Invalid evaluation context found:",e,"Expected non-empty string"),t})):[]}_shouldIncludeEvaluationEnvironments(){return this._getValidEvaluationEnvironments().length>0}_getValidFlagKeys(){var e=this._config.flag_keys;if(!We(e)){if(ze(e))return e.filter((e=>{var t=e&&"string"==typeof e&&e.trim().length>0;return t||Sa.error("Invalid flag key found:",e,"Expected non-empty string"),t}));Sa.error("Invalid flag_keys found:",e,"Expected array of non-empty strings")}}initialize(){var e,t,{config:i}=this._instance,s=null!==(e=null==(t=i.bootstrap)?void 0:t.featureFlags)&&void 0!==e?e:{};if(Object.keys(s).length){var r,n,o=null!==(r=null==(n=i.bootstrap)?void 0:n.featureFlagPayloads)&&void 0!==r?r:{},a=Object.keys(s).filter((e=>!!s[e])).reduce(((e,t)=>(e[t]=s[t]||!1,e)),{}),l=Object.keys(o).filter((e=>a[e])).reduce(((e,t)=>(o[t]&&(e[t]=o[t]),e)),{});this.receivedFeatureFlags({featureFlags:a,featureFlagPayloads:l})}}updateFlags(e,t,s){var r=null!=s&&s.merge?this.getFlagVariants():{},n=null!=s&&s.merge?this.getFlagPayloads():{},o=i({},r,e),a=i({},n,t),l={};for(var[u,c]of Object.entries(o)){var d="string"==typeof c;l[u]={key:u,enabled:!!d||Boolean(c),variant:d?c:void 0,reason:void 0,metadata:We(null==a?void 0:a[u])?void 0:{id:0,version:void 0,description:void 0,payload:a[u]}}}this.receivedFeatureFlags({flags:l})}get hasLoadedFlags(){return this._hasLoadedFlags}getFlags(){return Object.keys(this.getFlagVariants())}getFlagsWithDetails(){var e=this._prop(C),t=this._prop(L),s=this._prop(O);if(!s&&!t)return e||{};var r=ss({},e||{}),n=[...new Set([...Object.keys(s||{}),...Object.keys(t||{})])];for(var o of n){var a,l,u=r[o],c=null==t?void 0:t[o],d=We(c)?null!==(a=null==u?void 0:u.enabled)&&void 0!==a&&a:!!c,_=We(c)?u.variant:"string"==typeof c?c:void 0,h=null==s?void 0:s[o],p=i({},u,{enabled:d,variant:d?null!=_?_:null==u?void 0:u.variant:void 0});d!==(null==u?void 0:u.enabled)&&(p.original_enabled=null==u?void 0:u.enabled),_!==(null==u?void 0:u.variant)&&(p.original_variant=null==u?void 0:u.variant),h&&(p.metadata=i({},null==u?void 0:u.metadata,{payload:h,original_payload:null==u||null==(l=u.metadata)?void 0:l.payload})),r[o]=p}return this._override_warning||(Sa.warn(" Overriding feature flag details!",{flagDetails:e,overriddenPayloads:s,finalDetails:r}),this._override_warning=!0),r}getFlagVariants(){var e=this._prop(T),t=this._prop(L);if(!t)return e||{};for(var i=ss({},e),s=Object.keys(t),r=0;s.length>r;r++)i[s[r]]=t[s[r]];return this._override_warning||(Sa.warn(" Overriding feature flags!",{enabledFlags:e,overriddenFlags:t,finalFlags:i}),this._override_warning=!0),i}getFlagPayloads(){var e=this._prop(R),t=this._prop(O);if(!t)return e||{};for(var i=ss({},e||{}),s=Object.keys(t),r=0;s.length>r;r++)i[s[r]]=t[s[r]];return this._override_warning||(Sa.warn(" Overriding feature flag payloads!",{flagPayloads:e,overriddenPayloads:t,finalPayloads:i}),this._override_warning=!0),i}reloadFeatureFlags(){this._reloadingDisabled||this._config.advanced_disable_feature_flags||this._reloadDebouncer||(this._instance._internalEventEmitter.emit("featureFlagsReloading",!0),this._reloadDebouncer=setTimeout((()=>{this._callFlagsEndpoint()}),5))}_clearDebouncer(){clearTimeout(this._reloadDebouncer),this._reloadDebouncer=void 0}ensureFlagsLoaded(){this._hasLoadedFlags||this._requestInFlight||this._reloadDebouncer||this.reloadFeatureFlags()}setAnonymousDistinctId(e){this.$anon_distinct_id=e}setReloadingPaused(e){this._reloadingDisabled=e}_callFlagsEndpoint(e){var t;if(this._clearDebouncer(),!this._instance._shouldDisableFlags())if(this._requestInFlight)this._additionalReloadRequested=!0;else{var s=this._config.token,r=this._prop(a),n={token:s,distinct_id:this._instance.get_distinct_id(),groups:this._instance.getGroups(),$anon_distinct_id:this.$anon_distinct_id,person_properties:i({},(null==(t=this._persistence)?void 0:t.get_initial_props())||{},this._prop(M)||{}),group_properties:this._prop(A),timezone:zr()};Ye(r)||We(r)||(n.$device_id=r),(null!=e&&e.disableFlags||this._config.advanced_disable_feature_flags)&&(n.disable_flags=!0),this._shouldIncludeEvaluationEnvironments()&&(n.evaluation_contexts=this._getValidEvaluationEnvironments());var o=this._getValidFlagKeys();We(o)||(n.flag_keys=o);var l=!!this._config.advanced_only_evaluate_survey_feature_flags,u=this._instance.requestRouter.endpointFor("flags","/flags/?v=2"+(this._config.advanced_only_evaluate_survey_feature_flags?"&only_evaluate_survey_feature_flags=true":""));this._requestInFlight=!0,this._instance._send_request({method:"POST",url:u,data:n,compression:this._config.disable_compression?void 0:_n.Base64,timeout:this._config.feature_flag_request_timeout_ms,callback:e=>{var t,i,s,r=!0;if(200===e.statusCode&&(this._additionalReloadRequested||(this.$anon_distinct_id=void 0),r=!1),this._requestInFlight=!1,!n.disable_flags||this._additionalReloadRequested){this._flagsLoadedFromRemote=!r;var o=[];e.error?e.error instanceof Error?o.push("AbortError"===e.error.name?"timeout":"connection_error"):o.push("unknown_error"):200!==e.statusCode&&o.push("api_error_"+e.statusCode),null!=(t=e.json)&&t.errorsWhileComputingFlags&&o.push("errors_while_computing_flags");var a,u=!(null==(i=e.json)||null==(i=i.quotaLimited)||!i.includes("feature_flags"));if(u&&o.push("quota_limited"),null==(s=this._persistence)||s.register({[z]:o}),u)Sa.warn("You have hit your feature flags quota limit, and will not be able to load feature flags until the quota is reset.  Please visit https://posthog.com/docs/billing/limits-alerts to learn more.");else n.disable_flags||this.receivedFeatureFlags(null!==(a=e.json)&&void 0!==a?a:{},r,{partialResponse:l}),this._additionalReloadRequested&&(this._additionalReloadRequested=!1,this._callFlagsEndpoint())}}})}}getFeatureFlag(e,t){var i;if(void 0===t&&(t={}),!t.fresh||this._flagsLoadedFromRemote)if(this._hasLoadedFlags||this.getFlags()&&this.getFlags().length>0){if(!this._checkAndTriggerStaleRefresh()){var s=this.getFeatureFlagResult(e,t);return null!==(i=null==s?void 0:s.variant)&&void 0!==i?i:null==s?void 0:s.enabled}}else Sa.warn('getFeatureFlag for key "'+e+ka)}getFeatureFlagDetails(e){return this.getFlagsWithDetails()[e]}getFeatureFlagPayload(e){var t=this.getFeatureFlagResult(e,{send_event:!1});return null==t?void 0:t.payload}getFeatureFlagResult(e,t){if(void 0===t&&(t={}),!t.fresh||this._flagsLoadedFromRemote)if(this._hasLoadedFlags||this.getFlags()&&this.getFlags().length>0){if(!this._checkAndTriggerStaleRefresh()){var i=this.getFlagVariants(),s=e in i,r=i[e],n=this.getFlagPayloads()[e],o=String(r),a=this._prop(F)||void 0,l=this._prop(B)||void 0,u=this._prop(H)||{};if(this._config.advanced_feature_flags_dedup_per_session){var c,d=this._instance.get_session_id(),_=this._prop(q);d&&d!==_&&(u={},null==(c=this._persistence)||c.register({[H]:u,[q]:d}))}if((t.send_event||!("send_event"in t))&&(!(e in u)||!u[e].includes(o))){var h,p,g,v,f,m,y,b,w,E;ze(u[e])?u[e].push(o):u[e]=[o],null==(h=this._persistence)||h.register({[H]:u});var S=this.getFeatureFlagDetails(e),x=[...null!==(p=this._prop(z))&&void 0!==p?p:[]];We(r)&&x.push("flag_missing");var k={$feature_flag:e,$feature_flag_response:r,$feature_flag_payload:n||null,$feature_flag_request_id:a,$feature_flag_evaluated_at:l,$feature_flag_bootstrapped_response:(null==(g=this._config.bootstrap)||null==(g=g.featureFlags)?void 0:g[e])||null,$feature_flag_bootstrapped_payload:(null==(v=this._config.bootstrap)||null==(v=v.featureFlagPayloads)?void 0:v[e])||null,$used_bootstrap_value:!this._flagsLoadedFromRemote};We(null==S||null==(f=S.metadata)?void 0:f.version)||(k.$feature_flag_version=S.metadata.version);var T,P=null!==(m=null==S||null==(y=S.reason)?void 0:y.description)&&void 0!==m?m:null==S||null==(b=S.reason)?void 0:b.code;P&&(k.$feature_flag_reason=P),null!=S&&null!=(w=S.metadata)&&w.id&&(k.$feature_flag_id=S.metadata.id),We(null==S?void 0:S.original_variant)&&We(null==S?void 0:S.original_enabled)||(k.$feature_flag_original_response=We(S.original_variant)?S.original_enabled:S.original_variant),null!=S&&null!=(E=S.metadata)&&E.original_payload&&(k.$feature_flag_original_payload=null==S||null==(T=S.metadata)?void 0:T.original_payload),x.length&&(k.$feature_flag_error=x.join(",")),this._instance.capture("$feature_flag_called",k)}if(s){var I=n;if(!We(n))try{I=JSON.parse(n)}catch(e){}return{key:e,enabled:!!r,variant:"string"==typeof r?r:void 0,payload:I}}}}else Sa.warn('getFeatureFlagResult for key "'+e+ka)}getRemoteConfigPayload(e,t){var i=this._config.token,s={distinct_id:this._instance.get_distinct_id(),token:i};this._shouldIncludeEvaluationEnvironments()&&(s.evaluation_contexts=this._getValidEvaluationEnvironments());var r=this._getValidFlagKeys();We(r)||(s.flag_keys=r),this._instance._send_request({method:"POST",url:this._instance.requestRouter.endpointFor("flags","/flags/?v=2"),data:s,compression:this._config.disable_compression?void 0:_n.Base64,timeout:this._config.feature_flag_request_timeout_ms,callback(i){var s,r=null==(s=i.json)?void 0:s.featureFlagPayloads;t((null==r?void 0:r[e])||void 0)}})}isFeatureEnabled(e,t){if(void 0===t&&(t={}),!t.fresh||this._flagsLoadedFromRemote){if(this._hasLoadedFlags||this.getFlags()&&this.getFlags().length>0){var i=this.getFeatureFlag(e,t);return We(i)?void 0:!!i}Sa.warn('isFeatureEnabled for key "'+e+ka)}}addFeatureFlagsHandler(e){this.featureFlagEventHandlers.push(e)}removeFeatureFlagsHandler(e){this.featureFlagEventHandlers=this.featureFlagEventHandlers.filter((t=>t!==e))}receivedFeatureFlags(e,t,s){if(this._persistence){this._hasLoadedFlags=!0;var r=this.getFlagVariants(),n=this.getFlagPayloads(),o=this.getFlagsWithDetails();!function(e,t,s,r,n,o){void 0===s&&(s={}),void 0===r&&(r={}),void 0===n&&(n={});var a=(e=>{var t=e.flags;return t?(e.featureFlags=Object.fromEntries(Object.keys(t).map((e=>{var i;return[e,null!==(i=t[e].variant)&&void 0!==i?i:t[e].enabled]}))),e.featureFlagPayloads=Object.fromEntries(Object.keys(t).filter((e=>t[e].enabled)).filter((e=>{var i;return null==(i=t[e].metadata)?void 0:i.payload})).map((e=>{var i;return[e,null==(i=t[e].metadata)?void 0:i.payload]})))):Sa.warn("Using an older version of the feature flags endpoint. Please upgrade your PostHog server to the latest version"),e})(e),l=a.flags,u=a.featureFlags,c=a.featureFlagPayloads;if(u){var d=e.requestId,_=e.evaluatedAt;if(ze(u)){Sa.warn("v1 of the feature flags endpoint is deprecated. Please use the latest version.");var h={};if(u)for(var p=0;u.length>p;p++)h[u[p]]=!0;t&&t.register({[P]:u,[T]:h})}else{var g=u,v=c,f=l;if(null!=o&&o.partialResponse)g=i({},s,g),v=i({},r,v),f=i({},n,f);else if(e.errorsWhileComputingFlags)if(l){var m=new Set(Object.keys(l).filter((e=>{var t;return!(null!=(t=l[e])&&t.failed)})));g=i({},s,Object.fromEntries(Object.entries(g).filter((e=>{var[t]=e;return m.has(t)})))),v=i({},r,Object.fromEntries(Object.entries(v||{}).filter((e=>{var[t]=e;return m.has(t)})))),f=i({},n,Object.fromEntries(Object.entries(f||{}).filter((e=>{var[t]=e;return m.has(t)}))))}else g=i({},s,g),v=i({},r,v),f=i({},n,f);t&&t.register(i({[P]:Object.keys(Pa(g)),[T]:g||{},[R]:v||{},[C]:f||{}},d?{[F]:d}:{},_?{[B]:_}:{}))}}}(e,this._persistence,r,n,o,s),t||(this._staleCacheRefreshTriggered=!1),this._fireFeatureFlagsCallbacks(t)}}override(e,t){void 0===t&&(t=!1),Sa.warn("override is deprecated. Please use overrideFeatureFlags instead."),this.overrideFeatureFlags({flags:e,suppressWarning:t})}overrideFeatureFlags(e){if(!this._instance.__loaded||!this._persistence)return Sa.uninitializedWarning("posthog.featureFlags.overrideFeatureFlags");if(!1===e)return this._persistence.unregister(L),this._persistence.unregister(O),this._fireFeatureFlagsCallbacks(),xa.info("All overrides cleared");if(ze(e)){var t=Ta(e);return this._persistence.register({[L]:t}),this._fireFeatureFlagsCallbacks(),xa.info("Flag overrides set",{flags:e})}if(e&&"object"==typeof e&&("flags"in e||"payloads"in e)){var i,s=e;if(this._override_warning=Boolean(null!==(i=s.suppressWarning)&&void 0!==i&&i),"flags"in s)if(!1===s.flags)this._persistence.unregister(L),xa.info("Flag overrides cleared");else if(s.flags){if(ze(s.flags)){var r=Ta(s.flags);this._persistence.register({[L]:r})}else this._persistence.register({[L]:s.flags});xa.info("Flag overrides set",{flags:s.flags})}return"payloads"in s&&(!1===s.payloads?(this._persistence.unregister(O),xa.info("Payload overrides cleared")):s.payloads&&(this._persistence.register({[O]:s.payloads}),xa.info("Payload overrides set",{payloads:s.payloads}))),void this._fireFeatureFlagsCallbacks()}if(e&&"object"==typeof e)return this._persistence.register({[L]:e}),this._fireFeatureFlagsCallbacks(),xa.info("Flag overrides set",{flags:e});Sa.warn("Invalid overrideOptions provided to overrideFeatureFlags",{overrideOptions:e})}onFeatureFlags(e){if(this.addFeatureFlagsHandler(e),this._hasLoadedFlags){var{flags:t,flagVariants:i}=this._prepareFeatureFlagsForCallbacks();e(t,i)}return()=>this.removeFeatureFlagsHandler(e)}updateEarlyAccessFeatureEnrollment(e,t,s){var r,n=(this._prop(I)||[]).find((t=>t.flagKey===e)),o={["$feature_enrollment/"+e]:t},a={$feature_flag:e,$feature_enrollment:t,$set:o};n&&(a.$early_access_feature_name=n.name),s&&(a.$feature_enrollment_stage=s),this._instance.capture("$feature_enrollment_update",a),this.setPersonPropertiesForFlags(o,!1);var l=i({},this.getFlagVariants(),{[e]:t});null==(r=this._persistence)||r.register({[P]:Object.keys(Pa(l)),[T]:l}),this._fireFeatureFlagsCallbacks()}getEarlyAccessFeatures(e,t,i){void 0===t&&(t=!1);var s=this._prop(I),r=i?"&"+i.map((e=>"stage="+e)).join("&"):"";if(s&&!t)return e(s);this._instance._send_request({url:this._instance.requestRouter.endpointFor("api","/api/early_access_features/?token="+this._config.token+r),method:"GET",callback:t=>{var i,s;if(t.json){var r=t.json.earlyAccessFeatures;return null==(i=this._persistence)||i.unregister(I),null==(s=this._persistence)||s.register({[I]:r}),e(r)}}})}_prepareFeatureFlagsForCallbacks(){var e=this.getFlags(),t=this.getFlagVariants();return{flags:e.filter((e=>t[e])),flagVariants:Object.keys(t).filter((e=>t[e])).reduce(((e,i)=>(e[i]=t[i],e)),{})}}_fireFeatureFlagsCallbacks(e){var{flags:t,flagVariants:i}=this._prepareFeatureFlagsForCallbacks();this.featureFlagEventHandlers.forEach((s=>s(t,i,{errorsLoading:e})))}setPersonPropertiesForFlags(e,t){void 0===t&&(t=!0);var s=this._prop(M)||{},r=(null==e?void 0:e.$set)||(null!=e&&e.$set_once?{}:e),n=null==e?void 0:e.$set_once,o={};if(n)for(var a in n)({}).hasOwnProperty.call(n,a)&&(a in s||(o[a]=n[a]));this._instance.register({[M]:i({},s,o,r)}),t&&this._instance.reloadFeatureFlags()}resetPersonPropertiesForFlags(){this._instance.unregister(M)}setGroupPropertiesForFlags(e,t){void 0===t&&(t=!0);var s=this._prop(A)||{};0!==Object.keys(s).length&&Object.keys(s).forEach((t=>{s[t]=i({},s[t],e[t]),delete e[t]})),this._instance.register({[A]:i({},s,e)}),t&&this._instance.reloadFeatureFlags()}resetGroupPropertiesForFlags(e){if(e){var t=this._prop(A)||{};this._instance.register({[A]:i({},t,{[e]:{}})})}else this._instance.unregister(A)}reset(){this._hasLoadedFlags=!1,this._requestInFlight=!1,this._reloadingDisabled=!1,this._additionalReloadRequested=!1,this._flagsLoadedFromRemote=!1,this.$anon_distinct_id=void 0,this._clearDebouncer(),this._override_warning=!1}}},Ma={sessionRecording:class{get _config(){return this._instance.config}get _persistence(){return this._instance.persistence}get started(){var e;return!(null==(e=this._lazyLoadedSessionRecording)||!e.isStarted)}get status(){var e,t;return this._recordingStatus===ra||this._recordingStatus===na?this._recordingStatus:null!==(e=null==(t=this._lazyLoadedSessionRecording)?void 0:t.status)&&void 0!==e?e:this._recordingStatus}constructor(e){if(this._forceAllowLocalhostNetworkCapture=!1,this._recordingStatus=ia,this._persistFlagsOnSessionListener=void 0,this._instance=e,!this._instance.sessionManager)throw aa.error("started without valid sessionManager"),new Error(oa+" started without valid sessionManager. This is a bug.");if(this._config.cookieless_mode===re)throw new Error(oa+' cannot be used with cookieless_mode="always"')}initialize(){this.startIfEnabledOrStop()}get _isRecordingEnabled(){var e,t=!(null==(e=this._instance.get_property(y))||!e.enabled),i=!this._config.disable_session_recording,s=this._config.disable_session_recording||this._instance.consent.isOptedOut();return pe&&t&&i&&!s}startIfEnabledOrStop(e){var t;if(!this._isRecordingEnabled||null==(t=this._lazyLoadedSessionRecording)||!t.isStarted){var i=!We(Object.assign)&&!We(Array.from);this._isRecordingEnabled&&i?(this._lazyLoadAndStart(e),aa.info("starting")):(this._recordingStatus=ia,this.stopRecording())}}_lazyLoadAndStart(e){var t,i,s;this._isRecordingEnabled&&(this._recordingStatus!==ra&&this._recordingStatus!==na&&(this._recordingStatus=sa),null!=ke&&null!=(t=ke.__PosthogExtensions__)&&null!=(t=t.rrweb)&&t.record&&null!=(i=ke.__PosthogExtensions__)&&i.initSessionRecording?this._onScriptLoaded(e):null==(s=ke.__PosthogExtensions__)||null==s.loadExternalDependency||s.loadExternalDependency(this._instance,this._scriptName,(t=>{if(t)return aa.error("could not load recorder",t);this._onScriptLoaded(e)})))}stopRecording(){var e,t;null==(e=this._persistFlagsOnSessionListener)||e.call(this),this._persistFlagsOnSessionListener=void 0,null==(t=this._lazyLoadedSessionRecording)||t.stop()}_discardRecording(){var e,t;null==(e=this._persistFlagsOnSessionListener)||e.call(this),this._persistFlagsOnSessionListener=void 0,null==(t=this._lazyLoadedSessionRecording)||t.discard()}_resetSampling(){var e;null==(e=this._persistence)||e.unregister(k)}_validateSampleRate(e,t){if(Je(e))return null;var i,s=Xe(e)?e:parseFloat(e);return"number"!=typeof(i=s)||!Number.isFinite(i)||0>i||i>1?(aa.warn(t+" must be between 0 and 1. Ignoring invalid value:",e),null):s}_persistRemoteConfig(e){if(this._persistence){var t,s,r=this._persistence,n=()=>{var t,s=!1===e.sessionRecording?void 0:e.sessionRecording,n=this._validateSampleRate(null==(t=this._config.session_recording)?void 0:t.sampleRate,"session_recording.sampleRate"),o=this._validateSampleRate(null==s?void 0:s.sampleRate,"remote config sampleRate"),a=null!=n?n:o;Je(a)&&this._resetSampling();var l=null==s?void 0:s.minimumDurationMilliseconds;r.register({[y]:i({cache_timestamp:Date.now(),enabled:!!s},s,{networkPayloadCapture:i({capturePerformance:e.capturePerformance},null==s?void 0:s.networkPayloadCapture),canvasRecording:{enabled:null==s?void 0:s.recordCanvas,fps:null==s?void 0:s.canvasFps,quality:null==s?void 0:s.canvasQuality},sampleRate:a,minimumDurationMilliseconds:We(l)?null:l,endpoint:null==s?void 0:s.endpoint,triggerMatchType:null==s?void 0:s.triggerMatchType,masking:null==s?void 0:s.masking,urlTriggers:null==s?void 0:s.urlTriggers,version:null==s?void 0:s.version,triggerGroups:null==s?void 0:s.triggerGroups})})};n(),null==(t=this._persistFlagsOnSessionListener)||t.call(this),this._persistFlagsOnSessionListener=null==(s=this._instance.sessionManager)?void 0:s.onSessionId(n)}}onRemoteConfig(e){return"sessionRecording"in e?!1===e.sessionRecording?(this._persistRemoteConfig(e),void this._discardRecording()):(this._persistRemoteConfig(e),void this.startIfEnabledOrStop()):(this._recordingStatus===ra&&(this._recordingStatus=na,aa.warn("config refresh failed, recording will not start until page reload")),void this.startIfEnabledOrStop())}log(e,t){var i;void 0===t&&(t="log"),null!=(i=this._lazyLoadedSessionRecording)&&i.log?this._lazyLoadedSessionRecording.log(e,t):aa.warn("log called before recorder was ready")}get _scriptName(){var e,t,i=null==(e=this._instance)||null==(e=e.persistence)?void 0:e.get_property(y);return(null==i||null==(t=i.scriptConfig)?void 0:t.script)||"lazy-recorder"}_isRemoteConfigFresh(){var e,t,i=this._instance.get_property(y);if(!i)return!1;try{t="object"==typeof i?i:JSON.parse(i)}catch(e){return aa.warn("persisted remote config for session recording is invalid and will be ignored",e),!1}var s=null!==(e=t.cache_timestamp)&&void 0!==e?e:Date.now();return 36e5>=Date.now()-s}_onScriptLoaded(e){var t,i;if(null==(t=ke.__PosthogExtensions__)||!t.initSessionRecording)return aa.warn("Called on script loaded before session recording is available. This can be caused by adblockers."),void this._instance.register_for_session({[te]:!0});if(this._lazyLoadedSessionRecording||(this._lazyLoadedSessionRecording=null==(i=ke.__PosthogExtensions__)?void 0:i.initSessionRecording(this._instance),this._lazyLoadedSessionRecording._forceAllowLocalhostNetworkCapture=this._forceAllowLocalhostNetworkCapture),!this._isRemoteConfigFresh()){if(this._recordingStatus===na||this._recordingStatus===ra)return;return this._recordingStatus=ra,aa.info("persisted remote config is stale, requesting fresh config before starting"),void new cn(this._instance).load()}this._recordingStatus=sa,this._lazyLoadedSessionRecording.start(e)}onRRwebEmit(e){var t;null==(t=this._lazyLoadedSessionRecording)||null==t.onRRwebEmit||t.onRRwebEmit(e)}overrideLinkedFlag(){var e,t;this._lazyLoadedSessionRecording||null==(t=this._persistence)||t.register({[w]:!0}),null==(e=this._lazyLoadedSessionRecording)||e.overrideLinkedFlag()}overrideSampling(){var e,t;this._lazyLoadedSessionRecording||null==(t=this._persistence)||t.register({[b]:!0}),null==(e=this._lazyLoadedSessionRecording)||e.overrideSampling()}overrideTrigger(e){var t,i;this._lazyLoadedSessionRecording||null==(i=this._persistence)||i.register({["url"===e?E:S]:!0}),null==(t=this._lazyLoadedSessionRecording)||t.overrideTrigger(e)}get sdkDebugProperties(){var e;return(null==(e=this._lazyLoadedSessionRecording)?void 0:e.sdkDebugProperties)||{$recording_status:this.status}}tryAddCustomEvent(e,t){var i;return!(null==(i=this._lazyLoadedSessionRecording)||!i.tryAddCustomEvent(e,t))}}},Aa={autocapture:class{constructor(e){this._initialized=!1,this._isDisabledServerSide=null,this._elementsChainAsString=!1,this.instance=e,this.rageclicks=new Vo(e.config.rageclick),this._elementSelectors=null}initialize(){this.startIfEnabled()}get _config(){var e,t,i=je(this.instance.config.autocapture)?this.instance.config.autocapture:{};return i.url_allowlist=null==(e=i.url_allowlist)?void 0:e.map((e=>new RegExp(e))),i.url_ignorelist=null==(t=i.url_ignorelist)?void 0:t.map((e=>new RegExp(e))),i}_addDomEventHandlers(){if(this.isBrowserSupported()){if(pe&&me){var e=e=>{e=e||(null==pe?void 0:pe.event);try{this._captureEvent(e)}catch(e){Go.error("Failed to capture event",e)}};if(cs(me,"submit",e,{capture:!0}),cs(me,"change",e,{capture:!0}),cs(me,"click",e,{capture:!0}),this._config.capture_copied_text){var t=e=>{e=e||(null==pe?void 0:pe.event);try{this._captureEvent(e,Wo)}catch(e){Go.error("Failed to capture copy/cut event",e)}};cs(me,"copy",t,{capture:!0}),cs(me,"cut",t,{capture:!0})}}}else Go.info("Disabling Automatic Event Collection because this browser is not supported")}startIfEnabled(){this.isEnabled&&!this._initialized&&(this._addDomEventHandlers(),this._initialized=!0)}onRemoteConfig(e){e.elementsChainAsString&&(this._elementsChainAsString=e.elementsChainAsString),this.instance.persistence&&this.instance.persistence.register({[c]:!!e.autocapture_opt_out}),this._isDisabledServerSide=!!e.autocapture_opt_out,this.startIfEnabled()}setElementSelectors(e){this._elementSelectors=e}getElementSelectors(e){var t,i=[];return null==(t=this._elementSelectors)||t.forEach((t=>{var s=null==me?void 0:me.querySelectorAll(t);null==s||s.forEach((s=>{e===s&&i.push(t)}))})),i}get isEnabled(){var e,t,i=null==(e=this.instance.persistence)?void 0:e.props[c];if(Ye(this._isDisabledServerSide)&&!Ze(i)&&!this.instance._shouldDisableFlags())return!1;var s=null!==(t=this._isDisabledServerSide)&&void 0!==t?t:!!i;return!!this.instance.config.autocapture&&!s}_captureEvent(e,t){if(void 0===t&&(t="$autocapture"),this.isEnabled){var i,s=Bs(e);As(s)&&(s=s.parentNode||null),"$autocapture"===t&&"click"===e.type&&e instanceof MouseEvent&&this.instance.config.rageclick&&null!=(i=this.rageclicks)&&i.isRageClick(e.clientX,e.clientY,e.timeStamp||(new Date).getTime())&&Qs(s,this.instance.config.rageclick)&&this._captureEvent(e,"$rageclick");var r=t===Wo;if(s&&function(e,t,i,s,r){var n,o,a,l;if(void 0===i&&(i=void 0),!pe||Zs(e))return!1;if(null!=(n=i)&&n.url_allowlist&&!Us(i.url_allowlist))return!1;if(null!=(o=i)&&o.url_ignorelist&&Us(i.url_ignorelist))return!1;if(null!=(a=i)&&a.dom_event_allowlist){var u=i.dom_event_allowlist;if(u&&!u.some((e=>t.type===e)))return!1}var{parentIsUsefulElement:c,targetElementList:d}=er(e,s);if(!function(e,t){var i=null==t?void 0:t.element_allowlist;if(We(i))return!0;var s,r=function(e){if(i.some((t=>e.tagName.toLowerCase()===t)))return{v:!0}};for(var n of e)if(s=r(n))return s.v;return!1}(d,i))return!1;if(!Vs(d,null==(l=i)?void 0:l.css_selector_allowlist))return!1;var _=pe.getComputedStyle(e);if(_&&"pointer"===_.getPropertyValue("cursor")&&"click"===t.type)return!0;var h=e.tagName.toLowerCase();switch(h){case"html":return!1;case"form":return(r||["submit"]).indexOf(t.type)>=0;case"input":case"select":case"textarea":return(r||["change","click"]).indexOf(t.type)>=0;default:return c?(r||["click"]).indexOf(t.type)>=0:(r||["click"]).indexOf(t.type)>=0&&(js.indexOf(h)>-1||"true"===e.getAttribute("contenteditable"))}}(s,e,this._config,r,r?["copy","cut"]:void 0)){var{props:n,explicitNoCapture:o}=Jo(s,{e:e,maskAllElementAttributes:this.instance.config.mask_all_element_attributes,maskAllText:this.instance.config.mask_all_text,elementAttributeIgnoreList:this._config.element_attribute_ignorelist,elementsChainAsString:this._elementsChainAsString});if(o)return!1;var a=this.getElementSelectors(s);if(a&&a.length>0&&(n.$element_selectors=a),t===Wo){var l,u=qs(null==pe||null==(l=pe.getSelection())?void 0:l.toString()),c=e.type||"clipboard";if(!u)return!1;n.$selected_content=u,n.$copy_type=c}return this.instance.capture(t,n),!0}}}isBrowserSupported(){return Be(null==me?void 0:me.querySelectorAll)}},historyAutocapture:class{constructor(e){var t;this._instance=e,this._lastPathname=(null==pe||null==(t=pe.location)?void 0:t.pathname)||""}initialize(){this.startIfEnabled()}get isEnabled(){return"history_change"===this._instance.config.capture_pageview}startIfEnabled(){this.isEnabled&&(Zi.info("History API monitoring enabled, starting..."),this.monitorHistoryChanges())}stop(){this._popstateListener&&this._popstateListener(),this._popstateListener=void 0,Zi.info("History API monitoring stopped")}monitorHistoryChanges(){var e,t;if(pe&&pe.history){var i=this;null!=(e=pe.history.pushState)&&e.__posthog_wrapped__||Qo(pe.history,"pushState",(e=>function(t,s,r){e.call(this,t,s,r),i._capturePageview("pushState")})),null!=(t=pe.history.replaceState)&&t.__posthog_wrapped__||Qo(pe.history,"replaceState",(e=>function(t,s,r){e.call(this,t,s,r),i._capturePageview("replaceState")})),this._setupPopstateListener()}}_capturePageview(e){try{var t,i=null==pe||null==(t=pe.location)?void 0:t.pathname;if(!i)return;i!==this._lastPathname&&this.isEnabled&&this._instance.capture(ce,{navigation_type:e}),this._lastPathname=i}catch(t){Zi.error("Error capturing "+e+" pageview",t)}}_setupPopstateListener(){if(!this._popstateListener){var e=()=>{this._capturePageview("popstate")};cs(pe,"popstate",e),this._popstateListener=()=>{pe&&pe.removeEventListener("popstate",e)}}}},heatmaps:class{get _config(){return this.instance.config}constructor(e){var t;this._enabledServerSide=!1,this._initialized=!1,this._flushInterval=null,this.instance=e,this._enabledServerSide=!(null==(t=this.instance.persistence)||!t.props[d]),this.rageclicks=new Vo(e.config.rageclick)}initialize(){this.startIfEnabled()}get flushIntervalMilliseconds(){var e=5e3;return je(this._config.capture_heatmaps)&&this._config.capture_heatmaps.flush_interval_milliseconds&&(e=this._config.capture_heatmaps.flush_interval_milliseconds),e}get isEnabled(){return Je(this._config.capture_heatmaps)?Je(this._config.enable_heatmaps)?this._enabledServerSide:this._config.enable_heatmaps:!1!==this._config.capture_heatmaps}startIfEnabled(){if(this.isEnabled){if(this._initialized)return;la.info("starting..."),this._setupListeners(),this._onVisibilityChange()}else{var e;clearInterval(null!==(e=this._flushInterval)&&void 0!==e?e:void 0),this._removeListeners(),this.getAndClearBuffer()}}onRemoteConfig(e){if("heatmaps"in e){var t=!!e.heatmaps;this.instance.persistence&&this.instance.persistence.register({[d]:t}),this._enabledServerSide=t,this.startIfEnabled()}}getAndClearBuffer(){var e=this._buffer;return this._buffer=void 0,e}_onDeadClick(e){this._onClick(e.originalEvent,"deadclick")}_onVisibilityChange(){this._flushInterval&&clearInterval(this._flushInterval),this._flushInterval="visible"===(null==me?void 0:me.visibilityState)?setInterval(this._flush.bind(this),this.flushIntervalMilliseconds):null}_setupListeners(){pe&&me&&(this._flushHandler=this._flush.bind(this),cs(pe,ue,this._flushHandler),this._onClickHandler=e=>this._onClick(e||(null==pe?void 0:pe.event)),cs(me,"click",this._onClickHandler,{capture:!0}),this._onMouseMoveHandler=e=>this._onMouseMove(e||(null==pe?void 0:pe.event)),cs(me,"mousemove",this._onMouseMoveHandler,{capture:!0}),this._deadClicksCapture=new fr(this.instance,gr,this._onDeadClick.bind(this)),this._deadClicksCapture.startIfEnabledOrStop(),this._onVisibilityChange_handler=this._onVisibilityChange.bind(this),cs(me,le,this._onVisibilityChange_handler),this._initialized=!0)}_removeListeners(){var e;pe&&me&&(this._flushHandler&&pe.removeEventListener(ue,this._flushHandler),this._onClickHandler&&me.removeEventListener("click",this._onClickHandler,{capture:!0}),this._onMouseMoveHandler&&me.removeEventListener("mousemove",this._onMouseMoveHandler,{capture:!0}),this._onVisibilityChange_handler&&me.removeEventListener(le,this._onVisibilityChange_handler),clearTimeout(this._mouseMoveTimeout),null==(e=this._deadClicksCapture)||e.stop(),this._initialized=!1)}_getProperties(e,t){var i=this.instance.scrollManager.scrollY(),s=this.instance.scrollManager.scrollX(),r=this.instance.scrollManager.scrollElement(),n=function(e,t,i){for(var s=e;s&&Os(s)&&!Ms(s,"body");){if(s===i)return!1;if(Ae(t,null==pe?void 0:pe.getComputedStyle(s).position))return!0;s=Ws(s)}return!1}(Bs(e),["fixed","sticky"],r);return{x:e.clientX+(n?0:s),y:e.clientY+(n?0:i),target_fixed:n,type:t}}_onClick(e,t){var s;if(void 0===t&&(t="click"),!$s(e.target)&&ua(e)){var r=this._getProperties(e,t);null!=(s=this.rageclicks)&&s.isRageClick(e.clientX,e.clientY,(new Date).getTime())&&Qs(Bs(e),this.instance.config.rageclick)&&this._capture(i({},r,{type:"rageclick"})),this._capture(r)}}_onMouseMove(e){!$s(e.target)&&ua(e)&&(clearTimeout(this._mouseMoveTimeout),this._mouseMoveTimeout=setTimeout((()=>{this._capture(this._getProperties(e,"mousemove"))}),500))}_capture(e){if(pe){var t=pe.location.href,i=this._config.custom_personal_data_properties,s=this._config.mask_personal_data_properties?[...Rr,...i||[]]:[],r=Pr(t,s,Lr);this._buffer=this._buffer||{},this._buffer[r]||(this._buffer[r]=[]),this._buffer[r].push(e)}}_flush(){this._buffer&&!Ve(this._buffer)&&this.instance.capture("$$heatmap",{$heatmap_data:this.getAndClearBuffer()})}},deadClicksAutocapture:fr,webVitalsAutocapture:class{constructor(e){var t;this._enabledServerSide=!1,this._initialized=!1,this._buffer={url:void 0,metrics:[],firstMetricTimestamp:void 0},this._flushToCapture=()=>{clearTimeout(this._delayedFlushTimer),0!==this._buffer.metrics.length&&(this._instance.capture("$web_vitals",this._buffer.metrics.reduce(((e,t)=>i({},e,{["$web_vitals_"+t.name+"_event"]:i({},t),["$web_vitals_"+t.name+"_value"]:t.value})),{})),this._buffer={url:void 0,metrics:[],firstMetricTimestamp:void 0})},this._addToBuffer=e=>{var t;this._buffer=this._buffer||{url:void 0,metrics:[],firstMetricTimestamp:void 0};var s=this._currentURL();if(!We(s))if(Je(null==e?void 0:e.name)||Je(null==e?void 0:e.value))ea.error("Invalid metric received",e);else if(!this._maxAllowedValue||this._maxAllowedValue>e.value){this._buffer.url!==s&&(this._flushToCapture(),this._delayedFlushTimer=setTimeout(this._flushToCapture,this.flushToCaptureTimeoutMs)),We(this._buffer.url)&&(this._buffer.url=s),this._buffer.firstMetricTimestamp=We(this._buffer.firstMetricTimestamp)?Date.now():this._buffer.firstMetricTimestamp,e.attribution&&e.attribution.interactionTargetElement&&(e.attribution.interactionTargetElement=void 0);var r=null==(t=this._instance.sessionManager)?void 0:t.checkAndGetSessionAndWindowId(!0),n=i({},e,{$current_url:s,timestamp:Date.now()});We(r)||(n.$session_id=r.sessionId,n.$window_id=r.windowId),this._buffer.metrics.push(n),this._buffer.metrics.length===this.allowedMetrics.length&&this._flushToCapture()}else ea.error("Ignoring metric with value >= "+this._maxAllowedValue,e)},this._startCapturing=()=>{if(!this._initialized){var e,t,i,s,r=ke.__PosthogExtensions__;We(r)||We(r.postHogWebVitalsCallbacks)||({onLCP:e,onCLS:t,onFCP:i,onINP:s}=r.postHogWebVitalsCallbacks),e&&t&&i&&s?(this.allowedMetrics.indexOf("LCP")>-1&&e(this._addToBuffer.bind(this)),this.allowedMetrics.indexOf("CLS")>-1&&t(this._addToBuffer.bind(this)),this.allowedMetrics.indexOf("FCP")>-1&&i(this._addToBuffer.bind(this)),this.allowedMetrics.indexOf("INP")>-1&&s(this._addToBuffer.bind(this)),this._initialized=!0):ea.error("web vitals callbacks not loaded - not starting")}},this._instance=e,this._enabledServerSide=!(null==(t=this._instance.persistence)||!t.props[g]),this.startIfEnabled()}get _perfConfig(){return this._instance.config.capture_performance}get allowedMetrics(){var e,t,i=je(this._perfConfig)?null==(e=this._perfConfig)?void 0:e.web_vitals_allowed_metrics:void 0;return Je(i)?(null==(t=this._instance.persistence)?void 0:t.props[m])||["CLS","FCP","INP","LCP"]:i}get flushToCaptureTimeoutMs(){return(je(this._perfConfig)?this._perfConfig.web_vitals_delayed_flush_ms:void 0)||5e3}get useAttribution(){var e=je(this._perfConfig)?this._perfConfig.web_vitals_attribution:void 0;return null!=e&&e}get _maxAllowedValue(){var e=je(this._perfConfig)&&Xe(this._perfConfig.__web_vitals_max_value)?this._perfConfig.__web_vitals_max_value:ta;return e>0&&6e4>=e?ta:e}get isEnabled(){var e=null==ye?void 0:ye.protocol;if("http:"!==e&&"https:"!==e)return ea.info("Web Vitals are disabled on non-http/https protocols"),!1;var t=je(this._perfConfig)?this._perfConfig.web_vitals:Ze(this._perfConfig)?this._perfConfig:void 0;return Ze(t)?t:this._enabledServerSide}startIfEnabled(){this.isEnabled&&!this._initialized&&(ea.info("enabled, starting..."),this._loadScript(this._startCapturing))}onRemoteConfig(e){if("capturePerformance"in e){var t=je(e.capturePerformance)&&!!e.capturePerformance.web_vitals,i=je(e.capturePerformance)?e.capturePerformance.web_vitals_allowed_metrics:void 0;this._instance.persistence&&(this._instance.persistence.register({[g]:t}),this._instance.persistence.register({[m]:i})),this._enabledServerSide=t,this.startIfEnabled()}}_loadScript(e){var t,i;null!=(t=ke.__PosthogExtensions__)&&t.postHogWebVitalsCallbacks?e():null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this._instance,this.useAttribution?"web-vitals-with-attribution":"web-vitals",(t=>{t?ea.error("failed to load script",t):e()}))}_currentURL(){var e=pe?pe.location.href:void 0;if(e){var t=this._instance.config.custom_personal_data_properties,i=this._instance.config.mask_personal_data_properties?[...Rr,...t||[]]:[];return Pr(e,i,Lr)}ea.error("Could not determine current URL")}}},Da={exceptionObserver:class{constructor(e){var t,i,s;this._startCapturing=()=>{var e;if(pe&&this.isEnabled&&null!=(e=ke.__PosthogExtensions__)&&e.errorWrappingFunctions){var t=ke.__PosthogExtensions__.errorWrappingFunctions.wrapOnError,i=ke.__PosthogExtensions__.errorWrappingFunctions.wrapUnhandledRejection,s=ke.__PosthogExtensions__.errorWrappingFunctions.wrapConsoleError;try{!this._unwrapOnError&&this._config.capture_unhandled_errors&&(this._unwrapOnError=t(this.captureException.bind(this))),!this._unwrapUnhandledRejection&&this._config.capture_unhandled_rejections&&(this._unwrapUnhandledRejection=i(this.captureException.bind(this))),!this._unwrapConsoleError&&this._config.capture_console_errors&&(this._unwrapConsoleError=s(this.captureException.bind(this)))}catch(e){Xo.error("failed to start",e),this._stopCapturing()}}},this._instance=e,this._remoteEnabled=!(null==(t=this._instance.persistence)||!t.props[_]),this._rateLimiter=new ut({refillRate:null!==(i=this._instance.config.error_tracking.__exceptionRateLimiterRefillRate)&&void 0!==i?i:1,bucketSize:null!==(s=this._instance.config.error_tracking.__exceptionRateLimiterBucketSize)&&void 0!==s?s:10,refillInterval:1e4,_logger:Xo}),this._config=this._requiredConfig(),this.startIfEnabledOrStop()}_requiredConfig(){var e=this._instance.config.capture_exceptions,t={capture_unhandled_errors:!1,capture_unhandled_rejections:!1,capture_console_errors:!1};return je(e)?t=i({},t,e):(We(e)?this._remoteEnabled:e)&&(t=i({},t,{capture_unhandled_errors:!0,capture_unhandled_rejections:!0})),t}get isEnabled(){return this._config.capture_console_errors||this._config.capture_unhandled_errors||this._config.capture_unhandled_rejections}startIfEnabledOrStop(){this.isEnabled?(Xo.info("enabled"),this._stopCapturing(),this._loadScript(this._startCapturing)):this._stopCapturing()}_loadScript(e){var t,i;null!=(t=ke.__PosthogExtensions__)&&t.errorWrappingFunctions&&e(),null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this._instance,"exception-autocapture",(t=>{if(t)return Xo.error("failed to load script",t);e()}))}_stopCapturing(){var e,t,i;null==(e=this._unwrapOnError)||e.call(this),this._unwrapOnError=void 0,null==(t=this._unwrapUnhandledRejection)||t.call(this),this._unwrapUnhandledRejection=void 0,null==(i=this._unwrapConsoleError)||i.call(this),this._unwrapConsoleError=void 0}onRemoteConfig(e){"autocaptureExceptions"in e&&(this._remoteEnabled=!!e.autocaptureExceptions||!1,this._instance.persistence&&this._instance.persistence.register({[_]:this._remoteEnabled}),this._config=this._requiredConfig(),this.startIfEnabledOrStop())}onConfigChange(){this._config=this._requiredConfig()}captureException(e){var t,i,s,r=null!==(t=null==e||null==(i=e.$exception_list)||null==(i=i[0])?void 0:i.type)&&void 0!==t?t:"Exception";this._rateLimiter.consumeRateLimit(r)?Xo.info("Skipping exception capture because of client rate limiting.",{exception:r}):null==(s=this._instance.exceptions)||s.sendExceptionEvent(e)}},exceptions:class{constructor(e){var t,s;this._suppressionRules=[],this._errorPropertiesBuilder=new Ei([new Oi,new ji,new Ai,new Mi,new zi,new qi,new Ni,new Bi],function(e){for(var t=arguments.length,s=new Array(t>1?t-1:0),r=1;t>r;r++)s[r-1]=arguments[r];return function(t,r){void 0===r&&(r=0);for(var n=[],o=t.split("\n"),a=r;o.length>a;a++){var l=o[a];if(1024>=l.length){var u=$i.test(l)?l.replace($i,"$1"):l;if(!u.match(/\S*Error: /)){for(var c of s){var d=c(u,e);if(d){n.push(d);break}}if(n.length>=50)break}}}return function(e){if(!e.length)return[];var t=Array.from(e);return t.reverse(),t.slice(0,50).map((e=>{return i({},e,{filename:e.filename||(s=t,s[s.length-1]||{}).filename,function:e.function||Si});// removed by dead control flow
 var s; }))}(n)}}("web:javascript",Ci,Li)),this._instance=e,this._suppressionRules=null!==(t=null==(s=this._instance.persistence)?void 0:s.get_property(h))&&void 0!==t?t:[],this._exceptionStepsConfig=Yi(this._getExceptionStepsConfig()),this._exceptionStepsBuffer=new Ji(this._exceptionStepsConfig)}onConfigChange(){this._exceptionStepsConfig=Yi(this._getExceptionStepsConfig()),this._exceptionStepsBuffer.setConfig(this._exceptionStepsConfig)}onRemoteConfig(e){var t,i,s;if("errorTracking"in e){var r=null!==(t=null==(i=e.errorTracking)?void 0:i.suppressionRules)&&void 0!==t?t:[],n=null==(s=e.errorTracking)?void 0:s.captureExtensionExceptions;this._suppressionRules=r,this._instance.persistence&&this._instance.persistence.register({[h]:this._suppressionRules,[p]:n})}}get _captureExtensionExceptions(){var e,t=!!this._instance.get_property(p),i=this._instance.config.error_tracking.captureExtensionExceptions;return null!==(e=null!=i?i:t)&&void 0!==e&&e}buildProperties(e,t){return this._errorPropertiesBuilder.buildFromUnknown(e,{syntheticException:null==t?void 0:t.syntheticException,mechanism:{handled:null==t?void 0:t.handled}})}addExceptionStep(e,t){if(this._exceptionStepsConfig.enabled)try{if(!Ge(e)||0===e.trim().length)return void Ia.warn("Ignoring exception step because message must be a non-empty string");var s=this._coerceExceptionStepProperties(t),{sanitizedProperties:r,droppedKeys:n}=function(e){if(!e)return{sanitizedProperties:{},droppedKeys:[]};var t=[];return{sanitizedProperties:Object.keys(e).reduce(((i,s)=>Gi.has(s)?(t.push(s),i):(i[s]=e[s],i)),{}),droppedKeys:t}}(s);n.length>0&&Ia.warn("Ignoring reserved exception step fields",{droppedKeys:n}),this._exceptionStepsBuffer.add(i({[Vi]:e,[Wi]:(new Date).toISOString()},r))}catch(e){Ia.error("Failed to add exception step. Ignoring breadcrumb.",e)}}sendExceptionEvent(e){try{var t=e.$exception_list;if(this._isExceptionList(t)){if(this._matchesSuppressionRule(t))return this._addDroppedExceptionStep("Exception dropped: matched a suppression rule"),void Ia.info("Skipping exception capture because a suppression rule matched");if(!this._captureExtensionExceptions&&this._isExtensionException(t))return this._addDroppedExceptionStep("Exception dropped: thrown by a browser extension"),void Ia.info("Skipping exception capture because it was thrown by an extension");if(!this._instance.config.error_tracking.__capturePostHogExceptions&&this._isPostHogException(t))return this._addDroppedExceptionStep("Exception dropped: thrown by the PostHog SDK"),void Ia.info("Skipping exception capture because it was thrown by the PostHog SDK")}var i=this._exceptionStepsConfig.enabled&&Je(e.$exception_steps)?this._addBufferedExceptionSteps(e):e;try{var s=this._instance.capture("$exception",i,{_noTruncate:!0,_batchKey:"exceptionEvent",_originatedFromCaptureException:!0});return s&&this._exceptionStepsBuffer.clear(),s}catch(e){return Ia.error("Failed to capture exception event. Dropping this exception.",e),void this._exceptionStepsBuffer.clear()}}catch(e){return void Ia.error("Failed to process exception event. Ignoring this exception.",e)}}_addBufferedExceptionSteps(e){try{var t=this._exceptionStepsBuffer.getAttachable();return 0===t.length?e:i({},e,{$exception_steps:t})}catch(t){return Ia.error("Failed to read buffered exception steps. Capturing exception without steps.",t),e}}_addDroppedExceptionStep(e){this._exceptionStepsConfig.enabled&&this._exceptionStepsBuffer.add({[Vi]:e,[Wi]:(new Date).toISOString()})}_coerceExceptionStepProperties(e){return je(e)?i({},e):{}}_getExceptionStepsConfig(){var e,t;return null!==(e=null==(t=this._instance.config.error_tracking)?void 0:t.exception_steps)&&void 0!==e?e:{}}_matchesSuppressionRule(e){if(0===e.length)return!1;var t=e.reduce(((e,t)=>{var{type:i,value:s}=t;return Ge(i)&&i.length>0&&e.$exception_types.push(i),Ge(s)&&s.length>0&&e.$exception_values.push(s),e}),{$exception_types:[],$exception_values:[]});return this._suppressionRules.some((e=>{var i=e.values.map((e=>{var i,s=vo[e.operator],r=ze(e.value)?e.value:[e.value],n=null!==(i=t[e.key])&&void 0!==i?i:[];return r.length>0&&s(r,n)}));return"OR"===e.type?i.some(Boolean):i.every(Boolean)}))}_isExtensionException(e){return e.flatMap((e=>{var t,i;return null!==(t=null==(i=e.stacktrace)?void 0:i.frames)&&void 0!==t?t:[]})).some((e=>e.filename&&e.filename.startsWith("chrome-extension://")))}_isPostHogException(e){if(e.length>0){var t,i,s,r,n=null!==(t=null==(i=e[0].stacktrace)?void 0:i.frames)&&void 0!==t?t:[],o=n[n.length-1];return null!==(s=null==o||null==(r=o.filename)?void 0:r.includes("posthog.com/static"))&&void 0!==s&&s}return!1}_isExceptionList(e){return!Je(e)&&ze(e)}}},Na=i({productTours:class{get _persistence(){return this._instance.persistence}constructor(e){this._productTourManager=null,this._cachedTours=null,this._instance=e}initialize(){this.loadIfEnabled()}onRemoteConfig(e){"productTours"in e&&(this._persistence&&this._persistence.register({[f]:!!e.productTours}),this.loadIfEnabled())}loadIfEnabled(){var e,t;this._productTourManager||(e=this._instance).config.disable_product_tours||null==(t=e.persistence)||!t.get_property(f)||this._loadScript((()=>this._startProductTours()))}_loadScript(e){var t,i;null!=(t=ke.__PosthogExtensions__)&&t.generateProductTours?e():null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this._instance,"product-tours",(t=>{t?ca.error("Could not load product tours script",t):e()}))}_startProductTours(){var e;!this._productTourManager&&null!=(e=ke.__PosthogExtensions__)&&e.generateProductTours&&(this._productTourManager=ke.__PosthogExtensions__.generateProductTours(this._instance,!0))}getProductTours(e,t){if(void 0===t&&(t=!1),!ze(this._cachedTours)||t){var i=this._persistence;if(i){var s=i.props[U];if(ze(s)&&!t)return this._cachedTours=s,void e(s,{isLoaded:!0})}this._instance._send_request({url:this._instance.requestRouter.endpointFor("api","/api/product_tours/?token="+this._instance.config.token),method:"GET",callback:t=>{var s=t.statusCode;if(200!==s||!t.json){var r="Product Tours API could not be loaded, status: "+s;return ca.error(r),void e([],{isLoaded:!1,error:r})}var n=ze(t.json.product_tours)?t.json.product_tours:[];this._cachedTours=n,i&&i.register({[U]:n}),e(n,{isLoaded:!0})}})}else e(this._cachedTours,{isLoaded:!0})}getActiveProductTours(e){Je(this._productTourManager)?e([],{isLoaded:!1,error:"Product tours not loaded"}):this._productTourManager.getActiveProductTours(e)}showProductTour(e){var t;null==(t=this._productTourManager)||t.showTourById(e)}previewTour(e){this._productTourManager?this._productTourManager.previewTour(e):this._loadScript((()=>{var t;this._startProductTours(),null==(t=this._productTourManager)||t.previewTour(e)}))}dismissProductTour(){var e;null==(e=this._productTourManager)||e.dismissTour("user_clicked_skip")}nextStep(){var e;null==(e=this._productTourManager)||e.nextStep()}previousStep(){var e;null==(e=this._productTourManager)||e.previousStep()}clearCache(){var e;this._cachedTours=null,null==(e=this._persistence)||e.unregister(U)}resetTour(e){var t;null==(t=this._productTourManager)||t.resetTour(e)}resetAllTours(){var e;null==(e=this._productTourManager)||e.resetAllTours()}cancelPendingTour(e){var t;null==(t=this._productTourManager)||t.cancelPendingTour(e)}}},Oa),Ua={siteApps:class{constructor(e){this._instance=e,this._bufferedInvocations=[],this.apps={}}get isEnabled(){return!!this._instance.config.opt_in_site_apps}_eventCollector(e,t){if(t){var i=this.globalsForEvent(t);this._bufferedInvocations.push(i),this._bufferedInvocations.length>1e3&&(this._bufferedInvocations=this._bufferedInvocations.slice(10))}}get siteAppLoaders(){var e;return null==(e=ke._POSTHOG_REMOTE_CONFIG)||null==(e=e[this._instance.config.token])?void 0:e.siteApps}initialize(){if(this.isEnabled){var e=this._instance._addCaptureHook(this._eventCollector.bind(this));this._stopBuffering=()=>{e(),this._bufferedInvocations=[],this._stopBuffering=void 0}}}globalsForEvent(e){var t,r,n,o,a,l,u;if(!e)throw new Error("Event payload is required");var c={},d=this._instance.get_property("$groups")||[],_=this._instance.get_property("$stored_group_properties")||{};for(var[h,p]of Object.entries(_))c[h]={id:d[h],type:h,properties:p};var{$set_once:g,$set:v}=e;return{event:i({},s(e,da),{properties:i({},e.properties,v?{$set:i({},null!==(t=null==(r=e.properties)?void 0:r.$set)&&void 0!==t?t:{},v)}:{},g?{$set_once:i({},null!==(n=null==(o=e.properties)?void 0:o.$set_once)&&void 0!==n?n:{},g)}:{}),elements_chain:null!==(a=null==(l=e.properties)?void 0:l.$elements_chain)&&void 0!==a?a:"",distinct_id:null==(u=e.properties)?void 0:u.distinct_id}),person:{properties:this._instance.get_property("$stored_person_properties")},groups:c}}setupSiteApp(e){var t=this.apps[e.id],i=()=>{var i;!t.errored&&this._bufferedInvocations.length&&(_a.info("Processing "+this._bufferedInvocations.length+" events for site app with id "+e.id),this._bufferedInvocations.forEach((e=>null==t.processEvent?void 0:t.processEvent(e))),t.processedBuffer=!0),Object.values(this.apps).every((e=>e.processedBuffer||e.errored))&&(null==(i=this._stopBuffering)||i.call(this))},s=!1,r=r=>{t.errored=!r,t.loaded=!0,_a.info("Site app with id "+e.id+" "+(r?"loaded":"errored")),s&&i()};try{var{processEvent:n}=e.init({posthog:this._instance,callback(e){r(e)}});n&&(t.processEvent=n),s=!0}catch(t){_a.error(ha+e.id,t),r(!1)}if(s&&t.loaded)try{i()}catch(i){_a.error("Error while processing buffered events PostHog app with config id "+e.id,i),t.errored=!0}}_setupSiteApps(){var e=this.siteAppLoaders||[];for(var t of e)this.apps[t.id]={id:t.id,loaded:!1,errored:!1,processedBuffer:!1};for(var i of e)this.setupSiteApp(i)}_onCapturedEvent(e){if(0!==Object.keys(this.apps).length){var t=this.globalsForEvent(e);for(var i of Object.values(this.apps))try{null==i.processEvent||i.processEvent(t)}catch(t){_a.error("Error while processing event "+e.event+" for site app "+i.id,t)}}}onRemoteConfig(e){var t,i,s,r=this;if(null!=(t=this.siteAppLoaders)&&t.length)return this.isEnabled?(this._setupSiteApps(),void this._instance.on("eventCaptured",(e=>this._onCapturedEvent(e)))):void _a.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.');if(null==(i=this._stopBuffering)||i.call(this),null!=(s=e.siteApps)&&s.length)if(this.isEnabled){var n=function(e){var t;ke["__$$ph_site_app_"+e]=r._instance,null==(t=ke.__PosthogExtensions__)||null==t.loadSiteApp||t.loadSiteApp(r._instance,a,(t=>{if(t)return _a.error(ha+e,t)}))};for(var{id:o,url:a}of e.siteApps)n(o)}else _a.error('PostHog site apps are disabled. Enable the "opt_in_site_apps" config to proceed.')}}},Ha={tracingHeaders:class{constructor(e){this._restoreXHRPatch=void 0,this._restoreFetchPatch=void 0,this._hostnamesForPatch=void 0,this._startCapturing=()=>{var e,t,i=this._syncHostnamesForPatch();i?(We(this._restoreXHRPatch)&&(this._restoreXHRPatch=null==(e=ke.__PosthogExtensions__)||null==(e=e.tracingHeadersPatchFns)?void 0:e._patchXHR(i,(()=>this._instance.get_distinct_id()),this._instance.sessionManager)),We(this._restoreFetchPatch)&&(this._restoreFetchPatch=null==(t=ke.__PosthogExtensions__)||null==(t=t.tracingHeadersPatchFns)?void 0:t._patchFetch(i,(()=>this._instance.get_distinct_id()),this._instance.sessionManager))):this._stopCapturing()},this._instance=e}initialize(){this.startIfEnabledOrStop()}_loadScript(e){var t,i;null!=(t=ke.__PosthogExtensions__)&&t.tracingHeadersPatchFns?e():null==(i=ke.__PosthogExtensions__)||null==i.loadExternalDependency||i.loadExternalDependency(this._instance,"tracing-headers",(t=>{if(t)return Zo.error("failed to load script",t);e()}))}_getConfiguredHostnames(){var e,t;return null!==(e=null!==(t=this._instance.config.tracing_headers)&&void 0!==t?t:this._instance.config.addTracingHeaders)&&void 0!==e?e:this._instance.config.__add_tracing_headers}_syncHostnamesForPatch(){var e=this._getConfiguredHostnames();return ze(e)?(ze(this._hostnamesForPatch)?this._hostnamesForPatch.splice(0,this._hostnamesForPatch.length,...e):this._hostnamesForPatch=[...e],e.length>0?this._hostnamesForPatch:void 0):(ze(this._hostnamesForPatch)&&this._hostnamesForPatch.splice(0),this._hostnamesForPatch=e||void 0,this._hostnamesForPatch)}_stopCapturing(){var e,t;null==(e=this._restoreXHRPatch)||e.call(this),null==(t=this._restoreFetchPatch)||t.call(this),this._restoreXHRPatch=void 0,this._restoreFetchPatch=void 0}startIfEnabledOrStop(){this._syncHostnamesForPatch()?this._loadScript(this._startCapturing):this._stopCapturing()}}},qa=i({surveys:class{get _config(){return this._instance.config}constructor(e){this._isSurveysEnabled=void 0,this._surveyManager=null,this._isInitializingSurveys=!1,this._surveyCallbacks=[],this._getSurveysInFlightPromise=null,this._instance=e,this._surveyEventReceiver=null}initialize(){this.loadIfEnabled()}onRemoteConfig(e){if(!this._config.disable_surveys){var t=e.surveys;if(Je(t))return So.warn("Flags not loaded yet. Not loading surveys.");var i=ze(t);this._isSurveysEnabled=i?t.length>0:t,So.info("flags response received, isSurveysEnabled: "+this._isSurveysEnabled),this.loadIfEnabled()}}reset(){localStorage.removeItem("lastSeenSurveyDate");for(var e=[],t=0;t<localStorage.length;t++){var i=localStorage.key(t);(null!=i&&i.startsWith(xo)||null!=i&&i.startsWith("inProgressSurvey_"))&&e.push(i)}e.forEach((e=>localStorage.removeItem(e)))}loadIfEnabled(){if(!this._surveyManager)if(this._isInitializingSurveys)So.info("Already initializing surveys, skipping...");else if(this._config.disable_surveys)So.info(ya);else if(this._config.cookieless_mode&&this._instance.consent.isOptedOut())So.info("Not loading surveys in cookieless mode without consent.");else{var e=null==ke?void 0:ke.__PosthogExtensions__;if(e){if(!We(this._isSurveysEnabled)||this._config.advanced_enable_surveys){var t=this._isSurveysEnabled||this._config.advanced_enable_surveys;this._isInitializingSurveys=!0;try{var i=e.generateSurveys;if(i)return void this._completeSurveyInitialization(i,t);var s=e.loadExternalDependency;if(!s)return void this._handleSurveyLoadError(ie);s(this._instance,"surveys",(i=>{i||!e.generateSurveys?this._handleSurveyLoadError("Could not load surveys script",i):this._completeSurveyInitialization(e.generateSurveys,t)}))}catch(e){throw this._handleSurveyLoadError("Error initializing surveys",e),e}finally{this._isInitializingSurveys=!1}}}else So.error("PostHog Extensions not found.")}}_completeSurveyInitialization(e,t){this._surveyManager=e(this._instance,t),this._surveyEventReceiver=new fa(this._instance),So.info("Surveys loaded successfully"),this._notifySurveyCallbacks({isLoaded:!0})}_handleSurveyLoadError(e,t){So.error(e,t),this._notifySurveyCallbacks({isLoaded:!1,error:e})}onSurveysLoaded(e){return this._surveyCallbacks.push(e),this._surveyManager&&this._notifySurveyCallbacks({isLoaded:!0}),()=>{this._surveyCallbacks=this._surveyCallbacks.filter((t=>t!==e))}}getSurveys(e,t){if(void 0===t&&(t=!1),this._config.disable_surveys)return So.info(ya),e([]);var i,s=this._instance.get_property(D);if(s&&!t)return e(s,{isLoaded:!0});"undefined"!=typeof Promise&&this._getSurveysInFlightPromise?this._getSurveysInFlightPromise.then((t=>{var{surveys:i,context:s}=t;return e(i,s)})):("undefined"!=typeof Promise&&(this._getSurveysInFlightPromise=new Promise((e=>{i=e}))),this._instance._send_request({url:this._instance.requestRouter.endpointFor("api","/api/surveys/?token="+this._config.token),method:"GET",timeout:this._config.surveys_request_timeout_ms,callback:t=>{var s;this._getSurveysInFlightPromise=null;var r=t.statusCode;if(200!==r||!t.json){var n="Surveys API could not be loaded, status: "+r;So.error(n);var o={isLoaded:!1,error:n};return e([],o),void(null==i||i({surveys:[],context:o}))}var a,l=t.json.surveys||[],u=l.filter((e=>function(e){return!(!e.start_date||e.end_date)}(e)&&(function(e){var t;return!(null==(t=e.conditions)||null==(t=t.events)||null==(t=t.values)||!t.length)}(e)||function(e){var t;return!(null==(t=e.conditions)||null==(t=t.actions)||null==(t=t.values)||!t.length)}(e))));u.length>0&&(null==(a=this._surveyEventReceiver)||a.register(u)),null==(s=this._instance.persistence)||s.register({[D]:l});var c={isLoaded:!0};e(l,c),null==i||i({surveys:l,context:c})}}))}_notifySurveyCallbacks(e){for(var t of this._surveyCallbacks)try{if(!e.isLoaded)return t([],e);this.getSurveys(t)}catch(e){So.error("Error in survey callback",e)}}getActiveMatchingSurveys(e,t){if(void 0===t&&(t=!1),!Je(this._surveyManager))return this._surveyManager.getActiveMatchingSurveys(e,t);So.warn("init was not called")}_getSurveyById(e){var t=null;return this.getSurveys((i=>{var s;t=null!==(s=i.find((t=>t.id===e)))&&void 0!==s?s:null})),t}_checkSurveyEligibility(e){if(Je(this._surveyManager))return{eligible:!1,reason:ma};var t="string"==typeof e?this._getSurveyById(e):e;return t?this._surveyManager.checkSurveyEligibility(t):{eligible:!1,reason:"Survey not found"}}canRenderSurvey(e){if(Je(this._surveyManager))return So.warn("init was not called"),{visible:!1,disabledReason:ma};var t=this._checkSurveyEligibility(e);return{visible:t.eligible,disabledReason:t.reason}}canRenderSurveyAsync(e,t){return Je(this._surveyManager)?(So.warn("init was not called"),Promise.resolve({visible:!1,disabledReason:ma})):new Promise((i=>{this.getSurveys((t=>{var s,r=null!==(s=t.find((t=>t.id===e)))&&void 0!==s?s:null;if(r){var n=this._checkSurveyEligibility(r);i({visible:n.eligible,disabledReason:n.reason})}else i({visible:!1,disabledReason:"Survey not found"})}),t)}))}renderSurvey(e,t,i){var s;if(Je(this._surveyManager))So.warn("init was not called");else{var r="string"==typeof e?this._getSurveyById(e):e;if(null!=r&&r.id)if(ko.includes(r.type)){var n=null==me?void 0:me.querySelector(t);if(n)return null!=(s=r.appearance)&&s.surveyPopupDelaySeconds?(So.info("Rendering survey "+r.id+" with delay of "+r.appearance.surveyPopupDelaySeconds+" seconds"),void setTimeout((()=>{var e,t;So.info("Rendering survey "+r.id+" with delay of "+(null==(e=r.appearance)?void 0:e.surveyPopupDelaySeconds)+" seconds"),null==(t=this._surveyManager)||t.renderSurvey(r,n,i),So.info("Survey "+r.id+" rendered")}),1e3*r.appearance.surveyPopupDelaySeconds)):void this._surveyManager.renderSurvey(r,n,i);So.warn("Survey element not found")}else So.warn("Surveys of type "+r.type+" cannot be rendered in the app");else So.warn("Survey not found")}}displaySurvey(e,t){var s;if(Je(this._surveyManager))So.warn("init was not called");else{var r=this._getSurveyById(e);if(r){var n=r;if(null!=(s=r.appearance)&&s.surveyPopupDelaySeconds&&t.ignoreDelay&&(n=i({},r,{appearance:i({},r.appearance,{surveyPopupDelaySeconds:0})})),t.displayType!==sn.Popover&&t.initialResponses&&So.warn("initialResponses is only supported for popover surveys. prefill will not be applied."),!1===t.ignoreConditions){var o=this.canRenderSurvey(r);if(!o.visible)return void So.warn("Survey is not eligible to be displayed: ",o.disabledReason)}t.displayType!==sn.Inline?this._surveyManager.handlePopoverSurvey(n,t):this.renderSurvey(n,t.selector,t.properties)}else So.warn("Survey not found")}}cancelPendingSurvey(e){Je(this._surveyManager)?So.warn("init was not called"):this._surveyManager.cancelSurvey(e)}handlePageUnload(){var e;null==(e=this._surveyManager)||e.handlePageUnload()}}},Oa),za={toolbar:class{constructor(e){this.instance=e}_setToolbarState(e){ke.ph_toolbar_state=e}_getToolbarState(){var e;return null!==(e=ke.ph_toolbar_state)&&void 0!==e?e:0}initialize(){return this.maybeLoadToolbar()}maybeLoadToolbar(e,t,i){if(void 0===e&&(e=void 0),void 0===t&&(t=void 0),void 0===i&&(i=void 0),ds(this.instance.config))return!1;if(!pe||!me)return!1;e=null!=e?e:pe.location,i=null!=i?i:pe.history;try{if(!t){try{pe.localStorage.setItem("test","test"),pe.localStorage.removeItem("test")}catch(e){return!1}t=null==pe?void 0:pe.localStorage}var s,r=ba||Ir(e.hash,"__posthog")||Ir(e.hash,"state"),n=r?ns((()=>JSON.parse(atob(decodeURIComponent(r)))))||ns((()=>JSON.parse(decodeURIComponent(r)))):null;return n&&"ph_authorize"===n.action?((s=n).source="url",s&&Object.keys(s).length>0&&(n.desiredHash?e.hash=n.desiredHash:i?i.replaceState(i.state,"",e.pathname+e.search):e.hash="")):((s=JSON.parse(t.getItem(wa)||"{}")).source="localstorage",delete s.userIntent),!(!s.token||this.instance.config.token!==s.token||(this.loadToolbar(s),0))}catch(e){return!1}}_callLoadToolbar(e){var t=ke.ph_load_toolbar||ke.ph_load_editor;!Je(t)&&Be(t)?t(e,this.instance):Ea.warn("No toolbar load function found")}loadToolbar(e){var t=!(null==me||!me.getElementById(X));if(!pe||t)return!1;var s="custom"===this.instance.requestRouter.region&&this.instance.config.advanced_disable_toolbar_metrics,r=i({token:this.instance.config.token},e,{apiURL:this.instance.requestRouter.endpointFor("ui")},s?{instrument:!1}:{});if(pe.localStorage.setItem(wa,JSON.stringify(i({},r,{source:void 0}))),2===this._getToolbarState())this._callLoadToolbar(r);else if(0===this._getToolbarState()){var n;this._setToolbarState(1),null==(n=ke.__PosthogExtensions__)||null==n.loadExternalDependency||n.loadExternalDependency(this.instance,"toolbar",(e=>{if(e)return Ea.error("[Toolbar] Failed to load",e),void this._setToolbarState(0);this._setToolbarState(2),this._callLoadToolbar(r)})),cs(pe,"turbolinks:load",(()=>{this._setToolbarState(0),this.loadToolbar(r)}))}return!0}_loadEditor(e){return this.loadToolbar(e)}maybeLoadEditor(e,t,i){return void 0===e&&(e=void 0),void 0===t&&(t=void 0),void 0===i&&(i=void 0),this.maybeLoadToolbar(e,t,i)}}},Ba=i({experiments:Fa},Oa),ja={conversations:class{constructor(e){this._isConversationsEnabled=void 0,this._conversationsManager=null,this._isInitializing=!1,this._remoteConfig=null,this._instance=e}initialize(){this.loadIfEnabled()}onRemoteConfig(e){if(!this._instance.config.disable_conversations){var t=e.conversations;Je(t)||(Ze(t)?this._isConversationsEnabled=t:(this._isConversationsEnabled=t.enabled,this._remoteConfig=t),this.loadIfEnabled())}}reset(){var e;null==(e=this._conversationsManager)||e.reset(),this._conversationsManager=null,this._isConversationsEnabled=void 0,this._remoteConfig=null}loadIfEnabled(){if(!(this._conversationsManager||this._isInitializing||this._instance.config.disable_conversations||ds(this._instance.config)||this._instance.config.cookieless_mode&&this._instance.consent.isOptedOut())){var e=null==ke?void 0:ke.__PosthogExtensions__;if(e&&!We(this._isConversationsEnabled)&&this._isConversationsEnabled)if(this._remoteConfig&&this._remoteConfig.token){this._isInitializing=!0;try{var t=e.initConversations;if(t)return this._completeInitialization(t),void(this._isInitializing=!1);var i=e.loadExternalDependency;if(!i)return void this._handleLoadError(ie);i(this._instance,"conversations",(t=>{t||!e.initConversations?this._handleLoadError("Could not load conversations script",t):this._completeInitialization(e.initConversations),this._isInitializing=!1}))}catch(e){this._handleLoadError("Error initializing conversations",e),this._isInitializing=!1}}else La.error("Conversations enabled but missing token in remote config.")}}_completeInitialization(e){if(this._remoteConfig)try{this._conversationsManager=e(this._remoteConfig,this._instance),La.info("Conversations loaded successfully")}catch(e){this._handleLoadError("Error completing conversations initialization",e)}else La.error("Cannot complete initialization: remote config is null")}_handleLoadError(e,t){La.error(e,t),this._conversationsManager=null,this._isInitializing=!1}show(){this._conversationsManager?this._conversationsManager.show():La.warn("Conversations not loaded yet.")}hide(){this._conversationsManager&&this._conversationsManager.hide()}isAvailable(){return!0===this._isConversationsEnabled&&!Ye(this._conversationsManager)}isVisible(){var e,t;return null!==(e=null==(t=this._conversationsManager)?void 0:t.isVisible())&&void 0!==e&&e}sendMessage(e,i,s){var r=this;return t((function*(){return r._conversationsManager?r._conversationsManager.sendMessage(e,i,s):(La.warn($a),null)}))()}getMessages(e,i){var s=this;return t((function*(){return s._conversationsManager?s._conversationsManager.getMessages(e,i):(La.warn($a),null)}))()}markAsRead(e){var i=this;return t((function*(){return i._conversationsManager?i._conversationsManager.markAsRead(e):(La.warn($a),null)}))()}getTickets(e){var i=this;return t((function*(){return i._conversationsManager?i._conversationsManager.getTickets(e):(La.warn($a),null)}))()}requestRestoreLink(e){var i=this;return t((function*(){return i._conversationsManager?i._conversationsManager.requestRestoreLink(e):(La.warn($a),null)}))()}restoreFromToken(e){var i=this;return t((function*(){return i._conversationsManager?i._conversationsManager.restoreFromToken(e):(La.warn($a),null)}))()}restoreFromUrlToken(){var e=this;return t((function*(){return e._conversationsManager?e._conversationsManager.restoreFromUrlToken():(La.warn($a),null)}))()}getCurrentTicketId(){var e,t;return null!==(e=null==(t=this._conversationsManager)?void 0:t.getCurrentTicketId())&&void 0!==e?e:null}getWidgetSessionId(){var e,t;return null!==(e=null==(t=this._conversationsManager)?void 0:t.getWidgetSessionId())&&void 0!==e?e:null}_onIdentityChanged(){var e;null==(e=this._conversationsManager)||e.setIdentity()}_onIdentityCleared(){var e;null==(e=this._conversationsManager)||e.clearIdentity()}}},Va={logs:class{constructor(e){var t;this._isLogsEnabled=!1,this._isLoaded=!1,this._logger=es("[logs]"),this._logBuffer=[],this._intervalLogCount=0,this._intervalWindowStart=0,this._droppedWarned=!1,this._instance=e,this._instance&&null!=(t=this._instance.config.logs)&&t.captureConsoleLogs&&(this._isLogsEnabled=!0)}initialize(){this.loadIfEnabled()}onRemoteConfig(e){var t,i=null==(t=e.logs)?void 0:t.captureConsoleLogs;!Je(i)&&i&&(this._isLogsEnabled=!0,this.loadIfEnabled())}reset(){this._logBuffer=[],this._flushTimeout&&(clearTimeout(this._flushTimeout),this._flushTimeout=void 0),this._intervalLogCount=0,this._intervalWindowStart=0,this._droppedWarned=!1}loadIfEnabled(){if(this._isLogsEnabled&&!this._isLoaded){var e=null==ke?void 0:ke.__PosthogExtensions__;if(e){var t=e.loadExternalDependency;t?t(this._instance,"logs",(t=>{var i;t||null==(i=e.logs)||!i.initializeLogs?this._logger.error("Could not load logs script",t):(e.logs.initializeLogs(this._instance),this._isLoaded=!0)})):this._logger.error(ie)}else this._logger.error("PostHog Extensions not found.")}}captureLog(e){var t,s,r,n,o,a;if(this._instance.is_capturing())if(e&&e.body){var l=null!==(t=null==(s=this._instance.config.logs)?void 0:s.flushIntervalMs)&&void 0!==t?t:3e3,u=null!==(r=null==(n=this._instance.config.logs)?void 0:n.maxLogsPerInterval)&&void 0!==r?r:1e3,c=Date.now();if(l>c-this._intervalWindowStart||(this._intervalWindowStart=c,this._intervalLogCount=0,this._droppedWarned=!1),u>this._intervalLogCount){this._intervalLogCount++;var d=function(e,t){var s=e.level||"info",{text:r,number:n}=fi[s]||mi,o=String(Date.now())+"000000",a={};t.distinctId&&(a.posthogDistinctId=t.distinctId),t.sessionId&&(a.sessionId=t.sessionId),t.currentUrl&&(a["url.full"]=t.currentUrl),t.screenName&&(a["screen.name"]=t.screenName),t.appState&&(a["app.state"]=t.appState),t.activeFeatureFlags&&t.activeFeatureFlags.length>0&&(a.feature_flags=t.activeFeatureFlags);var l=i({},a,e.attributes||{}),u={timeUnixNano:o,observedTimeUnixNano:o,severityNumber:n,severityText:r,body:{stringValue:e.body},attributes:bi(l)};return e.trace_id&&(u.traceId=e.trace_id),e.span_id&&(u.spanId=e.span_id),We(e.trace_flags)||(u.flags=e.trace_flags),u}(e,this._getSdkContext());this._logBuffer.push({record:d}),(null!==(o=null==(a=this._instance.config.logs)?void 0:a.maxBufferSize)&&void 0!==o?o:100)>this._logBuffer.length?this._scheduleFlush():this.flushLogs()}else this._droppedWarned||(this._logger.warn("captureLog dropping logs: exceeded "+u+" logs per "+l+"ms"),this._droppedWarned=!0)}else this._logger.warn("captureLog requires a body")}get logger(){return this._logger_instance||(this._logger_instance={trace:(e,t)=>this.captureLog({body:e,level:"trace",attributes:t}),debug:(e,t)=>this.captureLog({body:e,level:"debug",attributes:t}),info:(e,t)=>this.captureLog({body:e,level:"info",attributes:t}),warn:(e,t)=>this.captureLog({body:e,level:"warn",attributes:t}),error:(e,t)=>this.captureLog({body:e,level:"error",attributes:t}),fatal:(e,t)=>this.captureLog({body:e,level:"fatal",attributes:t})}),this._logger_instance}flushLogs(e){if(this._flushTimeout&&(clearTimeout(this._flushTimeout),this._flushTimeout=void 0),0!==this._logBuffer.length){var t=this._logBuffer;this._logBuffer=[];var s=this._instance.config.logs,r=i({"service.name":(null==s?void 0:s.serviceName)||"unknown_service"},(null==s?void 0:s.environment)&&{"deployment.environment":s.environment},(null==s?void 0:s.serviceVersion)&&{"service.version":s.serviceVersion},null==s?void 0:s.resourceAttributes),o=function(e,t,i,s){return{resourceLogs:[{resource:{attributes:bi(t)},scopeLogs:[{scope:{name:i,version:s},logRecords:e}]}]}}(t.map((e=>e.record)),r,n.LIB_NAME,n.LIB_VERSION),a=this._instance.requestRouter.endpointFor("api","/i/v1/logs")+"?token="+encodeURIComponent(this._instance.config.token);this._instance._send_retriable_request({method:"POST",url:a,data:o,compression:"best-available",batchKey:"logs",transport:e})}}_scheduleFlush(){var e,t;this._flushTimeout||(this._flushTimeout=setTimeout((()=>{this._flushTimeout=void 0,this.flushLogs()}),null!==(e=null==(t=this._instance.config.logs)?void 0:t.flushIntervalMs)&&void 0!==e?e:3e3))}_getSdkContext(){var e,t={};if(t.distinctId=this._instance.get_distinct_id(),this._instance.sessionManager){var{sessionId:i}=this._instance.sessionManager.checkAndGetSessionAndWindowId(!0);t.sessionId=i}if(null!=ke&&null!=(e=ke.location)&&e.href&&(t.currentUrl=ke.location.href),this._instance.featureFlags){var s=this._instance.featureFlags.getFlags();s&&s.length>0&&(t.activeFeatureFlags=s)}return t}}},Wa=i({},Oa,Ma,Aa,Da,Na,Ua,qa,Ha,za,Ba,ja,Va);jo.__defaultExtensionClasses=i({},Wa);var Ga=function(){n.SDK_DIST_CHANNEL="npm";var e=Fo[No]=new jo;return function(){function e(){e.done||(e.done=!0,Uo=!1,is(Fo,(function(e){e._dom_loaded()})))}null!=me&&me.addEventListener?"complete"===me.readyState?e():cs(me,"DOMContentLoaded",e,{capture:!1}):pe&&Zi.error("Browser doesn't support `document.addEventListener` so PostHog couldn't be initialized")}(),e}();
//# sourceMappingURL=module.no-external.js.map

;// ../../node_modules/tslib/tslib.es6.js
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise */

var tslib_es6_extendStatics = function(d, b) {
    tslib_es6_extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return tslib_es6_extendStatics(d, b);
};

function tslib_es6_extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    tslib_es6_extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

var tslib_es6_assign = function() {
    tslib_es6_assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }
    return tslib_es6_assign.apply(this, arguments);
}

function tslib_es6_rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

function tslib_es6_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}

function tslib_es6_param(paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
}

function tslib_es6_metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}

function tslib_es6_awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function tslib_es6_generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

var tslib_es6_createBinding = Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
});

function tslib_es6_exportStar(m, o) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) tslib_es6_createBinding(o, m, p);
}

function tslib_es6_values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}

function tslib_es6_read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
}

/** @deprecated */
function tslib_es6_spread() {
    for (var ar = [], i = 0; i < arguments.length; i++)
        ar = ar.concat(tslib_es6_read(arguments[i]));
    return ar;
}

/** @deprecated */
function tslib_es6_spreadArrays() {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
}

function tslib_es6_spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

function tslib_es6_await(v) {
    return this instanceof tslib_es6_await ? (this.v = v, this) : new tslib_es6_await(v);
}

function tslib_es6_asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof tslib_es6_await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
}

function tslib_es6_asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: tslib_es6_await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
}

function tslib_es6_asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof tslib_es6_values === "function" ? tslib_es6_values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
}

function tslib_es6_makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
    return cooked;
};

var tslib_es6_setModuleDefault = Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
};

function tslib_es6_importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) tslib_es6_createBinding(result, mod, k);
    tslib_es6_setModuleDefault(result, mod);
    return result;
}

function tslib_es6_importDefault(mod) {
    return (mod && mod.__esModule) ? mod : { default: mod };
}

function tslib_es6_classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}

function tslib_es6_classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
}

function tslib_es6_classPrivateFieldIn(state, receiver) {
    if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}

;// ../../node_modules/rxjs/dist/esm5/internal/util/isFunction.js
function isFunction_isFunction(value) {
    return typeof value === 'function';
}
//# sourceMappingURL=isFunction.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/createErrorClass.js
function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}
//# sourceMappingURL=createErrorClass.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/UnsubscriptionError.js

var UnsubscriptionError = createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});
//# sourceMappingURL=UnsubscriptionError.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/arrRemove.js
function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}
//# sourceMappingURL=arrRemove.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/Subscription.js




var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = tslib_es6_values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction_isFunction(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = tslib_es6_values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError) {
                                errors = tslib_es6_spreadArray(tslib_es6_spreadArray([], tslib_es6_read(errors)), tslib_es6_read(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());

var EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction_isFunction(value.remove) && isFunction_isFunction(value.add) && isFunction_isFunction(value.unsubscribe)));
}
function execFinalizer(finalizer) {
    if (isFunction_isFunction(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}
//# sourceMappingURL=Subscription.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/config.js
var config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};
//# sourceMappingURL=config.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/timeoutProvider.js

var timeoutProvider = {
    setTimeout: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = timeoutProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
            return delegate.setTimeout.apply(delegate, tslib_es6_spreadArray([handler, timeout], tslib_es6_read(args)));
        }
        return setTimeout.apply(void 0, tslib_es6_spreadArray([handler, timeout], tslib_es6_read(args)));
    },
    clearTimeout: function (handle) {
        var delegate = timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};
//# sourceMappingURL=timeoutProvider.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/reportUnhandledError.js


function reportUnhandledError(err) {
    timeoutProvider.setTimeout(function () {
        var onUnhandledError = config.onUnhandledError;
        if (onUnhandledError) {
            onUnhandledError(err);
        }
        else {
            throw err;
        }
    });
}
//# sourceMappingURL=reportUnhandledError.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/noop.js
function noop_noop() { }
//# sourceMappingURL=noop.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/NotificationFactories.js
var COMPLETE_NOTIFICATION = (function () { return createNotification('C', undefined, undefined); })();
function errorNotification(error) {
    return createNotification('E', undefined, error);
}
function nextNotification(value) {
    return createNotification('N', value, undefined);
}
function createNotification(kind, value, error) {
    return {
        kind: kind,
        value: value,
        error: error,
    };
}
//# sourceMappingURL=NotificationFactories.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/errorContext.js

var context = null;
function errorContext(cb) {
    if (config.useDeprecatedSynchronousErrorHandling) {
        var isRoot = !context;
        if (isRoot) {
            context = { errorThrown: false, error: null };
        }
        cb();
        if (isRoot) {
            var _a = context, errorThrown = _a.errorThrown, error = _a.error;
            context = null;
            if (errorThrown) {
                throw error;
            }
        }
    }
    else {
        cb();
    }
}
function captureError(err) {
    if (config.useDeprecatedSynchronousErrorHandling && context) {
        context.errorThrown = true;
        context.error = err;
    }
}
//# sourceMappingURL=errorContext.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/Subscriber.js









var Subscriber = (function (_super) {
    tslib_es6_extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) {
            handleStoppedNotification(nextNotification(value), this);
        }
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) {
            handleStoppedNotification(errorNotification(err), this);
        }
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) {
            handleStoppedNotification(COMPLETE_NOTIFICATION, this);
        }
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription));

var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function () {
    function ConsumerObserver(partialObserver) {
        this.partialObserver = partialObserver;
    }
    ConsumerObserver.prototype.next = function (value) {
        var partialObserver = this.partialObserver;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    ConsumerObserver.prototype.error = function (err) {
        var partialObserver = this.partialObserver;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
        else {
            handleUnhandledError(err);
        }
    };
    ConsumerObserver.prototype.complete = function () {
        var partialObserver = this.partialObserver;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    return ConsumerObserver;
}());
var SafeSubscriber = (function (_super) {
    tslib_es6_extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var partialObserver;
        if (isFunction_isFunction(observerOrNext) || !observerOrNext) {
            partialObserver = {
                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                error: error !== null && error !== void 0 ? error : undefined,
                complete: complete !== null && complete !== void 0 ? complete : undefined,
            };
        }
        else {
            var context_1;
            if (_this && config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
                partialObserver = {
                    next: observerOrNext.next && bind(observerOrNext.next, context_1),
                    error: observerOrNext.error && bind(observerOrNext.error, context_1),
                    complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                };
            }
            else {
                partialObserver = observerOrNext;
            }
        }
        _this.destination = new ConsumerObserver(partialObserver);
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));

function handleUnhandledError(error) {
    if (config.useDeprecatedSynchronousErrorHandling) {
        captureError(error);
    }
    else {
        reportUnhandledError(error);
    }
}
function defaultErrorHandler(err) {
    throw err;
}
function handleStoppedNotification(notification, subscriber) {
    var onStoppedNotification = config.onStoppedNotification;
    onStoppedNotification && timeoutProvider.setTimeout(function () { return onStoppedNotification(notification, subscriber); });
}
var EMPTY_OBSERVER = {
    closed: true,
    next: noop_noop,
    error: defaultErrorHandler,
    complete: noop_noop,
};
//# sourceMappingURL=Subscriber.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/symbol/observable.js
var observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();
//# sourceMappingURL=observable.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/identity.js
function identity_identity(x) {
    return x;
}
//# sourceMappingURL=identity.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/pipe.js

function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity_identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
//# sourceMappingURL=pipe.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/Observable.js







var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new SafeSubscriber(observerOrNext, error, complete);
        errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());

function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction_isFunction(value.next) && isFunction_isFunction(value.error) && isFunction_isFunction(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber) || (isObserver(value) && isSubscription(value));
}
//# sourceMappingURL=Observable.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/Action.js


var Action = (function (_super) {
    tslib_es6_extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        return this;
    };
    return Action;
}(Subscription));

//# sourceMappingURL=Action.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/intervalProvider.js

var intervalProvider = {
    setInterval: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = intervalProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
            return delegate.setInterval.apply(delegate, tslib_es6_spreadArray([handler, timeout], tslib_es6_read(args)));
        }
        return setInterval.apply(void 0, tslib_es6_spreadArray([handler, timeout], tslib_es6_read(args)));
    },
    clearInterval: function (handle) {
        var delegate = intervalProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
    },
    delegate: undefined,
};
//# sourceMappingURL=intervalProvider.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/AsyncAction.js




var AsyncAction = (function (_super) {
    tslib_es6_extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = this.id || this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
        if (delay === void 0) { delay = 0; }
        return intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay != null && this.delay === delay && this.pending === false) {
            return id;
        }
        intervalProvider.clearInterval(id);
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, _delay) {
        var errored = false;
        var errorValue;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = e ? e : new Error('Scheduled action threw falsy error');
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype.unsubscribe = function () {
        if (!this.closed) {
            var _a = this, id = _a.id, scheduler = _a.scheduler;
            var actions = scheduler.actions;
            this.work = this.state = this.scheduler = null;
            this.pending = false;
            arrRemove(actions, this);
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
            _super.prototype.unsubscribe.call(this);
        }
    };
    return AsyncAction;
}(Action));

//# sourceMappingURL=AsyncAction.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/dateTimestampProvider.js
var dateTimestampProvider = {
    now: function () {
        return (dateTimestampProvider.delegate || Date).now();
    },
    delegate: undefined,
};
//# sourceMappingURL=dateTimestampProvider.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/Scheduler.js

var Scheduler = (function () {
    function Scheduler(schedulerActionCtor, now) {
        if (now === void 0) { now = Scheduler.now; }
        this.schedulerActionCtor = schedulerActionCtor;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        return new this.schedulerActionCtor(this, work).schedule(state, delay);
    };
    Scheduler.now = dateTimestampProvider.now;
    return Scheduler;
}());

//# sourceMappingURL=Scheduler.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/AsyncScheduler.js


var AsyncScheduler = (function (_super) {
    tslib_es6_extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) { now = Scheduler.now; }
        var _this = _super.call(this, SchedulerAction, now) || this;
        _this.actions = [];
        _this._active = false;
        _this._scheduled = undefined;
        return _this;
    }
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this._active) {
            actions.push(action);
            return;
        }
        var error;
        this._active = true;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions.shift()));
        this._active = false;
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler));

//# sourceMappingURL=AsyncScheduler.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/scheduler/async.js


var asyncScheduler = new AsyncScheduler(AsyncAction);
var async_async = asyncScheduler;
//# sourceMappingURL=async.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isScheduler.js

function isScheduler(value) {
    return value && isFunction_isFunction(value.schedule);
}
//# sourceMappingURL=isScheduler.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isDate.js
function isValidDate(value) {
    return value instanceof Date && !isNaN(value);
}
//# sourceMappingURL=isDate.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/observable/timer.js




function timer(dueTime, intervalOrScheduler, scheduler) {
    if (dueTime === void 0) { dueTime = 0; }
    if (scheduler === void 0) { scheduler = async_async; }
    var intervalDuration = -1;
    if (intervalOrScheduler != null) {
        if (isScheduler(intervalOrScheduler)) {
            scheduler = intervalOrScheduler;
        }
        else {
            intervalDuration = intervalOrScheduler;
        }
    }
    return new Observable(function (subscriber) {
        var due = isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
        if (due < 0) {
            due = 0;
        }
        var n = 0;
        return scheduler.schedule(function () {
            if (!subscriber.closed) {
                subscriber.next(n++);
                if (0 <= intervalDuration) {
                    this.schedule(undefined, intervalDuration);
                }
                else {
                    subscriber.complete();
                }
            }
        }, due);
    });
}
//# sourceMappingURL=timer.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isArrayLike.js
var isArrayLike_isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });
//# sourceMappingURL=isArrayLike.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isPromise.js

function isPromise(value) {
    return isFunction_isFunction(value === null || value === void 0 ? void 0 : value.then);
}
//# sourceMappingURL=isPromise.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isInteropObservable.js


function isInteropObservable(input) {
    return isFunction_isFunction(input[observable]);
}
//# sourceMappingURL=isInteropObservable.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isAsyncIterable.js

function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction_isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
//# sourceMappingURL=isAsyncIterable.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/throwUnobservableError.js
function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
//# sourceMappingURL=throwUnobservableError.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/symbol/iterator.js
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
var iterator = getSymbolIterator();
//# sourceMappingURL=iterator.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isIterable.js


function isIterable(input) {
    return isFunction_isFunction(input === null || input === void 0 ? void 0 : input[iterator]);
}
//# sourceMappingURL=isIterable.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/isReadableStreamLike.js


function readableStreamLikeToAsyncGenerator(readableStream) {
    return tslib_es6_asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
        var reader, _a, value, done;
        return tslib_es6_generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = readableStream.getReader();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 9, 10]);
                    _b.label = 2;
                case 2:
                    if (false) // removed by dead control flow
{}
                    return [4, tslib_es6_await(reader.read())];
                case 3:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (!done) return [3, 5];
                    return [4, tslib_es6_await(void 0)];
                case 4: return [2, _b.sent()];
                case 5: return [4, tslib_es6_await(value)];
                case 6: return [4, _b.sent()];
                case 7:
                    _b.sent();
                    return [3, 2];
                case 8: return [3, 10];
                case 9:
                    reader.releaseLock();
                    return [7];
                case 10: return [2];
            }
        });
    });
}
function isReadableStreamLike(obj) {
    return isFunction_isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
//# sourceMappingURL=isReadableStreamLike.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/observable/innerFrom.js












function innerFrom(input) {
    if (input instanceof Observable) {
        return input;
    }
    if (input != null) {
        if (isInteropObservable(input)) {
            return fromInteropObservable(input);
        }
        if (isArrayLike_isArrayLike(input)) {
            return fromArrayLike(input);
        }
        if (isPromise(input)) {
            return fromPromise(input);
        }
        if (isAsyncIterable(input)) {
            return fromAsyncIterable(input);
        }
        if (isIterable(input)) {
            return fromIterable(input);
        }
        if (isReadableStreamLike(input)) {
            return fromReadableStreamLike(input);
        }
    }
    throw createInvalidObservableTypeError(input);
}
function fromInteropObservable(obj) {
    return new Observable(function (subscriber) {
        var obs = obj[observable]();
        if (isFunction_isFunction(obs.subscribe)) {
            return obs.subscribe(subscriber);
        }
        throw new TypeError('Provided object does not correctly implement Symbol.observable');
    });
}
function fromArrayLike(array) {
    return new Observable(function (subscriber) {
        for (var i = 0; i < array.length && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    });
}
function fromPromise(promise) {
    return new Observable(function (subscriber) {
        promise
            .then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, reportUnhandledError);
    });
}
function fromIterable(iterable) {
    return new Observable(function (subscriber) {
        var e_1, _a;
        try {
            for (var iterable_1 = tslib_es6_values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var value = iterable_1_1.value;
                subscriber.next(value);
                if (subscriber.closed) {
                    return;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        subscriber.complete();
    });
}
function fromAsyncIterable(asyncIterable) {
    return new Observable(function (subscriber) {
        innerFrom_process(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
    });
}
function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(readableStreamLikeToAsyncGenerator(readableStream));
}
function innerFrom_process(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return tslib_es6_awaiter(this, void 0, void 0, function () {
        var value, e_2_1;
        return tslib_es6_generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    asyncIterable_1 = tslib_es6_asyncValues(asyncIterable);
                    _b.label = 1;
                case 1: return [4, asyncIterable_1.next()];
                case 2:
                    if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                    value = asyncIterable_1_1.value;
                    subscriber.next(value);
                    if (subscriber.closed) {
                        return [2];
                    }
                    _b.label = 3;
                case 3: return [3, 1];
                case 4: return [3, 11];
                case 5:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                    return [4, _a.call(asyncIterable_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3, 10];
                case 9:
                    if (e_2) throw e_2.error;
                    return [7];
                case 10: return [7];
                case 11:
                    subscriber.complete();
                    return [2];
            }
        });
    });
}
//# sourceMappingURL=innerFrom.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/util/lift.js

function hasLift(source) {
    return isFunction_isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
function operate(init) {
    return function (source) {
        if (hasLift(source)) {
            return source.lift(function (liftedSource) {
                try {
                    return init(liftedSource, this);
                }
                catch (err) {
                    this.error(err);
                }
            });
        }
        throw new TypeError('Unable to lift unknown Observable type');
    };
}
//# sourceMappingURL=lift.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/operators/OperatorSubscriber.js


function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
var OperatorSubscriber = (function (_super) {
    tslib_es6_extends(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
        var _this = _super.call(this, destination) || this;
        _this.onFinalize = onFinalize;
        _this.shouldUnsubscribe = shouldUnsubscribe;
        _this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : _super.prototype._next;
        _this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._error;
        _this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._complete;
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
            var closed_1 = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        }
    };
    return OperatorSubscriber;
}(Subscriber));

//# sourceMappingURL=OperatorSubscriber.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/operators/switchMap.js



function switchMap(project, resultSelector) {
    return operate(function (source, subscriber) {
        var innerSubscriber = null;
        var index = 0;
        var isComplete = false;
        var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
        source.subscribe(createOperatorSubscriber(subscriber, function (value) {
            innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
            var innerIndex = 0;
            var outerIndex = index++;
            innerFrom(project(value, outerIndex)).subscribe((innerSubscriber = createOperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                innerSubscriber = null;
                checkComplete();
            })));
        }, function () {
            isComplete = true;
            checkComplete();
        }));
    });
}
//# sourceMappingURL=switchMap.js.map
;// ../../node_modules/rxjs/dist/esm5/internal/operators/distinctUntilChanged.js



function distinctUntilChanged(comparator, keySelector) {
    if (keySelector === void 0) { keySelector = identity_identity; }
    comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
    return operate(function (source, subscriber) {
        var previousKey;
        var first = true;
        source.subscribe(createOperatorSubscriber(subscriber, function (value) {
            var currentKey = keySelector(value);
            if (first || !comparator(previousKey, currentKey)) {
                first = false;
                previousKey = currentKey;
                subscriber.next(value);
            }
        }));
    });
}
function defaultCompare(a, b) {
    return a === b;
}
//# sourceMappingURL=distinctUntilChanged.js.map
;// ../extension-service-worker/dist/esm/browserEnv.js
let browserEnv_browserEnv;
if (typeof chrome !== 'undefined') {
    browserEnv_browserEnv = chrome;
}
else if (typeof browser !== 'undefined') {
    browserEnv_browserEnv = browser;
}
const hasOffscreen = (browserEnv) => {
    return !!browserEnv['offscreen'];
};

;// ../../node_modules/@aws-amplify/core/dist/esm/singleton/apis/fetchAuthSession.mjs



// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
/**
 * Fetch the auth session including the tokens and credentials if they are available. By default it
 * will automatically refresh expired auth tokens if a valid refresh token is present. You can force a refresh
 * of non-expired tokens with `{ forceRefresh: true }` input.
 *
 * @param options - Options configuring the fetch behavior.
 * @throws {@link AuthError} - Throws error when session information cannot be refreshed.
 * @returns Promise<AuthSession>
 */
const fetchAuthSession_fetchAuthSession = (options) => {
    return fetchAuthSession(Amplify, options);
};


//# sourceMappingURL=fetchAuthSession.mjs.map

;// ../extension-service-worker/dist/esm/session.js

/**
 * Amplify v6 resolves `fetchAuthSession()` with an empty session when the user
 * is signed out, rather than rejecting the way v4's `currentSession()` did, so
 * the tokens have to be checked explicitly.
 */
const isSignedIn = async () => {
    const session = await fetchAuthSession_fetchAuthSession().catch(() => null);
    return !!session?.tokens?.accessToken;
};
const isInPaidGroup = async () => {
    const session = await fetchAuthSession_fetchAuthSession().catch(() => null);
    const groups = session?.tokens?.accessToken?.payload['cognito:groups'];
    return Array.isArray(groups) && groups.includes('paid');
};
const getIdToken = async () => {
    const session = await fetchAuthSession_fetchAuthSession().catch(() => null);
    return session?.tokens?.idToken?.toString() ?? '';
};

;// ../extension-service-worker/dist/esm/askForRatingCounter.js



const storage = browserEnv_browserEnv.storage.sync;
const storageKey = 'askForRatingCounter';
const getAskForRatingCounter = async (language) => {
    const storageResult = await storage.get([storageKey]);
    if (storageResult[storageKey] !== undefined) {
        return storageResult[storageKey];
    }
    if (!(await isSignedIn())) {
        await storage.set({ [storageKey]: 1 });
        return 1;
    }
    const languageDeckResult = await loadLanguageDeck(language);
    if (languageDeckResult.success === false) {
        return 1;
    }
    const newValue = languageDeckResult.value.cards.length >= 10
        ? 10
        : languageDeckResult.value.cards.length;
    await storage.set({ [storageKey]: newValue });
    return newValue;
};
const storeAskForRatingCounter = async (newCounterValue) => {
    await storage.set({ [storageKey]: newCounterValue });
};
const resetAskForRatingCounter = async () => {
    await storage.set({ [storageKey]: 1 });
};

;// ../extension-service-worker/dist/esm/getCardsLimit.js


const getCardsLimit_getCardsLimit = async () => {
    if (!(await isSignedIn())) {
        return 'unlimited';
    }
    if (await isInPaidGroup()) {
        return 'unlimited';
    }
    const staticMetadataResult = await getUserStaticMetadata();
    if (staticMetadataResult.success === false) {
        return 'unlimited';
    }
    if (staticMetadataResult.value.premium) {
        return 'unlimited';
    }
    return {
        maxCards: staticMetadataResult.value.max_cards,
        cardsPerDay: staticMetadataResult.value.cards_per_day,
    };
};

;// ../extension-service-worker/dist/esm/getUserAttributes.js


const getUserAttributes = async () => {
    const user = await getCurrentUser_getCurrentUser().catch(() => null);
    if (!user) {
        return {
            success: false,
            errorCode: 'AUTH_UNABLE_TO_GET_USER_SESSION',
            reason: `Unable to get current user`,
        };
    }
    try {
        const attributes = await fetchUserAttributes_fetchUserAttributes();
        return {
            success: true,
            value: mapUserAttributes({ username: user.username, attributes }),
        };
    }
    catch (e) {
        return {
            success: false,
            errorCode: 'AUTH_UNABLE_TO_GET_USER_ATTRIBUTES',
            reason: `Unable to get current user`,
            extra: e,
        };
    }
};

;// ../extension-service-worker/dist/esm/languageList.js

let cache = {
    timestamp: 0,
    list: [],
};
const getUserLanguages = async () => {
    const currentTimestamp = new Date().getTime();
    if (cache.timestamp > currentTimestamp) {
        return {
            success: true,
            value: cache.list,
        };
    }
    const result = await listLanguages().catch((error) => {
        console.error('List languages error', error);
        throw error;
    });
    if (result.success === false) {
        return result;
    }
    const hour = 60 * 60 * 1000;
    cache = {
        timestamp: currentTimestamp + hour,
        list: result.value,
    };
    return {
        success: true,
        value: cache.list,
    };
};
const removeLanguage = (toBeRemoved) => {
    cache = {
        ...cache,
        list: cache.list.filter((language) => language !== toBeRemoved),
    };
};
const addLanguage = (toBeAdded) => {
    cache = {
        ...cache,
        list: [
            ...cache.list.filter((language) => language !== toBeAdded),
            toBeAdded,
        ],
    };
};

;// ../extension-service-worker/dist/esm/lastUsedTagsIds.js

const getLastUsedTagsIds = async () => {
    const { lastUsedTagsIds } = await browserEnv_browserEnv.storage.local.get([
        'lastUsedTagsIds',
    ]);
    return lastUsedTagsIds ?? [];
};
const saveLastUsedTagsIds = async (lastUsedTagsIds) => {
    await browserEnv_browserEnv.storage.local.set({ lastUsedTagsIds });
};

;// ../extension-service-worker/dist/esm/locationLanguage.js

const locationLanguages = {};
// Load
(async () => {
    const { locationLanguages: storedLocationLanguages } = await browserEnv_browserEnv.storage.sync.get(['locationLanguages']);
    if (storedLocationLanguages) {
        Object.assign(locationLanguages, storedLocationLanguages);
    }
})();
const locationLanguage_getLocationLanguage = (url) => {
    const domain = new URL(url).hostname;
    if (locationLanguages[domain]) {
        return locationLanguages[domain];
    }
    return null;
};
const storeLocationLanguage = async (url, language) => {
    locationLanguages[new URL(url).hostname] = language;
    await browserEnv_browserEnv.storage.sync.set({ locationLanguages });
};

;// ../extension-service-worker/dist/esm/selectedLanguage/languagePairs.js

const languagePairs = {};
// Load language pairs
(async () => {
    const { languagePairs: storedLanguagePairs } = await browserEnv_browserEnv.storage.sync.get(['languagePairs']);
    if (storedLanguagePairs) {
        Object.assign(languagePairs, storedLanguagePairs);
    }
})();
const saveLanguagePairs = async () => {
    await browserEnv_browserEnv.storage.sync.set({ languagePairs });
};
const addLanguagePair = async (sourceLanguage, targetLanguage) => {
    const languagePair = languagePairs[sourceLanguage];
    if (!languagePair) {
        languagePairs[sourceLanguage] = {
            currentTargetLanguage: targetLanguage,
            possibleTargetLanguages: [targetLanguage],
        };
        await saveLanguagePairs();
        return;
    }
    if (languagePair.currentTargetLanguage === targetLanguage) {
        return;
    }
    languagePairs[sourceLanguage] = {
        currentTargetLanguage: targetLanguage,
        possibleTargetLanguages: [
            targetLanguage,
            ...languagePair.possibleTargetLanguages.filter((possibleTargetLanguage) => possibleTargetLanguage !== targetLanguage),
        ].slice(0, 3),
    };
    await saveLanguagePairs();
};
const setLanguagePairs = async (newLanguagePairs) => {
    for (const key of Object.keys(languagePairs)) {
        delete languagePairs[key];
    }
    Object.assign(languagePairs, newLanguagePairs);
    await saveLanguagePairs();
};
const getLanguagePair = (language) => {
    return languagePairs[language];
};

;// ../extension-service-worker/dist/esm/selectedLanguage/sourceLanguage.js


const sourceLanguage_getSourceLanguage = async () => {
    const { sourceLanguage } = await browserEnv_browserEnv.storage.sync.get([
        'sourceLanguage',
    ]);
    return (sourceLanguage ?? null);
};
const sourceLanguage_setSourceLanguage = async (language) => {
    const currentSourceLanguage = await sourceLanguage_getSourceLanguage();
    if (currentSourceLanguage === language) {
        return;
    }
    const pair = getLanguagePair(language);
    await browserEnv_browserEnv.storage.sync.set({
        sourceLanguage: language,
    });
    if (pair) {
        await browserEnv_browserEnv.storage.sync.set({
            proxyLanguage: pair.currentTargetLanguage,
        });
    }
};

;// ../extension-service-worker/dist/esm/selectedLanguage/proxyLanguage.js



const proxyLanguage_getProxyLanguage = async () => {
    const { proxyLanguage } = await browserEnv_browserEnv.storage.sync.get([
        'proxyLanguage',
    ]);
    return (proxyLanguage ?? null);
};
const proxyLanguage_setProxyLanguage = async (targetLanguage) => {
    const sourceLanguage = await sourceLanguage_getSourceLanguage();
    if (sourceLanguage) {
        await addLanguagePair(sourceLanguage, targetLanguage);
    }
    const currentProxyLanguage = await proxyLanguage_getProxyLanguage();
    if (currentProxyLanguage === targetLanguage) {
        return;
    }
    await browserEnv_browserEnv.storage.sync.set({
        proxyLanguage: targetLanguage,
    });
};

;// ../browser-i18n/dist/esm/ru.js
const ru = {
    nominative_af: 'африкаанс',
    nominative_sq: 'албанский',
    nominative_am: 'амхарский',
    nominative_ar: 'арабский',
    nominative_hy: 'армянский',
    nominative_hyw: 'армянский (западный)',
    nominative_az: 'азербайджанский',
    nominative_eu: 'баскский',
    nominative_be: 'белорусский',
    nominative_bn: 'бенгальский',
    nominative_bs: 'боснийский',
    nominative_bg: 'болгарский',
    nominative_ca: 'каталанский',
    nominative_zh: 'китайский (упрощённый)',
    'nominative_zh-TW': 'китайский (традиционный)',
    nominative_co: 'корсиканский',
    nominative_hr: 'хорватский',
    nominative_cs: 'чешский',
    nominative_da: 'датский',
    nominative_nl: 'нидерландский',
    nominative_en: 'английский (США)',
    'nominative_en-GB': 'английский (британский)',
    nominative_eo: 'эсперанто',
    nominative_et: 'эстонский',
    nominative_fi: 'финский',
    nominative_fr: 'французский',
    nominative_fy: 'фризский',
    nominative_gl: 'галисийский',
    nominative_ka: 'грузинский',
    nominative_de: 'немецкий',
    nominative_el: 'греческий',
    nominative_gu: 'гуджарати',
    nominative_ht: 'гаитянский креольский',
    nominative_ha: 'хауса',
    nominative_haw: 'гавайский',
    nominative_he: 'иврит',
    nominative_hi: 'хинди',
    nominative_hmn: 'хмонг',
    nominative_hu: 'венгерский',
    nominative_is: 'исландский',
    nominative_ig: 'игбо',
    nominative_id: 'индонезийский',
    nominative_ga: 'ирландский',
    nominative_it: 'итальянский',
    nominative_ja: 'японский',
    nominative_jv: 'яванский',
    nominative_kn: 'каннада',
    nominative_kk: 'казахский',
    nominative_km: 'кхмерский',
    nominative_rw: 'киньяруанда',
    nominative_ko: 'корейский',
    nominative_ku: 'курдский',
    nominative_ky: 'киргизский',
    nominative_lo: 'лаосский',
    nominative_lv: 'латышский',
    nominative_lt: 'литовский',
    nominative_lb: 'люксембургский',
    nominative_mk: 'македонский',
    nominative_mg: 'малагасийский',
    nominative_ms: 'малайский',
    nominative_ml: 'малаялам',
    nominative_mt: 'мальтийский',
    nominative_mi: 'маори',
    nominative_mr: 'маратхи',
    nominative_mn: 'монгольский',
    nominative_my: 'мьянма (бирманский)',
    nominative_ne: 'непальский',
    nominative_no: 'норвежский',
    nominative_ny: 'ньянджа (чичева)',
    nominative_or: 'одиа (ория)',
    nominative_ps: 'пушту',
    nominative_fa: 'персидский',
    nominative_pl: 'польский',
    nominative_pt: 'португальский (бразильский)',
    'nominative_pt-PT': 'португальский (европейский)',
    nominative_pa: 'пенджабский',
    nominative_ro: 'румынский',
    nominative_ru: 'русский',
    nominative_sm: 'самоанский',
    nominative_gd: 'шотландский гэльский',
    nominative_sr: 'сербский',
    nominative_st: 'сесото',
    nominative_sn: 'шона',
    nominative_sd: 'синдхи',
    nominative_si: 'сингальский',
    nominative_sk: 'словацкий',
    nominative_sl: 'словенский',
    nominative_so: 'сомалийский',
    nominative_es: 'испанский',
    nominative_su: 'сунданский',
    nominative_sw: 'суахили',
    nominative_sv: 'шведский',
    nominative_tl: 'тагальский (филиппинский)',
    nominative_tg: 'таджикский',
    nominative_ta: 'тамильский',
    nominative_tt: 'татарский',
    nominative_te: 'телугу',
    nominative_th: 'тайский',
    nominative_tr: 'турецкий',
    nominative_tk: 'туркменский',
    nominative_uk: 'украинский',
    nominative_ur: 'урду',
    nominative_ug: 'уйгурский',
    nominative_uz: 'узбекский',
    nominative_vi: 'вьетнамский',
    nominative_cy: 'валлийский',
    nominative_xh: 'коса',
    nominative_yi: 'идиш',
    nominative_yo: 'йоруба',
    nominative_zu: 'зулу',
    //
    objective_af: 'африкаанс',
    objective_sq: 'албанские',
    objective_am: 'амхарские',
    objective_ar: 'арабские',
    objective_hy: 'армянские',
    objective_hyw: 'армянские (западные)',
    objective_az: 'азербайджанские',
    objective_eu: 'баскские',
    objective_be: 'белорусские',
    objective_bn: 'бенгальские',
    objective_bs: 'боснийские',
    objective_bg: 'болгарские',
    objective_ca: 'каталанские',
    objective_zh: 'китайские (упрощённые)',
    'objective_zh-TW': 'китайские (традиционные)',
    objective_co: 'корсиканские',
    objective_hr: 'хорватские',
    objective_cs: 'чешские',
    objective_da: 'датские',
    objective_nl: 'нидерландские',
    objective_en: 'английские (США)',
    'objective_en-GB': 'английские (британские)',
    objective_eo: 'эсперанто',
    objective_et: 'эстонские',
    objective_fi: 'финские',
    objective_fr: 'французские',
    objective_fy: 'фризские',
    objective_gl: 'галисийские',
    objective_ka: 'грузинские',
    objective_de: 'немецкие',
    objective_el: 'греческие',
    objective_gu: 'гуджарати',
    objective_ht: 'гаитянские креольские',
    objective_ha: 'хауса',
    objective_haw: 'гавайские',
    objective_he: 'иврит',
    objective_hi: 'хинди',
    objective_hmn: 'хмонг',
    objective_hu: 'венгерские',
    objective_is: 'исландские',
    objective_ig: 'игбо',
    objective_id: 'индонезийские',
    objective_ga: 'ирландские',
    objective_it: 'итальянские',
    objective_ja: 'японские',
    objective_jv: 'яванские',
    objective_kn: 'каннада',
    objective_kk: 'казахские',
    objective_km: 'кхмерские',
    objective_rw: 'киньяруанда',
    objective_ko: 'корейские',
    objective_ku: 'курдские',
    objective_ky: 'киргизские',
    objective_lo: 'лаосские',
    objective_lv: 'латышские',
    objective_lt: 'литовские',
    objective_lb: 'люксембургские',
    objective_mk: 'македонские',
    objective_mg: 'малагасийские',
    objective_ms: 'малайские',
    objective_ml: 'малаялам',
    objective_mt: 'мальтийские',
    objective_mi: 'маори',
    objective_mr: 'маратхи',
    objective_mn: 'монгольские',
    objective_my: 'мьянма (бирманские)',
    objective_ne: 'непальские',
    objective_no: 'норвежские',
    objective_ny: 'ньянджа (чичева)',
    objective_or: 'одиа (ория)',
    objective_ps: 'пушту',
    objective_fa: 'персидские',
    objective_pl: 'польские',
    objective_pt: 'португальские (бразильские)',
    'objective_pt-PT': 'португальские (европейские)',
    objective_pa: 'пенджабские',
    objective_ro: 'румынские',
    objective_ru: 'русские',
    objective_sm: 'самоанские',
    objective_gd: 'шотландские гэльские',
    objective_sr: 'сербские',
    objective_st: 'сесото',
    objective_sn: 'шона',
    objective_sd: 'синдхи',
    objective_si: 'сингальские',
    objective_sk: 'словацкие',
    objective_sl: 'словенские',
    objective_so: 'сомалийские',
    objective_es: 'испанские',
    objective_su: 'сунданские',
    objective_sw: 'суахили',
    objective_sv: 'шведские',
    objective_tl: 'тагальские (филиппинские)',
    objective_tg: 'таджикские',
    objective_ta: 'тамильские',
    objective_tt: 'татарские',
    objective_te: 'телугу',
    objective_th: 'тайские',
    objective_tr: 'турецкие',
    objective_tk: 'туркменские',
    objective_uk: 'украинские',
    objective_ur: 'урду',
    objective_ug: 'уйгурские',
    objective_uz: 'узбекские',
    objective_vi: 'вьетнамские',
    objective_cy: 'валлийские',
    objective_xh: 'коса',
    objective_yi: 'идиш',
    objective_yo: 'йоруба',
    objective_zu: 'зулу',
};

;// ../browser-i18n/dist/esm/en.js
const en_en = {
    nominative_af: 'Afrikaans',
    nominative_sq: 'Albanian',
    nominative_am: 'Amharic',
    nominative_ar: 'Arabic',
    nominative_hy: 'Armenian',
    nominative_hyw: 'Armenian (Western)',
    nominative_az: 'Azerbaijani',
    nominative_eu: 'Basque',
    nominative_be: 'Belarusian',
    nominative_bn: 'Bengali',
    nominative_bs: 'Bosnian',
    nominative_bg: 'Bulgarian',
    nominative_ca: 'Catalan',
    nominative_zh: 'Chinese (Simplified)',
    'nominative_zh-TW': 'Chinese (Traditional)',
    nominative_co: 'Corsican',
    nominative_hr: 'Croatian',
    nominative_cs: 'Czech',
    nominative_da: 'Danish',
    nominative_nl: 'Dutch',
    nominative_en: 'English (US)',
    'nominative_en-GB': 'English (British)',
    nominative_eo: 'Esperanto',
    nominative_et: 'Estonian',
    nominative_fi: 'Finnish',
    nominative_fr: 'French',
    nominative_fy: 'Frisian',
    nominative_gl: 'Galician',
    nominative_ka: 'Georgian',
    nominative_de: 'German',
    nominative_el: 'Greek',
    nominative_gu: 'Gujarati',
    nominative_ht: 'Haitian Creole',
    nominative_ha: 'Hausa',
    nominative_haw: 'Hawaiian',
    nominative_he: 'Hebrew',
    nominative_hi: 'Hindi',
    nominative_hmn: 'Hmong',
    nominative_hu: 'Hungarian',
    nominative_is: 'Icelandic',
    nominative_ig: 'Igbo',
    nominative_id: 'Indonesian',
    nominative_ga: 'Irish',
    nominative_it: 'Italian',
    nominative_ja: 'Japanese',
    nominative_jv: 'Javanese',
    nominative_kn: 'Kannada',
    nominative_kk: 'Kazakh',
    nominative_km: 'Khmer',
    nominative_rw: 'Kinyarwanda',
    nominative_ko: 'Korean',
    nominative_ku: 'Kurdish',
    nominative_ky: 'Kyrgyz',
    nominative_lo: 'Lao',
    nominative_lv: 'Latvian',
    nominative_lt: 'Lithuanian',
    nominative_lb: 'Luxembourgish',
    nominative_mk: 'Macedonian',
    nominative_mg: 'Malagasy',
    nominative_ms: 'Malay',
    nominative_ml: 'Malayalam',
    nominative_mt: 'Maltese',
    nominative_mi: 'Maori',
    nominative_mr: 'Marathi',
    nominative_mn: 'Mongolian',
    nominative_my: 'Myanmar (Burmese)',
    nominative_ne: 'Nepali',
    nominative_no: 'Norwegian',
    nominative_ny: 'Nyanja (Chichewa)',
    nominative_or: 'Odia (Oriya)',
    nominative_ps: 'Pashto',
    nominative_fa: 'Persian',
    nominative_pl: 'Polish',
    nominative_pt: 'Portuguese (Brazilian)',
    'nominative_pt-PT': 'Portuguese (European)',
    nominative_pa: 'Punjabi',
    nominative_ro: 'Romanian',
    nominative_ru: 'Russian',
    nominative_sm: 'Samoan',
    nominative_gd: 'Scots Gaelic',
    nominative_sr: 'Serbian',
    nominative_st: 'Sesotho',
    nominative_sn: 'Shona',
    nominative_sd: 'Sindhi',
    nominative_si: 'Sinhala (Sinhalese)',
    nominative_sk: 'Slovak',
    nominative_sl: 'Slovenian',
    nominative_so: 'Somali',
    nominative_es: 'Spanish',
    nominative_su: 'Sundanese',
    nominative_sw: 'Swahili',
    nominative_sv: 'Swedish',
    nominative_tl: 'Tagalog (Filipino)',
    nominative_tg: 'Tajik',
    nominative_ta: 'Tamil',
    nominative_tt: 'Tatar',
    nominative_te: 'Telugu',
    nominative_th: 'Thai',
    nominative_tr: 'Turkish',
    nominative_tk: 'Turkmen',
    nominative_uk: 'Ukrainian',
    nominative_ur: 'Urdu',
    nominative_ug: 'Uyghur',
    nominative_uz: 'Uzbek',
    nominative_vi: 'Vietnamese',
    nominative_cy: 'Welsh',
    nominative_xh: 'Xhosa',
    nominative_yi: 'Yiddish',
    nominative_yo: 'Yoruba',
    nominative_zu: 'Zulu',
    //
    objective_af: 'Afrikaans',
    objective_sq: 'Albanian',
    objective_am: 'Amharic',
    objective_ar: 'Arabic',
    objective_hy: 'Armenian',
    objective_hyw: 'Armenian (Western)',
    objective_az: 'Azerbaijani',
    objective_eu: 'Basque',
    objective_be: 'Belarusian',
    objective_bn: 'Bengali',
    objective_bs: 'Bosnian',
    objective_bg: 'Bulgarian',
    objective_ca: 'Catalan',
    objective_zh: 'Chinese (Simplified)',
    'objective_zh-TW': 'Chinese (Traditional)',
    objective_co: 'Corsican',
    objective_hr: 'Croatian',
    objective_cs: 'Czech',
    objective_da: 'Danish',
    objective_nl: 'Dutch',
    objective_en: 'English (US)',
    'objective_en-GB': 'English (British)',
    objective_eo: 'Esperanto',
    objective_et: 'Estonian',
    objective_fi: 'Finnish',
    objective_fr: 'French',
    objective_fy: 'Frisian',
    objective_gl: 'Galician',
    objective_ka: 'Georgian',
    objective_de: 'German',
    objective_el: 'Greek',
    objective_gu: 'Gujarati',
    objective_ht: 'Haitian Creole',
    objective_ha: 'Hausa',
    objective_haw: 'Hawaiian',
    objective_he: 'Hebrew',
    objective_hi: 'Hindi',
    objective_hmn: 'Hmong',
    objective_hu: 'Hungarian',
    objective_is: 'Icelandic',
    objective_ig: 'Igbo',
    objective_id: 'Indonesian',
    objective_ga: 'Irish',
    objective_it: 'Italian',
    objective_ja: 'Japanese',
    objective_jv: 'Javanese',
    objective_kn: 'Kannada',
    objective_kk: 'Kazakh',
    objective_km: 'Khmer',
    objective_rw: 'Kinyarwanda',
    objective_ko: 'Korean',
    objective_ku: 'Kurdish',
    objective_ky: 'Kyrgyz',
    objective_lo: 'Lao',
    objective_lv: 'Latvian',
    objective_lt: 'Lithuanian',
    objective_lb: 'Luxembourgish',
    objective_mk: 'Macedonian',
    objective_mg: 'Malagasy',
    objective_ms: 'Malay',
    objective_ml: 'Malayalam',
    objective_mt: 'Maltese',
    objective_mi: 'Maori',
    objective_mr: 'Marathi',
    objective_mn: 'Mongolian',
    objective_my: 'Myanmar (Burmese)',
    objective_ne: 'Nepali',
    objective_no: 'Norwegian',
    objective_ny: 'Nyanja (Chichewa)',
    objective_or: 'Odia (Oriya)',
    objective_ps: 'Pashto',
    objective_fa: 'Persian',
    objective_pl: 'Polish',
    objective_pt: 'Portuguese (Brazilian)',
    'objective_pt-PT': 'Portuguese (European)',
    objective_pa: 'Punjabi',
    objective_ro: 'Romanian',
    objective_ru: 'Russian',
    objective_sm: 'Samoan',
    objective_gd: 'Scots Gaelic',
    objective_sr: 'Serbian',
    objective_st: 'Sesotho',
    objective_sn: 'Shona',
    objective_sd: 'Sindhi',
    objective_si: 'Sinhala (Sinhalese)',
    objective_sk: 'Slovak',
    objective_sl: 'Slovenian',
    objective_so: 'Somali',
    objective_es: 'Spanish',
    objective_su: 'Sundanese',
    objective_sw: 'Swahili',
    objective_sv: 'Swedish',
    objective_tl: 'Tagalog (Filipino)',
    objective_tg: 'Tajik',
    objective_ta: 'Tamil',
    objective_tt: 'Tatar',
    objective_te: 'Telugu',
    objective_th: 'Thai',
    objective_tr: 'Turkish',
    objective_tk: 'Turkmen',
    objective_uk: 'Ukrainian',
    objective_ur: 'Urdu',
    objective_ug: 'Uyghur',
    objective_uz: 'Uzbek',
    objective_vi: 'Vietnamese',
    objective_cy: 'Welsh',
    objective_xh: 'Xhosa',
    objective_yi: 'Yiddish',
    objective_yo: 'Yoruba',
    objective_zu: 'Zulu',
};

;// ../browser-i18n/dist/esm/uk.js
const uk = {
    nominative_af: 'африкаанс',
    nominative_sq: 'албанська',
    nominative_am: 'амхарська',
    nominative_ar: 'арабська',
    nominative_hy: 'вірменська',
    nominative_hyw: 'вірменська (західна)',
    nominative_az: 'азербайджанська',
    nominative_eu: 'баскська',
    nominative_be: 'білоруська',
    nominative_bn: 'бенгальська',
    nominative_bs: 'боснійська',
    nominative_bg: 'болгарська',
    nominative_ca: 'каталонська',
    nominative_zh: 'китайська (спрощена)',
    'nominative_zh-TW': 'китайська (традиційна)',
    nominative_co: 'корсиканська',
    nominative_hr: 'хорватська',
    nominative_cs: 'чеська',
    nominative_da: 'данська',
    nominative_nl: 'нідерландська',
    nominative_en: 'англійська (США)',
    'nominative_en-GB': 'англійська (британська)',
    nominative_eo: 'есперанто',
    nominative_et: 'естонська',
    nominative_fi: 'фінська',
    nominative_fr: 'французька',
    nominative_fy: 'фризька',
    nominative_gl: 'галісійська',
    nominative_ka: 'грузинська',
    nominative_de: 'німецька',
    nominative_el: 'грецька',
    nominative_gu: 'гуджараті',
    nominative_ht: 'гаїтянська креольська',
    nominative_ha: 'хауса',
    nominative_haw: 'гавайська',
    nominative_he: 'іврит',
    nominative_hi: 'гінді',
    nominative_hmn: 'хмонг',
    nominative_hu: 'угорська',
    nominative_is: 'ісландська',
    nominative_ig: 'ігбо',
    nominative_id: 'індонезійська',
    nominative_ga: 'ірландська',
    nominative_it: 'італійська',
    nominative_ja: 'японська',
    nominative_jv: 'яванська',
    nominative_kn: 'каннада',
    nominative_kk: 'казахська',
    nominative_km: 'кхмерська',
    nominative_rw: 'кіньяруанда',
    nominative_ko: 'корейська',
    nominative_ku: 'курдська',
    nominative_ky: 'киргизька',
    nominative_lo: 'лаоська',
    nominative_lv: 'латвійська',
    nominative_lt: 'литовська',
    nominative_lb: 'люксембурзька',
    nominative_mk: 'македонська',
    nominative_mg: 'малагасійська',
    nominative_ms: 'малайська',
    nominative_ml: 'малаялам',
    nominative_mt: 'мальтійська',
    nominative_mi: 'маорі',
    nominative_mr: 'маратхі',
    nominative_mn: 'монгольська',
    nominative_my: "м'янма (бірманська)",
    nominative_ne: 'непальська',
    nominative_no: 'норвезька',
    nominative_ny: 'ньянджа (чічева)',
    nominative_or: 'одіа (орія)',
    nominative_ps: 'пушту',
    nominative_fa: 'перська',
    nominative_pl: 'польська',
    nominative_pt: 'португальська (бразильська)',
    'nominative_pt-PT': 'португальська (європейська)',
    nominative_pa: 'панджабська',
    nominative_ro: 'румунська',
    nominative_ru: 'російська',
    nominative_sm: 'самоанська',
    nominative_gd: 'шотландська гельська',
    nominative_sr: 'сербська',
    nominative_st: 'сесото',
    nominative_sn: 'шона',
    nominative_sd: 'сіндхі',
    nominative_si: 'сингальська',
    nominative_sk: 'словацька',
    nominative_sl: 'словенська',
    nominative_so: 'сомалійська',
    nominative_es: 'іспанська',
    nominative_su: 'сунданська',
    nominative_sw: 'суахілі',
    nominative_sv: 'шведська',
    nominative_tl: 'тагальська (філіппінська)',
    nominative_tg: 'таджицька',
    nominative_ta: 'тамільська',
    nominative_tt: 'татарська',
    nominative_te: 'телугу',
    nominative_th: 'тайська',
    nominative_tr: 'турецька',
    nominative_tk: 'туркменська',
    nominative_uk: 'українська',
    nominative_ur: 'урду',
    nominative_ug: 'уйгурська',
    nominative_uz: 'узбецька',
    nominative_vi: "в'єтнамська",
    nominative_cy: 'валлійська',
    nominative_xh: 'коса',
    nominative_yi: 'їдиш',
    nominative_yo: 'йоруба',
    nominative_zu: 'зулу',
    //
    objective_af: 'африкаанс',
    objective_sq: 'албанські',
    objective_am: 'амхарські',
    objective_ar: 'арабські',
    objective_hy: 'вірменські',
    objective_hyw: 'вірменські (західні)',
    objective_az: 'азербайджанські',
    objective_eu: 'баскські',
    objective_be: 'білоруські',
    objective_bn: 'бенгальські',
    objective_bs: 'боснійські',
    objective_bg: 'болгарські',
    objective_ca: 'каталонські',
    objective_zh: 'китайські (спрощені)',
    'objective_zh-TW': 'китайські (традиційні)',
    objective_co: 'корсиканські',
    objective_hr: 'хорватські',
    objective_cs: 'чеські',
    objective_da: 'данські',
    objective_nl: 'нідерландські',
    objective_en: 'англійські (США)',
    'objective_en-GB': 'англійські (британські)',
    objective_eo: 'есперанто',
    objective_et: 'естонські',
    objective_fi: 'фінські',
    objective_fr: 'французькі',
    objective_fy: 'фризькі',
    objective_gl: 'галісійські',
    objective_ka: 'грузинські',
    objective_de: 'німецькі',
    objective_el: 'грецькі',
    objective_gu: 'гуджараті',
    objective_ht: 'гаїтянські креольські',
    objective_ha: 'хауса',
    objective_haw: 'гавайські',
    objective_he: 'іврит',
    objective_hi: 'гінді',
    objective_hmn: 'хмонг',
    objective_hu: 'угорські',
    objective_is: 'ісландські',
    objective_ig: 'ігбо',
    objective_id: 'індонезійські',
    objective_ga: 'ірландські',
    objective_it: 'італійські',
    objective_ja: 'японські',
    objective_jv: 'яванські',
    objective_kn: 'каннада',
    objective_kk: 'казахські',
    objective_km: 'кхмерські',
    objective_rw: 'кіньяруанда',
    objective_ko: 'корейські',
    objective_ku: 'курдські',
    objective_ky: 'киргизькі',
    objective_lo: 'лаоські',
    objective_lv: 'латвійські',
    objective_lt: 'литовські',
    objective_lb: 'люксембурзькі',
    objective_mk: 'македонські',
    objective_mg: 'малагасійські',
    objective_ms: 'малайські',
    objective_ml: 'малаялам',
    objective_mt: 'мальтійські',
    objective_mi: 'маорі',
    objective_mr: 'маратхі',
    objective_mn: 'монгольські',
    objective_my: "м'янма (бірманські)",
    objective_ne: 'непальські',
    objective_no: 'норвезькі',
    objective_ny: 'ньянджа (чічева)',
    objective_or: 'одіа (орія)',
    objective_ps: 'пушту',
    objective_fa: 'перські',
    objective_pl: 'польські',
    objective_pt: 'португальські (бразильські)',
    'objective_pt-PT': 'португальські (європейські)',
    objective_pa: 'панджабські',
    objective_ro: 'румунські',
    objective_ru: 'російські',
    objective_sm: 'самоанські',
    objective_gd: 'шотландські гельські',
    objective_sr: 'сербські',
    objective_st: 'сесото',
    objective_sn: 'шона',
    objective_sd: 'сіндхі',
    objective_si: 'сингальські',
    objective_sk: 'словацькі',
    objective_sl: 'словенські',
    objective_so: 'сомалійські',
    objective_es: 'іспанські',
    objective_su: 'сунданські',
    objective_sw: 'суахілі',
    objective_sv: 'шведські',
    objective_tl: 'тагальські (філіппінські)',
    objective_tg: 'таджицькі',
    objective_ta: 'тамільські',
    objective_tt: 'татарські',
    objective_te: 'телугу',
    objective_th: 'тайські',
    objective_tr: 'турецькі',
    objective_tk: 'туркменські',
    objective_uk: 'українські',
    objective_ur: 'урду',
    objective_ug: 'уйгурські',
    objective_uz: 'узбецькі',
    objective_vi: "в'єтнамські",
    objective_cy: 'валлійські',
    objective_xh: 'коса',
    objective_yi: 'їдиш',
    objective_yo: 'йоруба',
    objective_zu: 'зулу',
};

;// ../browser-i18n/dist/esm/vi.js
const vi_vi = {
    nominative_af: 'tiếng Afrikaans',
    nominative_sq: 'tiếng Albania',
    nominative_am: 'tiếng Amharic',
    nominative_ar: 'tiếng Ả Rập',
    nominative_hy: 'tiếng Armenia',
    nominative_hyw: 'tiếng Armenia (Tây)',
    nominative_az: 'tiếng Azerbaijan',
    nominative_eu: 'tiếng Basque',
    nominative_be: 'tiếng Belarus',
    nominative_bn: 'tiếng Bengal',
    nominative_bs: 'tiếng Bosnia',
    nominative_bg: 'tiếng Bulgaria',
    nominative_ca: 'tiếng Catalan',
    nominative_zh: 'tiếng Trung (Giản thể)',
    'nominative_zh-TW': 'tiếng Trung (Phồn thể)',
    nominative_co: 'tiếng Corsica',
    nominative_hr: 'tiếng Croatia',
    nominative_cs: 'tiếng Séc',
    nominative_da: 'tiếng Đan Mạch',
    nominative_nl: 'tiếng Hà Lan',
    nominative_en: 'tiếng Anh (Mỹ)',
    'nominative_en-GB': 'tiếng Anh (Anh)',
    nominative_eo: 'tiếng Esperanto',
    nominative_et: 'tiếng Estonia',
    nominative_fi: 'tiếng Phần Lan',
    nominative_fr: 'tiếng Pháp',
    nominative_fy: 'tiếng Frisian',
    nominative_gl: 'tiếng Galicia',
    nominative_ka: 'tiếng Georgia',
    nominative_de: 'tiếng Đức',
    nominative_el: 'tiếng Hy Lạp',
    nominative_gu: 'tiếng Gujarati',
    nominative_ht: 'tiếng Creole Haiti',
    nominative_ha: 'tiếng Hausa',
    nominative_haw: 'tiếng Hawaii',
    nominative_he: 'tiếng Do Thái',
    nominative_hi: 'tiếng Hindi',
    nominative_hmn: 'tiếng Hmong',
    nominative_hu: 'tiếng Hungary',
    nominative_is: 'tiếng Iceland',
    nominative_ig: 'tiếng Igbo',
    nominative_id: 'tiếng Indonesia',
    nominative_ga: 'tiếng Ireland',
    nominative_it: 'tiếng Ý',
    nominative_ja: 'tiếng Nhật',
    nominative_jv: 'tiếng Java',
    nominative_kn: 'tiếng Kannada',
    nominative_kk: 'tiếng Kazakhstan',
    nominative_km: 'tiếng Khmer',
    nominative_rw: 'tiếng Kinyarwanda',
    nominative_ko: 'tiếng Hàn',
    nominative_ku: 'tiếng Kurd',
    nominative_ky: 'tiếng Kyrgyz',
    nominative_lo: 'tiếng Lào',
    nominative_lv: 'tiếng Latvia',
    nominative_lt: 'tiếng Litva',
    nominative_lb: 'tiếng Luxembourg',
    nominative_mk: 'tiếng Macedonia',
    nominative_mg: 'tiếng Malagasy',
    nominative_ms: 'tiếng Mã Lai',
    nominative_ml: 'tiếng Malayalam',
    nominative_mt: 'tiếng Malta',
    nominative_mi: 'tiếng Maori',
    nominative_mr: 'tiếng Marathi',
    nominative_mn: 'tiếng Mông Cổ',
    nominative_my: 'tiếng Myanmar (Miến Điện)',
    nominative_ne: 'tiếng Nepal',
    nominative_no: 'tiếng Na Uy',
    nominative_ny: 'tiếng Nyanja (Chichewa)',
    nominative_or: 'tiếng Odia (Oriya)',
    nominative_ps: 'tiếng Pashto',
    nominative_fa: 'tiếng Ba Tư',
    nominative_pl: 'tiếng Ba Lan',
    nominative_pt: 'tiếng Bồ Đào Nha (Brazil)',
    'nominative_pt-PT': 'tiếng Bồ Đào Nha (châu Âu)',
    nominative_pa: 'tiếng Punjab',
    nominative_ro: 'tiếng Romania',
    nominative_ru: 'tiếng Nga',
    nominative_sm: 'tiếng Samoa',
    nominative_gd: 'tiếng Gaelic Scotland',
    nominative_sr: 'tiếng Serbia',
    nominative_st: 'tiếng Sesotho',
    nominative_sn: 'tiếng Shona',
    nominative_sd: 'tiếng Sindhi',
    nominative_si: 'tiếng Sinhala',
    nominative_sk: 'tiếng Slovak',
    nominative_sl: 'tiếng Slovenia',
    nominative_so: 'tiếng Somalia',
    nominative_es: 'tiếng Tây Ban Nha',
    nominative_su: 'tiếng Sunda',
    nominative_sw: 'tiếng Swahili',
    nominative_sv: 'tiếng Thụy Điển',
    nominative_tl: 'tiếng Tagalog (Philippines)',
    nominative_tg: 'tiếng Tajik',
    nominative_ta: 'tiếng Tamil',
    nominative_tt: 'tiếng Tatar',
    nominative_te: 'tiếng Telugu',
    nominative_th: 'tiếng Thái',
    nominative_tr: 'tiếng Thổ Nhĩ Kỳ',
    nominative_tk: 'tiếng Turkmen',
    nominative_uk: 'tiếng Ukraina',
    nominative_ur: 'tiếng Urdu',
    nominative_ug: 'tiếng Uyghur',
    nominative_uz: 'tiếng Uzbek',
    nominative_vi: 'tiếng Việt',
    nominative_cy: 'tiếng Wales',
    nominative_xh: 'tiếng Xhosa',
    nominative_yi: 'tiếng Yiddish',
    nominative_yo: 'tiếng Yoruba',
    nominative_zu: 'tiếng Zulu',
    //
    objective_af: 'tiếng Afrikaans',
    objective_sq: 'tiếng Albania',
    objective_am: 'tiếng Amharic',
    objective_ar: 'tiếng Ả Rập',
    objective_hy: 'tiếng Armenia',
    objective_hyw: 'tiếng Armenia (Tây)',
    objective_az: 'tiếng Azerbaijan',
    objective_eu: 'tiếng Basque',
    objective_be: 'tiếng Belarus',
    objective_bn: 'tiếng Bengal',
    objective_bs: 'tiếng Bosnia',
    objective_bg: 'tiếng Bulgaria',
    objective_ca: 'tiếng Catalan',
    objective_zh: 'tiếng Trung (Giản thể)',
    'objective_zh-TW': 'tiếng Trung (Phồn thể)',
    objective_co: 'tiếng Corsica',
    objective_hr: 'tiếng Croatia',
    objective_cs: 'tiếng Séc',
    objective_da: 'tiếng Đan Mạch',
    objective_nl: 'tiếng Hà Lan',
    objective_en: 'tiếng Anh (Mỹ)',
    'objective_en-GB': 'tiếng Anh (Anh)',
    objective_eo: 'tiếng Esperanto',
    objective_et: 'tiếng Estonia',
    objective_fi: 'tiếng Phần Lan',
    objective_fr: 'tiếng Pháp',
    objective_fy: 'tiếng Frisian',
    objective_gl: 'tiếng Galicia',
    objective_ka: 'tiếng Georgia',
    objective_de: 'tiếng Đức',
    objective_el: 'tiếng Hy Lạp',
    objective_gu: 'tiếng Gujarati',
    objective_ht: 'tiếng Creole Haiti',
    objective_ha: 'tiếng Hausa',
    objective_haw: 'tiếng Hawaii',
    objective_he: 'tiếng Do Thái',
    objective_hi: 'tiếng Hindi',
    objective_hmn: 'tiếng Hmong',
    objective_hu: 'tiếng Hungary',
    objective_is: 'tiếng Iceland',
    objective_ig: 'tiếng Igbo',
    objective_id: 'tiếng Indonesia',
    objective_ga: 'tiếng Ireland',
    objective_it: 'tiếng Ý',
    objective_ja: 'tiếng Nhật',
    objective_jv: 'tiếng Java',
    objective_kn: 'tiếng Kannada',
    objective_kk: 'tiếng Kazakhstan',
    objective_km: 'tiếng Khmer',
    objective_rw: 'tiếng Kinyarwanda',
    objective_ko: 'tiếng Hàn',
    objective_ku: 'tiếng Kurd',
    objective_ky: 'tiếng Kyrgyz',
    objective_lo: 'tiếng Lào',
    objective_lv: 'tiếng Latvia',
    objective_lt: 'tiếng Litva',
    objective_lb: 'tiếng Luxembourg',
    objective_mk: 'tiếng Macedonia',
    objective_mg: 'tiếng Malagasy',
    objective_ms: 'tiếng Mã Lai',
    objective_ml: 'tiếng Malayalam',
    objective_mt: 'tiếng Malta',
    objective_mi: 'tiếng Maori',
    objective_mr: 'tiếng Marathi',
    objective_mn: 'tiếng Mông Cổ',
    objective_my: 'tiếng Myanmar (Miến Điện)',
    objective_ne: 'tiếng Nepal',
    objective_no: 'tiếng Na Uy',
    objective_ny: 'tiếng Nyanja (Chichewa)',
    objective_or: 'tiếng Odia (Oriya)',
    objective_ps: 'tiếng Pashto',
    objective_fa: 'tiếng Ba Tư',
    objective_pl: 'tiếng Ba Lan',
    objective_pt: 'tiếng Bồ Đào Nha (Brazil)',
    'objective_pt-PT': 'tiếng Bồ Đào Nha (châu Âu)',
    objective_pa: 'tiếng Punjab',
    objective_ro: 'tiếng Romania',
    objective_ru: 'tiếng Nga',
    objective_sm: 'tiếng Samoa',
    objective_gd: 'tiếng Gaelic Scotland',
    objective_sr: 'tiếng Serbia',
    objective_st: 'tiếng Sesotho',
    objective_sn: 'tiếng Shona',
    objective_sd: 'tiếng Sindhi',
    objective_si: 'tiếng Sinhala',
    objective_sk: 'tiếng Slovak',
    objective_sl: 'tiếng Slovenia',
    objective_so: 'tiếng Somalia',
    objective_es: 'tiếng Tây Ban Nha',
    objective_su: 'tiếng Sunda',
    objective_sw: 'tiếng Swahili',
    objective_sv: 'tiếng Thụy Điển',
    objective_tl: 'tiếng Tagalog (Philippines)',
    objective_tg: 'tiếng Tajik',
    objective_ta: 'tiếng Tamil',
    objective_tt: 'tiếng Tatar',
    objective_te: 'tiếng Telugu',
    objective_th: 'tiếng Thái',
    objective_tr: 'tiếng Thổ Nhĩ Kỳ',
    objective_tk: 'tiếng Turkmen',
    objective_uk: 'tiếng Ukraina',
    objective_ur: 'tiếng Urdu',
    objective_ug: 'tiếng Uyghur',
    objective_uz: 'tiếng Uzbek',
    objective_vi: 'tiếng Việt',
    objective_cy: 'tiếng Wales',
    objective_xh: 'tiếng Xhosa',
    objective_yi: 'tiếng Yiddish',
    objective_yo: 'tiếng Yoruba',
    objective_zu: 'tiếng Zulu',
};

;// ../browser-i18n/dist/esm/tr.js
const tr_tr = {
    nominative_af: 'Afrikaanca',
    nominative_sq: 'Arnavutça',
    nominative_am: 'Amharca',
    nominative_ar: 'Arapça',
    nominative_hy: 'Ermenice',
    nominative_hyw: 'Ermenice (Batı)',
    nominative_az: 'Azerbaycanca',
    nominative_eu: 'Baskça',
    nominative_be: 'Beyaz Rusça',
    nominative_bn: 'Bengalce',
    nominative_bs: 'Boşnakça',
    nominative_bg: 'Bulgarca',
    nominative_ca: 'Katalanca',
    nominative_zh: 'Çince (Basitleştirilmiş)',
    'nominative_zh-TW': 'Çince (Geleneksel)',
    nominative_co: 'Korsikaca',
    nominative_hr: 'Hırvatça',
    nominative_cs: 'Çekçe',
    nominative_da: 'Danca',
    nominative_nl: 'Felemenkçe',
    nominative_en: 'İngilizce (ABD)',
    'nominative_en-GB': 'İngilizce (Britanya)',
    nominative_eo: 'Esperanto',
    nominative_et: 'Estonca',
    nominative_fi: 'Fince',
    nominative_fr: 'Fransızca',
    nominative_fy: 'Frizce',
    nominative_gl: 'Galiçyaca',
    nominative_ka: 'Gürcüce',
    nominative_de: 'Almanca',
    nominative_el: 'Yunanca',
    nominative_gu: 'Güceratça',
    nominative_ht: 'Haiti Kreolcesi',
    nominative_ha: 'Hausa',
    nominative_haw: 'Hawaiice',
    nominative_he: 'İbranice',
    nominative_hi: 'Hintçe',
    nominative_hmn: 'Hmong',
    nominative_hu: 'Macarca',
    nominative_is: 'İzlandaca',
    nominative_ig: 'İgbo',
    nominative_id: 'Endonezce',
    nominative_ga: 'İrlandaca',
    nominative_it: 'İtalyanca',
    nominative_ja: 'Japonca',
    nominative_jv: 'Cava Dili',
    nominative_kn: 'Kannada',
    nominative_kk: 'Kazakça',
    nominative_km: 'Khmerce',
    nominative_rw: 'Kinyarwanda',
    nominative_ko: 'Korece',
    nominative_ku: 'Kürtçe',
    nominative_ky: 'Kırgızca',
    nominative_lo: 'Laoca',
    nominative_lv: 'Letonca',
    nominative_lt: 'Litvanca',
    nominative_lb: 'Lüksemburgca',
    nominative_mk: 'Makedonca',
    nominative_mg: 'Malgaşça',
    nominative_ms: 'Malayca',
    nominative_ml: 'Malayalamca',
    nominative_mt: 'Maltaca',
    nominative_mi: 'Maori',
    nominative_mr: 'Marathi',
    nominative_mn: 'Moğolca',
    nominative_my: 'Myanmarca (Birmanca)',
    nominative_ne: 'Nepalce',
    nominative_no: 'Norveçce',
    nominative_ny: 'Nyanja (Chichewa)',
    nominative_or: 'Odia (Oriya)',
    nominative_ps: 'Peştuca',
    nominative_fa: 'Farsça',
    nominative_pl: 'Lehçe',
    nominative_pt: 'Portekizce (Brezilya)',
    'nominative_pt-PT': 'Portekizce (Avrupa)',
    nominative_pa: 'Pencapça',
    nominative_ro: 'Romence',
    nominative_ru: 'Rusça',
    nominative_sm: 'Samoaca',
    nominative_gd: 'İskoç Gaelcesi',
    nominative_sr: 'Sırpça',
    nominative_st: 'Sesotho',
    nominative_sn: 'Shona',
    nominative_sd: 'Sindhi',
    nominative_si: 'Sinhala',
    nominative_sk: 'Slovakça',
    nominative_sl: 'Slovence',
    nominative_so: 'Somalice',
    nominative_es: 'İspanyolca',
    nominative_su: 'Sundanca',
    nominative_sw: 'Swahili',
    nominative_sv: 'İsveççe',
    nominative_tl: 'Tagalogca (Filipince)',
    nominative_tg: 'Tacikçe',
    nominative_ta: 'Tamilce',
    nominative_tt: 'Tatarca',
    nominative_te: 'Telugu',
    nominative_th: 'Tayca',
    nominative_tr: 'Türkçe',
    nominative_tk: 'Türkmence',
    nominative_uk: 'Ukraynaca',
    nominative_ur: 'Urduca',
    nominative_ug: 'Uygurca',
    nominative_uz: 'Özbekçe',
    nominative_vi: 'Vietnamca',
    nominative_cy: 'Galce',
    nominative_xh: 'Xhosa',
    nominative_yi: 'Yidiş',
    nominative_yo: 'Yoruba',
    nominative_zu: 'Zuluca',
    //
    objective_af: 'Afrikaanca',
    objective_sq: 'Arnavutça',
    objective_am: 'Amharca',
    objective_ar: 'Arapça',
    objective_hy: 'Ermenice',
    objective_hyw: 'Ermenice (Batı)',
    objective_az: 'Azerbaycanca',
    objective_eu: 'Baskça',
    objective_be: 'Beyaz Rusça',
    objective_bn: 'Bengalce',
    objective_bs: 'Boşnakça',
    objective_bg: 'Bulgarca',
    objective_ca: 'Katalanca',
    objective_zh: 'Çince (Basitleştirilmiş)',
    'objective_zh-TW': 'Çince (Geleneksel)',
    objective_co: 'Korsikaca',
    objective_hr: 'Hırvatça',
    objective_cs: 'Çekçe',
    objective_da: 'Danca',
    objective_nl: 'Felemenkçe',
    objective_en: 'İngilizce (ABD)',
    'objective_en-GB': 'İngilizce (Britanya)',
    objective_eo: 'Esperanto',
    objective_et: 'Estonca',
    objective_fi: 'Fince',
    objective_fr: 'Fransızca',
    objective_fy: 'Frizce',
    objective_gl: 'Galiçyaca',
    objective_ka: 'Gürcüce',
    objective_de: 'Almanca',
    objective_el: 'Yunanca',
    objective_gu: 'Güceratça',
    objective_ht: 'Haiti Kreolcesi',
    objective_ha: 'Hausa',
    objective_haw: 'Hawaiice',
    objective_he: 'İbranice',
    objective_hi: 'Hintçe',
    objective_hmn: 'Hmong',
    objective_hu: 'Macarca',
    objective_is: 'İzlandaca',
    objective_ig: 'İgbo',
    objective_id: 'Endonezce',
    objective_ga: 'İrlandaca',
    objective_it: 'İtalyanca',
    objective_ja: 'Japonca',
    objective_jv: 'Cava Dili',
    objective_kn: 'Kannada',
    objective_kk: 'Kazakça',
    objective_km: 'Khmerce',
    objective_rw: 'Kinyarwanda',
    objective_ko: 'Korece',
    objective_ku: 'Kürtçe',
    objective_ky: 'Kırgızca',
    objective_lo: 'Laoca',
    objective_lv: 'Letonca',
    objective_lt: 'Litvanca',
    objective_lb: 'Lüksemburgca',
    objective_mk: 'Makedonca',
    objective_mg: 'Malgaşça',
    objective_ms: 'Malayca',
    objective_ml: 'Malayalamca',
    objective_mt: 'Maltaca',
    objective_mi: 'Maori',
    objective_mr: 'Marathi',
    objective_mn: 'Moğolca',
    objective_my: 'Myanmarca (Birmanca)',
    objective_ne: 'Nepalce',
    objective_no: 'Norveçce',
    objective_ny: 'Nyanja (Chichewa)',
    objective_or: 'Odia (Oriya)',
    objective_ps: 'Peştuca',
    objective_fa: 'Farsça',
    objective_pl: 'Lehçe',
    objective_pt: 'Portekizce (Brezilya)',
    'objective_pt-PT': 'Portekizce (Avrupa)',
    objective_pa: 'Pencapça',
    objective_ro: 'Romence',
    objective_ru: 'Rusça',
    objective_sm: 'Samoaca',
    objective_gd: 'İskoç Gaelcesi',
    objective_sr: 'Sırpça',
    objective_st: 'Sesotho',
    objective_sn: 'Shona',
    objective_sd: 'Sindhi',
    objective_si: 'Sinhala',
    objective_sk: 'Slovakça',
    objective_sl: 'Slovence',
    objective_so: 'Somalice',
    objective_es: 'İspanyolca',
    objective_su: 'Sundanca',
    objective_sw: 'Swahili',
    objective_sv: 'İsveççe',
    objective_tl: 'Tagalogca (Filipince)',
    objective_tg: 'Tacikçe',
    objective_ta: 'Tamilce',
    objective_tt: 'Tatarca',
    objective_te: 'Telugu',
    objective_th: 'Tayca',
    objective_tr: 'Türkçe',
    objective_tk: 'Türkmence',
    objective_uk: 'Ukraynaca',
    objective_ur: 'Urduca',
    objective_ug: 'Uygurca',
    objective_uz: 'Özbekçe',
    objective_vi: 'Vietnamca',
    objective_cy: 'Galce',
    objective_xh: 'Xhosa',
    objective_yi: 'Yidiş',
    objective_yo: 'Yoruba',
    objective_zu: 'Zuluca',
};

;// ../browser-i18n/dist/esm/es.js
const es_es = {
    nominative_af: 'afrikáans',
    nominative_sq: 'albanés',
    nominative_am: 'amhárico',
    nominative_ar: 'árabe',
    nominative_hy: 'armenio',
    nominative_hyw: 'armenio (occidental)',
    nominative_az: 'azerbaiyano',
    nominative_eu: 'vasco',
    nominative_be: 'bielorruso',
    nominative_bn: 'bengalí',
    nominative_bs: 'bosnio',
    nominative_bg: 'búlgaro',
    nominative_ca: 'catalán',
    nominative_zh: 'chino (simplificado)',
    'nominative_zh-TW': 'chino (tradicional)',
    nominative_co: 'corso',
    nominative_hr: 'croata',
    nominative_cs: 'checo',
    nominative_da: 'danés',
    nominative_nl: 'neerlandés',
    nominative_en: 'inglés (EE. UU.)',
    'nominative_en-GB': 'inglés (británico)',
    nominative_eo: 'esperanto',
    nominative_et: 'estonio',
    nominative_fi: 'finlandés',
    nominative_fr: 'francés',
    nominative_fy: 'frisón',
    nominative_gl: 'gallego',
    nominative_ka: 'georgiano',
    nominative_de: 'alemán',
    nominative_el: 'griego',
    nominative_gu: 'gujarati',
    nominative_ht: 'criollo haitiano',
    nominative_ha: 'hausa',
    nominative_haw: 'hawaiano',
    nominative_he: 'hebreo',
    nominative_hi: 'hindi',
    nominative_hmn: 'hmong',
    nominative_hu: 'húngaro',
    nominative_is: 'islandés',
    nominative_ig: 'igbo',
    nominative_id: 'indonesio',
    nominative_ga: 'irlandés',
    nominative_it: 'italiano',
    nominative_ja: 'japonés',
    nominative_jv: 'javanés',
    nominative_kn: 'canarés',
    nominative_kk: 'kazajo',
    nominative_km: 'jemer',
    nominative_rw: 'kinyarwanda',
    nominative_ko: 'coreano',
    nominative_ku: 'kurdo',
    nominative_ky: 'kirguís',
    nominative_lo: 'lao',
    nominative_lv: 'letón',
    nominative_lt: 'lituano',
    nominative_lb: 'luxemburgués',
    nominative_mk: 'macedonio',
    nominative_mg: 'malgache',
    nominative_ms: 'malayo',
    nominative_ml: 'malayalam',
    nominative_mt: 'maltés',
    nominative_mi: 'maorí',
    nominative_mr: 'marathi',
    nominative_mn: 'mongol',
    nominative_my: 'birmano',
    nominative_ne: 'nepalés',
    nominative_no: 'noruego',
    nominative_ny: 'nyanja (chichewa)',
    nominative_or: 'odia',
    nominative_ps: 'pastún',
    nominative_fa: 'persa',
    nominative_pl: 'polaco',
    nominative_pt: 'portugués (Brasil)',
    'nominative_pt-PT': 'portugués (europeo)',
    nominative_pa: 'punjabi',
    nominative_ro: 'rumano',
    nominative_ru: 'ruso',
    nominative_sm: 'samoano',
    nominative_gd: 'gaélico escocés',
    nominative_sr: 'serbio',
    nominative_st: 'sesoto',
    nominative_sn: 'shona',
    nominative_sd: 'sindhi',
    nominative_si: 'cingalés',
    nominative_sk: 'eslovaco',
    nominative_sl: 'esloveno',
    nominative_so: 'somalí',
    nominative_es: 'español',
    nominative_su: 'sundanés',
    nominative_sw: 'suajili',
    nominative_sv: 'sueco',
    nominative_tl: 'tagalo (filipino)',
    nominative_tg: 'tayiko',
    nominative_ta: 'tamil',
    nominative_tt: 'tártaro',
    nominative_te: 'telugu',
    nominative_th: 'tailandés',
    nominative_tr: 'turco',
    nominative_tk: 'turcomano',
    nominative_uk: 'ucraniano',
    nominative_ur: 'urdu',
    nominative_ug: 'uigur',
    nominative_uz: 'uzbeko',
    nominative_vi: 'vietnamita',
    nominative_cy: 'galés',
    nominative_xh: 'xhosa',
    nominative_yi: 'yídish',
    nominative_yo: 'yoruba',
    nominative_zu: 'zulú',
    //
    objective_af: 'afrikáans',
    objective_sq: 'albanés',
    objective_am: 'amhárico',
    objective_ar: 'árabe',
    objective_hy: 'armenio',
    objective_hyw: 'armenio (occidental)',
    objective_az: 'azerbaiyano',
    objective_eu: 'vasco',
    objective_be: 'bielorruso',
    objective_bn: 'bengalí',
    objective_bs: 'bosnio',
    objective_bg: 'búlgaro',
    objective_ca: 'catalán',
    objective_zh: 'chino (simplificado)',
    'objective_zh-TW': 'chino (tradicional)',
    objective_co: 'corso',
    objective_hr: 'croata',
    objective_cs: 'checo',
    objective_da: 'danés',
    objective_nl: 'neerlandés',
    objective_en: 'inglés (EE. UU.)',
    'objective_en-GB': 'inglés (británico)',
    objective_eo: 'esperanto',
    objective_et: 'estonio',
    objective_fi: 'finlandés',
    objective_fr: 'francés',
    objective_fy: 'frisón',
    objective_gl: 'gallego',
    objective_ka: 'georgiano',
    objective_de: 'alemán',
    objective_el: 'griego',
    objective_gu: 'gujarati',
    objective_ht: 'criollo haitiano',
    objective_ha: 'hausa',
    objective_haw: 'hawaiano',
    objective_he: 'hebreo',
    objective_hi: 'hindi',
    objective_hmn: 'hmong',
    objective_hu: 'húngaro',
    objective_is: 'islandés',
    objective_ig: 'igbo',
    objective_id: 'indonesio',
    objective_ga: 'irlandés',
    objective_it: 'italiano',
    objective_ja: 'japonés',
    objective_jv: 'javanés',
    objective_kn: 'canarés',
    objective_kk: 'kazajo',
    objective_km: 'jemer',
    objective_rw: 'kinyarwanda',
    objective_ko: 'coreano',
    objective_ku: 'kurdo',
    objective_ky: 'kirguís',
    objective_lo: 'lao',
    objective_lv: 'letón',
    objective_lt: 'lituano',
    objective_lb: 'luxemburgués',
    objective_mk: 'macedonio',
    objective_mg: 'malgache',
    objective_ms: 'malayo',
    objective_ml: 'malayalam',
    objective_mt: 'maltés',
    objective_mi: 'maorí',
    objective_mr: 'marathi',
    objective_mn: 'mongol',
    objective_my: 'birmano',
    objective_ne: 'nepalés',
    objective_no: 'noruego',
    objective_ny: 'nyanja (chichewa)',
    objective_or: 'odia',
    objective_ps: 'pastún',
    objective_fa: 'persa',
    objective_pl: 'polaco',
    objective_pt: 'portugués (Brasil)',
    'objective_pt-PT': 'portugués (europeo)',
    objective_pa: 'punjabi',
    objective_ro: 'rumano',
    objective_ru: 'ruso',
    objective_sm: 'samoano',
    objective_gd: 'gaélico escocés',
    objective_sr: 'serbio',
    objective_st: 'sesoto',
    objective_sn: 'shona',
    objective_sd: 'sindhi',
    objective_si: 'cingalés',
    objective_sk: 'eslovaco',
    objective_sl: 'esloveno',
    objective_so: 'somalí',
    objective_es: 'español',
    objective_su: 'sundanés',
    objective_sw: 'suajili',
    objective_sv: 'sueco',
    objective_tl: 'tagalo (filipino)',
    objective_tg: 'tayiko',
    objective_ta: 'tamil',
    objective_tt: 'tártaro',
    objective_te: 'telugu',
    objective_th: 'tailandés',
    objective_tr: 'turco',
    objective_tk: 'turcomano',
    objective_uk: 'ucraniano',
    objective_ur: 'urdu',
    objective_ug: 'uigur',
    objective_uz: 'uzbeko',
    objective_vi: 'vietnamita',
    objective_cy: 'galés',
    objective_xh: 'xhosa',
    objective_yi: 'yídish',
    objective_yo: 'yoruba',
    objective_zu: 'zulú',
};

;// ../browser-i18n/dist/esm/pt.js
const pt_pt = {
    nominative_af: 'africâner',
    nominative_sq: 'albanês',
    nominative_am: 'amárico',
    nominative_ar: 'árabe',
    nominative_hy: 'armênio',
    nominative_hyw: 'armênio (ocidental)',
    nominative_az: 'azerbaijano',
    nominative_eu: 'basco',
    nominative_be: 'bielorrusso',
    nominative_bn: 'bengali',
    nominative_bs: 'bósnio',
    nominative_bg: 'búlgaro',
    nominative_ca: 'catalão',
    nominative_zh: 'chinês (simplificado)',
    'nominative_zh-TW': 'chinês (tradicional)',
    nominative_co: 'corso',
    nominative_hr: 'croata',
    nominative_cs: 'tcheco',
    nominative_da: 'dinamarquês',
    nominative_nl: 'holandês',
    nominative_en: 'inglês (EUA)',
    'nominative_en-GB': 'inglês (britânico)',
    nominative_eo: 'esperanto',
    nominative_et: 'estoniano',
    nominative_fi: 'finlandês',
    nominative_fr: 'francês',
    nominative_fy: 'frísio',
    nominative_gl: 'galego',
    nominative_ka: 'georgiano',
    nominative_de: 'alemão',
    nominative_el: 'grego',
    nominative_gu: 'gujarati',
    nominative_ht: 'crioulo haitiano',
    nominative_ha: 'hauçá',
    nominative_haw: 'havaiano',
    nominative_he: 'hebraico',
    nominative_hi: 'hindi',
    nominative_hmn: 'hmong',
    nominative_hu: 'húngaro',
    nominative_is: 'islandês',
    nominative_ig: 'igbo',
    nominative_id: 'indonésio',
    nominative_ga: 'irlandês',
    nominative_it: 'italiano',
    nominative_ja: 'japonês',
    nominative_jv: 'javanês',
    nominative_kn: 'canarês',
    nominative_kk: 'cazaque',
    nominative_km: 'khmer',
    nominative_rw: 'kinyarwanda',
    nominative_ko: 'coreano',
    nominative_ku: 'curdo',
    nominative_ky: 'quirguiz',
    nominative_lo: 'laosiano',
    nominative_lv: 'letão',
    nominative_lt: 'lituano',
    nominative_lb: 'luxemburguês',
    nominative_mk: 'macedônio',
    nominative_mg: 'malgaxe',
    nominative_ms: 'malaio',
    nominative_ml: 'malaiala',
    nominative_mt: 'maltês',
    nominative_mi: 'maori',
    nominative_mr: 'marata',
    nominative_mn: 'mongol',
    nominative_my: 'birmanês',
    nominative_ne: 'nepalês',
    nominative_no: 'norueguês',
    nominative_ny: 'nianja (chichewa)',
    nominative_or: 'odia',
    nominative_ps: 'pashto',
    nominative_fa: 'persa',
    nominative_pl: 'polonês',
    nominative_pt: 'português (Brasil)',
    'nominative_pt-PT': 'português (europeu)',
    nominative_pa: 'punjabi',
    nominative_ro: 'romeno',
    nominative_ru: 'russo',
    nominative_sm: 'samoano',
    nominative_gd: 'gaélico escocês',
    nominative_sr: 'sérvio',
    nominative_st: 'sesoto',
    nominative_sn: 'shona',
    nominative_sd: 'sindhi',
    nominative_si: 'cingalês',
    nominative_sk: 'eslovaco',
    nominative_sl: 'esloveno',
    nominative_so: 'somali',
    nominative_es: 'espanhol',
    nominative_su: 'sundanês',
    nominative_sw: 'suaíli',
    nominative_sv: 'sueco',
    nominative_tl: 'tagalo (filipino)',
    nominative_tg: 'tadjique',
    nominative_ta: 'tâmil',
    nominative_tt: 'tártaro',
    nominative_te: 'télugo',
    nominative_th: 'tailandês',
    nominative_tr: 'turco',
    nominative_tk: 'turcomeno',
    nominative_uk: 'ucraniano',
    nominative_ur: 'urdu',
    nominative_ug: 'uigur',
    nominative_uz: 'uzbeque',
    nominative_vi: 'vietnamita',
    nominative_cy: 'galês',
    nominative_xh: 'xhosa',
    nominative_yi: 'iídiche',
    nominative_yo: 'ioruba',
    nominative_zu: 'zulu',
    //
    objective_af: 'africâner',
    objective_sq: 'albanês',
    objective_am: 'amárico',
    objective_ar: 'árabe',
    objective_hy: 'armênio',
    objective_hyw: 'armênio (ocidental)',
    objective_az: 'azerbaijano',
    objective_eu: 'basco',
    objective_be: 'bielorrusso',
    objective_bn: 'bengali',
    objective_bs: 'bósnio',
    objective_bg: 'búlgaro',
    objective_ca: 'catalão',
    objective_zh: 'chinês (simplificado)',
    'objective_zh-TW': 'chinês (tradicional)',
    objective_co: 'corso',
    objective_hr: 'croata',
    objective_cs: 'tcheco',
    objective_da: 'dinamarquês',
    objective_nl: 'holandês',
    objective_en: 'inglês (EUA)',
    'objective_en-GB': 'inglês (britânico)',
    objective_eo: 'esperanto',
    objective_et: 'estoniano',
    objective_fi: 'finlandês',
    objective_fr: 'francês',
    objective_fy: 'frísio',
    objective_gl: 'galego',
    objective_ka: 'georgiano',
    objective_de: 'alemão',
    objective_el: 'grego',
    objective_gu: 'gujarati',
    objective_ht: 'crioulo haitiano',
    objective_ha: 'hauçá',
    objective_haw: 'havaiano',
    objective_he: 'hebraico',
    objective_hi: 'hindi',
    objective_hmn: 'hmong',
    objective_hu: 'húngaro',
    objective_is: 'islandês',
    objective_ig: 'igbo',
    objective_id: 'indonésio',
    objective_ga: 'irlandês',
    objective_it: 'italiano',
    objective_ja: 'japonês',
    objective_jv: 'javanês',
    objective_kn: 'canarês',
    objective_kk: 'cazaque',
    objective_km: 'khmer',
    objective_rw: 'kinyarwanda',
    objective_ko: 'coreano',
    objective_ku: 'curdo',
    objective_ky: 'quirguiz',
    objective_lo: 'laosiano',
    objective_lv: 'letão',
    objective_lt: 'lituano',
    objective_lb: 'luxemburguês',
    objective_mk: 'macedônio',
    objective_mg: 'malgaxe',
    objective_ms: 'malaio',
    objective_ml: 'malaiala',
    objective_mt: 'maltês',
    objective_mi: 'maori',
    objective_mr: 'marata',
    objective_mn: 'mongol',
    objective_my: 'birmanês',
    objective_ne: 'nepalês',
    objective_no: 'norueguês',
    objective_ny: 'nianja (chichewa)',
    objective_or: 'odia',
    objective_ps: 'pashto',
    objective_fa: 'persa',
    objective_pl: 'polonês',
    objective_pt: 'português (Brasil)',
    'objective_pt-PT': 'português (europeu)',
    objective_pa: 'punjabi',
    objective_ro: 'romeno',
    objective_ru: 'russo',
    objective_sm: 'samoano',
    objective_gd: 'gaélico escocês',
    objective_sr: 'sérvio',
    objective_st: 'sesoto',
    objective_sn: 'shona',
    objective_sd: 'sindhi',
    objective_si: 'cingalês',
    objective_sk: 'eslovaco',
    objective_sl: 'esloveno',
    objective_so: 'somali',
    objective_es: 'espanhol',
    objective_su: 'sundanês',
    objective_sw: 'suaíli',
    objective_sv: 'sueco',
    objective_tl: 'tagalo (filipino)',
    objective_tg: 'tadjique',
    objective_ta: 'tâmil',
    objective_tt: 'tártaro',
    objective_te: 'télugo',
    objective_th: 'tailandês',
    objective_tr: 'turco',
    objective_tk: 'turcomeno',
    objective_uk: 'ucraniano',
    objective_ur: 'urdu',
    objective_ug: 'uigur',
    objective_uz: 'uzbeque',
    objective_vi: 'vietnamita',
    objective_cy: 'galês',
    objective_xh: 'xhosa',
    objective_yi: 'iídiche',
    objective_yo: 'ioruba',
    objective_zu: 'zulu',
};

;// ../browser-i18n/dist/esm/zh.js
const zh = {
    nominative_af: '南非荷兰语',
    nominative_sq: '阿尔巴尼亚语',
    nominative_am: '阿姆哈拉语',
    nominative_ar: '阿拉伯语',
    nominative_hy: '亚美尼亚语',
    nominative_hyw: '亚美尼亚语（西部）',
    nominative_az: '阿塞拜疆语',
    nominative_eu: '巴斯克语',
    nominative_be: '白俄罗斯语',
    nominative_bn: '孟加拉语',
    nominative_bs: '波斯尼亚语',
    nominative_bg: '保加利亚语',
    nominative_ca: '加泰罗尼亚语',
    nominative_zh: '中文（简体）',
    'nominative_zh-TW': '中文（繁体）',
    nominative_co: '科西嘉语',
    nominative_hr: '克罗地亚语',
    nominative_cs: '捷克语',
    nominative_da: '丹麦语',
    nominative_nl: '荷兰语',
    nominative_en: '英语（美国）',
    'nominative_en-GB': '英语（英国）',
    nominative_eo: '世界语',
    nominative_et: '爱沙尼亚语',
    nominative_fi: '芬兰语',
    nominative_fr: '法语',
    nominative_fy: '弗里斯兰语',
    nominative_gl: '加利西亚语',
    nominative_ka: '格鲁吉亚语',
    nominative_de: '德语',
    nominative_el: '希腊语',
    nominative_gu: '古吉拉特语',
    nominative_ht: '海地克里奥尔语',
    nominative_ha: '豪萨语',
    nominative_haw: '夏威夷语',
    nominative_he: '希伯来语',
    nominative_hi: '印地语',
    nominative_hmn: '苗语',
    nominative_hu: '匈牙利语',
    nominative_is: '冰岛语',
    nominative_ig: '伊博语',
    nominative_id: '印度尼西亚语',
    nominative_ga: '爱尔兰语',
    nominative_it: '意大利语',
    nominative_ja: '日语',
    nominative_jv: '爪哇语',
    nominative_kn: '卡纳达语',
    nominative_kk: '哈萨克语',
    nominative_km: '高棉语',
    nominative_rw: '卢旺达语',
    nominative_ko: '韩语',
    nominative_ku: '库尔德语',
    nominative_ky: '吉尔吉斯语',
    nominative_lo: '老挝语',
    nominative_lv: '拉脱维亚语',
    nominative_lt: '立陶宛语',
    nominative_lb: '卢森堡语',
    nominative_mk: '马其顿语',
    nominative_mg: '马尔加什语',
    nominative_ms: '马来语',
    nominative_ml: '马拉雅拉姆语',
    nominative_mt: '马耳他语',
    nominative_mi: '毛利语',
    nominative_mr: '马拉地语',
    nominative_mn: '蒙古语',
    nominative_my: '缅甸语',
    nominative_ne: '尼泊尔语',
    nominative_no: '挪威语',
    nominative_ny: '齐切瓦语',
    nominative_or: '奥里亚语',
    nominative_ps: '普什图语',
    nominative_fa: '波斯语',
    nominative_pl: '波兰语',
    nominative_pt: '葡萄牙语（巴西）',
    'nominative_pt-PT': '葡萄牙语（欧洲）',
    nominative_pa: '旁遮普语',
    nominative_ro: '罗马尼亚语',
    nominative_ru: '俄语',
    nominative_sm: '萨摩亚语',
    nominative_gd: '苏格兰盖尔语',
    nominative_sr: '塞尔维亚语',
    nominative_st: '塞索托语',
    nominative_sn: '绍纳语',
    nominative_sd: '信德语',
    nominative_si: '僧伽罗语',
    nominative_sk: '斯洛伐克语',
    nominative_sl: '斯洛文尼亚语',
    nominative_so: '索马里语',
    nominative_es: '西班牙语',
    nominative_su: '巽他语',
    nominative_sw: '斯瓦希里语',
    nominative_sv: '瑞典语',
    nominative_tl: '他加禄语（菲律宾语）',
    nominative_tg: '塔吉克语',
    nominative_ta: '泰米尔语',
    nominative_tt: '鞑靼语',
    nominative_te: '泰卢固语',
    nominative_th: '泰语',
    nominative_tr: '土耳其语',
    nominative_tk: '土库曼语',
    nominative_uk: '乌克兰语',
    nominative_ur: '乌尔都语',
    nominative_ug: '维吾尔语',
    nominative_uz: '乌兹别克语',
    nominative_vi: '越南语',
    nominative_cy: '威尔士语',
    nominative_xh: '科萨语',
    nominative_yi: '意第绪语',
    nominative_yo: '约鲁巴语',
    nominative_zu: '祖鲁语',
    //
    objective_af: '南非荷兰语',
    objective_sq: '阿尔巴尼亚语',
    objective_am: '阿姆哈拉语',
    objective_ar: '阿拉伯语',
    objective_hy: '亚美尼亚语',
    objective_hyw: '亚美尼亚语（西部）',
    objective_az: '阿塞拜疆语',
    objective_eu: '巴斯克语',
    objective_be: '白俄罗斯语',
    objective_bn: '孟加拉语',
    objective_bs: '波斯尼亚语',
    objective_bg: '保加利亚语',
    objective_ca: '加泰罗尼亚语',
    objective_zh: '中文（简体）',
    'objective_zh-TW': '中文（繁体）',
    objective_co: '科西嘉语',
    objective_hr: '克罗地亚语',
    objective_cs: '捷克语',
    objective_da: '丹麦语',
    objective_nl: '荷兰语',
    objective_en: '英语（美国）',
    'objective_en-GB': '英语（英国）',
    objective_eo: '世界语',
    objective_et: '爱沙尼亚语',
    objective_fi: '芬兰语',
    objective_fr: '法语',
    objective_fy: '弗里斯兰语',
    objective_gl: '加利西亚语',
    objective_ka: '格鲁吉亚语',
    objective_de: '德语',
    objective_el: '希腊语',
    objective_gu: '古吉拉特语',
    objective_ht: '海地克里奥尔语',
    objective_ha: '豪萨语',
    objective_haw: '夏威夷语',
    objective_he: '希伯来语',
    objective_hi: '印地语',
    objective_hmn: '苗语',
    objective_hu: '匈牙利语',
    objective_is: '冰岛语',
    objective_ig: '伊博语',
    objective_id: '印度尼西亚语',
    objective_ga: '爱尔兰语',
    objective_it: '意大利语',
    objective_ja: '日语',
    objective_jv: '爪哇语',
    objective_kn: '卡纳达语',
    objective_kk: '哈萨克语',
    objective_km: '高棉语',
    objective_rw: '卢旺达语',
    objective_ko: '韩语',
    objective_ku: '库尔德语',
    objective_ky: '吉尔吉斯语',
    objective_lo: '老挝语',
    objective_lv: '拉脱维亚语',
    objective_lt: '立陶宛语',
    objective_lb: '卢森堡语',
    objective_mk: '马其顿语',
    objective_mg: '马尔加什语',
    objective_ms: '马来语',
    objective_ml: '马拉雅拉姆语',
    objective_mt: '马耳他语',
    objective_mi: '毛利语',
    objective_mr: '马拉地语',
    objective_mn: '蒙古语',
    objective_my: '缅甸语',
    objective_ne: '尼泊尔语',
    objective_no: '挪威语',
    objective_ny: '齐切瓦语',
    objective_or: '奥里亚语',
    objective_ps: '普什图语',
    objective_fa: '波斯语',
    objective_pl: '波兰语',
    objective_pt: '葡萄牙语（巴西）',
    'objective_pt-PT': '葡萄牙语（欧洲）',
    objective_pa: '旁遮普语',
    objective_ro: '罗马尼亚语',
    objective_ru: '俄语',
    objective_sm: '萨摩亚语',
    objective_gd: '苏格兰盖尔语',
    objective_sr: '塞尔维亚语',
    objective_st: '塞索托语',
    objective_sn: '绍纳语',
    objective_sd: '信德语',
    objective_si: '僧伽罗语',
    objective_sk: '斯洛伐克语',
    objective_sl: '斯洛文尼亚语',
    objective_so: '索马里语',
    objective_es: '西班牙语',
    objective_su: '巽他语',
    objective_sw: '斯瓦希里语',
    objective_sv: '瑞典语',
    objective_tl: '他加禄语（菲律宾语）',
    objective_tg: '塔吉克语',
    objective_ta: '泰米尔语',
    objective_tt: '鞑靼语',
    objective_te: '泰卢固语',
    objective_th: '泰语',
    objective_tr: '土耳其语',
    objective_tk: '土库曼语',
    objective_uk: '乌克兰语',
    objective_ur: '乌尔都语',
    objective_ug: '维吾尔语',
    objective_uz: '乌兹别克语',
    objective_vi: '越南语',
    objective_cy: '威尔士语',
    objective_xh: '科萨语',
    objective_yi: '意第绪语',
    objective_yo: '约鲁巴语',
    objective_zu: '祖鲁语',
};

;// ../browser-i18n/dist/esm/zh-TW.js
const zhTW = {
    nominative_af: '南非荷蘭文',
    nominative_sq: '阿爾巴尼亞文',
    nominative_am: '阿姆哈拉文',
    nominative_ar: '阿拉伯文',
    nominative_hy: '亞美尼亞文',
    nominative_hyw: '亞美尼亞文（西部）',
    nominative_az: '亞塞拜然文',
    nominative_eu: '巴斯克文',
    nominative_be: '白俄羅斯文',
    nominative_bn: '孟加拉文',
    nominative_bs: '波士尼亞文',
    nominative_bg: '保加利亞文',
    nominative_ca: '加泰隆尼亞文',
    nominative_zh: '中文（簡體）',
    'nominative_zh-TW': '中文（繁體）',
    nominative_co: '科西嘉文',
    nominative_hr: '克羅埃西亞文',
    nominative_cs: '捷克文',
    nominative_da: '丹麥文',
    nominative_nl: '荷蘭文',
    nominative_en: '英文（美國）',
    'nominative_en-GB': '英文（英國）',
    nominative_eo: '世界語',
    nominative_et: '愛沙尼亞文',
    nominative_fi: '芬蘭文',
    nominative_fr: '法文',
    nominative_fy: '弗里斯蘭文',
    nominative_gl: '加利西亞文',
    nominative_ka: '喬治亞文',
    nominative_de: '德文',
    nominative_el: '希臘文',
    nominative_gu: '古吉拉特文',
    nominative_ht: '海地克里奧文',
    nominative_ha: '豪薩文',
    nominative_haw: '夏威夷文',
    nominative_he: '希伯來文',
    nominative_hi: '印地文',
    nominative_hmn: '苗文',
    nominative_hu: '匈牙利文',
    nominative_is: '冰島文',
    nominative_ig: '伊布文',
    nominative_id: '印尼文',
    nominative_ga: '愛爾蘭文',
    nominative_it: '義大利文',
    nominative_ja: '日文',
    nominative_jv: '爪哇文',
    nominative_kn: '卡納達文',
    nominative_kk: '哈薩克文',
    nominative_km: '高棉文',
    nominative_rw: '盧安達文',
    nominative_ko: '韓文',
    nominative_ku: '庫德文',
    nominative_ky: '吉爾吉斯文',
    nominative_lo: '寮文',
    nominative_lv: '拉脫維亞文',
    nominative_lt: '立陶宛文',
    nominative_lb: '盧森堡文',
    nominative_mk: '馬其頓文',
    nominative_mg: '馬達加斯加文',
    nominative_ms: '馬來文',
    nominative_ml: '馬拉雅拉姆文',
    nominative_mt: '馬爾他文',
    nominative_mi: '毛利文',
    nominative_mr: '馬拉地文',
    nominative_mn: '蒙古文',
    nominative_my: '緬甸文',
    nominative_ne: '尼泊爾文',
    nominative_no: '挪威文',
    nominative_ny: '尼揚賈文（齊切瓦文）',
    nominative_or: '歐迪亞文（奧里亞文）',
    nominative_ps: '普什圖文',
    nominative_fa: '波斯文',
    nominative_pl: '波蘭文',
    nominative_pt: '葡萄牙文（巴西）',
    'nominative_pt-PT': '葡萄牙文（歐洲）',
    nominative_pa: '旁遮普文',
    nominative_ro: '羅馬尼亞文',
    nominative_ru: '俄文',
    nominative_sm: '薩摩亞文',
    nominative_gd: '蘇格蘭蓋爾文',
    nominative_sr: '塞爾維亞文',
    nominative_st: '塞索托文',
    nominative_sn: '修納文',
    nominative_sd: '信德文',
    nominative_si: '僧伽羅文',
    nominative_sk: '斯洛伐克文',
    nominative_sl: '斯洛維尼亞文',
    nominative_so: '索馬利文',
    nominative_es: '西班牙文',
    nominative_su: '巽他文',
    nominative_sw: '史瓦希里文',
    nominative_sv: '瑞典文',
    nominative_tl: '塔加路族文（菲律賓文）',
    nominative_tg: '塔吉克文',
    nominative_ta: '坦米爾文',
    nominative_tt: '韃靼文',
    nominative_te: '泰盧固文',
    nominative_th: '泰文',
    nominative_tr: '土耳其文',
    nominative_tk: '土庫曼文',
    nominative_uk: '烏克蘭文',
    nominative_ur: '烏都文',
    nominative_ug: '維吾爾文',
    nominative_uz: '烏茲別克文',
    nominative_vi: '越南文',
    nominative_cy: '威爾斯文',
    nominative_xh: '科薩文',
    nominative_yi: '意第緒文',
    nominative_yo: '約魯巴文',
    nominative_zu: '祖魯文',
    //
    objective_af: '南非荷蘭文',
    objective_sq: '阿爾巴尼亞文',
    objective_am: '阿姆哈拉文',
    objective_ar: '阿拉伯文',
    objective_hy: '亞美尼亞文',
    objective_hyw: '亞美尼亞文（西部）',
    objective_az: '亞塞拜然文',
    objective_eu: '巴斯克文',
    objective_be: '白俄羅斯文',
    objective_bn: '孟加拉文',
    objective_bs: '波士尼亞文',
    objective_bg: '保加利亞文',
    objective_ca: '加泰隆尼亞文',
    objective_zh: '中文（簡體）',
    'objective_zh-TW': '中文（繁體）',
    objective_co: '科西嘉文',
    objective_hr: '克羅埃西亞文',
    objective_cs: '捷克文',
    objective_da: '丹麥文',
    objective_nl: '荷蘭文',
    objective_en: '英文（美國）',
    'objective_en-GB': '英文（英國）',
    objective_eo: '世界語',
    objective_et: '愛沙尼亞文',
    objective_fi: '芬蘭文',
    objective_fr: '法文',
    objective_fy: '弗里斯蘭文',
    objective_gl: '加利西亞文',
    objective_ka: '喬治亞文',
    objective_de: '德文',
    objective_el: '希臘文',
    objective_gu: '古吉拉特文',
    objective_ht: '海地克里奧文',
    objective_ha: '豪薩文',
    objective_haw: '夏威夷文',
    objective_he: '希伯來文',
    objective_hi: '印地文',
    objective_hmn: '苗文',
    objective_hu: '匈牙利文',
    objective_is: '冰島文',
    objective_ig: '伊布文',
    objective_id: '印尼文',
    objective_ga: '愛爾蘭文',
    objective_it: '義大利文',
    objective_ja: '日文',
    objective_jv: '爪哇文',
    objective_kn: '卡納達文',
    objective_kk: '哈薩克文',
    objective_km: '高棉文',
    objective_rw: '盧安達文',
    objective_ko: '韓文',
    objective_ku: '庫德文',
    objective_ky: '吉爾吉斯文',
    objective_lo: '寮文',
    objective_lv: '拉脫維亞文',
    objective_lt: '立陶宛文',
    objective_lb: '盧森堡文',
    objective_mk: '馬其頓文',
    objective_mg: '馬達加斯加文',
    objective_ms: '馬來文',
    objective_ml: '馬拉雅拉姆文',
    objective_mt: '馬爾他文',
    objective_mi: '毛利文',
    objective_mr: '馬拉地文',
    objective_mn: '蒙古文',
    objective_my: '緬甸文',
    objective_ne: '尼泊爾文',
    objective_no: '挪威文',
    objective_ny: '尼揚賈文（齊切瓦文）',
    objective_or: '歐迪亞文（奧里亞文）',
    objective_ps: '普什圖文',
    objective_fa: '波斯文',
    objective_pl: '波蘭文',
    objective_pt: '葡萄牙文（巴西）',
    'objective_pt-PT': '葡萄牙文（歐洲）',
    objective_pa: '旁遮普文',
    objective_ro: '羅馬尼亞文',
    objective_ru: '俄文',
    objective_sm: '薩摩亞文',
    objective_gd: '蘇格蘭蓋爾文',
    objective_sr: '塞爾維亞文',
    objective_st: '塞索托文',
    objective_sn: '修納文',
    objective_sd: '信德文',
    objective_si: '僧伽羅文',
    objective_sk: '斯洛伐克文',
    objective_sl: '斯洛維尼亞文',
    objective_so: '索馬利文',
    objective_es: '西班牙文',
    objective_su: '巽他文',
    objective_sw: '史瓦希里文',
    objective_sv: '瑞典文',
    objective_tl: '塔加路族文（菲律賓文）',
    objective_tg: '塔吉克文',
    objective_ta: '坦米爾文',
    objective_tt: '韃靼文',
    objective_te: '泰盧固文',
    objective_th: '泰文',
    objective_tr: '土耳其文',
    objective_tk: '土庫曼文',
    objective_uk: '烏克蘭文',
    objective_ur: '烏都文',
    objective_ug: '維吾爾文',
    objective_uz: '烏茲別克文',
    objective_vi: '越南文',
    objective_cy: '威爾斯文',
    objective_xh: '科薩文',
    objective_yi: '意第緒文',
    objective_yo: '約魯巴文',
    objective_zu: '祖魯文',
};

;// ../browser-i18n/dist/esm/messages/en.js
const messages_en_en = {
    // youtube
    'youtube.press_alt_to_select': 'Press Alt to select text',
    'youtube.press_option_to_select': 'Press Option ⌥ to select text',
};

;// ../browser-i18n/dist/esm/messages/ru.js
const ru_ru = {
    // youtube
    'youtube.press_alt_to_select': 'Нажмите Alt чтобы выделить текст',
    'youtube.press_option_to_select': 'Нажмите Option ⌥ чтобы выделить текст',
};

;// ../browser-i18n/dist/esm/messages/uk.js
const uk_uk = {
    // youtube
    'youtube.press_alt_to_select': 'Натисніть Alt щоб виділити текст',
    'youtube.press_option_to_select': 'Натисніть Option ⌥ щоб виділити текст',
};

;// ../browser-i18n/dist/esm/messages/vi.js
const messages_vi_vi = {
    // youtube
    'youtube.press_alt_to_select': 'Nhấn giữ Alt để chọn văn bản',
    'youtube.press_option_to_select': 'Nhấn giữ Option ⌥ để chọn văn bản',
};

;// ../browser-i18n/dist/esm/messages/tr.js
const messages_tr_tr = {
    // youtube
    'youtube.press_alt_to_select': 'Metni seçmek için Alt tuşuna basın',
    'youtube.press_option_to_select': 'Metni seçmek için Option ⌥ tuşuna basın',
};

;// ../browser-i18n/dist/esm/messages/es.js
const messages_es_es = {
    // youtube
    'youtube.press_alt_to_select': 'Pulsa Alt para seleccionar el texto',
    'youtube.press_option_to_select': 'Pulsa Option ⌥ para seleccionar el texto',
};

;// ../browser-i18n/dist/esm/messages/pt.js
const messages_pt_pt = {
    // youtube
    'youtube.press_alt_to_select': 'Pressione Alt para selecionar o texto',
    'youtube.press_option_to_select': 'Pressione Option ⌥ para selecionar o texto',
};

;// ../browser-i18n/dist/esm/messages/zh.js
const zh_zh = {
    // youtube
    'youtube.press_alt_to_select': '按住 Alt 键以选中文本',
    'youtube.press_option_to_select': '按住 Option ⌥ 键以选中文本',
};

;// ../browser-i18n/dist/esm/messages/zh-TW.js
const zh_TW_zhTW = {
    // youtube
    'youtube.press_alt_to_select': '按住 Alt 鍵以選取文字',
    'youtube.press_option_to_select': '按住 Option ⌥ 鍵以選取文字',
};

;// ../browser-i18n/dist/esm/messages/index.js









const messageTranslations = {
    en: messages_en_en,
    ru: ru_ru,
    uk: uk_uk,
    vi: messages_vi_vi,
    tr: messages_tr_tr,
    es: messages_es_es,
    pt: messages_pt_pt,
    zh: zh_zh,
    'zh-TW': zh_TW_zhTW,
};

;// ../browser-i18n/dist/esm/index.js










const detectLocale = () => {
    const languages = typeof navigator !== 'undefined'
        ? navigator.languages?.length
            ? navigator.languages
            : [navigator.language]
        : ['en'];
    for (const lang of languages) {
        const locale = parseLocale(lang);
        if (locale) {
            return locale;
        }
    }
    return 'en';
};
const LOCALE_KEY = '__vocably_locale__';
const WATCHERS_KEY = '__vocably_locale_watchers__';
const getWatchers = () => {
    if (typeof window === 'undefined')
        return new Map();
    if (!window[WATCHERS_KEY]) {
        window[WATCHERS_KEY] = new Map();
    }
    return window[WATCHERS_KEY];
};
const setLocale = (locale) => {
    if (locale === getLocale())
        return;
    if (typeof window !== 'undefined') {
        window[LOCALE_KEY] = locale;
    }
    getWatchers().forEach((forceUpdateFn) => {
        try {
            forceUpdateFn();
        }
        catch { }
    });
};
const getLocale = () => {
    if (typeof window !== 'undefined' && window[LOCALE_KEY]) {
        return window[LOCALE_KEY];
    }
    return 'en';
};
const subscribeToLocale = (el, forceUpdateFn) => {
    getWatchers().set(el, forceUpdateFn);
    return () => getWatchers().delete(el);
};
const buildT = (translations) => (key, params) => {
    const locale = getLocale();
    const localeTranslations = translations[locale] ?? translations['en'];
    const str = localeTranslations[key] ??
        translations['en'][key] ??
        String(key);
    if (!params)
        return str;
    return Object.entries(params).reduce((s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)), str);
};

const languageTranslations = {
    en: en_en,
    ru: ru,
    uk: uk,
    vi: vi_vi,
    tr: tr_tr,
    es: es_es,
    pt: pt_pt,
    zh: zh,
    'zh-TW': zhTW,
};

;// ../extension-service-worker/dist/esm/settings.js



const defaultSettings = {
    showOnDoubleClick: false,
    showOnSelection: false,
    autoPlay: false,
    hideSelectionButton: false,
    autodetectLanguage: false,
    showOnHotKey: false,
    locale: detectLocale(),
};
const settings_getSettings = async () => {
    const { settings } = await browserEnv_browserEnv.storage.sync.get(['settings']);
    return settings ?? defaultSettings;
};
const settings_setSettings = async (partialSettings) => {
    const settings = {
        ...(await settings_getSettings()),
        ...partialSettings,
    };
    if (partialSettings.locale) {
        await saveUserMetadata({ interfaceLanguage: partialSettings.locale });
    }
    await browserEnv_browserEnv.storage.sync.set({
        settings: settings,
    });
    return settings;
};

;// ../extension-service-worker/dist/esm/userMetadata.js

let userMetadata = null;
const userMetadata_getUserMetadata = async () => {
    if (userMetadata !== null) {
        return {
            success: true,
            value: userMetadata,
        };
    }
    const result = await getUserMetadata();
    if (result.success === false) {
        return result;
    }
    userMetadata = result.value;
    return {
        success: true,
        value: result.value,
    };
};
const invalidateUserMetadata = () => {
    userMetadata = null;
};
/**
 * Sends only the changed fields: the API merges them into the freshly loaded
 * metadata, so a stale cached copy never overwrites values saved elsewhere
 * (e.g. the mobile app's rate responses).
 */
const userMetadata_saveUserMetadata = async (payloadMetadata) => {
    const result = await saveUserMetadata(payloadMetadata);
    userMetadata = result.success ? result.value : null;
    return result;
};

;// ../extension-service-worker/dist/esm/rateResponse.js



const rateResponse_storage = browserEnv_browserEnv.storage.sync;
const rateResponse_storageKey = 'rateResponses';
const getStoredRateResponses = async () => {
    const { [rateResponse_storageKey]: stored } = await rateResponse_storage.get([rateResponse_storageKey]);
    return stored ?? {};
};
const isNewer = (a, b) => b === undefined || a.isoDate > b.isoDate;
/**
 * Moves the responses collected while signed out (sync storage) into the
 * user metadata and clears sync storage once the metadata is saved.
 * A response already in the metadata wins when it is more recent.
 */
const migrateStoredRateResponses = async () => {
    const metadataResult = await userMetadata_getUserMetadata();
    if (metadataResult.success === false) {
        return metadataResult;
    }
    const metadataRate = { ...metadataResult.value.rate };
    const stored = await getStoredRateResponses();
    const toBeSaved = {};
    for (const [platform, response] of Object.entries(stored)) {
        if (isNewer(response, metadataRate[platform])) {
            toBeSaved[platform] = response;
            metadataRate[platform] = response;
        }
    }
    if (Object.keys(toBeSaved).length > 0) {
        const saveResult = await userMetadata_saveUserMetadata({ rate: toBeSaved });
        if (saveResult.success === false) {
            return saveResult;
        }
    }
    if (Object.keys(stored).length > 0) {
        await rateResponse_storage.remove(rateResponse_storageKey);
    }
    return { success: true, value: metadataRate };
};
const getRateResponse = async (platform) => {
    if (await isSignedIn()) {
        const migrationResult = await migrateStoredRateResponses();
        if (migrationResult.success) {
            return migrationResult.value[platform];
        }
    }
    // Signed out, or the metadata is unreachable: rely on sync storage.
    return (await getStoredRateResponses())[platform];
};
const saveRateResponse = async (platform, response) => {
    await rateResponse_storage.set({
        [rateResponse_storageKey]: {
            ...(await getStoredRateResponses()),
            [platform]: response,
        },
    });
    if (await isSignedIn()) {
        // Copies the response to the metadata and clears sync storage on success.
        await migrateStoredRateResponses();
    }
};

;// ../extension-service-worker/dist/esm/index.js



























const isLoggedIn$ = timer(0, 2000).pipe(switchMap(() => isSignedIn()), distinctUntilChanged());
const registerServiceWorker = (registerServiceWorkerOptions) => {
    Ga.init('phc_zSkRhQ7tE4RDFRdxIVXzWwJ66ACL9QAHnyrRpRknyHj', {
        api_host: 'https://api-e.vocably.pro',
        person_profiles: 'identified_only',
        persistence: 'memory',
        disable_external_dependency_loading: true,
        capture_pageview: false,
        autocapture: false,
        disable_session_recording: true,
        disable_surveys: true,
        mask_personal_data_properties: true,
        before_send: (event) => {
            if (event && event.properties) {
                // 1. Remove standard device metadata properties that can aid fingerprinting
                delete event.properties['$device_id'];
                delete event.properties['$device_name'];
                delete event.properties['$device_model'];
                delete event.properties['$device_manufacturer'];
                delete event.properties['$os_version'];
                delete event.properties['$os_name'];
                // 2. Clear out explicit network or location keys to guarantee anonymity
                delete event.properties['$ip'];
                delete event.properties['$geoip_city_name'];
                delete event.properties['$geoip_country_code'];
                delete event.properties['$geoip_country_name'];
            }
            // Return the sanitized event back to the pipeline
            return event;
        },
    });
    Ga.identify();
    DefaultAmplify.configure({
        Auth: {
            Cognito: {
                userPoolId: registerServiceWorkerOptions.auth.userPoolId,
                userPoolClientId: registerServiceWorkerOptions.auth.userPoolWebClientId,
            },
        },
    });
    // Must follow `Amplify.configure`, which installs the default token storage.
    cognitoUserPoolsTokenProvider.setKeyValueStorage(registerServiceWorkerOptions.auth.storage);
    configureApi(registerServiceWorkerOptions.api);
    isLoggedIn$.subscribe(async (isLoggedIn) => {
        if (!isLoggedIn) {
            return;
        }
        const facility = registerServiceWorkerOptions.facility === 'ios-safari'
            ? 'ios-safari-extension'
            : browserEnv_browserEnv.runtime.getURL('/').startsWith('chrome-extension:')
                ? 'chrome-extension'
                : 'safari-extension';
        postOnboardingAction({
            name: 'userLoggedIn',
            payload: {
                facility,
            },
        }).then();
    });
    onIsLoggedInRequest(async (sendResponse) => {
        const isLoggedIn = await isSignedIn();
        if (!Ga._isIdentified()) {
            Ga.identify();
        }
        return sendResponse(isLoggedIn);
    });
    onIsActiveRequest(async (sendResponse) => {
        return sendResponse(await isInPaidGroup());
    });
    onIsEligibleForTrialRequest(async (sendResponse) => {
        const user = await getCurrentUser_getCurrentUser().catch(() => null);
        if (user === null) {
            return sendResponse(false);
        }
        const attributes = await fetchUserAttributes_fetchUserAttributes();
        const userData = mapUserAttributes({
            username: user.username,
            attributes,
        });
        return sendResponse(isEligibleForTrial(userData));
    });
    onGetCardsLimitRequest(async (sendResponse) => {
        if (registerServiceWorkerOptions.unlimitedMaxCards) {
            return sendResponse('unlimited');
        }
        return sendResponse(await getCardsLimit_getCardsLimit());
    });
    onGetUserEmail(async (sendResponse) => {
        const userAttributes = await getUserAttributes();
        if (userAttributes.success === false) {
            return sendResponse(userAttributes);
        }
        return sendResponse({
            success: true,
            value: userAttributes.value.email,
        });
    });
    const getAnalysisAndCards = async (analyzePayload) => {
        if (analyzePayload.sourceLanguage) {
            return Promise.all([
                analyze({
                    ...analyzePayload,
                }),
                loadLanguageDeck(analyzePayload.sourceLanguage),
            ]);
        }
        const analysisResult = await analyze(analyzePayload);
        if (analysisResult.success === false) {
            return [
                analysisResult,
                {
                    success: false,
                    errorCode: 'LANGUAGE_DECK_LOAD_ERROR',
                    reason: `The language deck can't be loaded because the source language is not specified and can't be detected.`,
                },
            ];
        }
        return [
            analysisResult,
            await loadLanguageDeck(analysisResult.value.sourceLanguage),
        ];
    };
    onExplainRequest(async (sendResponse, payload) => {
        // Signed out users get the very same explanation from the public API.
        const explainResult = (await isSignedIn())
            ? await explain(payload)
            : await publicExplain(payload);
        return sendResponse(explainResult);
    });
    onAnalyzeRequest(async (sendResponse, payload) => {
        if (payload.sourceLanguage) {
            await sourceLanguage_setSourceLanguage(payload.sourceLanguage);
        }
        if (payload.targetLanguage) {
            await proxyLanguage_setProxyLanguage(payload.targetLanguage);
        }
        const analyzePayload = {
            ...payload,
            sourceLanguage: payload.sourceLanguage ?? (await sourceLanguage_getSourceLanguage()) ?? 'en',
            targetLanguage: payload.targetLanguage ?? (await proxyLanguage_getProxyLanguage()) ?? 'en',
        };
        Ga.capture('analyze_requested', analyzePayload);
        // A signed out user can translate as well. They have no collection yet, so
        // every card comes out as addable, and adding one asks them to sign in.
        if (!(await isSignedIn())) {
            const analysisResult = await publicAnalyze(analyzePayload);
            if (analysisResult.success === false) {
                return sendResponse(analysisResult);
            }
            return sendResponse({
                success: true,
                value: analysisToTranslationCards(analysisResult.value),
            });
        }
        try {
            const [analysisResult, loadLanguageDeckResult] = await getAnalysisAndCards(analyzePayload);
            if (analysisResult.success === false) {
                analysisResult.extra &&
                    analysisResult.extra.body &&
                    console.info('Backend error body', analysisResult.extra.body.toString());
                return sendResponse(analysisResult);
            }
            if (loadLanguageDeckResult.success === false) {
                return sendResponse(loadLanguageDeckResult);
            }
            const languageDeck = loadLanguageDeckResult.value;
            const value = analysisToTranslationCards(analysisResult.value, languageDeck);
            addLanguage(value.sourceLanguage);
            return sendResponse({
                success: true,
                value,
            });
        }
        catch (e) {
            console.error('Cards creation error', e);
            return sendResponse({
                success: false,
                errorCode: 'EXTENSION_SERVICE_WORKER_ERROR_CREATING_CARDS',
                reason: `An unexpected error has occurred during the cards creation in service worker.`,
                extra: e,
            });
        }
    });
    onRemoveCardRequest(async (sendResponse, payload) => {
        const getLanguageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        if (getLanguageDeckResult.success === false) {
            return sendResponse(getLanguageDeckResult);
        }
        makeDelete(getLanguageDeckResult.value.cards)(payload.card.id);
        const saveLanguageDeckResult = await saveLanguageDeck(getLanguageDeckResult.value);
        if (saveLanguageDeckResult.success === false) {
            return sendResponse(saveLanguageDeckResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: getLanguageDeckResult.value,
            },
        });
    });
    onAddCardRequest(async (sendResponse, payload) => {
        const getLanguageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        Ga.capture('addCard', {
            ...payload.card.data,
        });
        if (getLanguageDeckResult.success === false) {
            return sendResponse(getLanguageDeckResult);
        }
        const tagMap = buildTagMap(getLanguageDeckResult.value.tags);
        const lastUsedTagsIds = await getLastUsedTagsIds();
        const tags = lodash_es_uniq(lastUsedTagsIds)
            .filter((tagId) => tagMap[tagId])
            .map((tagId) => tagMap[tagId]);
        await saveLastUsedTagsIds(tags.map((t) => t.id));
        makeCreate(getLanguageDeckResult.value.cards)({
            ...createSrsItem(),
            ...payload.card.data,
            tags,
        });
        const saveLanguageDeckResult = await saveLanguageDeck(getLanguageDeckResult.value);
        if (saveLanguageDeckResult.success === false) {
            return sendResponse(saveLanguageDeckResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: getLanguageDeckResult.value,
            },
        });
    });
    onListLanguagesRequest(async (sendResponse) => {
        // Nothing to list without a collection. The cache is left alone, so the
        // real list is fetched once the user signs in.
        if (!(await isSignedIn())) {
            return sendResponse({ success: true, value: [] });
        }
        return sendResponse(await getUserLanguages());
    });
    onLoadLanguageDeck(async (sendResponse, language) => sendResponse(await loadLanguageDeck(language)));
    onAnalyticsCapture(async (sendResponse, { event, properties }) => {
        Ga.capture(event, properties);
        return sendResponse();
    });
    // The same event and properties as the mobile app sends.
    onQualityVote(async (sendResponse, payload) => {
        Ga.capture('cardQualityVoted', payload);
        return sendResponse();
    });
    onListTargetLanguagesRequest(async (sendResponse) => {
        const sourceLanguage = await sourceLanguage_getSourceLanguage();
        if (!sourceLanguage) {
            return sendResponse([]);
        }
        const languagePair = getLanguagePair(sourceLanguage);
        return sendResponse(languagePair ? languagePair.possibleTargetLanguages : []);
    });
    onPing((sendResponse) => {
        return sendResponse('pong');
    });
    onPingExternal((sendResponse) => {
        return sendResponse('pong');
    });
    onGetInternalProxyLanuage(async (sendResponse) => {
        return sendResponse(await proxyLanguage_getProxyLanguage());
    });
    onSetInternalProxyLanguage(async (sendResponse, language) => {
        await proxyLanguage_setProxyLanguage(language);
        return sendResponse();
    });
    onGetInternalSourceLanguage(async (sendResponse) => {
        return sendResponse(await sourceLanguage_getSourceLanguage());
    });
    onSetInternalSourceLanguage(async (sendResponse, language) => {
        await sourceLanguage_setSourceLanguage(language);
        return sendResponse();
    });
    onGetProxyLanguage(async (sendResponse) => {
        return sendResponse(await proxyLanguage_getProxyLanguage());
    });
    onSetProxyLanguage(async (sendResponse, language) => {
        await proxyLanguage_setProxyLanguage(language);
        return sendResponse();
    });
    onGetSourceLanguage(async (sendResponse) => {
        return sendResponse(await sourceLanguage_getSourceLanguage());
    });
    onSetSourceLanguage(async (sendResponse, language) => {
        await sourceLanguage_setSourceLanguage(language);
        return sendResponse();
    });
    onIsUserKnowsHowToAdd(async (sendResponse) => {
        const { userKnowsHowToAdd } = await browserEnv_browserEnv.storage.sync.get([
            'userKnowsHowToAdd',
        ]);
        return sendResponse(userKnowsHowToAdd ?? false);
    });
    onSetUserKnowsHowToAdd(async (sendResponse, value) => {
        await browserEnv_browserEnv.storage.sync.set({
            userKnowsHowToAdd: value,
        });
        return sendResponse();
    });
    onGetAudioPronunciation(async (sendResponse, payload) => {
        const ttsResult = await tts(registerServiceWorkerOptions.api.baseUrl, {
            text: payload.text,
            language: payload.language,
        });
        if (ttsResult.success === false) {
            return sendResponse(ttsResult);
        }
        return sendResponse({
            success: true,
            value: {
                url: 'data:audio/mpeg;base64,' + ttsResult.value.audioContent,
            },
        });
    });
    onAskForRating(async (sendResponse, payload) => {
        if (payload.translationResult.success === false) {
            return sendResponse(false);
        }
        const platform = payload.extensionPlatform === 'iosSafariExtension'
            ? 'safariExtension'
            : payload.extensionPlatform;
        const rateResponse = await getRateResponse(platform);
        if (rateResponse !== undefined &&
            (rateResponse.response === 'never' || rateResponse.response === 'review')) {
            return sendResponse(false);
        }
        const counter = await getAskForRatingCounter(payload.translationResult.value.sourceLanguage);
        await storeAskForRatingCounter(counter + 1);
        if (counter === 0) {
            return sendResponse(false);
        }
        const shouldAskForRating = rateResponse && rateResponse.response === 'feedback'
            ? counter % 30 === 0
            : counter % 10 === 0;
        if (shouldAskForRating) {
            Ga.capture('extensionAskForRatingShown', {
                counter,
            });
        }
        return sendResponse(shouldAskForRating);
    });
    onSaveAskForRatingResponse(async (sendResponse, payload) => {
        Ga.capture('extensionAskForRatingResponse', {
            response: payload.rateInteraction,
        });
        const platform = payload.extensionPlatform === 'iosSafariExtension'
            ? 'safariExtension'
            : payload.extensionPlatform;
        invalidateUserMetadata();
        await saveRateResponse(platform, {
            response: payload.rateInteraction,
            isoDate: new Date().toISOString(),
        });
        await resetAskForRatingCounter();
        return sendResponse();
    });
    onGetLocationLanguageRequest(async (sendResponse, url) => {
        return sendResponse(locationLanguage_getLocationLanguage(url));
    });
    onSaveLocationLanguageRequest(async (sendResponse, [url, language]) => {
        await storeLocationLanguage(url, language);
        return sendResponse();
    });
    onGetSettingsRequest(async (sendResponse) => {
        return sendResponse(await settings_getSettings());
    });
    onSetSettingsRequest(async (sendResponse, partialSettings) => {
        return sendResponse(await settings_setSettings(partialSettings));
    });
    onGetSettingsExternalRequest(async (sendResponse) => {
        return sendResponse(await settings_getSettings());
    });
    onSetSettingsExternalRequest(async (sendResponse, partialSettings) => {
        return sendResponse(await settings_setSettings(partialSettings));
    });
    onCanPlayOffScreen(async (sendResponse) => {
        return sendResponse(hasOffscreen(browserEnv_browserEnv));
    });
    onPlayAudioPronunciation(async (sendResponse, payload) => {
        if (!hasOffscreen(browserEnv_browserEnv)) {
            return sendResponse({
                success: false,
                errorCode: 'EXTENSION_OFFSCREEN_DOES_NOT_EXIST',
                reason: 'The extension is trying to use browser.offscreen to play the audio pronunciation',
            });
        }
        if (!(await browserEnv_browserEnv.offscreen.hasDocument())) {
            await browserEnv_browserEnv.offscreen.createDocument({
                url: 'play-audio.html',
                reasons: [browserEnv_browserEnv.offscreen.Reason.AUDIO_PLAYBACK],
                justification: 'Play the audio pronunciation',
            });
        }
        return sendResponse(await playAudioPronunciationOffscreen(payload));
    });
    onUpdateCard(async (sendResponse, payload) => {
        if (payload.data.translation) {
            Ga.capture('cardTranslationUpdated', {
                sourceLanguage: payload.translationCards.sourceLanguage,
                targetLanguage: payload.translationCards.targetLanguage,
                source: payload.translationCards.source,
                originalTranslation: payload.card.data.translation,
                newTranslation: payload.data.translation,
            });
        }
        if (!isCardItem(payload.card)) {
            return sendResponse(updateDetachedCard({
                ...payload,
                card: payload.card,
            }));
        }
        const languageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        if (languageDeckResult.success === false) {
            return sendResponse(languageDeckResult);
        }
        const updateResult = makeUpdate(languageDeckResult.value.cards)(payload.card.id, payload.data);
        if (updateResult.success === false) {
            return sendResponse(updateResult);
        }
        const saveResult = await saveLanguageDeck(languageDeckResult.value);
        if (saveResult.success === false) {
            return sendResponse(saveResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: languageDeckResult.value,
            },
        });
    });
    onAttachTag(async (sendResponse, payload) => {
        const languageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        if (languageDeckResult.success === false) {
            return sendResponse(languageDeckResult);
        }
        const tagCandidate = payload.tag;
        const tagItem = isItem(tagCandidate)
            ? languageDeckResult.value.tags.find((t) => t.id === tagCandidate.id)
            : makeCreate(languageDeckResult.value.tags)(tagCandidate.data);
        if (tagItem === undefined) {
            return sendResponse({
                success: false,
                errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
                reason: `Unable to find tag in the collection`,
                extra: {
                    payload,
                },
            });
        }
        const card = languageDeckResult.value.cards.find((c) => c.id === payload.cardId);
        if (card === undefined) {
            return sendResponse({
                success: false,
                errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
                reason: `Unable to find card with ID ${payload.cardId}`,
                extra: {
                    payload,
                },
            });
        }
        if (!card.data.tags.some((t) => t.id === tagItem.id)) {
            card.data.tags.push(tagItem);
        }
        await saveLastUsedTagsIds(card.data.tags.map((t) => t.id));
        const saveResult = await saveLanguageDeck(languageDeckResult.value);
        if (saveResult.success === false) {
            return sendResponse(saveResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: languageDeckResult.value,
            },
        });
    });
    onDetachTag(async (sendResponse, payload) => {
        const languageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        if (languageDeckResult.success === false) {
            return sendResponse(languageDeckResult);
        }
        const card = languageDeckResult.value.cards.find((c) => c.id === payload.cardId);
        if (card === undefined) {
            return sendResponse({
                success: false,
                errorCode: 'EXTENSION_UNABLE_TO_COMPLETE_TAG_OPERATION',
                reason: `Unable to find card with ID ${payload.cardId}`,
                extra: {
                    payload,
                },
            });
        }
        card.data.tags = card.data.tags.filter((t) => t.id !== payload.tag.id);
        await saveLastUsedTagsIds(card.data.tags.map((t) => t.id));
        const saveResult = await saveLanguageDeck(languageDeckResult.value);
        if (saveResult.success === false) {
            return sendResponse(saveResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: languageDeckResult.value,
            },
        });
    });
    onUpdateTag(async (sendResponse, payload) => {
        const languageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        if (languageDeckResult.success === false) {
            return sendResponse(languageDeckResult);
        }
        const updateResult = makeUpdate(languageDeckResult.value.tags)(payload.tag.id, payload.tag.data);
        if (updateResult.success === false) {
            return sendResponse(updateResult);
        }
        const saveResult = await saveLanguageDeck(languageDeckResult.value);
        if (saveResult.success === false) {
            return sendResponse(saveResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: languageDeckResult.value,
            },
        });
    });
    onDeleteTag(async (sendResponse, payload) => {
        const languageDeckResult = await loadLanguageDeck(payload.translationCards.sourceLanguage);
        if (languageDeckResult.success === false) {
            return sendResponse(languageDeckResult);
        }
        const deleteResult = makeDelete(languageDeckResult.value.tags)(payload.tag.id);
        if (deleteResult.success === false) {
            return sendResponse(deleteResult);
        }
        languageDeckResult.value.cards.forEach((card) => {
            card.data.tags = card.data.tags.filter((t) => t.id !== payload.tag.id);
        });
        const saveResult = await saveLanguageDeck(languageDeckResult.value);
        if (saveResult.success === false) {
            return sendResponse(saveResult);
        }
        return sendResponse({
            success: true,
            value: {
                ...payload.translationCards,
                deck: languageDeckResult.value,
            },
        });
    });
    onGetLanguagePairs(async (sendResponse) => {
        return sendResponse(languagePairs);
    });
    onGetExternalLanguagePairs(async (sendResponse) => {
        return sendResponse(languagePairs);
    });
    onSetExternalLanguagePairs(async (sendResponse, newLanguagePairs) => {
        await setLanguagePairs(newLanguagePairs);
        return sendResponse();
    });
    onAnalyzeUnitsOfSpeech(async (sendResponse, payload) => {
        return sendResponse(await publicAnalyzeUnitsOfSpeech(payload));
    });
};

;// ../../node_modules/@vocably/pontis/dist/esm/extension-storage-operations.js
const keyPrefix = '@Auth_';
const createStorageKey = (key) => `${keyPrefix}${key}`;
const isStorageKey = (key) => key.startsWith(keyPrefix);
const getKey = (storageKey) => storageKey.replace(keyPrefix, '');
const setItems = (storage, items) => new Promise((resolve, reject) => {
    try {
        storage.set(Object.entries(items).reduce((acc, [key, value]) => (Object.assign(Object.assign({}, acc), { [createStorageKey(key)]: value })), {}), resolve);
    }
    catch (e) {
        reject(e);
    }
});
const getItem = (storage, key) => new Promise((resolve, reject) => {
    try {
        const storageKey = createStorageKey(key);
        storage.get(storageKey, (data) => resolve(Object.prototype.hasOwnProperty.call(data, storageKey)
            ? data[storageKey]
            : null));
    }
    catch (e) {
        reject(e);
    }
});
const removeItems = (storage, keys) => new Promise((resolve, reject) => {
    try {
        storage.remove(keys.map(createStorageKey), resolve);
    }
    catch (e) {
        reject(e);
    }
});
const extension_storage_operations_get = (storage) => new Promise((resolve, reject) => {
    try {
        storage.get(resolve);
    }
    catch (e) {
        reject(e);
    }
});
const getAll = (storage) => extension_storage_operations_get(storage).then((data) => Object.entries(data).reduce((acc, [storageKey, value]) => {
    if (!isStorageKey(storageKey)) {
        return acc;
    }
    return Object.assign(Object.assign({}, acc), { [getKey(storageKey)]: value });
}, {}));
const clearAll = (storage) => extension_storage_operations_get(storage).then((allData) => new Promise((resolve, reject) => {
    try {
        storage.remove(Object.keys(allData).filter(isStorageKey), resolve);
    }
    catch (e) {
        reject(e);
    }
}));

;// ../../node_modules/@vocably/pontis/dist/esm/extension-auth-storage.js
var extension_auth_storage_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

/**
 * The extension side of the bridge.
 *
 * Backed directly by `chrome.storage`, so the values stay in sync with whatever
 * the website has pushed, across service worker restarts and (for the `sync`
 * area) across devices.
 */
class ExtensionAuthStorage {
    constructor(storage) {
        this.storage = storage;
    }
    setItem(key, value) {
        return extension_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield setItems(this.storage, { [key]: value });
        });
    }
    getItem(key) {
        return getItem(this.storage, key);
    }
    removeItem(key) {
        return extension_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield removeItems(this.storage, [key]);
        });
    }
    clear() {
        return extension_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield clearAll(this.storage);
        });
    }
    getAll() {
        return getAll(this.storage);
    }
}

;// ../../node_modules/@vocably/pontis/dist/esm/extension-operations.js

const scope = 'authStorage';
const [setItem, onSetItemRequest] = createExternalMessage(`${scope}.setItem`);
const [removeItem, onRemoveItemRequest] = createExternalMessage(`${scope}.removeItem`);
const [extension_operations_getAll, onGetAllRequest] = createExternalMessage(`${scope}.getAll`);
const [clear, onClearRequest] = createExternalMessage(`${scope}.clear`);

;// ../../node_modules/@vocably/pontis/dist/esm/register-extension-storage.js
var register_extension_storage_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


const registerExtensionStorage = (storageType) => {
    const extensionStorage = chrome.storage[storageType];
    const authStorage = new ExtensionAuthStorage(extensionStorage);
    onSetItemRequest((sendResponse, { key, value }) => register_extension_storage_awaiter(void 0, void 0, void 0, function* () {
        yield authStorage.setItem(key, value);
        return sendResponse();
    }));
    onRemoveItemRequest((sendResponse, key) => register_extension_storage_awaiter(void 0, void 0, void 0, function* () {
        yield authStorage.removeItem(key);
        return sendResponse();
    }));
    onClearRequest((sendResponse) => register_extension_storage_awaiter(void 0, void 0, void 0, function* () {
        yield authStorage.clear();
        sendResponse();
    }));
    onGetAllRequest((sendResponse) => register_extension_storage_awaiter(void 0, void 0, void 0, function* () {
        return sendResponse(yield authStorage.getAll());
    }));
    return authStorage;
};

;// ../../node_modules/@vocably/pontis/dist/esm/app-auth-storage.js
/* unused harmony import specifier */ var app_auth_storage_defaultStorage;
/* unused harmony import specifier */ var app_auth_storage_setItem;
/* unused harmony import specifier */ var app_auth_storage_removeItem;
/* unused harmony import specifier */ var app_auth_storage_clear;
/* unused harmony import specifier */ var app_auth_storage_getAll;
var app_auth_storage_awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};


/**
 * The website side of the bridge.
 *
 * Reads and writes are served by a regular browser storage (`localStorage` by
 * default), and every mutation is mirrored into the extension. On the very
 * first operation the storage pulls whatever the extension already holds, so
 * a freshly opened website picks up the session the extension is signed in with.
 *
 * Extension round trips never reject into Amplify: when the extension is not
 * installed, disabled, or updating, the website keeps working on its own storage.
 */
class AppAuthStorage {
    constructor(extensionId, localStorage = app_auth_storage_defaultStorage) {
        this.extensionId = extensionId;
        this.localStorage = localStorage;
        this.syncPromise = null;
    }
    setItem(key, value) {
        return app_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield this.sync();
            yield this.localStorage.setItem(key, value);
            app_auth_storage_setItem(this.extensionId, { key, value }).catch(() => { });
        });
    }
    getItem(key) {
        return app_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield this.sync();
            return this.localStorage.getItem(key);
        });
    }
    removeItem(key) {
        return app_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield this.sync();
            yield this.localStorage.removeItem(key);
            app_auth_storage_removeItem(this.extensionId, key).catch(() => { });
        });
    }
    clear() {
        return app_auth_storage_awaiter(this, void 0, void 0, function* () {
            yield this.sync();
            yield this.localStorage.clear();
            app_auth_storage_clear(this.extensionId).catch(() => { });
        });
    }
    /**
     * Copies the extension's items into the local storage. Performed once per
     * instance, before the first storage operation.
     */
    sync() {
        if (this.syncPromise) {
            return this.syncPromise;
        }
        this.syncPromise = app_auth_storage_getAll(this.extensionId)
            .then((data) => app_auth_storage_awaiter(this, void 0, void 0, function* () {
            for (const [key, value] of Object.entries(data)) {
                yield this.localStorage.setItem(key, value);
            }
        }))
            .catch(() => { });
        return this.syncPromise;
    }
}

;// ../../node_modules/@vocably/pontis/dist/esm/index.js




;// ./src/browserEnv.ts
let src_browserEnv_browserEnv;
if (typeof chrome !== 'undefined') {
    src_browserEnv_browserEnv = chrome;
}
else if (typeof browser !== 'undefined') {
    src_browserEnv_browserEnv = browser;
}
const browserEnv_hasOffscreen = (browserEnv) => {
    return !!browserEnv['offscreen'];
};

;// ./src/service-worker.ts



const service_worker_storage = registerExtensionStorage('sync');
registerServiceWorker({
    auth: {
        userPoolId: "eu-central-1_7fL0W5Axi",
        userPoolWebClientId: "l0ng8n755dine5q5t0hcip768",
        storage: service_worker_storage,
    },
    api: {
        publicBaseUrl: "https://public-api.vocably.pro",
        baseUrl: "https://api.vocably.pro",
        region: "eu-central-1",
        cardsBucket: "vocably-prod-cards",
        getJwtToken: getIdToken,
    },
    facility: 'chrome-or-safari',
    unlimitedMaxCards: true,
});
src_browserEnv_browserEnv.contextMenus.create({
    id: 'context-menu-item',
    title: 'Translate with Vocably',
    contexts: ['selection'],
});
src_browserEnv_browserEnv.contextMenus.onClicked.addListener((info, tab) => {
    src_browserEnv_browserEnv.tabs.sendMessage(tab.id, {
        action: 'contextMenuTranslateClicked',
    });
});

})();

/******/ })()
;
//# sourceMappingURL=service-worker.js.map