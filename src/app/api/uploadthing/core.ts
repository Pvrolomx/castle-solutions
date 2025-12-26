import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  documentUploader: f({ image: { maxFileSize: "4MB" }, pdf: { maxFileSize: "8MB" } })
    .onUploadComplete(async ({ file }) => {
      console.log("Upload complete:", file.url);
      return { url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
