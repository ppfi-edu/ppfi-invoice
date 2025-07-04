"use client"

import { useState, useEffect } from "react"
import { createSupabaseClient } from "@/lib/supabase"
import { toast } from "@/hooks/use-toast"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { InvoiceHeader } from "@/components/invoice/invoice-header"
import { PersonSelection } from "@/components/invoice/person-selection"
import { InvoiceItems } from "@/components/invoice/invoice-items"
import { InvoiceSummary } from "@/components/invoice/invoice-summary"
import { InvoiceNotes } from "@/components/invoice/invoice-notes"
import { InvoicePreview } from "@/components/invoice/invoice-preview"
import { generateInvoicePDF, printInvoice } from "@/lib/pdf-generator"
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

interface Invoice {
  invoice_number: string
  type: "tuition" | "product"
  student_id?: string
  client_id?: string
  items: InvoiceItem[]
  subtotal: number
  tax_rate: number
  tax_amount: number
  total: number
  due_date: string
  notes: string
}

export default function InvoiceIssuer() {
  const [students, setStudents] = useState<Student[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: `INV-${Date.now()}`,
    type: "tuition",
    items: [],
    subtotal: 0,
    tax_rate: 10,
    tax_amount: 0,
    total: 0,
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "",
  })
  const [selectedPerson, setSelectedPerson] = useState<Student | Client | null>(null)
  const [showPreview, setShowPreview] = useState(false)

  const supabase = createSupabaseClient()

  useEffect(() => {
    fetchStudents()
    fetchClients()
  }, [])

  useEffect(() => {
    calculateTotals()
  }, [invoice.items, invoice.tax_rate])

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("*").order("name")

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch students",
        variant: "destructive",
      })
    } else {
      setStudents(data || [])
    }
  }

  const fetchClients = async () => {
    const { data, error } = await supabase.from("clients").select("*").order("name")

    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch clients",
        variant: "destructive",
      })
    } else {
      setClients(data || [])
    }
  }

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0)
    const tax_amount = (subtotal * invoice.tax_rate) / 100
    const total = subtotal + tax_amount

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      tax_amount,
      total,
    }))
  }

  const handleInvoiceChange = (field: string, value: any) => {
    setInvoice((prev) => ({ ...prev, [field]: value }))
  }

  const addInvoiceItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    }
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem],
    }))
  }

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unit_price") {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price
          }
          return updatedItem
        }
        return item
      }),
    }))
  }

  const removeInvoiceItem = (id: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== id),
    }))
  }

  const selectPerson = (person: Student | Client) => {
    setSelectedPerson(person)
    if ("student_id" in person) {
      setInvoice((prev) => ({ ...prev, student_id: person.id, client_id: undefined }))
    } else {
      setInvoice((prev) => ({ ...prev, client_id: person.id, student_id: undefined }))
    }
  }

  const clearPerson = () => {
    setSelectedPerson(null)
    setInvoice((prev) => ({ ...prev, student_id: undefined, client_id: undefined }))
  }

  const saveInvoice = async () => {
    if (!selectedPerson || invoice.items.length === 0) {
      toast({
        title: "Error",
        description: "Please select a person and add at least one item",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("invoices").insert([
      {
        invoice_number: invoice.invoice_number,
        type: invoice.type,
        student_id: invoice.student_id,
        client_id: invoice.client_id,
        items: invoice.items,
        subtotal: invoice.subtotal,
        tax_rate: invoice.tax_rate,
        tax_amount: invoice.tax_amount,
        total: invoice.total,
        due_date: invoice.due_date,
        notes: invoice.notes,
        status: "pending",
      },
    ])

    if (error) {
      toast({
        title: "Error",
        description: "Failed to save invoice",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Invoice saved successfully",
      })
      // Reset form
      setInvoice({
        invoice_number: `INV-${Date.now()}`,
        type: "tuition",
        items: [],
        subtotal: 0,
        tax_rate: 10,
        tax_amount: 0,
        total: 0,
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        notes: "",
      })
      setSelectedPerson(null)
    }
  }

  const handleExportPDF = async () => {
    try {
      await generateInvoicePDF(invoice.invoice_number)
      toast({
        title: "Success",
        description: "PDF exported successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to export PDF",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    try {
      printInvoice()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to print invoice",
        variant: "destructive",
      })
    }
  }

  const isValid = selectedPerson !== null && invoice.items.length > 0

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          {/*<div className="flex justify-center mb-6">
            <Logo size="lg" />
          </div>*/}
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
            Phnom Penh Fashion Institute
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Invoice Form */}
          <div className="lg:col-span-2 space-y-8">
            <InvoiceHeader invoice={invoice} onInvoiceChange={handleInvoiceChange} />

            <PersonSelection
              invoiceType={invoice.type}
              selectedPerson={selectedPerson}
              students={students}
              clients={clients}
              onPersonSelect={selectPerson}
              onPersonClear={clearPerson}
              onDataRefresh={() => {
                fetchStudents()
                fetchClients()
              }}
            />

            <InvoiceItems
              items={invoice.items}
              onAddItem={addInvoiceItem}
              onUpdateItem={updateInvoiceItem}
              onRemoveItem={removeInvoiceItem}
            />

            <InvoiceNotes notes={invoice.notes} onNotesChange={(notes) => handleInvoiceChange("notes", notes)} />
          </div>

          {/* Right Panel - Invoice Summary */}
          <div>
            <InvoiceSummary
              invoice={invoice}
              onTaxRateChange={(rate) => handleInvoiceChange("tax_rate", rate)}
              onPreview={() => setShowPreview(true)}
              onSave={saveInvoice}
              onExportPDF={handleExportPDF}
              onPrint={handlePrint}
              isValid={isValid}
            />
          </div>
        </div>

        {/* Invoice Preview Modal */}
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-6xl max-h-[95vh] overflow-y-auto p-0 bg-white">
            <InvoicePreview invoice={invoice} selectedPerson={selectedPerson} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
