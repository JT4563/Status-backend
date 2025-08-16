const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { signAccessToken } = require("../utils/jwt");

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    const user = await User.findOne({ email });
    if (!user)
      return res
        .status(401)
        .json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok)
      return res
        .status(401)
        .json({
          error: {
            code: "INVALID_CREDENTIALS",
            message: "Invalid email or password",
          },
        });
    const token = signAccessToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, role: user.role },
    });
  } catch (e) {
    next(e);
  }
}

module.exports = { login };
