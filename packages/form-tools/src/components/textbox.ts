import { type RJSFSchema } from "@rjsf/utils";
import type { JSONSchema7Definition } from "../types.ts";
import { buildBaseSchema } from "../base.ts";

type TextBoxOptions = Pick<JSONSchema7Definition, "title" | "description"> & {
  required?: boolean;
};

export function buildTextBoxSchema(
  fieldName: string,
  baseSchema: RJSFSchema,
  options: TextBoxOptions = {},
): RJSFSchema {
  let required: string[] = baseSchema.required || [];

  if (options.required) {
    required = Array.from(new Set([fieldName, ...required]));
  } else {
    required = required.filter((f) => f !== fieldName);
  }

  const schema: RJSFSchema["properties"] = {
    ...baseSchema.properties,
    [fieldName]: {
      type: "string",
      ...options,
      required: undefined,
      minLength: options.required ? 1 : undefined,
    },
  };

  return buildBaseSchema(baseSchema.title || "", {
    ...baseSchema,
    required,
    properties: schema,
  });
}
