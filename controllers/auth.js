// importing the models
const User = require("../models/User");

// Getting the status code
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, UnauthenticatedError } = require("../errors");

const register = async (req, res) => {
  // const { name, email, password } = req.body;

  // Encrypting the password! salt - combination
  // const salt = await bcrypt.genSalt(10);
  // const hashedPassword = await bcrypt.hash(password, salt)

  // creating the temporaryUser
  // const tempUser = { name, email, password: hashedPassword }

  // we are doing all the validation in mongoose itself.
  const user = await User.create({ ...req.body });

  // Generating the token - jwt.sign(payload, secretOrPrivateKey, [options, callback])
  // const token = jwt.sign({ userId: user._id, name: user.name }, "jwtSecret", {
  //   expiresIn: "30d",
  // });

  // Generating the token - We're using instances middleware.
  const token = user.createJWT();

  res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  // To find, weather the login credentials are already in the database
  const user = await User.findOne({ email })
  if (!user) {
    throw new UnauthenticatedError('Invalid Credentials - Email')
  }

  // Comparing the password which is used to logged in with the password in the database(Using Bcrypt JS) - We're using instances middleware
  const isPasswordCorrect = await user.comparePassword(password)
  console.log(isPasswordCorrect);

  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid Credentials - Password");
  } else {
    // Creating the token, with the loggedIn credentials. - these are always stored in authHeaders
    const token = user.createJWT()
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token })
  }

};

module.exports = {
  register,
  login,
};
