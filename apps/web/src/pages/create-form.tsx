import Form from "@rjsf/shadcn";
import { buildSchema } from "@repo/form-tools";
import { createFormSchema } from "@/schemas/create";

type CreateFormProps = {
  onSubmit: (data: any) => void;
};

export const CreateForm = (props: CreateFormProps) => {
  const properties = buildSchema(createFormSchema);
  return (
    <Form {...properties} onSubmit={(data) => props.onSubmit(data.formData)} />
  );
};
