import React from "react";
import { NavItem } from "reactstrap";
import auth from "services/auth";
import { SecurityAction } from "state/security";
import { DeleteModal } from "components/Modals/DeleteModal";
import { withRouter } from "react-router-dom";

@SecurityAction
class LogoutButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      modalState: {
        modalOpen: false,
        loading: false,
        message: "Are you sure you want to logout?",
        header: "Logout comfirmation",
        confirmButtonName: "Logout",
      },
    };
    this.logout = this.logout.bind(this);
  }

  render() {
    return (
      <>
        <NavItem className="log-out">
          <i onClick={this.logout} className="now-ui-icons arrows-1_share-66" />
        </NavItem>
        <DeleteModal
          {...this.state.modalState}
          closeModal={() =>
            this.setState({
              modalState: { ...this.state.modalState, modalOpen: false },
            })
          }
        />
      </>
    );
  }

  logout() {
    this.setState({
      modalState: {
        ...this.state.modalState,
        modalOpen: true,
        loading: false,
        onDelete: () => {
          this.props.history.push("/log-out");
          return auth
            .logout()
            .then(() => this.props.setAuthState(false))
            .catch(() => {
              document.cookie =
                "clientToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
              this.props.setAuthState(false);
            });
        },
      },
    });
  }
}

export default withRouter(LogoutButton);
