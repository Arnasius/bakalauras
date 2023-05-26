import React from "react";
import PropTypes from "prop-types";
import { mkid, elementName } from "./utils";

export default function withIdAndName(Component) {
  function ComponentWithIdAndName(props) {
    let { name, id } = props;
    const missingProps = {};

    if (typeof name === "undefined") {
      name = `${elementName(Component)}-${mkid(8)}`;
      missingProps.name = name;
    }

    if (typeof id === "undefined") {
      id = `${name}-${mkid(8)}`;
      missingProps.id = id;
    }

    return <Component {...missingProps} {...props} />;
  }

  ComponentWithIdAndName.propTypes = {
    name: PropTypes.string,
    id: PropTypes.string,
  };

  return ComponentWithIdAndName;
}
