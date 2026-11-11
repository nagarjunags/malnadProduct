import { Container, clx } from "@modules/common/components/ui"
import Image from "next/image"
import React from "react"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: { url?: string }[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured: _isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const initialImage = thumbnail || images?.[0]?.url

  return (
    <Container
      className={clx(
        "relative w-full overflow-hidden p-0 bg-[#F5EFE6] border border-mphal-sand/60 rounded-rounded group-hover:border-mphal-caramel/50 transition-all ease-in-out duration-200",
        className,
        {
          "aspect-square": true,
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full" || size === "square",
        }
      )}
      data-testid={dataTestid}
    >
      <ImageOrPlaceholder image={initialImage} />
    </Container>
  )
}

const ImageOrPlaceholder = ({
  image,
}: { image?: string }) => {
  return image ? (
    <Image
      src={image}
      alt="Product thumbnail"
      className="absolute inset-0 object-cover object-center group-hover:scale-105 transition-transform duration-300"
      draggable={false}
      quality={80}
      sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
      fill
    />
  ) : (
    <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#FAF5EE] to-[#EFE7D8] text-mphal-forest/30 p-4">
      <svg
        width="40"
        height="40"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-mphal-mocha/40 mb-1"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
    </div>
  )
}

export default Thumbnail
