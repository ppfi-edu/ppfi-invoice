import Image from "next/image"

interface LogoProps {
  size?: "sm" | "md" | "lg"
}

export default function Logo({ size = "md"}: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-12",
    md: "h-12 w-16",
    lg: "h-16 w-24",
  }

  return (
    <div className="flex items-center">
      <div
        className={`${sizeClasses[size]} flex items-center justify-center`}
      >
        <div className="block">
          <Image src="/ppfi-nav.png" alt="logo" className="object-cover" />
        </div>
      </div>
    </div>
  )
}
