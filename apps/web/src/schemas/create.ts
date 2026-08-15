import { type RJSFSchema } from "@rjsf/utils";
import { buildBaseSchema } from "@repo/form-tools";

export const createFormSchema: RJSFSchema = buildBaseSchema("Create Form", {
  required: ["title", "inputs"],
  properties: {
    title: {
      title: "Form Title",
      type: "string",
    },
    inputs: {
      title: "Form Inputs",
      type: "array",
      minItems: 1,
      items: {
        title: "Input",
        type: "object",
        required: ["title"],
        properties: {
          title: {
            title: "Title",
            type: "string",
          },
          description: {
            title: "Input Description",
            type: "string",
          },
          isRequired: {
            title: "Is Required",
            type: "boolean",
          },
        },
      },
    },
  },
});

export type CreateFormData = {
  title: string;
  inputs: Array<{
    title: string;
    description?: string;
    isRequired?: boolean;
  }>;
};
