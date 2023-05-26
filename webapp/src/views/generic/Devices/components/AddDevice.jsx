import React, { useState, useLayoutEffect } from "react";
import { addDevice, getDevice, editDevice } from "services/devices";
import { Row, Col, Form } from "reactstrap";
import CardWithLoading from "components/Cards/CardWithLoading";
import SelectField from "components/Fields/SelectField";
import ButtonField from "components/Fields/ButtonField";
import { trimObjectStrings } from "services/text";
import { isMac, isString } from "services/validation";
import GenericInputField from "components/Fields/GenericInputField";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import { getGroups } from "services/groups";
import LinkField from "components/Links/LinkField";
import ClosePromptModal from "components/Modals/ClosePromptModal";

export default function AddDevice(props) {
  const id = props.match.params.deviceId;
  const isEdit = !!id;
  const groupId = props.match.params.groupId;
  const meshModes = [
    { value: "cap", name: "Central Access Point" },
    { value: "re", name: "Range Extender" },
  ];
  const history = useHistory();
  const [initialValues, setInitialValues] = useState({
    meshmode: Object.values(meshModes)[0].value,
    groupid: props.match.params.groupId,
  });
  const [groups, setGroups] = useState([]);
  const [saveOnAdd, setSaveOnAdd] = useState(false);

  useLayoutEffect(() => {
    if (props.currentOrganization && isEdit) {
      getGroups()
        .then((res) => {
          setGroups(
            res.map((group) => ({
              value: group.groupid,
              name: group.groupname,
            }))
          );
        })
        .catch((err) => console.error(err));

      getDevice(groupId, id)
        .then((res) => {
          setInitialValues(res);
        })
        .catch((err) => console.error(err));
    }
  }, [props.currentOrganization]);
  const onSubmit = (values, notModal) => {
    trimObjectStrings(values);
    if (isEdit) {
      editDevice(groupId, id, {
        devicename: values.devicename,
        groupid: values.groupid,
        meshmode: values.meshmode,
      })
        .then(() => {
          setSaveOnAdd(true);
          if (notModal)
            history.push(
              "/organizations/" +
                props.currentOrganization +
                "/groups/" +
                values.groupid +
                "/devices/" +
                id
            );
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      addDevice(groupId, values)
        .then(() => {
          setSaveOnAdd(true);
          if (notModal)
            history.push(
              "/organizations/" +
                props.currentOrganization +
                "/groups/" +
                values.groupid +
                "/devices/" +
                id
            );
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const validate = (values) => {
    let errors = {};
    errors.devicename = isString(values.devicename, 1, 64);
    errors.devicemac = isMac(values.devicemac);
    if (!errors.devicename) delete errors.devicename;
    if (!errors.devicemac || isEdit) delete errors.devicemac;
    return errors;
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validate,
    onSubmit,
  });

  return (
    <>
      <CardWithLoading
        id={isEdit ? "edit-device" : "add-device"}
        header={
          <Row>
            <Col>{isEdit ? "Edit device" : "Add new device"}</Col>
          </Row>
        }
        body={
          initialValues ? (
            <Form onSubmit={formik.handleSubmit}>
              <Row>
                <Col>
                  <GenericInputField
                    label="Name"
                    name="devicename"
                    value={formik.values.devicename || ""}
                    validate={formik.errors.devicename}
                    onChange={formik.handleChange}
                  />
                </Col>
              </Row>

              {isEdit ? (
                <SelectField
                  label="Select group"
                  name="groupid"
                  options={groups}
                  value={formik.values.groupid || ""}
                  validate={formik.errors.groupid}
                  onChange={formik.handleChange}
                />
              ) : (
                <Row>
                  <Col>
                    <GenericInputField
                      label="MAC address"
                      name="devicemac"
                      value={formik.values.devicemac || ""}
                      validate={formik.errors.devicemac}
                      onChange={formik.handleChange}
                    />
                  </Col>
                </Row>
              )}
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
                  <LinkField
                    button={true}
                    type="button"
                    title="Cancel"
                    to={{
                      pathname: props.location.backUrl
                        ? props.location.backUrl
                        : `/groups/${groupId}/devices/`,
                      state: {},
                    }}
                  />
                </Col>

                <Col xs="auto" className="pl-0">
                  {formik.dirty ? (
                    <ButtonField
                      title="Save"
                      color="primary"
                      type="submit"
                      value="Submit"
                      disabled={!formik.isValid}
                      tooltip={!formik.isValid}
                      tooltipMessage={Object.values(formik.errors)[0]}
                    />
                  ) : null}
                </Col>
              </Row>
            </Form>
          ) : (
            <>
              <div className="mb-2 alert alert-warning">
                Device does not exist
              </div>
              <Row className="mt-3">
                <Col xs="auto">
                  <LinkField
                    button={true}
                    type="button"
                    title="Cancel"
                    to={{
                      pathname: props.location.backUrl
                        ? props.location.backUrl
                        : `/groups`,
                      state: {},
                    }}
                  />
                </Col>
              </Row>
            </>
          )
        }
      />
      <ClosePromptModal
        dirty={formik.dirty}
        valid={formik.isValid}
        history={props.history}
        onSave={() => onSubmit(formik.values, false)}
        saveOnAdd={saveOnAdd}
      />
    </>
  );
}
