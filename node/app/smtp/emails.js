const db = require("../db");
const nodemailer = require("./nodemailer");
const { getSettings } = require("./smtpSettings");

function roleIdToName(id) {
  if (id == 1) return "Admin";
  else if (id == 2) return "Editor";
  else if (id == 3) return "Viewer";
  else return "Unknown";
}

module.exports.new_user_invite = async (email, org, key) => {
  const smtp = await getSettings();
  if (!smtp.smtp || !smtp.domain) return;

  const { rows } = await db.query(
    "SELECT orgname FROM organizations WHERE orgid = $1",
    [org]
  );
  if (!rows.length) {
    console.warn(`Could not send user invite. Org ID ${org} does not exist.`);
    return;
  }

  const proto = smtp.sslstatus ? "https" : "http";
  const link = `${proto}://${smtp.domain}/#/invite=${key}`;

  const orgname = rows[0].orgname || "";

  const subject = "Invitation to join PrismX";
  const content = `You have been invited to join "${orgname}" organization in PrismX controller.

Please follow this link to create your user account:
${link}`;

  nodemailer.smtp_send(email, subject, content);
};

module.exports.existing_user_invite = async (email, org, roleid) => {
  const smtp = await getSettings();
  if (!smtp.smtp || !smtp.domain) return;

  const { rows } = await db.query(
    "SELECT orgname FROM organizations WHERE orgid = $1",
    [org]
  );
  if (!rows.length) {
    console.warn(`Could not send user invite. Org ID ${org} does not exist.`);
    return;
  }

  const proto = smtp.sslstatus ? "https" : "http";
  const link = `${proto}://${smtp.domain}`;

  const orgname = rows[0].orgname || "";
  const rolename = roleIdToName(roleid);

  const subject = "PrismX: invitation to join new organization";
  const content = `You have been granted ${rolename} access to "${orgname}" organization in PrismX controller.

Please login to your account at ${link} to confirm or decline the invitation.`;

  nodemailer.smtp_send(email, subject, content);
};

module.exports.password_reset = async (email, key) => {
  const smtp = await getSettings();
  if (!smtp.smtp || !smtp.domain) return;

  const proto = smtp.sslstatus ? "https" : "http";
  const link = `${proto}://${smtp.domain}/#/reset=${key}`;

  const subject = "PrismX: user password reset";
  const content = `You have requested to reset user password for your account in PrismX controller.

Please follow this link to create a new password for your account:
${link}

If you did not request a password change, please ignore this email.`;

  nodemailer.smtp_send(email, subject, content);
};
