import React, { useState, useLayoutEffect } from "react";
import { Form, Row, Col } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";
import Spinner from "components/Tools/Spinner";
import { checkValidKey } from "services/signup";
import { acceptNewInvitation } from "services/users";
import { CountrySelect } from "components/Controls/CountrySelect";
import { useFormik } from "formik";
import {
  isPassword,
  matchPassword,
  isRequired,
  isString,
} from "services/validation";

export default function RegisterPage(hash) {
  const [initialValues, setInitialValues] = useState({
    username: "",
    password: "",
    password2: "",
    firstname: "",
    lastname: "",
    country: "US",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useLayoutEffect(() => {
    const key = hash.hash.split("invite=").pop();
    checkValidKey(key)
      .then((result) => {
        setInitialValues({ ...initialValues, email: result.email });
      })
      .catch(() => {
        setError({ error: "Invitation link is invalid" });
      });
  }, []);

  const validate = (values) => {
    let errors = {};
    errors.username = isString(values.username, 1, 64);
    errors.password = isPassword(values.password);
    errors.password2 = matchPassword(values.password, values.password2);
    errors.firstname = isRequired(values.firstname);
    errors.lastname = isRequired(values.lastname);
    if (!errors.username) delete errors.username;
    if (!errors.password) delete errors.password;
    if (!errors.password2) delete errors.password2;
    if (!errors.firstname) delete errors.firstname;
    if (!errors.lastname) delete errors.lastname;
    return errors;
  };
  const onSubmit = (values) => {
    setLoading(true);
    acceptNewInvitation(values)
      .then(() => {
        window.history.replaceState({}, document.title, "/");
        location.reload();
      })
      .catch((err) => {
        formik.resetForm;
        setError(err);
        setLoading(false);
      });
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validate,
    onSubmit,
  });

  return (
    <div className="login-form">
      <div className="logo">
        <a href="#" className="simple-text logo-mini">
          <div className="logo-img"></div>
        </a>
      </div>
      <Form onSubmit={formik.handleSubmit}>
        <div className="form-title">User registration</div>
        <GenericInputField
          type="text"
          name="email"
          disabled={true}
          validate={formik.errors.email}
          value={formik.values.email || ""}
          onChange={formik.handleChange}
          placeholder="Email address"
        />
        <GenericInputField
          type="text"
          name="firstname"
          validate={formik.errors.firstname}
          value={formik.values.firstname || ""}
          onChange={formik.handleChange}
          placeholder="Firstname"
        />
        <GenericInputField
          type="text"
          name="lastname"
          validate={formik.errors.lastname}
          value={formik.values.lastname || ""}
          onChange={formik.handleChange}
          placeholder="Lastname"
        />
        <GenericInputField
          type="text"
          name="username"
          validate={formik.errors.username}
          value={formik.values.username || ""}
          onChange={formik.handleChange}
          placeholder="Username"
        />
        <SecretField
          name="password"
          validate={formik.errors.password}
          value={formik.values.password || ""}
          onChange={formik.handleChange}
          placeholder="Password"
        />
        <SecretField
          name="password2"
          validate={formik.errors.password2}
          value={formik.values.password2 || ""}
          onChange={formik.handleChange}
          placeholder="Repeat password"
        />
        <CountrySelect
          name="country"
          value={formik.values?.country || ""}
          onChange={formik.handleChange}
        />
        {error ? <p className="error-message">{error}</p> : null}
        <div className="pull-right">
          <Row className="mt-3">
            {formik.dirty ? (
              <Col xs="auto">
                <ButtonField
                  type="button"
                  title="Cancel"
                  onClick={formik.resetForm}
                />
              </Col>
            ) : null}

            {loading ? (
              <Spinner className="px-0" />
            ) : (
              <ButtonField
                title="Save & Setup"
                color="primary"
                type="submit"
                value="Submit"
                disabled={!formik.isValid || !formik.dirty}
                tooltip={!formik.isValid}
                tooltipMessage={Object.values(formik.errors)[0]}
              />
            )}
          </Row>
        </div>
      </Form>
    </div>
  );
}
