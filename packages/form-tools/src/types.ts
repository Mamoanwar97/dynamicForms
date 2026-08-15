import { type RJSFSchema } from "@rjsf/utils";

export type JSONSchema7Definition = Exclude<
  Exclude<RJSFSchema["properties"], undefined>[string],
  boolean
>;
