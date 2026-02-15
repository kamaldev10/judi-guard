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
    // Limit baris agar tidak error pagination di awal
    if (index > 100) return;

    const y = doc.y;

    // Warna Risk
    if (c.riskLevel === "HIGH") doc.fillColor("red");
    else if (c.riskLevel === "MEDIUM") doc.fillColor("orange");
    else doc.fillColor("black");

    doc.text(c.riskLevel || "-", 50, y); // Tambah fallback "-"
    doc.fillColor("black");

    // --- PERBAIKAN DISINI (SAFE SUBSTRING) ---
    // Pastikan data ada sebelum di-substring. Jika null, ganti string kosong ""
    const authorName = c.commentAuthorDisplayName || "Unknown";
    const commentText = c.commentTextDisplay || "";
    const action = c.actionTaken || "-";

    doc.text(authorName.substring(0, 20), 100, y);
    doc.text(action, 250, y);

    doc.text(commentText.substring(0, 40) + "...", 350, y, {
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
/**
 * GENERATOR LAPORAN PERIODE (Fixed Layout & Logic)
 */
const generatePeriodReport = (reportData, res) => {
  const doc = new PDFDocument({ margin: 50, size: "A4" });

  doc.pipe(res);

  // --- 1. HEADER HALAMAN ---
  doc
    .fontSize(18)
    .font("Helvetica-Bold")
    .text("LAPORAN DETAIL SPAM JUDI GUARD", { align: "center" });

  doc.moveDown(0.5);
  doc
    .fontSize(10)
    .font("Helvetica")
    .text(
      `Periode: ${new Date(reportData.period.start).toLocaleDateString("id-ID")} - ${new Date(reportData.period.end).toLocaleDateString("id-ID")}`,
      { align: "center" },
    );

  doc.moveDown(2);

  // --- 2. SUMMARY BOX ---
  const summaryY = doc.y;
  doc.rect(50, summaryY, 495, 35).fill("#f3f4f6");

  doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold");
  const summaryText = `Total Video: ${reportData.summary.totalVideos}  |  Total Spam Terdeteksi: ${reportData.summary.totalSpam}`;

  doc.text(summaryText, 50, summaryY + 12, {
    width: 495,
    align: "center",
  });

  doc.moveDown(3);

  // --- 3. LOOPING PER VIDEO ---

  reportData.details.forEach((video) => {
    // A. Cek Page Break (Estimasi header butuh 60pt)
    if (doc.y > 720) doc.addPage();

    const isClean = video.totalSpamDetected === 0;

    // B. Header Per Video
    // Warna: Hijau jika bersih, Merah jika ada spam
    const headerColor = isClean ? "#dcfce7" : "#fee2e2";
    const textColor = isClean ? "#166534" : "#991b1b";

    const currentHeaderY = doc.y;
    doc.rect(50, currentHeaderY, 495, 25).fill(headerColor);

    // Judul Video (Truncate jika kepanjangan)
    doc.fillColor(textColor).fontSize(10).font("Helvetica-Bold");
    const safeTitle =
      (video.videoTitle || "Unknown").length > 60
        ? (video.videoTitle || "").substring(0, 57) + "..."
        : video.videoTitle || "";

    doc.text(`Video: ${safeTitle}`, 60, currentHeaderY + 8);

    // Info Kanan
    const dateStr = new Date(video.requestedAt).toLocaleDateString("id-ID");
    const spamInfo = `${video.totalSpamDetected} Spam`;

    doc.font("Helvetica");
    doc.text(`${dateStr} | ${spamInfo}`, 340, currentHeaderY + 8, {
      width: 190,
      align: "right",
    });

    // Pindah kursor ke bawah header
    doc.y = currentHeaderY + 35;

    // C. KONTEN (Tabel Spam atau Info Bersih)
    if (!isClean && video.spamComments && video.spamComments.length > 0) {
      // --- RENDER TABEL ---
      const startX = 50;
      // Definisi Lebar Kolom
      const colWidth = { author: 100, text: 280, status: 80 };
      // Definisi Posisi X Kolom
      const colX = {
        author: startX + 5,
        text: startX + 115,
        status: startX + 405,
      };

      // Header Tabel
      const tableHeaderY = doc.y;
      doc.fontSize(8).font("Helvetica-Bold").fillColor("#374151");
      doc.text("Author", colX.author, tableHeaderY);
      doc.text("Isi Komentar", colX.text, tableHeaderY);
      doc.text("Status", colX.status, tableHeaderY);

      // Garis Header
      doc
        .moveTo(50, tableHeaderY + 12)
        .lineTo(545, tableHeaderY + 12)
        .strokeColor("#d1d5db")
        .stroke();

      doc.y = tableHeaderY + 20; // Mulai baris data

      // Baris Data
      doc.font("Helvetica").fillColor("#4b5563");

      video.spamComments.forEach((comment) => {
        const authorName = (
          comment.commentAuthorDisplayName || "Unknown"
        ).substring(0, 25);
        // Hapus enter pada komentar agar layout tidak rusak
        const rawText = (comment.commentTextDisplay || "").replace(/\n/g, " ");

        let actionLabel = "BELUM AKSI";
        if (comment.actionTaken === "DELETE") actionLabel = "DIHAPUS";
        else if (comment.actionTaken === "HOLD") actionLabel = "DITAHAN";

        // --- HITUNG TINGGI BARIS DINAMIS (Kunci perbaikan "Berserak") ---
        // Hitung berapa tinggi teks jika dibungkus dalam lebar 280px
        const textHeight = doc.heightOfString(rawText, {
          width: colWidth.text,
        });
        // Tinggi baris = tinggi teks + padding minimal (misal 15)
        const rowHeight = Math.max(textHeight, 15) + 10;

        // Cek Page Break di tengah tabel
        if (doc.y + rowHeight > 750) {
          doc.addPage();
          doc
            .fontSize(8)
            .font("Helvetica-Bold")
            .text("(Lanjutan Tabel...)", 50, 50);
          doc.y = 70;
        }

        const rowY = doc.y;

        // Cetak Kolom
        doc.text(authorName, colX.author, rowY, { width: colWidth.author });
        doc.text(rawText, colX.text, rowY, {
          width: colWidth.text,
          align: "left",
        });
        doc.text(actionLabel, colX.status, rowY);

        // Update Y manual berdasarkan tinggi baris yang sudah dihitung
        doc.y = rowY + rowHeight;
      });

      // Info jika terpotong limit
      if (video.totalSpamDetected > video.spamComments.length) {
        doc.font("Helvetica-Oblique").fontSize(8).fillColor("#6b7280");
        doc.text(
          `... dan ${video.totalSpamDetected - video.spamComments.length} komentar lainnya tidak ditampilkan.`,
          60,
          doc.y,
        );
        doc.moveDown();
      }
    } else if (isClean) {
      // --- JIKA BERSIH ---
      doc.fontSize(9).font("Helvetica-Oblique").fillColor("#166534");
      doc.text("✓ Tidak ditemukan aktivitas spam pada video ini.", 60, doc.y);
      doc.moveDown(); // Tambah jarak sedikit
    }

    doc.moveDown(1.5); // Jarak antar Video
  });

  // Footer
  const bottom = doc.page.height - 50;
  doc
    .fontSize(8)
    .fillColor("grey")
    .text("Dicetak oleh Judi Guard Automated System", 50, bottom, {
      align: "center",
    });

  doc.end();
};

module.exports = { generateModerationReport, generatePeriodReport };
