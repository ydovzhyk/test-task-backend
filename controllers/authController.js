const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const { bucket } = require("../firebaseConfig");

const { User } = require("../models/user");
const { Session } = require("../models/session");
const { SECRET_KEY, REFRESH_SECRET_KEY } = process.env;
const { v4: uuidv4 } = require("uuid");

const { RequestError, sendMail } = require("../helpers");

const register = async (req, res, next) => {
  try {
    const { username, email, password, userAvatar, sex } = req.body;
    const user = await User.findOne({ email });
    if (user) {
      throw RequestError(409, "Email in use");
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      username,
      email,
      passwordHash,
      userAvatar,
      sex
    });

    const paylaod = { id: newUser._id };
    const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "12h" });
    const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
      expiresIn: "24h",
    });

    const newSession = await Session.create({
      uid: newUser._id,
    });

    res.status(201).send({
      username: newUser.username,
      email: newUser.email,
      userAvatar: newUser.userAvatar,
      id: newUser._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      sid: newSession._id,
    });
  } catch (error) {
    next(error);
  }
};

const registerIncognito = async (req, res, next) => {
  try {
    const { username, accessCode, password, userAvatar } = req.body

    const passwordHash = await bcrypt.hash(password, 10)
    const newUser = await User.create({
      username,
      accessCode,
      passwordHash,
      userAvatar,
      email: `${accessCode}@gmail.com`,
    })

    const paylaod = { id: newUser._id }
    const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: '12h' })
    const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
      expiresIn: '24h',
    })

    const newSession = await Session.create({
      uid: newUser._id,
    })

    res.status(201).send({
      username: newUser.username,
      accessCode: newUser.accessCode,
      email: newUser.email,
      userAvatar: newUser.userAvatar,
      id: newUser._id,
      accessToken: accessToken,
      refreshToken: refreshToken,
      sid: newSession._id,
    })
  } catch (error) {
    next(error)
  }
}

const checkAccessCode = async (req, res, next) => {
  try {
    const { accessCode } = req.body
    const existingUser = await User.findOne({ accessCode })
    if (existingUser) {
      return res.status(409).json({
        uniqueAccessCode: false,
        message: 'This access code already exists.',
      })
    }

    return res.status(200).json({
      uniqueAccessCode: true,
    })
  } catch (error) {
    next(error)
  }
}

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      throw RequestError(400, "Invalid email or password");
    }
    const passwordCompare = await bcrypt.compare(password, user.passwordHash);
    if (!passwordCompare) {
      throw RequestError(400, "Invalid email or password");
    }
    const paylaod = { id: user._id };

    const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "12h" });
    const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
      expiresIn: "24h",
    });

    const newSession = await Session.create({
      uid: user._id,
    });

    return res.status(200).send({
      accessToken,
      refreshToken,
      sid: newSession._id,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const loginIncognito = async (req, res, next) => {
  try {
    const { accessCode, password } = req.body

    const user = await User.findOne({ accessCode })
    if (!user) {
      throw RequestError(400, 'Invalid Access Code')
    }
    const passwordCompare = await bcrypt.compare(password, user.passwordHash)
    if (!passwordCompare) {
      throw RequestError(400, 'Invalid Access Code')
    }
    const paylaod = { id: user._id }

    const accessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: '12h' })
    const refreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
      expiresIn: '24h',
    })

    const newSession = await Session.create({
      uid: user._id,
    })

    return res.status(200).send({
      accessToken,
      refreshToken,
      sid: newSession._id,
      user,
    })
  } catch (error) {
    next(error)
  }
}

const refresh = async (req, res, next) => {
  try {
    const user = req.user;
    await Session.deleteMany({ uid: req.user._id });
    const paylaod = { id: user._id };
    const newSession = await Session.create({ uid: user._id });
    const newAccessToken = jwt.sign(paylaod, SECRET_KEY, { expiresIn: "12h" });
    const newRefreshToken = jwt.sign(paylaod, REFRESH_SECRET_KEY, {
      expiresIn: "24h",
    });

    return res
      .status(200)
      .send({ newAccessToken, newRefreshToken, sid: newSession._id });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    const user = req.user;
    await Session.deleteMany({ uid: user._id });
    return res.status(204).json({ message: "logout success" });
  } catch (error) {
    return next(RequestError(404, "Session Not found"));
  }
};

const deleteUserController = async (req, res, next) => {
  try {
    const { userId } = req.params;
    await User.findOneAndDelete({ _id: userId });
    const currentSession = req.session;
    await Session.deleteOne({ _id: currentSession._id });

    res.status(200).json({ message: "user deleted" });
  } catch (error) {
    next(error);
  }
};

