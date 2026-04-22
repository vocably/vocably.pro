// section.js
module.exports = function (name, options) {
  if (!this._sections) this._sections = {};
  this._sections[name] = options.fn(this);
  return null;
};
