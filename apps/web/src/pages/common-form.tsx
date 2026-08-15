import Form from "@rjsf/shadcn";
import { buildSchema } from "@repo/form-tools";
import {
  createFormSchema,
  type CreateFormData,
  createFormUiSchema,
} from "@/schemas/create";

type CommonFormProps = {
  onView: (data: CreateFormData) => void;
  onSave: (data: CreateFormData) => void;
  formData: CreateFormData | undefined;
};

export const CommonForm = (props: CommonFormProps) => {
  const properties = buildSchema(createFormSchema, createFormUiSchema);
  return (
    <Form
      {...properties}
      formData={props.formData}
      onChange={(data) => props.onView(data.formData)}
      onSubmit={(data) => props.onSave(data.formData)}
    />
  );
};
