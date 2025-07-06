"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import type { Student } from "@/types/database"

interface AddStudentModalProps {
  isOpen: boolean
  onClose: () => void
  onStudentAdded: (student: Student) => void
}

const FASHION_PROGRAMS = [
  "Fashion Design",
  "Fashion Marketing",
  "Fashion Merchandising",
  "Textile Design",
  "Fashion Styling",
  "Fashion Photography",
  "Fashion Business Management",
  "Pattern Making",
  "Garment Construction",
  "Fashion Illustration",
]

export function AddStudentModal({ isOpen, onClose, onStudentAdded }: AddStudentModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    student_id: "",
    email: "",
    phone: "",
    program: "",
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const supabase = createClient()

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) newErrors.name = "Name is required"
    if (!formData.student_id.trim()) newErrors.student_id = "Student ID is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Email is invalid"
    if (!formData.program) newErrors.program = "Program is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const generateStudentId = () => {
    const year = new Date().getFullYear().toString().slice(-2)
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")
    return `PPFI${year}${random}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const { data, error } = await supabase.from("students").insert([formData]).select().single()

      if (error) {
        if (error.code === "23505") {
          // Unique constraint violation
          if (error.message.includes("student_id")) {
            setErrors({ student_id: "Student ID already exists" })
          } else if (error.message.includes("email")) {
            setErrors({ email: "Email already exists" })
          }
        } else {
          throw error
        }
        return
      }

      onStudentAdded(data)
      onClose()
      setFormData({ name: "", student_id: "", email: "", phone: "", program: "" })
      setErrors({})
    } catch (error) {
      console.error("Error adding student:", error)
      alert("Error adding student. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onClose()
    setFormData({ name: "", student_id: "", email: "", phone: "", program: "" })
    setErrors({})
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Add New Student</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white">
              Full Name *
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="bg-gray-950 border-gray-700 text-white"
              placeholder="Enter student's full name"
            />
            {errors.name && <p className="text-red-400 text-sm">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="student_id" className="text-white">
                Student ID *
              </Label>
              <Button
                type="button"
                onClick={() => setFormData({ ...formData, student_id: generateStudentId() })}
                size="sm"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-950"
              >
                Generate ID
              </Button>
            </div>
            <Input
              id="student_id"
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="bg-gray-950 border-gray-700 text-white"
              placeholder="e.g., PPFI24001"
            />
            {errors.student_id && <p className="text-red-400 text-sm">{errors.student_id}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="bg-gray-950 border-gray-700 text-white"
              placeholder="student@example.com"
            />
            {errors.email && <p className="text-red-400 text-sm">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-white">
              Phone Number
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="bg-gray-950 border-gray-700 text-white"
              placeholder="+855 12 345 678"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="program" className="text-white">
              Program *
            </Label>
            <Select value={formData.program} onValueChange={(value) => setFormData({ ...formData, program: value })}>
              <SelectTrigger className="bg-gray-950 border-gray-700 text-white">
                <SelectValue placeholder="Select a program..." />
              </SelectTrigger>
              <SelectContent className="bg-gray-950 border-gray-700">
                {FASHION_PROGRAMS.map((program) => (
                  <SelectItem key={program} value={program} className="text-white hover:bg-gray-700">
                    {program}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.program && <p className="text-red-400 text-sm">{errors.program}</p>}
          </div>

          <DialogFooter className="flex gap-2 pt-4">
            <Button
              type="button"
              onClick={handleClose}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-950 bg-transparent"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700 text-white">
              {loading ? "Adding..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
