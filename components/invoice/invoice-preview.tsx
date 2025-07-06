"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Download, Printer, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { InvoiceData } from "./invoice-creator"

interface InvoicePreviewProps {
  invoiceData: InvoiceData
  onBack: () => void
}

export function InvoicePreview({ invoiceData, onBack }: InvoicePreviewProps) {
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const supabase = createClient()

  const subtotal = invoiceData.items.reduce((sum, item) => sum + item.total, 0)
  const taxAmount = (subtotal * invoiceData.tax_rate) / 100
  const total = subtotal + taxAmount

  const generateInvoiceNumber = () => {
    const prefix = invoiceData.type === "student" ? "STU" : "CLI"
    const timestamp = Date.now().toString().slice(-6)
    return `${prefix}-${timestamp}`
  }

  const displayInvoiceNumber = invoiceData.invoice_number || generateInvoiceNumber()

  const saveInvoice = async () => {
    setSaving(true)
    try {
      const invoiceNumber = invoiceData.invoice_number || generateInvoiceNumber()

      const invoiceInsert = {
        invoice_number: invoiceNumber,
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
      }

      const { data: invoice, error } = await supabase.from("invoices").insert(invoiceInsert).select().single()

      if (error) throw error

      // Create relationship record
      if (invoiceData.type === "student" && invoiceData.student) {
        await supabase.from("student_invoices").insert({
          student_id: invoiceData.student.id,
          invoice_id: invoiceNumber,
        })
      } else if (invoiceData.type === "client" && invoiceData.client) {
        await supabase.from("client_invoices").insert({
          client_id: invoiceData.client.id,
          invoice_id: invoiceNumber,
        })
      }

      setSaved(true)
      alert("Invoice saved successfully!")
    } catch (error) {
      console.error("Error saving invoice:", error)
      alert("Error saving invoice. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation library like jsPDF or Puppeteer
    alert("PDF download functionality would be implemented here")
  }

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-between items-center">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-gray-700 text-white hover:bg-gray-950 bg-transparent"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Form
        </Button>

        <div className="flex gap-2">
          <Button
            onClick={saveInvoice}
            disabled={saving || saved}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? "Saving..." : saved ? "Saved" : "Save Invoice"}
          </Button>
          <Button
            onClick={handlePrint}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-950 bg-transparent"
          >
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button
            onClick={handleDownloadPDF}
            variant="outline"
            className="border-gray-700 text-white hover:bg-gray-950 bg-transparent"
          >
            <Download className="w-4 h-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Invoice Preview */}
      <Card className="bg-white text-black print:shadow-none">
        <CardContent className="p-8">
          {/* Header */}
          <div className="grid grid-cols-2 justify-between items-start mb-8">
            <div className="flex flex-col items-start pl-6">
              <div class="w-32 h-24 flex items-start justify-center">
                <Image src="https://ppfi.art/ppfi-dark.png" class="object-cover mb-4" />
              </div>
              <div className="text-start">
                <p class="text-sm text-gray-500">123 Fashion Street, Phnom Penh</p>
                <p class="text-sm text-gray-500">Tel: +855 23 123 456</p>
                <p class="text-sm text-gray-500">Email: info @ppfi.edu.kh </p>
              </div>
            </div>
            <div className="text-right pr-6 pt-8">
              <h2 className="text-3xl font-bold mb-2">INVOICE</h2>
              <p className="text-lg font-semibold">#{displayInvoiceNumber}</p>
              <p className="text-sm text-gray-600">Date: {new Date().toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Due: {new Date(invoiceData.due_date).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Bill To */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-3">Bill To:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              {invoiceData.type === "student" && invoiceData.student ? (
                <div>
                  <p className="font-semibold">{invoiceData.student.name}</p>
                  <p className="text-sm text-gray-600">Student ID: {invoiceData.student.student_id}</p>
                  <p className="text-sm text-gray-600">Program: {invoiceData.student.program}</p>
                  <p className="text-sm text-gray-600">Email: {invoiceData.student.email}</p>
                  {invoiceData.student.phone && (
                    <p className="text-sm text-gray-600">Phone: {invoiceData.student.phone}</p>
                  )}
                </div>
              ) : invoiceData.client ? (
                <div>
                  <p className="font-semibold">{invoiceData.client.name}</p>
                  <p className="text-sm text-gray-600">Email: {invoiceData.client.email}</p>
                  {invoiceData.client.phone && (
                    <p className="text-sm text-gray-600">Phone: {invoiceData.client.phone}</p>
                  )}
                  {invoiceData.client.address && (
                    <p className="text-sm text-gray-600">Address: {invoiceData.client.address}</p>
                  )}
                </div>
              ) : null}
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-3 font-semibold">Description</th>
                  <th className="text-center py-3 font-semibold w-20">Qty</th>
                  <th className="text-right py-3 font-semibold w-24">Unit Price</th>
                  <th className="text-right py-3 font-semibold w-24">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoiceData.items.map((item, index) => (
                  <tr key={item.id} className="border-b border-gray-200">
                    <td className="py-3">{item.description}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right">${item.unit_price.toFixed(2)}</td>
                    <td className="py-3 text-right font-semibold">${item.total.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span>Tax ({invoiceData.tax_rate}%):</span>
                <span>${taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t-2 border-black pt-2 mt-2">
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {invoiceData.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-2">Notes:</h3>
              <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{invoiceData.notes}</p>
            </div>
          )}

          {/* Footer */}
          <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-600">
            <p className="mb-2">Thank you for choosing Phnom Penh Fashion Institute!</p>
            <p>Payment is due by {new Date(invoiceData.due_date).toLocaleDateString()}</p>
            <p className="mt-4 text-xs">This invoice was generated electronically and is valid without signature.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
