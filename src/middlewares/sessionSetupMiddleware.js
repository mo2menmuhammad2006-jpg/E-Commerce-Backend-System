import session from "express-session";


export const SESSION_COOKIE_NAME = "session";
export const SESSION_COOKIE_OPTIONS = {
  secure: process.env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
  maxAge: Number(process.env.SESSION_EXPIRES_IN) || 604800000                 
};

export const sessionSetupMiddleware = session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: SESSION_COOKIE_NAME,
  cookie: SESSION_COOKIE_OPTIONS
});


