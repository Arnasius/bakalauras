/**
 * Simple object check.
 * @param item
 * @returns {boolean}
 */
function isObject(item) {
  return item && typeof item === "object" && !Array.isArray(item);
}

/**
 * Deep merge two objects.
 * @param target
 * @param ...sources
 */
function mergeDeep(target, ...sources) {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) Object.assign(target, { [key]: {} });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, { [key]: source[key] });
      }
    }
  }

  return mergeDeep(target, ...sources);
}

function copyDeep(data) {
  return JSON.parse(JSON.stringify(data));
}

function equalsDeep(x, y) {
  if (x === y) return true;
  // if both x and y are null or undefined and exactly the same

  if (!(x instanceof Object) || !(y instanceof Object)) return false;
  // if they are not strictly equal, they both need to be Objects

  if (x.constructor !== y.constructor) return false;
  // they must have the exact same prototype chain, the closest we can do is
  // test there constructor.

  for (var p in x) {
    if (!Object.prototype.hasOwnProperty.call(x, p)) continue;
    // other properties were tested using x.constructor === y.constructor

    if (!Object.prototype.hasOwnProperty.call(y, p)) return false;
    // allows to compare x[ p ] and y[ p ] when set to undefined

    if (x[p] === y[p]) continue;
    // if they have the same strict value or identity then they are equal

    if (typeof x[p] !== "object") return false;
    // Numbers, Strings, Functions, Booleans must be strictly equal

    if (!equalsDeep(x[p], y[p])) return false;
    // Objects and Arrays must be tested recursively
  }

  for (p in y) {
    if (
      Object.prototype.hasOwnProperty.call(y, p) &&
      !Object.prototype.hasOwnProperty.call(x, p)
    )
      return false;
    // allows x[ p ] to be set to undefined
  }
  return true;
}

function getAverage(arr) {
  return Math.round(arr.reduce((a, b) => a + b, 0) / arr.length);
}

function filterObjects(data, columns, allHeaders, searchValue) {
  let filteredData = [];

  data.map((data) => {
    allHeaders.map((header) => {
      String(
        columns[header].format
          ? [columns[header].format(data)]
          : data[columns[header].value]
      )
        ?.toString()
        .toLowerCase()
        .includes(searchValue) &&
        !filteredData.includes(data) &&
        filteredData.push(data);
    });
  });

  return filteredData;
}

function sortObjects(
  property,
  secondaryProperty,
  order,
  parseFormat,
  secondaryParseFormat
) {
  order = order === "ascending" ? 1 : -1;

  return function (firstObject, secondObject) {
    let firstProperty = getSortProperty(parseFormat, firstObject, property);
    let secondProperty = getSortProperty(parseFormat, secondObject, property);
    let result;

    if (firstProperty === secondProperty && secondaryProperty) {
      let firstProperty = getSortProperty(
        secondaryParseFormat,
        firstObject,
        secondaryProperty
      );
      let secondProperty = getSortProperty(
        secondaryParseFormat,
        secondObject,
        secondaryProperty
      );

      result = getSortResult(firstProperty, secondProperty, order);
    } else {
      result = getSortResult(firstProperty, secondProperty, order);
    }

    return result;
  };
}

function getSortProperty(format, object, property) {
  if (typeof object[property] == "undefined") {
    return Math.max();
  }

  if (format) {
    if (isNaN(format(object[property]))) {
      return 0;
    } else {
      return format(object[property]);
    }
  } else if (Array.isArray(object[property])) {
    return object[property][0]?.toString().toLowerCase();
  }

  return object[property]?.toString().toLowerCase();
}

function getSortResult(firstProperty, secondProperty, order) {
  return firstProperty < secondProperty
    ? -1 * order
    : firstProperty > secondProperty
    ? 1 * order
    : 0;
}

function getNestedValue(obj, key) {
  if (key in obj) {
    return obj[key];
  } else {
    for (let k in obj) {
      let t = obj[k];
      if (typeof t === "object" && !Array.isArray(t) && t !== null) {
        return getNestedValue(t, key);
      }
    }
  }
  return false;
}

function getNestedValues(obj, key, values) {
  if (!values) values = [];

  if (key in obj) {
    values.push(obj[key]);
  } else {
    for (let k in obj) {
      let t = obj[k];
      if (typeof t === "object" && !Array.isArray(t) && t !== null) {
        getNestedValues(t, key, values);
      }
    }
  }

  return values;
}

export {
  copyDeep,
  mergeDeep,
  equalsDeep,
  getAverage,
  filterObjects,
  sortObjects,
  getNestedValue,
  getNestedValues,
};
