import { z } from "zod";
import { payment_method_enum, type payments, type payment_lines, type invoices } from "@prisma/client";
import { Ticket } from "./ticket.types";
import { Parcel } from "./parcel.types";

/**
 * Database model types
 */
export type Payment = payments;
export type PaymentLine = payment_lines;
export type Invoice = invoices;

export type PaymentWithRelations = Payment & {
  lines?: PaymentLine[];
  invoice?: Invoice;
};

export type PaymentLineWithRelations = PaymentLine & {
  payment?: Payment;
  ticket?: Ticket;
  parcel?: Parcel;
};

/**
 * Payment Schemas
 */
const paymentSchema = z.object({
  amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
  method: z.nativeEnum(payment_method_enum),
});

export const createPaymentSchema = paymentSchema;
export const updatePaymentSchema = paymentSchema.partial();

/**
 * Payment Line Schemas
 */
const basePaymentLineSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  ticketId: z.string().uuid("ID de ticket inválido").optional(),
  parcelId: z.string().uuid("ID de encomienda inválido").optional(),
  description: z.string().optional(),
  amount: z.number().min(0, "El monto debe ser mayor o igual a 0"),
});

export const createPaymentLineSchema = basePaymentLineSchema.refine(
  data => data.ticketId || data.parcelId, {
    message: "Debe especificar un ticket o una encomienda",
    path: ["ticketId", "parcelId"],
  }
);

export const updatePaymentLineSchema = basePaymentLineSchema.partial();

/**
 * Invoice Schemas
 */
const invoiceSchema = z.object({
  paymentId: z.string().uuid("ID de pago inválido"),
  invoiceNumber: z.string().min(1, "El número de factura es requerido").trim(),
  taxInfo: z.object({
    taxId: z.string().optional(),
    taxRate: z.number().min(0).default(0),
    taxAmount: z.number().min(0).default(0),
  }),
});

export const createInvoiceSchema = invoiceSchema;
export const updateInvoiceSchema = invoiceSchema.partial();

/**
 * Form Types
 */
export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentInput = z.infer<typeof updatePaymentSchema>;

export type CreatePaymentLineInput = z.infer<typeof createPaymentLineSchema>;
export type UpdatePaymentLineInput = z.infer<typeof updatePaymentLineSchema>;

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type UpdateInvoiceInput = z.infer<typeof updateInvoiceSchema>;

/**
 * Helper Types for Labels
 */
export type PaymentMethodLabel = {
  [K in payment_method_enum]: string;
};

export type TransactionType = 'ticket' | 'parcel' | 'other';

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: TransactionType;
  referenceId?: string; // ID of the ticket or parcel
  createdAt: Date;
  updatedAt: Date;
};

export type KPI = {
  label: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
};

export type DateRange = {
  startDate: string;
  endDate: string;
};

export type TransactionFilters = DateRange & {
  searchTerm?: string;
  type?: TransactionType;
}; 