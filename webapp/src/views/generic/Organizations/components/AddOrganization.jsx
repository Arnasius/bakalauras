import React, { useLayoutEffect, useState } from "react";
import { Row, Col, Form } from "reactstrap";
import CardWithLoading from "components/Cards/CardWithLoading";
import ButtonField from "components/Fields/ButtonField";
import GenericInputField from "components/Fields/GenericInputField";
import { addOrg, editOrg, getOrg } from "services/organizations";
import { isString } from "services/validation";
import { trimObjectStrings } from "services/text";
import { useHistory } from "react-router-dom";
import { useFormik } from "formik";
import ClosePromptModal from "components/Modals/ClosePromptModal";
import { NavLink } from "react-router-dom";

export default function AddOrganization(props) {
  const orgid = props.match.params?.orgId;
  const isEdit = !!orgid;
  const history = useHistory();
  const [initialValues, setInitialValues] = useState({});
  const [saveOnAdd, setSaveOnAdd] = useState(false);
  useLayoutEffect(() => {
    if (isEdit) {
      getOrg(orgid).then((res) => {
        delete res.roleid;
        setInitialValues(res);
      });
    }
  }, []);

  const onSubmit = (values, notModal) => {
    trimObjectStrings(values);
    if (isEdit) {
      editOrg(parseInt(orgid), values)
        .then(() => {
          setSaveOnAdd(true);
          if (notModal) history.push("/organizations");
          props.refreshOrgs();
        })
        .catch((err) => {
          console.error(err);
        });
    } else {
      addOrg(values)
        .then(() => {
          setSaveOnAdd(true);
          if (notModal) history.push("/organizations");
          props.refreshOrgs();
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  const validate = (values) => {
    let errors = {};
    errors.orgname = isString(values.orgname, 6, 64);
    if (!errors.orgname) delete errors.orgname;
    return errors;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validate,
    onSubmit,
  });

  return (
    <>
      <CardWithLoading
        id={isEdit ? "edit-organization" : "add-organization"}
        header={
          <Row>
            <Col>{isEdit ? "Edit organization" : "Add new organization"}</Col>
          </Row>
        }
        body={
          <Form onSubmit={formik.handleSubmit}>
            <Row>
              <Col>
                <GenericInputField
                  type="text"
                  name="orgname"
                  value={formik.values?.orgname || ""}
                  onChange={formik.handleChange}
                  validate={formik.errors.orgname}
                  label="Name"
                />
              </Col>
            </Row>
            <Row className="mt-3">
              <Col>
                <GenericInputField
                  type="text"
                  name="description"
                  value={formik.values?.description || ""}
                  onChange={formik.handleChange}
                  label="Description"
                />
              </Col>
            </Row>

            <Row className="mt-3">
              <Col xs="auto">
                <NavLink exact to={`/organizations`} replace>
                  <ButtonField title="Cancel" type="button" />
                </NavLink>
              </Col>
              {formik.dirty ? (
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
              ) : null}
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
