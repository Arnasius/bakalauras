import EditUser from "./Users/components/editUser";
import OrganizationInformationPage from "./Organizations";
import { NoOrganizations } from "./NoOrganizations/page";

export const noOrgRoutes = [
  {
    path: "/",
    name: "Dashboard",
    customIcon: "icon-dashboard",
    component: NoOrganizations,
  },
  {
    path: "/",
    redirect: true,
    name: "Dashboard",
  },
  {
    nested: true,
    icon: "business_briefcase-24",
    name: "Organizations",
    path: "/organizations",
    component: OrganizationInformationPage,
  },
  {
    nested: true,
    path: "/users/:userId/:action",
    sidePath: "/users",
    name: "Personal info",
    icon: "users_single-02",
    component: EditUser,
  },
];

export default {
  noOrgRoutes,
};
