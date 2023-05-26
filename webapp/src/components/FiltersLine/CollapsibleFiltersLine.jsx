import React, { Component } from "react";
import { Row, Button } from "reactstrap";

import Checkbox from "../Fields/Checkbox";
export default class CollabsibleFiltersLine extends Component {
  constructor(props) {
    super(props);
    this.returFirstComponent = this.returFirstComponent.bind(this);
    this.returnComponent = this.returnComponent.bind(this);
  }

  returFirstComponent() {
    const { list, changeValue, options, optionsTitle, isMulti } =
      this.props.firstHideFilter;

    return (
      <>
        {!isMulti
          ? null
          : Object.keys(options)?.map((x, y) => {
              return (
                <div
                  key={y}
                  className="my-2 px-2 border-right filter-component"
                >
                  <div className="pb-2">
                    {" "}
                    {optionsTitle?.[x]
                      ? `${optionsTitle[x]} values:`
                      : "Values:"}{" "}
                  </div>
                  {options[x].map((option, i) => {
                    let value = option.value.toString();
                    let name = option.name;
                    let isLast = list[0].toString() === value;

                    return (
                      <div key={i}>
                        <Checkbox
                          name={value}
                          label={name}
                          value={value}
                          disabled={list.length <= 1 && isLast}
                          checked={
                            list.includes(value) || (list.length <= 1 && isLast)
                          }
                          onChange={(e) => {
                            changeValue(value, e);
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
      </>
    );
  }

  returnComponent(data) {
    const { label, defaultValue, onChange, options, key } = data;
    let className = `border-right filter-component my-2 px-2 ${
      data?.props?.className ? data.props.className : ""
    } `;
    return (
      <div className={className}>
        <div className="pb-2">{label}</div>
        {options?.map((option, i) => {
          let { value } = option;
          let name = option.name;
          return (
            <div key={i} className="">
              <Checkbox
                name={value}
                type="radio"
                label={name}
                value={value}
                checked={value === defaultValue}
                onChange={(e) => {
                  onChange(e, key, defaultValue);
                }}
              />
            </div>
          );
        })}
      </div>
    );
  }

  render() {
    const { secondHideFilter, thirdHideFilter, openFilters } = this.props;
    const className = `form-group filters-block m-0 ${
      openFilters ? "active" : "closed"
    }`;

    return (
      <>
        <Button
          onClick={() => this.props.toggleFilters(!openFilters)}
          color="transparent"
          className="text-gray m-0 p-0"
        >
          <div className={`p-1 icon ${openFilters ? "active" : "closed"}`}>
            <i className="icon-filter d-none" />
            <span className="m-0">Filter graph </span>
            <i
              className={`now-ui-icons ml-1 align-middle ${
                openFilters ? " arrows-1_minimal-up" : " arrows-1_minimal-down"
              }`}
            />
          </div>
        </Button>
        <Row className={className}>
          {this.returnComponent({
            ...thirdHideFilter,
            props: { className: "thirdFilter d-none" },
          })}
          {!secondHideFilter || !secondHideFilter?.defaultValue
            ? null
            : this.returnComponent(secondHideFilter)}
          {this.returFirstComponent()}
        </Row>
      </>
    );
  }
}
