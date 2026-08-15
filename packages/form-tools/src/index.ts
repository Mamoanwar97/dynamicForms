import validator from "@rjsf/validator-ajv8";
import { type RJSFSchema, type UiSchema } from "@rjsf/utils";

export function buildSchema(
  schema: RJSFSchema,
  uiSchema: UiSchema | undefined = undefined,
  formData: any = undefined,
) {
  return {
    schema,
    uiSchema,
    formData,
    validator,
  };
}

export { buildTextBoxSchema } from "./components/textbox.ts";
export { buildBaseSchema } from "./base.ts";
