import React from "react";
import { Row, Col, Button } from "reactstrap";

export default function Pagination({
  dataLength,
  itemsPerPage,
  currentPage,
  searchValue,
  setCurrentPage,
  extraInfo,
}) {
  const pageCount = Math.ceil(dataLength / itemsPerPage);

  let pageList = [];

  for (let page = 1; page <= pageCount; page++) {
    pageList.push(page);
  }

  const lastPage = pageList[pageList.length - 1];

  let pageButtonsList = [];

  pageButtonsList =
    pageCount > 3
      ? currentPage === 1
        ? pageList.filter((page) => page <= 3)
        : currentPage === lastPage
        ? pageList.splice(pageList.length - 3, 3)
        : pageList.splice(pageList.indexOf(currentPage) - 1, 3)
      : pageList;

  return (
    <Row className="pagination mt-3">
      <Col xs="12" md="auto" className="total-entries">
        {searchValue !== ""
          ? `Entries including search: ${dataLength}`
          : `Total entries: ${dataLength}`}
      </Col>
      {extraInfo ? extraInfo() : null}
      {itemsPerPage !== "All" && (
        <Col xs="12" md="auto" className="text-right ml-auto">
          <Button
            color={currentPage == 1 ? "disabled" : "neutral"}
            onClick={() => {
              setCurrentPage(1);
            }}
            className="pr-0"
          >
            <i className="now-ui-icons arrows-1_minimal-left" />
            <i className="now-ui-icons arrows-1_minimal-left" />
          </Button>
          <Button
            color={currentPage == 1 ? "disabled" : "neutral"}
            onClick={() => {
              setCurrentPage(currentPage - 1);
            }}
            className="ml-0"
          >
            <i className="now-ui-icons arrows-1_minimal-left" />
          </Button>
          {pageButtonsList.map((page) => (
            <Button
              key={page}
              color={page === currentPage ? "primary" : "neutral"}
              onClick={() => {
                setCurrentPage(page);
              }}
            >
              {page}
            </Button>
          ))}
          <Button
            color={currentPage >= pageCount ? "disabled" : "neutral"}
            onClick={() => {
              setCurrentPage(currentPage + 1);
            }}
          >
            <i className="now-ui-icons arrows-1_minimal-right" />
          </Button>
          <Button
            color={currentPage == lastPage ? "disabled" : "neutral"}
            onClick={() => {
              setCurrentPage(lastPage);
            }}
            className="ml-0"
          >
            <i className="now-ui-icons arrows-1_minimal-right" />
            <i className="now-ui-icons arrows-1_minimal-right" />
          </Button>
        </Col>
      )}
    </Row>
  );
}
