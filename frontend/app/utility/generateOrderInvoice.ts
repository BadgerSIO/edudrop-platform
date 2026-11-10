import autoTable from "jspdf-autotable";
import jsPDF from "jspdf";
import { IOrder } from "../types/Order";
import { IProductWithQuantity } from "../types/Product";
import { ISchool } from "../types/School";

export type InvoiceAudience = "donor" | "bursar" | "admin";

export interface GenerateInvoiceOptions {
  audience?: InvoiceAudience;
}

type RgbTuple = [number, number, number];

const FOREST: RgbTuple = [10, 60, 40];
const LIME: RgbTuple = [158, 240, 26];
const INK: RgbTuple = [15, 31, 24];
const BODY: RgbTuple = [74, 89, 82];
const ON_FOREST_MUTED: RgbTuple = [194, 214, 205];
const BENTO: RgbTuple = [244, 245, 246];
const ROW_ALT: RgbTuple = [249, 251, 250];
const BORDER: RgbTuple = [228, 232, 230];
const WHITE: RgbTuple = [255, 255, 255];

const EMERALD_BG: RgbTuple = [236, 253, 245];
const EMERALD_FG: RgbTuple = [6, 95, 70];
const SKY_BG: RgbTuple = [224, 242, 254];
const SKY_FG: RgbTuple = [3, 105, 161];
const PURPLE_BG: RgbTuple = [243, 232, 255];
const PURPLE_FG: RgbTuple = [107, 33, 168];
const AMBER_BG: RgbTuple = [254, 243, 199];
const AMBER_FG: RgbTuple = [146, 64, 14];

const formatCurrency = (value: number): string => {
  const safe = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safe);
};

const formatDateLabel = (rawDate?: string | Date | null, includeTime = true): string => {
  if (!rawDate) return "—";
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return String(rawDate);

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        }
      : {}),
  }).format(parsed);
};

const formatStatusBadge = (
  statusRaw: string,
  paid: boolean
): { label: string; bg: RgbTuple; fg: RgbTuple } => {
  const normalized = statusRaw.trim().toLowerCase();

  switch (normalized) {
    case "received":
      return { label: "Received", bg: EMERALD_BG, fg: EMERALD_FG };
    case "delivered":
      return { label: "Delivered", bg: EMERALD_BG, fg: EMERALD_FG };
    case "on the way":
      return { label: "On the Way", bg: PURPLE_BG, fg: PURPLE_FG };
    case "processing":
      return { label: "Processing", bg: SKY_BG, fg: SKY_FG };
    case "pending":
      return {
        label: paid ? "Confirmed" : "Pending",
        bg: paid ? EMERALD_BG : AMBER_BG,
        fg: paid ? EMERALD_FG : AMBER_FG,
      };
    default:
      return {
        label: statusRaw
          ? statusRaw.replace(/\b\w/g, (char) => char.toUpperCase())
          : "Processing",
        bg: BENTO,
        fg: INK,
      };
  }
};

/**
 * Draws the EduDrop on-dark geometric squircle mark natively in vector space
 * (matching BrandLogo SVG geometry at 40x40 viewBox proportions).
 */
const drawVectorBrandMark = (pdf: jsPDF, originX: number, originY: number, sizeMm: number) => {
  const scale = sizeMm / 40;
  const tx = (vx: number) => originX + vx * scale;
  const ty = (vy: number) => originY + vy * scale;

  // Electric Lime rounded squircle container
  pdf.setFillColor(...LIME);
  pdf.roundedRect(originX, originY, sizeMm, sizeMm, 11 * scale, 11 * scale, "F");

  // Forest Emerald smooth G1 teardrop curve
  pdf.setFillColor(...FOREST);
  pdf.moveTo(tx(20), ty(6.5));
  pdf.curveTo(tx(25.2), ty(12.2), tx(30.5), ty(19.2), tx(30.5), ty(24.5));
  pdf.curveTo(tx(30.5), ty(30.1), tx(25.8), ty(34.5), tx(20), ty(34.5));
  pdf.curveTo(tx(14.2), ty(34.5), tx(9.5), ty(30.1), tx(9.5), ty(24.5));
  pdf.curveTo(tx(9.5), ty(19.2), tx(14.8), ty(12.2), tx(20), ty(6.5));
  pdf.close();
  pdf.fill();

  // Crisp White open textbook wings inside droplet
  pdf.setFillColor(...WHITE);
  pdf.moveTo(tx(19.1), ty(22.6));
  pdf.lineTo(tx(13.6), ty(20.4));
  pdf.lineTo(tx(13.6), ty(26.9));
  pdf.lineTo(tx(19.1), ty(29.1));
  pdf.close();
  pdf.fill();

  pdf.moveTo(tx(20.9), ty(22.6));
  pdf.lineTo(tx(26.4), ty(20.4));
  pdf.lineTo(tx(26.4), ty(26.9));
  pdf.lineTo(tx(20.9), ty(29.1));
  pdf.close();
  pdf.fill();
};

