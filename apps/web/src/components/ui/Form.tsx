import Form from "@rjsf/shadcn";
import { type RJSFSchema } from "@rjsf/utils";
import { buildSchema } from "@repo/form-tools";

const schema: RJSFSchema = {
  type: "object",
  properties: {
    name: {
      type: "string",
    },
  },
  additionalProperties: {
    type: "number",
    enum: [1, 2, 3],
  },
};

export const RjsfForm = () => {
  const props = buildSchema(schema);
  return <Form {...props} />;
};
