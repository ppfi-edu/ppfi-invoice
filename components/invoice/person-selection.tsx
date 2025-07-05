"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Search, Plus, UserPlus, Building } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Student {
  id: string
  name: string
  email: string
  phone: string
  student_id: string
  program: string
}

interface Client {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface PersonSelectionProps {
  invoiceType: "tuition" | "product"
  selectedPerson: Student | Client | null
  students: Student[]
  clients: Client[]
  onPersonSelect: (person: Student | Client) => void
  onPersonClear: () => void
  onDataRefresh: () => void
}

interface NewStudentForm {
  name: string
  email: string
  phone: string
  student_id: string
  program: string
}

interface NewClientForm {
  name: string
  email: string
  phone: string
  address: string
}

const PROGRAMS = [
  "BFA-SEMESTER",
  "BFA-YEAR",
  "BFA-INS",
  "BSc-SEMESTER",
  "BSc-YEAR",
  "BSc-INS",
  "DFD-SEMESTER",
  "DFD-YEAR",
  "DFB-SEMESTER",
  "DFB-YEAR",
  "Fashion Design Studio-SC",
  "Fashion Marketing-SC",
  "Fashion Business-SC",
  "Digital Fashion Illustration-SC",
  "Fashion Illustration-SC",
  "Fashion Styling-SC",
  "Fashion Photography-SC",
  "Trend Forecasting-SC",
  "Pattern Development-SC",
]

export function PersonSelection({
  invoiceType,
  selectedPerson,
  students,
  clients,
  onPersonSelect,
  onPersonClear,
  onDataRefresh,
}: PersonSelectionProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("existing")
  const [personType, setPersonType] = useState<"student" | "client">("student")
  const [isLoading, setIsLoading] = useState(false)

  const [newStudent, setNewStudent] = useState<NewStudentForm>({
    name: "",
    email: "",
    phone: "",
    student_id: "",
    program: "",
  })

  const [newClient, setNewClient] = useState<NewClientForm>({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  const supabase = createClient()

  const filteredStudents = students.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.student_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const resetForms = () => {
    setNewStudent({
      name: "",
      email: "",
      phone: "",
      student_id: "",
      program: "",
    })
    setNewClient({
      name: "",
      email: "",
      phone: "",
      address: "",
    })
    setSearchTerm("")
    setActiveTab("existing")
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForms()
  }

  const handlePersonSelect = (person: Student | Client) => {
    onPersonSelect(person)
    handleDialogClose()
  }

  const generateStudentId = () => {
    const fullYear = new Date().getFullYear()
    const year = fullYear.toString().slice(-2)
    const randomNum = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")
    return `PPFI${year}-${randomNum}`
  }

  const validateStudentForm = (): boolean => {
    if (!newStudent.name.trim()) {
      toast({ title: "Error", description: "Student name is required", variant: "destructive" })
      return false
    }
    if (!newStudent.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" })
      return false
    }
    if (!newStudent.phone.trim()) {
      toast({ title: "Error", description: "Phone number is required", variant: "destructive" })
      return false
    }
    if (!newStudent.program) {
      toast({ title: "Error", description: "Program is required", variant: "destructive" })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newStudent.email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" })
      return false
    }

    return true
  }

  const validateClientForm = (): boolean => {
    if (!newClient.name.trim()) {
      toast({ title: "Error", description: "Client name is required", variant: "destructive" })
      return false
    }
    if (!newClient.email.trim()) {
      toast({ title: "Error", description: "Email is required", variant: "destructive" })
      return false
    }
    if (!newClient.phone.trim()) {
      toast({ title: "Error", description: "Phone number is required", variant: "destructive" })
      return false
    }
    if (!newClient.address.trim()) {
      toast({ title: "Error", description: "Address is required", variant: "destructive" })
      return false
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(newClient.email)) {
      toast({ title: "Error", description: "Please enter a valid email address", variant: "destructive" })
      return false
    }

    return true
  }

  const addNewStudent = async () => {
    if (!validateStudentForm()) return

    setIsLoading(true)

    try {
      const studentId = newStudent.student_id || generateStudentId()

      const { data, error } = await supabase
        .from("students")
        .insert([
          {
            name: newStudent.name.trim(),
            email: newStudent.email.trim().toLowerCase(),
            phone: newStudent.phone.trim(),
            student_id: studentId,
            program: newStudent.program,
          },
        ])
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          if (error.message.includes("email")) {
            toast({ title: "Error", description: "A student with this email already exists", variant: "destructive" })
          } else if (error.message.includes("student_id")) {
            toast({ title: "Error", description: "A student with this ID already exists", variant: "destructive" })
          } else {
            toast({ title: "Error", description: "Student already exists", variant: "destructive" })
          }
        } else {
          toast({ title: "Error", description: "Failed to add student", variant: "destructive" })
        }
        return
      }

      toast({ title: "Success", description: "Student added successfully" })
      onDataRefresh()
      handlePersonSelect(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to add student", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  const addNewClient = async () => {
    if (!validateClientForm()) return

    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("clients")
        .insert([
          {
            name: newClient.name.trim(),
            email: newClient.email.trim().toLowerCase(),
            phone: newClient.phone.trim(),
            address: newClient.address.trim(),
          },
        ])
        .select()
        .single()

      if (error) {
        if (error.code === "23505") {
          toast({ title: "Error", description: "A client with this email already exists", variant: "destructive" })
        } else {
          toast({ title: "Error", description: "Failed to add client", variant: "destructive" })
        }
        return
      }

      toast({ title: "Success", description: "Client added successfully" })
      onDataRefresh()
      handlePersonSelect(data)
    } catch (error) {
      toast({ title: "Error", description: "Failed to add client", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-muted border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <User className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent>
        {selectedPerson ? (
          <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
            <div className="flex justify-between items-start mb-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  {"student_id" in selectedPerson ? (
                    <Badge className="bg-gray-800 text-white border-gray-700">
                      <User className="h-3 w-3 mr-1" />
                      Student
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-800 text-white border-gray-700">
                      <Building className="h-3 w-3 mr-1" />
                      Client
                    </Badge>
                  )}
                </div>
                <h3 className="font-semibold text-white text-lg">{selectedPerson.name}</h3>
                <p className="text-gray-300">{selectedPerson.email}</p>
                <p className="text-gray-400">{selectedPerson.phone}</p>
                {"student_id" in selectedPerson && (
                  <>
                    <Badge variant="secondary" className="bg-gray-800 text-gray-300 border-gray-700">
                      ID: {selectedPerson.student_id}
                    </Badge>
                    <Badge variant="outline" className="border-gray-700 text-gray-300 ml-2">
                      {selectedPerson.program}
                    </Badge>
                  </>
                )}
                {"address" in selectedPerson && <p className="text-gray-400 text-sm">{selectedPerson.address}</p>}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onPersonClear}
                className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:border-gray-600 bg-transparent"
              >
                Change
              </Button>
            </div>
          </div>
        ) : (
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-white hover:bg-gray-200 text-black font-medium">
                <Plus className="h-4 w-4 mr-2" />
                Select or Add Person
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-black border-gray-800 text-white max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">Select or Add Person</DialogTitle>
                <DialogDescription className="text-gray-400">
                  Choose from existing people or add a new student/client
                </DialogDescription>
              </DialogHeader>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-gray-800">
                  <TabsTrigger
                    value="existing"
                    className="data-[state=active]:bg-gray-800 data-[state=active]:text-white"
                  >
                    Select Existing
                  </TabsTrigger>
                  <TabsTrigger value="new" className="data-[state=active]:bg-gray-800 data-[state=active]:text-white">
                    Add New
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="existing" className="space-y-4 mt-6">
                  <div className="flex gap-4 items-center">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search by name, email, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={personType === "student" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPersonType("student")}
                        className={
                          personType === "student"
                            ? "bg-white text-black hover:bg-gray-200"
                            : "border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                        }
                      >
                        <User className="h-4 w-4 mr-1" />
                        Students
                      </Button>
                      <Button
                        variant={personType === "client" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setPersonType("client")}
                        className={
                          personType === "client"
                            ? "bg-white text-black hover:bg-gray-200"
                            : "border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                        }
                      >
                        <Building className="h-4 w-4 mr-1" />
                        Clients
                      </Button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto space-y-2">
                    {personType === "student"
                      ? filteredStudents.map((student) => (
                          <div
                            key={student.id}
                            className="p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-all duration-200 border border-gray-800 hover:border-gray-700"
                            onClick={() => handlePersonSelect(student)}
                          >
                            <div className="flex justify-between items-center">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-white">{student.name}</h4>
                                  <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-xs">Student</Badge>
                                </div>
                                <p className="text-sm text-gray-300">{student.email}</p>
                                <p className="text-sm text-gray-400">{student.phone}</p>
                                <div className="flex gap-2 mt-2">
                                  <Badge variant="outline" className="text-xs border-gray-700 text-gray-300">
                                    {student.student_id}
                                  </Badge>
                                  <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-xs">
                                    {student.program}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      : filteredClients.map((client) => (
                          <div
                            key={client.id}
                            className="p-4 bg-gray-900 rounded-lg cursor-pointer hover:bg-gray-800 transition-all duration-200 border border-gray-800 hover:border-gray-700"
                            onClick={() => handlePersonSelect(client)}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium text-white">{client.name}</h4>
                                <Badge className="bg-gray-800 text-gray-300 border-gray-700 text-xs">Client</Badge>
                              </div>
                              <p className="text-sm text-gray-300">{client.email}</p>
                              <p className="text-sm text-gray-400">{client.phone}</p>
                              <p className="text-sm text-gray-500">{client.address}</p>
                            </div>
                          </div>
                        ))}

                    {((personType === "student" && filteredStudents.length === 0) ||
                      (personType === "client" && filteredClients.length === 0)) && (
                      <div className="text-center py-8 text-gray-500">
                        <p>No {personType}s found</p>
                        <p className="text-sm mt-1">Try adjusting your search or add a new {personType}</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="new" className="space-y-6 mt-6">
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={personType === "student" ? "default" : "outline"}
                      onClick={() => setPersonType("student")}
                      className={
                        personType === "student"
                          ? "bg-white text-black hover:bg-gray-200"
                          : "border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      }
                    >
                      <UserPlus className="h-4 w-4 mr-2" />
                      Add Student
                    </Button>
                    <Button
                      variant={personType === "client" ? "default" : "outline"}
                      onClick={() => setPersonType("client")}
                      className={
                        personType === "client"
                          ? "bg-white text-black hover:bg-gray-200"
                          : "border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                      }
                    >
                      <Building className="h-4 w-4 mr-2" />
                      Add Client
                    </Button>
                  </div>

                  {personType === "student" ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Full Name *</Label>
                          <Input
                            value={newStudent.name}
                            onChange={(e) => setNewStudent((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter student name"
                            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Email Address *</Label>
                          <Input
                            type="email"
                            value={newStudent.email}
                            onChange={(e) => setNewStudent((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address"
                            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Phone Number *</Label>
                          <Input
                            value={newStudent.phone}
                            onChange={(e) => setNewStudent((prev) => ({ ...prev, phone: e.target.value }))}
                            placeholder="+855 12 345 678"
                            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Student ID</Label>
                          <Input
                            value={newStudent.student_id}
                            onChange={(e) => setNewStudent((prev) => ({ ...prev, student_id: e.target.value }))}
                            placeholder="Auto-generated if empty"
                            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 font-medium">Program *</Label>
                        <Select
                          value={newStudent.program}
                          onValueChange={(value) => setNewStudent((prev) => ({ ...prev, program: value }))}
                        >
                          <SelectTrigger className="bg-gray-900 border-gray-700 text-white focus:border-gray-500">
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-900 border-gray-700">
                            {PROGRAMS.map((program) => (
                              <SelectItem key={program} value={program} className="text-white hover:bg-gray-800">
                                {program}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <Button
                        onClick={addNewStudent}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-medium"
                      >
                        {isLoading ? "Adding Student..." : "Add Student"}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Company/Client Name *</Label>
                          <Input
                            value={newClient.name}
                            onChange={(e) => setNewClient((prev) => ({ ...prev, name: e.target.value }))}
                            placeholder="Enter client name"
                            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-gray-300 font-medium">Email Address *</Label>
                          <Input
                            type="email"
                            value={newClient.email}
                            onChange={(e) => setNewClient((prev) => ({ ...prev, email: e.target.value }))}
                            placeholder="Enter email address"
                            className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 font-medium">Phone Number *</Label>
                        <Input
                          value={newClient.phone}
                          onChange={(e) => setNewClient((prev) => ({ ...prev, phone: e.target.value }))}
                          placeholder="+855 23 456 789"
                          className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label className="text-gray-300 font-medium">Address *</Label>
                        <Input
                          value={newClient.address}
                          onChange={(e) => setNewClient((prev) => ({ ...prev, address: e.target.value }))}
                          placeholder="Enter full address"
                          className="bg-gray-900 border-gray-700 text-white focus:border-gray-500"
                        />
                      </div>

                      <Button
                        onClick={addNewClient}
                        disabled={isLoading}
                        className="w-full bg-white hover:bg-gray-200 text-black font-medium"
                      >
                        {isLoading ? "Adding Client..." : "Add Client"}
                      </Button>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
