"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, GraduationCap, ShoppingBag } from "lucide-react"
import { Logo } from "@/components/logo"

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
    <Card className="bg-muted border-sky-500/20 shadow-xl">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <Logo size="md"/>
          <div className="text-right">
            <CardTitle className="flex items-center gap-2 text-amber-400 text-xl">
              <FileText className="h-6 w-6" />
              Invoice Details
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="invoice-number" className="text-amber-200 font-medium">
              Invoice Number
            </Label>
            <Input
              id="invoice-number"
              value={invoice.invoice_number}
              onChange={(e) => onInvoiceChange("invoice_number", e.target.value)}
              className="bg-background border-amber-500/30 text-white focus:border-amber-400 focus:ring-amber-400/20"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoice-type" className="text-amber-200 font-medium">
              Invoice Type
            </Label>
            <Select
              value={invoice.type}
              onValueChange={(value: "tuition" | "product") => onInvoiceChange("type", value)}
            >
              <SelectTrigger className="bg-background/50 border-amber-500/30 text-white focus:border-amber-400">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-background border-amber-500/30">
                <SelectItem value="tuition" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="h-4 w-4 text-amber-400" />
                    Tuition Fee
                  </div>
                </SelectItem>
                <SelectItem value="product" className="text-white hover:bg-slate-700">
                  <div className="flex items-center gap-2">
                    <ShoppingBag className="h-4 w-4 text-amber-400" />
                    Product Purchase
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="due-date" className="text-amber-200 font-medium">
            Due Date
          </Label>
          <Input
            id="due-date"
            type="date"
            value={invoice.due_date}
            onChange={(e) => onInvoiceChange("due_date", e.target.value)}
            className="bg-background/50 border-amber-500/30 text-white focus:border-amber-400 focus:ring-amber-400/20"
          />
        </div>
      </CardContent>
    </Card>
  )
}
