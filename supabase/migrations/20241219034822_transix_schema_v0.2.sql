-- Create ENUM types
CREATE TYPE parcel_status_enum AS ENUM ('received', 'in_transit', 'ready_for_pickup', 'delivered');
CREATE TYPE ticket_status_enum AS ENUM ('active', 'cancelled');
CREATE TYPE payment_method_enum AS ENUM ('cash', 'card', 'bank_transfer');
CREATE TYPE incident_type_enum AS ENUM ('complaint', 'delay', 'accident');
CREATE TYPE event_type_enum AS ENUM ('arrival', 'departure');

-- Create locations table
CREATE TABLE public.locations (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create customers table
CREATE TABLE public.customers (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name text NOT NULL,
    phone varchar,
    email varchar,
    document_id varchar,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Modify existing routes table
ALTER TABLE public.routes
    ADD COLUMN origin_id uuid REFERENCES public.locations(id),
    ADD COLUMN destination_id uuid REFERENCES public.locations(id);

-- Create schedules table
CREATE TABLE public.schedules (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id uuid REFERENCES public.routes(id),
    departure_date date NOT NULL,
    departure_time time NOT NULL,
    price numeric(10,2) NOT NULL,
    capacity integer NOT NULL DEFAULT 40,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create tickets table
CREATE TABLE public.tickets (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id uuid REFERENCES public.schedules(id),
    customer_id uuid REFERENCES public.customers(id),
    seat_number integer NOT NULL,
    status ticket_status_enum DEFAULT 'active',
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_seat_number CHECK (seat_number > 0)
);

-- Create ticket_reassignments table
CREATE TABLE public.ticket_reassignments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id uuid REFERENCES public.tickets(id),
    old_schedule_id uuid REFERENCES public.schedules(id),
    new_schedule_id uuid REFERENCES public.schedules(id),
    reason text NOT NULL,
    reassigned_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create parcels table
CREATE TABLE public.parcels (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id uuid REFERENCES public.schedules(id),
    sender_id uuid REFERENCES public.customers(id),
    receiver_id uuid REFERENCES public.customers(id),
    weight numeric NOT NULL,
    dimensions jsonb,
    declared_value numeric(10,2),
    status parcel_status_enum DEFAULT 'received',
    price numeric(10,2) NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payments table
CREATE TABLE public.payments (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    branch_id uuid REFERENCES public.branches(id),
    amount numeric(10,2) NOT NULL,
    method payment_method_enum NOT NULL,
    created_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create payment_lines table
CREATE TABLE public.payment_lines (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    payment_id uuid REFERENCES public.payments(id),
    ticket_id uuid REFERENCES public.tickets(id),
    parcel_id uuid REFERENCES public.parcels(id),
    description text,
    amount numeric(10,2) NOT NULL,
    CONSTRAINT valid_reference CHECK (
        (ticket_id IS NOT NULL AND parcel_id IS NULL) OR
        (ticket_id IS NULL AND parcel_id IS NOT NULL)
    )
);

-- Create bus_logs table
CREATE TABLE public.bus_logs (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    schedule_id uuid REFERENCES public.schedules(id),
    event_type event_type_enum NOT NULL,
    timestamp timestamptz DEFAULT timezone('utc'::text, now()) NOT NULL,
    location_id uuid REFERENCES public.locations(id),
    logged_by uuid REFERENCES public.profiles(id)
);

-- Add RLS policies
ALTER TABLE public.locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parcels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bus_logs ENABLE ROW LEVEL SECURITY;

-- Create indexes for better query performance
CREATE INDEX idx_tickets_schedule ON public.tickets(schedule_id);
CREATE INDEX idx_parcels_schedule ON public.parcels(schedule_id);
CREATE INDEX idx_schedules_route ON public.schedules(route_id);
CREATE INDEX idx_payment_lines_payment ON public.payment_lines(payment_id);
CREATE INDEX idx_bus_logs_schedule ON public.bus_logs(schedule_id); 