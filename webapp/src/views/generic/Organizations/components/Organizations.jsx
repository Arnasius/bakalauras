import React, { useEffect, useState } from "react";
import { Row, Col } from "reactstrap";
import DrawTable from "components/DrawTable/DrawTable";
import CardWithLoading from "components/Cards/CardWithLoading";
import ButtonField from "components/Fields/ButtonField";
import LinkField from "components/Links/LinkField";
import { getAllOrgs, deleteOrg } from "services/organizations";
import { DeleteModal } from "components/Modals/DeleteModal";
import auth from "services/auth";

export default function OrganizationsInfo({ refreshOrgs }) {
  const [organizations, setOrganizations] = useState([]);
  const [modalState, setModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
  });

  useEffect(() => {
    getAllOrgs().then((res) => {
      res.map((x) => {
        if (!x.description) x.description = "";
      });
      setOrganizations(res);
    });
  }, []);

  const addOrganization = () => {
    if (!auth.accessDisabled(0)) {
      return (
        <a href="#/organizations/add">
          <ButtonField color="primary" size="xs" title="+ Add" />
        </a>
      );
    }
  };

  const returnActionBtns = (data) => {
    return (
      <div className="d-flex justify-content-end">
        {auth.accessDisabled(1, data.roleid) ? null : (
          <LinkField
            noOrg={true}
            icon={"now-ui-icons disabled ui-1_settings-gear-63"}
            to={{
              pathname: `organizations/${data.orgid}/edit`,
              state: { data },
            }}
          />
        )}

        {auth.accessDisabled(0) ? null : (
          <i className="pl-2">
            <ButtonField
              className="btn-remove"
              title={<i className="now-ui-icons ui-1_simple-remove" />}
              onClick={() =>
                setModal((state) => ({
                  ...state,
                  onDelete: () => {
                    return deleteOrg(data.orgid)
                      .then(() => {
                        setOrganizations(
                          organizations.filter(
                            (value) => value.orgid != data.orgid
                          )
                        );
                        refreshOrgs();
                      })
                      .catch((err) => {
                        console.error(err);
                      });
                  },
                  message: `Are you sure you want to delete ${data.orgname} organization ?`,
                  modalOpen: true,
                }))
              }
            />
          </i>
        )}
      </div>
    );
  };

  const getColumns = () => {
    let columns = {
      ID: {
        value: "orgid",
        sortFormat: parseFloat,
        component: (data) => data.orgid,
      },
      Name: {
        value: "orgname",
        visibleOnTablet: true,
        component: (data) => (
          <a href={`#/organizations/${data.orgid}/dashboard`}>{data.orgname}</a>
        ),
      },
      Actions: {
        component: (data) => returnActionBtns(data),
        value: "data",
        className: "text-right",
        visibleOnTablet: true,
        hideSort: true,
      },
      Description: {
        value: "description",
        component: (data) => data.description,
        secondRow: true,
      },
      Created: {
        value: "createdDate",
        component: (data) => new Date(data.createddate).toDateString(),
        secondRow: true,
      },
      Updated: {
        value: "updatedDate",
        component: (data) => new Date(data.updateddate).toDateString(),
        secondRow: true,
      },
    };

    return columns;
  };

  return (
    <>
      <CardWithLoading
        id="Organizations"
        header={
          <Row>
            <Col>Organizations</Col>
            <Col xs="auto">{addOrganization()}</Col>
          </Row>
        }
        body={
          <Row>
            <Col>
              <DrawTable
                search
                sort
                paginate
                collapsable
                data={organizations}
                columns={getColumns()}
                labelLastChild
              />
            </Col>
          </Row>
        }
      />
      <DeleteModal
        {...modalState}
        closeModal={() => setModal({ ...modalState, modalOpen: false })}
      />
    </>
  );
}
