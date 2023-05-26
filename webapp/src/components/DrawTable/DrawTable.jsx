import React from "react";

import CheckIfTablet from "state/isTablet";
import { filterObjects, sortObjects } from "services/utils";

import TableRow from "./TableRow";
import ColumnHeader from "./ColumnHeader";
import Pagination from "./Pagination";

import { Table, Row, Col } from "reactstrap";
import SearchField from "components/Fields/SearchField";
import GenericInputField from "components/Fields/GenericInputField";

@CheckIfTablet
export default class DrawTable extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
    this.state.data = this.props.data;
    this.state.dataLength = this.props.data ? this.props.data.length : 0;
    this.state.allHeaders = Object.keys(this.props.columns);
    this.state.sortOrder =
      typeof this.props.sort === "object" && this.props.sort.order
        ? this.props.sort.order
        : "ascending";
    this.state.sortColumn =
      typeof this.props.sort === "object" && this.props.sort.value
        ? this.props.sort.value
        : Object.keys(this.props.columns)[0];
    this.state.searchValue = "";
    this.state.currentPage = 1;
    this.state.itemsPerPage = 10;

    this.setSortOrder = this.setSortOrder.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleToggle = this.handleToggle.bind(this);
    this.setCurrentPage = this.setCurrentPage.bind(this);
    this.isCollapsable = this.isCollapsable.bind(this);
  }

  componentDidMount() {
    const { additionalSpans, data, search, sort, paginate } = this.props;
    if (this.props.itemsPerPage)
      this.setState({ itemsPerPage: this.props.itemsPerPage });
    this.getHeaders();
    data && this.getModifiedData(data, search, sort, paginate);
    additionalSpans && this.getEmptySpansArray();
  }

  componentDidUpdate(prevProps, _prevState) {
    const { data, search, isTablet, sort, paginate } = this.props;
    const { sortOrder, sortColumn, searchValue, currentPage, itemsPerPage } =
      this.state;
    if (
      data !== prevProps.data ||
      sortOrder !== _prevState.sortOrder ||
      sortColumn !== _prevState.sortColumn ||
      currentPage !== _prevState.currentPage ||
      itemsPerPage !== _prevState.itemsPerPage
    ) {
      this.getModifiedData(data, search, sort, paginate);
    }

    if (data !== prevProps.data) {
      this.setState({ dataLength: data.length });
    }

    if (
      itemsPerPage !== _prevState.itemsPerPage ||
      searchValue !== _prevState.searchValue
    ) {
      this.setState({ currentPage: 1 });
    }

    if (isTablet !== prevProps.isTablet) {
      this.getHeaders();
      this.setState({ activeRow: null });
    }

    if (searchValue !== _prevState.searchValue) {
      searchValue === "" && this.setState({ dataLength: data.length });

      this.getModifiedData(
        searchValue.length ? data : this.props.data,
        search,
        sort,
        paginate
      );
    }
  }

  getHeaders() {
    const { columns, isTablet } = this.props;

    let headers = [];
    let secondRowHeaders = [];

    Object.keys(columns).map((header) =>
      "secondRow" in columns[header]
        ? secondRowHeaders.push(header)
        : headers.push(header)
    );

    isTablet &&
      (headers = headers.filter(
        (header) => "visibleOnTablet" in columns[header]
      ));

    this.setState({ headers, secondRowHeaders });
  }

  getEmptySpansArray() {
    const { additionalSpans } = this.props;

    let emptySpansArray = [];

    for (let i = 1; i <= additionalSpans; i++) {
      emptySpansArray.push(i);
    }

    this.setState({ emptySpansArray });
  }

  handleInputChange(e) {
    this.setState({ [e.target.name]: e.target.value });
  }

  handleToggle(index) {
    const { activeRow } = this.state;
    this.setState({ activeRow: activeRow === index ? null : index });
  }

  setSortOrder(value) {
    const { sortOrder, sortColumn } = this.state;

    this.setState({
      sortOrder:
        sortOrder === "descending" || sortColumn != value
          ? "ascending"
          : "descending",
      sortColumn: value,
      activeRow: null,
    });
  }

  setCurrentPage(value) {
    this.setState({ currentPage: value });
  }

  sortData(data) {
    const { sortOrder, sortColumn } = this.state;
    const { columns } = this.props;
    const {
      value,
      sortValue,
      secondarySortValue,
      sortFormat,
      secondarySortValueFormat,
    } = columns[sortColumn];

    return data.sort(
      sortObjects(
        sortValue ? sortValue : value,
        secondarySortValue ? secondarySortValue : "",
        sortOrder,
        sortFormat ? sortFormat : null,
        secondarySortValueFormat ? secondarySortValueFormat : null
      )
    );
  }

  paginateData(data) {
    const { currentPage, itemsPerPage } = this.state;

    if (itemsPerPage === "All") {
      return data;
    }

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;

    return data.slice(indexOfFirstItem, indexOfLastItem);
  }

  searchData(data) {
    const { columns } = this.props;
    const { searchValue, allHeaders } = this.state;

    const filteredData = filterObjects(
      data,
      columns,
      allHeaders,
      searchValue?.toLowerCase()
    );

    this.setState({ dataLength: filteredData.length });

    return filteredData;
  }

  getModifiedData(data, search, sort, paginate) {
    let modifiedData = data;

    sort && (modifiedData = this.sortData(modifiedData));
    search && (modifiedData = this.searchData(modifiedData));
    paginate && (modifiedData = this.paginateData(modifiedData));

    this.setState({ data: modifiedData });
  }

  getMessage() {
    const { noDataMessage, errorMessage } = this.props;
    const { searchValue } = this.state;

    if (errorMessage) {
      return errorMessage;
    } else if (searchValue !== "") {
      return "No results";
    } else {
      return noDataMessage || "No data";
    }
  }

  isCollapsable(data, prop) {
    if (typeof prop === "function") {
      return prop(data);
    }
    if (prop == true || prop == false) {
      return prop;
    } else {
      return data[prop];
    }
  }

  render() {
    const {
      data,
      dataLength,
      headers,
      secondRowHeaders,
      activeRow,
      emptySpansArray,
      sortColumn,
      sortOrder,
      searchValue,
      currentPage,
      itemsPerPage,
    } = this.state;

    const {
      columns,
      isTablet,
      errorMessage,
      sort,
      search,
      tableActions,
      extraInfo,
      paginate,
      layout,
      action,
      link,
      collapsable,
      highlightedRow,
      equalWidthColumns,
      deleted,
      reduceLastChild,
      labelLastChild,
      propsClass,
      noHeaders,
    } = this.props;

    const hasData = data && data.length;
    let rowSpan = headers && headers.length;
    let colWidth = headers && equalWidthColumns ? 100 / rowSpan : null;

    return (
      <>
        {(hasData && paginate) ||
        tableActions ||
        (hasData && search) ||
        (search && searchValue.length) ? (
          <Row className="table-actions">
            {hasData && paginate ? (
              <Col xs="auto" md="auto" lg="auto" xl="auto">
                <GenericInputField
                  type="select"
                  label="Show:"
                  name="itemsPerPage"
                  value={itemsPerPage}
                  labelPosition="left"
                  onChange={this.handleInputChange}
                >
                  <option value="5">5</option>
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="All">All</option>
                </GenericInputField>
              </Col>
            ) : null}

            {tableActions ? tableActions(data) : null}

            {(hasData && search) || (search && searchValue.length) ? (
              <Col xs="12" xl="4" className="ml-auto">
                <SearchField
                  name="searchValue"
                  value={searchValue}
                  onChange={this.handleInputChange}
                  maxLength="150"
                  clearValue={() => {
                    this.setState({ searchValue: "" });
                  }}
                />
              </Col>
            ) : null}
          </Row>
        ) : null}

        <Table
          borderless
          size="sm"
          className={`mb-0 table-hover ${emptySpansArray ? "table-fixed" : ""}
           ${layout === "fixed" ? "table-layout-fixed" : ""} ${propsClass}`}
        >
          <thead>
            <tr>
              {headers &&
                headers.map((header) => (
                  <ColumnHeader
                    key={header}
                    reduceLastChild={
                      headers[headers.length - 1] === header
                        ? reduceLastChild
                        : ""
                    }
                    labelLastChild={
                      headers[headers.length - 1] === header
                        ? labelLastChild
                        : ""
                    }
                    header={header}
                    columns={columns}
                    sort={sort}
                    sortOrder={sortOrder}
                    sortColumn={sortColumn}
                    setSortOrder={this.setSortOrder}
                  />
                ))}
              {action && <th />}
              {emptySpansArray && !isTablet
                ? emptySpansArray.map((index) => <th key={index} />)
                : null}
            </tr>
          </thead>

          <tbody>
            {hasData && headers ? (
              data.map((data, index) => (
                <React.Fragment key={index}>
                  <TableRow
                    index={index}
                    data={data}
                    deleted={deleted}
                    columns={columns}
                    headers={headers}
                    secondRowHeaders={secondRowHeaders}
                    isTablet={isTablet}
                    activeRow={activeRow}
                    handleToggle={this.handleToggle}
                    emptySpansArray={emptySpansArray}
                    searchValue={searchValue?.toLowerCase()}
                    action={action}
                    link={link}
                    rowSpan={rowSpan}
                    collapsable={this.isCollapsable(data, collapsable)}
                    highlightedRow={highlightedRow}
                    colWidth={colWidth}
                    noHeaders={noHeaders}
                  />
                </React.Fragment>
              ))
            ) : (
              <tr>
                <td
                  colSpan={headers && headers.length}
                  className={errorMessage ? "error-message" : ""}
                >
                  {this.getMessage()}
                </td>
              </tr>
            )}
          </tbody>
        </Table>

        {secondRowHeaders &&
        secondRowHeaders.length &&
        !collapsable &&
        !isTablet ? (
          <Table borderless size="sm" className="mb-0 table-fixed table-hover">
            <thead>
              <tr>
                {secondRowHeaders &&
                  secondRowHeaders.map((header) => (
                    <ColumnHeader
                      key={header}
                      header={header}
                      columns={columns}
                      sort={sort}
                      sortOrder={sortOrder}
                      sortColumn={sortColumn}
                      setSortOrder={this.setSortOrder}
                    />
                  ))}
                {action && <th />}
                {emptySpansArray && !isTablet
                  ? emptySpansArray.map((index) => <th key={index} />)
                  : null}
              </tr>
            </thead>

            <tbody>
              {hasData && secondRowHeaders
                ? data.map((data, index) => (
                    <React.Fragment key={index}>
                      <TableRow
                        index={index}
                        data={data}
                        columns={columns}
                        headers={secondRowHeaders}
                        isTablet={isTablet}
                        activeRow={activeRow}
                        handleToggle={this.handleToggle}
                        emptySpansArray={emptySpansArray}
                        searchValue={searchValue?.toLowerCase()}
                        action={action}
                        link={link}
                        rowSpan={rowSpan}
                        colWidth={colWidth}
                      />
                    </React.Fragment>
                  ))
                : null}
            </tbody>
          </Table>
        ) : null}

        {hasData && paginate ? (
          <Pagination
            dataLength={dataLength}
            itemsPerPage={itemsPerPage}
            currentPage={currentPage}
            searchValue={searchValue}
            setCurrentPage={this.setCurrentPage}
            extraInfo={extraInfo}
          />
        ) : null}
      </>
    );
  }
}
