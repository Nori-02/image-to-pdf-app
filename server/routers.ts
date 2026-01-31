import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  projects: router({
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          description: z.string().optional(),
          pageSize: z.string().default("A4"),
          orientation: z.enum(["portrait", "landscape"]).default("portrait"),
          imageQuality: z.enum(["low", "medium", "high"]).default("high"),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createProject({
          userId: ctx.user.id,
          name: input.name,
          description: input.description,
          pageSize: input.pageSize,
          orientation: input.orientation,
          imageQuality: input.imageQuality,
          status: "draft",
        })
      ),

    list: protectedProcedure.query(({ ctx }) =>
      db.getUserProjects(ctx.user.id)
    ),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ ctx, input }) => db.getProject(input.id, ctx.user.id)),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          description: z.string().optional(),
          pageSize: z.string().optional(),
          orientation: z.enum(["portrait", "landscape"]).optional(),
          imageQuality: z.enum(["low", "medium", "high"]).optional(),
          watermark: z.string().optional(),
          status: z.enum(["draft", "completed", "archived"]).optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateProject(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteProject(input.id)),
  }),

  images: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          originalUrl: z.string().url(),
          fileName: z.string(),
          mimeType: z.string(),
          fileSizeBytes: z.number(),
          width: z.number().optional(),
          height: z.number().optional(),
          pageNumber: z.number(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createImage({
          ...input,
          userId: ctx.user.id,
          rotation: 0,
          brightness: 100,
          contrast: 100,
        })
      ),

    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => db.getProjectImages(input.projectId)),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          rotation: z.number().optional(),
          brightness: z.number().optional(),
          contrast: z.number().optional(),
          cropData: z.any().optional(),
          filters: z.any().optional(),
          pageNumber: z.number().optional(),
          editedUrl: z.string().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateImage(id, data);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteImage(input.id)),
  }),

  textAnnotations: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          pageNumber: z.number(),
          content: z.string(),
          fontSize: z.number().default(12),
          fontFamily: z.string().default("Arial"),
          fontColor: z.string().default("#000000"),
          positionX: z.number().default(0),
          positionY: z.number().default(0),
          bold: z.boolean().default(false),
          italic: z.boolean().default(false),
          underline: z.boolean().default(false),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createTextAnnotation({
          ...input,
          userId: ctx.user.id,
          positionX: String(input.positionX),
          positionY: String(input.positionY),
        } as any)
      ),

    listByProject: protectedProcedure
      .input(z.object({ projectId: z.number() }))
      .query(({ input }) => db.getProjectTextAnnotations(input.projectId)),

    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          content: z.string().optional(),
          fontSize: z.number().optional(),
          fontFamily: z.string().optional(),
          fontColor: z.string().optional(),
          positionX: z.number().or(z.string()).optional(),
          positionY: z.number().or(z.string()).optional(),
          bold: z.boolean().optional(),
          italic: z.boolean().optional(),
          underline: z.boolean().optional(),
        })
      )
      .mutation(({ input }) => {
        const { id, ...data } = input;
        return db.updateTextAnnotation(id, data as any);
      }),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deleteTextAnnotation(input.id)),
  }),

  pdfFiles: router({
    create: protectedProcedure
      .input(
        z.object({
          projectId: z.number(),
          fileName: z.string(),
          fileUrl: z.string().url(),
          fileSizeBytes: z.number(),
          pageCount: z.number(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.createPDFFile({
          ...input,
          userId: ctx.user.id,
          status: "completed",
        })
      ),

    listByUser: protectedProcedure.query(({ ctx }) =>
      db.getUserPDFFiles(ctx.user.id)
    ),

    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => db.getPDFFile(input.id)),

    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(({ input }) => db.deletePDFFile(input.id)),
  }),

  preferences: router({
    get: protectedProcedure.query(({ ctx }) =>
      db.getUserPreferences(ctx.user.id)
    ),

    update: protectedProcedure
      .input(
        z.object({
          language: z.string().optional(),
          theme: z.enum(["light", "dark", "auto"]).optional(),
          defaultPageSize: z.string().optional(),
          defaultOrientation: z.enum(["portrait", "landscape"]).optional(),
          defaultImageQuality: z.enum(["low", "medium", "high"]).optional(),
          enableNotifications: z.boolean().optional(),
          enableAutoSave: z.boolean().optional(),
        })
      )
      .mutation(({ ctx, input }) =>
        db.updateUserPreferences(ctx.user.id, input)
      ),
  }),
});

export type AppRouter = typeof appRouter;
