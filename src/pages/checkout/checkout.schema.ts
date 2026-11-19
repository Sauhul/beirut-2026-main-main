import { z } from "zod";

/** Esquema de validación del checkout (React Hook Form + Zod). */
export const checkoutSchema = z
  .object({
    customer_name: z
      .string()
      .trim()
      .min(2, "Ingresa tu nombre")
      .max(80, "Ingresa un nombre de hasta 80 caracteres")
      .regex(/^[\p{L}\s'.-]{2,}$/u, "Nombre inválido"),
    customer_phone: z
      .string()
      .trim()
      .min(7, "Ingresa un teléfono válido")
      .max(15, "Ingresa un teléfono de hasta 15 caracteres")
      .regex(/^[0-9+\s()-]{7,15}$/, "Teléfono inválido"),
    customer_email: z
      .string()
      .trim()
      .email("Ingresa un correo válido")
      .min(1, "Ingresa tu correo"),
    delivery_method: z.enum(["domicilio", "recogida"]),
    address: z.string().trim().max(200).optional(),
    city: z.string().trim().max(100).optional(),
    notes: z.string().trim().max(500).optional().or(z.literal("")),
    payment_method: z.enum(["wompi", "transferencia"]),
  })
  .refine((data) => data.delivery_method !== "domicilio" || (data.address?.length ?? 0) > 0, {
    message: "Ingresa la dirección de entrega",
    path: ["address"],
  })
  .refine((data) => data.delivery_method !== "domicilio" || (data.city?.length ?? 0) > 0, {
    message: "Ingresa la ciudad",
    path: ["city"],
  });

export type CheckoutForm = z.infer<typeof checkoutSchema>;
