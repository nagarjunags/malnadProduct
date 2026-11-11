import { Text } from "@modules/common/components/ui"
import { VariantPrice } from "types/global"

export default async function PreviewPrice({ price }: { price: VariantPrice }) {
  if (!price) {
    return null
  }

  return (
    <div className="flex items-baseline gap-2">
      {price.price_type === "sale" && (
        <Text
          className="line-through text-xs font-sans text-mphal-mocha/60"
          data-testid="original-price"
        >
          {price.original_price}
        </Text>
      )}
      <Text
        className={`font-sans font-bold text-base ${
          price.price_type === "sale" ? "text-mphal-terracotta" : "text-mphal-forest"
        }`}
        data-testid="price"
      >
        {price.calculated_price}
      </Text>
    </div>
  )
}
