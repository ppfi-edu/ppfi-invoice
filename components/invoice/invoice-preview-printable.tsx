"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Printer, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { generateInvoicePDF, printInvoice } from "@/lib/pdf-generator"
import type { InvoiceData } from "./invoice-creator"
import Image from "next/image"

interface InvoicePreviewPrintableProps {
  invoiceData: InvoiceData
  onBack: () => void
}

export function InvoicePreviewPrintable({ invoiceData, onBack }: InvoicePreviewPrintableProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [printing, setPrinting] = useState(false)
  const invoiceRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * invoiceData.tax_rate) / 100
  const total = subtotal + taxAmount

  const displayInvoiceNumber = invoiceData.invoice_number || "DRAFT"

  const saveInvoice = async () => {
    setSaving(true)
    try {
      const invoiceInsert = {
        invoice_number: displayInvoiceNumber,
        type: invoiceData.type,
        student_id: invoiceData.student?.id || null,
        client_id: invoiceData.client?.id || null,
        items: invoiceData.items,
        subtotal,
        tax_rate: invoiceData.tax_rate,
        tax_amount: taxAmount,
        total,
        due_date: invoiceData.due_date,
        notes: invoiceData.notes,
        status: invoiceData.status,
        issuer: invoiceData.issuer || null,
      }

      const { data: invoice, error } = await supabase.from("invoices").insert(invoiceInsert).select().single()

      if (error) {
        console.error("Database error:", error)
        throw error
      }

      // Create relationship record
      if (invoiceData.type === "student" && invoiceData.student) {
        await supabase.from("student_invoices").insert({
          student_id: invoiceData.student.id,
          invoice_id: displayInvoiceNumber,
        })
      } else if (invoiceData.type === "client" && invoiceData.client) {
        await supabase.from("client_invoices").insert({
          client_id: invoiceData.client.id,
          invoice_id: displayInvoiceNumber,
        })
      }

      setSaved(true)
      alert("Invoice saved successfully!")
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert(`Error saving invoice: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = async () => {
    if (!invoiceRef.current) {
      alert("Invoice content not found")
      return
    }

    setPrinting(true)
    try {
      await printInvoice(invoiceRef.current)
    } catch (error) {
      console.error("Error printing:", error)
      alert(`Error printing invoice: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setPrinting(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) {
      alert("Invoice content not found")
      return
    }

    setGenerating(true)
    try {
      const filename = `invoice-${displayInvoiceNumber.replace(/[^a-zA-Z0-9]/g, "-")}.pdf`
      await generateInvoicePDF(invoiceRef.current, filename)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert(`Error generating PDF: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setGenerating(false)
    }
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:justify-between sm:items-center no-print">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-700 text-white hover:bg-gray-800 bg-transparent w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Form
        </Button>

        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={saveInvoice}
            disabled={saving || saved}
            className="bg-green-600 hover:bg-green-700 text-white w-full sm:w-auto"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : saved ? "Saved" : "Save Invoice"}
          </Button>
          <Button
            onClick={handlePrint}
            disabled={printing}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 bg-transparent w-full sm:w-auto"
          >
            <Printer className="w-4 h-4 mr-2" />
            {printing ? "Printing..." : "Print"}
          </Button>
          <Button
            onClick={handleDownloadPDF}
            disabled={generating}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-800 bg-transparent w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            {generating ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="bg-white text-black overflow-hidden">
        <CardContent className="p-0">
          <div ref={invoiceRef} className="invoice-content">
            {/* A4 Invoice Layout - Responsive */}
            <div
              className="w-full bg-white text-black p-4 sm:p-6 lg:p-8 min-h-[297mm]"
              style={{ maxWidth: "794px", margin: "0 auto" }}
            >
              {/* Header with Logo - Responsive */}
              <div className="grid grid-cols-2 justify-between items-start mb-8 gap-4">
                <div className="flex flex-col items-start pl-6">
                  {/* Logo */}
                  <div className="w-28 h-16 sm:w-24 sm:h-14 lg:w-36 lg:h-24 flex items-center justify-center mx-auto">
                    <Image src="https://ppfi.art/ppfi-dark.png"  alt="logo" className="object-cover" />
                  </div>
                  {/* Institute Info */}
                  <div className="text-start">
                    <p className="text-xs sm:text-sm text-gray-500">123 Fashion Street, Phnom Penh</p>
                    <p className="text-xs sm:text-sm text-gray-300">Tel: +855 23 123 456</p>
                    <p className="text-xs sm:text-sm text-gray-300">Email: info@ppfi.edu.kh</p>
                  </div>
                </div>
                <div className="pr-6 text-right">
                  <h2 className="text-2xl lg:text-2xl font-bold mb-2 sm:mb-3 text-black">INVOICE</h2>
                  <p className="text-lg sm:text-xl font-semibold mb-1 sm:mb-2 break-all">#{displayInvoiceNumber}</p>
                  <p className="text-xs sm:text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
                  <p className="text-xs sm:text-sm text-gray-600">
                    Due: {new Date(invoiceData.due_date).toLocaleDateString()}
                  </p>
                  {/* Invoice Issuer */}
                  {invoiceData.issuer && (
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <p className="text-xs text-gray-300">Issued by: <p className="text-sm font-medium text-gray-700 break-words">{invoiceData.issuer}</p></p>
                    </div>
                  )}
                </div>
              </div>

              {/* Bill To - Responsive */}
              <div className="mb-6 sm:mb-8">
                <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-black">Bill To:</h3>
                <div className="bg-gray-50 p-4 sm:p-6 rounded-lg border keep-bg">
                  {invoiceData.type === "student" && invoiceData.student ? (
                    <div className="space-y-1 sm:space-y-2">
                      <p className="font-semibold text-base sm:text-lg text-black break-words">
                        {invoiceData.student.name}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base">Student ID: {invoiceData.student.student_id}</p>
                      <p className="text-gray-600 text-sm sm:text-base break-words">
                        Program: {invoiceData.student.program}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base break-all">Email: {invoiceData.student.email}</p>
                      {invoiceData.student.phone && (
                        <p className="text-gray-600 text-sm sm:text-base">Phone: {invoiceData.student.phone}</p>
                      )}
                    </div>
                  ) : invoiceData.client ? (
                    <div className="space-y-1 sm:space-y-2">
                      <p className="font-semibold text-base sm:text-lg text-black break-words">
                        {invoiceData.client.name}
                      </p>
                      <p className="text-gray-600 text-sm sm:text-base break-all">Email: {invoiceData.client.email}</p>
                      {invoiceData.client.phone && (
                        <p className="text-gray-600 text-sm sm:text-base">Phone: {invoiceData.client.phone}</p>
                      )}
                      {invoiceData.client.address && (
                        <p className="text-gray-600 text-sm sm:text-base break-words">
                          Address: {invoiceData.client.address}
                        </p>
                      )}
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Items Table - Responsive */}
              <div className="mb-6 sm:mb-8 overflow-x-auto">
                <table className="w-full border-collapse min-w-[500px]">
                  <thead>
                    <tr className="border-b-2 border-black">
                      <th className="text-left py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg text-black">
                        Description
                      </th>
                      <th className="text-center py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg w-16 sm:w-20 text-black">
                        Qty
                      </th>
                      <th className="text-right py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg w-24 sm:w-32 text-black">
                        Unit Price
                      </th>
                      <th className="text-right py-3 sm:py-4 font-semibold text-sm sm:text-base lg:text-lg w-24 sm:w-32 text-black">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceData.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-200">
                        <td className="py-3 sm:py-4 text-sm sm:text-base text-black break-words">{item.description}</td>
                        <td className="py-3 sm:py-4 text-center text-sm sm:text-base text-black">{item.quantity}</td>
                        <td className="py-3 sm:py-4 text-right text-sm sm:text-base text-black">
                          ${item.unit_price.toFixed(2)}
                        </td>
                        <td className="py-3 sm:py-4 text-right font-semibold text-sm sm:text-base text-black">
                          ${item.total.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals - Responsive */}
              <div className="flex justify-end mb-6 sm:mb-8">
                <div className="w-full sm:w-80">
                  <div className="flex justify-between py-2 sm:py-3 text-sm sm:text-base text-black">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between py-2 sm:py-3 text-sm sm:text-base text-black">
                    <span>Tax ({invoiceData.tax_rate}%):</span>
                    <span>${taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t-2 border-black pt-3 sm:pt-4 mt-3 sm:mt-4">
                    <div className="flex justify-between text-lg sm:text-xl lg:text-2xl font-bold text-black">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes - Responsive */}
              {invoiceData.notes && (
                <div className="mb-6 sm:mb-8">
                  <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-black">Notes:</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 sm:p-4 rounded-lg border text-sm sm:text-base leading-relaxed keep-bg break-words">
                    {invoiceData.notes}
                  </p>
                </div>
              )}

              {/* Footer - Responsive */}
              <div className="border-t border-gray-200 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-gray-600">
                <p className="mb-2 sm:mb-3 text-sm sm:text-base">
                  Thank you for choosing Phnom Penh Fashion Institute!
                </p>
                <p className="mb-4 sm:mb-6">Payment is due by {new Date(invoiceData.due_date).toLocaleDateString()}</p>
                <p className="text-xs">This invoice was generated electronically and is valid without signature.</p>

                {/* Issuer Information in Footer */}
                {invoiceData.issuer && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      This invoice was issued by:{" "}
                      <span className="font-medium text-gray-700">{invoiceData.issuer}</span>
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
