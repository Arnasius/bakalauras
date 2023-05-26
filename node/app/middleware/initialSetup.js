const controller = require("../controllers/initial.controller");

exports.isInitialState = async (req, res, next) => {
  const initState = await controller.initial();
  if (!initState) next();
  else {
    res.status(200).send({
      message: "initial",
      initial: initState,
    });
    return;
  }
};
