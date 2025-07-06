"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Building } from "lucide-react"
import { AddClientModal } from "./add-client-modal"
import type { Client } from "@/types/database"

interface ClientSelectorProps {
  clients: Client[]
  selectedClient: Client | null
  onClientSelect: (client: Client | null) => void
  onClientAdded: (client: Client) => void
}

export function ClientSelector({ clients, selectedClient, onClientSelect, onClientAdded }: ClientSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <Select
            value={selectedClient?.id || ""}
            onValueChange={(value) => {
              const client = clients.find((c) => c.id === value)
              onClientSelect(client || null)
            }}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-white h-10">
              <SelectValue placeholder="Choose a client..." />
            </SelectTrigger>
            <SelectContent
              className="bg-gray-800 border-gray-700"
              style={{ zIndex: 9999 }}
              position="popper"
              sideOffset={5}
            >
              {clients.map((client) => (
                <SelectItem key={client.id} value={client.id} className="text-white hover:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium truncate">{client.name}</span>
                      <span className="text-gray-400 ml-2 text-xs truncate">({client.email})</span>
                    </div>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 flex-shrink-0 h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Client</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {selectedClient && (
        <div className="bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-600 relative">
          <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Selected Client Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase tracking-wide block">Name</span>
              <span className="text-white font-medium block break-words">{selectedClient.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase tracking-wide block">Email</span>
              <span className="text-white font-medium block break-all">{selectedClient.email}</span>
            </div>
            {selectedClient.phone && (
              <div className="space-y-1">
                <span className="text-gray-400 text-xs uppercase tracking-wide block">Phone</span>
                <span className="text-white font-medium block">{selectedClient.phone}</span>
              </div>
            )}
            {selectedClient.address && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide block">Address</span>
                <span className="text-white font-medium block break-words">{selectedClient.address}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <AddClientModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onClientAdded={onClientAdded} />
    </div>
  )
}
