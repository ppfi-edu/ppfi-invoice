export type Json = string | number | boolean | null | {
  [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      client_invoices: {
        Row: {
          client_id: string | null
          created_at: string
          id: number
          invoice_id: string | null
          updated_at: string | null
        }
        Insert: {
          client_id ? : string | null
          created_at ? : string
          id ? : never
          invoice_id ? : string | null
          updated_at ? : string | null
        }
        Update: {
          client_id ? : string | null
          created_at ? : string
          id ? : never
          invoice_id ? : string | null
          updated_at ? : string | null
        }
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address ? : string | null
          created_at ? : string | null
          email: string
          id ? : string
          name: string
          phone ? : string | null
          updated_at ? : string | null
        }
        Update: {
          address ? : string | null
          created_at ? : string | null
          email ? : string
          id ? : string
          name ? : string
          phone ? : string | null
          updated_at ? : string | null
        }
      }
      invoices: {
        Row: {
          client_id: string | null
          created_at: string | null
          due_date: string
          id: string
          issuer: string | null
          invoice_number: string
          items: Json
          notes: string | null
          status: "draft" | "sent" | "paid" | "overdue" | null
          student_id: string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          type: "student" | "client"
          updated_at: string | null
        }
        Insert: {
          client_id ? : string | null
          created_at ? : string | null
          due_date: string
          id ? : string
          issuer ? : string | null
          invoice_number: string
          items: Json
          notes ? : string | null
          status ? : "draft" | "sent" | "paid" | "overdue" | null
          student_id ? : string | null
          subtotal: number
          tax_amount: number
          tax_rate: number
          total: number
          type: "student" | "client"
          updated_at ? : string | null
        }
        Update: {
          client_id ? : string | null
          created_at ? : string | null
          due_date ? : string
          id ? : string
          issuer ? : string | null
          invoice_number ? : string
          items ? : Json
          notes ? : string | null
          status ? : "draft" | "sent" | "paid" | "overdue" | null
          student_id ? : string | null
          subtotal ? : number
          tax_amount ? : number
          tax_rate ? : number
          total ? : number
          type ? : "student" | "client"
          updated_at ? : string | null
        }
      }
      students: {
        Row: {
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          program: string
          student_id: string
          updated_at: string | null
        }
        Insert: {
          created_at ? : string | null
          email: string
          id ? : string
          name: string
          phone ? : string | null
          program: string
          student_id: string
          updated_at ? : string | null
        }
        Update: {
          created_at ? : string | null
          email ? : string
          id ? : string
          name ? : string
          phone ? : string | null
          program ? : string
          student_id ? : string
          updated_at ? : string | null
        }
      }
    }
  }
}

export type InvoiceItem = {
  id: string
  description: string
  quantity: number
  unit_price: number
  total: number
}

export type Student = Database["public"]["Tables"]["students"]["Row"]
export type Client = Database["public"]["Tables"]["clients"]["Row"]
export type Invoice = Database["public"]["Tables"]["invoices"]["Row"]

export type InvoiceData = {
  invoice_number ? : string
  type: "student" | "client"
  student ? : Student
  client ? : Client
  items: InvoiceItem[]
  tax_rate: number
  due_date: string
  notes: string
  status: "draft" | "sent" | "paid" | "overdue"
  issuer ? : string
}