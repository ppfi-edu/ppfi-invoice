"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Hash, Copy, Check } from "lucide-react"
import { generateInvoiceNumber, getInvoiceNumberPreview } from "@/lib/invoice-number-generator"

interface InvoiceNumberCompactProps {
  invoiceType: "student" | "client"
  onInvoiceNumberGenerated: (invoiceNumber: string) => void
  currentInvoiceNumber?: string
}

export function InvoiceNumberCompact({
  invoiceType,
  onInvoiceNumberGenerated,
  currentInvoiceNumber,
}: InvoiceNumberCompactProps) {
  const [invoiceNumber, setInvoiceNumber] = useState<string>(currentInvoiceNumber || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [preview, setPreview] = useState<string>("")

  useEffect(() => {
    updatePreview()
  }, [invoiceType])

  useEffect(() => {
    if (currentInvoiceNumber) {
      setInvoiceNumber(currentInvoiceNumber)
    }
  }, [currentInvoiceNumber])

  const updatePreview = () => {
    const previewNumber = getInvoiceNumberPreview(invoiceType)
    setPreview(previewNumber)
  }

  const handleGenerateNumber = async () => {
    setIsGenerating(true)
    try {
      const newInvoiceNumber = await generateInvoiceNumber(invoiceType)
      setInvoiceNumber(newInvoiceNumber)
      onInvoiceNumberGenerated(newInvoiceNumber)
    } catch (error) {
      console.error("Error generating invoice number:", error)
      alert("Error generating invoice number. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCopy = async () => {
    if (invoiceNumber) {
      await navigator.clipboard.writeText(invoiceNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getTypeColor = (type: "student" | "client") => {
    return type === "student" ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
  }

  const getTypeLabel = (type: "student" | "client") => {
    return type === "student" ? "STU" : "CLI"
  }

  return (
    <div className="bg-gray-950 border border-gray-700 rounded-lg p-3 sm:p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Hash className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-white">Invoice Number</span>
        </div>
        <Badge className={`${getTypeColor(invoiceType)} text-white text-xs px-2 py-1`}>
          {getTypeLabel(invoiceType)}
        </Badge>
      </div>

      {/* Invoice Number Display */}
      <div className="space-y-2">
        {invoiceNumber ? (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-gray-900 p-3 rounded-md border border-gray-600 gap-2">
            <span className="font-mono text-base sm:text-lg font-bold text-white tracking-wide break-all">
              {invoiceNumber}
            </span>
            <div className="flex items-center space-x-2 flex-shrink-0">
              <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                Generated
              </Badge>
              <Button
                onClick={handleCopy}
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-900 p-3 rounded-md border border-gray-600 border-dashed">
            <span className="text-gray-500 text-sm italic">Click generate to create invoice number</span>
          </div>
        )}

        {/* Preview */}
        <div className="text-xs text-gray-400">
          <span>Format: </span>
          <span className="font-mono text-gray-300 break-all">{preview}</span>
        </div>
      </div>

      {/* Generate Button */}
      <Button
        onClick={handleGenerateNumber}
        disabled={isGenerating}
        size="sm"
        className="w-full bg-white text-black hover:bg-gray-200 h-8 text-sm"
      >
        <RefreshCw className={`w-3 h-3 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
        {isGenerating ? "Generating..." : invoiceNumber ? "Regenerate" : "Generate Number"}
      </Button>
    </div>
  )
}
