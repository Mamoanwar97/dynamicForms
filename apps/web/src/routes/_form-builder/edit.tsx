import { createFileRoute } from "@tanstack/react-router";

import { useFormBuilder } from "@/contexts/form-builder";
import { EditForm } from "@/pages/edit-form";

export const Route = createFileRoute("/_form-builder/edit")({
  component: EditRoute,
});

function EditRoute() {
  const { formData, submitForm } = useFormBuilder();

  return <EditForm formData={formData} onSubmit={submitForm} />;
}
