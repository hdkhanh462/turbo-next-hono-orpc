import "dotenv/config";

import { serveStatic } from "@hono/node-server/serve-static";
import { OpenAPIHandler } from "@orpc/openapi/fetch";
import { OpenAPIReferencePlugin } from "@orpc/openapi/plugins";
import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { ZodToJsonSchemaConverter } from "@orpc/zod/zod4";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger as loggerMiddleware } from "hono/logger";

import { env } from "./env";
import { auth } from "./lib/auth";
import { createContext } from "./lib/context";
import logger from "./lib/logger";
import { IMAGES_UPLOAD_FOLDER, imageStorage } from "./lib/storage";
import { appRouter } from "./routers";
import { UPLOAD_IMAGE_SCHEMA } from "./schemas/upload.schema";

const app = new Hono();

app.use(loggerMiddleware());
app.use(
  "/*",
  cors({
    origin: env.CORS_ORIGIN,
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use("/static/*", serveStatic({ root: "./" }));

app.on(["POST", "GET"], "/api/auth/*", (c) => auth.handler(c.req.raw));

export const apiHandler = new OpenAPIHandler(appRouter, {
  plugins: [
    new OpenAPIReferencePlugin({
      schemaConverters: [new ZodToJsonSchemaConverter()],
    }),
  ],
  interceptors: [
    onError((error) => {
      logger.error(error);
    }),
  ],
});

export const rpcHandler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      logger.error(error);
    }),
  ],
});

app.use("/*", async (c, next) => {
  const context = await createContext({ context: c });

  const rpcResult = await rpcHandler.handle(c.req.raw, {
    prefix: "/rpc",
    context: context,
  });

  if (rpcResult.matched) {
    return c.newResponse(rpcResult.response.body, rpcResult.response);
  }

  const apiResult = await apiHandler.handle(c.req.raw, {
    prefix: "/api",
    context: context,
  });

  if (apiResult.matched) {
    return c.newResponse(apiResult.response.body, apiResult.response);
  }

  await next();
});

app.post("api/upload/image", imageStorage.single("image"), (c) => {
  const { image: imageFilename } = c.var.fileNames;
  const parsedResult = UPLOAD_IMAGE_SCHEMA.safeParse(c.var.files);

  if (!parsedResult.success) {
    return c.json(
      {
        code: "INVALID_FILE_UPLOAD",
        message: "Invalid file upload",
        error: parsedResult.error.issues[0].message,
      },
      400
    );
  }

  return c.json({
    name: imageFilename,
    originalName: parsedResult.data.image.name,
    size: parsedResult.data.image.size,
    type: parsedResult.data.image.type,
    fileUrl: `${env.BETTER_AUTH_URL}/${IMAGES_UPLOAD_FOLDER}/${imageFilename}`,
  });
});

app.get("/", (c) => {
  return c.text("OK");
});

import { serve } from "@hono/node-server";

serve(
  {
    fetch: app.fetch,
    port: 3000,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);
