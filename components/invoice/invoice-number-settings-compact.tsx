"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Settings } from "lucide-react"
import { InvoiceNumberGenerator, type InvoiceNumberConfig } from "@/lib/invoice-number-generator"

interface InvoiceNumberSettingsCompactProps {
  onSettingsChanged: () => void
}

export function InvoiceNumberSettingsCompact({ onSettingsChanged }: InvoiceNumberSettingsCompactProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [config, setConfig] = useState<InvoiceNumberConfig>({
    prefix: "PPFI",
    sequenceLength: 4,
    separator: "-",
  })

  const [previewGenerator, setPreviewGenerator] = useState(new InvoiceNumberGenerator(config))

  const updatePreview = (newConfig: InvoiceNumberConfig) => {
    setConfig(newConfig)
    setPreviewGenerator(new InvoiceNumberGenerator(newConfig))
  }

  const handleSave = () => {
    localStorage.setItem("invoiceNumberConfig", JSON.stringify(config))
    onSettingsChanged()
    setIsOpen(false)
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        size="sm"
        variant="outline"
        className="border-gray-600 text-gray-300 hover:bg-gray-700 bg-transparent h-8 px-2"
      >
        <Settings className="w-3 h-3" />
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Number Format Settings</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prefix" className="text-white text-sm">
                Prefix
              </Label>
              <Input
                id="prefix"
                value={config.prefix || ""}
                onChange={(e) => updatePreview({ ...config, prefix: e.target.value })}
                className="bg-gray-950 border-gray-700 text-white h-8"
                placeholder="PPFI"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sequenceLength" className="text-white text-sm">
                Sequence Length
              </Label>
              <Select
                value={config.sequenceLength?.toString() || "4"}
                onValueChange={(value) => updatePreview({ ...config, sequenceLength: Number.parseInt(value) })}
              >
                <SelectTrigger className="bg-gray-950 border-gray-700 text-white h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-950 border-gray-700">
                  <SelectItem value="3" className="text-white hover:bg-gray-700">
                    3 digits
                  </SelectItem>
                  <SelectItem value="4" className="text-white hover:bg-gray-700">
                    4 digits
                  </SelectItem>
                  <SelectItem value="5" className="text-white hover:bg-gray-700">
                    5 digits
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview */}
            <div className="bg-gray-950 p-3 rounded border border-gray-600">
              <Label className="text-gray-400 text-xs">Preview:</Label>
              <div className="grid grid-cols-1 gap-2 mt-2">
                <div className="text-xs">
                  <span className="text-gray-400">Student: </span>
                  <span className="font-mono text-green-400">{previewGenerator.getPreview("student")}</span>
                </div>
                <div className="text-xs">
                  <span className="text-gray-400">Client: </span>
                  <span className="font-mono text-blue-400">{previewGenerator.getPreview("client")}</span>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              onClick={() => setIsOpen(false)}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-950 bg-transparent"
            >
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-white text-black hover:bg-gray-200">
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