const getUserController = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const { accessToken, refreshToken, sid } = req.body;
    const user = await User.findOneAndUpdate(
      { _id },
      { lastVisit: new Date() },
      { new: true }
    );
    return res.status(200).send({
      accessToken,
      refreshToken,
      sid,
      user,
    });
  } catch (error) {
    next(error);
  }
};

const editUserController = async (req, res, next) => {
  try {
    const { _id } = req.user;
    const {
      username,
      surname,
      aboutUser,
      country,
      city,
      address,
      sex,
      phone,
      userAvatar,
      email,
    } = req.body;

    const updatedUserData = {
      aboutUser: aboutUser || req.user.aboutUser || "",
      username: username || req.user.username || "",
      surname: surname || req.user.surname || "",
      country: country || req.user.country || "",
      city: city || req.user.city || "",
      address: address || req.user.address || "",
      sex: sex || req.user.sex || "",
      phone: phone || req.user.phone || "",
      userAvatar: userAvatar || req.user.userAvatar || "",
      email: email || req.user.email || "",
    };

    const user = await User.findOneAndUpdate({ _id }, updatedUserData, {
      new: true,
      runValidators: true,
    });

    return res.status(201).send({ user });
  } catch (error) {
    next(error);
  }
};

const googleAuthController = async (req, res, next) => {
  try {
    const { _id: id } = req.user;
    const payload = { id };

    const origin = req.session.origin;

    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: "12h" });
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: "24h",
    });
    const newSession = await Session.create({
      uid: id,
    });

    res.redirect(
      `${origin}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
    );
  } catch (error) {
    next(error);
  }
};

const googlePsychAuthController = async (req, res, next) => {
  try {
    const { _id: id } = req.user
    const payload = { id }

    const origin = req.session.origin
    const roleFromSession = req.session.role

    if (roleFromSession && req.user.role !== roleFromSession) {
      await User.findByIdAndUpdate(id, { role: roleFromSession })
    }

    const accessToken = jwt.sign(payload, SECRET_KEY, { expiresIn: '12h' })
    const refreshToken = jwt.sign(payload, REFRESH_SECRET_KEY, {
      expiresIn: '24h',
    })
    const newSession = await Session.create({
      uid: id,
    })

    res.redirect(
      `${origin}?accessToken=${accessToken}&refreshToken=${refreshToken}&sid=${newSession._id}`
    )
  } catch (error) {
    next(error)
  }
}

const verificationController = async (req, res, next) => {
  try {
    const { _id: userId } = req.user;
    const { email, location } = req.body;
    const file = req.file;
    const referer = req.headers.referer || req.headers.origin || location;
    const serverUrl = `${req.protocol}://${req.get("host")}`;
    const verificationToken = uuidv4();

    let message;
    try {
      message = JSON.parse(req.body.message);
    } catch (error) {
      console.error("Error parsing message:", error); // eslint-disable-line
      return res.status(400).json({ error: "Invalid message format" });
    }

    const saveLogoToFirebase = async (logoFile) => {
      try {
        if (!logoFile) {
          throw new Error("No file provided");
        }
        const logoStorageFile = bucket.file(
          `logo/images/${Date.now()}_${logoFile.originalname}`
        );
        await logoStorageFile.save(fs.readFileSync(logoFile.path));

        const [logoUrl] = await logoStorageFile.getSignedUrl({
          action: "read",
          expires: "03-01-2500",
        });

        return logoUrl;
      } catch (error) {
        console.error("Error saving logo to Firebase:", error); // eslint-disable-line
        throw new Error("Failed to save logo");
      }
    };

    const logo = await saveLogoToFirebase(file);

    const updatedUser = await User.findOneAndUpdate(
      { _id: userId },
      { verificationToken, email },
      { new: true, runValidators: true }
    );

    const result = await sendMail(
      email,
      serverUrl,
      verificationToken,
      referer,
      message,
      logo,
    );

    fs.unlink(file.path, (err) => {
      if (err) {
        console.error(`Error deleting file ${file.path}:`, err); // eslint-disable-line
      }
    });

    if (result) {
      req.session = null;
      res.status(201).send({
        user: updatedUser,
        message: "Go to your inbox to confirm your email",
      });
    } else {
      res.status(400).send({
        message: "The email could not be sent, please try again later",
      });
    }
  } catch (error) {
    next(error);
  }
};

const verifyController = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const { url } = req.query;
    const user = await User.findOne({ verificationToken });

    if (!user) {
      res.redirect(`${url}?message=The user is already verified.`);
    }

    await User.findByIdAndUpdate(user._id, {
      verified: true,
      verificationToken: '',
    });

    res.redirect(`${url}?message=Verification successful`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  registerIncognito,
  login,
  loginIncognito,
  logout,
  deleteUserController,
  refresh,
  getUserController,
  editUserController,
  googleAuthController,
  googlePsychAuthController,
  verificationController,
  verifyController,
  checkAccessCode,
}
