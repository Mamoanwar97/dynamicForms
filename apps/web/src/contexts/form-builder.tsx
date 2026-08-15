import { createContext, useContext, useState, type ReactNode } from "react";

import type { CreateFormData } from "@/schemas/create";

type FormBuilderContextValue = {
  formData: CreateFormData | undefined;
  submitForm: (data: CreateFormData) => void;
};

const FormBuilderContext = createContext<FormBuilderContextValue | undefined>(
  undefined,
);

export function FormBuilderProvider({ children }: { children: ReactNode }) {
  const [formData, setFormData] = useState<CreateFormData>();

  function submitForm(data: CreateFormData) {
    setFormData(data);
  }

  return (
    <FormBuilderContext.Provider value={{ formData, submitForm }}>
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
