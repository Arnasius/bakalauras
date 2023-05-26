import React, { useState, useEffect } from "react";
import {
  getAllOrgs,
  getCurrentOrganization,
  setCurrentOrganization,
} from "services/organizations";

export function withCurrentOrg(Component) {
  return function ContentWithOrg(props) {
    const [state, setState] = useState({
      currentOrganization: "",
      organizations: [],
    });

    const getOrgs = () => {
      getAllOrgs().then((res) => {
        setState({
          currentOrganization: getCurrentOrganization(),
          organizations: res,
        });
      });
    };

    useEffect(() => {
      getOrgs();
    }, []);

    const handleChange = (value) => {
      setCurrentOrganization(value);

      setState({
        ...state,
        currentOrganization: value,
      });
    };

    return (
      <Component
        currentOrganization={state.currentOrganization}
        organizations={state.organizations}
        handleChange={handleChange}
        refreshOrgs={getOrgs}
        {...props}
      />
    );
  };
}
