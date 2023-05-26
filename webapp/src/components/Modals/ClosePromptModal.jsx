import React from "react";
import { Prompt } from "react-router";

import { WarningModal } from "components/Modals/WarningModal";

export default class ClosePromptModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      modalOpen: false,
      navigate: false,
      blockNavigate: false,
    };
    this.setBlockNavigate = this.setBlockNavigate.bind(this);
    this.showExitModal = this.showExitModal.bind(this);
    this.showModal = this.showModal.bind(this);
    this.navigate = this.navigate.bind(this);
    this.closeModal = this.closeModal.bind(this);
  }

  setBlockNavigate(value) {
    this.setState({ blockNavigate: value });
  }

  showExitModal(nextLocation) {
    const { navigate } = this.state;
    if (!navigate) {
      this.showModal(nextLocation);
      return false;
    }
    return true;
  }

  showModal(location) {
    this.setState({
      modalOpen: true,
      lastLocation: location,
    });
  }

  componentDidUpdate() {
    const { dirty, saveOnAdd } = this.props;
    const { blockNavigate } = this.state;

    if (dirty && !blockNavigate) {
      dirty && this.setBlockNavigate(true);
    } else if (!dirty && blockNavigate) {
      this.setBlockNavigate(false);
    }

    if (blockNavigate && !saveOnAdd) {
      window.onbeforeunload = () => true;
    } else {
      window.onbeforeunload = undefined;
    }
  }

  closeModal() {
    this.setState({ modalOpen: false });
  }

  navigate() {
    this.closeModal();
    const { history } = this.props;
    const { lastLocation } = this.state;
    if (lastLocation) {
      this.setState(
        {
          navigate: true,
        },
        () => {
          history.replace(lastLocation.pathname);
        }
      );
    }
  }

  render() {
    return (
      <React.Fragment>
        <Prompt
          when={this.state.blockNavigate && !this.props.saveOnAdd}
          message={this.showExitModal}
        />
        <WarningModal
          modalOpen={this.state.modalOpen}
          closeModal={this.closeModal}
          navigate={this.navigate}
          {...this.props}
        />
      </React.Fragment>
    );
  }
}
