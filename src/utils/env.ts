import { z } from "zod";

type EnvVariables = z.infer<typeof EnvVariablesSchema>;
const EnvVariablesSchema = z.object({
  PORT: z.coerce.number().default(3000),
});

EnvVariablesSchema.parse(process.env);

declare global {
  namespace NodeJS {
    interface ProcessEnv extends EnvVariables {}
  }
}
