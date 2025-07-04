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
    <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-amber-500/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-amber-400">
          <FileText className="h-5 w-5" />
          Additional Notes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Add any additional notes, terms, or special instructions..."
          className="bg-background/50 border-amber-500/30 text-white focus:border-amber-400 min-h-[100px]"
          rows={4}
        />
      </CardContent>
    </Card>
  )
}
