import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Kooqs.Takeout — Fresh. Fast. Flavorful.",
  description: "Order fresh, handcrafted food online for pickup or delivery from Kooqs.Takeout.",
  icons: { icon: "/logo.jpeg" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: "#1a1a1a",
                color: "#ffffff",
                border: "1px solid #333",
                borderRadius: "12px",
                fontSize: "14px",
              },
              success: { iconTheme: { primary: "#DC1A17", secondary: "#fff" } },
            }}
          />
        </CartProvider>
      </body>
    </html>
  );
}
