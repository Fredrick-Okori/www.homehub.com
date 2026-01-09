"use client"

import { useEffect, useRef, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Phone, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"

const slides = [
  {
    src: "/images/Mountain_House_-_Between_Dream__amp__Reality.png",
    alt: "Luxury mountain house",
    title: "Find Your Dream Home",
    subtitle: "Discover exceptional properties in prime locations",
  },
  {
    src: "/images/Atlanta-Series.webp",
    alt: "Modern Atlanta series home",
    title: "Luxury Living Redefined",
    subtitle: "Experience homes that exceed your expectations",
  },
  {
    src: "/images/how-to-design-a-house.jpg",
    alt: "Beautiful house design",
    title: "Urban Living Made Simple",
    subtitle: "Find the perfect city home for your lifestyle",
  },
]

const quickActions = [
  {
    icon: <Phone className="w-5 h-5" />,
    label: "Call Us Now",
    href: "tel:+1234567890",
    color: "bg-[#f20051] hover:bg-[#d10044]",
  },
  {
    icon: <Calendar className="w-5 h-5" />,
    label: "Schedule Tour",
    href: "#schedule",
    color: "bg-[#f20051] hover:bg-[#d10044]",
  },
  {
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
    ),
    label: "WhatsApp",
    href: "https://wa.me/1234567890",
    color: "bg-[#f20051] hover:bg-[#d10044]",
  },
]

export function HeroSection() {
  const [index, setIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const intervalRef = useRef<number | null>(null)

  useEffect(() => {
    if (isPaused) return
    intervalRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length)
    }, 5000)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [isPaused])

  function goNext() {
    setIndex((i) => (i + 1) % slides.length)
  }

  function goPrev() {
    setIndex((i) => (i - 1 + slides.length) % slides.length)
  }

  return (
    <>
      <section
        className="relative w-full overflow-hidden h-[55vh]"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {/* Background Slides */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            {slides.map((s, i) =>
              i === index ? (
                <motion.div
                  key={s.src}
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                >
                  <img
                    src={s.src}
                    alt={s.alt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70" />
                </motion.div>
              ) : null
            )}
          </AnimatePresence>
        </div>

        {/* Content - Centered */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                  {slides[index].title}
                  <span className="block text-[#f20051] mt-2">
                    HomeHub Today
                  </span>
                </h1>


                <p className="text-lg md:text-xl text-white/90 font-light max-w-2xl mx-auto">
                  {slides[index].subtitle}
                </p>
              </motion.div>
            </AnimatePresence>


            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4 justify-center mt-6">
              <Button
                size="lg"
                className="bg-[#f20051] hover:bg-[#d10044] text-white rounded-full px-6 py-5 text-base font-semibold shadow-lg transition-colors"
              >
                Browse Properties
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-[#f20051] text-[#f20051] hover:bg-[#f20051] hover:text-white rounded-full px-6 py-5 text-base transition-colors"
              >
                Schedule a Tour
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions - Right Side */}
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-2">
        {quickActions.map((action, i) => (
          <a
            key={i}
            href={action.href}
            className={`group flex items-center ${action.color} text-white py-3 px-4 transition-all duration-300 shadow-lg hover:shadow-xl`}
            style={{ borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px' }}
          >
            <span className="flex-shrink-0">{action.icon}</span>
            <span className="max-w-0 overflow-hidden group-hover:max-w-[140px] transition-all duration-300 whitespace-nowrap text-sm font-medium ml-0 group-hover:ml-3">
              {action.label}
            </span>
          </a>
        ))}
      </div>
    </>
  )
}

