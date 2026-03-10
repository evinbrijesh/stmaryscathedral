import jsPDF from "jspdf";

export function generateTablePdf({ title, columns, rows, fileName }) {
  // Landscape A4 to better fit wide tables
  const doc = new jsPDF("l", "mm", "a4");

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  let y = 20; // vertical cursor

  // Header: church name and title
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(
    "ST MARY'S JACOBITE SYRIAN CATHEDRAL, PALLIKARA",
    pageWidth / 2,
    y,
    { align: "center" }
  );

  y += 8;
  doc.setFontSize(12);
  doc.text(title, pageWidth / 2, y, { align: "center" });

  // Date line
  y += 8;
  const today = new Date().toLocaleDateString("en-GB");
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Date: ${today}`, 15, y);

  // Table layout
  const marginLeft = 10;
  const marginRight = 10;
  const marginTop = y + 10;
  const marginBottom = 20;

  const usableWidth = pageWidth - marginLeft - marginRight;

  // Support optional per-column width weights via `col.width`
  const weights = columns.map((col) => {
    const w = typeof col.width === "number" && col.width > 0 ? col.width : 1;
    return w;
  });
  const totalWeight = weights.reduce((sum, w) => sum + w, 0) || 1;
  const colWidths = weights.map((w) => (usableWidth * w) / totalWeight);

  let currentY = marginTop;

  const drawHeaderRow = () => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);

    const headerData = [];
    let headerMaxHeight = 0;

    // First pass: measure text and heights
    columns.forEach((col, index) => {
      const width = colWidths[index];
      const headerText = String(col.header ?? "");
      const lines = doc.splitTextToSize(headerText, width - 4);
      const height = lines.length * 4 + 4; // 4mm per line + padding
      headerData[index] = { lines, height };
      headerMaxHeight = Math.max(headerMaxHeight, height);
    });

    // Second pass: draw cells
    let x = marginLeft;
    columns.forEach((col, index) => {
      const width = colWidths[index];
      const { lines } = headerData[index];
      doc.rect(x, currentY, width, headerMaxHeight);
      if (lines.length) {
        doc.text(lines, x + 2, currentY + 3);
      }
      x += width;
    });

    return headerMaxHeight;
  };

  const ensurePage = () => {
    if (currentY > pageHeight - marginBottom) {
      doc.addPage();
      currentY = marginTop;
      const headerHeight = drawHeaderRow();
      currentY += headerHeight;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
    }
  };

  // Draw header row on first page
  const firstHeaderHeight = drawHeaderRow();
  currentY += firstHeaderHeight;

  // Draw body rows with borders and auto height
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);

  rows.forEach((row) => {
    ensurePage();

    // Measure row height based on tallest cell
    const cellLinesPerColumn = [];
    let rowHeight = 0;

    columns.forEach((col, index) => {
      const width = colWidths[index];
      const raw = row[col.key];
      const cellText = raw == null ? "" : String(raw);
      const lines = doc.splitTextToSize(cellText, width - 4);
      cellLinesPerColumn[index] = lines;
      const height = lines.length * 4 + 4;
      rowHeight = Math.max(rowHeight, height);
    });

    // Draw rects + text for the row
    let x = marginLeft;
    columns.forEach((col, index) => {
      const width = colWidths[index];
      const lines = cellLinesPerColumn[index];
      doc.rect(x, currentY, width, rowHeight);
      if (lines.length) {
        doc.text(lines, x + 2, currentY + 3);
      }
      x += width;
    });

    currentY += rowHeight;
  });

  doc.save(fileName || "report.pdf");
}

// --- Single-record certificates (portrait A4) ---

function createCertificateDoc(title) {
  const doc = new jsPDF("p", "mm", "a4");
  const pageWidth = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(
    "ST MARY'S JACOBITE SYRIAN CATHEDRAL, PALLIKARA",
    pageWidth / 2,
    20,
    { align: "center" }
  );

  doc.setFontSize(18);
  doc.text(title, pageWidth / 2, 35, { align: "center" });

  return { doc, pageWidth };
}

function drawFieldRow(doc, options) {
  const {
    label,
    value,
    y,
    labelX,
    valueX,
    labelWidth,
    valueWidth,
    lineHeight = 6,
  } = options;

  const labelText = `${label}`;
  const valueText = value == null ? "" : Array.isArray(value) ? value.join(" ") : String(value);

  doc.setFont("helvetica", "bold");
  const labelLines = doc.splitTextToSize(labelText, labelWidth);
  doc.setFont("helvetica", "normal");
  const valueLines = doc.splitTextToSize(valueText, valueWidth);

  const lineCount = Math.max(labelLines.length, valueLines.length, 1);
  const rowHeight = lineCount * lineHeight;

  // Draw label lines
  doc.setFont("helvetica", "bold");
  labelLines.forEach((line, index) => {
    doc.text(line, labelX, y + index * lineHeight);
  });

  // Draw value lines
  doc.setFont("helvetica", "normal");
  valueLines.forEach((line, index) => {
    doc.text(line, valueX, y + index * lineHeight);
  });

  return rowHeight;
}

export function generateDeathCertificatePdf(record) {
  const { doc, pageWidth } = createCertificateDoc("Death Certificate");

  let y = 55;
  const labelX = 25;
  const valueX = 95;
  const labelWidth = 65;
  const valueWidth = pageWidth - valueX - 20;
  const lineHeight = 6;

  const regNo = record.reg_no || "";
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "";

  const field = (label, value) => {
    y += drawFieldRow(doc, { label, value, y, labelX, valueX, labelWidth, valueWidth, lineHeight }) + 2;
  };

  field("Reg. No.:", regNo);
  field("Name:", record.name);
  field("Age:", record.age ? `${record.age} years` : "");
  field("House Name:", record.house_name);
  field("Address:", record.address_place);
  field("Husband's / Father's Name:", record.father_husband_name);
  field("Date of Demise:", formatDate(record.death_date));
  field("Cause of Death:", record.cause_of_death);
  field("Date of Funeral:", formatDate(record.burial_date));
  field("Funeral Conducted by:", record.conducted_by);
  y += 8;

  const certText = "Certified that the above information is the true extract taken from the records maintained at the Church.";
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(certText, pageWidth - 40);
  doc.text(lines, 20, y);
  y += lines.length * 6 + 10;

  const today = new Date().toLocaleDateString("en-GB");
  doc.text(`Date: ${today}`, 20, y);
  doc.text("Vicar", pageWidth - 40, y + 20);

  doc.save(`death_certificate_${regNo || record.name || "record"}.pdf`);
}

export function generateBaptismCertificatePdf(record) {
  const { doc, pageWidth } = createCertificateDoc("Baptism Certificate");

  let y = 55;
  const labelX = 25;
  const valueX = 115;
  const labelWidth = 85;
  const valueWidth = pageWidth - valueX - 20;
  const lineHeight = 6;

  const regNo = record.reg_no || "";
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "";

  const field = (label, value) => {
    y += drawFieldRow(doc, { label, value, y, labelX, valueX, labelWidth, valueWidth, lineHeight }) + 2;
  };

  // Certificate order (matching physical certificate)
  field("Reg. No.:", regNo);
  field("Baptism Name of Child:", record.bapt_name);
  field("Name of Child (Official):", record.member_name);
  field("Address:", record.address);
  field("Gender:", record.gender);
  field("Father's Name:", record.father_name);
  field("Mother's Name:", record.mother_name);
  field("Date of Birth:", formatDate(record.member_dob));
  field("Date of Baptism:", formatDate(record.date_of_baptism));
  field("Godfather/Godmother:", record.godparent_name);
  field("Address of Godparent:", record.godparent_house_name);
  field("Church where Baptized:", record.church_where_baptised);
  field("Baptised By:", record.baptised_by);
  y += 8;

  const certText = "Certified that the above information is the true extract taken from the baptism register maintained at the Church.";
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(certText, pageWidth - 40);
  doc.text(lines, 20, y);
  y += lines.length * 6 + 10;

  const today = new Date().toLocaleDateString("en-GB");
  doc.text(`Date: ${today}`, 20, y);
  doc.text("Vicar", pageWidth - 40, y + 20);

  doc.save(`baptism_certificate_${regNo || record.member_name || "record"}.pdf`);
}

export function generateMarriageCertificatePdf(record) {
  const { doc, pageWidth } = createCertificateDoc("Marriage Certificate");

  let y = 55;
  const labelX = 25;
  const valueX = 95;
  const labelWidth = 65;
  const valueWidth = pageWidth - valueX - 20;
  const lineHeight = 6;

  const regNo = record.reg_no || "";
  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-GB") : "";

  const field = (label, value) => {
    y += drawFieldRow(doc, { label, value, y, labelX, valueX, labelWidth, valueWidth, lineHeight }) + 2;
  };

  field("Reg. No.:", regNo);
  y += 2;

  // ---- Groom Section ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Groom", labelX, y);
  y += 8;
  doc.setFontSize(11);

  field("Name:", record.spouse1_name);
  field("Address:", record.spouse1_address);
  field("City & District:", record.spouse1_city_district);
  field("State & Country:", record.spouse1_state_country);
  field("Father's Name:", record.spouse1_father_name);
  field("Mother's Name:", record.spouse1_mother_name);
  field("Name of Parish:", record.spouse1_home_parish);
  y += 4;

  // ---- Bride Section ----
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Bride", labelX, y);
  y += 8;
  doc.setFontSize(11);

  field("Name:", record.spouse2_name);
  field("Address:", record.spouse2_address);
  field("City & District:", record.spouse2_city_district);
  field("State & Country:", record.spouse2_state_country);
  field("Father's Name:", record.spouse2_father_name);
  field("Mother's Name:", record.spouse2_mother_name);
  field("Name of Parish:", record.spouse2_home_parish);
  y += 4;

  // ---- Marriage Details ----
  field("Date of Marriage:", formatDate(record.date));
  field("Place of Marriage:", record.place);
  field("Solemnized By:", record.solemnized_by);
  y += 8;

  const certText = "Certified that the above marriage was solemnised according to the rites of the Church and is a true extract taken from the marriage register maintained at the Church.";
  doc.setFont("helvetica", "normal");
  const lines = doc.splitTextToSize(certText, pageWidth - 40);
  doc.text(lines, 20, y);
  y += lines.length * 6 + 10;

  const today = new Date().toLocaleDateString("en-GB");
  doc.text(`Date: ${today}`, 20, y);
  doc.text("Vicar", pageWidth - 40, y + 20);

  doc.save(`marriage_certificate_${regNo || "record"}.pdf`);
}

