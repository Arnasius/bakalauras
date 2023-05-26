import React from "react";

import {
  UncontrolledPopover,
  PopoverHeader,
  PopoverBody,
  Table,
  Tooltip,
} from "reactstrap";

import { configValues } from "services/filter";

function findRoute(tabs, item) {
  return tabs.find((t) => t.name === item.key.split(",")[0]);
}

export default function PreviewPopover({
  changes,
  count,
  hasErrors,
  tabChangeHandler,
  routes,
}) {
  return (
    <UncontrolledPopover
      placement="bottom"
      target="Popover"
      boundariesElement="#Popover"
      className="popover-config-changes popover-lg"
      trigger="legacy"
    >
      <PopoverHeader>
        {count} Configuration {hasErrors ? "error" : "change"}
        {count > 1 ? "s" : ""}:
      </PopoverHeader>
      <PopoverBody>
        <Table
          size="sm"
          className={`mb-0 table-clickable table-fixed table-header-fixed ${
            hasErrors ? "table-one-col" : "table-three-col"
          }`}
          borderless
          responsive
        >
          <thead>
            <tr>
              <th>Key</th>
              {!hasErrors ? (
                <>
                  <th>Old value</th>
                  <th>New value</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {changes().map((item, index) => {
              let route, pathname;
              let tab;
              Object.keys(routes).map((c) => {
                if (routes[c].tabs) {
                  tab = findRoute(routes[c].tabs, item);
                  if (tab) {
                    pathname = routes[c].path;
                    route = tab.path;
                  }
                }

                routes[c]?.children?.filter((x) => {
                  if (x?.tabs) tab = findRoute(x.tabs, item);
                  if (tab) {
                    pathname = x.path;
                    route = tab.path;
                  }
                });
              });

              return (
                <tr
                  key={index}
                  onClick={() => {
                    tabChangeHandler(route, pathname);
                  }}
                >
                  <td className="line-block" id={"tooltip-changes-" + index}>
                    <ChangesLabel item={item} tooltipIndex={index} />
                  </td>
                  {!hasErrors ? (
                    <>
                      <td>{configValues(item.old)}</td>
                      <td>{configValues(item.new)}</td>
                    </>
                  ) : null}
                </tr>
              );
            })}
          </tbody>
        </Table>
      </PopoverBody>
    </UncontrolledPopover>
  );
}

class ChangesLabel extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tooltipOpen: false,
    };

    this.toggleTooltip = this.toggleTooltip.bind(this);
  }

  toggleTooltip() {
    this.setState({
      tooltipOpen: !this.state.tooltipOpen,
    });
  }

  render() {
    const { item, tooltipIndex } = this.props;

    return (
      <>
        <LabelString item={item} />
        <Tooltip
          placement="left"
          isOpen={this.state.tooltipOpen}
          className="popover-config-changes insidePopover"
          target={"tooltip-changes-" + tooltipIndex}
          toggle={this.toggleTooltip}
          delay={0}
        >
          <LabelString item={item} />
        </Tooltip>
      </>
    );
  }
}

function LabelString({ item }) {
  return (
    <>
      {item.label.map((field, index) => (
        <span className={index >= 1 ? "notFirst" : ""} key={index}>
          {field}
        </span>
      ))}
    </>
  );
}
