export function mkid(length) {
  var possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return Array.apply(null, Array(length))
    .map(() => possible.charAt(Math.floor(Math.random() * possible.length)))
    .join("");
}

export function elementName(c) {
  return c.constructor.name;
}

const FIELD_SIZES = {
  sm: 5,
  md: 9,
  lg: 12,
};

export function sizeField(size) {
  return size === undefined ? "" : "col-md-" + (FIELD_SIZES[size] || size);
}
