import { createContext, useContext, useState, type ReactNode } from "react";

import type { CreateFormData } from "@/schemas/create";
import { trpc } from "@/trpc";

type FormBuilderContextValue = {
  formData: CreateFormData | undefined;
  savedFormId: string | undefined;
  isSaving: boolean;
  submitForm: (data: CreateFormData) => void;
};

const FormBuilderContext = createContext<FormBuilderContextValue | undefined>(
  undefined,
);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<CreateFormData>();
  const [savedFormId, setSavedFormId] = useState<string>();

  const create = trpc.form.create.useMutation({
    onSuccess: (saved) => {
      setSavedFormId(saved.id);
      setFormData({ title: saved.title, inputs: saved.inputs });
    },
  });

  const update = trpc.form.update.useMutation({
    onSuccess: (saved) => {
      setFormData({ title: saved.title, inputs: saved.inputs });
    },
  });

  function submitForm(data: CreateFormData) {
    setFormData(data);

    if (savedFormId) {
      update.mutate({ id: savedFormId, data });
    } else {
      create.mutate(data);
    }
  }

  return (
    <FormBuilderContext.Provider
      value={{
        formData,
        savedFormId,
        isSaving: create.isPending || update.isPending,
        submitForm,
      }}
    >
      {children}
    </FormBuilderContext.Provider>
  );
}

export function useFormBuilder() {
  const context = useContext(FormBuilderContext);

  if (context === undefined) {
    throw new Error("useFormBuilder must be used within a FormBuilderProvider");
  }

  return context;
}
