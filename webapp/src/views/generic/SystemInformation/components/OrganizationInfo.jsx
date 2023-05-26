import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import { getOrg } from "services/organizations";
import { copyText } from "services/text";
import Spinner from "components/Tools/Spinner";

export default function OrganizationInfo(props) {
  const [orgData, setOrgData] = useState({});
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    getOrg()
      .then((result) => {
        setOrgData(result);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, [props.currentOrganization]);

  return (
    <>
      {loading ? (
        <Spinner className="center" />
      ) : (
        <Row className="mb-1">
          <Col className="label" md="8">
            <h1>{orgData?.orgname || "-"}</h1>

            <p>{orgData?.description || ""}</p>
          </Col>
          <Col className="text-right" md="4">
            Organization ID:
            <span id="ID">{orgData?.orgid || "-"}</span>
            <i
              onClick={() => copyText("ID")}
              className="now-ui-icons files_single-copy-04 ml-1 link-icon"
              id="copy"
            />
          </Col>
        </Row>
      )}
    </>
  );
}
