import React, { useState, useLayoutEffect } from "react";
import UsersInfo from "./components/usersInfo";
import {
  getOrgUsers,
  getAllUsers,
  removeUserFromOrg,
  deleteInvite,
  getAllPendingInvites,
} from "services/users";
import { deleteUser } from "services/deleteUser";
import { Row, Col } from "reactstrap";

export function UsersInformationPage(props) {
  const [users, setUsers] = useState([]);
  const [invitedUsers, setInvitedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const orgId = props.match.params.orgId;

  const remove = (userid) => {
    return deleteUser(userid)
      .then(() => {
        getUsers();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const filterInvitedUsers = (data) => {
    let invUsers = [];
    let currentUsers = [];
    data.map((user) => {
      if (user.status === "pending" || user.status === "declined") {
        if (user.key) {
          user.key = window.location.origin + "/#/invite=" + user.key;
        }
        invUsers.push(user);
      } else if (user) {
        currentUsers.push(user);
      }
    });
    setUsers(currentUsers);
    console.info(invUsers);
    setInvitedUsers(invUsers);
  };

  const removeInvite = (id, org, email) => {
    return deleteInvite(id, org, email)
      .then(() => {
        getUsers();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const kick = (userid) => {
    return removeUserFromOrg(orgId, userid)
      .then(() => {
        getUsers();
      })
      .catch((err) => {
        console.error(err);
      });
  };

  const getUsers = () => {
    if (props.userLoginLevel === 0) {
      getAllPendingInvites().then((invites) => {
        filterInvitedUsers(invites);
        getAllUsers()
          .then((res) => {
            setUsers(res);
            setLoading(false);
          })
          .catch((err) => {
            console.error(err);
            setLoading(false);
          });
      });
    } else {
      getOrgUsers(orgId)
        .then((res) => {
          filterInvitedUsers(res);
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  };

  useLayoutEffect(() => {
    getUsers();
  }, []);

  return (
    <>
      <Row>
        <Col>
          <UsersInfo
            loading={loading}
            loadData={getUsers}
            users={users}
            invitedUsers={invitedUsers}
            remove={props.userLoginLevel === 0 ? remove : kick}
            removeInvite={removeInvite}
            isAllUsersScreen={props.userLoginLevel === 0}
            {...props}
          />
        </Col>
      </Row>
    </>
  );
}
