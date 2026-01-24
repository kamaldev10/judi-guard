const PDFDocument = require("pdfkit");

const generateModerationReport = (analysisData, comments, res) => {
  const doc = new PDFDocument({ margin: 50 });

  // 1. Setup Stream ke Response
  doc.pipe(res);

  // 2. Header Laporan
  doc.fontSize(20).text("LAPORAN MODERASI JUDI GUARD", { align: "center" });
  doc.moveDown();
  doc.fontSize(10).text(`Generated at: ${new Date().toLocaleString("id-ID")}`, {
    align: "center",
  });
  doc.moveDown();

  // 3. Informasi Video
  doc.fontSize(12).font("Helvetica-Bold").text("INFORMASI VIDEO");
  doc.font("Helvetica").fontSize(10);
  doc.text(`Judul Video : ${analysisData.videoTitle}`);
  doc.text(`Video ID    : ${analysisData.youtubeVideoId}`);
  doc.text(`Status      : ${analysisData.moderationStatus}`);
  doc.moveDown();

  // 4. Statistik
  doc.fontSize(12).font("Helvetica-Bold").text("STATISTIK");
  doc.font("Helvetica").fontSize(10);
  doc.text(`Total Komentar Dianalisis : ${analysisData.totalCommentsAnalyzed}`);
  doc.text(`Total Spam Terdeteksi     : ${analysisData.totalSpamDetected}`);
  doc.text(
    `Sukses Dihapus            : ${analysisData.lastBatchDeletionSuccessCount || 0}`,
  );
  doc.moveDown();

  // 5. Daftar Spam (Limit 50 item agar tidak terlalu panjang, atau unlimited)
  doc
    .fontSize(12)
    .font("Helvetica-Bold")
    .text("DAFTAR KOMENTAR SPAM (Preview)");
  doc.moveDown();

  // Header Tabel Sederhana
  const startY = doc.y;
  doc.fontSize(10).font("Helvetica-Bold");
  doc.text("Risk", 50, startY);
  doc.text("Author", 100, startY);
  doc.text("Status", 250, startY);
  doc.text("Isi Komentar", 350, startY);
  doc.moveDown();
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke(); // Garis
  doc.moveDown(0.5);

  // Isi Tabel
  doc.font("Helvetica").fontSize(9);

  comments.forEach((c, index) => {
    // Agar PDF tidak crash kalau terlalu banyak, kita limit misal 100 baris
    if (index > 100) return;

    const y = doc.y;

    // Warna Risk
    if (c.riskLevel === "HIGH") doc.fillColor("red");
    else if (c.riskLevel === "MEDIUM") doc.fillColor("orange");
    else doc.fillColor("black");

    doc.text(c.riskLevel, 50, y);
    doc.fillColor("black"); // Reset warna

    doc.text(c.commentAuthorDisplayName.substring(0, 20), 100, y);
    doc.text(c.actionTaken, 250, y);
    // Potong teks komentar agar rapi
    doc.text(c.commentTextDisplay.substring(0, 40) + "...", 350, y, {
      width: 200,
    });

    doc.moveDown(0.5);
  });

  if (comments.length > 100) {
    doc.moveDown();
    doc.text(`... dan ${comments.length - 100} komentar lainnya.`, {
      align: "center",
      color: "grey",
    });
  }

  // 6. Footer
  doc.moveDown(2);
  doc
    .fontSize(8)
    .text("Judi Guard Automated Report System", { align: "center" });

  // Finalize PDF
  doc.end();
};

module.exports = { generateModerationReport };
