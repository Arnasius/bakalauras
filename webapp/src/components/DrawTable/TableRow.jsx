import React from "react";
import CollapsableRow from "./CollapsableRow";
import CollapsableBlock from "./CollapsableBlock";
import Value from "./Value";

export default function TableRow({
  index,
  data,
  deleted,
  columns,
  headers,
  secondRowHeaders,
  isTablet,
  activeRow,
  handleToggle,
  emptySpansArray,
  searchValue,
  action,
  link,
  rowSpan,
  collapsable,
  highlightedRow,
  colWidth,
  noHeaders,
}) {
  let highlighted = false;
  let active2ndRowHeaders = secondRowHeaders;
  const disabled = deleted && deleted(data);

  if (highlightedRow) {
    const key = Object.keys(highlightedRow)[0];
    highlighted = highlightedRow[key] === data[key];
  }

  active2ndRowHeaders?.map((x) => {
    if (columns[x]?.hideOnTable) {
      if (columns[x].hideOnTable(data))
        active2ndRowHeaders = active2ndRowHeaders.filter((y) => y !== x);
    }
    if (!active2ndRowHeaders.length) data.hide = true;
  });

  let allowSecondRow = (collapsable && !data?.hide) || isTablet;

  return (
    <>
      <tr
        className={`${disabled ? "disabled" : ""} ${
          allowSecondRow && "arrow"
        } ${activeRow === index && "active"}`}
        style={{ backgroundColor: highlighted && "#c0defe" }}
      >
        {headers.map((header) => (
          <td
            key={header}
            onClick={() => {
              link && data[link] ? window.open("http://" + data[link]) : null;
            }}
            style={
              colWidth
                ? { width: colWidth + "%" }
                : columns[header].width
                ? {
                    width: columns[header].width,
                  }
                : {}
            }
            className={`${
              columns[header].className ? columns[header].className : ""
            } ${columns[header].hidden ? "hidden" : ""}`}
            colSpan={columns[header].colspan || 1}
          >
            {allowSecondRow && (
              <span
                className={`${activeRow === index ? "active" : "closed"}`}
                onClick={
                  allowSecondRow && header.length
                    ? () => handleToggle(index)
                    : null
                }
              />
            )}

            {columns[header].component ? (
              columns[header].component(data, index, searchValue)
            ) : (
              <Value
                index={index}
                header={header}
                data={data}
                columns={columns}
                searchValue={searchValue}
              />
            )}
          </td>
        ))}

        {action ? (
          <td
            onClick={() => {
              action.func(data);
            }}
          >
            {action.component}
          </td>
        ) : null}

        {emptySpansArray &&
          !isTablet &&
          emptySpansArray.map((index) => <td key={index} />)}
      </tr>

      {activeRow === index && allowSecondRow ? (
        <tr>
          <td
            className={noHeaders ? "px-0 pt-0" : "px-0 py-0"}
            colSpan={
              emptySpansArray && !isTablet
                ? emptySpansArray.length + rowSpan
                : rowSpan
            }
          >
            {isTablet ? (
              <CollapsableBlock
                index={index}
                data={data}
                columns={columns}
                searchValue={searchValue}
                link={link}
              />
            ) : (
              <CollapsableRow
                index={index}
                data={data}
                columns={columns}
                headers={active2ndRowHeaders}
                searchValue={searchValue}
                emptySpans={
                  emptySpansArray ? emptySpansArray.length + rowSpan : rowSpan
                }
                noHeaders={noHeaders}
              />
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}
