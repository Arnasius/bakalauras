import React from "react";
import ReactDOM from "react-dom";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Fade } from "reactstrap";

function omit(obj, omitKeys) {
  const result = {};
  Object.keys(obj).forEach((key) => {
    if (omitKeys.indexOf(key) === -1) {
      result[key] = obj[key];
    }
  });
  return result;
}

function mapToCssModules(className = "", cssModule) {
  if (!cssModule) return className;
  return className
    .split(" ")
    .map((c) => cssModule[c] || c)
    .join(" ");
}

const PortalPropTypes = {
  children: PropTypes.node.isRequired,
  node: PropTypes.any,
};

class Portal extends React.Component {
  componentWillUnmount() {
    if (this.defaultNode) {
      document.body.removeChild(this.defaultNode);
    }
    this.defaultNode = null;
  }

  render() {
    if (!this.props.node && !this.defaultNode) {
      this.defaultNode = document.createElement("div");
      document.body.appendChild(this.defaultNode);
    }

    return ReactDOM.createPortal(
      this.props.children,
      this.props.node || this.defaultNode
    );
  }
}

Portal.propTypes = PortalPropTypes;

const FadePropTypes = PropTypes.shape(Fade.propTypes);

const BlockPropTypes = {
  isOpen: PropTypes.bool,
  centered: PropTypes.bool,
  size: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
  wrapClassName: PropTypes.string,
  modalClassName: PropTypes.string,
  backdropClassName: PropTypes.string,
  contentClassName: PropTypes.string,
  fade: PropTypes.bool,
  cssModule: PropTypes.object,
  backdropTransition: FadePropTypes,
  modalTransition: FadePropTypes,
};

const BlockDefaultProps = {
  isOpen: false,
  centered: true,
  fade: true,
  modalTransition: {
    timeout: 150,
  },
  backdropTransition: {
    timeout: 150,
    mountOnEnter: true,
  },
};

class Block extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isOpen: null,
    };

    this._element = null;

    this.dialogIsClosing = this.dialogIsClosing.bind(this);
  }

  componentWillUnmount() {
    this.destroy();
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (nextProps.isOpen && !this.props.isOpen) {
      this.setState({ isOpen: true });
    }
  }

  dialogIsClosing() {
    this.setState({ isOpen: false });
  }

  init() {
    if (this._element) return;

    this._element = document.createElement("div");
    this._element.setAttribute("tabindex", "-1");
    this._element.style.position = "relative";
    this._element.style.zIndex = 1100;

    document.body.appendChild(this._element);
  }

  destroy() {
    if (!this._element) return;

    document.body.removeChild(this._element);
    this._element = null;
  }

  render() {
    if (this.state.isOpen) {
      this.init();
      const { wrapClassName, modalClassName, backdropClassName, cssModule } =
        this.props;

      // TODO: switch to own blocking style
      const dialogBaseClass = "modal-dialog";
      const dialogAttributes = omit(this.props, Object.keys(BlockPropTypes));

      const modalAttributes = {
        style: { display: "block" },
        role: "block",
        tabIndex: "-1",
      };

      const hasTransition = this.props.fade;
      const modalTransition = {
        ...Fade.defaultProps,
        ...this.props.modalTransition,
        baseClass: hasTransition ? this.props.modalTransition.baseClass : "",
        timeout: hasTransition ? this.props.modalTransition.timeout : 0,
      };
      const backdropTransition = {
        ...Fade.defaultProps,
        ...this.props.backdropTransition,
        baseClass: hasTransition ? this.props.backdropTransition.baseClass : "",
        timeout: hasTransition ? this.props.backdropTransition.timeout : 0,
      };

      const Backdrop = hasTransition ? (
        <Fade
          {...backdropTransition}
          in={this.props.isOpen}
          cssModule={cssModule}
          className={mapToCssModules(
            classNames("modal-backdrop", backdropClassName),
            cssModule
          )}
        />
      ) : (
        <div
          className={mapToCssModules(
            classNames("modal-backdrop", "show", backdropClassName),
            cssModule
          )}
        />
      );

      return (
        <Portal node={this._element}>
          <div className={mapToCssModules(wrapClassName)}>
            <Fade
              {...modalAttributes}
              {...modalTransition}
              in={this.props.isOpen}
              onExited={this.dialogIsClosing}
              cssModule={cssModule}
              className={mapToCssModules(
                classNames("modal", modalClassName),
                cssModule
              )}
            >
              <div
                {...dialogAttributes}
                className={mapToCssModules(
                  classNames(
                    dialogBaseClass,
                    this.props.className,
                    "justify-content-center",
                    {
                      [`modal-${this.props.size}`]: this.props.size,
                      [`${dialogBaseClass}-centered`]: this.props.centered,
                    }
                  ),
                  this.props.cssModule
                )}
                role="document"
                ref={(c) => {
                  this._dialog = c;
                }}
              >
                <div
                  className={mapToCssModules(
                    classNames("alert alert-info", this.props.contentClassName),
                    this.props.cssModule
                  )}
                >
                  {this.props.children}
                </div>
              </div>
            </Fade>
            {Backdrop}
          </div>
        </Portal>
      );
    } else {
      this.destroy();
      return null;
    }
  }
}

Block.propTypes = BlockPropTypes;
Block.defaultProps = BlockDefaultProps;

export default Block;
