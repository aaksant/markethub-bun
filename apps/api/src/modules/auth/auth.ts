import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { db } from "@app/db/client";
import * as schema from "@app/db/schema";
import { openAPI } from "better-auth/plugins";

export const auth = betterAuth({
  trustedOrigins: ["http://localhost:3000", "http://localhost:3001"],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      account: schema.accounts,
      session: schema.sessions,
      verification: schema.verifications
    }
  }),
  plugins: [openAPI()],
  emailAndPassword: {
    enabled: true
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true
      }
    }
  }
});
