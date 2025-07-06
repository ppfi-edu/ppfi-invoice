"use client"

export interface InvoicePDFOptions {
  filename?: string
  quality?: number
}

export class InvoicePDFGenerator {
  private options: Required<InvoicePDFOptions>

  constructor(options: InvoicePDFOptions = {}) {
    this.options = {
      filename: options.filename || "invoice.pdf",
      quality: options.quality || 1.5,
    }
  }

  async generateFromElement(element: HTMLElement): Promise<void> {
    try {
      // Dynamically import jsPDF and html2canvas
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([import("jspdf"), import("html2canvas")])

      // Create a clone of the element
      const clonedElement = element.cloneNode(true) as HTMLElement

      // Apply print styles
      this.applyPrintStyles(clonedElement)

      // Temporarily add to DOM
      clonedElement.style.position = "absolute"
      clonedElement.style.left = "-9999px"
      clonedElement.style.top = "0"
      clonedElement.style.zIndex = "-1"
      document.body.appendChild(clonedElement)

      // Generate canvas
      const canvas = await html2canvas(clonedElement, {
        scale: this.options.quality,
        useCORS: true,
        allowTaint: false,
        backgroundColor: "#ffffff",
        width: 794, // A4 width at 96 DPI
        height: 1123, // A4 height at 96 DPI
        scrollX: 0,
        scrollY: 0,
      })

      // Remove cloned element
      document.body.removeChild(clonedElement)

      // Create PDF
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      })

      // Get PDF dimensions
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      // Calculate image dimensions to fit A4
      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      // Add image to PDF
      const imgData = canvas.toDataURL("image/png", 1.0)

      if (imgHeight <= pdfHeight) {
        // Single page
        pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight)
      } else {
        // Multiple pages
        let position = 0
        let remainingHeight = imgHeight

        while (remainingHeight > 0) {
          const pageHeight = Math.min(pdfHeight, remainingHeight)

          if (position > 0) {
            pdf.addPage()
          }

          pdf.addImage(imgData, "PNG", 0, -position, imgWidth, imgHeight)

          position += pdfHeight
          remainingHeight -= pdfHeight
        }
      }

      // Save PDF
      pdf.save(this.options.filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      throw new Error("Failed to generate PDF. Please try again.")
    }
  }

  private applyPrintStyles(element: HTMLElement): void {
    // Set A4 dimensions
    element.style.width = "794px" // A4 width in pixels
    element.style.minHeight = "1123px" // A4 height in pixels
    element.style.backgroundColor = "white"
    element.style.color = "black"
    element.style.fontSize = "14px"
    element.style.lineHeight = "1.4"
    element.style.fontFamily = "Arial, sans-serif"
    element.style.padding = "40px"
    element.style.boxSizing = "border-box"
    element.style.margin = "0"

    // Remove shadows and backgrounds from all elements
    const allElements = element.querySelectorAll("*")
    allElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.boxShadow = "none"
      htmlEl.style.textShadow = "none"

      // Keep only essential backgrounds
      if (!htmlEl.classList.contains("keep-bg")) {
        htmlEl.style.backgroundColor = "transparent"
      }
    })

    // Hide no-print elements
    const noPrintElements = element.querySelectorAll(".no-print")
    noPrintElements.forEach((el) => {
      const htmlEl = el as HTMLElement
      htmlEl.style.display = "none"
    })
  }

  async printElement(element: HTMLElement): Promise<void> {
    try {
      // Create print content
      const printContent = this.createPrintContent(element)

      // Create new window
      const printWindow = window.open("", "_blank", "width=800,height=600")
      if (!printWindow) {
        throw new Error("Could not open print window. Please allow popups.")
      }

      // Write content to new window
      printWindow.document.write(printContent)
      printWindow.document.close()

      // Wait for images to load then print
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print()
          setTimeout(() => {
            printWindow.close()
          }, 100)
        }, 500)
      }
    } catch (error) {
      console.error("Error printing:", error)
      throw new Error("Failed to print invoice. Please try again.")
    }
  }

  private createPrintContent(element: HTMLElement): string {
    const clonedElement = element.cloneNode(true) as HTMLElement
    this.applyPrintStyles(clonedElement)

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice</title>
          <meta charset="utf-8">
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: Arial, sans-serif;
              font-size: 14px;
              line-height: 1.4;
              color: black;
              background: white;
              width: 210mm;
              min-height: 297mm;
              margin: 0 auto;
            }
            
            .no-print {
              display: none !important;
            }
            
            table {
              border-collapse: collapse;
              width: 100%;
            }
            
            th, td {
              border: 1px solid #ddd;
              padding: 8px;
              text-align: left;
            }
            
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            
            .keep-bg {
              background-color: #f5f5f5 !important;
            }
          </style>
        </head>
        <body>
          ${clonedElement.outerHTML}
        </body>
      </html>
    `
  }
}

// Utility functions
export async function generateInvoicePDF(element: HTMLElement, filename?: string): Promise<void> {
  const generator = new InvoicePDFGenerator({ filename })
  await generator.generateFromElement(element)
}

export async function printInvoice(element: HTMLElement): Promise<void> {
  const generator = new InvoicePDFGenerator()
  await generator.printElement(element)
}
