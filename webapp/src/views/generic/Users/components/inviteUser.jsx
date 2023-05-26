import React, { useState } from "react";
import { Row, Col, Form } from "reactstrap";
import CardWithLoading from "components/Cards/CardWithLoading";
import ButtonField from "components/Fields/ButtonField";
import GenericInputField from "components/Fields/GenericInputField";
import SelectField from "components/Fields/SelectField";
import { getRoles } from "services/text";
import { invite } from "services/users";
import { useHistory } from "react-router-dom";
import { trimObjectStrings } from "services/text";
import { useFormik } from "formik";
import { isEmail } from "services/validation";
import LinkField from "components/Links/LinkField";
import ClosePromptModal from "components/Modals/ClosePromptModal";

export default function inviteUser(props) {
  const validate = (values) => {
    let errors = {};
    errors.email = isEmail(values.email);
    if (!errors.email) delete errors.email;
    return errors;
  };
  const [saveOnAdd, setSaveOnAdd] = useState(false);
  const history = useHistory();
  const onSubmit = (values, notModal) => {
    trimObjectStrings(values);
    invite(values, props.currentOrganization)
      .then(() => {
        setSaveOnAdd(true);
        if (notModal)
          history.push(`/organizations/${props.currentOrganization}/users`);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const formik = useFormik({
    initialValues: {
      email: "",
      roleid: "3",
    },
    validate,
    onSubmit,
  });

  return (
    <>
      <CardWithLoading
        id="add-device"
        header={
          <Row>
            <Col>Invite new user</Col>
          </Row>
        }
        body={
          <Form onSubmit={formik.handleSubmit}>
            <Row>
              <Col md="8" lg="6">
                <GenericInputField
                  label="Email"
                  name="email"
                  validate={formik.errors.email}
                  value={formik.values.email}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col md="8" lg="6">
                <SelectField
                  name="roleid"
                  label="Role"
                  validate={formik.errors.roleid}
                  value={formik.values.roleid}
                  options={getRoles()}
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
                    pathname: "/users",
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
        }
      />
      <ClosePromptModal
        dirty={formik.dirty}
        valid={formik.isValid}
        history={props.history}
        onSave={() => {
          onSubmit(formik.values, false);
        }}
        saveOnAdd={saveOnAdd}
      />
    </>
  );
}
