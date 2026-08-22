import "server-only";

import { degrees, PDFDocument, rgb, StandardFonts } from "pdf-lib";

type GuideLicense = {
  email: string;
  orderReference: string;
};

export async function createLicensedGuidePdf(
  sourceBytes: Uint8Array,
  license: GuideLicense,
) {
  const pdf = await PDFDocument.load(sourceBytes);
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
  const email = license.email.toLowerCase();
  const orderReference = license.orderReference.slice(-12);
  const centerText = `LICENSED TO ${email.toUpperCase()}`;
  const footerText = `Personal-use copy for ${email} | Order ${orderReference} | Redistribution prohibited`;

  pdf.setSubject(`Personal-use license for ${email}`);
  pdf.setProducer("Twigthetics protected guide delivery");

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const centerSize = Math.min(26, Math.max(15, width / 24));
    const centerWidth = boldFont.widthOfTextAtSize(centerText, centerSize);
    const footerSize = Math.min(7.5, Math.max(6, width / 85));
    const footerWidth = font.widthOfTextAtSize(footerText, footerSize);

    page.drawText(centerText, {
      x: Math.max(20, (width - centerWidth) / 2),
      y: height * 0.47,
      size: centerSize,
      font: boldFont,
      color: rgb(0.12, 0.18, 0.12),
      opacity: 0.055,
      rotate: degrees(28),
    });

    page.drawRectangle({
      x: 0,
      y: 0,
      width,
      height: 19,
      color: rgb(0.95, 0.92, 0.86),
      opacity: 0.96,
    });
    page.drawText(footerText, {
      x: Math.max(10, (width - footerWidth) / 2),
      y: 6,
      size: footerSize,
      font,
      color: rgb(0.2, 0.18, 0.15),
      opacity: 0.82,
    });
  }

  return pdf.save();
}
