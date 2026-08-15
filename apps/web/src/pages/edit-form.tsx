import Form from "@rjsf/shadcn";
import { buildSchema } from "@repo/form-tools";
import { createFormSchema, type CreateFormData } from "@/schemas/create";

type EditFormProps = {
  onSubmit: (data: CreateFormData) => void;
  formData: CreateFormData | undefined;
};

export const EditForm = (props: EditFormProps) => {
  const properties = buildSchema(createFormSchema);
  return (
    <Form
      {...properties}
      formData={props.formData}
      onSubmit={(data) => props.onSubmit(data.formData)}
    />
  );
};
