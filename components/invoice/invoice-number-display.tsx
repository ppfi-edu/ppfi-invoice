"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Hash, Eye, Settings } from "lucide-react"
import { generateInvoiceNumber, getInvoiceNumberPreview } from "@/lib/invoice-number-generator"
import { InvoiceNumberSettings } from "./invoice-number-settings"

interface InvoiceNumberDisplayProps {
  invoiceType: "student" | "client"
  onInvoiceNumberGenerated: (invoiceNumber: string) => void
  currentInvoiceNumber?: string
}

export function InvoiceNumberDisplay({
  invoiceType,
  onInvoiceNumberGenerated,
  currentInvoiceNumber,
}: InvoiceNumberDisplayProps) {
  const [invoiceNumber, setInvoiceNumber] = useState<string>(currentInvoiceNumber || "")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
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

  const getTypeColor = (type: "student" | "client") => {
    return type === "student" ? "bg-green-600" : "bg-blue-600"
  }

  const getTypeLabel = (type: "student" | "client") => {
    return type === "student" ? "Student Tuition" : "Client Purchase"
  }

  return (
    <div className="space-y-4">
      <Card className="bg-gray-950 border-gray-700">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-white flex items-center space-x-2">
            <Hash className="w-5 h-5" />
            <span>Invoice Number</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={`${getTypeColor(invoiceType)} text-white`}>{getTypeLabel(invoiceType)}</Badge>
            <Button
              onClick={() => setShowSettings(true)}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Invoice Number Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400">Current Invoice Number:</span>
              <Button
                onClick={handleGenerateNumber}
                disabled={isGenerating}
                size="sm"
                className="bg-white text-black hover:bg-gray-200"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? "animate-spin" : ""}`} />
                {isGenerating ? "Generating..." : "Generate New"}
              </Button>
            </div>

            <div className="bg-gray-900 p-4 rounded-lg border border-gray-600">
              {invoiceNumber ? (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-mono font-bold text-white tracking-wider">{invoiceNumber}</span>
                  <Badge variant="outline" className="border-green-500 text-green-400">
                    Generated
                  </Badge>
                </div>
              ) : (
                <div className="text-center py-4">
                  <span className="text-gray-500 italic">No invoice number generated yet</span>
                </div>
              )}
            </div>
          </div>

          {/* Preview Section */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Eye className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-400">Format Preview:</span>
            </div>
            <div className="bg-gray-900 p-3 rounded-lg border border-gray-600">
              <span className="text-lg font-mono text-gray-300 tracking-wide">{preview}</span>
            </div>
          </div>

          {/* Format Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="text-white font-medium">Format Structure:</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Prefix: PPFI (Institute Code)</li>
                <li>• Type: {invoiceType === "student" ? "STU" : "CLI"} (Invoice Type)</li>
                <li>• Year: {new Date().getFullYear()} (Current Year)</li>
                <li>• Sequence: 0001+ (Auto-increment)</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="text-white font-medium">Features:</h4>
              <ul className="text-gray-400 space-y-1">
                <li>• Automatic generation</li>
                <li>• Uniqueness guaranteed</li>
                <li>• Sequential ordering</li>
                <li>• Concurrent-safe</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <InvoiceNumberSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        onSettingsChanged={updatePreview}
      />
    </div>
  )
}
