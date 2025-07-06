"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { User, Plus, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface InvoiceIssuerSelectorProps {
  value: string
  onChange: (value: string) => void
  className?: string
}

// Common issuer names for the institute
const COMMON_ISSUERS = [
  "Finance Manager",
  "Accounting Officer",
  "Administrative Assistant",
  "Director of Finance",
  "Billing Coordinator",
  "Student Services Manager",
]

export function InvoiceIssuerSelector({ value, onChange, className = "" }: InvoiceIssuerSelectorProps) {
  const [recentIssuers, setRecentIssuers] = useState<string[]>([])
  const [isCustomInput, setIsCustomInput] = useState(false)
  const [customValue, setCustomValue] = useState("")
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    fetchRecentIssuers()
  }, [])

  useEffect(() => {
    // If value is not in common issuers or recent issuers, show custom input
    const allOptions = [...COMMON_ISSUERS, ...recentIssuers]
    if (value && !allOptions.includes(value)) {
      setIsCustomInput(true)
      setCustomValue(value)
    }
  }, [value, recentIssuers])

  const fetchRecentIssuers = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("issuer")
        .not("issuer", "is", null)
        .order("created_at", { ascending: false })
        .limit(10)

      if (error) throw error

      // Get unique recent issuers
      const uniqueIssuers = Array.from(
        new Set(data?.map((item) => item.issuer).filter(Boolean) || []),
      ) as string[]

      setRecentIssuers(uniqueIssuers.slice(0, 5)) // Keep only top 5
    } catch (error) {
      console.error("Error fetching recent issuers:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectChange = (selectedValue: string) => {
    if (selectedValue === "custom") {
      setIsCustomInput(true)
      setCustomValue("")
    } else {
      setIsCustomInput(false)
      onChange(selectedValue)
    }
  }

  const handleCustomSubmit = () => {
    if (customValue.trim()) {
      onChange(customValue.trim())
      setIsCustomInput(false)
      // Refresh recent issuers to include the new one
      fetchRecentIssuers()
    }
  }

  const handleCustomCancel = () => {
    setIsCustomInput(false)
    setCustomValue("")
  }

  const allOptions = [...COMMON_ISSUERS, ...recentIssuers.filter((issuer) => !COMMON_ISSUERS.includes(issuer))]

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-white text-sm flex items-center space-x-2">
        <User className="w-4 h-4" />
        <span>Invoice Issuer *</span>
      </Label>

      {isCustomInput ? (
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={customValue}
              onChange={(e) => setCustomValue(e.target.value)}
              placeholder="Enter issuer name..."
              className="bg-gray-800 border-gray-700 text-white h-10 flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  handleCustomSubmit()
                } else if (e.key === "Escape") {
                  handleCustomCancel()
                }
              }}
              autoFocus
            />
            <Button
              type="button"
              onClick={handleCustomSubmit}
              disabled={!customValue.trim()}
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white px-3 h-10"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              type="button"
              onClick={handleCustomCancel}
              size="sm"
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 bg-transparent px-3 h-10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-gray-400">Press Enter to save or Escape to cancel</p>
        </div>
      ) : (
        <Select value={value} onValueChange={handleSelectChange}>
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-10">
            <SelectValue placeholder="Select or enter issuer name..." />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700">
            {/* Common Issuers */}
            {COMMON_ISSUERS.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide">Common Roles</div>
                {COMMON_ISSUERS.map((issuer) => (
                  <SelectItem key={issuer} value={issuer} className="text-white hover:bg-gray-700">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{issuer}</span>
                    </div>
                  </SelectItem>
                ))}
              </>
            )}

            {/* Recent Issuers */}
            {recentIssuers.length > 0 && (
              <>
                <div className="px-2 py-1 text-xs font-medium text-gray-400 uppercase tracking-wide border-t border-gray-600 mt-1 pt-2">
                  Recent Issuers
                </div>
                {recentIssuers
                  .filter((issuer) => !COMMON_ISSUERS.includes(issuer))
                  .map((issuer) => (
                    <SelectItem key={issuer} value={issuer} className="text-white hover:bg-gray-700">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-blue-400" />
                        <span>{issuer}</span>
                      </div>
                    </SelectItem>
                  ))}
              </>
            )}

            {/* Custom Option */}
            <div className="border-t border-gray-600 mt-1 pt-1">
              <SelectItem value="custom" className="text-white hover:bg-gray-700">
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-green-400" />
                  <span>Enter custom name...</span>
                </div>
              </SelectItem>
            </div>
          </SelectContent>
        </Select>
      )}

      {value && !isCustomInput && (
        <div className="flex items-center justify-between bg-gray-900 p-2 rounded border border-gray-600">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4 text-green-400" />
            <span className="text-white text-sm font-medium">{value}</span>
          </div>
          <Button
            type="button"
            onClick={() => {
              setIsCustomInput(true)
              setCustomValue(value)
            }}
            size="sm"
            variant="ghost"
            className="text-gray-400 hover:text-white h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </div>
      )}
    </div>
  )
}
