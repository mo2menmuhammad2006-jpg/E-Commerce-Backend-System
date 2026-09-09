import session from "express-session";
import pgStoreFactory from "connect-pg-simple";
import pg from "pg";

const PgSession = pgStoreFactory(session);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export const closeSessionPool = () => pool.end();

export const sessionSetupMiddleware = session({
  store: new PgSession({
    pool: pool,
    tableName: "user_sessions",        
    createTableIfMissing: true,        
  }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: "session",
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    maxAge: Number(process.env.SESSION_EXPIRES_IN) || 604800000,
  },
});


