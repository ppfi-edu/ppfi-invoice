"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Eye, Save, Download, Printer } from "lucide-react"

interface InvoiceSummaryProps {
  invoice: {
    subtotal: number
    tax_rate: number
    tax_amount: number
    total: number
  }
  onTaxRateChange: (rate: number) => void
  onPreview: () => void
  onSave: () => void
  onExportPDF: () => void
  onPrint: () => void
  isValid: boolean
}

export function InvoiceSummary({
  invoice,
  onTaxRateChange,
  onPreview,
  onSave,
  onExportPDF,
  onPrint,
  isValid,
}: InvoiceSummaryProps) {
  return (
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/20 shadow-xl sticky top-6">
      <CardHeader>
        <CardTitle className="text-amber-400">Invoice Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex justify-between text-gray-300">
            <span>Subtotal:</span>
            <span className="font-medium">${invoice.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <Label className="text-amber-200 font-medium">Tax Rate (%):</Label>
            <Input
              type="number"
              value={invoice.tax_rate}
              onChange={(e) => onTaxRateChange(Number.parseFloat(e.target.value) || 0)}
              className="w-20 bg-background/50 border-amber-500/30 text-white text-right focus:border-amber-400"
            />
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Tax Amount:</span>
            <span className="font-medium">${invoice.tax_amount.toFixed(2)}</span>
          </div>
          <Separator className="bg-amber-500/30" />
          <div className="flex justify-between text-2xl font-bold text-amber-400">
            <span>Total:</span>
            <span>${invoice.total.toFixed(2)}</span>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <Button
            onClick={onPreview}
            variant="outline"
            className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 bg-transparent"
            disabled={!isValid}
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Invoice
          </Button>

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onExportPDF}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 bg-transparent"
              disabled={!isValid}
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </Button>
            <Button
              onClick={onPrint}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10 hover:border-amber-400 bg-transparent"
              disabled={!isValid}
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>

          <Button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium shadow-lg"
            disabled={!isValid}
          >
            <Save className="h-4 w-4 mr-2" />
            Save Invoice
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
