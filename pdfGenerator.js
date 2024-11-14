import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function generatePDF(headerText, layoutSuggestion, data) {
  try {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Desenha o cabeçalho
    page.drawText(headerText, {
      x: 50,
      y: height - 50,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Aplica o layout dinâmico baseado no tipo de documento
    if (data.items && Array.isArray(data.items)) {
      let yPosition = height - 100;
      const lineHeight = 25;

      // Desenha cabeçalhos das colunas
      Object.keys(data.items[0]).forEach((key, index) => {
        page.drawText(key.toUpperCase(), {
          x: 50 + (index * 200),
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      yPosition -= lineHeight;

      // Desenha os dados
      data.items.forEach((item) => {
        Object.values(item).forEach((value, index) => {
          page.drawText(String(value), {
            x: 50 + (index * 200),
            y: yPosition,
            size: 11,
            font,
            color: rgb(0, 0, 0),
          });
        });
        yPosition -= lineHeight;
      });

      // Adiciona metadados se existirem
      if (data.metadata) {
        yPosition -= lineHeight;
        Object.entries(data.metadata).forEach(([key, value]) => {
          page.drawText(`${key}: ${value}`, {
            x: 50,
            y: yPosition,
            size: 10,
            font,
            color: rgb(0.5, 0.5, 0.5),
          });
          yPosition -= 20;
        });
      }
    }

    return await pdfDoc.save();
  } catch (error) {
    console.error('Erro na geração do PDF:', error);
    throw error;
  }
}