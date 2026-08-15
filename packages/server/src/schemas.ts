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
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const formIdSchema = z.object({
  id: z.string().min(1),
});

export type FormData = z.infer<typeof formDataSchema>;
export type Form = z.infer<typeof formSchema>;
