import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { registerAuthSwaggerPaths } from "./swagger/auth.swagger";
import { registerChatSwaggerPaths } from "./swagger/chat.swagger";
import { registerMessageSwaggerPaths } from "./swagger/message.swagger";
import { registerSecuritySchemes } from "./swagger/schemas";
import { registerUserSwaggerPaths } from "./swagger/user.swagger";

const registry = new OpenAPIRegistry();

registerSecuritySchemes(registry);
registerAuthSwaggerPaths(registry);
registerChatSwaggerPaths(registry);
registerMessageSwaggerPaths(registry);
registerUserSwaggerPaths(registry);

const generator = new OpenApiGeneratorV3(registry.definitions);

export const swaggerSpec = generator.generateDocument({
  openapi: "3.0.0",
  info: {
    title: "Chat API",
    version: "1.0.0",
    description: "API documentation (generated from Zod)",
  },
  servers: [
    {
      url: "http://localhost:8000/api",
    },
  ],
});
