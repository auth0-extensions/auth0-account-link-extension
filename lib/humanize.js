
module.exports = function humanizeArray(items, beforeLast = 'and', oxfordComma = '') {
  const ensuredItems = items ? [...items] : [];
  if (items.length <= 1) return ensuredItems.join('');
  if (items.length === 2) return items.join(` ${beforeLast} `);

  const lastItem = ensuredItems.pop();

  return `${ensuredItems.join(', ')}${oxfordComma} ${beforeLast} ${lastItem}`;
};
