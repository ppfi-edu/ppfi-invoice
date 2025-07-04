"use client"

import { Badge } from "@/components/ui/badge"
import Logo from "@/components/logo"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  student_id: string
  program: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface InvoicePreviewProps {
  invoice: {
    invoice_number: string
    type: "tuition" | "product"
    items: InvoiceItem[]
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
    due_date: string
    notes: string
  }
  selectedPerson: Student | Client | null
}

export function InvoicePreview({ invoice, selectedPerson }: InvoicePreviewProps) {
  return (
    <div className="bg-black text-white p-8 max-w-4xl mx-auto" id="invoice-preview">
      {/* Elegant Header */}
      <div className="border-b-2 border-amber-500 pb-8 mb-8">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-4">
            <Logo size="lg" variant="dark" />
            <div>
              <h1 className="text-3xl font-bold text-gray-300 mb-1">Phnom Penh Fashion Institute</h1>
              <p className="text-white font-medium">Excellence in Fashion Education</p>
              <p className="text-sm text-gray-400 mt-2">
                Street 123, Phnom Penh, Cambodia | +855 23 123 456 | info@ppfi.edu.kh
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-muted text-white px-6 py-3 rounded-lg shadow-lg">
              <p className="text-sm font-medium">INVOICE</p>
              <p className="text-xl font-bold">{invoice.invoice_number}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="grid grid-cols-2 gap-12 mb-8">
        <div>
          <h3 className="text-lg font-semibold text-gray-300 mb-4 border-b border-gray-200 pb-2">Bill To:</h3>
          {selectedPerson && (
            <div className="space-y-2">
              <p className="font-semibold text-gray-300 text-lg">{selectedPerson.name}</p>
              <p className="text-gray-200">{selectedPerson.email}</p>
              <p className="text-gray-200">{selectedPerson.phone}</p>
              {"student_id" in selectedPerson && (
                <div className="flex gap-2 mt-3">
                  <Badge className="bg-blue-100 text-blue-800 border-amber-300">
                    Student ID: {selectedPerson.student_id}
                  </Badge>
                  <Badge variant="outline" className="border-gray-300">
                    {selectedPerson.program}
                  </Badge>
                </div>
              )}
              {"address" in selectedPerson && <p className="text-gray-200 mt-2">{selectedPerson.address}</p>}
            </div>
          )}
        </div>
        <div className="text-right">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Invoice Date:</span>
              <span className="text-gray-300">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Due Date:</span>
              <span className="text-gray-300">{new Date(invoice.due_date).toLocaleDateString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-gray-200">Type:</span>
              <Badge
                className={invoice.type === "tuition" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}
              >
                {invoice.type === "tuition" ? "Tuition Fee" : "Product Purchase"}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Items Table */}
      <div className="mb-8">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-black to-black/90 border-b-2 border-sky-200">
              <th className="text-left py-4 px-4 font-semibold text-gray-300">Description</th>
              <th className="text-center py-4 px-4 font-semibold text-gray-300">Qty</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-300">Unit Price</th>
              <th className="text-right py-4 px-4 font-semibold text-gray-300">Total</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className={`border-b border-gray-200 ${index % 2 === 0 ? "bg-gray-50" : "bg-white"}`}>
                <td className="py-4 px-4 text-gray-300">{item.description}</td>
                <td className="text-center py-4 px-4 text-gray-200">{item.quantity}</td>
                <td className="text-right py-4 px-4 text-gray-200">${item.unit_price.toFixed(2)}</td>
                <td className="text-right py-4 px-4 font-semibold text-gray-300">${item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-80 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <div className="space-y-3">
            <div className="flex justify-between text-gray-200">
              <span>Subtotal:</span>
              <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-200">
              <span>Tax ({invoice.tax_rate}%):</span>
              <span className="font-medium">${invoice.tax_amount.toFixed(2)}</span>
            </div>
            <div className="border-t-2 border-sky-200 pt-3 flex justify-between text-xl font-bold text-gray-200">
              <span>Total:</span>
              <span className="text-white">${invoice.total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      {invoice.notes && (
        <div className="mb-8 bg-amber-50 p-6 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-gray-300 mb-3">Additional Notes:</h3>
          <p className="text-gray-200 leading-relaxed">{invoice.notes}</p>
        </div>
      )}

      {/* Elegant Footer */}
      <div className="text-center text-sm text-gray-600 border-t-2 border-amber-500 pt-6 space-y-2">
        <p className="font-medium text-gray-300">Thank you for choosing Phnom Penh Fashion Institute</p>
        <p>Shaping the future of fashion through excellence in education</p>
        <p>For questions about this invoice, please contact our finance department</p>
      </div>
    </div>
  )
}
