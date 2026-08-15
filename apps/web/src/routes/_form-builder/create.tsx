import { createFileRoute } from "@tanstack/react-router";

import { useFormBuilder } from "@/contexts/form-builder";
import { CreateForm } from "@/pages/create-form";

export const Route = createFileRoute("/_form-builder/create")({
  component: CreateRoute,
});

function CreateRoute() {
  const { submitForm } = useFormBuilder();

  return <CreateForm onSubmit={submitForm} />;
}
