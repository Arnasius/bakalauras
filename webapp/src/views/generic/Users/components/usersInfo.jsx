import React, { useState } from "react";
import { Row, Col } from "reactstrap";
import { useLocation } from "react-router-dom";
import DrawTable from "components/DrawTable/DrawTable";
import CardWithLoading from "components/Cards/CardWithLoading";
import ButtonField from "components/Fields/ButtonField";
import { getRoleName } from "services/text";
import { accessDisabled } from "services/auth";
import { copyText, secondsFromDate } from "services/text";
import { DeleteModal } from "components/Modals/DeleteModal";
import { Link } from "react-router-dom";
import LinkField from "components/Links/LinkField";
import { BsFillGearFill, BsTrashFill } from "react-icons/bs";

export default function UsersInfo(props) {
  const [modalState, setModal] = useState({
    message: "",
    modalOpen: false,
    loading: false,
  });
  const { loading, loadData } = props;
  const location = useLocation();
  const remove = (removeFunction, args) => {
    setModal((state) => ({
      ...state,
      modalOpen: true,
      onDelete: () => {
        return removeFunction.apply(this, args);
      },
    }));
  };
  const returnInvDeleteButton = (id, org, email) => {
    if (!accessDisabled(1)) {
      return (
        <ButtonField
          className="btn-remove"
          title={<BsTrashFill />}
          onClick={() => {
            setModal((state) => ({
              ...state,
              message: `Are you sure that you want to delete ${email} invitation?`,
            }));
            remove(props.removeInvite, [id, org, email]);
          }}
        />
      );
    }
  };

  const returnLinkCol = (data, index) => {
    if (!data) return;
    else {
      return data != "-" ? (
        <div id={"target_" + index}>
          <i>{data}</i>
          <i
            onClick={() => copyText("target_" + index)}
            className="now-ui-icons files_single-copy-04 ml-1 align-middle"
            id="copy"
          />
        </div>
      ) : (
        data
      );
    }
  };

  const returnActionBtns = (data) => {
    const { userid, username } = data || {};
    return (
      <>
        {!accessDisabled(1) ? (
          props.isAllUsersScreen ? (
            <Link
              id={data.groupname + "-config"}
              to={{
                pathname: `/all-users/${userid}/edit`,
                backUrl: location.pathname,
              }}
            >
              <BsFillGearFill />
            </Link>
          ) : (
            <LinkField
              id={data.groupname + "-config"}
              to={{
                pathname: `/users/${userid}/edit`,
                backUrl: location.pathname,
              }}
              text={<BsFillGearFill />}
            />
          )
        ) : null}
        {accessDisabled(1) ? null : (
          <i className="pl-2">
            <ButtonField
              className="btn-remove"
              title={<BsTrashFill />}
              onClick={() => {
                setModal((state) => ({
                  ...state,
                  message: `Are you sure that you want to delete ${username} user ?`,
                }));
                remove(props.remove, [userid, username]);
              }}
            />
          </i>
        )}
      </>
    );
  };

  return (
    <>
      <CardWithLoading
        id="users"
        className="mb-3"
        loading={loading}
        loadData={loadData}
        header={
          <Row>
            <Col>{props.name} </Col>
            <Col xs="auto">
              {!props.isAllUsersScreen && !accessDisabled(1) ? (
                <LinkField
                  button={true}
                  color="primary"
                  title="+ Invite"
                  size="xs"
                  to={{
                    pathname: `/invite-user`,
                    state: {},
                  }}
                />
              ) : null}
            </Col>
            <Col xs="auto">
              {props.isAllUsersScreen || !accessDisabled(0) ? (
                <Link
                  to={{
                    pathname: `/all-users/add-user`,
                    backUrl: location.pathname,
                  }}
                >
                  <ButtonField color="primary" title="+ add" size="xs" />
                </Link>
              ) : null}
            </Col>
          </Row>
        }
        body={
          <Row>
            <Col>
              <DrawTable
                data={props.users}
                layout="fixed"
                columns={{
                  Username: {
                    value: "username",
                    visibleOnTablet: true,
                  },
                  Role: {
                    value: "roleid",
                    component: (data) => getRoleName(data.roleid),
                    hidden: props.location.pathname === "/all-users",
                  },
                  Email: {
                    value: "email",
                  },
                  "Last login date": {
                    value: "lastlogindate",
                    sortFormat: secondsFromDate,
                    component: (data) =>
                      data.lastlogindate
                        ? new Date(data.lastlogindate).toDateString()
                        : "-",
                  },
                  "First name": {
                    value: "firstname",
                    secondRow: true,
                  },
                  "Last name": {
                    value: "lastname",
                    secondRow: true,
                  },
                  "Created Date": {
                    value: "createdDate",
                    component: (data) =>
                      data.createddate
                        ? new Date(data.createddate).toDateString()
                        : "-",
                    secondRow: true,
                  },
                  "Updated Date": {
                    value: "updatedDate",
                    component: (data) =>
                      data.updateddate
                        ? new Date(data.updateddate).toDateString()
                        : "-",
                    secondRow: true,
                  },
                  Country: {
                    value: "country",
                    secondRow: true,
                  },
                  Actions: {
                    component: (data) => returnActionBtns(data),
                    value: "data",
                    className: "text-right table-actions",
                    visibleOnTablet: true,
                    hideSort: true,
                    colspan: props.location.pathname === "/all-users" ? 2 : 1,
                  },
                }}
                collapsable
                reduceLastChild
                search
                sort
                paginate
                labelLastChild
              />
            </Col>
          </Row>
        }
      />
      <CardWithLoading
        id="users"
        loading={loading}
        loadData={loadData}
        header={
          <Row>
            <Col>Invited Users </Col>
          </Row>
        }
        body={
          <Row>
            <Col>
              <DrawTable
                data={props.invitedUsers}
                layout="fixed"
                columns={{
                  Email: {
                    value: "email",
                  },
                  Status: {
                    value: "status",
                  },
                  "Invitation link": {
                    value: "key",
                    component: (data, index) => returnLinkCol(data.key, index),
                  },
                  "": {
                    value: "key",
                    component: (data) =>
                      returnInvDeleteButton(
                        data.userid,
                        data.orgid,
                        data.email
                      ),
                    className: "text-right table-actions",
                  },
                }}
                search
                sort
                paginate
                reduceLastChild
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
