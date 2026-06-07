// @ts-check
// Barrel for the RSA client e-commerce page objects.
module.exports = {
  ...require("./login.page"),
  ...require("./dashboard.page"),
  ...require("./cart.page"),
  ...require("./payment.page"),
  ...require("./orders.page"),
};
