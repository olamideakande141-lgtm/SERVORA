
export type SubscriptionPlan = "free" | "starter" | "pro" | "business";
export type BillingCycle = "monthly" | "yearly";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface Business {
  id: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  owner_id: string;
  created_at: string;
}

export interface Membership {
  id: string;
  business_id: string;
  user_id: string;
  role: "owner" | "admin" | "staff";
}

export interface Subscription {
  id: string;
  business_id: string;
  plan: SubscriptionPlan;
  billing_cycle: BillingCycle;
  status: "trialing" | "active" | "past_due" | "cancelled";
  current_period_end?: string;
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
}

export interface Booking {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string;
  appointment_date: string;
  status: BookingStatus;
  payment_status: "unpaid" | "pending" | "paid" | "refunded";
}
