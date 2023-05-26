import React from "react";

export default function WidthToggler({ isSidebarCollapsed, toggleSidebar }) {
  return (
    <div
      className={`sidebar-width-toggler ${
        isSidebarCollapsed ? "collapsed" : "expanded"
      }`}
      onClick={() => {
        toggleSidebar();
      }}
    >
      {isSidebarCollapsed ? (
        <>
          <i className="now-ui-icons arrows-1_minimal-right" />
          <i className="now-ui-icons arrows-1_minimal-right" />
        </>
      ) : (
        <>
          <i className="now-ui-icons arrows-1_minimal-left" />
          <i className="now-ui-icons arrows-1_minimal-left" />
        </>
      )}
    </div>
  );
}
