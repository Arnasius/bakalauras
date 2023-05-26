import React, { useEffect, useState } from "react";
import { BsThreeDots } from "react-icons/bs";
import { useHistory } from "react-router-dom";

export default function OrganizationSelect({
  currentOrganization,
  organizations,
}) {
  const [open, toggle] = useState(0);

  let currentOrganizationName = organizations[0]?.orgname;

  let OptionsList = organizations.map((item) => {
    const options = {};

    options.value = item.orgid;
    options.name = item.orgname;

    if (item.orgid == currentOrganization) {
      options.current = true;
      currentOrganizationName = item.orgname;
    } else {
      options.current = false;
    }

    return options;
  });

  const history = useHistory();

  useEffect(() => {
    if (!currentOrganization && OptionsList.length) {
      history.push(`/organizations/${OptionsList[0]?.value}/dashboard`);
    }
  }, [currentOrganization]);

  return (
    <div className={`mr-2 organization-switch  ${open ? "open" : ""}`}>
      <div
        className="organization-name d-flex align-items-center"
        onClick={() => toggle(!open)}
      >
        <span className="text-truncate d-inline-block">
          {currentOrganizationName}
        </span>
        <i
          className={`now-ui-icons arrows-1_minimal-${open ? "up" : "down"}`}
        ></i>
      </div>

      {open ? (
        <>
          <div className="organization-switch-dialog">
            <div className="organization-actions">
              <BsThreeDots
                onClick={() => {
                  history.push(`/organizations`);
                  toggle(0);
                }}
              />
            </div>
            <div className="organization-list">
              {OptionsList.map((prop, key) => {
                return (
                  <React.Fragment key={key}>
                    <div
                      className={`organization-item  ${
                        prop.current ? "active" : ""
                      }`}
                      onClick={() => {
                        history.push(`/organizations/${prop.value}/dashboard`);
                        toggle(0);
                      }}
                    >
                      {prop.name}
                    </div>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <div
            className="organization-switch-backdrop"
            onClick={() => toggle(0)}
          ></div>
        </>
      ) : null}
    </div>
  );
}
