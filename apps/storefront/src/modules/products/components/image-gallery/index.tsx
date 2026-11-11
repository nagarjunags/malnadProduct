"use client"

import { HttpTypes } from "@medusajs/types"
import { Container } from "@modules/common/components/ui"
import Image from "next/image"
import { useState } from "react"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0)

  if (!images || images.length === 0) {
    return (
      <Container className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-[#FAF5EE] to-[#EFE7D8] border border-mphal-sand/70 rounded-large flex flex-col items-center justify-center text-center p-8 shadow-xs">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-mphal-mocha/40 mb-2"
        >
          <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="font-sans text-xs text-mphal-mocha/70">
          No image available
        </span>
      </Container>
    )
  }

  const activeImage = images[selectedIndex] || images[0]

  return (
    <div className="flex flex-col gap-4">
      {/* Main Featured Image Container */}
      <Container className="relative aspect-square w-full overflow-hidden bg-[#FAF5EE] border border-mphal-sand/70 rounded-large shadow-sm">
        {!!activeImage?.url && (
          <Image
            src={activeImage.url}
            priority={true}
            className="absolute inset-0 object-cover object-center transition-all duration-300"
            alt={`Product view ${selectedIndex + 1}`}
            fill
            sizes="(max-width: 576px) 100vw, (max-width: 992px) 60vw, 800px"
          />
        )}

        {images.length > 1 && (
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-sans font-semibold px-2.5 py-1 rounded-full shadow-xs">
            {selectedIndex + 1} / {images.length}
          </div>
        )}
      </Container>

      {/* Thumbnail Bar for Multiple Images */}
      {images.length > 1 && (
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {images.map((image, index) => {
            const isSelected = index === selectedIndex
            return (
              <button
                key={image.id}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative w-20 h-20 shrink-0 rounded-rounded overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-mphal-forest shadow-sm scale-102"
                    : "border-mphal-sand/60 opacity-70 hover:opacity-100"
                }`}
                title={`View image ${index + 1}`}
              >
                {image.url ? (
                  <Image
                    src={image.url}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover object-center"
                  />
                ) : (
                  <div className="w-full h-full bg-[#FAF5EE] flex items-center justify-center text-xs text-mphal-mocha">
                    {index + 1}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default ImageGallery
