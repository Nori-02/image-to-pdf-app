import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  boolean,
  decimal,
  json,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Projects table - stores PDF conversion projects
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["draft", "completed", "archived"]).default("draft").notNull(),
  pageSize: varchar("pageSize", { length: 50 }).default("A4").notNull(),
  orientation: mysqlEnum("orientation", ["portrait", "landscape"]).default("portrait").notNull(),
  imageQuality: mysqlEnum("imageQuality", ["low", "medium", "high"]).default("high").notNull(),
  watermark: text("watermark"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Images table - stores individual images in a project
 */
export const images = mysqlTable("images", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  originalUrl: varchar("originalUrl", { length: 512 }).notNull(),
  editedUrl: varchar("editedUrl", { length: 512 }),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  mimeType: varchar("mimeType", { length: 50 }).notNull(),
  fileSizeBytes: int("fileSizeBytes").notNull(),
  width: int("width"),
  height: int("height"),
  rotation: int("rotation").default(0).notNull(),
  cropData: json("cropData"),
  brightness: int("brightness").default(100).notNull(),
  contrast: int("contrast").default(100).notNull(),
  filters: json("filters"),
  pageNumber: int("pageNumber").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * TextAnnotations table - stores text added to PDF pages
 */
export const textAnnotations = mysqlTable("textAnnotations", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  pageNumber: int("pageNumber").notNull(),
  content: text("content").notNull(),
  fontSize: int("fontSize").default(12).notNull(),
  fontFamily: varchar("fontFamily", { length: 100 }).default("Arial").notNull(),
  fontColor: varchar("fontColor", { length: 7 }).default("#000000").notNull(),
  positionX: decimal("positionX", { precision: 10, scale: 2 }).default("0").notNull(),
  positionY: decimal("positionY", { precision: 10, scale: 2 }).default("0").notNull(),
  bold: boolean("bold").default(false).notNull(),
  italic: boolean("italic").default(false).notNull(),
  underline: boolean("underline").default(false).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * PDFFiles table - stores final generated PDF files
 */
export const pdfFiles = mysqlTable("pdfFiles", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  fileName: varchar("fileName", { length: 255 }).notNull(),
  fileUrl: varchar("fileUrl", { length: 512 }).notNull(),
  fileSizeBytes: int("fileSizeBytes").notNull(),
  pageCount: int("pageCount").notNull(),
  status: mysqlEnum("status", ["processing", "completed", "failed"]).default("processing").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * ConversionHistory table - tracks all PDF conversions for analytics
 */
export const conversionHistory = mysqlTable("conversionHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  projectId: int("projectId"),
  pdfFileId: int("pdfFileId"),
  imageCount: int("imageCount").notNull(),
  processingTimeMs: int("processingTimeMs").notNull(),
  status: mysqlEnum("status", ["success", "failed"]).default("success").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

/**
 * UserPreferences table - stores user settings and preferences
 */
export const userPreferences = mysqlTable("userPreferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  language: varchar("language", { length: 10 }).default("en").notNull(),
  theme: mysqlEnum("theme", ["light", "dark", "auto"]).default("auto").notNull(),
  defaultPageSize: varchar("defaultPageSize", { length: 50 }).default("A4").notNull(),
  defaultOrientation: mysqlEnum("defaultOrientation", ["portrait", "landscape"]).default("portrait").notNull(),
  defaultImageQuality: mysqlEnum("defaultImageQuality", ["low", "medium", "high"]).default("high").notNull(),
  enableNotifications: boolean("enableNotifications").default(true).notNull(),
  enableAutoSave: boolean("enableAutoSave").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

/**
 * Type exports for TypeScript
 */
export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

export type Image = typeof images.$inferSelect;
export type InsertImage = typeof images.$inferInsert;

export type TextAnnotation = typeof textAnnotations.$inferSelect;
export type InsertTextAnnotation = typeof textAnnotations.$inferInsert;

export type PDFFile = typeof pdfFiles.$inferSelect;
export type InsertPDFFile = typeof pdfFiles.$inferInsert;

export type ConversionHistoryRecord = typeof conversionHistory.$inferSelect;
export type InsertConversionHistory = typeof conversionHistory.$inferInsert;

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;
