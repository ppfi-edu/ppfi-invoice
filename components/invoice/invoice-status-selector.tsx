"use client"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { FileText, Send, CheckCircle, AlertCircle } from "lucide-react"

interface InvoiceStatusSelectorProps {
  status: "draft" | "issue" | "paid" | "overdue"
  onStatusChange: (status: "draft" | "sent" | "paid" | "overdue") => void
}

export function InvoiceStatusSelector({ status, onStatusChange }: InvoiceStatusSelectorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "draft":
        return <FileText className="w-4 h-4" />
      case "issue":
        return <Send className="w-4 h-4" />
      case "paid":
        return <CheckCircle className="w-4 h-4" />
      case "overdue":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <FileText className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-600"
      case "issue":
        return "bg-blue-600"
      case "paid":
        return "bg-green-600"
      case "overdue":
        return "bg-red-600"
      default:
        return "bg-gray-600"
    }
  }

  const getStatusDescription = (status: string) => {
    switch (status) {
      case "draft":
        return "Invoice is being prepared"
      case "sent":
        return "Invoice has been sent to client"
      case "paid":
        return "Payment has been received"
      case "overdue":
        return "Payment is past due date"
      default:
        return ""
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-white">Invoice Status</Label>
        <Badge className={`${getStatusColor(status)} text-white`}>
          <div className="flex items-center space-x-1">
            {getStatusIcon(status)}
            <span className="capitalize">{status}</span>
          </div>
        </Badge>
      </div>

      <Select value={status} onValueChange={(value: "draft" | "sent" | "paid" | "overdue") => onStatusChange(value)}>
        <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-gray-950 border-gray-700">
          <SelectItem value="draft" className="text-white hover:bg-gray-700">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-gray-400" />
              <span>Draft</span>
            </div>
          </SelectItem>
          <SelectItem value="sent" className="text-white hover:bg-gray-700">
            <div className="flex items-center space-x-2">
              <Send className="w-4 h-4 text-blue-400" />
              <span>Issue </span>
            </div>
          </SelectItem>
          <SelectItem value="paid" className="text-white hover:bg-gray-700">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Paid</span>
            </div>
          </SelectItem>
          <SelectItem value="overdue" className="text-white hover:bg-gray-700">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span>Overdue</span>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>

      <p className="text-xs text-gray-400">{getStatusDescription(status)}</p>
    </div>
  )
}
