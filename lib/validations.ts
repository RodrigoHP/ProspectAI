import { z } from "zod";
import { BRAZILIAN_STATES } from "@/lib/constants";

const validStateValues = [
  "Todo o Brasil",
  ...BRAZILIAN_STATES.map((s) => s.value),
] as [string, ...string[]];

export const SearchParamsSchema = z.object({
  icp: z
    .string()
    .min(10, "Descreva o ICP com pelo menos 10 caracteres")
    .max(500, "Máximo de 500 caracteres")
    .transform((v) => v.trim()),
  service: z
    .string()
    .min(10, "Descreva o serviço com pelo menos 10 caracteres")
    .max(500, "Máximo de 500 caracteres")
    .transform((v) => v.trim()),
  state: z.enum(validStateValues, {
    message: "Selecione um estado válido",
  }),
  city: z
    .string()
    .max(100, "Máximo de 100 caracteres")
    .transform((v) => v.trim())
    .optional()
    .default(""),
});

export type SearchParamsInput = z.input<typeof SearchParamsSchema>;
