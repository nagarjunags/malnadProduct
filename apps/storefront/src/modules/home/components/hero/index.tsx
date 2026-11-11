import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-[#162E1C] via-[#1F3D26] to-[#2B3B24]">
      {/* Decorative leaf / topographic background pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `radial-gradient(circle at 25% 30%, #F5ECD7 1.5px, transparent 1.5px),
                            radial-gradient(circle at 75% 15%, #F5ECD7 1.5px, transparent 1.5px),
                            radial-gradient(circle at 60% 75%, #F5ECD7 1.5px, transparent 1.5px),
                            radial-gradient(circle at 15% 85%, #F5ECD7 1.5px, transparent 1.5px)`,
          backgroundSize: "80px 80px, 120px 120px, 100px 100px, 90px 90px",
        }}
      />

      {/* Ambient warm glow */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-mphal-terracotta/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-mphal-amber/15 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 content-container py-20 small:py-28 flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-16">
        {/* Left column — Brand narrative & action CTAs */}
        <div className="flex-1 text-center lg:text-left flex flex-col gap-6 max-w-2xl">
          {/* Brand badge */}
          <div className="inline-flex items-center gap-2 self-center lg:self-start text-xs font-sans font-semibold tracking-[0.2em] uppercase px-4 py-1.5 rounded-full border border-mphal-amber/40 bg-mphal-amber/10 text-mphal-sand">
            <span className="w-1.5 h-1.5 rounded-full bg-mphal-amber" />
            mphal &bull; Homemade Products
          </div>

          <div className="space-y-2">
            <Heading
              level="h1"
              className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.12] font-bold text-mphal-cream"
            >
              Homemade Products, <br />
              <span className="italic font-normal text-mphal-sand">Delivered to You</span>
            </Heading>
          </div>

          <p className="font-sans text-base sm:text-lg leading-relaxed text-mphal-cream/85">
            Explore our store catalog of homemade products, available across regions.
          </p>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-2">
            <LocalizedClientLink href="/store">
              <button className="w-full sm:w-auto px-8 py-4 rounded-rounded font-sans text-xs uppercase tracking-widest font-bold bg-mphal-terracotta hover:bg-mphal-caramel text-white shadow-md transition-all duration-200">
                Explore Store &rarr;
              </button>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Right column — Aesthetic brand presentation card */}
        <div className="flex-shrink-0 w-full lg:w-auto flex flex-col items-center">
          <div className="p-8 sm:p-10 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md max-w-sm w-full text-center space-y-6 shadow-xl">
            <div className="w-20 h-20 rounded-full bg-mphal-terracotta/25 border border-mphal-amber/40 flex items-center justify-center mx-auto text-mphal-amber">
              <span className="font-display text-3xl font-bold tracking-tight text-mphal-sand">
                m
              </span>
            </div>

            <div className="space-y-1.5">
              <h3 className="font-display text-2xl font-bold text-mphal-cream tracking-wide">
                mphal
              </h3>
              <p className="text-xs font-sans text-mphal-sand/90 uppercase tracking-widest font-medium">
                Homemade Products
              </p>
            </div>

            <div className="pt-4 border-t border-white/15">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-rounded text-xs font-sans font-semibold tracking-wider uppercase text-mphal-cream bg-white/10 hover:bg-white/20 border border-white/20 transition-all duration-200"
              >
                <span>Browse Store</span>
                <span>&rarr;</span>
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative transition wave divider to page body */}
      <div className="relative w-full overflow-hidden leading-none" style={{ height: "40px" }}>
        <svg
          viewBox="0 0 1440 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          style={{ height: "40px" }}
        >
          <path
            d="M0 40 L0 15 Q360 0 720 15 Q1080 30 1440 15 L1440 40 Z"
            fill="#FAF7F2"
          />
        </svg>
      </div>
    </div>
  )
}

export default Hero
