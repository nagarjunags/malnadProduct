import { Heading } from "@modules/common/components/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative w-full overflow-hidden" style={{ background: "linear-gradient(135deg, #2D5016 0%, #4A7C2F 40%, #5C3A1E 100%)" }}>
      {/* Decorative leaf/texture overlay */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, #F5ECD7 1px, transparent 1px),
                            radial-gradient(circle at 80% 20%, #F5ECD7 1px, transparent 1px),
                            radial-gradient(circle at 60% 80%, #F5ECD7 1px, transparent 1px)`,
          backgroundSize: "80px 80px, 120px 120px, 60px 60px",
        }}
      />

      <div className="relative z-10 content-container py-28 small:py-40 flex flex-col small:flex-row items-center gap-12 small:gap-20">
        {/* Left — brand copy */}
        <div className="flex-1 text-center small:text-left flex flex-col gap-6">
          {/* Kannada flavour tag */}
          <span
            className="inline-block self-center small:self-start text-sm font-sans font-semibold tracking-[0.2em] uppercase px-4 py-1 rounded-full border"
            style={{ color: "#C4874A", borderColor: "#C4874A", background: "rgba(196,135,74,0.12)" }}
          >
            ✦ From the Heart of Malnad ✦
          </span>

          <Heading
            level="h1"
            className="font-display text-5xl small:text-6xl leading-tight font-bold"
            style={{ color: "#F5ECD7" }}
          >
            mpal
          </Heading>

          <Heading
            level="h2"
            className="font-display text-2xl small:text-3xl leading-snug font-normal italic"
            style={{ color: "#EAD5B0" }}
          >
            Pure. Homemade. Karnataka.
          </Heading>

          <p
            className="font-sans text-base leading-relaxed max-w-md mx-auto small:mx-0"
            style={{ color: "#C4874A" }}
          >
            Handcrafted goods from the lush ghats of Malnad — shade-grown coffee,
            wild honey, spice blends, and home recipes passed down through
            generations. No shortcuts. Just honest flavour.
          </p>

          <div className="flex flex-col xsmall:flex-row gap-4 justify-center small:justify-start mt-2">
            <LocalizedClientLink href="/store">
              <button className="mpal-btn-primary text-sm tracking-widest uppercase">
                Shop Now
              </button>
            </LocalizedClientLink>
            <LocalizedClientLink href="/categories/coffee">
              <button className="mpal-btn-outline text-sm tracking-widest uppercase">
                Explore Coffee
              </button>
            </LocalizedClientLink>
          </div>
        </div>

        {/* Right — decorative product mosaic placeholder */}
        <div className="flex-shrink-0 flex flex-col gap-4 items-center opacity-90">
          <div className="grid grid-cols-2 gap-3">
            {[
              { emoji: "☕", label: "Estate Coffee" },
              { emoji: "🍯", label: "Wild Honey" },
              { emoji: "🌶️", label: "Spice Blends" },
              { emoji: "🥥", label: "Coconut Oil" },
            ].map(({ emoji, label }) => (
              <div
                key={label}
                className="w-32 h-32 small:w-36 small:h-36 rounded-large flex flex-col items-center justify-center gap-2 font-sans text-xs font-semibold tracking-wide uppercase"
                style={{
                  background: "rgba(245,236,215,0.12)",
                  border: "1px solid rgba(245,236,215,0.25)",
                  color: "#EAD5B0",
                  backdropFilter: "blur(4px)",
                }}
              >
                <span className="text-4xl">{emoji}</span>
                {label}
              </div>
            ))}
          </div>
          <p
            className="text-xs font-sans tracking-widest uppercase"
            style={{ color: "rgba(245,236,215,0.5)" }}
          >
            Sourced from Shivamogga &amp; Kodagu
          </p>
        </div>
      </div>

      {/* Bottom wave divider */}
      <div className="relative w-full overflow-hidden" style={{ height: "60px" }}>
        <svg
          viewBox="0 0 1440 60"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute bottom-0 w-full"
          preserveAspectRatio="none"
          style={{ height: "60px" }}
        >
          <path
            d="M0 60 L0 30 Q360 0 720 30 Q1080 60 1440 30 L1440 60 Z"
            fill="#F9F5EE"
          />
        </svg>
      </div>
    </div>
  )
}

export default Hero
