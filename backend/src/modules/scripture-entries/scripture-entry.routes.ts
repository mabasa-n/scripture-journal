import { FastifyInstance } from "fastify";
import { and, count, desc, eq } from "drizzle-orm";
import { db, scriptureEntries } from "../../db";
import { authenticate } from "../../middleware/authenticate";

const uuidPattern =
  "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$";

const requiredText = (maxLength: number) => ({
  type: "string",
  minLength: 1,
  maxLength,
});

const optionalDescription = {
  anyOf: [requiredText(20000), { type: "null" }],
};

const scriptureEntryBodyProperties = {
  heading: requiredText(255),
  scriptureReference: requiredText(100),
  scriptureText: requiredText(20000),
  description: optionalDescription,
};

const entryResponseSchema = {
  type: "object",
  required: [
    "id",
    "heading",
    "scriptureReference",
    "scriptureText",
    "description",
    "createdAt",
    "updatedAt",
  ],
  properties: {
    id: { type: "string" },
    heading: { type: "string" },
    scriptureReference: { type: "string" },
    scriptureText: { type: "string" },
    description: { anyOf: [{ type: "string" }, { type: "null" }] },
    createdAt: { type: "string", format: "date-time" },
    updatedAt: { type: "string", format: "date-time" },
  },
};

const errorResponseSchema = {
  type: "object",
  required: ["error"],
  properties: {
    error: { type: "string" },
  },
};

type ScriptureEntryRow = typeof scriptureEntries.$inferSelect;

type ScriptureEntryBody = {
  heading: string;
  scriptureReference: string;
  scriptureText: string;
  description?: string | null;
};

type ScriptureEntryPatchBody = Partial<ScriptureEntryBody>;

type ScriptureEntryParams = {
  id: string;
};

type ScriptureEntryListQuery = {
  page?: number | string;
  limit?: number | string;
};

