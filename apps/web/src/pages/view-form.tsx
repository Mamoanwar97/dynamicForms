import Form from "@rjsf/shadcn";
import type { CreateFormData } from "@/schemas/create";
import {
  buildBaseSchema,
  buildSchema,
  buildTextBoxSchema,
} from "@repo/form-tools";
import type { UiSchema } from "@rjsf/utils";

type ViewFormProps = {
  data: CreateFormData | undefined;
};

function getSchemaFromData(data: CreateFormData) {
  let schema = buildBaseSchema(data.title);

  data.inputs.forEach((input) => {
    schema = buildTextBoxSchema(input.title, schema, {
      description: input.description,
      required: input.isRequired,
    });
  });

  const UISchema: UiSchema = {
    "ui:order": data.inputs.map((input) => input.title),
  };

  return buildSchema(schema, UISchema);
}

export const ViewForm = (props: ViewFormProps) => {
  if (props.data === undefined) {
    return (
      <div className="text-sm text-muted-foreground">
        No form to preview yet. Create or edit a form on the left.
      </div>
    );
  }

  return <Form {...getSchemaFromData(props.data)} readonly />;
};
