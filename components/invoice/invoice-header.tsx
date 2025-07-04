"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, GraduationCap, ShoppingBag } from "lucide-react"
import Logo from "@/components/logo"

interface InvoiceHeaderProps {
  invoice: {
    invoice_number: string
    type: "tuition" | "product"
    due_date: string
  }
  onInvoiceChange: (field: string, value: any) => void
}

export function InvoiceHeader({ invoice, onInvoiceChange }: InvoiceHeaderProps) {
  return (
    <Card className="bg-black border-gray-800">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Logo size="md" />
          <div className="text-right">
            <CardTitle className="flex items-center gap-2 text-white text-xl">
              <FileText className="h-6 w-6" />
              Invoice Details
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="invoice-number" className="text-gray-300 font-medium">
              Invoice Number
            </Label>
            <Input
              id="invoice-number"
              value={invoice.invoice_number}
              onChange={(e) => onInvoiceChange("invoice_number", e.target.value)}
              className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-type" className="text-gray-300 font-medium">
              Invoice Type
            </Label>
            <Select
              value={invoice.type}
              onValueChange={(value: "tuition" | "product") => onInvoiceChange("type", value)}
            >
              <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-gray-700">
                <SelectItem value="tuition" className="text-white hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Tuition Fee
                  </div>
                </SelectItem>
                <SelectItem value="product" className="text-white hover:bg-gray-800">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4" />
                    Product Purchase
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-date" className="text-gray-300 font-medium">
            Due Date
          </Label>
          <Input
            id="due-date"
            type="date"
            value={invoice.due_date}
            onChange={(e) => onInvoiceChange("due_date", e.target.value)}
            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
          />
        </div>
      </CardContent>
    </Card>
  )
}
