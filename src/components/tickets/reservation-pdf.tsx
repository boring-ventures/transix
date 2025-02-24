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
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
  },
  reservationId: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  grid: {
    display: "flex",
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  gridItem: {
    width: "50%",
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    color: "#666",
  },
  value: {
    fontSize: 12,
  },
  ticketHeader: {
    backgroundColor: "#f3f4f6",
    padding: 8,
    flexDirection: "row",
    marginBottom: 5,
  },
  ticket: {
    padding: 8,
    borderBottom: 1,
    borderColor: "#e5e7eb",
    flexDirection: "row",
  },
  ticketCol: {
    flex: 1,
  },
  total: {
    marginTop: 10,
    padding: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f3f4f6",
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
    <PDFViewer style={{ width: "100%", height: "600px" }}>
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
              <Text style={[styles.ticketCol, { fontSize: 10 }]}>Asiento</Text>
              <Text style={[styles.ticketCol, { fontSize: 10 }]}>Pasajero</Text>
              <Text style={[styles.ticketCol, { fontSize: 10 }]}>Documento</Text>
              <Text style={[styles.ticketCol, { fontSize: 10 }]}>Categoría</Text>
              <Text style={[styles.ticketCol, { fontSize: 10 }]}>Precio</Text>
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
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>Total</Text>
              <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                ${reservation.totalAmount}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
} 