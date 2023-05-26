import React, { useState, useEffect } from "react";
import { Row, Col, Form, Card, CardBody } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
import GenericInputField from "components/Fields/GenericInputField";
import SelectField from "components/Fields/SelectField";
import SecretField from "components/Fields/SecretField";
import DrawTable from "components/DrawTable/DrawTable";
import { CountrySelect } from "components/Controls/CountrySelect";
import { trimObjectStrings } from "services/text";
import { getAllOrgs } from "services/organizations";
import { useHistory } from "react-router-dom";
import { DeleteModal } from "components/Modals/DeleteModal";
import ClosePromptModal from "components/Modals/ClosePromptModal";
import { getCurrentOrganization } from "services/organizations";
import Spinner from "components/Tools/Spinner";

import {
  getUserById,
  updateUser,
  addUser,
  getOrgUser,
  changeRole,
  updateOwnInfo,
} from "services/users";
import { accessDisabled, getCurrentUser } from "services/auth";
import {
  isEmail,
  isPassword,
  isString,
  matchPassword,
  isRequired,
} from "services/validation";
import { getRoles } from "services/text";
import { useFormik } from "formik";

export default function EditUser(props) {
  const userId = props.match.params.userId;
  const orgId = getCurrentOrganization();
  const isEdit = props.match.params.action == "edit";
  const isPersonalInfo = getCurrentUser().id == userId;
  const disableInputFields = !(isPersonalInfo || !accessDisabled(0));
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialValues, setInitialValues] = useState({ userOrganizations: [] });
  const [ammountOfOrgs, setAmmountOfOrgs] = useState(0);
  const [saveOnAdd, setSaveOnAdd] = useState(false);
  const [modalState, setModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
  });
  const history = useHistory();
  const backUrl = props.location.backUrl
    ? props.location.backUrl
    : `/organizations/${orgId}/users`;
  const filterOptions = () => {
    let orgs = JSON.parse(JSON.stringify(organizations));
    for (let i = 0; i < formik.values?.userOrganizations?.length; i++) {
      let index = orgs.findIndex(
        (o) => o.value == formik.values?.userOrganizations[i]?.orgid
      );
      if (index !== -1) orgs.splice(index, 1);
    }
    return orgs;
  };

  useEffect(() => {
    if ((isPersonalInfo || !accessDisabled(0)) && isEdit) {
      getUserById(userId)
        .then((res) => {
          setInitialValues(res);
          setAmmountOfOrgs(res.userOrganizations.length);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } else if (userId) {
      getOrgUser(orgId, userId)
        .then((res) => {
          setInitialValues(res);
        })
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    }

    getAllOrgs()
      .then((res) =>
        setOrganizations(
          res.map((org) => ({ value: org.orgid, name: org.orgname }))
        )
      )
      .catch((err) => console.error(err))
      .finally(() => (!userId ? setLoading(false) : null));
  }, []);

  const orgIndex = (orgid) => {
    return formik.values.userOrganizations?.findIndex(
      (item) => item.orgid == orgid
    );
  };

  const saveChanges = (values, notModal) => {
    const finalValues = JSON.parse(JSON.stringify(values));
    if (!finalValues.password) delete finalValues.password;
    if (!finalValues.password2) delete finalValues.password2;
    //update personal info
    if (isPersonalInfo && isEdit) {
      delete finalValues.userid;
      delete finalValues.lastlogindate;
      delete finalValues.createddate;
      delete finalValues.updateddate;
      delete finalValues.userOrganizations;
      return updateOwnInfo(finalValues)
        .then((res) => {
          setSaveOnAdd(true);
          console.info(res);
          if (notModal) history.push(backUrl);
        })
        .catch((err) => {
          console.error(err);
        });
    }
    //update role
    else if (isEdit && accessDisabled(0)) {
      return changeRole(
        values.userOrganizations[0].orgid,
        values.userid,
        values.userOrganizations[0].roleid
      )
        .then((result) => {
          setSaveOnAdd(true);
          console.info(result);
          if (notModal) history.push(backUrl);
        })
        .catch((err) => {
          console.error(err);
        })
        .catch((err) => console.error(err));
    }
    // add or edit user
    else if (isEdit) {
      delete values.lastlogindate;
      delete values.createddate;
      delete values.updateddate;
      return updateUser(values)
        .then(() => {
          setSaveOnAdd(true);
          if (notModal) history.push(backUrl);
        })
        .catch((err) => console.error(err));
    } else {
      return addUser(values)
        .then(() => {
          setSaveOnAdd(true);
          if (notModal) history.push(backUrl);
        })
        .catch((err) => console.error(err));
    }
  };

  const onSubmit = (values, notModal) => {
    trimObjectStrings(values);
    if (!isPersonalInfo && isEdit && values.userOrganizations.length == 0) {
      setModal((state) => ({
        ...state,
        header: "Save comfirmation",
        confirmButtonName: "Save",
        confirmButtonColor: "primary",
        onDelete: () => saveChanges(values, notModal),
        message: `Are you sure you want to save user without organization?`,
        modalOpen: true,
      }));
    } else {
      saveChanges(values, notModal);
    }
  };

  const validate = (values) => {
    let errors = {};
    errors.username = isString(values.username, 1, 64);
    errors.email = isEmail(values.email);
    if (!isEdit || values.password || values.password2) {
      errors.password = isPassword(values.password);
      errors.password2 = matchPassword(values.password, values.password2);
    }
    errors.firstname = isRequired(values.firstname);
    errors.lastname = isRequired(values.lastname);
    errors.userOrganizations =
      !isPersonalInfo && !isEdit && values.userOrganizations.length == 0
        ? "There must be at least one organization"
        : false;
    if (!errors.username) delete errors.username;
    if (!errors.email) delete errors.email;
    if (!errors.password) delete errors.password;
    if (!errors.password2) delete errors.password2;
    if (!errors.firstname) delete errors.firstname;
    if (!errors.lastname) delete errors.lastname;
    if (!errors.userOrganizations) delete errors.userOrganizations;
    return errors;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validate,
    onSubmit,
  });

  const addUserOrganization = () => {
    const userOrgs = formik.values.userOrganizations.concat({
      orgid: filterOptions()[0].value,
      roleid: 1,
    });
    formik.setValues({ ...formik.values, userOrganizations: userOrgs });
  };

  const returnUserOrganizationSelect = (data) => {
    let obj = organizations.find((o) => o.value == data.orgid);
    if (
      orgIndex(data.orgid) < ammountOfOrgs ||
      formik.values.userOrganizations.length == organizations.length ||
      accessDisabled(0)
    )
      return <div>{obj?.name}</div>;
    return (
      <SelectField
        name={`userOrganizations[${orgIndex(data.orgid)}].orgid`}
        value={
          formik.values.userOrganizations[orgIndex(data.orgid)]?.orgid || ""
        }
        options={[...filterOptions(), obj]}
        onChange={formik.handleChange}
      />
    );
  };

  const returnRoleSelect = (data) => {
    return (
      <SelectField
        name={`userOrganizations[${orgIndex(data.orgid)}].roleid`}
        value={
          formik.values.userOrganizations[orgIndex(data.orgid)]?.roleid || ""
        }
        disabled={isPersonalInfo}
        tooltip={isPersonalInfo}
        tooltipMessage={"You can't change personal roles"}
        options={getRoles()}
        onChange={formik.handleChange}
      />
    );
  };

  const returnDeleteButton = (data) => {
    if (accessDisabled(0)) return null;
    return (
      <ButtonField
        className="btn-remove"
        title={<i className="now-ui-icons ui-1_simple-remove" />}
        onClick={() => {
          if (orgIndex(data.orgid) <= ammountOfOrgs - 1)
            setAmmountOfOrgs(ammountOfOrgs - 1);
          const userOrgs = formik.values.userOrganizations.filter(
            (item) => item.orgid != data.orgid
          );
          formik.setValues({ ...formik.values, userOrganizations: userOrgs });
        }}
      />
    );
  };
  return (
    <>
      <Row className="mb-1 label">
        <Col>
          <h1>{props.name}</h1>
        </Col>
      </Row>
      <Form onSubmit={formik.handleSubmit}>
        <Row className="mb-1 label">
          <Col>User</Col>
        </Row>
        <Card>
          <CardBody>
            {loading ? (
              <Spinner className="center" />
            ) : (
              <Row className="edit-user">
                <Col className="col-12 col-md-6">
                  <GenericInputField
                    name="username"
                    label="Username"
                    disabled={disableInputFields}
                    validate={formik.errors.username}
                    value={formik.values?.username || ""}
                    onChange={formik.handleChange}
                  />
                  <GenericInputField
                    name="email"
                    label="Email"
                    disabled={disableInputFields}
                    validate={formik.errors.email}
                    value={formik.values?.email || ""}
                    onChange={formik.handleChange}
                  />
                  <GenericInputField
                    name="firstname"
                    label="First Name"
                    disabled={disableInputFields}
                    validate={formik.errors.firstname}
                    value={formik.values?.firstname || ""}
                    onChange={formik.handleChange}
                  />
                  <GenericInputField
                    name="lastname"
                    label="Last Name"
                    disabled={disableInputFields}
                    validate={formik.errors.lastname}
                    value={formik.values?.lastname || ""}
                    onChange={formik.handleChange}
                  />
                </Col>
                <Col className="col-12 col-md-6">
                  <CountrySelect
                    className="user-country"
                    name="country"
                    disabled={disableInputFields}
                    value={formik.values?.country || ""}
                    onChange={formik.handleChange}
                  />
                  <SecretField
                    label="Password"
                    name="password"
                    disabled={disableInputFields}
                    validate={formik.errors.password}
                    value={formik.values?.password || ""}
                    onChange={formik.handleChange}
                  />
                  <SecretField
                    label="Confirm password"
                    name="password2"
                    disabled={disableInputFields}
                    validate={formik.errors.password2}
                    value={formik.values?.password2 || ""}
                    onChange={formik.handleChange}
                  />
                </Col>
              </Row>
            )}
          </CardBody>
        </Card>
        {isPersonalInfo && getCurrentUser().isSuperAdmin ? null : (
          <>
            <Row className="mt-3 mb-1 label">
              <Col className="card-title">User organizations</Col>
              {!accessDisabled(0) ? (
                <Col xs="auto">
                  <ButtonField
                    color="primary"
                    size="xs"
                    title="+ Add"
                    onClick={addUserOrganization}
                    disabled={
                      organizations?.length ==
                      formik.values?.userOrganizations?.length
                    }
                  />
                </Col>
              ) : null}
            </Row>
            <Card>
              <CardBody>
                <Row>
                  <Col>
                    <DrawTable
                      data={formik.values.userOrganizations}
                      columns={{
                        Organization: {
                          value: "orgid",
                          component: (data) =>
                            returnUserOrganizationSelect(data),
                          visibleOnTablet: true,
                          className: "organization-select",
                        },
                        Role: {
                          value: "roleid",
                          component: (data) => returnRoleSelect(data),
                        },
                        " ": {
                          component: (data) => returnDeleteButton(data),
                          value: "orgid",
                          className: "text-center",
                          visibleOnTablet: true,
                          width: "10px",
                        },
                      }}
                      search
                      paginate
                    />
                  </Col>
                </Row>
              </CardBody>
            </Card>
          </>
        )}
        <Row className="mt-3">
          {!isPersonalInfo ? (
            <Col xs="auto">
              <ButtonField
                type="button"
                title="Cancel"
                onClick={() => history.push(backUrl)}
              />
            </Col>
          ) : formik.dirty ? (
            <Col xs="auto">
              <ButtonField
                type="button"
                title="Discard"
                onClick={() => formik.handleReset()}
              />
            </Col>
          ) : null}
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
      <ClosePromptModal
        dirty={formik.dirty}
        valid={formik.isValid}
        history={props.history}
        onSave={() => {
          onSubmit(formik.values, false);
        }}
        saveOnAdd={saveOnAdd}
      />
      <DeleteModal
        {...modalState}
        closeModal={() => setModal({ ...modalState, modalOpen: false })}
      />
    </>
  );
}
