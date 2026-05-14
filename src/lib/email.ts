import nodemailer from "nodemailer";

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

export interface OrderEmailData {
  orderNumber: string;
  customerName: string;
  phone: string;
  orderType: string;
  address?: string | null;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  notes?: string | null;
  estimatedTime?: number | null;
}

function createTransport() {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST ?? "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
}

function kooqsEmailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Kooqs.Takeout</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #0a0a0a; color: #cccccc; }
    .wrapper { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #DC1A17, #F97316); border-radius: 12px 12px 0 0; padding: 32px 24px; text-align: center; }
    .header h1 { color: white; font-size: 28px; font-weight: 800; letter-spacing: -0.5px; }
    .header p { color: rgba(255,255,255,0.85); margin-top: 4px; font-size: 14px; }
    .body { background: #111111; border: 1px solid #222222; border-top: none; border-radius: 0 0 12px 12px; padding: 32px 24px; }
    .section-title { color: #888888; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; }
    .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1e1e1e; font-size: 14px; }
    .info-row:last-child { border-bottom: none; }
    .info-label { color: #888888; }
    .info-value { color: #ffffff; font-weight: 500; }
    .item-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #1e1e1e; }
    .item-name { color: #cccccc; font-size: 14px; }
    .item-qty { color: #888888; font-size: 13px; margin-top: 2px; }
    .item-price { color: #ffffff; font-weight: 600; font-size: 14px; }
    .total-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
    .grand-total { font-size: 18px; font-weight: 800; color: #DC1A17; }
    .cta-btn { display: block; width: 100%; background: linear-gradient(135deg, #DC1A17, #F97316); color: white; text-align: center; padding: 14px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 24px; }
    .footer { text-align: center; margin-top: 24px; font-size: 12px; color: #555555; }
    .divider { height: 1px; background: #222222; margin: 24px 0; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>🍔 Kooqs.Takeout</h1>
      <p>Fresh. Fast. Flavorful.</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>© ${new Date().getFullYear()} Kooqs.Takeout · All Rights Reserved</p>
      <p style="margin-top:4px;">${process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ?? ""} · ${process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? ""}</p>
    </div>
  </div>
</body>
</html>`;
}

function formatItemsHtml(items: OrderItem[]): string {
  return items
    .map(
      (item) => `
    <div class="item-row">
      <div>
        <div class="item-name">${item.name}</div>
        <div class="item-qty">Qty: ${item.quantity}</div>
      </div>
      <div class="item-price">GhC ${Math.round(item.price * item.quantity)}</div>
    </div>`
    )
    .join("");
}

export async function sendAdminOrderNotificationEmail(order: OrderEmailData): Promise<void> {
  const transporter = createTransport();

  const html = kooqsEmailWrapper(`
    <h2 style="color:#DC1A17; font-size:22px; font-weight:700; margin-bottom:8px;">🔔 New Order Received!</h2>
    <p style="color:#888888; margin-bottom:24px;">A new order has been placed. Please review and confirm.</p>

    <div style="background:#1a1a1a; border-radius:8px; padding:16px; margin-bottom:24px;">
      <p style="color:#888888; font-size:12px;">ORDER NUMBER</p>
      <p style="color:#DC1A17; font-size:22px; font-weight:800;">${order.orderNumber}</p>
    </div>

    <p class="section-title">Customer Info</p>
    <div class="info-row"><span class="info-label">Name</span><span class="info-value">${order.customerName}</span></div>
    <div class="info-row"><span class="info-label">Phone</span><span class="info-value">${order.phone}</span></div>
    <div class="info-row"><span class="info-label">Type</span><span class="info-value">${order.orderType === "delivery" ? "🚗 Delivery" : "🏃 Pickup"}</span></div>
    ${order.address ? `<div class="info-row"><span class="info-label">Address</span><span class="info-value">${order.address}</span></div>` : ""}
    ${order.notes ? `<div class="info-row"><span class="info-label">Notes</span><span class="info-value" style="color:#F97316;">${order.notes}</span></div>` : ""}

    <div class="divider"></div>
    <p class="section-title">Order Items</p>
    ${formatItemsHtml(order.items)}
    <div class="divider"></div>

    <div class="total-row"><span style="color:#888888">Subtotal</span><span style="color:#cccccc">GhC ${Math.round(order.subtotal)}</span></div>
    ${order.deliveryFee > 0 ? `<div class="total-row"><span style="color:#888888">Delivery Fee</span><span style="color:#cccccc">GhC ${Math.round(order.deliveryFee)}</span></div>` : ""}
    <div class="total-row"><span class="grand-total">Total</span><span class="grand-total">GhC ${Math.round(order.total)}</span></div>

    <a href="${process.env.NEXTAUTH_URL}/admin/orders" class="cta-btn">View in Dashboard →</a>
  `);

  await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject: `🔔 New Order: ${order.orderNumber} — GhC ${Math.round(order.total)} | Kooqs`,
    html,
  });
}
