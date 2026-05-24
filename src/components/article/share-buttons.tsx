'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { Share2, Twitter, Linkedin, Facebook, Link2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ShareButtonsProps {
  title: string
  url: string
  excerpt: string
}

/**
 * Social share buttons component
 * Features: native share API, clipboard copy, social media sharing
 */
export function ShareButtons({ title, url, excerpt }: ShareButtonsProps) {
  const [copied, setCopied] = React.useState(false)

  const handleNativeShare = async () => {
    const nav = navigator as any
    if (nav.share) {
      try {
        await nav.share({ title, url, text: excerpt })
      } catch (error) {
        console.error('Error sharing:', error)
      }
    }
  }

  const handleCopyLink = async () => {
    try {
      await (navigator as any).clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Error copying:', error)
    }
  }

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      title
    )}&url=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
      url
    )}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      url
    )}`,
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold uppercase text-muted-foreground">
        Share This Article
      </h3>

      <div className="flex flex-wrap gap-3">
        {/* Native Share (Mobile) */}
        {(navigator as any).share && (
          <Button variant="outline" onClick={handleNativeShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
        )}

        {/* Twitter */}
        <Button
          variant="outline"
          onClick={() => window.open(shareLinks.twitter, '_blank')}
        >
          <Twitter className="mr-2 h-4 w-4" />
          Twitter
        </Button>

        {/* LinkedIn */}
        <Button
          variant="outline"
          onClick={() => window.open(shareLinks.linkedin, '_blank')}
        >
          <Linkedin className="mr-2 h-4 w-4" />
          LinkedIn
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          onClick={() => window.open(shareLinks.facebook, '_blank')}
        >
          <Facebook className="mr-2 h-4 w-4" />
          Facebook
        </Button>

        {/* Copy Link */}
        <Button variant="outline" onClick={handleCopyLink}>
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4 text-green-500" />
              Copied!
            </>
          ) : (
            <>
              <Link2 className="mr-2 h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
