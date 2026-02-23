import 'dotenv/config';
import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  earlyAccess: true,
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  migrate: {
    async url() {
      return env('DATABASE_URL_UNPOOLED') ?? env('DATABASE_URL') ?? '';
    },
  },
});
