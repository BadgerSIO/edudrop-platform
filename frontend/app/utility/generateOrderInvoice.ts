import autoTable from "jspdf-autotable";
import { IOrder } from "../types/Order";
import { IProductWithQuantity } from "../types/Product";
import { dateConverter } from "./dateConverter";
import jsPDF from "jspdf";

export const generateOrderInvoice = (orderData: IOrder) => {
  // Create a new jsPDF instance
  const pdf = new jsPDF();

  // Header
  pdf.setFontSize(20);
  pdf.text("Invoice", 20, 20);

  // Customer details
  pdf.setFontSize(10);
  pdf.text(
    `Customer Name: ${orderData.name.firstName} ${orderData.name.lastName}`,
    20,
    30,
  );
  pdf.text(`Email: ${orderData.email}`, 20, 35);
  pdf.text(`Order Date: ${dateConverter(orderData.createdAt)}`, 20, 40);
  pdf.setFontSize(12);
  // School details
  pdf.text(`Donated to`, 140, 20);
  pdf.setFontSize(10);

  // School Name with text wrapping
  const schoolName = orderData?.schoolId?.name || "";
  const maxWidth = 55;

  const calculateVerticalSpacing = (
    previousYPosition: number,
    lines: string | any[],
  ) => {
    const defaultSpacing = 3;
    const dynamicSpacing = lines.length * 2; // Adjust the multiplier as needed
    return previousYPosition + defaultSpacing + dynamicSpacing;
  };

  // School Name
  const schoolNameLines = pdf.splitTextToSize(
    `School Name: ${schoolName}`,
    maxWidth,
  );
  const schoolNameYPosition = 30; // Initial position
  pdf.text(schoolNameLines, 140, schoolNameYPosition);

  // City
  const city = orderData.schoolId?.address?.city || "";
  const cityLines = pdf.splitTextToSize(`City: ${city}`, maxWidth);
  const cityYPosition =
    calculateVerticalSpacing(schoolNameYPosition, schoolNameLines) + 2;
  pdf.text(cityLines, 140, cityYPosition);

  // Street
  const street = orderData.schoolId?.address?.street || "";
  const streetLines = pdf.splitTextToSize(`Street: ${street}`, maxWidth);
  const streetYPosition = calculateVerticalSpacing(cityYPosition, cityLines);
  pdf.text(streetLines, 140, streetYPosition);

  // Phone
  const phone = orderData.schoolId?.contactNo || "";
  const phoneLines = pdf.splitTextToSize(`Phone: ${phone}`, maxWidth);
  const phoneYPosition = calculateVerticalSpacing(streetYPosition, streetLines);
  pdf.text(phoneLines, 140, phoneYPosition);

  // Product table
  const productTableYPosition = phoneYPosition + phoneLines.length * 10 + 5;
  const columns = ["Product", "Quantity", "Price", "Total"];
  const data = orderData.products.map((product: IProductWithQuantity) => [
    product.title,
    product.quantity,
    product.salePrice ? product?.salePrice : product?.price,
    product.salePrice
      ? product?.quantity * product?.salePrice
      : product?.quantity * product?.price,
  ]);
  let totalAmountHeight;
  autoTable(pdf, {
    startY: productTableYPosition,
    head: [columns],
    body: data,
    didDrawPage: (HookData) => {
      totalAmountHeight = HookData?.cursor?.y;
    },
  });

  // Footer
  const totalAmount = orderData.totalAmount;
  pdf.setFontSize(12);
  pdf.text(
    `Total Amount: $${totalAmount.toFixed(2)}`,
    140,
    totalAmountHeight ? totalAmountHeight + 10 : 80,
  );

  // Save the PDF and trigger the download
  pdf.save(`Invoice_${orderData.orderId}.pdf`);
};
