const bcrypt = require("bcrypt");

const verifyPassword = async (hashedPass, pass) => {
  const isMatching = await bcrypt.compare(pass, hashedPass);

  return isMatching;
};

module.exports.verifyPassword = verifyPassword;
