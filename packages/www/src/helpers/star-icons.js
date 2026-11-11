// star-icons.js
// Renders five Bootstrap star icons, filled according to the rating.
const Handlebars = require('handlebars');

module.exports = function (stars) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(stars) || 0)));
  let html = '';
  for (let i = 0; i < 5; i++) {
    html += `<i class="bi ${i < rating ? 'bi-star-fill' : 'bi-star'}"></i>`;
  }
  return new Handlebars.SafeString(html);
};
