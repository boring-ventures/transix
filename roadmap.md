# Land Logistics System - Project Overview and Development Roadmap

## **Project Overview**

This project focuses on building a comprehensive land logistics system to manage passenger transportation, parcel deliveries, and operational workflows for a company operating buses between cities. The system is designed to optimize branch activities, enhance customer experience, and centralize administrative control. 

### **System Features**
1. **Passenger Management**:
   - Ticket registration and issuance (physical sales only).
   - Reassignment of passengers between buses.
   - Ticket cancellations with reasons logged.
2. **Parcel Management**:
   - Parcel registration and status updates.
   - Automatic tariff calculations based on weight, dimensions, and destination.
   - Notifications to clients via SMS or email.
3. **User Roles and Management**:
   - Role-based system (Superadmin, Branch, Seller).
   - User account creation, editing, and deactivation.
   - Role-specific access to features.
4. **Operational Management**:
   - Creation and management of itineraries and schedules.
   - Terminal log synchronization.
   - Detailed occupancy control by route and schedule.
5. **Administrative Dashboard**:
   - Global and branch-specific metrics dashboards.
   - Exportable reports for sales and operations.
6. **Billing and Finance**:
   - Automated invoice generation for tickets and parcels.
   - Financial summaries by route, branch, and service.
   - Management of accounts receivable/payable.
7. **Analytics and Reporting**:
   - Real-time dashboards for operations and finances.
   - Identification of demand patterns and profitable routes.
   - Support for predictive analytics (future updates).
8. **Security**:
   - Role-based access and encrypted sensitive data.
   - Incident logging and resolution.

### **Tech Stack**
- **Frontend**: Next.js, ShadCN UI.
- **Backend**: Supabase (PostgreSQL), Supabase Auth.
- **Validation**: Zod.
- **Deployment**: Vercel.

### **Supabase Configuration**
- **URL**: `https://kpfxrvhvamzcpnyxlthm.supabase.co`
- **ANON KEY**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwZnhydmh2YW16Y3BueXhsdGhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM1NDMzNjEsImV4cCI6MjA0OTExOTM2MX0.lvJt1RWffsEQjRes05-LHVozaF_tL1oWfJeBd3yLrY0`

---

# **Development Roadmap**
## **System Features**

### **1. Passenger Management**

- **Ticket Registration and Issuance**:
    - Physical ticket purchases exclusively at branch points of sale.
    - Issuance of physical and optional digital tickets with QR or barcode.
- **Passenger Reassignment**:
    - Function to reassign passengers from one bus to another for operational reasons.
    - Detailed logging of reassignments, including date, time, and reasons.
- **Ticket Cancellation**:
    - Option for sellers to cancel sold tickets with the reason logged.

---

### **2. Parcel Management**

- **Shipment Registration**:
    - Sender and recipient details, description, weight, and declared value.
    - Generation of labels with QR or barcode.
- **Status Tracking**:
    - Manual updates of parcel shipment statuses (received, in transit, ready for pickup, delivered).
    - Notifications to clients via SMS, email, or WhatsApp for status updates.
- **Tariffs and Payments**:
    - Automatic tariff calculator based on weight, dimensions, and destination.

---

### **3. User Roles and Management**

- **System Roles**:
    - **Superadmin**: Full control over the system.
    - **Branch**: Management of specific operations.
    - **Branch Seller**: Recording sales and basic operations.
- **User Management**:
    - Creation, editing, and deactivation of accounts with defined roles.
- **Access Control**:
    - Role-based permissions to ensure each user accesses only allowed functionalities.

---

### **4. Operational Management**

- **Schedules and Routes**:
    - Creation and editing of itineraries per branch and terminal.
    - Integration with maps to visualize and plan optimal routes (no GPS tracking).
- **Occupancy Control**:
    - Detailed statistics of seat occupancy by route, schedule, and season.
    - Report generation to maximize operational efficiency.
- **Terminal Management**:
    - Logging of bus departures and arrivals at synchronized terminals.
    - Coordination of itineraries across multiple terminals.

---

### **5. Administrative Dashboard**

- **Superadmin Dashboard**:
    - Global metrics for all branches: sales, occupancy, parcels, and financial statistics.
- **Branch Dashboard**:
    - Detailed metrics for sales, bus occupancy, and parcel statistics.
    - Reports by seller and schedule.
- **Custom Reports**:
    - Sales by day, branch, route, and service.

---

### **6. Billing and Finance**

- **Automated Invoicing**:
    - Digital invoice generation for each transaction (tickets and parcels).
    - Management of local tax regulations as applicable.
- **Financial Reports**:
    - Detailed breakdown of sales by route, terminal, and service.
    - Revenue and operational cost tracking.
- **Accounts Receivable/Payable**:
    - Management of outstanding payments from clients or distributors.

---

### **7. Analytics and Reporting**

- **Real-Time Dashboards**:
    - Visualization of bus occupancy, parcel shipment statuses, and sales.
- **Data Analysis**:
    - Trends in demand by route, season, and schedule.
    - Identification of the most profitable routes or services.
- **Predictions** (future AI integration):
    - Pattern identification to adjust itineraries and services.

---

### **8. Security**

- **Access Control**:
    - Definition of roles and permissions for internal users.
- **Data Security**:
    - Encryption of sensitive data such as user and transaction details.
    - Compliance with local regulations like GDPR if applicable.
- **Incident Tracking**:
    - Logging and resolution of complaints, accidents, and operational delays.
- **Information Synchronization**:
    - Real-time synchronization across multiple terminals and branches.

---

## **Updated Tech Stack**

### **Frontend**:

- **Next.js**: Development of fast and scalable applications.
- **ShadCN UI**: Predefined and customizable UI components.

### **Backend and Database**:

- **Supabase**: Relational database with PostgreSQL, authentication, and storage.
- **Supabase Auth**: For role-based authentication management.

### **Validation**:

- **Zod**: Validation of data and schemas in the frontend and backend.

### **Deployment**:

- **Vercel**: Continuous hosting and deployment for applications built on Next.js.