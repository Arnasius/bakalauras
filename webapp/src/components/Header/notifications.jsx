import React, { useState, useEffect } from "react";
import { PopoverBody, Popover } from "reactstrap";
import DrawTable from "components/DrawTable/DrawTable";
import auth from "services/auth";
import { checkPendingInvites, accept, decline } from "../../services/users";
import ButtonField from "components/Fields/ButtonField";

export default function Notifications() {
  const [state, setState] = useState({
    user: [],
    notifications: [],
  });
  const [popover, setPopover] = useState(false);
  const getNotifications = () => {
    const user = auth.getCurrentUser();
    checkPendingInvites(user.id).then((result) => {
      setState({ notifications: result.data, user: user });
    });
  };
  const togglePopover = (value) => {
    setPopover(!value);
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const returnAcceptButton = (value) => {
    return (
      <>
        <ButtonField
          title="Accept"
          className="badge-table-action badge badge-light"
          onClick={() => {
            accept(value.orgid, state.user.id).then(() => {
              location.reload();
            });
          }}
        />
        <ButtonField
          title="Decline"
          className="badge-table-action badge badge-secondary ml-2"
          onClick={() => {
            decline(value.orgid, state.user.id).then(() => {
              location.reload();
            });
          }}
        />
      </>
    );
  };

  return (
    <React.Fragment>
      <li
        onClick={() => {
          togglePopover(true);
        }}
        id="activityPopover"
      >
        <a>
          <i className="now-ui-icons ui-1_calendar-60 position-relative">
            {state.notifications.length ? (
              <span className="rounded-circle events-notification position-absolute">
                &#x21;
              </span>
            ) : null}
          </i>
        </a>
      </li>

      <Popover
        placement={window.innerWidth < 500 ? "bottom-start" : "bottom-end"}
        target="activityPopover"
        className="maintenance-header popover-lg invite-popover"
        trigger="legacy"
        delay={0}
        isOpen={popover}
        toggle={() => togglePopover()}
      >
        <PopoverBody className="headerPopoverBody">
          <div className="px-3 py-3">
            {state.notifications.length ? (
              <>
                <div className="mb-2">
                  You have been invited to following organizations:
                </div>
                <DrawTable
                  data={state.notifications}
                  layout="fixed"
                  columns={{
                    " ": { value: "orgname" },

                    "": {
                      component: (data) => returnAcceptButton(data),
                    },
                  }}
                />
              </>
            ) : (
              "No New notifications"
            )}
          </div>
        </PopoverBody>
      </Popover>
    </React.Fragment>
  );
}
