import React from "react";
import { NavLink } from "react-router-dom";
import { BsGear } from "react-icons/bs";

export default function SystemSettingsLink() {
  return (
    <li className="header-maintenance">
      <NavLink exact to={`/settings`} replace>
        <BsGear />
      </NavLink>
    </li>
  );
}
