import React from "react";
import { Col } from "reactstrap";
import Value from "./Value";

export default function CollapsableBlock({
  index,
  data,
  columns,
  searchValue,
  link,
}) {
  const headers = Object.keys(columns).filter(
    (header) => !("visibleOnTablet" in columns[header])
  );
  let activeHeaders = headers;
  activeHeaders?.map((x) => {
    if (columns[x]?.hideOnTable) {
      if (columns[x].hideOnTable(data))
        activeHeaders = activeHeaders.filter((y) => y !== x);
    }
  });
  return (
    <Col
      onClick={() => {
        link && data[link] ? window.open("http://" + data[link]) : null;
      }}
    >
      {activeHeaders.map((header) => (
        <React.Fragment key={header}>
          <div className="label">{header}:</div>
          <div
            className={`${
              columns[header].className ? columns[header].className : ""
            } mb-2`}
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
          </div>
        </React.Fragment>
      ))}
    </Col>
  );
}
