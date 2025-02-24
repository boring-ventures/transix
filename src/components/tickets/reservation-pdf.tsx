import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 12,
  },
  header: {
    marginBottom: 30,
    borderBottom: 1,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    marginBottom: 15,
    textAlign: 'center',
  },
  reservationId: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
    borderBottom: 1,
    paddingBottom: 5,
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 15,
  },
  gridItem: {
    width: "50%",
    marginBottom: 10,
  },
  label: {
    fontSize: 11,
    color: "#666",
    marginBottom: 2,
  },
  value: {
    fontSize: 13,
    fontWeight: 'bold',
  },
  ticketHeader: {
    backgroundColor: "#f3f4f6",
    padding: 10,
    flexDirection: "row",
    marginBottom: 8,
  },
  ticket: {
    padding: 10,
    borderBottom: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
    minHeight: 30,
  },
  ticketCol: {
    flex: 1,
    justifyContent: 'center',
  },
  total: {
    marginTop: 15,
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
  },
  totalText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

interface ReservationPDFProps {
  reservation: {
    reservationId: string;
    tickets: Array<{
      seatNumber: string;
      passengerName: string;
      documentId: string;
      price: number;
    }>;
    totalAmount: number;
    schedule: {
      departureDate: string;
      departureTime: string;
      route: string;
    };
    purchaseTime?: string;
  };
}

export function ReservationPDF({ reservation }: ReservationPDFProps) {
  return (
    <PDFViewer style={{ width: "100%", height: "800px", border: "none" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.title}>Confirmación de Reserva</Text>
            <Text style={styles.reservationId}>
              Reserva #{reservation.reservationId}
            </Text>
            {reservation.purchaseTime && (
              <Text style={styles.reservationId}>
                Hora de Compra: {reservation.purchaseTime}
              </Text>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Detalles del Viaje</Text>
            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Ruta</Text>
                <Text style={styles.value}>{reservation.schedule.route}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Fecha de Salida</Text>
                <Text style={styles.value}>
                  {reservation.schedule.departureDate}
                </Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>Hora de Salida</Text>
                <Text style={styles.value}>
                  {reservation.schedule.departureTime}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tickets</Text>
            <View style={styles.ticketHeader}>
              <Text style={[styles.ticketCol, { fontSize: 11 }]}>Asiento</Text>
              <Text style={[styles.ticketCol, { fontSize: 11 }]}>Pasajero</Text>
              <Text style={[styles.ticketCol, { fontSize: 11 }]}>Documento</Text>
              <Text style={[styles.ticketCol, { fontSize: 11 }]}>Categoría</Text>
              <Text style={[styles.ticketCol, { fontSize: 11 }]}>Precio</Text>
            </View>
            {reservation.tickets.map((ticket) => (
              <View key={ticket.seatNumber} style={styles.ticket}>
                <Text style={styles.ticketCol}>{ticket.seatNumber}</Text>
                <Text style={styles.ticketCol}>{ticket.passengerName}</Text>
                <Text style={styles.ticketCol}>{ticket.documentId}</Text>
                <Text style={styles.ticketCol}>
                  {!isNaN(Number(ticket.seatNumber))
                    ? Number(ticket.seatNumber) <= 4
                      ? "VIP"
                      : Number(ticket.seatNumber) <= 8
                      ? "Ejecutivo"
                      : "Económico"
                    : "Económico"}
                </Text>
                <Text style={styles.ticketCol}>${ticket.price}</Text>
              </View>
            ))}
            <View style={styles.total}>
              <Text style={styles.totalText}>Total</Text>
              <Text style={styles.totalText}>
                ${reservation.totalAmount}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
} 