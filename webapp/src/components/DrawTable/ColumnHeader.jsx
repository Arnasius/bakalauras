import React from "react";

export default function ColumnHeader(props) {
  const {
    header,
    columns,
    sort,
    sortOrder,
    sortColumn,
    setSortOrder,
    reduceLastChild,
    labelLastChild,
  } = props;
  const sortable = sort && header.length;
  const hideSort = columns[header]?.hideSort;
  return (
    <th
      className={`${sort && !hideSort ? "sort" : ""} ${
        reduceLastChild ? "reduce-child" : ""
      } ${labelLastChild ? "text-right d-md-none" : ""} ${
        columns[header].hidden ? "hidden" : ""
      } ${
        columns[header].headerClassname ? columns[header].headerClassname : ""
      } `}
      onClick={() => {
        if (sortable && !hideSort) return setSortOrder(header);
      }}
      colSpan={columns[header].colspan || 1}
    >
      <div>
        {columns[header].customHeader ? (
          columns[header].customHeader()
        ) : (
          <div>{header}</div>
        )}
        {sortable && !hideSort ? (
          <div>
            <i
              id={header}
              className={
                "now-ui-icons arrows-1_minimal-up" +
                (sortOrder === "ascending" && sortColumn === header
                  ? " active"
                  : "")
              }
            />
            <i
              id={header}
              className={
                "now-ui-icons arrows-1_minimal-down" +
                (sortOrder === "descending" && sortColumn === header
                  ? " active"
                  : "")
              }
            />
          </div>
        ) : null}
      </div>
    </th>
  );
}
