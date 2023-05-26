const db = require("../db");
const config = require("../config/path.config");
const certs = require("../ssh/generate_certs");
const util = require("util");
const multer = require("multer");
const { cacheInstance } = require("../services/node-cache");
const { getSettings, setSettings } = require("../smtp/smtpSettings");
const sha256File = require("sha256-file");
const fs = require("fs");
var ssl_state;

const {
  validateData,
  formSingleUpdateQuery,
  copyDeep,
} = require("../services/utils");

exports.getServerInfo = (req, res) => {
  const smtp_query = `SELECT serverid, version, sslstatus, sslversion, domain,
    smtp, smtp_user, smtp_pass, smtp_host, smtp_port, smtp_email
    FROM serverInfo
    `;
  db.query(smtp_query)
    .then((result) => {
      ssl_state = result.rows[0].sslversion;
      res.status(200).send({ data: result.rows[0] });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.updateServerInfo = (req, res) => {
  const validKeyNames = [
    "serverid",
    "version",
    "sslstatus",
    "sslversion",
    "domain",
    "smtp",
    "smtp_user",
    "smtp_pass",
    "smtp_host",
    "smtp_port",
    "smtp_email",
  ];

  let data = copyDeep(req.body);
  data = data.sslstatus ? data : { ...data, sslversion: null };

  if (!validateData(data, validKeyNames) || config.serverId !== data.serverid) {
    res.status(400).send({ message: "Data was rejected. Please try again." });
    return;
  }

  const query = formSingleUpdateQuery(data, "serverInfo", "serverid");

  // update database
  db.query(query[0], query[1])
    .then(() => {
      cacheInstance().del("serverSettings");
      if (data.sslversion !== ssl_state) {
        // SSL state changed, reload certs on Save.
        ssl_state = data.sslversion;
        certs.generate_cert(data.sslversion, data.domain);
      }
      setSettings();
      res.status(200).send({ message: "Update successful!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

async function uploader(req, res) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "/etc/nginx-certs");
    },
    filename: (req, file, cb) => {
      cb(null, file.originalname);
    },
  });

  const uploadFile = multer({
    storage: storage,
  }).single("file");

  const uploadFileWithPromise = util.promisify(uploadFile);

  uploadFileWithPromise(req, res);
}

exports.upload = async (req, res) => {
  try {
    await uploader(req, res);

    res.status(200).send({
      message: "Uploaded the file successfully",
    });
  } catch (err) {
    res.status(500).send({
      message: `Could not upload the file: ${err}`,
    });
  }
};

exports.uploadFirmware = async (req, res) => {
  const { name, model } = req.body;
  const { filename } = req.file;
  const chasum = sha256File(req.file.path);

  if (!name || !model || !filename) {
    res.status(500).send({ message: "File data is missing" });
    return;
  }

  db.query(
    `
        INSERT INTO firmwares (filename, name, board, checksum, createddate)
        VALUES ($1, $2, $3, $4, now()) RETURNING firmwareid
      `,
    [filename, name, model, chasum]
  )
    .then(() => {
      res.status(200).send({ message: "Firmware uploaded successfully!" });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.checkSmtp = async (req, res) => {
  try {
    const result = await getSettings();

    res.status(200).send({ enabled: result.smtp });
  } catch (err) {
    res.status(500).send({ errorMessage: err.message });
  }
};

exports.getFirmwares = (req, res) => {
  const firmwares = `SELECT firmwareid, filename, name, checksum, createddate, board FROM firmwares`;
  db.query(firmwares)
    .then((result) => {
      res.status(200).send({ data: result.rows });
    })
    .catch((err) => {
      res.status(500).send({ message: err.message });
    });
};

exports.deleteFirmware = (req, res) => {
  const { id, filename } = req.params;
  const path = config.firmwares;

  fs.unlink(path.concat("/", filename), (err) => {
    if (err) {
      res.status(500).send({ message: err });
      return;
    }

    db.query(`DELETE FROM firmwares WHERE firmwareid=$1`, [id])
      .then(() => {
        res.status(200).send({ message: "Firmware deleted successfully!" });
      })
      .catch((err) => {
        res.status(500).send({ message: err.message });
      });
  });
};
