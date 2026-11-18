import session from "express-session";
import pgStoreFactory from "connect-pg-simple";
import { pool } from "../configs/db.js";
import { env } from "../configs/env.js";

const PgSession = pgStoreFactory(session);

export const SESSION_COOKIE_NAME = "session";
export const SESSION_COOKIE_OPTIONS = {
  secure: env.NODE_ENV === "production",
  httpOnly: true,
  sameSite: "lax",
  maxAge: env.SESSION_EXPIRES_IN
};

export const sessionSetupMiddleware = session({
  store: new PgSession({
    pool: pool,
    tableName: "session",
    createTableIfMissing: false
  }),
  secret: env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: SESSION_COOKIE_NAME,
  cookie: SESSION_COOKIE_OPTIONS
});



