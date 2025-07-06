import { GraduationCap } from "lucide-react"
import Image from "next/image"

export function Header() {
  return (
    <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-2 sm:px-4 lg:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-10 w-14 md:h-14 md:w-20 flex items-center justify-center">
              <Image src="https://ppfi.art/ppfi-nav.png" className="object-cover" />
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs sm:text-sm text-gray-300">Invoice System</p>
            <p className="text-xs text-gray-500 hidden sm:block">Finance Department</p>
          </div>
        </div>
      </div>
    </header>
  )
}
