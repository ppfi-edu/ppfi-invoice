"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { FileText } from "lucide-react"

interface InvoiceNotesProps {
  notes: string
  onNotesChange: (notes: string) => void
}

export function InvoiceNotes({ notes, onNotesChange }: InvoiceNotesProps) {
  return (
    <Card className="bg-black border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <FileText className="h-5 w-5" />
          Additional Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any additional notes, terms, or special instructions..."
          className="bg-gray-900 border-gray-700 text-white focus:border-gray-500 min-h-[100px]"
          rows={4}
        />
      </CardContent>
    </Card>
  )
}
