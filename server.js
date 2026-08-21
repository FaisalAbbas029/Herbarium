import express from "express";
import path from "path";
import fs from "fs";
import multer from "multer";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import cors from "cors";
import { db } from "./server/db.js";
import {
  authManager,
  optionalAuthMiddleware,
  requireAuthMiddleware,
  requireSuperAdminMiddleware
} from "./server/auth.js";

// Load any secrets (e.g. GEMINI_API_KEY) from a local .env file, if present.
dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";
const isProd = process.env.NODE_ENV === "production";
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://herbariumgb.netlify.app"
];
app.set("trust proxy", true);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
      return;
    }
    callback(new Error("Origin not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

// Parse incoming JSON and form bodies. 20mb limit so a specimen record
// with several base64-encoded fields still fits comfortably.
app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// ==========================================
// SPECIMEN PHOTO STORAGE — where files live and how the "specimen path"
// (storageUrl) is generated and served back to the browser.
// ==========================================
//
// All uploaded specimen photographs are written to this local /uploads
// folder on disk. This is a simple, working setup for development/demo
// use. For a real production deployment, swap this out for a hosted
// object-storage service (Amazon S3, Google Cloud Storage, Cloudinary,
// etc.) — you only need to change the `storage` and `upload` config below;
// nothing in the React frontend needs to change, because it only ever
// deals with the final storageUrl string.
const UPLOADS_DIR = process.env.UPLOADS_DIR ? path.resolve(process.env.UPLOADS_DIR) : path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Serve everything inside /uploads as static files, so a saved photo at
// UPLOADS_DIR/specimen-xyz.jpg becomes reachable in the browser at the URL
// "/uploads/specimen-xyz.jpg". That URL is exactly what gets stored as a
// photo's "storageUrl" (the specimen path) on the specimen record.
app.use("/uploads", express.static(UPLOADS_DIR));

// Multer handles the actual multipart file upload. Each file is renamed to
// something unique ("specimen-<timestamp>-<random hex><extension>") so two
// different admins can never accidentally overwrite each other's photo.
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}`;
    cb(null, `specimen-${uniqueSuffix}${ext}`);
  }
});

// File-type and size validation happens here on the server (never trust
// only the browser). Only real image formats are accepted, and files over
// 15MB are rejected before they ever touch disk.
const allowedImageMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/tiff",
  "image/tif",
  "image/svg+xml"
]);
const allowedImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".tif", ".tiff", ".svg"]);
const imageMimeByExtension = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".bmp": "image/bmp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".svg": "image/svg+xml"
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 },
  // 15MB limit
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = file.mimetype.toLowerCase();
    if (allowedImageExtensions.has(ext) && (!mime || mime === "application/octet-stream" || allowedImageMimeTypes.has(mime))) {
      cb(null, true);
    } else {
      cb(new Error("Supported image formats are JPG, PNG, WebP, GIF, BMP, TIFF, and safe SVG files."));
    }
  }
});

const hasImageSignature = (buffer, mimetype) => {
  if (!buffer || buffer.length < 4) return false;
  if (mimetype === "image/jpeg") return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mimetype === "image/png") return buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
  if (mimetype === "image/gif") return ["GIF87a", "GIF89a"].includes(buffer.subarray(0, 6).toString("ascii"));
  if (mimetype === "image/bmp") return buffer.subarray(0, 2).toString("ascii") === "BM";
  if (mimetype === "image/webp") return buffer.subarray(0, 4).toString("ascii") === "RIFF" && buffer.subarray(8, 12).toString("ascii") === "WEBP";
  if (mimetype === "image/tiff" || mimetype === "image/tif") return (buffer[0] === 0x49 && buffer[1] === 0x49 && buffer[2] === 0x2a && buffer[3] === 0x00) || (buffer[0] === 0x4d && buffer[1] === 0x4d && buffer[2] === 0x00 && buffer[3] === 0x2a);
  if (mimetype === "image/svg+xml") {
    const markup = buffer.toString("utf8", 0, Math.min(buffer.length, 5120));
    return /<svg(?:\s|>)/i.test(markup) && !/<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(markup);
  }
  return false;
};

// Every request under /api first passes through "optional" auth: if a
// valid Bearer token is present we attach req.user, but requests without
// one are still allowed through (needed for public specimen browsing).
// Routes that actually require a logged-in admin use requireAuthMiddleware
// or requireSuperAdminMiddleware instead (see server/auth.js).
app.use("/api", optionalAuthMiddleware);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ==========================================
// 1. AUTH & TEAM ENDPOINTS
// ==========================================
//
// LOGIN: checks the email/password against the stored bcrypt hash, then
// creates a session token (see server/auth.js -> authManager.createSession).
// That token is what the frontend stores in localStorage and sends back
// as "Authorization: Bearer <token>" on every future request.
app.post("/api/auth/login", (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }
    const userWithPass = db.findUserByEmail(email);
    if (!userWithPass) {
      return res.status(401).json({ error: "Invalid botanical credentials provided." });
    }
    if (userWithPass.status !== "active") {
      return res.status(403).json({ error: "Your account has been deactivated. Please contact the lead curator." });
    }
    const isMatch = bcrypt.compareSync(password, userWithPass.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid botanical credentials provided." });
    }
    db.recordUserLogin(userWithPass.id);
    const token = authManager.createSession(userWithPass.id);
    const { passwordHash: _, ...safeUser } = userWithPass;
    return res.json({ token, user: safeUser });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Authentication service encountered an error." });
  }
});
app.get("/api/auth/me", requireAuthMiddleware, (req, res) => {
  return res.json({ user: req.user });
});
app.post("/api/auth/logout", requireAuthMiddleware, (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7).trim();
    authManager.deleteSession(token);
  }
  return res.json({ success: true, message: "Logged out successfully." });
});
app.get("/api/team", requireAuthMiddleware, (req, res) => {
  try {
    const users = db.getAllUsers();
    const invitations = db.getInvitations();
    return res.json({ users, invitations });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// ADMIN INVITE — creates a pending invitation record with a random token
// (see db.createInvitation). Only a superadmin can invite new colleagues.
// The generated "inviteLink" is what would be emailed to the invitee in
// production; for now it is returned directly to the admin so it can be
// shared manually. See the EMAIL SENDING note further down for how to wire
// up a real email provider.
app.post("/api/team/invite", requireSuperAdminMiddleware, (req, res) => {
  try {
    const { email, name, role } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: "Colleague email and name are required." });
    }
    const existingUser = db.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "An administrator account already exists with this email address." });
    }
    const validRole = role === "superadmin" ? "superadmin" : "curator";
    const invitation = db.createInvitation(email, name, validRole, req.user);
    db.logActivity({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: "CREATE",
      specimenId: null,
      specimenAccession: null,
      specimenScientificName: null,
      fieldChanged: "team_invitation",
      previousValue: null,
      newValue: email,
      notes: `Issued admin invitation to ${name} (${email}) as ${validRole}`
    });
    return res.status(201).json({
      invitation,
      inviteLink: `/admin/accept-invitation?token=${invitation.token}`,
      message: `Invitation generated successfully for ${email}.`
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/team/invitation/:token", (req, res) => {
  const { token } = req.params;
  const invitation = db.findInvitationByToken(token);
  if (!invitation) {
    return res.status(404).json({ error: "Invalid or expired invitation token." });
  }
  return res.json({ invitation });
});
app.post("/api/team/accept-invitation", (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password || password.length < 8) {
      return res.status(400).json({ error: "Valid token and password of at least 8 characters required." });
    }
    const user = db.acceptInvitation(token, password);
    if (!user) {
      return res.status(400).json({ error: "Could not process invitation. It may have expired or been revoked." });
    }
    const sessionToken = authManager.createSession(user.id);
    db.recordUserLogin(user.id);
    return res.json({
      token: sessionToken,
      user,
      message: "Account successfully configured and activated."
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/team/toggle-status", requireSuperAdminMiddleware, (req, res) => {
  try {
    const { userId, status } = req.body;
    if (!userId || !["active", "inactive"].includes(status)) {
      return res.status(400).json({ error: "Invalid parameters." });
    }
    if (userId === req.user.id) {
      return res.status(400).json({ error: "You cannot deactivate your own administrative account." });
    }
    const updated = db.updateUserStatus(userId, status);
    if (!updated) {
      return res.status(404).json({ error: "User not found." });
    }
    db.logActivity({
      userId: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      action: "UPDATE",
      specimenId: null,
      specimenAccession: null,
      specimenScientificName: null,
      fieldChanged: "user_status",
      previousValue: null,
      newValue: status,
      notes: `${status === "active" ? "Reactivated" : "Deactivated"} account for ${updated.name} (${updated.email})`
    });
    return res.json({ user: updated, message: `Account status updated to ${status}.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.delete("/api/team/invitations/:id", requireSuperAdminMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    db.revokeInvitation(id);
    return res.json({ success: true, message: "Invitation revoked." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// ==========================================
// 2. SPECIMEN PHOTO UPLOAD & MANAGEMENT
// ==========================================
//
// Step 1 of the upload workflow: receive the raw file, save it to
// /uploads (see the `upload` Multer config near the top of this file for
// the file-type/size validation), and hand back its public URL. The
// frontend calls this first, then in a second request (POST
// /api/specimens/:id/photos below) attaches that URL to a specimen.
app.post("/api/photos/upload", requireAuthMiddleware, (req, res) => {
  upload.single("photo")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message || "Unable to upload this image." });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No image file provided." });
    }
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const extension = path.extname(req.file.originalname).toLowerCase();
      const uploadedMimeType = req.file.mimetype.toLowerCase();
      const detectedMimeType = allowedImageMimeTypes.has(uploadedMimeType) ? uploadedMimeType : imageMimeByExtension[extension];
      if (!hasImageSignature(fileBuffer, detectedMimeType)) {
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ error: "The selected file is not a valid supported image." });
      }
    } catch (validationError) {
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: "Unable to validate the uploaded image." });
    }
    const storageUrl = `/uploads/${req.file.filename}`;
    return res.json({
      url: storageUrl,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  });
});
// Step 2 of the upload workflow: link an uploaded photo's storageUrl to a
// specimen record. See server/db.js -> addPhotoToSpecimen for how this is
// persisted.
app.post("/api/specimens/:id/photos", requireAuthMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { storageUrl, altText, caption, isPrimary } = req.body;
    if (!storageUrl) {
      return res.status(400).json({ error: "Storage URL is required for the specimen photo." });
    }
    const updated = db.addPhotoToSpecimen(
      id,
      {
        storageUrl,
        altText: altText || "Specimen photograph",
        caption: caption || "",
        displayOrder: 0,
        isPrimary: !!isPrimary,
        uploadTimestamp: (/* @__PURE__ */ new Date()).toISOString()
      },
      req.user
    );
    if (!updated) {
      return res.status(404).json({ error: "Specimen not found." });
    }
    return res.json({ specimen: updated, message: "Photo added successfully." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
app.put("/api/specimens/:id/photos/:photoId", requireAuthMiddleware, (req, res) => {
  try {
    const { id, photoId } = req.params;
    const updates = req.body;
    const updated = db.updatePhoto(id, photoId, updates, req.user);
    if (!updated) {
      return res.status(404).json({ error: "Specimen or photo not found." });
    }
    return res.json({ specimen: updated, message: "Photo updated successfully." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
app.delete("/api/specimens/:id/photos/:photoId", requireAuthMiddleware, (req, res) => {
  try {
    const { id, photoId } = req.params;
    const updated = db.deletePhoto(id, photoId, req.user);
    if (!updated) {
      return res.status(404).json({ error: "Specimen or photo not found." });
    }
    return res.json({ specimen: updated, message: "Photo removed." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
app.post("/api/specimens/:id/photos/reorder", requireAuthMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { orderedPhotoIds } = req.body;
    if (!Array.isArray(orderedPhotoIds)) {
      return res.status(400).json({ error: "orderedPhotoIds array is required." });
    }
    const updated = db.reorderPhotos(id, orderedPhotoIds, req.user);
    if (!updated) {
      return res.status(404).json({ error: "Specimen not found." });
    }
    return res.json({ specimen: updated, message: "Gallery photos reordered." });
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
});
app.get("/api/specimens/suggestions", (req, res) => {
  const query = req.query.q || "";
  const isAdmin = !!req.user;
  const suggestions = db.getAutocompleteSuggestions(query, isAdmin);
  return res.json({ suggestions });
});
app.get("/api/specimens", (req, res) => {
  try {
    const isAdmin = !!req.user;
    const params = {
      query: req.query.query,
      family: req.query.family,
      genus: req.query.genus,
      habitat: req.query.habitat,
      conservationStatus: req.query.conservationStatus,
      region: req.query.region,
      location: req.query.location,
      dateFrom: req.query.dateFrom,
      dateTo: req.query.dateTo,
      sortBy: req.query.sortBy,
      page: req.query.page ? parseInt(req.query.page, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit, 10) : 12,
      status: req.query.status,
      addedByMe: req.query.addedByMe === "true"
    };
    const results = db.searchSpecimens(params, isAdmin);
    return res.json(results);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({ error: "Failed to retrieve specimen records." });
  }
});
app.get("/api/specimens/:id", (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = !!req.user;
    const specimen = db.getSpecimenById(id, isAdmin);
    if (!specimen) {
      return res.status(404).json({ error: "Specimen record not found or is currently in draft review." });
    }
    return res.json({ specimen });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/specimens/:id/related", (req, res) => {
  try {
    const { id } = req.params;
    const isAdmin = !!req.user;
    const specimen = db.getSpecimenById(id, isAdmin);
    if (!specimen) {
      return res.status(404).json({ error: "Specimen not found." });
    }
    const related = db.getRelatedSpecimens(specimen, 4);
    return res.json({ related });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/specimens/check-accession/:acc", (req, res) => {
  const { acc } = req.params;
  const excludeId = req.query.excludeId;
  const exists = db.checkAccessionExists(acc, excludeId);
  return res.json({ exists });
});
app.post("/api/specimens", requireAuthMiddleware, (req, res) => {
  try {
    const data = req.body;
    if (!data.accessionNumber || !data.accessionNumber.trim()) {
      return res.status(400).json({ error: "Accession number is required." });
    }
    if (!data.scientificName || !data.scientificName.trim()) {
      return res.status(400).json({ error: "Scientific name is required." });
    }
    if (!data.family || !data.family.trim()) {
      return res.status(400).json({ error: "Botanical family is required." });
    }
    if (!data.genus || !data.genus.trim()) {
      return res.status(400).json({ error: "Genus is required." });
    }
    if (!data.species || !data.species.trim()) {
      return res.status(400).json({ error: "Species epithet is required." });
    }
    if (db.checkAccessionExists(data.accessionNumber)) {
      return res.status(400).json({ error: `This accession number (${data.accessionNumber}) already exists in the archive.` });
    }
    if (data.status === "PUBLISHED") {
      if (!data.photos || data.photos.length === 0) {
        return res.status(400).json({ error: "At least 1 specimen photograph is required before publishing." });
      }
    }
    if (data.photos && data.photos.length > 5) {
      return res.status(400).json({ error: "You can upload a maximum of 5 photos." });
    }
    const created = db.createSpecimen(data, req.user);
    return res.status(201).json({
      specimen: created,
      message: created.status === "PUBLISHED" ? "Specimen published successfully." : "Specimen saved as draft."
    });
  } catch (error) {
    console.error("Create specimen error:", error);
    return res.status(500).json({ error: error.message || "Something went wrong. Please try again." });
  }
});
app.put("/api/specimens/:id", requireAuthMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    if (updates.accessionNumber) {
      if (db.checkAccessionExists(updates.accessionNumber, id)) {
        return res.status(400).json({ error: `This accession number (${updates.accessionNumber}) already exists.` });
      }
    }
    if (updates.status === "PUBLISHED") {
      const existing = db.getSpecimenById(id, true);
      const photos = updates.photos !== void 0 ? updates.photos : existing?.photos;
      if (!photos || photos.length === 0) {
        return res.status(400).json({ error: "At least 1 specimen photograph is required before publishing." });
      }
    }
    if (updates.photos && updates.photos.length > 5) {
      return res.status(400).json({ error: "You can upload a maximum of 5 photos." });
    }
    const updated = db.updateSpecimen(id, updates, req.user);
    if (!updated) {
      return res.status(404).json({ error: "Specimen record not found." });
    }
    return res.json({
      specimen: updated,
      message: "Specimen updated successfully."
    });
  } catch (error) {
    console.error("Update specimen error:", error);
    return res.status(500).json({ error: error.message || "Failed to update specimen record." });
  }
});
app.delete("/api/specimens/:id", requireAuthMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteSpecimen(id, req.user);
    if (!success) {
      return res.status(404).json({ error: "Specimen not found." });
    }
    return res.json({ success: true, message: "Specimen permanently deleted." });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/specimens/bulk-status", requireAuthMiddleware, (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length || !["DRAFT", "PUBLISHED"].includes(status)) {
      return res.status(400).json({ error: "Invalid parameters." });
    }
    const count = db.bulkUpdateStatus(ids, status, req.user);
    return res.json({ count, message: `Successfully set ${count} specimen(s) to ${status}.` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.post("/api/specimens/bulk-delete", requireAuthMiddleware, (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) {
      return res.status(400).json({ error: "Invalid specimen IDs." });
    }
    const count = db.bulkDelete(ids, req.user);
    return res.json({ count, message: `Successfully deleted ${count} specimen(s).` });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/activity-logs", requireAuthMiddleware, (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const action = req.query.action;
    const specimenId = req.query.specimenId;
    const logs = db.getActivityLogs(limit, action, specimenId);
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/dashboard/stats", requireAuthMiddleware, (req, res) => {
  try {
    const stats = db.getDashboardStats();
    const taxonomy = db.getTaxonomyBreakdown();
    const recentActivity = db.getActivityLogs(10);
    return res.json({ stats, taxonomy, recentActivity });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
app.get("/api/public/stats", (req, res) => {
  try {
    const stats = db.getDashboardStats();
    const taxonomy = db.getTaxonomyBreakdown();
    return res.json({
      totalPublished: stats.publishedCount,
      totalFamilies: stats.totalFamilies,
      totalGenera: stats.totalGenera,
      totalPhotos: stats.totalPhotos,
      families: taxonomy.families.slice(0, 8),
      conservation: taxonomy.conservation
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});
// ==========================================
// 5. CONTACT & INQUIRIES ("MAIL") ENDPOINTS
// ==========================================
//
// The original project doesn't have a full inbox/mail client — instead,
// visitors submit inquiries through the public Contact page, and admins
// review them here as a simple message list (the closest equivalent to a
// "mail" feature for this kind of archive site). Messages are validated
// and saved to the database, but no outbound email is actually sent yet.
//
// EMAIL SENDING (development/demo note):
// This is currently a development/demo implementation — submitted
// inquiries are only stored in the database, not emailed anywhere. In
// production, connect this endpoint (and the admin invitation endpoint
// above) to a real email provider such as Resend, SendGrid, or Amazon SES,
// and call it here after db.createContactMessage() succeeds.
app.post("/api/contact", (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) {
      return res.status(400).json({ error: "Please provide your name, email address, and message." });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please enter a valid email address." });
    }
    const created = db.createContactMessage({
      name,
      email,
      subject: subject || "General Botanical Inquiry",
      message
    });
    return res.status(201).json({
      success: true,
      message: "Thank you for reaching out. The curatorial team will review your inquiry.",
      inquiryId: created.id
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to submit inquiry. Please try again." });
  }
});
// Admin-only view of all submitted inquiries.
app.get("/api/contact/messages", requireAuthMiddleware, (req, res) => {
  try {
    const messages = db.getContactMessages();
    return res.json({ messages });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// ==========================================
// 6. VITE MIDDLEWARE / STATIC SERVING
// ==========================================
//
// In development, Vite runs in "middleware mode" inside this same Express
// server, so one process serves both the API and the live React app with
// hot reloading. In production (NODE_ENV=production), we instead serve
// the pre-built static files from /dist (created by `npm run build`).
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, HOST, () => {
    console.log(`
  \u{1F33F} Sylva Herbarium Digital Archive & Research Platform`);
    console.log(`  \u279C  Local:   http://localhost:${PORT}/`);
    console.log(`  \u279C  Network: http://${HOST}:${PORT}/
`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
