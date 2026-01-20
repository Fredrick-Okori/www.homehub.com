import Link from "next/link"
import { Facebook, Twitter, Instagram, Youtube, Phone, Mail, MapPin } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-[#f20051] text-white">
      {/* Footer Menu Section */}
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* About Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">HomeHub Uganda</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Uganda&apos;s trusted real estate platform helping you find your perfect home across Kampala, Entebbe, Jinja and beyond.
            </p>
            <div className="flex gap-3 pt-2">
              {/* Uganda flag accent */}
              <div className="flex gap-1">
                <div className="w-3 h-3 bg-red-600"></div>
                <div className="w-3 h-3 bg-yellow-500"></div>
                <div className="w-3 h-3 bg-green-600"></div>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Quick Links</h3>
            <ul className="space-y-3 text-sm text-white">
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Buy Property
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Rent Houses
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Land Sales
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Commercial
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  List Your Property
                </Link>
              </li>
              <li>
                <Link href="/admin/login" className="hover:text-white/80 transition-colors">
                  Admin Login
                </Link>
              </li>
            </ul>
          </div>

          {/* Locations Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Popular Locations</h3>
            <ul className="space-y-3 text-sm text-white">
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Kampala
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Entebbe
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Jinja
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Mbarara
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-white/80 transition-colors">
                  Kira Municipality
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-white">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-white" />
                <span>Kampala Road, Uganda</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-white" />
                <span>+256 700 123 456</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-white" />
                <span>info@nyanzahomes.ug</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-[#d10044] bg-[#d10044]">
        <div className="mx-auto max-w-7xl px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            {/* Left Side - Legal & Links */}
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white md:justify-start">
              <span className="font-semibold text-white">© 2024 HomeHub Uganda</span>
              <span className="hidden md:inline">·</span>
              <Link href="#" className="hover:text-white/80 transition-colors">
                Terms
              </Link>
              <span>·</span>
              <Link href="#" className="hover:text-white/80 transition-colors">
                Privacy
              </Link>
              <span>·</span>
              <Link href="#" className="hover:text-white/80 transition-colors">
                Listings Policy
              </Link>
            </div>

            {/* Right Side - Social & Payment */}
            <div className="flex items-center justify-center gap-6 md:justify-end">
              {/* Language & Currency - Uganda style */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1 text-sm font-medium text-white hover:text-white/80 transition-colors">
                  <span>🇺🇬</span>
                  <span>English</span>
                </button>
                <button className="flex items-center gap-1 text-sm font-medium text-white hover:text-white/80 transition-colors">
                  <span>UGX</span>
                </button>
              </div>

              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <Link href="#" className="text-white hover:text-white/80 transition-colors">
                  <Facebook className="h-5 w-5" />
                  <span className="sr-only">Facebook</span>
                </Link>
                <Link href="#" className="text-white hover:text-white/80 transition-colors">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
                <Link href="#" className="text-white hover:text-white/80 transition-colors">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
                <Link href="#" className="text-white hover:text-white/80 transition-colors">
                  <Youtube className="h-5 w-5" />
                  <span className="sr-only">YouTube</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Made with pride in Uganda */}
          <p className="mt-4 text-center text-xs text-gray-500">
            Made with ❤️ in Uganda
          </p>
        </div>
      </div>
    </footer>
  )
}

