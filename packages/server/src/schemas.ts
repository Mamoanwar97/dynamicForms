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
  publishedSlug: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const formIdSchema = z.object({
  id: z.string().min(1),
});

export const publishedFormDataSchema = z.object({
  formId: z.string().min(1),
  isActive: z.boolean().optional(),
});

export const publishedFormUpdateSchema = z.object({
  isActive: z.boolean().optional(),
});

export const publishedFormSchema = z.object({
  id: z.string(),
  slug: z.string(),
  data: z.record(z.string(), z.unknown()).optional(),
  isActive: z.boolean().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publishedFormIdSchema = z.object({
  id: z.string().min(1),
});

export const publishedFormSlugSchema = z.object({
  slug: z.string().min(1),
});

export const registerSchema = z.object({
  username: z.string().min(3).max(64),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const userSchema = z.object({
  id: z.string(),
  username: z.string(),
});

export const authResultSchema = z.object({
  user: userSchema,
  token: z.string(),
});

export type FormData = z.infer<typeof formDataSchema>;
export type Form = z.infer<typeof formSchema>;
export type PublishedFormData = z.infer<typeof publishedFormDataSchema>;
export type PublishedForm = z.infer<typeof publishedFormSchema>;
export type User = z.infer<typeof userSchema>;
export type AuthResult = z.infer<typeof authResultSchema>;