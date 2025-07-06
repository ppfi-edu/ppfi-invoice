import { createClient } from "@/lib/supabase/client"

export interface InvoiceNumberConfig {
  prefix?: string
  suffix?: string
  dateFormat?: "YYMMDD"
  sequenceLength?: number
  separator?: string
}

export class InvoiceNumberGenerator {
  private supabase = createClient()
  private config: Required<InvoiceNumberConfig>

  constructor(config: InvoiceNumberConfig = {}) {
    this.config = {
      prefix: config.prefix || "PPFI",
      dateFormat: config.dateFormat || "YYMMDD",
      sequenceLength: config.sequenceLength || 4,
      separator: config.separator || "-",
      ...config,
    }
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear().toString().slice(-2)
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}${month}${day}`
  }

  private async getNextSequenceNumber(pattern: string): Promise<number> {
    try {
      // Use Supabase function for atomic sequence generation
      const { data, error } = await this.supabase.rpc("get_next_invoice_sequence", {
        pattern_prefix: pattern,
      })

      if (error) {
        console.error("Error getting sequence from function:", error)
        // Fallback to manual sequence generation
        return await this.getSequenceManually(pattern)
      }

      return data || 1
    } catch (error) {
      console.error("Error in getNextSequenceNumber:", error)
      return await this.getSequenceManually(pattern)
    }
  }

  private async getSequenceManually(pattern: string): Promise<number> {
    const { data, error } = await this.supabase
      .from("invoices")
      .select("invoice_number")
      .like("invoice_number", `${pattern}%`)
      .order("invoice_number", { ascending: false })
      .limit(1)

    if (error) {
      console.error("Error fetching last invoice:", error)
      return 1
    }

    if (!data || data.length === 0) {
      return 1
    }

    const lastInvoiceNumber = data[0].invoice_number
    const sequencePart = lastInvoiceNumber.split(this.config.separator).pop()

    if (sequencePart && /^\d+$/.test(sequencePart)) {
      return Number.parseInt(sequencePart, 10) + 1
    }

    return 1
  }

  async generateInvoiceNumber(type: "student" | "client" = "student"): Promise<string> {
    const now = new Date()
    const dateString = this.formatDate(now)
    const typePrefix = type === "student" ? "STU" : "CLI"

    // New pattern: PPFI-STU2507050001
    const pattern = `${this.config.prefix}${this.config.separator}${typePrefix}${dateString}`

    try {
      const sequenceNumber = await this.getNextSequenceNumber(pattern)
      const paddedSequence = sequenceNumber.toString().padStart(this.config.sequenceLength, "0")

      return `${pattern}${paddedSequence}`
    } catch (error) {
      console.error("Error generating invoice number:", error)
      const timestamp = Date.now().toString().slice(-6)
      return `${this.config.prefix}${this.config.separator}${typePrefix}${dateString}${timestamp}`
    }
  }

  async validateInvoiceNumber(invoiceNumber: string): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .from("invoices")
        .select("id")
        .eq("invoice_number", invoiceNumber)
        .limit(1)

      if (error) {
        console.error("Error validating invoice number:", error)
        return false
      }

      return data.length === 0
    } catch (error) {
      console.error("Error in validateInvoiceNumber:", error)
      return false
    }
  }

  getPreview(type: "student" | "client" = "student"): string {
    const now = new Date()
    const dateString = this.formatDate(now)
    const typePrefix = type === "student" ? "STU" : "CLI"
    const sequenceExample = "1".padStart(this.config.sequenceLength, "0")

    return `${this.config.prefix}${this.config.separator}${typePrefix}${dateString}${sequenceExample}`
  }
}

// Default instance
export const invoiceNumberGenerator = new InvoiceNumberGenerator()

// Utility functions for direct use
export async function generateInvoiceNumber(type: "student" | "client" = "student"): Promise<string> {
  return invoiceNumberGenerator.generateInvoiceNumber(type)
}

export async function validateInvoiceNumber(invoiceNumber: string): Promise<boolean> {
  return invoiceNumberGenerator.validateInvoiceNumber(invoiceNumber)
}

export function getInvoiceNumberPreview(type: "student" | "client" = "student"): string {
  return invoiceNumberGenerator.getPreview(type)
}
