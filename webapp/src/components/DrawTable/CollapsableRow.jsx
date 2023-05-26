import React from "react";
import { Table } from "reactstrap";
import Value from "./Value";

export default function CollapsableRow({
  index,
  data,
  columns,
  headers,
  emptySpans,
  searchValue,
  noHeaders,
}) {
  let emptySpansArray = [];

  if (emptySpans) {
    for (let i = 1; i <= emptySpans - headers.length; i++) {
      emptySpansArray.push(i);
    }
  }

  let activeHeaders = headers;
  activeHeaders?.map((x) => {
    if (columns[x]?.hideOnTable) {
      if (columns[x].hideOnTable(data))
        activeHeaders = activeHeaders.filter((y) => y !== x);
    }
  });

  return (
    <Table size="sm m-0" responsive>
      {noHeaders ? null : (
        <thead>
          <tr>
            {activeHeaders.map((header) => (
              <th key={header}>{header}</th>
            ))}
          </tr>
        </thead>
      )}

      <tbody>
        <tr>
          {activeHeaders.map((header) => (
            <td
              key={header}
              className={
                columns[header].className ? columns[header].className : ""
              }
              style={
                !columns[header].width
                  ? {
                      width: columns[header].width,
                    }
                  : {}
              }
            >
              {columns[header].component ? (
                columns[header].component(data, index, searchValue)
              ) : (
                <Value
                  header={header}
                  data={data}
                  columns={columns}
                  searchValue={searchValue}
                />
              )}
            </td>
          ))}

          {emptySpans &&
            !noHeaders &&
            emptySpansArray.map((index) => <td key={index} />)}
        </tr>
      </tbody>
    </Table>
  );
}
