import { InvoiceCreator } from "@/components/invoice/invoice-creator"
import { Header } from "@/components/layout/header"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <main className="container mx-auto px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Invoice Management System
            </h1>
            <p className="text-gray-400 text-sm sm:text-base lg:text-lg">Phnom Penh Fashion Institute</p>
          </div>
          <InvoiceCreator />
        </div>
      </main>
    </div>
  )
}
