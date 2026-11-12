export type Role = "platform_admin" | "business_owner" | "staff" | "customer";
export type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "cancelled" | "expired" | "suspended";
export interface Business {
  id: string; name: string; slug: string; category: string | null;
  description: string | null; logo_url: string | null; primary_color: string;
  phone: string | null; email: string | null; whatsapp_number: string | null;
  currency: string; timezone: string; created_at: string;
}
export interface Service {
  id: string; business_id: string; name: string; description: string | null;
  price_minor: number; duration_minutes: number; image_url: string | null; is_active: boolean;
}
export interface Booking {
  id: string; business_id: string; customer_id: string; service_id: string;
  starts_at: string; ends_at: string; status: BookingStatus; payment_status: string;
}