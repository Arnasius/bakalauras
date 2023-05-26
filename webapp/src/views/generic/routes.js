import SystemInformation from "./SystemInformation";
import Group from "./Groups/components/Group";
import Device from "./Devices/components/Device";
import UpgradeDevice from "./Devices/components/UpgradeDevice";
import UserInformationPage from "./Users";
import EditUser from "./Users/components/editUser";
import InviteUser from "./Users/components/inviteUser";
import AddOrganization from "./Organizations/components/AddOrganization";
import OrganizationInformationPage from "./Organizations";
import Groups from "./Groups";
import PendingDevices from "./Devices/components/PendingDevices";
import RegisterDevice from "./Devices/components/RegisterDevice";
import AddDevice from "./Devices/components/AddDevice";
import { SystemSettings } from "./SystemSettings/page";
import Notifications from "components/Header/notifications";
import UserSettingsLink from "components/Header/userSettings";
import AllUsersLink from "components/Header/allUsers";
import SystemSettingsLink from "components/Header/systemSettings";
import GroupConfigPage from "./Config/GroupConfig";
import UploadFirmware from "./SystemSettings/components/UploadFirmware";

export const brandProps = {
  title: "System",
  copyright: "BAKALAURAS",
  collapsableSidebar: false,
  disabledFeatures: {},
};

export const headerComponents = [
  { component: Notifications, type: "actions" },
  { component: UserSettingsLink, type: "actions" },
  { component: AllUsersLink, type: "actions", userLoginLevel: 0 },
  { component: SystemSettingsLink, type: "actions", userLoginLevel: 3 },
];

export const routes = [
  {
    path: "/organizations/:orgId/dashboard",
    sidePath: "/dashboard",
    name: "Dashboard",
    customIcon: "icon-dashboard",
    component: SystemInformation,
  },
  {
    path: "/",
    redirect: true,
    name: "Dashboard",
  },
  {
    path: "/organizations/:orgId/groups",
    sidePath: "/groups",
    name: "Devices",
    customIcon: "icon-clients",
    component: Groups,
    children: [
      {
        path: "/organizations/:orgId/groups",
        sidePath: "/groups",
        name: "Registered devices",
        component: Groups,
      },
      {
        path: "/organizations/:orgId/pending-devices",
        sidePath: "/pending-devices",
        name: "Pending registration",
        component: PendingDevices,
      },
    ],
  },
  {
    nested: true,
    path: "/organizations/:orgId/pending-devices/:deviceId/register",
    sidePath: "/pending-devices",
    name: "Device registration",
    component: RegisterDevice,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/:action",
    sidePath: "/groups/:groupId/config",
    component: GroupConfigPage,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/:action/devices/:deviceId",
    sidePath: "/groups/:groupId/config",
    component: GroupConfigPage,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:action",
    sidePath: "/add-group",
    component: GroupConfigPage,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/devices/",
    sidePath: "/groups/:groupId/devices/",
    component: Group,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/devices/:deviceId",
    sidePath: "/groups/:groupId/devices/:deviceId",
    component: Device,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/devices/:deviceId/upgrade",
    sidePath: "/groups/:groupId/devices/:deviceId",
    component: UpgradeDevice,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/devices/add-device/",
    sidePath: "/groups/:groupId/devices/add-device/",
    component: AddDevice,
  },
  {
    nested: true,
    path: "/organizations/:orgId/groups/:groupId/devices/:deviceId/edit",
    sidePath: "/groups/:groupId/devices/:deviceId/edit",
    component: AddDevice,
  },
  {
    path: "/organizations/:orgId/users",
    sidePath: "/users",
    name: "Users",
    icon: "users_single-02",
    component: UserInformationPage,
  },
  {
    path: "/organizations/:orgId/users/:userId/:action",
    nested: true,
    name: "Edit user",
    component: EditUser,
  },

  {
    nested: true,
    path: "/all-users",
    name: "All users",
    icon: "users_single-02",
    component: UserInformationPage,
    userLoginLevel: 0,
  },

  {
    nested: true,
    path: "/organizations/:orgId/invite-user",
    sidePath: "/invite-user",
    component: InviteUser,
  },
  {
    nested: true,
    path: "/all-users/:action",
    name: "Add user",
    sidePath: "/add-user",
    component: EditUser,
    userLoginLevel: 0,
  },
  {
    nested: true,
    path: "/all-users/:userId/:action",
    name: "Edit user",
    component: EditUser,
    userLoginLevel: 0,
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
    path: "/organizations/add",
    component: AddOrganization,
  },
  {
    nested: true,
    path: "/organizations/:orgId/edit",
    component: AddOrganization,
  },
  {
    nested: true,
    path: "/users/:userId/:action",
    sidePath: "/users",
    name: "Personal info",
    icon: "users_single-02",
    component: EditUser,
  },
  {
    nested: true,
    path: "/settings",
    name: "Settings",
    customIcon: "icon-dashboard",
    component: SystemSettings,
    userLoginLevel: 0,
  },
  {
    nested: true,
    path: "/settings/firmware-upload",
    name: "Upload firmware",
    component: UploadFirmware,
    userLoginLevel: 0,
  },
];

export default {
  routes,
  brandProps,
  headerComponents,
};
