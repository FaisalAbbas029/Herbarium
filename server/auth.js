// ==========================================
// AUTHENTICATION
// ==========================================
//
// This app uses simple token-based sessions instead of cookies or JWTs:
// 1. On login, createSession() generates a random token and stores it in
//    an in-memory Map alongside the user's id and an expiry time.
// 2. That token is sent back to the browser, which stores it in
//    localStorage and includes it as "Authorization: Bearer <token>" on
//    every API request from then on (see src/services/api.js).
// 3. The middlewares below read that header on incoming requests and look
//    the token up in the sessions Map to figure out who's making the
//    request (or reject the request if there's no valid session).
//
// Because sessions live in memory, they are cleared if the server
// restarts — that's fine for development/demo use. In production you
// would likely store sessions in a database or use signed JWTs instead so
// sessions survive server restarts and work across multiple server
// instances.
import crypto from "crypto";
import { db } from "./db.js";
class AuthManager {
  sessions = /* @__PURE__ */ new Map();
  constructor() {
    // Clean up expired sessions once an hour so the sessions Map doesn't
    // grow forever.
    setInterval(() => {
      const now = Date.now();
      for (const [token, session] of this.sessions.entries()) {
        if (session.expiresAt < now) {
          this.sessions.delete(token);
        }
      }
    }, 60 * 60 * 1e3);
  }
  createSession(userId) {
    const token = crypto.randomBytes(32).toString("hex");
    const now = Date.now();
    this.sessions.set(token, {
      token,
      userId,
      createdAt: now,
      expiresAt: now + 30 * 24 * 60 * 60 * 1e3
      // 30 days
    });
    return token;
  }
  getSession(token) {
    if (!token) return null;
    const session = this.sessions.get(token);
    if (!session) return null;
    if (session.expiresAt < Date.now()) {
      this.sessions.delete(token);
      return null;
    }
    return session;
  }
  deleteSession(token) {
    this.sessions.delete(token);
  }
  revokeUserSessions(userId) {
    for (const [token, session] of this.sessions.entries()) {
      if (session.userId === userId) {
        this.sessions.delete(token);
      }
    }
  }
  getUserFromToken(token) {
    const session = this.getSession(token);
    if (!session) return null;
    const userWithPass = db.findUserById(session.userId);
    if (!userWithPass || userWithPass.status !== "active") return null;
    const { passwordHash, ...safeUser } = userWithPass;
    return safeUser;
  }
}
const authManager = new AuthManager();
function optionalAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    const user = authManager.getUserFromToken(token);
    if (user) {
      req.user = user;
    }
  }
  next();
}
function requireAuthMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Please sign in." });
  }
  const token = authHeader.substring(7).trim();
  const user = authManager.getUserFromToken(token);
  if (!user) {
    return res.status(401).json({ error: "Invalid or expired session. Please log in again." });
  }
  if (user.status !== "active") {
    return res.status(403).json({ error: "Your account has been deactivated by an administrator." });
  }
  req.user = user;
  next();
}
function requireSuperAdminMiddleware(req, res, next) {
  requireAuthMiddleware(req, res, () => {
    if (req.user?.role !== "superadmin") {
      return res.status(403).json({ error: "Superadmin privileges required for this action." });
    }
    next();
  });
}
export {
  authManager,
  optionalAuthMiddleware,
  requireAuthMiddleware,
  requireSuperAdminMiddleware
};
