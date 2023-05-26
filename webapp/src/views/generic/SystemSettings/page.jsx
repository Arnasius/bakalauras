import React, { useLayoutEffect, useState } from "react";
import { Card, CardBody, CardHeader, Row, Col, Form } from "reactstrap";
import ButtonField from "components/Fields/ButtonField";
import { getInfo, updateInfo } from "services/server";
import GenericInputField from "components/Fields/GenericInputField";
import SwitchField from "components/Fields/SwitchField";
import SecretField from "components/Fields/SecretField";
import { accessDisabled } from "services/auth";
import {
  isRequired,
  isValueSelected,
  isPort,
  isPassword,
  isEmail,
} from "services/validation";
import SelectField from "components/Fields/SelectField";
import UploadFile from "./components/UploadFile";
import ClosePromptModal from "components/Modals/ClosePromptModal";
import { useFormik } from "formik";
import FirmwaresTable from "./components/FirmwaresTable";

export function SystemSettings(props) {
  const [initialValues, setInitialValues] = useState({});
  useLayoutEffect(() => {
    getInfo().then((res) => {
      setInitialValues(res.data);
    });
  }, []);

  const onSubmit = (values) => {
    updateInfo(values)
      .then(() => {
        console.info("Settings saved...");
        setInitialValues(values);
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const validate = (values) => {
    let errors = {};
    errors.sslversion = isValueSelected(values.sslversion);
    errors.domain = isRequired(values.domain);
    errors.smtp_user = isRequired(values.smtp_user);
    errors.smtp_pass = isPassword(values.smtp_pass);
    errors.smtp_host = isRequired(values.smtp_host);
    errors.smtp_port = isPort(values.smtp_port);
    errors.smtp_email = isEmail(values.smtp_email);
    if (!errors.sslversion || !values.sslstatus) delete errors.sslversion;
    if (!errors.smtp_user || !values.smtp) delete errors.smtp_user;
    if (!errors.smtp_pass || !values.smtp) delete errors.smtp_pass;
    if (!errors.smtp_host || !values.smtp) delete errors.smtp_host;
    if (!errors.smtp_port || !values.smtp) delete errors.smtp_port;
    if (!errors.smtp_email || !values.smtp) delete errors.smtp_email;
    if (!errors.domain) delete errors.domain;
    return errors;
  };

  const formik = useFormik({
    initialValues,
    enableReinitialize: true,
    validate,
    onSubmit,
  });

  const options = [
    { value: "SS", name: "Self-Signed" },
    { value: "LE", name: "Let's Encrypt" },
    { value: "CERT", name: "Certificate" },
  ];

  function SmtpFields() {
    return (
      <>
        {formik.values.smtp && (
          <>
            <Row>
              <Col md="6">
                <GenericInputField
                  type="text"
                  name="smtp_user"
                  label="SMTP Username"
                  value={formik.values.smtp_user || ""}
                  validate={formik.errors.smtp_user}
                  onChange={formik.handleChange}
                />
              </Col>
              <Col md="6">
                <SecretField
                  name="smtp_pass"
                  label="SMTP Password"
                  validate={formik.errors.smtp_pass}
                  value={formik.values.smtp_pass || ""}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <GenericInputField
                  type="text"
                  name="smtp_host"
                  label="SMTP Hostname"
                  validate={formik.errors.smtp_host}
                  value={formik.values.smtp_host || ""}
                  onChange={formik.handleChange}
                />
              </Col>
              <Col md="6">
                <GenericInputField
                  type="number"
                  name="smtp_port"
                  label="SMTP Port"
                  validate={formik.errors.smtp_port}
                  value={formik.values.smtp_port || ""}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>
            <Row>
              <Col md="6">
                <GenericInputField
                  type="text"
                  name="smtp_email"
                  label="Email address"
                  validate={formik.errors.smtp_email}
                  value={formik.values.smtp_email || ""}
                  onChange={formik.handleChange}
                />
              </Col>
            </Row>
          </>
        )}
      </>
    );
  }

  function HttpsFields() {
    return (
      <>
        {formik.values.sslstatus && (
          <>
            <Row>
              <Col xl="8">
                <SelectField
                  name="sslversion"
                  label="SSL Type"
                  value={formik.values.sslversion || ""}
                  onChange={formik.handleChange}
                  options={options}
                />
              </Col>
            </Row>

            {formik.values.sslversion === "SS" ||
            formik.values.sslversion === "LE" ? null : (
              <>
                {formik.values.sslversion === "CERT" && (
                  <Row className="mt-3">
                    <Col
                      className="d-flex flex-column justify-content-between"
                      md="6"
                      lg="5"
                      xl="4"
                    >
                      <UploadFile
                        name="Upload cert"
                        file_id="uploadedCertFileName"
                      />
                    </Col>
                    <Col
                      className="d-flex flex-column justify-content-between"
                      md="6"
                      lg="5"
                      xl="4"
                    >
                      <UploadFile
                        name="Upload Key"
                        file_id="uploadedKeyFileName"
                      />
                    </Col>
                  </Row>
                )}
              </>
            )}
          </>
        )}
      </>
    );
  }

  return (
    <>
      {!accessDisabled(0) ? (
        <>
          <Row className="mb-1 label">
            <Col>Server information</Col>
          </Row>
          <Card id="server-settings">
            <CardBody>
              <Form onSubmit={formik.handleSubmit}>
                <Row>
                  <Col className="mb-2" md="6">
                    <GenericInputField
                      type={"text"}
                      name="version"
                      label="Server version"
                      disabled={true}
                      value={formik.values.version || ""}
                      onChange={formik.handleChange}
                    />
                  </Col>
                </Row>

                <Row>
                  <Col className="mb-2" md="6">
                    <GenericInputField
                      type="text"
                      name="domain"
                      label="Server domain"
                      validate={formik.errors.domain}
                      value={formik.values.domain || ""}
                      onChange={formik.handleChange}
                    />
                  </Col>
                </Row>

                <Row>
                  <Card className="col-12 col-lg-6 no-right-border-lg">
                    <CardHeader>HTTPS</CardHeader>
                    <CardBody className="pt-0">
                      <Row>
                        <Col>
                          <SwitchField
                            name="sslstatus"
                            label={
                              formik.values.sslstatus ? "Enabled" : "Disabled"
                            }
                            checked={!!formik.values.sslstatus}
                            onChange={formik.handleChange}
                            className="mb-2"
                          />
                        </Col>
                      </Row>
                      {HttpsFields()}
                    </CardBody>
                  </Card>

                  <Card className="col-12 col-lg-6 no-right-border-lg">
                    <CardHeader>SMTP</CardHeader>
                    <CardBody className="pt-0">
                      <Row>
                        <Col>
                          <SwitchField
                            name="smtp"
                            label={formik.values.smtp ? "Enabled" : "Disabled"}
                            checked={!!formik.values.smtp}
                            onChange={formik.handleChange}
                            className="mb-2"
                          />
                        </Col>
                      </Row>
                      {SmtpFields()}
                    </CardBody>
                  </Card>
                </Row>

                <Row>
                  <Col>
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
            </CardBody>
          </Card>
          <ClosePromptModal
            dirty={formik.dirty}
            valid={formik.isValid}
            history={props.history}
            onSave={() => {
              onSubmit(formik.values);
            }}
          />
        </>
      ) : null}
      <FirmwaresTable {...props} />
    </>
  );
}
