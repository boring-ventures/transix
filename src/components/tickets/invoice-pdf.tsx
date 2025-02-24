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
    marginBottom: 20,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyInfo: {
    fontSize: 10,
    color: "#666",
    marginBottom: 3,
  },
  invoiceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  invoiceInfo: {
    marginBottom: 20,
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
  table: {
    marginTop: 20,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomStyle: "solid",
    borderBottomColor: "#000",
    paddingBottom: 5,
    marginBottom: 10,
  },
  tableHeaderCell: {
    flex: 1,
    fontSize: 11,
    fontWeight: 'bold',
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  tableCell: {
    flex: 1,
    fontSize: 10,
  },
  total: {
    marginTop: 20,
    borderTopWidth: 1,
    borderTopStyle: "solid",
    borderTopColor: "#000",
    paddingTop: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: "#666",
  },
});

interface InvoicePDFProps {
  invoiceData: {
    invoiceNumber: string;
    customerName: string;
    customerId: string;
    customerPhone?: string;
    customerEmail?: string;
    tickets: Array<{
      seatNumber: string;
      price: number;
    }>;
    totalAmount: number;
    date: string;
    route: string;
  };
}

export function InvoicePDF({ invoiceData }: InvoicePDFProps) {
  return (
    <PDFViewer style={{ width: "100%", height: "500px", border: "none" }}>
      <Document>
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <Text style={styles.companyName}>TRANS IMPERIAL POTOSÍ</Text>
            <Text style={styles.companyInfo}>NIT: 3678325014</Text>
            <Text style={styles.companyInfo}>Av. Ayacucho N° 333 Ed. Terminal de Buses Cochabamba</Text>
            <Text style={styles.companyInfo}>Cel: 78330342 - Cochabamba - Bolivia</Text>
          </View>

          <Text style={styles.invoiceTitle}>FACTURA</Text>

          <View style={styles.invoiceInfo}>
            <View style={styles.row}>
              <Text style={styles.label}>N° Factura:</Text>
              <Text style={styles.value}>{invoiceData.invoiceNumber}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Fecha:</Text>
              <Text style={styles.value}>{invoiceData.date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Cliente:</Text>
              <Text style={styles.value}>{invoiceData.customerName}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>NIT/CI:</Text>
              <Text style={styles.value}>{invoiceData.customerId}</Text>
            </View>
            {invoiceData.customerPhone && (
              <View style={styles.row}>
                <Text style={styles.label}>Teléfono:</Text>
                <Text style={styles.value}>{invoiceData.customerPhone}</Text>
              </View>
            )}
          </View>

          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableHeaderCell, { flex: 0.5 }]}>Cantidad</Text>
              <Text style={[styles.tableHeaderCell, { flex: 2 }]}>Descripción</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Precio Unit.</Text>
              <Text style={[styles.tableHeaderCell, { flex: 1 }]}>Subtotal</Text>
            </View>

            {invoiceData.tickets.map((ticket, index) => (
              <View key={index} style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 0.5 }]}>1</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>
                  Pasaje {invoiceData.route} - Asiento {ticket.seatNumber}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  Bs. {Number(ticket.price).toFixed(2)}
                </Text>
                <Text style={[styles.tableCell, { flex: 1 }]}>
                  Bs. {Number(ticket.price).toFixed(2)}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.total}>
            <View style={styles.row}>
              <Text style={styles.value}>Total a Pagar:</Text>
              <Text style={styles.value}>Bs. {Number(invoiceData.totalAmount).toFixed(2)}</Text>
            </View>
          </View>

          <View style={styles.footer}>
            <Text>ESTA FACTURA CONTRIBUYE AL DESARROLLO DEL PAÍS, EL USO ILÍCITO SERÁ SANCIONADO PENALMENTE</Text>
            <Text>Ley N° 453: "El proveedor debe brindar atención sin discriminación"</Text>
          </View>
        </Page>
      </Document>
    </PDFViewer>
  );
} 