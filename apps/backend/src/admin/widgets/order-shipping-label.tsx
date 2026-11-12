import type { DetailWidgetProps, AdminOrder } from "@medusajs/types"
import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Button, Badge } from "@medusajs/ui"
import { useState } from "react"

const generateBarcodeSvg = (code: string): string => {
  const bars: number[] = []
  let hash = 0
  for (let i = 0; i < code.length; i++) {
    hash = (hash * 31 + code.charCodeAt(i)) % 1000000007
  }

  // Generate deterministic bar widths based on code
  for (let i = 0; i < 45; i++) {
    const bit = (hash >> (i % 24)) & 1
    bars.push(bit ? 3 : 1.5)
    hash = (hash * 13 + i * 7) % 1000000007
  }

  let x = 10
  const rects = bars
    .map((w, idx) => {
      const isBlack = idx % 2 === 0
      const rect = isBlack
        ? `<rect x="${x}" y="0" width="${w}" height="45" fill="#000000" />`
        : ""
      x += w + 1
      return rect
    })
    .join("")

  return `<svg viewBox="0 0 ${x + 10} 45" width="100%" height="45" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">${rects}</svg>`
}

const buildLabelHtml = (order: AdminOrder): string => {
  const address = order.shipping_address
  const customer = order.customer
  const recipientName =
    [address?.first_name, address?.last_name].filter(Boolean).join(" ") ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.email ||
    "Customer"

  const phone = address?.phone || customer?.phone || "Not Provided"
  const company = address?.company ? `${address.company}` : ""
  const address1 = address?.address_1 || "Address not provided"
  const address2 = address?.address_2 || ""
  const cityStatePin = [
    address?.city,
    address?.province,
    address?.postal_code,
  ]
    .filter(Boolean)
    .join(", ")
  const country = address?.country_code?.toUpperCase() || "IN"

  const orderNumber = order.display_id ? `#${order.display_id}` : order.id
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString("en-IN")

  const totalAmount =
    typeof order.total === "number"
      ? `${(order.total / 100).toFixed(2)} ${order.currency_code?.toUpperCase() || "INR"}`
      : "PAID"

  const items = Array.isArray(order.items) ? order.items : []
  const totalItemCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  )

  const itemsRows = items
    .map((item, index) => {
      const variantInfo = [item.variant_title, item.subtitle]
        .filter(Boolean)
        .join(" - ")
      return `
      <tr style="border-bottom: 1px solid #e5e7eb; font-size: 11px;">
        <td style="padding: 6px 8px; text-align: center; width: 24px;">${index + 1}</td>
        <td style="padding: 6px 8px;">
          <div style="font-weight: 600; color: #111827;">${item.title || "Product"}</div>
          ${variantInfo ? `<div style="color: #6b7280; font-size: 10px;">${variantInfo}</div>` : ""}
          ${item.variant_sku ? `<div style="color: #9ca3af; font-size: 9px;">SKU: ${item.variant_sku}</div>` : ""}
        </td>
        <td style="padding: 6px 8px; text-align: center; font-weight: 700; font-size: 12px; width: 40px;">
          ${item.quantity || 1}
        </td>
      </tr>
    `
    })
    .join("")

  const barcodeSvg = generateBarcodeSvg(String(order.display_id || order.id))

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Shipping Label - Order ${orderNumber}</title>
  <style>
    @page {
      size: 100mm 150mm;
      margin: 4mm;
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      font-size: 12px;
      line-height: 1.35;
    }
    .label-box {
      width: 100%;
      max-width: 96mm;
      margin: 0 auto;
      border: 2px solid #000000;
      background: #ffffff;
      padding: 0;
    }
    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 10px;
      border-bottom: 2px solid #000000;
      background: #f9fafb;
    }
    .brand-title {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: -0.5px;
      text-transform: uppercase;
      color: #000000;
    }
    .brand-sub {
      font-size: 9px;
      color: #4b5563;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .order-badge {
      text-align: right;
    }
    .order-number {
      font-size: 16px;
      font-weight: 800;
      color: #000000;
    }
    .order-date {
      font-size: 9px;
      color: #4b5563;
    }
    .barcode-section {
      padding: 8px 10px;
      text-align: center;
      border-bottom: 1px solid #000000;
      background: #ffffff;
    }
    .barcode-caption {
      font-size: 10px;
      letter-spacing: 2px;
      font-family: monospace;
      font-weight: 700;
      margin-top: 3px;
    }
    .address-section {
      padding: 10px;
      border-bottom: 2px solid #000000;
    }
    .section-label {
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: #4b5563;
      margin-bottom: 4px;
    }
    .recipient-name {
      font-size: 15px;
      font-weight: 800;
      color: #000000;
      margin-bottom: 2px;
    }
    .phone-highlight {
      display: inline-block;
      font-size: 13px;
      font-weight: 700;
      background: #fef08a;
      padding: 2px 6px;
      border-radius: 3px;
      margin: 4px 0 6px 0;
      border: 1px solid #eab308;
    }
    .address-lines {
      font-size: 12px;
      line-height: 1.4;
      color: #1f2937;
    }
    .dispatch-row {
      display: flex;
      border-bottom: 1px solid #000000;
      font-size: 10px;
    }
    .dispatch-from {
      flex: 1;
      padding: 8px 10px;
      border-right: 1px solid #000000;
      background: #f9fafb;
    }
    .dispatch-info {
      flex: 1;
      padding: 8px 10px;
      background: #ffffff;
    }
    .items-table {
      width: 100%;
      border-collapse: collapse;
      border-bottom: 1px solid #000000;
    }
    .items-table th {
      background: #f3f4f6;
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 4px 8px;
      border-bottom: 1px solid #000000;
      text-align: left;
    }
    .footer-caution {
      padding: 6px 10px;
      text-align: center;
      background: #000000;
      color: #ffffff;
      font-size: 9px;
      font-weight: 700;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .total-badge-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 10px;
      background: #f3f4f6;
      font-size: 11px;
      font-weight: 700;
      border-bottom: 1px solid #000000;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .label-box {
        border: 2px solid #000000;
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="label-box">
    <!-- Header -->
    <div class="header-row">
      <div>
        <div class="brand-title">mphal</div>
        <div class="brand-sub">Malnad Homemade Products</div>
      </div>
      <div class="order-badge">
        <div class="order-number">${orderNumber}</div>
        <div class="order-date">${orderDate}</div>
      </div>
    </div>

    <!-- Barcode -->
    <div class="barcode-section">
      ${barcodeSvg}
      <div class="barcode-caption">${order.id}</div>
    </div>

    <!-- Delivery Address (Ship To) -->
    <div class="address-section">
      <div class="section-label">SHIP TO (DELIVERY ADDRESS):</div>
      <div class="recipient-name">${recipientName}</div>
      ${phone !== "Not Provided" ? `<div class="phone-highlight">TEL: ${phone}</div>` : ""}
      ${company ? `<div><strong>Company:</strong> ${company}</div>` : ""}
      <div class="address-lines">
        <div>${address1}</div>
        ${address2 ? `<div>${address2}</div>` : ""}
        <div style="font-weight: 700; margin-top: 2px;">${cityStatePin}</div>
        <div style="font-weight: 700;">${country}</div>
      </div>
    </div>

    <!-- Sender & Order Meta -->
    <div class="dispatch-row">
      <div class="dispatch-from">
        <div class="section-label">SHIP FROM (RETURN ADDRESS):</div>
        <div style="font-weight: 700;">mphal</div>
        <div>Western Ghats Agro Hub</div>
        <div>Shivamogga, Karnataka - 577201</div>
        <div>Support: 8618333210</div>
      </div>
      <div class="dispatch-info">
        <div class="section-label">SHIPPING METHOD:</div>
        <div style="font-weight: 700;">Surface Express / Courier</div>
        <div style="margin-top: 4px;"><strong>Payment:</strong> PREPAID</div>
        <div><strong>Status:</strong> ${order.payment_status || "Captured"}</div>
      </div>
    </div>

    <!-- Items Checklist -->
    <table class="items-table">
      <thead>
        <tr>
          <th style="text-align: center; width: 24px;">#</th>
          <th>Item Description</th>
          <th style="text-align: center; width: 40px;">Qty</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <!-- Totals -->
    <div class="total-badge-row">
      <span>Total Items: ${totalItemCount}</span>
      <span>Declared Value: ${totalAmount}</span>
    </div>

    <!-- Caution footer for delivery box -->
    <div class="footer-caution">
      FRAGILE - HOMEMADE FOOD PRODUCTS - HANDLE WITH CARE
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`
}

const OrderShippingLabelWidget = ({ data }: DetailWidgetProps<AdminOrder>) => {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)

  if (!data) {
    return null
  }

  const orderNumber = data.display_id ? `#${data.display_id}` : data.id
  const address = data.shipping_address
  const customer = data.customer
  const recipientName =
    [address?.first_name, address?.last_name].filter(Boolean).join(" ") ||
    [customer?.first_name, customer?.last_name].filter(Boolean).join(" ") ||
    customer?.email ||
    "Customer"

  const phone = address?.phone || customer?.phone || "Not Provided"
  const cityPin = [address?.city, address?.postal_code]
    .filter(Boolean)
    .join(" - ")
  const items = Array.isArray(data.items) ? data.items : []
  const totalItemCount = items.reduce(
    (sum, item) => sum + (item.quantity || 1),
    0
  )

  const handlePrint = () => {
    const html = buildLabelHtml(data)
    const printWindow = window.open("", "_blank", "width=700,height=900")
    if (printWindow) {
      printWindow.document.open()
      printWindow.document.write(html)
      printWindow.document.close()
    } else {
      // Fallback if popup blocker is active
      const iframe = document.createElement("iframe")
      iframe.style.position = "fixed"
      iframe.style.right = "0"
      iframe.style.bottom = "0"
      iframe.style.width = "0"
      iframe.style.height = "0"
      iframe.style.border = "0"
      document.body.appendChild(iframe)
      const doc = iframe.contentWindow?.document
      if (doc) {
        doc.open()
        doc.write(html)
        doc.close()
        setTimeout(() => {
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
          document.body.removeChild(iframe)
        }, 500)
      }
    }
  }

  return (
    <Container className="p-0 overflow-hidden border border-ui-border-base divide-y divide-ui-border-base shadow-sm rounded-lg bg-ui-bg-base">
      <div className="flex items-center justify-between p-4 bg-ui-bg-subtle">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-md bg-ui-bg-base border border-ui-border-base text-ui-fg-subtle">
            {/* Minimal SVG printer icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
          </div>
          <div>
            <Heading level="h2" className="text-sm font-semibold">
              Delivery Box Shipping Label
            </Heading>
            <p className="text-xs text-ui-fg-subtle">
              Printable 4" x 6" sticker label for delivery box ({orderNumber})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="small"
            variant="secondary"
            onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          >
            {isPreviewOpen ? "Hide Preview" : "Preview Label"}
          </Button>
          <Button
            size="small"
            variant="primary"
            onClick={handlePrint}
            className="flex items-center gap-1.5"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect width="12" height="8" x="6" y="14" />
            </svg>
            Print Label
          </Button>
        </div>
      </div>

      {/* Snapshot quick summary */}
      <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        <div>
          <span className="text-ui-fg-muted block uppercase text-[10px] font-bold tracking-wider mb-1">
            Recipient
          </span>
          <span className="font-semibold text-ui-fg-base block">
            {recipientName}
          </span>
          <span className="text-ui-fg-subtle block font-mono text-[11px]">
            {phone}
          </span>
        </div>

        <div>
          <span className="text-ui-fg-muted block uppercase text-[10px] font-bold tracking-wider mb-1">
            Destination
          </span>
          <span className="text-ui-fg-base block font-medium">
            {cityPin || "Address details on order"}
          </span>
          <span className="text-ui-fg-subtle block">
            {address?.country_code?.toUpperCase() || "India"}
          </span>
        </div>

        <div>
          <span className="text-ui-fg-muted block uppercase text-[10px] font-bold tracking-wider mb-1">
            Package Details
          </span>
          <div className="flex items-center gap-2">
            <Badge size="small" color="green">
              {totalItemCount} {totalItemCount === 1 ? "Item" : "Items"}
            </Badge>
            <Badge size="small" color="blue">
              Ready to Stick
            </Badge>
          </div>
        </div>
      </div>

      {/* Inline Preview Section */}
      {isPreviewOpen && (
        <div className="p-4 bg-ui-bg-subtle border-t border-ui-border-base flex flex-col items-center">
          <div className="w-full max-w-md bg-white text-black p-4 border-2 border-black rounded shadow-lg text-xs font-sans">
            <div className="flex justify-between items-center border-b-2 border-black pb-2 mb-2">
              <div>
                <div className="text-base font-extrabold uppercase">
                  mphal
                </div>
                <div className="text-[10px] text-gray-600 uppercase">
                  Malnad Homemade Products
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-extrabold">{orderNumber}</div>
                <div className="text-[10px] text-gray-600">
                  {new Date().toLocaleDateString("en-IN")}
                </div>
              </div>
            </div>

            <div className="border-b border-black pb-2 mb-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase">
                Ship To (Delivery Box Address):
              </div>
              <div className="text-sm font-bold text-black">
                {recipientName}
              </div>
              {phone !== "Not Provided" && (
                <div className="inline-block bg-yellow-100 border border-yellow-400 font-bold px-1.5 py-0.5 rounded text-[11px] my-1">
                  TEL: {phone}
                </div>
              )}
              {address?.company && (
                <div className="text-[11px] text-gray-700">
                  {address.company}
                </div>
              )}
              <div className="text-[11px] text-gray-800 leading-snug">
                <div>{address?.address_1}</div>
                {address?.address_2 && <div>{address.address_2}</div>}
                <div className="font-bold">
                  {address?.city}, {address?.province}{" "}
                  {address?.postal_code}
                </div>
                <div className="font-bold">
                  {address?.country_code?.toUpperCase() || "IN"}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 border-b border-black pb-2 mb-2 text-[10px]">
              <div className="border-r border-gray-300 pr-2">
                <span className="font-bold text-gray-500 block uppercase">
                  From:
                </span>
                <span className="font-bold">mphal</span>
                <div>Shivamogga, Karnataka - 577201</div>
              </div>
              <div>
                <span className="font-bold text-gray-500 block uppercase">
                  Shipping:
                </span>
                <span className="font-bold">Surface Courier</span>
                <div>Prepaid / Verified</div>
              </div>
            </div>

            <div className="border-b border-black pb-2 mb-2">
              <div className="text-[10px] font-bold text-gray-500 uppercase mb-1">
                Contents ({totalItemCount} items):
              </div>
              <ul className="space-y-1 text-[11px]">
                {items.slice(0, 4).map((it, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span className="truncate pr-2">{it.title}</span>
                    <span className="font-bold whitespace-nowrap">
                      {it.quantity}x
                    </span>
                  </li>
                ))}
                {items.length > 4 && (
                  <li className="text-[10px] text-gray-500 italic">
                    +{items.length - 4} more items...
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-black text-white text-center py-1 text-[9px] font-bold uppercase tracking-wider">
              Fragile - Food Products - Handle With Care
            </div>
          </div>

          <div className="mt-3">
            <Button size="small" variant="primary" onClick={handlePrint}>
              Print Now
            </Button>
          </div>
        </div>
      )}
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "order.details.before",
})

export default OrderShippingLabelWidget
