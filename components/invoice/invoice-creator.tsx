"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { InvoiceForm } from "./invoice-form"
import { InvoiceList } from "./invoice-list"
import type { InvoiceItem, Student, Client } from "@/types/database"
import { InvoicePreviewPrintable } from "./invoice-preview-printable"

export type InvoiceData = {
  invoice_number?: string
  type: "student" | "client"
  student?: Student
  client?: Client
  items: InvoiceItem[]
  tax_rate: number
  due_date: string
  notes: string
  status: "draft" | "sent" | "paid" | "overdue"
  issuer?: string
}

export function InvoiceCreator() {
  const [activeTab, setActiveTab] = useState("create")
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)

  return (
    <div className="space-y-4 sm:space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-900 border border-gray-800 h-auto">
          <TabsTrigger
            value="create"
            className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm py-2 sm:py-3"
          >
            <span className="hidden sm:inline">Create Invoice</span>
            <span className="sm:hidden">Create</span>
          </TabsTrigger>
          <TabsTrigger
            value="preview"
            className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm py-2 sm:py-3"
          >
            Preview
          </TabsTrigger>
          <TabsTrigger
            value="list"
            className="data-[state=active]:bg-white data-[state=active]:text-black text-xs sm:text-sm py-2 sm:py-3"
          >
            <span className="hidden sm:inline">Invoice List</span>
            <span className="sm:hidden">List</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="text-white text-lg sm:text-xl">Create New Invoice</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <InvoiceForm
                onInvoiceCreate={(data) => {
                  setInvoiceData(data)
                  setActiveTab("preview")
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          {invoiceData ? (
            <InvoicePreviewPrintable invoiceData={invoiceData} onBack={() => setActiveTab("create")} />
          ) : (
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="py-8 sm:py-12 text-center">
                <p className="text-gray-400 text-sm sm:text-base">
                  No invoice data to preview. Please create an invoice first.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="list" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <InvoiceList />
        </TabsContent>
      </Tabs>
    </div>
  )
}
