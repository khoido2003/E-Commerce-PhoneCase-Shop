import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { z } from "zod";
import sharp from "sharp";
import { db } from "@/db";

// All of this happen on the server to handle image upload

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });

export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .input(z.object({ configId: z.string().optional() }))

    .middleware(async ({ input }) => {
      return { input };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const { configId } = metadata.input;

      const res = await fetch(file.url);
      const buffer = await res.arrayBuffer();

      const imgMetadata = await sharp(buffer).metadata();

      const { width, height } = imgMetadata;

      if (!configId) {
        // This is at step 1 -> 2 of customize case
        const configuration = await db.configuration.create({
          data: {
            height: height || 500,
            width: width || 500,
            imageUrl: file.url,
          },
        });

        return { configId: configuration.id };
      } else {
        // This is at step 2 -> 3 of customize case
        const updateConfiguration = await db.configuration.update({
          where: { id: configId },
          data: {
            croppedImageUrl: file.url,
          },
        });

        return { configId: updateConfiguration.id };
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
