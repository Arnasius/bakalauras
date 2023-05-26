import React from "react";
import ws from "services/ws";
import DisconnectModal from "../../disconnectModal";
import { BlockWatcher } from "state/block";

@BlockWatcher
class ConnectionWatcher extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      missed_heartbeats: 0,
      isDisconnected: false,
    };
    this.heartbeat_interval = null;
    this.wsConnected = false;

    this.beat = this.beat.bind(this);
  }

  beat() {
    try {
      if (!this.props.blockType) {
        this.setState({
          missed_heartbeats: this.state.missed_heartbeats + 1,
        });
      }
      if (this.state.missed_heartbeats > 2) {
        this.setState({ isDisconnected: true });
        throw new Error("Disconnected");
      }
    } catch (e) {
      clearInterval(this.heartbeat_interval);
      this.heartbeat_interval = null;
      this.setState({ isDisconnected: true });
      console.warn("Closing connection. Reason: " + e.message);
    }
  }

  componentDidMount() {
    ws.listen("ws", {
      message: (body) => {
        if (body.message !== "ping") return;
        if (!this.wsConnected) {
          this.heartbeat_interval = setInterval(this.beat, 5000);
          this.wsConnected = true;
        }
        if (body.message == "ping") {
          this.setState({
            missed_heartbeats: 0,
            isDisconnected: false,
          });
        }
      },
    });
  }

  componentWillUnmount() {
    clearInterval(this.heartbeat_interval);
  }

  render() {
    return <DisconnectModal isOpen={this.state.isDisconnected} />;
  }
}
export default ConnectionWatcher;
