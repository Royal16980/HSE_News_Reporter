import Link from 'next/link'
import { Linkedin, Twitter, Mail } from 'lucide-react'
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants'

/**
 * Footer component with site map, social links, and legal info
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  const footerLinks = {
    categories: CATEGORIES.slice(0, 6),
    resources: [
      { name: 'Latest News', href: '/news' },
      { name: 'Regulations', href: '/category/regulations' },
      { name: 'Best Practices', href: '/category/best-practices' },
      { name: 'Safety Guides', href: '/guides' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Contact', href: '/contact' },
      { name: 'Advertise', href: '/advertise' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-brand shadow-lg">
                <span className="text-xl font-bold text-white">HS</span>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold gradient-text">
                  UK Health & Safety
                </span>
                <span className="text-xs text-muted-foreground">
                  Intelligence Platform
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Your trusted source for UK health and safety news, regulations,
              and best practices. Updated daily with expert analysis.
            </p>
            <div className="flex space-x-4">
              <Link
                href={SITE_CONFIG.links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </Link>
              <Link
                href={SITE_CONFIG.links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </Link>
              <Link
                href="/contact"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Contact"
              >
                <Mail className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="font-semibold mb-4">Categories</h3>
            <ul className="space-y-2">
              {footerLinks.categories.map((category) => (
                <li key={category.slug}>
                  <Link
                    href={`/category/${category.slug}`}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-muted-foreground">
              © {currentYear} {SITE_CONFIG.name}. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span className="flex items-center space-x-1">
                <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span>HSE Verified Content</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
