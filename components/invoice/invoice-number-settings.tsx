"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { InvoiceNumberGenerator, type InvoiceNumberConfig } from "@/lib/invoice-number-generator"

interface InvoiceNumberSettingsProps {
  isOpen: boolean
  onClose: () => void
  onSettingsChanged: () => void
}

export function InvoiceNumberSettings({ isOpen, onClose, onSettingsChanged }: InvoiceNumberSettingsProps) {
  const [config, setConfig] = useState<InvoiceNumberConfig>({
    prefix: "PPFI",
    suffix: "",
    dateFormat: "YYYY",
    sequenceLength: 4,
    separator: "-",
  })

  const [previewGenerator, setPreviewGenerator] = useState(new InvoiceNumberGenerator(config))

  const updatePreview = (newConfig: InvoiceNumberConfig) => {
    setConfig(newConfig)
    setPreviewGenerator(new InvoiceNumberGenerator(newConfig))
  }

  const handleSave = () => {
    // In a real application, you might want to save these settings to localStorage or database
    localStorage.setItem("invoiceNumberConfig", JSON.stringify(config))
    onSettingsChanged()
    onClose()
  }

  const handleReset = () => {
    const defaultConfig: InvoiceNumberConfig = {
      prefix: "PPFI",
      suffix: "",
      dateFormat: "YYYY",
      sequenceLength: 4,
      separator: "-",
    }
    updatePreview(defaultConfig)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Invoice Number Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configuration Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="prefix" className="text-white">
                Prefix
              </Label>
              <Input
                id="prefix"
                value={config.prefix || ""}
                onChange={(e) => updatePreview({ ...config, prefix: e.target.value })}
                className="bg-gray-950 border-gray-700 text-white"
                placeholder="e.g., PPFI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="suffix" className="text-white">
                Suffix (Optional)
              </Label>
              <Input
                id="suffix"
                value={config.suffix || ""}
                onChange={(e) => updatePreview({ ...config, suffix: e.target.value })}
                className="bg-gray-950 border-gray-700 text-white"
                placeholder="e.g., INV"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFormat" className="text-white">
                Date Format
              </Label>
              <Select
                value={config.dateFormat || "YYYY"}
                onValueChange={(value: "YYYY" | "YYMMDD" | "YYYYMMDD" | "none") =>
                  updatePreview({ ...config, dateFormat: value })
                }
              >
                <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-700">
                  <SelectItem value="YYYY" className="text-white hover:bg-gray-700">
                    Year Only (2024)
                  </SelectItem>
                  <SelectItem value="YYMMDD" className="text-white hover:bg-gray-700">
                    Short Date (241205)
                  </SelectItem>
                  <SelectItem value="YYYYMMDD" className="text-white hover:bg-gray-700">
                    Full Date (20241205)
                  </SelectItem>
                  <SelectItem value="none" className="text-white hover:bg-gray-700">
                    No Date
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sequenceLength" className="text-white">
                Sequence Length
              </Label>
              <Select
                value={config.sequenceLength?.toString() || "4"}
                onValueChange={(value) => updatePreview({ ...config, sequenceLength: Number.parseInt(value) })}
              >
                <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-700">
                  <SelectItem value="3" className="text-white hover:bg-gray-700">
                    3 digits (001)
                  </SelectItem>
                  <SelectItem value="4" className="text-white hover:bg-gray-700">
                    4 digits (0001)
                  </SelectItem>
                  <SelectItem value="5" className="text-white hover:bg-gray-700">
                    5 digits (00001)
                  </SelectItem>
                  <SelectItem value="6" className="text-white hover:bg-gray-700">
                    6 digits (000001)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="separator" className="text-white">
                Separator
              </Label>
              <Select
                value={config.separator || "-"}
                onValueChange={(value) => updatePreview({ ...config, separator: value })}
              >
                <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-700">
                  <SelectItem value="-" className="text-white hover:bg-gray-700">
                    Dash (-)
                  </SelectItem>
                  <SelectItem value="_" className="text-white hover:bg-gray-700">
                    Underscore (_)
                  </SelectItem>
                  <SelectItem value="/" className="text-white hover:bg-gray-700">
                    Slash (/)
                  </SelectItem>
                  <SelectItem value="" className="text-white hover:bg-gray-700">
                    None
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Section */}
          <Card className="bg-gray-950 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">Student Invoice:</Label>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <span className="font-mono text-green-400 text-lg">{previewGenerator.getPreview("student")}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Client Invoice:</Label>
                  <div className="bg-gray-900 p-3 rounded border border-gray-600">
                    <span className="font-mono text-blue-400 text-lg">{previewGenerator.getPreview("client")}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            onClick={handleReset}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-950 bg-transparent"
          >
            Reset to Default
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-950 bg-transparent"
          >
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-white text-black hover:bg-gray-200">
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
