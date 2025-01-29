import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  numeric,
  integer,
  jsonb,
  date,
  time,
  pgEnum,
  pgSchema,
} from "drizzle-orm/pg-core";

// ============================================================================
// ENUMS
// ============================================================================

// User and Access Control
export const roleEnum = pgEnum("role_enum", [
  "superadmin", // Superadmin
  "company_admin", // Company Admin
  "branch_admin", // Branch Admin
  "seller", // Seller
]);

// Parcel Management
export const parcelStatusEnum = pgEnum("parcel_status_enum", [
  "received",
  "in_transit",
  "ready_for_pickup",
  "delivered",
  "cancelled",
]);

// Ticket Management
export const ticketStatusEnum = pgEnum("ticket_status_enum", [
  "active",
  "cancelled",
]);

// Payment Processing
export const paymentMethodEnum = pgEnum("payment_method_enum", [
  "cash",
  "card",
  "bank_transfer",
  "qr",
]);

// Operations
export const eventTypeEnum = pgEnum("event_type_enum", [
  "arrival",
  "departure",
]);

export const incidentTypeEnum = pgEnum("incident_type_enum", [
  "complaint",
  "delay",
  "accident",
]);



export const seatStatusEnum = pgEnum("seat_status_enum", [
  "available",
  "maintenance",
]);

export const maintenanceStatusEnum = pgEnum("maintenance_status_enum", [
  "active",
  "in_maintenance",
  "retired",
]);

// ============================================================================
// CORE TABLES
// ============================================================================

// Branch Management
export const branches = pgTable("branches", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Define auth schema
export const authSchema = pgSchema("auth");

// Reference to Supabase's auth.users table (only essential fields we need)
export const users = authSchema.table("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email"),
  created_at: timestamp("created_at", { withTimezone: true }),
  updated_at: timestamp("updated_at", { withTimezone: true }),
});

export const profiles = pgTable("profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  companyId: uuid("company_id").references(() => companies.id),
  fullName: text("full_name"),
  role: roleEnum("role").notNull(),
  branchId: uuid("branch_id").references(() => branches.id),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Customer Management
export const customers = pgTable("customers", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: text("full_name").notNull(),
  phone: text("phone"),
  email: text("email"),
  documentId: text("document_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
  .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// ROUTE AND SCHEDULE MANAGEMENT
// ============================================================================

// Location Management
export const locations = pgTable("locations", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Route Management
export const routes = pgTable("routes", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  originId: uuid("origin_id").references(() => locations.id),
  destinationId: uuid("destination_id").references(() => locations.id),
  capacity: integer("capacity").notNull().default(40),
  seatsTaken: integer("seats_taken").notNull().default(0),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Schedule Management
export const schedules = pgTable("schedules", {
  id: uuid("id").primaryKey().defaultRandom(),
  routeId: uuid("route_id").references(() => routes.id),
  busId: uuid("bus_id").references(() => buses.id),
  departureDate: date("departure_date").notNull(),
  departureTime: time("departure_time").notNull(),
  price: numeric("price").notNull(),
  capacity: integer("capacity").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// TICKET MANAGEMENT
// ============================================================================

export const tickets = pgTable("tickets", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  customerId: uuid("customer_id").references(() => customers.id),
  busSeatId: uuid("bus_seat_id").references(() => busSeats.id).notNull(),
  status: ticketStatusEnum("status").default("active"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ticketReassignments = pgTable("ticket_reassignments", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").references(() => tickets.id),
  oldScheduleId: uuid("old_schedule_id").references(() => schedules.id),
  newScheduleId: uuid("new_schedule_id").references(() => schedules.id),
  reason: text("reason").notNull(),
  reassignedAt: timestamp("reassigned_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const ticketCancellations = pgTable("ticket_cancellations", {
  id: uuid("id").primaryKey().defaultRandom(),
  ticketId: uuid("ticket_id").references(() => tickets.id),
  reason: text("reason").notNull(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// PARCEL MANAGEMENT
// ============================================================================

export const parcels = pgTable("parcels", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  senderId: uuid("sender_id").references(() => customers.id),
  receiverId: uuid("receiver_id").references(() => customers.id),
  weight: numeric("weight").notNull(),
  dimensions: jsonb("dimensions"),
  declaredValue: numeric("declared_value").notNull(),
  status: parcelStatusEnum("status").default("received"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const parcelStatusUpdates = pgTable("parcel_status_updates", {
  id: uuid("id").primaryKey().defaultRandom(),
  parcelId: uuid("parcel_id").references(() => parcels.id),
  status: parcelStatusEnum("status").notNull(),
  updatedBy: uuid("updated_by").references(() => profiles.id),
  reason: text("reason"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// PAYMENT AND INVOICING
// ============================================================================

export const payments = pgTable("payments", {
  id: uuid("id").primaryKey().defaultRandom(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  method: paymentMethodEnum("method").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const paymentLines = pgTable("payment_lines", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => payments.id),
  ticketId: uuid("ticket_id").references(() => tickets.id),
  parcelId: uuid("parcel_id").references(() => parcels.id),
  description: text("description"),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").primaryKey().defaultRandom(),
  paymentId: uuid("payment_id").references(() => payments.id),
  invoiceNumber: text("invoice_number").unique().notNull(),
  taxInfo: jsonb("tax_info").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// OPERATIONAL LOGGING
// ============================================================================

export const busLogs = pgTable("bus_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  eventType: eventTypeEnum("event_type").notNull(),
  timestamp: timestamp("timestamp", { withTimezone: true })
    .defaultNow()
    .notNull(),
  locationId: uuid("location_id").references(() => locations.id),
  loggedBy: uuid("logged_by").references(() => profiles.id),
});

export const occupancyLogs = pgTable("occupancy_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  scheduleId: uuid("schedule_id").references(() => schedules.id),
  occupiedSeats: integer("occupied_seats").notNull(),
  recordedAt: timestamp("recorded_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const incidents = pgTable("incidents", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: incidentTypeEnum("type").notNull(),
  description: text("description").notNull(),
  reportedAt: timestamp("reported_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  reportedBy: uuid("reported_by").references(() => profiles.id),
});

// Bus Type Templates
export const busTypeTemplates = pgTable("bus_type_templates", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(), // e.g., "Double Decker Standard", "Luxury VIP"
  description: text("description"),
  totalCapacity: integer("total_capacity").notNull(),
  seatTemplateMatrix: jsonb("seat_template_matrix").notNull(), // Format: { firstFloor: string[][], secondFloor?: string[][] }
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Bus Fleet Management
export const buses = pgTable("buses", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id),
  templateId: uuid("template_id").references(() => busTypeTemplates.id).notNull(),
  plateNumber: text("plate_number").unique().notNull(),
  isActive: boolean("is_active").default(true),
  seatMatrix: jsonb("seat_matrix").notNull(),
  maintenanceStatus: maintenanceStatusEnum("maintenance_status_enum").default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Seat Tiers Configuration
export const seatTiers = pgTable("seat_tiers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id).notNull(),
  name: text("name").notNull(), // e.g., "VIP Front", "Regular Back"
  description: text("description"),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Bus Seat Configuration
export const busSeats = pgTable("bus_seats", {
  id: uuid("id").primaryKey().defaultRandom(),
  busId: uuid("bus_id").references(() => buses.id),
  seatNumber: text("seat_number").notNull(), // e.g., "1A", "2B", etc.
  tierId: uuid("tier_id").references(() => seatTiers.id).notNull(),
  status: seatStatusEnum("status").default("available"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Organizational Structure
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});