function serializeEntry(entry: ScriptureEntryRow) {
  return {
    id: entry.id,
    heading: entry.heading,
    scriptureReference: entry.scriptureReference,
    scriptureText: entry.scriptureText,
    description: entry.description,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

function normalizeRequiredText(value: string): string {
  return value.trim();
}

function normalizeDescription(value: string | null | undefined): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length === 0 ? null : trimmed;
}

function normalizeCreateBody(body: ScriptureEntryBody): ScriptureEntryBody {
  return {
    heading: normalizeRequiredText(body.heading),
    scriptureReference: normalizeRequiredText(body.scriptureReference),
    scriptureText: normalizeRequiredText(body.scriptureText),
    description: normalizeDescription(body.description),
  };
}

function normalizePatchBody(body: ScriptureEntryPatchBody) {
  const normalized: ScriptureEntryPatchBody = {};

  if (body.heading !== undefined) {
    normalized.heading = normalizeRequiredText(body.heading);
  }

  if (body.scriptureReference !== undefined) {
    normalized.scriptureReference = normalizeRequiredText(body.scriptureReference);
  }

  if (body.scriptureText !== undefined) {
    normalized.scriptureText = normalizeRequiredText(body.scriptureText);
  }

  if (body.description !== undefined) {
    normalized.description = normalizeDescription(body.description);
  }

  return normalized;
}

function hasBlankRequiredField(body: ScriptureEntryPatchBody): boolean {
  return (
    body.heading === "" ||
    body.scriptureReference === "" ||
    body.scriptureText === ""
  );
}

export async function scriptureEntryRoutes(app: FastifyInstance) {
  app.post<{ Body: ScriptureEntryBody }>(
    "/api/scripture-entries",
    {
      schema: {
        body: {
          type: "object",
          required: ["heading", "scriptureReference", "scriptureText"],
          additionalProperties: false,
          properties: scriptureEntryBodyProperties,
        },
        response: {
          201: entryResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request, reply);
      if (!user) {
        return;
      }

      const body = normalizeCreateBody(request.body);

      if (hasBlankRequiredField(body)) {
        return reply.status(400).send({ error: "Required fields cannot be blank" });
      }

      const [entry] = await db
        .insert(scriptureEntries)
        .values({
          userId: user.userId,
          heading: body.heading,
          scriptureReference: body.scriptureReference,
          scriptureText: body.scriptureText,
          description: body.description,
        })
        .returning();

      reply.header("Location", `/api/scripture-entries/${entry.id}`);
      return reply.status(201).send(serializeEntry(entry));
    },
  );

  app.get<{ Querystring: ScriptureEntryListQuery }>(
    "/api/scripture-entries",
    {
      schema: {
        querystring: {
          type: "object",
          additionalProperties: false,
          properties: {
            page: { type: "integer", minimum: 1, default: 1 },
            limit: { type: "integer", minimum: 1, maximum: 100, default: 20 },
          },
        },
        response: {
          200: {
            type: "object",
            required: ["data", "pagination"],
            properties: {
              data: {
                type: "array",
                items: entryResponseSchema,
              },
              pagination: {
                type: "object",
                required: ["page", "limit", "total", "totalPages"],
                properties: {
                  page: { type: "integer" },
                  limit: { type: "integer" },
                  total: { type: "integer" },
                  totalPages: { type: "integer" },
                },
              },
            },
          },
          401: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request, reply);
      if (!user) {
        return;
      }

      const page = Number(request.query.page ?? 1);
      const limit = Number(request.query.limit ?? 20);
      const offset = (page - 1) * limit;
      const userFilter = eq(scriptureEntries.userId, user.userId);

      const [totalResult] = await db
        .select({ value: count() })
        .from(scriptureEntries)
        .where(userFilter);

      const entries = await db
        .select()
        .from(scriptureEntries)
        .where(userFilter)
        .orderBy(desc(scriptureEntries.createdAt), desc(scriptureEntries.id))
        .limit(limit)
        .offset(offset);

      const total = totalResult.value;

      return reply.send({
        data: entries.map(serializeEntry),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    },
  );

  app.get<{ Params: ScriptureEntryParams }>(
    "/api/scripture-entries/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", pattern: uuidPattern },
          },
        },
        response: {
          200: entryResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request, reply);
      if (!user) {
        return;
      }

      const [entry] = await db
        .select()
        .from(scriptureEntries)
        .where(
          and(
            eq(scriptureEntries.id, request.params.id),
            eq(scriptureEntries.userId, user.userId),
          ),
        )
        .limit(1);

      if (!entry) {
        return reply.status(404).send({ error: "Scripture entry not found" });
      }

      return reply.send(serializeEntry(entry));
    },
  );

  app.put<{ Params: ScriptureEntryParams; Body: ScriptureEntryBody }>(
    "/api/scripture-entries/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", pattern: uuidPattern },
          },
        },
        body: {
          type: "object",
          required: ["heading", "scriptureReference", "scriptureText"],
          additionalProperties: false,
          properties: scriptureEntryBodyProperties,
        },
        response: {
          200: entryResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request, reply);
      if (!user) {
        return;
      }

      const body = normalizeCreateBody(request.body);

      if (hasBlankRequiredField(body)) {
        return reply.status(400).send({ error: "Required fields cannot be blank" });
      }

      const [entry] = await db
        .update(scriptureEntries)
        .set({
          heading: body.heading,
          scriptureReference: body.scriptureReference,
          scriptureText: body.scriptureText,
          description: body.description,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(scriptureEntries.id, request.params.id),
            eq(scriptureEntries.userId, user.userId),
          ),
        )
        .returning();

      if (!entry) {
        return reply.status(404).send({ error: "Scripture entry not found" });
      }

      return reply.send(serializeEntry(entry));
    },
  );

  app.patch<{ Params: ScriptureEntryParams; Body: ScriptureEntryPatchBody }>(
    "/api/scripture-entries/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", pattern: uuidPattern },
          },
        },
        body: {
          type: "object",
          minProperties: 1,
          additionalProperties: false,
          properties: scriptureEntryBodyProperties,
        },
        response: {
          200: entryResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request, reply);
      if (!user) {
        return;
      }

      const body = normalizePatchBody(request.body);

      if (hasBlankRequiredField(body)) {
        return reply.status(400).send({ error: "Required fields cannot be blank" });
      }

      const [entry] = await db
        .update(scriptureEntries)
        .set({
          ...body,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(scriptureEntries.id, request.params.id),
            eq(scriptureEntries.userId, user.userId),
          ),
        )
        .returning();

      if (!entry) {
        return reply.status(404).send({ error: "Scripture entry not found" });
      }

      return reply.send(serializeEntry(entry));
    },
  );

  app.delete<{ Params: ScriptureEntryParams }>(
    "/api/scripture-entries/:id",
    {
      schema: {
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: { type: "string", pattern: uuidPattern },
          },
        },
        response: {
          204: { type: "null" },
          401: errorResponseSchema,
          404: errorResponseSchema,
        },
      },
    },
    async (request, reply) => {
      const user = await authenticate(request, reply);
      if (!user) {
        return;
      }

      const [entry] = await db
        .delete(scriptureEntries)
        .where(
          and(
            eq(scriptureEntries.id, request.params.id),
            eq(scriptureEntries.userId, user.userId),
          ),
        )
        .returning({ id: scriptureEntries.id });

      if (!entry) {
        return reply.status(404).send({ error: "Scripture entry not found" });
      }

      return reply.status(204).send();
    },
  );
}
