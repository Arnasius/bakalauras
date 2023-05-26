import React from "react";
import { NavLink } from "react-router-dom";
import { BsPeople } from "react-icons/bs";

export default function AllUsersLink() {
  return (
    <li className="header-maintenance">
      <NavLink exact to={`/all-users`} replace>
        <BsPeople />
      </NavLink>
    </li>
  );
}