const drawWrappedField = (
  pdf: jsPDF,
  x: number,
  y: number,
  maxWidth: number,
  text: string,
  lineHeight = 4.2
): number => {
  const lines = pdf.splitTextToSize(text || "—", maxWidth) as string[];
  pdf.text(lines, x, y);
  return y + lines.length * lineHeight;
};

export const generateOrderInvoice = (
  orderData: IOrder,
  options?: GenerateInvoiceOptions
) => {
  const audience: InvoiceAudience = options?.audience ?? "donor";
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const marginX = 14;
  const contentWidth = pageWidth - marginX * 2; // 182mm

  const orderNumber =
    orderData?.orderId ||
    (orderData?._id ? orderData._id.slice(-8).toUpperCase() : "ORD-PENDING");
  const txRef = orderData?.transactionId || "Confirmed via EduDrop";
  const issueDate = formatDateLabel(orderData?.createdAt || new Date());
  const isMonthly =
    orderData?.payMonthly === "yes" || (orderData as any)?.payMonthly === true;
  const nextCycle = orderData?.nextRecurringDate
    ? formatDateLabel(orderData.nextRecurringDate, false)
    : "";
  const paid = Boolean(orderData?.paymentStatus);
  const statusInfo = formatStatusBadge(
    String(orderData?.orderStatus || (paid ? "processing" : "pending")),
    paid
  );

  const schoolObj: Partial<ISchool> | undefined =
    typeof orderData?.schoolId === "object" && orderData.schoolId !== null
      ? (orderData.schoolId as Partial<ISchool>)
      : undefined;

  const schoolName = schoolObj?.name || "Verified Partner Campus";
  const schoolAddress = [
    schoolObj?.address?.street,
    schoolObj?.address?.city,
    schoolObj?.address?.state,
    schoolObj?.address?.zipCode,
  ]
    .filter(Boolean)
    .join(", ");
  const schoolPhone = schoolObj?.contactNo || "Campus Office On File";

  const sponsorName =
    [orderData?.name?.firstName, orderData?.name?.lastName]
      .filter(Boolean)
      .join(" ") || "EduDrop Sponsor";
  const donorLocation = [
    orderData?.city,
    orderData?.zipCode,
    orderData?.country,
  ]
    .filter(Boolean)
    .join(", ");

  const audienceMeta = {
    donor: {
      badge: "DONATION RECEIPT & INVOICE",
      filenamePrefix: "EduDrop_Donation_Invoice",
      totalHeading: "TOTAL SPONSORED",
    },
    bursar: {
      badge: "CAMPUS DELIVERY & SUPPLY RECEIPT",
      filenamePrefix: "EduDrop_Campus_Receipt",
      totalHeading: "SPONSORED VALUE",
    },
    admin: {
      badge: "OFFICIAL ORDER SETTLEMENT INVOICE",
      filenamePrefix: "EduDrop_Admin_Invoice",
      totalHeading: "TOTAL FUNDING",
    },
  }[audience];

  // =========================================================================
  // 1. FOREST EMERALD HEADER BANNER + VECTOR BRAND LOGO
  // =========================================================================
  pdf.setFillColor(...FOREST);
  pdf.rect(0, 0, pageWidth, 32, "F");
  pdf.setFillColor(...LIME);
  pdf.rect(0, 32, pageWidth, 1.4, "F");

  // Left: Vector mark + EduDrop Foundation lockup
  drawVectorBrandMark(pdf, marginX, 9.2, 11.5);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(18.5);
  pdf.setTextColor(...WHITE);
  pdf.text("Edu", marginX + 14.5, 15.8);
  const eduWidth = pdf.getTextWidth("Edu");
  pdf.setTextColor(...LIME);
  pdf.text("Drop", marginX + 14.5 + eduWidth, 15.8);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.8);
  pdf.setTextColor(...ON_FOREST_MUTED);
  pdf.setCharSpace(1.3);
  pdf.text("FOUNDATION", marginX + 14.7, 20.4);
  pdf.setCharSpace(0);

  // Right: Role-specific pill + Invoice ID + Issue Date
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(7.2);
  const badgeTextWidth = pdf.getTextWidth(audienceMeta.badge);
  const badgeWidth = badgeTextWidth + 8;
  const badgeX = pageWidth - marginX - badgeWidth;

  pdf.setFillColor(...LIME);
  pdf.roundedRect(badgeX, 7.2, badgeWidth, 5.8, 2.9, 2.9, "F");
  pdf.setTextColor(...INK);
  pdf.text(audienceMeta.badge, badgeX + 4, 11.1);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.setTextColor(...WHITE);
  pdf.text(`Invoice #${orderNumber}`, pageWidth - marginX, 19.3, {
    align: "right",
  });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.setTextColor(...ON_FOREST_MUTED);
  pdf.text(`Issued: ${issueDate}`, pageWidth - marginX, 25.1, {
    align: "right",
  });

  // =========================================================================
  // 2. FOUR-CELL METADATA STRIP
  // =========================================================================
  const stripY = 38.5;
  const stripH = 17.5;
  pdf.setFillColor(...BENTO);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(marginX, stripY, contentWidth, stripH, 2.5, 2.5, "FD");

  const colW = contentWidth / 4;
  [1, 2, 3].forEach((colIdx) => {
    const lineX = marginX + colW * colIdx;
    pdf.setDrawColor(...BORDER);
    pdf.line(lineX, stripY + 3.2, lineX, stripY + stripH - 3.2);
  });

  const drawMetaCell = (colIdx: number, label: string, value: string, sub?: string) => {
    const cellX = marginX + colW * colIdx + 3.8;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(6.6);
    pdf.setTextColor(...BODY);
    pdf.text(label, cellX, stripY + 5.6);

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(8.5);
    pdf.setTextColor(...INK);
    const valLines = pdf.splitTextToSize(value, colW - 7.5) as string[];
    pdf.text(valLines[0] || "—", cellX, stripY + 10.6);

    if (sub) {
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7);
      pdf.setTextColor(...BODY);
      const subLines = pdf.splitTextToSize(sub, colW - 7.5) as string[];
      pdf.text(subLines[0] || "", cellX, stripY + 14.5);
    }
  };

  drawMetaCell(0, "ORDER REFERENCE", `#${orderNumber}`, paid ? "Verified Settled" : "Unpaid");

  if (audience === "bursar") {
    drawMetaCell(1, "CAMPUS COVERAGE", "100% Sponsored", "Zero cost to school");
    drawMetaCell(
      2,
      "REQUISITION CADENCE",
      isMonthly ? "Monthly Sustaining" : "One-Time Delivery",
      "Direct Gate Dispatch"
    );
  } else {
    const shortTx = txRef.length > 21 ? `${txRef.slice(0, 19)}...` : txRef;
    drawMetaCell(1, "TRANSACTION REF", shortTx, orderData?.card || "Card Verified");
    drawMetaCell(
      2,
      "CADENCE & PAYMENT",
      isMonthly ? "Monthly Sustaining" : "One-Time Gift",
      paid ? "Paid in Full" : "Awaiting Payment"
    );
  }

  // Column 4: Visual Status Pill
  const statusColX = marginX + colW * 3 + 3.8;
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(6.6);
  pdf.setTextColor(...BODY);
  pdf.text("FULFILLMENT STATUS", statusColX, stripY + 5.6);

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8);
  const sWidth = Math.min(colW - 8, pdf.getTextWidth(statusInfo.label) + 9);
  pdf.setFillColor(...statusInfo.bg);
  pdf.roundedRect(statusColX, stripY + 7.8, sWidth, 6, 3, 3, "F");
  pdf.setFillColor(...statusInfo.fg);
  pdf.circle(statusColX + 3.2, stripY + 10.8, 1, "F");
  pdf.setTextColor(...statusInfo.fg);
  pdf.text(statusInfo.label, statusColX + 5.6, stripY + 11.8);

  // =========================================================================
  // 3. TWO-COLUMN BENTO STAKEHOLDER CARDS (EQUAL HEIGHT)
  // =========================================================================
  const partyY = stripY + stripH + 6;
  const partyGap = 6;
  const partyW = (contentWidth - partyGap) / 2; // 88mm each
  const partyTextW = partyW - 9;

  interface CardLineSpec {
    text: string;
    bold?: boolean;
    size?: number;
    color?: RgbTuple;
  }

  const buildLeftLines = (): { eyebrow: string; lines: CardLineSpec[] } => {
    if (audience === "bursar") {
      const list: CardLineSpec[] = [
        { text: schoolName, bold: true, size: 10, color: INK },
      ];
      if (schoolAddress) {
        list.push({ text: schoolAddress, size: 8.3, color: BODY });
      }
      list.push({ text: `Campus Phone: ${schoolPhone}`, size: 8.3, color: BODY });
      return { eyebrow: "RECEIVING CAMPUS", lines: list };
    }

    const list: CardLineSpec[] = [
      { text: sponsorName, bold: true, size: 10, color: INK },
    ];
    if (orderData?.email) {
      list.push({ text: `Email: ${orderData.email}`, size: 8.3, color: BODY });
    }
    if (orderData?.contactNo) {
      list.push({ text: `Phone: ${orderData.contactNo}`, size: 8.3, color: BODY });
    }
    if (donorLocation) {
      list.push({ text: `Location: ${donorLocation}`, size: 8.3, color: BODY });
    }
    return { eyebrow: "BILLED SPONSOR", lines: list };
  };

  const buildRightLines = (): { eyebrow: string; lines: CardLineSpec[] } => {
    if (audience === "bursar") {
      // Privacy-trimmed donor attribution: omit email, phone, street address, and card digits
      return {
        eyebrow: "SPONSORSHIP ATTRIBUTION",
        lines: [
          { text: sponsorName, bold: true, size: 10, color: INK },
          {
            text: `Supporter Origin: ${orderData?.country || "Verified EduDrop Sponsor"}`,
            size: 8.3,
            color: BODY,
          },
          {
            text: paid
              ? "Funding Status: Verified Paid via EduDrop"
              : "Funding Status: Pending Verification",
            size: 8.3,
            color: paid ? EMERALD_FG : AMBER_FG,
            bold: true,
          },
        ],
      };
    }

    const list: CardLineSpec[] = [
      { text: schoolName, bold: true, size: 10, color: INK },
    ];
    if (schoolAddress) {
      list.push({ text: schoolAddress, size: 8.3, color: BODY });
    }
    list.push({ text: `Campus Phone: ${schoolPhone}`, size: 8.3, color: BODY });
    return { eyebrow: "BENEFICIARY SCHOOL", lines: list };
  };

  const measureCardHeight = (lines: CardLineSpec[]): number => {
    let h = 11.5; // top padding + eyebrow
    lines.forEach((line, idx) => {
      pdf.setFont("helvetica", line.bold ? "bold" : "normal");
      pdf.setFontSize(line.size ?? 8.5);
      const wrapped = pdf.splitTextToSize(line.text, partyTextW) as string[];
      h += wrapped.length * (idx === 0 ? 4.8 : 4.2) + (idx === 0 ? 1.2 : 0.6);
    });
    return Math.max(33, h + 3);
  };

  const leftCard = buildLeftLines();
  const rightCard = buildRightLines();
  const partyCardH = Math.max(
    measureCardHeight(leftCard.lines),
    measureCardHeight(rightCard.lines)
  );

  const renderPartyCard = (
    x: number,
    cardData: { eyebrow: string; lines: CardLineSpec[] }
  ) => {
    pdf.setFillColor(...WHITE);
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.35);
    pdf.roundedRect(x, partyY, partyW, partyCardH, 2.5, 2.5, "FD");

    // Left vertical Forest Emerald accent bar inside card
    pdf.setFillColor(...FOREST);
    pdf.roundedRect(x, partyY, 1.4, partyCardH, 0.7, 0.7, "F");

    let cursorY = partyY + 6;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7);
    pdf.setTextColor(...FOREST);
    pdf.text(cardData.eyebrow, x + 5, cursorY);
    cursorY += 5.4;

    cardData.lines.forEach((line, idx) => {
      pdf.setFont("helvetica", line.bold ? "bold" : "normal");
      pdf.setFontSize(line.size ?? 8.5);
      pdf.setTextColor(...(line.color ?? BODY));
      cursorY = drawWrappedField(
        pdf,
        x + 5,
        cursorY,
        partyTextW,
        line.text,
        idx === 0 ? 4.8 : 4.2
      );
      cursorY += idx === 0 ? 1.2 : 0.6;
    });
  };

  renderPartyCard(marginX, leftCard);
  renderPartyCard(marginX + partyW + partyGap, rightCard);

  // =========================================================================
  // 4. ITEMIZED SUPPLIES TABLE
  // =========================================================================
  const tableStartY = partyY + partyCardH + 7;
  const products: IProductWithQuantity[] = Array.isArray(orderData?.products)
    ? orderData.products
    : [];

  let computedItemsTotal = 0;
  let totalUnits = 0;

  const tableRows = products.map((product, index) => {
    const unitPrice = Number(
      product?.sale !== false && product?.salePrice
        ? product.salePrice
        : product?.salePrice || product?.price || 0
    );
    const qty = Number(product?.quantity || 1);
    const lineTotal = unitPrice * qty;
    computedItemsTotal += lineTotal;
    totalUnits += qty;

    const packInfo =
      product?.packagingType === "Case" && product?.quantityPerCase
        ? `Case (${product.quantityPerCase} units)`
        : product?.packagingType || "";

    const itemDesc = packInfo
      ? `${product?.title || "Classroom Supply"}\n${packInfo}`
      : product?.title || "Classroom Supply";

    return [
      String(index + 1).padStart(2, "0"),
      itemDesc,
      formatCurrency(unitPrice),
      String(qty),
      formatCurrency(lineTotal),
    ];
  });

  if (tableRows.length === 0) {
    tableRows.push([
      "01",
      "EduDrop Verified Classroom Sponsorship",
      formatCurrency(Number(orderData?.totalAmount || 0)),
      "1",
      formatCurrency(Number(orderData?.totalAmount || 0)),
    ]);
    computedItemsTotal = Number(orderData?.totalAmount || 0);
    totalUnits = 1;
  }

  let tableFinalY = tableStartY + 20;

  autoTable(pdf, {
    startY: tableStartY,
    margin: { left: marginX, right: marginX, bottom: 26 },
    theme: "plain",
    head: [
      [
        "#",
        audience === "bursar" ? "Supply Item Manifest" : "Sponsored Supply Item",
        audience === "bursar" ? "Unit Value" : "Unit Price",
        "Qty",
        "Amount",
      ],
    ],
    body: tableRows,
    headStyles: {
      fillColor: FOREST,
      textColor: WHITE,
      fontStyle: "bold",
      fontSize: 8.2,
      cellPadding: { top: 3.5, bottom: 3.8, left: 3.5, right: 3.5 },
    },
    bodyStyles: {
      textColor: INK,
      fontSize: 8.6,
      cellPadding: { top: 3.4, bottom: 3.4, left: 3.5, right: 3.5 },
      lineColor: BORDER,
      lineWidth: { bottom: 0.25 },
    },
    alternateRowStyles: {
      fillColor: ROW_ALT,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: "center", textColor: BODY },
      1: { cellWidth: 94, halign: "left" },
      2: { cellWidth: 26, halign: "right" },
      3: { cellWidth: 20, halign: "center", fontStyle: "bold" },
      4: { cellWidth: 30, halign: "right", fontStyle: "bold" },
    },
    didParseCell: (hookData) => {
      if (hookData.section === "head") {
        if (hookData.column.index === 0 || hookData.column.index === 3) {
          hookData.cell.styles.halign = "center";
        } else if (hookData.column.index === 2 || hookData.column.index === 4) {
          hookData.cell.styles.halign = "right";
        }
      }
    },
    didDrawCell: (hookData) => {
      if (hookData.section === "head" && hookData.row.index === 0) {
        pdf.setFillColor(...LIME);
        pdf.rect(
          hookData.cell.x,
          hookData.cell.y + hookData.cell.height - 0.65,
          hookData.cell.width,
          0.65,
          "F"
        );
      }
    },
    didDrawPage: (hookData) => {
      if (hookData?.cursor?.y) {
        tableFinalY = hookData.cursor.y;
      }
    },
  });

  const lastAutoTable = (pdf as any).lastAutoTable;
  if (lastAutoTable?.finalY) {
    tableFinalY = lastAutoTable.finalY;
  }

  // =========================================================================
  // 5. FINANCIAL SUMMARY & ROLE-SPECIFIC VERIFICATION / SIGN-OFF ZONE
  // =========================================================================
  const summaryBlockH = 42;
  let summaryY = tableFinalY + 7;
  if (summaryY + summaryBlockH > pageHeight - 24) {
    pdf.addPage();
    summaryY = 18;
  }

  const leftNoteW = 94;
  const totalsCardX = marginX + leftNoteW + 6; // 114
  const totalsCardW = contentWidth - leftNoteW - 6; // 82

  // Left Bento Card
  pdf.setFillColor(...BENTO);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(marginX, summaryY, leftNoteW, summaryBlockH, 2.5, 2.5, "FD");

  if (audience === "bursar") {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.4);
    pdf.setTextColor(...FOREST);
    pdf.text("CAMPUS RECEIVING & INSPECTION SIGN-OFF", marginX + 4.5, summaryY + 6.5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...INK);
    pdf.text(
      `Units Verified (${totalUnits} total):   [  ] Complete   [  ] Partial`,
      marginX + 4.5,
      summaryY + 13.5
    );

    pdf.setTextColor(...BODY);
    pdf.text("Bursar Signature:", marginX + 4.5, summaryY + 23.5);
    pdf.setDrawColor(...BODY);
    pdf.setLineWidth(0.25);
    pdf.line(marginX + 30.5, summaryY + 24, marginX + leftNoteW - 5, summaryY + 24);

    pdf.text("Arrival Date:", marginX + 4.5, summaryY + 33);
    pdf.line(marginX + 23, summaryY + 33.5, marginX + 51, summaryY + 33.5);
    pdf.text("Condition:", marginX + 54, summaryY + 33);
    pdf.line(marginX + 69.5, summaryY + 33.5, marginX + leftNoteW - 5, summaryY + 33.5);
  } else if (audience === "admin") {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.4);
    pdf.setTextColor(...FOREST);
    pdf.text("SETTLEMENT & AUDIT METADATA", marginX + 4.5, summaryY + 6.5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...BODY);
    const adminNotes = [
      `Internal Order ID: ${orderData?._id || "—"}`,
      `Payment Method: ${orderData?.card || "Card Verified"}`,
      `Requisition Schedule: ${isMonthly ? "Monthly Recurring" : "One-Time Delivery"}`,
      ...(isMonthly && nextCycle ? [`Next Billing Cycle: ${nextCycle}`] : []),
    ];
    let noteY = summaryY + 13;
    adminNotes.forEach((line) => {
      noteY = drawWrappedField(pdf, marginX + 4.5, noteY, leftNoteW - 9, line, 4.4);
      noteY += 1.2;
    });
  } else {
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(7.4);
    pdf.setTextColor(...FOREST);
    pdf.text("DONATION & 501(C)(3) ACKNOWLEDGMENT", marginX + 4.5, summaryY + 6.5);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(8);
    pdf.setTextColor(...BODY);
    const ackText =
      "Thank you for sponsoring verified supplies directly to classrooms with zero administrative diversion. Please retain this receipt for your records.";
    const afterAckY = drawWrappedField(
      pdf,
      marginX + 4.5,
      summaryY + 12.5,
      leftNoteW - 9,
      ackText,
      4.2
    );

    if (isMonthly && nextCycle) {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(8);
      pdf.setTextColor(...FOREST);
      pdf.text(`Next Scheduled Renewal: ${nextCycle}`, marginX + 4.5, afterAckY + 3.2);
    } else {
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(7.8);
      pdf.setTextColor(...FOREST);
      pdf.text("100% Direct-to-Campus Delivery Verified", marginX + 4.5, afterAckY + 3.2);
    }
  }

  // Right Totals Card
  const displayTotal =
    Number.isFinite(Number(orderData?.totalAmount)) && Number(orderData.totalAmount) > 0
      ? Number(orderData.totalAmount)
      : computedItemsTotal;
  const subtotalValue =
    computedItemsTotal > 0 ? computedItemsTotal : displayTotal;

  pdf.setFillColor(...WHITE);
  pdf.setDrawColor(...BORDER);
  pdf.setLineWidth(0.35);
  pdf.roundedRect(totalsCardX, summaryY, totalsCardW, summaryBlockH, 2.5, 2.5, "FD");

  const labelX = totalsCardX + 5;
  const valRightX = totalsCardX + totalsCardW - 5;

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8.3);
  pdf.setTextColor(...BODY);
  pdf.text(audience === "bursar" ? "Sponsored Value" : "Supply Subtotal", labelX, summaryY + 8);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...INK);
  pdf.text(formatCurrency(subtotalValue), valRightX, summaryY + 8, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BODY);
  pdf.text("Delivery & Logistics", labelX, summaryY + 14.5);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...EMERALD_FG);
  pdf.text("Included ($0.00)", valRightX, summaryY + 14.5, { align: "right" });

  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(...BODY);
  pdf.text(
    audience === "bursar" ? "School Balance Due" : "Settlement Status",
    labelX,
    summaryY + 21
  );
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(...(paid || audience === "bursar" ? EMERALD_FG : AMBER_FG));
  pdf.text(
    audience === "bursar"
      ? "$0.00 (Sponsored)"
      : paid
        ? "Paid in Full"
        : "Pending",
    valRightX,
    summaryY + 21,
    { align: "right" }
  );

  // Forest Emerald Grand Total Bar inside Bottom of Totals Card
  const grandBarY = summaryY + summaryBlockH - 14;
  pdf.setFillColor(...FOREST);
  pdf.roundedRect(totalsCardX, grandBarY, totalsCardW, 14, 2.2, 2.2, "F");
  pdf.rect(totalsCardX, grandBarY, totalsCardW, 3, "F"); // square off top corners cleanly inside parent border

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(8.2);
  pdf.setTextColor(...WHITE);
  pdf.text(audienceMeta.totalHeading, labelX, grandBarY + 8.8);

  pdf.setFontSize(12.5);
  pdf.setTextColor(...LIME);
  pdf.text(formatCurrency(displayTotal), valRightX, grandBarY + 9.2, {
    align: "right",
  });

  // =========================================================================
  // 6. CONSISTENT FOOTER ACROSS ALL PAGES
  // =========================================================================
  const totalPages = pdf.getNumberOfPages();
  for (let pageIndex = 1; pageIndex <= totalPages; pageIndex += 1) {
    pdf.setPage(pageIndex);
    pdf.setDrawColor(...BORDER);
    pdf.setLineWidth(0.3);
    pdf.line(marginX, pageHeight - 16, pageWidth - marginX, pageHeight - 16);

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(7.5);
    pdf.setTextColor(...BODY);
    pdf.text(
      "EduDrop Foundation  •  Direct-to-Campus Clean Water & Classroom Supply Sponsorship",
      marginX,
      pageHeight - 10.5
    );

    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(...FOREST);
    pdf.text(
      `Page ${pageIndex} of ${totalPages}  •  #${orderNumber}`,
      pageWidth - marginX,
      pageHeight - 10.5,
      { align: "right" }
    );
  }

  pdf.save(`${audienceMeta.filenamePrefix}_${orderNumber}.pdf`);
};
