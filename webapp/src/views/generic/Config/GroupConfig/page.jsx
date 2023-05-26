import React, { useState, useEffect } from "react";
import { Row, Col } from "reactstrap";
import { useHistory } from "react-router-dom";
import { getGroup, editGroup, addGroup } from "services/groups";
import { getDevice } from "services/devices";
import { isRequired, isString } from "services/validation";
import { accessDisabled } from "services/auth";
import ButtonField from "components/Fields/ButtonField";
import { trimObjectStrings } from "services/text";
import GroupInfo from "./components/GroupInfo";
import MeshSettings from "./components/MeshSettings";
import WirelessSettingsPage from "./WirelessSettings";
import SsidSettingsPage from "./SsidSettings";
import LinkField from "components/Links/LinkField";
import ClosePromptModal from "components/Modals/ClosePromptModal";
import { useFormik } from "formik";

export default function GroupConfigPage(props) {
  const [initialValues, setInitialValues] = useState({
    groupname: "",
    description: "",
    config: initialConfig,
  });
  const [deviceName, setDeviceName] = useState("");
  const [saveOnAdd, setSaveOnAdd] = useState(false);

  const organization = props.currentOrganization;
  const id = props.match.params.groupId;
  const isEdit = props.match.params.action === "edit";
  const readOnly = props.match.params.action === "view";
  const isViewer = accessDisabled(2);
  const history = useHistory();

  const onSave = () => {
    trimObjectStrings(formik.values);
    const result = formik.values;
    result.config.ssids.forEach((ssid) => {
      if (result.config.mesh.enabled) {
        ssid.radios = ssid.radios.filter(
          (radio) => radio !== result.config.mesh.backhaul.radio
        );
      }
    });
    Object.entries(result.config.radio).forEach(([, value]) => {
      value.channel_width = parseInt(value.channel_width);
    });
    if (isEdit) {
      editGroup(id, result).then(() => getData());
    } else if (readOnly) {
      return;
    } else {
      setSaveOnAdd(true);
      addGroup(result).then(() =>
        history.push(
          props.location.backUrl
            ? props.location.backUrl
            : `/organizations/${props.currentOrganization}/groups`
        )
      );
    }
  };

  const modalSave = () => {
    trimObjectStrings(formik.values);
    if (isEdit) {
      editGroup(id, formik.values);
    } else if (readOnly) {
      return;
    } else {
      addGroup(formik.values);
    }
  };

  const validate = (values) => {
    let errors = {};
    errors.groupname = isRequired(values.groupname);
    errors.description = isRequired(values.description);
    errors.mesh_ssid = isRequired(values?.config?.mesh?.backhaul?.ssid);
    errors.mesh_passphrase = isString(
      values?.config?.mesh?.backhaul?.passphrase,
      8,
      63
    );
    errors.mesh_id = isRequired(values?.config?.mesh?.id);

    values?.config?.ssids?.map((ssid) => {
      errors["ssid_" + ssid.name + "_name"] = isRequired(ssid.name);
      errors["ssid_" + ssid.name + "_passphrase"] = isString(
        ssid.security.passphrase,
        8,
        63
      );

      if (!errors["ssid_" + ssid.name + "_name"])
        delete errors["ssid_" + ssid.name + "_name"];

      if (!errors["ssid_" + ssid.name + "_passphrase"])
        delete errors["ssid_" + ssid.name + "_passphrase"];

      if (ssid.security.mode == "Open")
        delete errors["ssid_" + ssid.name + "_passphrase"];
    });

    if (!errors.groupname) delete errors.groupname;
    if (!errors.description) delete errors.description;
    if (!errors.mesh_ssid) delete errors.mesh_ssid;
    if (!errors.mesh_passphrase) delete errors.mesh_passphrase;
    if (!errors.mesh_id) delete errors.mesh_id;
    if (!values.config.mesh.enabled) {
      delete errors.mesh_ssid;
      delete errors.mesh_passphrase;
      delete errors.mesh_id;
    }

    return errors;
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues,
    validate,
  });

  const getData = () => {
    getGroup(id)
      .then((data) => {
        delete data.configseq;
        if (readOnly) {
          getDevice(id, props.match.params.deviceId).then((deviceData) => {
            data.config = deviceData.config;
            setInitialValues(data);
            setDeviceName(deviceData.devicename);
          });
        } else {
          setInitialValues(data);
        }
      })

      .catch((err) => console.error(err));
  };

  useEffect(() => {
    if (organization && (isEdit || readOnly)) {
      getData();
    }
  }, [organization]);

  return (
    <>
      <Row className="mb-1 label row--with-shadow">
        <Col>
          <h1>
            {isEdit
              ? formik.values?.groupname + " configuration"
              : readOnly
              ? deviceName + " configuration"
              : "Add new group"}
          </h1>
        </Col>
        <Col xs="auto">
          <LinkField
            button={true}
            type="button"
            title="Back"
            to={{
              pathname: props.location.backUrl
                ? props.location.backUrl
                : `/groups`,
              state: {},
            }}
          />
        </Col>
        {!isViewer ? (
          !readOnly ? (
            <Col xs="auto" className="pl-0">
              <ButtonField
                title="Save"
                color="primary"
                type="submit"
                onClick={() => onSave()}
                disabled={!formik.dirty || !formik.isValid}
              />
            </Col>
          ) : null
        ) : null}
      </Row>
      <div className="secret-shadow"></div>
      {initialValues.config ? (
        <>
          <Row className="row-eq-height position-relative">
            <div className="shaddow-cover"></div>
            {!readOnly ? (
              <Col lg="6">
                <GroupInfo
                  {...props}
                  values={formik.values}
                  handleChange={formik.handleChange}
                  errors={formik.errors}
                  disabled={readOnly || isViewer ? true : false}
                />
              </Col>
            ) : null}
            <Col lg="6">
              <MeshSettings
                {...props}
                values={formik?.values?.config?.mesh}
                handleChange={formik.handleChange}
                config={formik?.values}
                errors={formik.errors}
                zones={zones}
                disabled={readOnly || isViewer ? true : false}
              />
            </Col>
          </Row>
          <WirelessSettingsPage
            {...props}
            values={formik?.values?.config?.radio}
            handleChange={formik.handleChange}
            config={formik?.values}
            setConfig={formik.setValues}
            disabled={readOnly || isViewer ? true : false}
          />
          <Row>
            <Col>
              <SsidSettingsPage
                {...props}
                values={formik.values}
                handleChange={formik.handleChange}
                config={formik?.values}
                setConfig={formik.setValues}
                errors={formik.errors}
                zones={zones}
                disabled={readOnly || isViewer ? true : false}
              />
            </Col>
          </Row>
        </>
      ) : (
        <div className="mb-2 alert alert-warning">
          Device configuration is unknown
        </div>
      )}
      <ClosePromptModal
        dirty={formik.dirty}
        valid={formik.isValid}
        history={props.history}
        onSave={modalSave}
        saveOnAdd={saveOnAdd}
      />
    </>
  );
}

const zones = [
  { value: "wan", name: "Internet" },
  { value: "lan", name: "Local Network" },
];

const initialConfig = {
  mesh: {
    enabled: false,
    id: "",
    network_zone: "wan",
    redundancy: true,
    backhaul: {
      radio: "",
      ssid: "",
      passphrase: "",
    },
  },
  radio: {
    wifi0: {
      channel: [],
      channel_width: 80,
      tx_power: 10,
    },
    wifi1: {
      channel: [],
      channel_width: 40,
      tx_power: 10,
    },
    wifi2: {
      channel: [],
      channel_width: 80,
      tx_power: 10,
    },
  },
  ssids: [
    {
      name: "Prism",
      network_zone: "wan",
      radios: ["wifi0", "wifi1", "wifi2"],
      security: { mode: "WPA2 PSK", passphrase: "passphrase" },
    },
  ],
};
