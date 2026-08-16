import { z } from "zod";

export const formInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isRequired: z.boolean().optional(),
});

export const formDataSchema = z.object({
  title: z.string().min(1),
  inputs: z.array(formInputSchema).min(1),
});

export const formSchema = z.object({
  id: z.string(),
  ...formDataSchema.shape,
  publishedFormId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const formIdSchema = z.object({
  id: z.string().min(1),
});

export const publishedFormDataSchema = z.object({
  formId: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
});

export const publishedFormUpdateSchema = z.object({
  data: formDataSchema.optional(),
  isActive: z.boolean().optional(),
});

export const publishedFormSchema = z.object({
  id: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publishedFormIdSchema = z.object({
  id: z.string().min(1),
});

export type FormData = z.infer<typeof formDataSchema>;
export type Form = z.infer<typeof formSchema>;
export type PublishedFormData = z.infer<typeof publishedFormDataSchema>;
export type PublishedForm = z.infer<typeof publishedFormSchema>;
