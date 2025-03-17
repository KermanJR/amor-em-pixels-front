import { Document, Page, Text, View, Image, StyleSheet, Font } from '@react-pdf/renderer';

// Registrar fontes personalizadas para um toque mais romântico
Font.register({
  family: 'GreatVibes',
  src: 'https://fonts.gstatic.com/s/greatvibes/v13/RWmMoKWR9v4ksMfaWdXbfjEewYC.woff2',
});
Font.register({
  family: 'PlayfairDisplay',
  src: 'https://fonts.gstatic.com/s/playfairdisplay/v36/nuFiD-vYSZviVYUb_rj3ij__anPXDTzYgEM.woff2',
});

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFF5F5', // Fundo rosa bem claro
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  backgroundHearts: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.1, // Corações sutis no fundo
  },
  container: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    borderRadius: 15,
    border: '2px solid #FECACA', // Borda rosa suave
    maxWidth: 550,
    textAlign: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  title: {
    fontSize: 36,
    marginBottom: 15,
    textAlign: 'center',
    color: '#BE123C', // Rosa escuro romântico
    fontFamily: 'GreatVibes', // Fonte cursiva elegante
    letterSpacing: 1.5,
  },
  date: {
    fontSize: 18,
    marginBottom: 25,
    textAlign: 'center',
    color: '#9F1239', // Tom complementar ao título
    fontFamily: 'PlayfairDisplay',
    fontStyle: 'italic',
  },
  messageContainer: {
    backgroundColor: '#FFF1F2', // Fundo rosa claro para a mensagem
    padding: 20,
    borderRadius: 10,
    border: '1px dashed #FECACA', // Borda tracejada romântica
    marginBottom: 30,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    maxWidth: 450,
    color: '#4B1C2D', // Tom escuro suave
    fontFamily: 'PlayfairDisplay',
    lineHeight: 1.6,
  },
  qrCodeContainer: {
    padding: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    border: '2px solid #FECACA',
    marginBottom: 20,
  },
  qrCode: {
    width: 180,
    height: 180,
  },
  footer: {
    fontSize: 12,
    textAlign: 'center',
    color: '#BE123C',
    fontFamily: 'PlayfairDisplay',
    fontStyle: 'italic',
  },
  heartDecoration: {
    position: 'absolute',
    color: '#FECACA',
    fontSize: 24,
    fontFamily: 'Helvetica',
  },
});

interface QrCodePdfProps {
  coupleName: string;
  specialDate: string;
  message: string;
  qrCodeUrl: string;
}

const QrCodePdf = ({ coupleName, specialDate, message, qrCodeUrl }: QrCodePdfProps) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Corações sutis no fundo */}
      <View style={styles.backgroundHearts}>
        {[...Array(10)].map((_, i) => (
          <Text
            key={i}
            style={{
              position: 'absolute',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              fontSize: 30 + Math.random() * 20,
              color: '#FECACA',
              opacity: 0.3,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          >
            ♥
          </Text>
        ))}
      </View>

      <View style={styles.container}>
        {/* Corações decorativos nos cantos */}
        <Text style={[styles.heartDecoration, { top: -10, left: -10 }]}>♥</Text>
        <Text style={[styles.heartDecoration, { top: -10, right: -10 }]}>♥</Text>
        <Text style={[styles.heartDecoration, { bottom: -10, left: -10 }]}>♥</Text>
        <Text style={[styles.heartDecoration, { bottom: -10, right: -10 }]}>♥</Text>

        <Text style={styles.title}>{coupleName}</Text>
        <Text style={styles.date}>{specialDate}</Text>

        <View style={styles.messageContainer}>
          <Text style={styles.message}>"{message}"</Text>
        </View>

        <View style={styles.qrCodeContainer}>
          <Image style={styles.qrCode} src={qrCodeUrl} />
        </View>

        <Text style={styles.footer}>
          Escaneie o QR Code para reviver nosso amor em cada detalhe
        </Text>
      </View>
    </Page>
  </Document>
);

export default QrCodePdf;