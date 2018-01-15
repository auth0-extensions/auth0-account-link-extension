
export default function humanizeArray(items, beforeLast = 'and') {
  return items.length > 2
    ? items
      .join(', ')
      .split(' ')
      .map(
        (value, index) =>
          (index == items.length - 2 ? value.replace(',', ` ${beforeLast}`) : value)
      )
      .join(' ')
    : beforeLast === ',' ? items.join(`${beforeLast} `) : items.join(` ${beforeLast} `);
}
