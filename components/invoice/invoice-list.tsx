"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Eye, Search, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import type { Invoice } from "@/types/database"

export function InvoiceList() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [issuerFilter, setIssuerFilter] = useState<string>("all")
  const [uniqueIssuers, setUniqueIssuers] = useState<string[]>([])

  const supabase = createClient()

  useEffect(() => {
    fetchInvoices()
  }, [])

  const fetchInvoices = async () => {
    try {
      const { data, error } = await supabase.from("invoices").select("*").order("created_at", { ascending: false })

      if (error) throw error

      const invoiceData = data || []
      setInvoices(invoiceData)

      // Extract unique issuers for filter
      const issuers = Array.from(
        new Set(invoiceData.map((invoice) => invoice.issuer).filter(Boolean)),
      ) as string[]
      setUniqueIssuers(issuers)
    } catch (error) {
      console.error("Error fetching invoices:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredInvoices = invoices.filter((invoice) => {
    const matchesSearch =
      invoice.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.issuer && invoice.issuer.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter
    const matchesIssuer = issuerFilter === "all" || invoice.issuer === issuerFilter
    return matchesSearch && matchesStatus && matchesIssuer
  })

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "paid":
        return "bg-green-600"
      case "sent":
        return "bg-blue-600"
      case "overdue":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  if (loading) {
    return (
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="py-8 sm:py-12 text-center">
          <p className="text-gray-400 text-sm sm:text-base">Loading invoices...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Search and Filter */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="pb-4">
          <CardTitle className="text-white text-base sm:text-lg">Invoice Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by invoice number or issuer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-800 border-gray-700 text-white h-10"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm h-10 flex-1 sm:flex-none sm:min-w-[120px]"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="sent">Sent</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
              </select>

              <select
                value={issuerFilter}
                onChange={(e) => setIssuerFilter(e.target.value)}
                className="px-3 sm:px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm h-10 flex-1 sm:flex-none sm:min-w-[150px]"
              >
                <option value="all">All Issuers</option>
                {uniqueIssuers.map((issuer) => (
                  <option key={issuer} value={issuer}>
                    {issuer}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoice List */}
      <div className="grid gap-3 sm:gap-4">
        {filteredInvoices.length === 0 ? (
          <Card className="bg-gray-900 border-gray-800">
            <CardContent className="py-8 sm:py-12 text-center">
              <p className="text-gray-400 text-sm sm:text-base">No invoices found.</p>
            </CardContent>
          </Card>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="bg-gray-900 border-gray-800 hover:bg-gray-800 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <h3 className="text-base sm:text-lg font-semibold text-white break-all">
                        #{invoice.invoice_number}
                      </h3>
                      <Badge className={`${getStatusColor(invoice.status)} text-white text-xs`}>
                        {invoice.status || "draft"}
                      </Badge>
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {invoice.type}
                      </Badge>
                      {invoice.issuer && (
                        <Badge variant="outline" className="border-blue-600 text-blue-400 text-xs">
                          <User className="w-3 h-3 mr-1" />
                          {invoice.issuer}
                        </Badge>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 text-xs sm:text-sm text-gray-400">
                      <div>
                        <p>
                          Total: <span className="text-white font-semibold">${invoice.total.toFixed(2)}</span>
                        </p>
                      </div>
                      <div>
                        <p>Due: {new Date(invoice.due_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p>Created: {invoice.created_at ? new Date(invoice.created_at).toLocaleDateString() : "N/A"}</p>
                      </div>
                      {invoice.issuer && (
                        <div>
                          <p className="truncate">
                            Issuer: <span className="text-blue-400">{invoice.issuer}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 lg:flex-shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-white hover:bg-gray-800 bg-transparent w-full sm:w-auto"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      View
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
