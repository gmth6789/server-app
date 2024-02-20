const User = require("../Models/Users");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { token } = require("morgan");

const { notifyLine, getIPClient } = require("../Functions/Notify");

const tokenLine = "nVLUFLWv3rQAi89uqRSZooGUSBP5vC9gk7lM40bkWuC";

exports.register = async (req, res) => {
  try {
    //code
    // 1.CheckUser
    const { name, password } = req.body;
    var user = await User.findOne({ name });
    if (user) {
      return res.send("User Already Exists!!!").status(400);
    }
    // 2.Encrypt
    const salt = await bcrypt.genSalt(10);
    user = new User({
      name,
      password,
    });
    user.password = await bcrypt.hash(password, salt);
    // 3.Save
    await user.save();
    res.send("Register Success!!");
  } catch (err) {
    //code
    console.log(err);
    res.status(500).send("Server Error");
  }
};
exports.login = async (req, res) => {
  try {
    //code
    // 1. Check User
    const ip = await getIPClient(req);
    // console.log(ip);

    const { name, password } = req.body;
    var user = await User.findOneAndUpdate({ name }, { ip: ip }, { new: true });
    console.log(user);
    if (user) {
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).send("Password Invalid!!!");
      }
      // 2. Payload
      var payload = {
        user: {
          name: user.name,
          role: user.role,
        },
      };
      // notify
      const text = "User " + user.name + " Login ที่  Ipaddress :" + ip;
      await notifyLine(tokenLine, text);

      // 3. Generate
      jwt.sign(payload, "jwtsecret", { expiresIn: "1d" }, (err, token) => {
        if (err) throw err;
        res.json({ token, payload });
      });
    } else {
      const text = "User " + name + " พยายาม Login ที่ Ipaddress :" + ip;
      await notifyLine(tokenLine, text);
      return res.status(400).send("User not found!!!");
    }
  } catch (err) {
    //code
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.loginLine = async (req, res) => {
  try {
    //code
    const { userId, displayName, pictureUrl } = req.body;
    var data = {
      name: userId,
      displayName: displayName,
      picture: pictureUrl,
    };
    // 1 Check
    var user = await User.findOneAndUpdate({ name: userId }, { new: true });
    if (user) {
      console.log("User Updated!!!");
    } else {
      user = new User(data);
      await user.save();
    }
    // 2. Payload
    var payload = {
      user,
    };
    // console.log(payload)
    // 3. Generate
    jwt.sign(payload, "jwtsecret", { expiresIn: "1d" }, (err, token) => {
      if (err) throw err;
      res.json({ token, payload });
    });
  } catch (err) {
    //code
    console.log(err);
    res.status(500).send("Server Error");
  }
};

exports.currentUser = async (req, res) => {
  try {
    //code
    console.log("currentUser", req.user);
    const user = await User.findOne({ name: req.user.name })
      .select("-password")
      .exec();

    res.send(user);
  } catch (err) {
    console.log(err);
    res.status(500).send("Server Error");
  }
};
