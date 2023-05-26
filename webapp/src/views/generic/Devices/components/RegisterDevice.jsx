import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { getGroups } from "services/groups";
import { registerDevice, getUnregisteredDevice } from "services/devices";
import { Row, Col, Form } from "reactstrap";
import CardWithLoading from "components/Cards/CardWithLoading";
import ButtonField from "components/Fields/ButtonField";
import LinkField from "components/Links/LinkField";
import GenericInputField from "components/Fields/GenericInputField";
import SelectField from "components/Fields/SelectField";
import { isRequired } from "services/validation";
import { useFormik } from "formik";

export default function RegisterDevice(props) {
  const orgId = props.match.params.orgId;
  const deviceId = props.match.params.deviceId;
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({});
  const [groups, setGroups] = useState([]);
  const history = useHistory();

  const meshModes = [
    { value: "cap", name: "Central Access Point" },
    { value: "re", name: "Range Extender" },
  ];

  useEffect(() => {
    getGroups()
      .then((dbGroups) => {
        getUnregisteredDevice(orgId, deviceId)
          .then((devices) =>
            setInitialValues({
              groupid: Object.values(dbGroups)[0].groupid,
              meshmode: "cap",
              devicename: devices.devicename,
            })
          )
          .finally(() => {
            setGroups(
              dbGroups.map((group) => ({
                value: group.groupid,
                name: group.groupname,
              }))
            );
            setLoading(false);
          });
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const onSubmit = (values) => {
    const result = {
      devicename: values.devicename,
      groupid: values.groupid,
      meshmode: values.meshmode,
    };
    registerDevice(deviceId, result)
      .then(() => {
        history.push(`/organizations/${orgId}/pending-devices`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const validate = (values) => {
    let errors = {};
    errors.devicename = isRequired(values.devicename);
    if (groups.length == 0)
      errors.group = "Please create a group before registering the device";
    if (!errors.devicename) delete errors.devicename;
    if (!errors.group) delete errors.group;
    return errors;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validate,
    onSubmit,
  });

  return (
    <CardWithLoading
      id="register-device"
      loading={loading}
      header={
        groups.length && (
          <Row>
            <Col>{props.name}</Col>
          </Row>
        )
      }
      body={
        groups.length ? (
          <Form onSubmit={formik.handleSubmit}>
            <Row>
              <Col>
                <GenericInputField
                  label="Name"
                  name="devicename"
                  validate={formik.errors.devicename}
                  onChange={formik.handleChange}
                  value={formik.values.devicename || ""}
                />
              </Col>
            </Row>
            <Row>
              <Col>
                <SelectField
                  label="Group"
                  name="groupid"
                  options={groups}
                  value={formik.values.groupid}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>

            <Row>
              <Col>
                <SelectField
                  label="Mesh mode"
                  name="meshmode"
                  options={meshModes}
                  value={formik.values.meshmode || ""}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs="auto">
                <ButtonField
                  title="Cancel"
                  type="button"
                  onClick={() =>
                    history.push(`/organizations/${orgId}/pending-devices`)
                  }
                />
              </Col>
              <Col xs="auto" className="pl-0">
                <ButtonField
                  title="Save"
                  color="primary"
                  type="submit"
                  value="Submit"
                  disabled={!formik.isValid}
                  tooltip={!formik.isValid}
                  tooltipMessage={Object.values(formik.errors)[0]}
                />
              </Col>
            </Row>
          </Form>
        ) : (
          <>
            <Row className="mb-1 label">
              <Col>{props.name}</Col>
              <Col xs="auto">
                <LinkField
                  button={true}
                  className="mb-2"
                  color="primary"
                  size="xs"
                  title="+ Create group"
                  to={{ pathname: "/groups/add", state: {} }}
                />
              </Col>
            </Row>
            <div className="mb-2 alert alert-warning">
              This organization does not have any groups.
            </div>
            <Row>
              <Col>
                <LinkField
                  button={true}
                  type="button"
                  title="Back"
                  to={{
                    pathname: `/pending-devices`,
                    state: {},
                  }}
                />
              </Col>
            </Row>
          </>
        )
      }
    />
  );
}
