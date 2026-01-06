import { z } from 'zod';
import { 
  taskSchema,
  habitSchema,
  journalEntrySchema
} from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  tasks: {
    list: {
      method: 'GET' as const,
      path: '/api/tasks',
      input: z.object({ date: z.string() }),
      responses: {
        200: z.array(taskSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/tasks',
      input: taskSchema.omit({ id: true, userId: true }),
      responses: {
        201: taskSchema,
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/tasks/:id',
      input: taskSchema.omit({ id: true, userId: true }).partial(),
      responses: {
        200: taskSchema,
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/tasks/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  habits: {
    list: {
      method: 'GET' as const,
      path: '/api/habits',
      responses: {
        200: z.array(habitSchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/habits',
      input: habitSchema.omit({ id: true, userId: true, streak: true }),
      responses: {
        201: habitSchema,
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/habits/:id',
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    log: {
      method: 'POST' as const,
      path: '/api/habits/:id/log',
      input: z.object({ date: z.string() }),
      responses: {
        200: habitSchema,
        404: errorSchemas.notFound,
      },
    }
  },
  journal: {
    list: {
      method: 'GET' as const,
      path: '/api/journal',
      input: z.object({ date: z.string().optional() }),
      responses: {
        200: z.array(journalEntrySchema),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/journal',
      input: journalEntrySchema.omit({ id: true, userId: true, createdAt: true }),
      responses: {
        201: journalEntrySchema,
        400: errorSchemas.validation,
      },
    },
  },
  quotes: {
    random: {
      method: 'GET' as const,
      path: '/api/quotes/random',
      responses: {
        200: z.object({ text: z.string(), author: z.string() }),
      },
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
