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
    padding: 20,
    fontSize: 12,
  },
  ticketContainer: {
    borderWidth: 1,
    borderStyle: "solid",
    borderColor: "#000",
    padding: 10,
    margin: 10,
  },
  header: {
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#000",
    paddingBottom: 10,
    marginBottom: 10,
  },
  companyName: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    textAlign: 'center',
    color: "#666",
    marginBottom: 5,
  },
  ticketInfo: {
    marginTop: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  label: {
    fontSize: 10,
    color: "#666",
  },
  value: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  seatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  },
  footer: {
    marginTop: 10,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#000",
    paddingTop: 10,
    fontSize: 8,
    color: "#666",
    textAlign: 'center',
  },
});

interface TicketPDFProps {
  ticket: {
    seatNumber: string;
    passengerName: string;
    documentId: string;
    price: number;
  };
  schedule: {
    departureDate: string;
    departureTime: string;
    route: string;
  };
  reservationId: string;
}

export function TicketPDF({ ticket, schedule, reservationId }: TicketPDFProps) {
  return (
    <PDFViewer style={{ width: "100%", height: "500px", border: "none" }}>
      <Document>
        <Page size={[300, 400]} style={styles.page}>
          <View style={styles.ticketContainer}>
            <View style={styles.header}>
              <Text style={styles.companyName}>TRANS IMPERIAL POTOSÍ</Text>
              <Text style={styles.companyInfo}>NIT: 3678325014</Text>
              <Text style={styles.companyInfo}>Av. Ayacucho N° 333 Ed. Terminal de Buses Cochabamba</Text>
            </View>

            <View style={styles.ticketInfo}>
              <View style={styles.row}>
                <Text style={styles.label}>Reserva:</Text>
                <Text style={styles.value}>{reservationId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Ruta:</Text>
                <Text style={styles.value}>{schedule.route}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Fecha:</Text>
                <Text style={styles.value}>{schedule.departureDate}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Hora:</Text>
                <Text style={styles.value}>{schedule.departureTime}</Text>
              </View>
            </View>

            <Text style={styles.seatNumber}>Asiento {ticket.seatNumber}</Text>

            <View style={styles.ticketInfo}>
              <View style={styles.row}>
                <Text style={styles.label}>Pasajero:</Text>
                <Text style={styles.value}>{ticket.passengerName}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>CI/NIT:</Text>
                <Text style={styles.value}>{ticket.documentId}</Text>
              </View>
              <View style={styles.row}>
                <Text style={styles.label}>Precio:</Text>
                <Text style={styles.value}>Bs. {Number(ticket.price).toFixed(2)}</Text>
              </View>
            </View>

            <View style={styles.footer}>
              <Text>Este boleto es válido solo para la fecha y hora indicadas</Text>
              <Text>Presentar documento de identidad al abordar</Text>
            </View>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
} 