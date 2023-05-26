const nodemailer = require("nodemailer");
const { getSettings } = require("./smtpSettings");

function configure_transporter(data) {
  const transporter = nodemailer.createTransport({
    //service: "Gmail",
    auth: {
      user: data.smtp_user,
      pass: data.smtp_pass,
    },
    host: data.smtp_host,
    port: data.smtp_port,
  });
  return transporter;
}

module.exports.smtp_send = async (email, subject, content) => {
  const data = await getSettings();

  if (data.smtp == false) {
    console.warn("SMTP is not enabled");
    return;
  }

  const transporter = configure_transporter(data);

  transporter
    .sendMail({
      from: `PrismX Controller <${data.smtp_email}>`,
      to: email,
      subject: subject,
      text: content,
    })
    .catch((err) => console.error(err));
};

// Verify SMTP connection
module.exports.smtp_verify = async () => {
  const data = await getSettings();
  const transporter = configure_transporter(data);
  transporter.verify(function (error) {
    if (error) {
      console.error(error);
    }
  });
};
