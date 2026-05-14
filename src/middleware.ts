export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/admin/dashboard/:path*", "/admin/orders/:path*", "/admin/menu/:path*", "/admin/analytics/:path*", "/admin/customers/:path*"],
};
