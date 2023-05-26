import React from "react";
import { Row, Col, Card, CardHeader, CardBody } from "reactstrap";

import { DashboardConfigForm } from "state/dashboardConfig";

@DashboardConfigForm
export class SystemInformationPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      editMode,
      dashboardConfig,
      widgetsList,
      isTablet,
      handleDrag,
      handleDrop,
      style,
      draggedElement,
      getWidgetEditButtons,
      getDropZoneClassName,
    } = this.props;

    const rows = Object.keys(dashboardConfig);
    const dropZoneText = "Drag & Drop widget here";

    return (
      <div
        onMouseMove={(event) => handleDrag(event)}
        onTouchMove={(event) => handleDrag(event)}
        onMouseUp={() => draggedElement && handleDrop()}
        onTouchEnd={() => draggedElement && handleDrop()}
      >
        {editMode && rows.length ? (
          <Row row={0} index={null} className={getDropZoneClassName(0, null)}>
            {dropZoneText}
          </Row>
        ) : null}

        {rows.map((row) => {
          const rowWidgets = dashboardConfig[row];
          const widgetCount = rowWidgets.length;

          return (
            <React.Fragment key={row}>
              <Row className="row-eq-height">
                {editMode && widgetCount < 2 && !isTablet ? (
                  <Col
                    row={row}
                    index={-1}
                    className={`${getDropZoneClassName(row, -1)} ml-2`}
                  >
                    {dropZoneText}
                  </Col>
                ) : null}

                {Object.keys(rowWidgets).map((widget, index) => {
                  const widgets = rowWidgets[widget];
                  let { component, id, name } = widgets;

                  // reassign components because they cannot be saved in local storage
                  if (!component) {
                    widgetsList.map((defaultWidget) => {
                      if (defaultWidget.name === name)
                        widgets.component = defaultWidget.component;
                    });
                  }

                  const isDragged =
                    editMode &&
                    draggedElement?.row === Number(row) &&
                    draggedElement?.index === index;

                  let className = editMode ? "editable-content " : "";

                  if (editMode && !isDragged) {
                    className = className.concat(
                      getDropZoneClassName(row, index)
                    );
                  }

                  return (
                    <Col
                      key={index}
                      index={index}
                      row={row}
                      style={isDragged && style ? style : null}
                      xs="12"
                      md={
                        editMode && widgetCount < 2
                          ? 10 / widgetCount
                          : 12 / widgetCount
                      }
                      className={className}
                    >
                      {editMode ? (
                        isTablet ? (
                          <>
                            <Card>
                              <CardHeader className="mb-0">{name}</CardHeader>
                              <CardBody>
                                {getWidgetEditButtons(Number(row), index, id)}
                              </CardBody>
                            </Card>
                          </>
                        ) : (
                          <>
                            <widgets.component
                              editButtons={getWidgetEditButtons(
                                Number(row),
                                index,
                                id,
                                name
                              )}
                            />
                          </>
                        )
                      ) : (
                        <widgets.component />
                      )}
                    </Col>
                  );
                })}

                {editMode && widgetCount < 2 && !isTablet ? (
                  <Col
                    row={row}
                    index={2}
                    className={`${getDropZoneClassName(row, 2)} mr-2`}
                  >
                    {dropZoneText}
                  </Col>
                ) : null}
              </Row>

              {editMode ? (
                <Row
                  row={Number(row) + 1}
                  index={1}
                  className={getDropZoneClassName(Number(row) + 1, 1)}
                >
                  {dropZoneText}
                </Row>
              ) : null}
            </React.Fragment>
          );
        })}
      </div>
    );
  }
}
