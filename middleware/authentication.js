// valitating the loggedIn token with the token which is in database..

// Show the jobs content, only if it is authenticated by using this middleware

// Also we need to show the dashboard with that particular user info only..

const User = require("../models/User");
const jwt = require("jsonwebtoken");
const { UnauthenticatedError } = require("../errors");

const auth = async (req, res, next) => {
  // Checking the token in authHeaders
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    throw new UnauthenticatedError("Authentication invalid - Token header is in wrong format..");
  }
  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Redirecting (or) Attaching the user to the job route..
    //Instead of storing it as a object, we use our ("User model to get data!")
    // const user = User.findById(payload.id).select("-password");
    // req.user = user;

    req.user = { userId: payload.userId, name: payload.name };
    
    next();
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid - verification denied!");
  }
};

module.exports = auth;
