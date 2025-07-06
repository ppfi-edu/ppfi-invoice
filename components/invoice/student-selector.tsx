"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, User } from "lucide-react"
import { AddStudentModal } from "./add-student-modal"
import type { Student } from "@/types/database"

interface StudentSelectorProps {
  students: Student[]
  selectedStudent: Student | null
  onStudentSelect: (student: Student | null) => void
  onStudentAdded: (student: Student) => void
}

export function StudentSelector({ students, selectedStudent, onStudentSelect, onStudentAdded }: StudentSelectorProps) {
  const [showAddModal, setShowAddModal] = useState(false)

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1">
          <Select
            value={selectedStudent?.id || ""}
            onValueChange={(value) => {
              const student = students.find((s) => s.id === value)
              onStudentSelect(student || null)
            }}
          >
            <SelectTrigger className="bg-gray-950 border-gray-700 text-white h-10">
              <SelectValue placeholder="Choose a student..." />
            </SelectTrigger>
            <SelectContent
              className="bg-gray-950 border-gray-700"
              style={{ zIndex: 9999 }}
              position="popper"
              sideOffset={5}
            >
              {students.map((student) => (
                <SelectItem key={student.id} value={student.id} className="text-white hover:bg-gray-700">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="font-medium truncate">{student.name}</span>
                      <span className="text-gray-400 ml-2 text-xs">({student.student_id})</span>
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
          className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 flex-shrink-0 h-10"
        >
          <Plus className="w-4 h-4 mr-2" />
          <span className="hidden sm:inline">Add Student</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      {selectedStudent && (
        <div className="bg-gray-900 p-3 sm:p-4 rounded-lg border border-gray-600 relative">
          <h4 className="text-white font-medium mb-3 text-sm sm:text-base">Selected Student Details</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase tracking-wide block">Name</span>
              <span className="text-white font-medium block break-words">{selectedStudent.name}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase tracking-wide block">Student ID</span>
              <span className="text-white font-medium block">{selectedStudent.student_id}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase tracking-wide block">Program</span>
              <span className="text-white font-medium block break-words">{selectedStudent.program}</span>
            </div>
            <div className="space-y-1">
              <span className="text-gray-400 text-xs uppercase tracking-wide block">Email</span>
              <span className="text-white font-medium block break-all">{selectedStudent.email}</span>
            </div>
            {selectedStudent.phone && (
              <div className="space-y-1 sm:col-span-2">
                <span className="text-gray-400 text-xs uppercase tracking-wide block">Phone</span>
                <span className="text-white font-medium block">{selectedStudent.phone}</span>
              </div>
            )}
          </div>
        </div>
      )}

      <AddStudentModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onStudentAdded={onStudentAdded} />
    </div>
  )
}
