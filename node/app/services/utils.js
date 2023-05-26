function validateData(obj, arr) {
  return Object.keys(obj).every((e) => arr.includes(e));
}

function copyDeep(data) {
  return JSON.parse(JSON.stringify(data));
}

function formSingleUpdateQuery(data, table, whereKey) {
  // All db tables, which we need to update for some reason
  // Should have `updateddate`collumn
  data.updateddate = new Date().toUTCString();

  const args = Object.values(data);
  const keys = Object.keys(data).join(",");
  const argKeys = Object.keys(data)
    .map((obj, index) => {
      return "$" + (index + 1);
    })
    .join(",");
  if (typeof whereKey == "string") {
    return [
      "UPDATE " +
        table +
        " SET (" +
        keys +
        ") = (" +
        argKeys +
        ") WHERE " +
        whereKey +
        " = " +
        data[whereKey],
      args,
    ];
  } else {
    const whereKeys = whereKey
      .map((obj) => {
        return `${obj} = ${data[obj]}`;
      })
      .join(" AND ");

    return [
      "UPDATE " +
        table +
        " SET (" +
        keys +
        ") = (" +
        argKeys +
        ") WHERE " +
        whereKeys,
      args,
    ];
  }
}

// expand(3, 2) returns "($1, $2), ($3, $4), ($5, $6)"
function expand(rowCount, columnCount, startAt = 1) {
  var index = startAt;
  return Array(rowCount)
    .fill(0)
    .map(
      () =>
        `(${Array(columnCount)
          .fill(0)
          .map(() => `$${index++}`)
          .join(", ")})`
    )
    .join(", ");
}

// flatten([[1, 2], [3, 4]]) returns [1, 2, 3, 4]
function flatten(arr) {
  var newArr = [];
  arr.forEach((v) => v.forEach((p) => newArr.push(p)));
  return newArr;
}

function deviceStatus(data) {
  let currentDate = new Date();

  data.map((device) => {
    let time =
      currentDate.getTime() / 1000 -
      Date.parse(new Date(device.heartbeat)) / 1000;
    if (time > 180) {
      device.status = false;
    } else {
      device.status = true;
    }
  });
  return data;
}

module.exports = {
  validateData,
  formSingleUpdateQuery,
  copyDeep,
  expand,
  flatten,
  deviceStatus,
};
