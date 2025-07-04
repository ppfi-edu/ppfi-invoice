"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Trash2 } from "lucide-react"

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

interface InvoiceItemsProps {
  items: InvoiceItem[]
  onAddItem: () => void
  onUpdateItem: (id: string, field: keyof InvoiceItem, value: any) => void
  onRemoveItem: (id: string) => void
}

export function InvoiceItems({ items, onAddItem, onUpdateItem, onRemoveItem }: InvoiceItemsProps) {
  return (
    <Card className="bg-black border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Invoice Items</CardTitle>
        <CardDescription className="text-gray-400">Add items to this invoice</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {items.map((item, index) => (
          <div key={item.id} className="bg-gray-900 p-6 rounded-lg border border-gray-800 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-300 font-medium">Item #{index + 1}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveItem(item.id)}
                className="text-red-400 hover:text-red-300 hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2 space-y-2">
                <Label className="text-gray-300 font-medium">Description</Label>
                <Input
                  value={item.description}
                  onChange={(e) => onUpdateItem(item.id, "description", e.target.value)}
                  placeholder="Item description"
                  className="bg-gray-800 border-gray-700 text-white focus:border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">Quantity</Label>
                <Input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => onUpdateItem(item.id, "quantity", Number.parseInt(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-gray-500"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-300 font-medium">Unit Price ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(e) => onUpdateItem(item.id, "unit_price", Number.parseFloat(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-700 text-white focus:border-gray-500"
                />
              </div>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold text-white">Total: ${item.total.toFixed(2)}</span>
            </div>
          </div>
        ))}

        <Button
          onClick={onAddItem}
          variant="outline"
          className="w-full border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 bg-transparent"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Item
        </Button>
      </CardContent>
    </Card>
  )
}
