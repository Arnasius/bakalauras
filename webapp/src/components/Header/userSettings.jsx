import React from "react";
import { getCurrentUser } from "services/auth";
import { NavLink } from "react-router-dom";
import { BsPerson } from "react-icons/bs";

export default function UserSettingsLink() {
  return (
    <li className="header-maintenance">
      <NavLink exact replace to={`/users/${getCurrentUser().id}/edit`}>
        <BsPerson />
      </NavLink>
    </li>
  );
}
