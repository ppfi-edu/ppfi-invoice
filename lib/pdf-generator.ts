import jsPDF from "jspdf"
import html2canvas from "html2canvas"

export async function generateInvoicePDF(invoiceNumber: string) {
  const element = document.getElementById("invoice-preview")
  if (!element) {
    throw new Error("Invoice preview element not found")
  }

  try {
    // Create canvas from the invoice preview
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#ffffff",
    })

    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const imgWidth = 210
    const pageHeight = 295
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    let heightLeft = imgHeight

    let position = 0

    // Add first page
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight

    // Add additional pages if needed
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight
      pdf.addPage()
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight
    }

    // Save the PDF
    pdf.save(`${invoiceNumber}.pdf`)
  } catch (error) {
    console.error("Error generating PDF:", error)
    throw new Error("Failed to generate PDF")
  }
}

export function printInvoice() {
  const element = document.getElementById("invoice-preview")
  if (!element) {
    throw new Error("Invoice preview element not found")
  }

  // Create a new window for printing
  const printWindow = window.open("", "_blank")
  if (!printWindow) {
    throw new Error("Failed to open print window")
  }

  // Get the invoice HTML content
  const invoiceHTML = element.outerHTML

  // Create print-friendly HTML
  const printHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice Print</title>
        <style>
          body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: white;
          }
          @media print {
            body {
              margin: 0;
              padding: 0;
            }
            .no-print {
              display: none !important;
            }
          }
          /* Copy relevant styles */
          .bg-white { background-color: white; }
          .text-gray-300 { color: #111827; }
          .text-gray-200 { color: #374151; }
          .text-gray-600 { color: #4b5563; }
          .text-amber-600 { color: #d97706; }
          .font-bold { font-weight: bold; }
          .font-semibold { font-weight: 600; }
          .font-medium { font-weight: 500; }
          .text-xl { font-size: 1.25rem; }
          .text-lg { font-size: 1.125rem; }
          .text-sm { font-size: 0.875rem; }
          .mb-8 { margin-bottom: 2rem; }
          .mb-4 { margin-bottom: 1rem; }
          .mb-3 { margin-bottom: 0.75rem; }
          .mb-2 { margin-bottom: 0.5rem; }
          .mb-1 { margin-bottom: 0.25rem; }
          .mt-3 { margin-top: 0.75rem; }
          .mt-2 { margin-top: 0.5rem; }
          .p-8 { padding: 2rem; }
          .p-6 { padding: 1.5rem; }
          .p-4 { padding: 1rem; }
          .py-4 { padding-top: 1rem; padding-bottom: 1rem; }
          .px-4 { padding-left: 1rem; padding-right: 1rem; }
          .pt-6 { padding-top: 1.5rem; }
          .pt-3 { padding-top: 0.75rem; }
          .pb-8 { padding-bottom: 2rem; }
          .pb-2 { padding-bottom: 0.5rem; }
          .border-b-2 { border-bottom-width: 2px; }
          .border-b { border-bottom-width: 1px; }
          .border-t-2 { border-top-width: 2px; }
          .border-amber-500 { border-color: #f59e0b; }
          .border-amber-200 { border-color: #fde68a; }
          .border-gray-200 { border-color: #e5e7eb; }
          .bg-gray-50 { background-color: #f9fafb; }
          .bg-amber-50 { background-color: #fffbeb; }
          .rounded-lg { border-radius: 0.5rem; }
          .flex { display: flex; }
          .justify-between { justify-content: space-between; }
          .justify-end { justify-content: flex-end; }
          .items-start { align-items: flex-start; }
          .items-center { align-items: center; }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .text-left { text-align: left; }
          .space-y-2 > * + * { margin-top: 0.5rem; }
          .space-y-3 > * + * { margin-top: 0.75rem; }
          .gap-4 { gap: 1rem; }
          .gap-2 { gap: 0.5rem; }
          .w-full { width: 100%; }
          .w-80 { width: 20rem; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #e5e7eb; }
          .grid { display: grid; }
          .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
          .gap-12 { gap: 3rem; }
          .leading-relaxed { line-height: 1.625; }
        </style>
      </head>
      <body>
        ${invoiceHTML}
      </body>
    </html>
  `

  printWindow.document.write(printHTML)
  printWindow.document.close()

  // Wait for content to load then print
  printWindow.onload = () => {
    printWindow.print()
    printWindow.close()
  }
}
