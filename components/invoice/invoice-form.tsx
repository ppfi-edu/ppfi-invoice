"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2, User, Building } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { InvoiceData, InvoiceItem, Student, Client } from "@/types/database"
import { StudentSelector } from "@/components/invoice/student-selector"
import { ClientSelector } from "@/components/invoice/client-selector"
import { InvoiceNumberCompact } from "@/components/invoice/invoice-number-compact"
import { InvoiceNumberSettingsCompact } from "@/components/invoice/invoice-number-settings-compact"
import { InvoiceStatusSelector } from "@/components/invoice/invoice-status-selector"
import { InvoiceIssuerSelector } from "@/components/invoice/invoice-issuer"

interface InvoiceFormProps {
  onInvoiceCreate: (data: InvoiceData) => void
}

export function InvoiceForm({ onInvoiceCreate }: InvoiceFormProps) {
  const [invoiceType, setInvoiceType] = useState<"student" | "client">("student")
  const [students, setStudents] = useState<Student[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "", quantity: 1, unit_price: 0, total: 0 },
  ])
  const [taxRate, setTaxRate] = useState(10)
  const [dueDate, setDueDate] = useState("")
  const [notes, setNotes] = useState("")
  const [loading, setLoading] = useState(false)
  const [generatedInvoiceNumber, setGeneratedInvoiceNumber] = useState<string>("")
  const [invoiceStatus, setInvoiceStatus] = useState<"draft" | "sent" | "paid" | "overdue">("draft")
  const [invoiceIssuer, setInvoiceIssuer] = useState<string>("")

  const supabase = createClient()

  useEffect(() => {
    fetchStudentsAndClients()
    // Set default issuer from localStorage if available
    const savedIssuer = localStorage.getItem("defaultInvoiceIssuer")
    if (savedIssuer) {
      setInvoiceIssuer(savedIssuer)
    }
  }, [])

  // Save issuer to localStorage when it changes
  useEffect(() => {
    if (invoiceIssuer) {
      localStorage.setItem("defaultInvoiceIssuer", invoiceIssuer)
    }
  }, [invoiceIssuer])

  const fetchStudentsAndClients = async () => {
    try {
      const [studentsResponse, clientsResponse] = await Promise.all([
        supabase.from("students").select("*").order("name"),
        supabase.from("clients").select("*").order("name"),
      ])

      if (studentsResponse.data) setStudents(studentsResponse.data)
      if (clientsResponse.data) setClients(clientsResponse.data)
    } catch (error) {
      console.error("Error fetching data:", error)
    }
  }

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: "",
      quantity: 1,
      unit_price: 0,
      total: 0,
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value }
          if (field === "quantity" || field === "unit_price") {
            updatedItem.total = updatedItem.quantity * updatedItem.unit_price
          }
          return updatedItem
        }
        return item
      }),
    )
  }

  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + item.total, 0)
  }

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100
  }

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!generatedInvoiceNumber) {
      alert("Please generate an invoice number first")
      return
    }

    if (!dueDate) {
      alert("Please select a due date")
      return
    }

    if (!invoiceIssuer.trim()) {
      alert("Please select or enter an invoice issuer")
      return
    }

    if (invoiceType === "student" && !selectedStudent) {
      alert("Please select a student")
      return
    }

    if (invoiceType === "client" && !selectedClient) {
      alert("Please select a client")
      return
    }

    if (items.length === 0 || items.every((item) => !item.description)) {
      alert("Please add at least one item")
      return
    }

    const invoiceData: InvoiceData = {
      invoice_number: generatedInvoiceNumber,
      type: invoiceType,
      student: selectedStudent || undefined,
      client: selectedClient || undefined,
      items: items.filter((item) => item.description.trim() !== ""),
      tax_rate: taxRate,
      due_date: dueDate,
      notes,
      status: invoiceStatus,
      issuer: invoiceIssuer.trim(),
    }

    onInvoiceCreate(invoiceData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      {/* Invoice Type and Number Section */}
      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="grid grid-cols-2 gap-2 md:gap-6">
            <div className="text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <span className="text-base sm:text-lg">Invoice Configuration</span>
              <InvoiceNumberSettingsCompact onSettingsChanged={() => {}} />
            </div>
            <div className="space-y-2">
              <Select value={invoiceType} onValueChange={(value: "student" | "client") => setInvoiceType(value)}>
                <SelectTrigger className="bg-gray-950 border-gray-700 text-white h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-700">
                  <SelectItem value="student" className="text-white hover:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>Student Tuition</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="client" className="text-white hover:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <Building className="w-4 h-4" />
                      <span>Client Purchase</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            <div className="space-y-2">
              <Label className="text-white text-sm">Due Date</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-gray-950 border-gray-700 text-white h-10"
                required
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-1">
              <InvoiceStatusSelector status={invoiceStatus} onStatusChange={setInvoiceStatus} />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InvoiceIssuerSelector value={invoiceIssuer} onChange={setInvoiceIssuer} className="lg:col-span-1" />
            <div className="lg:col-span-1">
              <InvoiceNumberCompact
                invoiceType={invoiceType}
                onInvoiceNumberGenerated={setGeneratedInvoiceNumber}
                currentInvoiceNumber={generatedInvoiceNumber}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student/Client Selection */}
      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-base sm:text-lg">
            {invoiceType === "student" ? "Student Information" : "Client Information"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoiceType === "student" ? (
            <StudentSelector
              students={students}
              selectedStudent={selectedStudent}
              onStudentSelect={setSelectedStudent}
              onStudentAdded={(newStudent) => {
                setStudents([...students, newStudent])
                setSelectedStudent(newStudent)
              }}
            />
          ) : (
            <ClientSelector
              clients={clients}
              selectedClient={selectedClient}
              onClientSelect={setSelectedClient}
              onClientAdded={(newClient) => {
                setClients([...clients, newClient])
                setSelectedClient(newClient)
              }}
            />
          )}
        </CardContent>
      </Card>

      {/* Items Section */}
      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4">
          <CardTitle className="text-white text-base sm:text-lg">Invoice Items</CardTitle>
          <Button
            type="button"
            onClick={addItem}
            size="sm"
            className="bg-white text-black hover:bg-gray-200 w-full sm:w-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, index) => (
            <div
              key={item.id}
              className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-12 sm:gap-4 p-3 sm:p-4 bg-gray-900 rounded-lg"
            >
              <div className="sm:col-span-12 lg:col-span-5">
                <Label className="text-white text-sm">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => updateItem(item.id, "description", e.target.value)}
                  placeholder="Item description..."
                  className="bg-gray-950 border-gray-700 text-white h-10 mt-1"
                />
              </div>
              <div className="sm:col-span-4 lg:col-span-2">
                <Label className="text-white text-sm">Quantity</Label>
                <Input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(e) => updateItem(item.id, "quantity", Number.parseInt(e.target.value) || 1)}
                  className="bg-gray-950 border-gray-700 text-white h-10 mt-1"
                />
              </div>
              <div className="sm:col-span-4 lg:col-span-2">
                <Label className="text-white text-sm">Unit Price ($)</Label>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={(item.unit_price && item.unit_price.toString().replace(/^0+(?!\.|$)/, '')) || ''}
                  onChange={(e) => {
                    const newValue = e.target.value;
                    const parsedValue = newValue ? Number.parseFloat(newValue.replace(/^0+(?=\d)/, '')) : 0;
                    updateItem(item.id, "unit_price", parsedValue);
                  }}
                  onChange={(e) => updateItem(item.id, "unit_price", Number.parseFloat(e.target.value) || 0)}
                  className="bg-gray-950 border-gray-700 text-white h-10 mt-1"
                />
              </div>
              <div className="sm:col-span-3 lg:col-span-2">
                <Label className="text-white text-sm">Total ($)</Label>
                <Input
                  value={item.total.toFixed(2)}
                  readOnly
                  className="bg-gray-700 border-gray-600 text-white h-10 mt-1"
                />
              </div>
              <div className="sm:col-span-1 lg:col-span-1 flex items-end">
                <Button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  size="sm"
                  variant="destructive"
                  disabled={items.length === 1}
                  className="w-full sm:w-auto h-10 mt-1 sm:mt-0"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="ml-2 sm:hidden">Remove</span>
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tax and Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white text-sm">Tax Rate (%)</Label>
            <Input
              type="number"
              min="0"
              max="100"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(Number.parseFloat(e.target.value) || 0)}
              className="bg-gray-950 border-gray-700 text-white h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white text-sm">Notes</Label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className="bg-gray-950 border-gray-700 text-white min-h-[80px] resize-none"
              rows={3}
            />
          </div>
        </div>

        <Card className="bg-gray-950 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-base sm:text-lg">Invoice Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-white text-sm sm:text-base">
              <span>Subtotal:</span>
              <span>${calculateSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-white text-sm sm:text-base">
              <span>Tax ({taxRate}%):</span>
              <span>${calculateTax().toFixed(2)}</span>
            </div>
            <div className="border-t border-gray-600 pt-3">
              <div className="flex justify-between text-lg sm:text-xl font-bold text-white">
                <span>Total:</span>
                <span>${calculateTotal().toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          className="bg-white text-black hover:bg-gray-200 px-6 sm:px-8 py-2 w-full sm:w-auto"
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Invoice"}
        </Button>
      </div>
    </form>
  )
}
