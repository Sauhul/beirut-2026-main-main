import { z } from "zod";

/** Esquema de validación del checkout (React Hook Form + Zod). */
export const checkoutSchema = z
  .object({
    customer_name: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre")
      .max(100)
      .regex(/^[\p{L}\s'.-]{2,}$/u, "Nombre inválido"),
    customer_phone: z
      .string()
      .trim()
      .min(7, "Ingresa un teléfono válido")
      .max(30)
      .regex(/^[0-9+\s()-]{7,30}$/, "Teléfono inválido"),
    customer_email: z
      .string()
      .trim()
      .email("Correo inválido")
      .max(255)
      .optional()
      .or(z.literal("")),
    delivery_method: z.enum(["domicilio", "recogida"]),
    address: z.string().trim().max(200).optional().or(z.literal("")),
    city: z.string().trim().max(100).optional().or(z.literal("")),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    payment_method: z.enum(["wompi", "transferencia"]),
  })
  .refine((data) => data.delivery_method !== "domicilio" || (data.address?.length ?? 0) > 0, {
    message: "Ingresa la dirección de entrega",
    path: ["address"],
  });

export type CheckoutForm = z.infer<typeof checkoutSchema>;
