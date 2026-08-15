import { type RJSFSchema } from "@rjsf/utils";

type Options = Pick<RJSFSchema, "description" | "required" | "properties">;

export function buildBaseSchema(title: string, options: Options = {}) {
  const schema: RJSFSchema = {
    title,
    type: "object",
    ...options,
  };

  return schema;
}
