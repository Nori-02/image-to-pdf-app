import { eq, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  projects,
  images,
  textAnnotations,
  pdfFiles,
  conversionHistory,
  userPreferences,
  InsertProject,
  InsertImage,
  InsertTextAnnotation,
  InsertPDFFile,
  InsertConversionHistory,
  InsertUserPreference,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Project Functions ============

export async function createProject(data: InsertProject) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(projects).values(data);
  const created = await db
    .select()
    .from(projects)
    .where(eq(projects.userId, data.userId))
    .orderBy(projects.id)
    .limit(1);
  return created[0]?.id || 0;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(projects.updatedAt);
}

export async function getProject(projectId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(projects)
    .where(and(eq(projects.id, projectId), eq(projects.userId, userId)))
    .limit(1);

  return result[0] || null;
}

export async function updateProject(
  projectId: number,
  data: Partial<InsertProject>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId));
}

export async function deleteProject(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(projects).where(eq(projects.id, projectId));
}

// ============ Image Functions ============

export async function createImage(data: InsertImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(images).values(data);
  const created = await db
    .select()
    .from(images)
    .where(eq(images.projectId, data.projectId))
    .orderBy(images.id)
    .limit(1);
  return created[0]?.id || 0;
}

export async function getProjectImages(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(images)
    .where(eq(images.projectId, projectId))
    .orderBy(images.pageNumber);
}

export async function updateImage(imageId: number, data: Partial<InsertImage>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(images)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(images.id, imageId));
}

export async function deleteImage(imageId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(images).where(eq(images.id, imageId));
}

// ============ Text Annotation Functions ============

export async function createTextAnnotation(data: InsertTextAnnotation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(textAnnotations).values(data);
  const created = await db
    .select()
    .from(textAnnotations)
    .where(eq(textAnnotations.projectId, data.projectId))
    .orderBy(textAnnotations.id)
    .limit(1);
  return created[0]?.id || 0;
}

export async function getProjectTextAnnotations(projectId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(textAnnotations)
    .where(eq(textAnnotations.projectId, projectId))
    .orderBy(textAnnotations.pageNumber);
}

export async function updateTextAnnotation(
  annotationId: number,
  data: Partial<InsertTextAnnotation>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(textAnnotations)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(textAnnotations.id, annotationId));
}

export async function deleteTextAnnotation(annotationId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(textAnnotations)
    .where(eq(textAnnotations.id, annotationId));
}

// ============ PDF File Functions ============

export async function createPDFFile(data: InsertPDFFile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(pdfFiles).values(data);
  const created = await db
    .select()
    .from(pdfFiles)
    .where(eq(pdfFiles.projectId, data.projectId))
    .orderBy(pdfFiles.id)
    .limit(1);
  return created[0]?.id || 0;
}

export async function getUserPDFFiles(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(pdfFiles)
    .where(eq(pdfFiles.userId, userId))
    .orderBy(pdfFiles.createdAt);
}

export async function getPDFFile(pdfFileId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(pdfFiles)
    .where(eq(pdfFiles.id, pdfFileId))
    .limit(1);

  return result[0] || null;
}

export async function updatePDFFile(
  pdfFileId: number,
  data: Partial<InsertPDFFile>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .update(pdfFiles)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(pdfFiles.id, pdfFileId));
}

export async function deletePDFFile(pdfFileId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(pdfFiles).where(eq(pdfFiles.id, pdfFileId));
}

// ============ Conversion History Functions ============

export async function recordConversion(data: InsertConversionHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(conversionHistory).values(data);
  const created = await db
    .select()
    .from(conversionHistory)
    .where(eq(conversionHistory.userId, data.userId))
    .orderBy(conversionHistory.id)
    .limit(1);
  return created[0]?.id || 0;
}

export async function getUserConversionHistory(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(conversionHistory)
    .where(eq(conversionHistory.userId, userId))
    .orderBy(conversionHistory.createdAt);
}

// ============ User Preferences Functions ============

export async function createUserPreferences(data: InsertUserPreference) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(userPreferences).values(data);
  const created = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, data.userId))
    .limit(1);
  return created[0]?.id || 0;
}

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);

  return result[0] || null;
}

export async function updateUserPreferences(
  userId: number,
  data: Partial<InsertUserPreference>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await getUserPreferences(userId);

  if (existing) {
    await db
      .update(userPreferences)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(userPreferences.userId, userId));
  } else {
    await createUserPreferences({ userId, ...data } as InsertUserPreference);
  }
}
