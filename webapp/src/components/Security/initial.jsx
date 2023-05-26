import React, { useState } from "react";
import { Form, Col, Row } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
import SecretField from "components/Fields/SecretField";
import GenericInputField from "components/Fields/GenericInputField";
import { CountrySelect } from "components/Controls/CountrySelect";
import auth from "services/auth";
import Spinner from "components/Tools/Spinner";
import { useFormik } from "formik";
import {
  isEmail,
  isPassword,
  matchPassword,
  isString,
} from "services/validation";

export default function Initial() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const validate = (values) => {
    let errors = {};
    errors.name = isString(values.name, 6, 64);
    errors.domain = isString(values.domain, 1, 256);
    errors.username = isString(values.username, 1, 64);
    errors.email = isEmail(values.email);
    errors.password = isPassword(values.password);
    errors.password2 = matchPassword(values.password, values.password2);
    errors.firstname = isString(values.firstname, 1, 64);
    errors.lastname = isString(values.lastname, 1, 64);
    if (!errors.name) delete errors.name;
    if (!errors.domain) delete errors.domain;
    if (!errors.username) delete errors.username;
    if (!errors.email) delete errors.email;
    if (!errors.password) delete errors.password;
    if (!errors.password2) delete errors.password2;
    if (!errors.firstname) delete errors.firstname;
    if (!errors.lastname) delete errors.lastname;
    return errors;
  };
  const onSubmit = (values) => {
    setLoading(true);
    auth
      .initial(values)
      .then(() => location.reload())
      .catch((err) => {
        formik.resetForm;
        setError(err);
        setLoading(false);
      });
  };

  const formik = useFormik({
    initialValues: {
      username: "",
      password: "",
      password2: "",
      name: "",
      firstname: "",
      lastname: "",
      country: "US",
      email: "",
      domain: "",
    },
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
        <div className="form-title">Initial super admin registration</div>
        <GenericInputField
          type="text"
          name="email"
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
        <GenericInputField
          type="text"
          name="name"
          validate={formik.errors.name}
          value={formik.values.name || ""}
          onChange={formik.handleChange}
          placeholder="Organization name"
        />
        <GenericInputField
          type="text"
          name="domain"
          validate={formik.errors.domain}
          value={formik.values.domain || ""}
          onChange={formik.handleChange}
          placeholder="Server domain"
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
