import React, { useState, useLayoutEffect } from "react";
import { Form } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
import SecretField from "components/Fields/SecretField";
import Spinner from "components/Tools/Spinner";
import { checkReset, updatePassword } from "services/users";
import { useFormik } from "formik";
import { isPassword, matchPassword } from "services/validation";

export default function resetPassword(hash) {
  const [state, setState] = useState({});

  useLayoutEffect(() => {
    const key = hash.hash.split("reset=").pop();
    setState({ key: key });
    checkReset(key).catch((err) => {
      setState({ error: err.message });
    });
  }, []);

  const validate = (values) => {
    let errors = {};
    errors.password = isPassword(values.password);
    errors.password2 = matchPassword(values.password, values.password2);
    if (!errors.password) delete errors.password;
    if (!errors.password2) delete errors.password2;
    return errors;
  };
  const onSubmit = (values) => {
    setState({ loading: true });
    updatePassword(values, state.key).then(
      () => {
        setState({
          loading: false,
          message: "Password has been changed successfully, you can now login!",
        });
      },
      (err) => {
        setState({
          loading: false,
          submitError: String(err),
        });
      }
    );
  };

  const formik = useFormik({
    initialValues: { password: "", password2: "" },
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
      {!state.error ? (
        <Form onSubmit={formik.handleSubmit}>
          <div className="form-title">Confirm your new password</div>
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
          {state.submitError ? (
            <p className="error-message">{state.submitError}</p>
          ) : null}
          {state.message ? (
            <p className="text-success">{state.message}</p>
          ) : null}
          <div className="pull-right">
            {!state.message ? (
              state.loading ? (
                <Spinner className="px-0" />
              ) : (
                <ButtonField
                  title="Save"
                  color="primary"
                  type="submit"
                  value="Submit"
                  disabled={!formik.isValid || !formik.dirty}
                  tooltip={!formik.isValid}
                  tooltipMessage={Object.values(formik.errors)[0]}
                />
              )
            ) : null}
          </div>
        </Form>
      ) : (
        <div>
          <p className="error-message">{state.error}</p>
        </div>
      )}
    </div>
  );
}
