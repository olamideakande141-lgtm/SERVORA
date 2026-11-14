
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, CalendarDays, BriefcaseBusiness, Users,
  CreditCard, Settings, LogOut, Menu, Plus, Search, Pencil,
  Trash2, RefreshCw, Save, ArrowRight, Loader2, Check,
  ShieldCheck, Clock3, BarChart3, Building2, Star, ChevronDown,
  CalendarCheck, Smartphone, Globe, Zap, X
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./styles.css";

type Section = "Overview" | "Bookings" | "Services" | "Customers" | "Billing" | "Settings";
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";
type Screen = "home" | "login" | "register" | "dashboard";

type Business = { id: string; name: string; slug?: string };
type Service = {
  id: string; business_id: string; name: string; description: string;
  price: number; duration_minutes: number; category: string; is_active: boolean;
};
type Booking = {
  id: string; business_id: string; service_id: string | null;
  customer_name: string; customer_email: string; customer_phone: string;
  appointment_date: string; status: BookingStatus; payment_status: string;
  customer_notes: string;
};

const sections: Section[] = ["Overview", "Bookings", "Services", "Customers", "Billing", "Settings"];

const emptyService = {
  name: "", description: "", price: "0",
  duration_minutes: "60", category: "", is_active: true
};
const emptyBooking = {
  customer_name: "", customer_email: "", customer_phone: "",
  service_id: "", appointment_date: "", customer_notes: ""
};

const inputStyle: React.CSSProperties = {
  width: "100%", minHeight: 44, padding: "11px 13px",
  color: "#f5f5f5", background: "#090b0d",
  border: "1px solid #343638", borderRadius: 8,
  fontSize: 13, marginTop: 7
};
const labelStyle: React.CSSProperties = {
  display: "block", marginTop: 13, color: "#c9c9c9",
  fontSize: 12, fontWeight: 600
};
const goldButton: React.CSSProperties = {
  display: "inline-flex", alignItems: "center",
  justifyContent: "center", gap: 8, padding: "12px 17px",
  border: 0, borderRadius: 8,
  background: "linear-gradient(130deg,#f1d895,#c49a48)",
  color: "#17130b", fontWeight: 800, fontSize: 12, cursor: "pointer"
};
const secondaryButton: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "10px 13px", border: "1px solid #383838",
  borderRadius: 8, background: "#17191b",
  color: "#eee", fontSize: 12, cursor: "pointer"
};

function Panel({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <section className="dashboard-panel">
      <div className="panel-heading">
        <h2>{title}</h2>{action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <label className="field-label">
      {label}
      <input style={inputStyle} type={type} value={value}
        placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Notice({ message, error }: { message: string; error?: boolean }) {
  if (!message) return null;
  return <div className={`notice ${error ? "notice-error" : ""}`}>{message}</div>;
}

function Brand({ light = false }: { light?: boolean }) {
  return (
    <a className={`brand ${light ? "brand-light" : ""}`} href="#top">
      <span className="brand-mark">S</span>
      <span className="brand-name">SERVORA<small>BUSINESS MANAGEMENT</small></span>
    </a>
  );
}

function LandingPage({ onLogin, onRegister }: {
  onLogin: () => void; onRegister: () => void;
}) {
  const [mobileMenu, setMobileMenu] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);

  const features = [
    { icon: CalendarCheck, title: "Appointment management", text: "Organise new bookings, confirm appointments and manage your schedule from one place." },
    { icon: BriefcaseBusiness, title: "Service management", text: "Create services, set prices, add descriptions and control which services are available." },
    { icon: Users, title: "Customer records", text: "Keep customer contact details and booking history organised in your workspace." },
    { icon: BarChart3, title: "Business overview", text: "See booking activity, pending appointments, services and customer totals." },
    { icon: ShieldCheck, title: "Separate workspaces", text: "Keep each business workspace separated through account-based access and database permissions." },
    { icon: Smartphone, title: "Mobile friendly", text: "Use the platform on phones, tablets and desktop screens." }
  ];

  const industries = [
    ["Cleaning services", "Manage home, office and commercial cleaning appointments."],
    ["Salons and barbers", "Organise customer visits, service menus and schedules."],
    ["Plumbing and electrical", "Keep track of service requests and customer appointments."],
    ["Repairs and maintenance", "Manage bookings for mechanics, technicians and repair teams."],
    ["Beauty and wellness", "Organise treatments, appointment times and customer records."],
    ["Other service businesses", "Adapt the workspace to your appointment-based business."]
  ];

  const faqs = [
    ["What is SERVORA?", "SERVORA is a business management and appointment booking platform designed for service-based businesses."],
    ["Can different businesses use SERVORA?", "The platform is designed for separate business workspaces. Each workspace must be protected by the configured database permissions."],
    ["Can I manage my services?", "Yes. The business dashboard includes service management for adding, editing and deleting services."],
    ["Can customers book appointments online?", "The current dashboard supports appointment records. A public customer-facing booking page and automated booking availability must be configured before advertising that feature as live."],
    ["Are payments already connected?", "No. Payment processing is not connected in this version. Subscription checkout and payment verification must be integrated before paid subscriptions are activated."],
    ["Can I use SERVORA on my phone?", "The interface is designed to adapt to mobile, tablet and desktop screen sizes."]
  ];

  return (
    <div className="marketing-site" id="top">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />
          <button className="mobile-nav-toggle" onClick={() => setMobileMenu(!mobileMenu)}>
            {mobileMenu ? <X /> : <Menu />}
          </button>
          <nav className={`site-nav ${mobileMenu ? "site-nav-open" : ""}`}>
            <a href="#features" onClick={() => setMobileMenu(false)}>Features</a>
            <a href="#industries" onClick={() => setMobileMenu(false)}>Industries</a>
            <a href="#how-it-works" onClick={() => setMobileMenu(false)}>How it works</a>
            <a href="#pricing" onClick={() => setMobileMenu(false)}>Pricing</a>
            <a href="#faq" onClick={() => setMobileMenu(false)}>FAQ</a>
            <button className="nav-login" onClick={onLogin}>Log in</button>
            <button className="gold-button nav-cta" onClick={onRegister}>Get started <ArrowRight size={15} /></button>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <div className="eyebrow"><span /> BUSINESS MANAGEMENT, SIMPLIFIED</div>
              <h1>More control.<br /><em>Better business.</em></h1>
              <p className="hero-description">
                Manage appointments, services and customer relationships
                with one organised business workspace. Meet SERVORA.
              </p>
              <div className="hero-actions">
                <button className="gold-button large-button" onClick={onRegister}>
                  Create your workspace <ArrowRight size={17} />
                </button>
                <a className="text-link" href="#features">Explore the platform <ArrowRight size={15} /></a>
              </div>
              <div className="hero-trust">
                <span><Check size={14} /> Organised bookings</span>
                <span><Check size={14} /> Business workspace</span>
                <span><Check size={14} /> Mobile ready</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />
              <div className="dashboard-preview">
                <div className="preview-top">
                  <Brand />
                  <span className="preview-live"><i /> WORKSPACE PREVIEW</span>
                </div>
                <div className="preview-welcome">
                  <div><small>BUSINESS OVERVIEW</small><h3>Your business at a glance.</h3></div>
                  <span className="preview-avatar">S</span>
                </div>
                <div className="preview-stats">
                  <div><CalendarDays /><small>Bookings</small><strong>Manage</strong></div>
                  <div><Clock3 /><small>Pending</small><strong>Review</strong></div>
                  <div><BriefcaseBusiness /><small>Services</small><strong>Organise</strong></div>
                </div>
                <div className="preview-bookings">
                  <div className="preview-booking-heading"><strong>Appointment management</strong><span>Workspace</span></div>
                  <div className="preview-booking-row"><span className="preview-dot gold-dot" /><div><b>New appointment</b><small>Customer booking record</small></div><span className="preview-status">Pending</span></div>
                  <div className="preview-booking-row"><span className="preview-dot green-dot" /><div><b>Confirmed appointment</b><small>Customer booking record</small></div><span className="preview-status confirmed">Confirmed</span></div>
                  <div className="preview-booking-row"><span className="preview-dot grey-dot" /><div><b>Service management</b><small>Business service list</small></div><span className="preview-status">Active</span></div>
                </div>
                <div className="preview-footer"><ShieldCheck size={14} /> YOUR BUSINESS. YOUR WORKSPACE.</div>
              </div>
              <div className="floating-note"><span><Zap size={16} /></span><div><b>One workspace</b><small>Business operations together</small></div></div>
            </div>
          </div>
          <div className="hero-bottom-line"><span>BUILT FOR SERVICE BUSINESSES</span><span>BOOKINGS · CUSTOMERS · SERVICES · OPERATIONS</span></div>
        </section>

        <section className="intro-strip">
          <div><span className="strip-number">01</span><strong>One organised workspace</strong><p>Keep key business information together.</p></div>
          <div><span className="strip-number">02</span><strong>Clear appointment records</strong><p>Manage booking activity with less confusion.</p></div>
          <div><span className="strip-number">03</span><strong>Designed to grow</strong><p>Build a more organised service business.</p></div>
        </section>

        <section className="section-block" id="features">
          <div className="section-heading">
            <div className="eyebrow">THE SERVORA PLATFORM</div>
            <h2>Everything organised.<br /><em>Nothing overlooked.</em></h2>
            <p>Tools designed to help service businesses manage everyday operations from one dashboard.</p>
          </div>
          <div className="feature-grid">
            {features.map(({ icon: Icon, title, text }, i) => (
              <article className="feature-card" key={title}>
                <div className="feature-icon"><Icon size={21} /></div>
                <span className="feature-index">0{i + 1}</span>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="industries-section" id="industries">
          <div className="industries-inner">
            <div className="section-heading left-heading">
              <div className="eyebrow">MADE FOR SERVICE BUSINESSES</div>
              <h2>One platform.<br /><em>Many possibilities.</em></h2>
              <p>Use a SERVORA workspace to organise the services and appointments that keep your business moving.</p>
            </div>
            <div className="industry-list">
              {industries.map(([title, text], i) => (
                <div className="industry-item" key={title}>
                  <span>0{i + 1}</span><div><strong>{title}</strong><p>{text}</p></div><ArrowRight size={17} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block how-section" id="how-it-works">
          <div className="section-heading">
            <div className="eyebrow">GET STARTED</div>
            <h2>A clearer way to<br /><em>manage your work.</em></h2>
            <p>Start with an account, create a workspace and organise your business information.</p>
          </div>
          <div className="steps-grid">
            <div className="step-card"><span>01</span><Building2 /><h3>Create an account</h3><p>Register securely with your email address and password.</p></div>
            <div className="step-card"><span>02</span><BriefcaseBusiness /><h3>Set up your workspace</h3><p>Add your business name and configure its profile.</p></div>
            <div className="step-card"><span>03</span><CalendarCheck /><h3>Manage your operations</h3><p>Add services, record appointments and manage customers.</p></div>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="section-heading">
            <div className="eyebrow">SUBSCRIPTION MODEL</div>
            <h2>Plans designed for<br /><em>business growth.</em></h2>
            <p>Monthly and yearly subscription options can be configured for the platform.</p>
          </div>
          <div className="pricing-notice">
            <CreditCard size={19} />
            <div><strong>Subscription checkout is not yet connected.</strong><p>Plan prices, payment processing and automated subscription activation must be configured before accepting payments.</p></div>
          </div>
          <div className="pricing-grid">
            {[
              ["Starter", "For businesses getting organised", ["Business workspace", "Service management", "Appointment records", "Customer records"]],
              ["Professional", "For growing service businesses", ["Everything in Starter", "Expanded business tools", "More operational flexibility", "Subscription management"]],
              ["Business", "For larger operations", ["Everything in Professional", "Advanced workspace options", "Team-ready structure", "Business support options"]]
            ].map(([name, description, items], i) => (
              <article className={`price-card ${i === 1 ? "price-card-featured" : ""}`} key={name as string}>
                {i === 1 && <span className="popular-tag">POPULAR OPTION</span>}
                <div className="price-plan">{name}</div><p>{description}</p>
                <div className="price-amount">Price to be configured</div>
                <div className="price-cycle">Monthly or yearly billing</div>
                <button className={i === 1 ? "gold-button price-cta" : "outline-button price-cta"} onClick={onRegister}>Create account <ArrowRight size={15} /></button>
                <div className="price-divider" />
                {(items as string[]).map(item => <div className="price-feature" key={item}><Check size={15} />{item}</div>)}
              </article>
            ))}
          </div>
        </section>

        <section className="buyer-section">
          <div className="buyer-panel">
            <div className="eyebrow">THE SERVORA EXPERIENCE</div>
            <h2>Bring your business<br />operations <em>together.</em></h2>
            <p>Create an account and explore the SERVORA workspace. Set up your business profile and see how its management tools fit your workflow.</p>
            <button className="gold-button large-button" onClick={onRegister}>Get started with SERVORA <ArrowRight size={16} /></button>
            <div className="buyer-decoration"><Globe size={130} /></div>
          </div>
        </section>

        <section className="section-block faq-section" id="faq">
          <div className="faq-layout">
            <div className="section-heading left-heading">
              <div className="eyebrow">NEED TO KNOW</div>
              <h2>Frequently asked<br /><em>questions.</em></h2>
              <p>Helpful information about the SERVORA platform.</p>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer], i) => (
                <div className={`faq-item ${faqOpen === i ? "faq-active" : ""}`} key={question}>
                  <button onClick={() => setFaqOpen(faqOpen === i ? null : i)}>
                    <span>{question}</span><ChevronDown size={18} />
                  </button>
                  {faqOpen === i && <p>{answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div><div className="eyebrow">START WITH SERVORA</div><h2>Make room for<br /><em>better business.</em></h2></div>
          <div><p>Ready to organise your service business? Create your account and set up your workspace.</p><button className="gold-button large-button" onClick={onRegister}>Create an account <ArrowRight size={16} /></button></div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div><Brand /><p>Business management and appointment organisation for service businesses.</p></div>
          <div className="footer-links"><strong>PLATFORM</strong><a href="#features">Features</a><a href="#industries">Industries</a><a href="#pricing">Pricing</a></div>
          <div className="footer-links"><strong>EXPLORE</strong><a href="#how-it-works">How it works</a><a href="#faq">FAQs</a><a href="#contact">Contact</a></div>
          <div className="footer-links"><strong>ACCOUNT</strong><button onClick={onLogin}>Log in</button><button onClick={onRegister}>Create account</button></div>
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} SERVORA. All rights reserved.</span><span>Business management platform</span></div>
      </footer>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("home");
  const [section, setSection] = useState<Section>("Overview");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [businessId, setBusinessId] = useState("");
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [subscription, setSubscription] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingService, setEditingService] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState(emptyService);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingForm, setBookingForm] = useState(emptyBooking);

  const business = businesses.find(b => b.id === businessId);

  function notify(text: string, error = false) {
    setMessage(text); setIsError(error);
  }

  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      const current = data.session?.user ?? null;
      setUser(current); setScreen(current ? "dashboard" : "home"); setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setScreen(session?.user ? "dashboard" : "home");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadBusinesses() {
    if (!supabase || !user) return;
    const { data, error } = await supabase.from("business_members")
      .select("business_id, businesses(id,name,slug)").eq("user_id", user.id);
    if (error) throw error;
    const list = (data || []).map((row: any) => row.businesses).filter(Boolean);
    setBusinesses(list);
    if (list.length && !list.some((b: Business) => b.id === businessId)) setBusinessId(list[0].id);
  }

  async function loadWorkspace() {
    if (!supabase || !businessId) return;
    const [sr, br, settingsResult, subscriptionResult] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").eq("business_id", businessId).order("appointment_date", { ascending: false }),
      supabase.from("business_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("business_id", businessId).maybeSingle()
    ]);
    const error = sr.error || br.error || settingsResult.error || subscriptionResult.error;
    if (error) throw error;
    setServices((sr.data || []) as Service[]);
    setBookings((br.data || []) as Booking[]);
    setSettings(settingsResult.data || {});
    setSubscription(subscriptionResult.data || { plan: "free", billing_cycle: "monthly", status: "trialing" });
  }

  useEffect(() => {
    if (user) loadBusinesses().catch(e => notify("Could not load workspaces: " + e.message, true));
  }, [user]);

  useEffect(() => {
    if (businessId) loadWorkspace().catch(e => notify("Database error: " + e.message, true));
  }, [businessId]);

  async function refresh() {
    setBusy(true);
    try {
      await loadBusinesses();
      if (businessId) await loadWorkspace();
      notify("Workspace data refreshed.");
    } catch (e: any) { notify(e.message || "Refresh failed.", true); }
    finally { setBusy(false); }
  }

  async function authenticate(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return notify("Supabase environment variables are missing.", true);
    if (password.length < 6) return notify("Password must contain at least 6 characters.", true);
    setBusy(true);
    try {
      if (screen === "register") {
        const { data, error } = await supabase.auth.signUp({
          email, password, options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        if (data.session) { setUser(data.user); setScreen("dashboard"); }
        else notify("Check your email to confirm your account, then log in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user); setScreen("dashboard");
      }
    } catch (e: any) { notify(e.message || "Authentication failed.", true); }
    finally { setBusy(false); }
  }

  async function createBusiness(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessName.trim()) return;
    setBusy(true);
    try {
      const slug = businessName.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const { data, error } = await supabase.rpc("create_business_workspace", {
        business_name: businessName.trim(), business_slug: slug
      });
      if (error) throw error;
      const id = typeof data === "string" ? data : data?.id || data?.business_id;
      await loadBusinesses();
      if (id) setBusinessId(id);
      setBusinessName("");
      notify("Business workspace created successfully.");
    } catch (e: any) { notify(e.message || "Could not create workspace.", true); }
    finally { setBusy(false); }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) notify(error.message, true);
    else {
      setUser(null); setBusinesses([]); setBusinessId("");
      setServices([]); setBookings([]); setScreen("home");
    }
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessId) return;
    if (!serviceForm.name.trim()) return notify("Enter a service name.", true);
    if (Number(serviceForm.price) < 0 || Number(serviceForm.duration_minutes) <= 0)
      return notify("Enter a valid price and duration.", true);
    setBusy(true);
    const payload = {
      business_id: businessId, name: serviceForm.name.trim(),
      description: serviceForm.description.trim(), price: Number(serviceForm.price),
      duration_minutes: Number(serviceForm.duration_minutes),
      category: serviceForm.category.trim(), is_active: serviceForm.is_active
    };
    try {
      if (editingService) {
        const { error } = await supabase.from("services").update(payload)
          .eq("id", editingService).eq("business_id", businessId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }
      setShowServiceForm(false); setEditingService(null); setServiceForm(emptyService);
      await loadWorkspace(); notify(editingService ? "Service updated." : "Service created.");
    } catch (e: any) { notify(e.message || "Could not save service.", true); }
    finally { setBusy(false); }
  }

  function editService(service: Service) {
    setEditingService(service.id);
    setServiceForm({
      name: service.name, description: service.description || "",
      price: String(service.price), duration_minutes: String(service.duration_minutes),
      category: service.category || "", is_active: service.is_active
    });
    setShowServiceForm(true);
  }

  async function deleteService(id: string) {
    if (!supabase || !businessId || !window.confirm("Delete this service?")) return;
    const { error } = await supabase.from("services").delete().eq("id", id).eq("business_id", businessId);
    if (error) return notify(error.message, true);
    await loadWorkspace(); notify("Service deleted.");
  }

  async function saveBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessId) return;
    if (!bookingForm.customer_name.trim() || !bookingForm.appointment_date)
      return notify("Customer name and appointment date are required.", true);
    const appointment = new Date(bookingForm.appointment_date);
    if (Number.isNaN(appointment.getTime())) return notify("Enter a valid appointment date.", true);
    setBusy(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        business_id: businessId, service_id: bookingForm.service_id || null,
        customer_name: bookingForm.customer_name.trim(),
        customer_email: bookingForm.customer_email.trim(),
        customer_phone: bookingForm.customer_phone.trim(),
        appointment_date: appointment.toISOString(),
        customer_notes: bookingForm.customer_notes.trim(),
        status: "pending", payment_status: "unpaid"
      });
      if (error) throw error;
      setShowBookingForm(false); setBookingForm(emptyBooking);
      await loadWorkspace(); notify("Appointment created.");
    } catch (e: any) { notify(e.message || "Could not create booking.", true); }
    finally { setBusy(false); }
  }

  async function updateBooking(id: string, changes: Partial<Booking>) {
    if (!supabase || !businessId) return;
    const { error } = await supabase.from("bookings")
      .update({ ...changes, updated_at: new Date().toISOString() })
      .eq("id", id).eq("business_id", businessId);
    if (error) return notify(error.message, true);
    await loadWorkspace(); notify("Booking updated.");
  }

  async function deleteBooking(id: string) {
    if (!supabase || !businessId || !window.confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id).eq("business_id", businessId);
    if (error) return notify(error.message, true);
    await loadWorkspace(); notify("Booking deleted.");
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessId) return;
    setBusy(true);
    try {
      const payload = {
        business_id: businessId,
        business_name: settings.business_name || business?.name || "",
        description: settings.description || "", category: settings.category || "",
        phone: settings.phone || "", email: settings.email || user?.email || "",
        address: settings.address || "", currency: settings.currency || "USD",
        website: settings.website || "", whatsapp: settings.whatsapp || "",
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from("business_settings").upsert(payload, { onConflict: "business_id" });
      if (error) throw error;
      await loadWorkspace(); notify("Business settings saved.");
    } catch (e: any) { notify(e.message || "Could not save settings.", true); }
    finally { setBusy(false); }
  }

  const customers = useMemo(() => {
    const map = new Map<string, any>();
    bookings.forEach(b => {
      const key = (b.customer_email || b.customer_phone || b.customer_name).toLowerCase();
      if (!key) return;
      if (!map.has(key)) map.set(key, {
        name: b.customer_name || "Unnamed customer", email: b.customer_email || "",
        phone: b.customer_phone || "", bookings: 0
      });
      map.get(key).bookings += 1;
    });
    return [...map.values()];
  }, [bookings]);

  const filteredBookings = bookings.filter(b =>
    [b.customer_name, b.customer_email, b.customer_phone, b.status].join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredServices = services.filter(s =>
    [s.name, s.category, s.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (!ready) return <div className="loading-screen"><Loader2 className="spin" /><p>Loading SERVORA...</p></div>;

  if (screen === "home") {
    return <LandingPage onLogin={() => { setMessage(""); setScreen("login"); }}
      onRegister={() => { setMessage(""); setScreen("register"); }} />;
  }

  if (screen === "login" || screen === "register") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <Brand />
          <div className="eyebrow auth-eyebrow">{screen === "register" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</div>
          <h1>{screen === "register" ? "Start with SERVORA." : "Welcome back."}</h1>
          <p>{screen === "register" ? "Create an account to set up your business workspace." : "Log in to continue to your workspace."}</p>
          <Notice message={message} error={isError} />
          <form onSubmit={authenticate}>
            <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com" />
            <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters" />
            <button className="gold-button auth-submit" disabled={busy}>
              {busy ? "Please wait..." : screen === "register" ? "Create account" : "Log in"} <ArrowRight size={16} />
            </button>
          </form>
          <button className="auth-switch" onClick={() => { setMessage(""); setScreen(screen === "register" ? "login" : "register"); }}>
            {screen === "register" ? "Already registered? Log in" : "Need an account? Register"}
          </button>
          <button className="back-home" onClick={() => { setMessage(""); setScreen("home"); }}>← Back to SERVORA website</button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${menuOpen ? "dashboard-sidebar-open" : ""}`}>
        <Brand />
        <div className="dashboard-label">BUSINESS WORKSPACE</div>
        {businesses.length > 0 && (
          <select className="workspace-select" value={businessId} onChange={e => setBusinessId(e.target.value)}>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <button className="workspace-create" onClick={() => { setBusinessName(""); setMessage(""); document.getElementById("workspace-create-form")?.scrollIntoView({ behavior: "smooth" }); }}>
          <Plus size={15} /> Create workspace
        </button>
        <div className="dashboard-label">MANAGEMENT</div>
        {sections.map(item => {
          const Icon = item === "Overview" ? LayoutDashboard : item === "Bookings" ? CalendarDays :
            item === "Services" ? BriefcaseBusiness : item === "Customers" ? Users :
            item === "Billing" ? CreditCard : Settings;
          return <button key={item} className={`dashboard-nav-item ${section === item ? "selected" : ""}`}
            onClick={() => { setSection(item); setSearch(""); setMessage(""); setMenuOpen(false); }}>
            <Icon size={17} />{item}
          </button>;
        })}
        <button className="dashboard-logout" onClick={signOut}><LogOut size={17} />Sign out</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="site-menu-button" onClick={() => setMenuOpen(!menuOpen)}><Menu /></button>
          <strong>{business?.name || "SERVORA"}</strong>
          <span className="dashboard-user">{user?.email}</span>
        </header>

        <div className="dashboard-content">
          <Notice message={message} error={isError} />
          <div className="dashboard-heading">
            <div><div className="eyebrow">BUSINESS WORKSPACE</div><h1>{section}</h1>
              <p>Manage {business?.name || "your business"} with SERVORA.</p></div>
            <button style={secondaryButton} onClick={refresh} disabled={busy}><RefreshCw size={15} /> Refresh</button>
          </div>

          {!business ? (
            <div className="workspace-setup" id="workspace-create-form">
              <div className="feature-icon"><Building2 /></div>
              <h1>Create your business workspace</h1>
              <p>Set up the business you want to manage.</p>
              <form onSubmit={createBusiness}>
                <Field label="Business name" value={businessName} onChange={setBusinessName} placeholder="e.g. Bright Cleaning Services" />
                <button className="gold-button" disabled={busy}>Create workspace <ArrowRight size={16} /></button>
              </form>
            </div>
          ) : (
            <>
              {section === "Overview" && <>
                <div className="dashboard-stats">
                  <div><span>Total bookings</span><strong>{bookings.length}</strong><small>All recorded appointments</small></div>
                  <div><span>Pending</span><strong>{bookings.filter(b => b.status === "pending").length}</strong><small>Awaiting confirmation</small></div>
                  <div><span>Services</span><strong>{services.length}</strong><small>All listed services</small></div>
                  <div><span>Customers</span><strong>{customers.length}</strong><small>Unique booking contacts</small></div>
                </div>
                <Panel title="Recent bookings" action={<button style={secondaryButton} onClick={() => setSection("Bookings")}>View all <ArrowRight size={14} /></button>}>
                  <BookingTable bookings={bookings.slice(0, 6)} services={services} onStatus={updateBooking} onDelete={deleteBooking} />
                </Panel>
                <Panel title="Your services" action={<button style={secondaryButton} onClick={() => setSection("Services")}>Manage services <ArrowRight size={14} /></button>}>
                  {services.length ? services.slice(0, 4).map(s => <div className="data-row" key={s.id}><strong>{s.name}</strong><span>{settings.currency || "USD"} {Number(s.price).toFixed(2)}</span></div>) : <p>No services added yet. Open Services to add your first one.</p>}
                </Panel>
              </>}

              {section === "Bookings" && <Panel title="Appointment management" action={<button className="gold-button" onClick={() => setShowBookingForm(!showBookingForm)}><Plus size={16} /> New booking</button>}>
                {showBookingForm && <form className="form-panel" onSubmit={saveBooking}>
                  <h3>New appointment</h3>
                  <Field label="Customer name" value={bookingForm.customer_name} onChange={v => setBookingForm({ ...bookingForm, customer_name: v })} />
                  <Field label="Customer email" type="email" value={bookingForm.customer_email} onChange={v => setBookingForm({ ...bookingForm, customer_email: v })} />
                  <Field label="Customer phone" value={bookingForm.customer_phone} onChange={v => setBookingForm({ ...bookingForm, customer_phone: v })} />
                  <label className="field-label">Service<select style={inputStyle} value={bookingForm.service_id} onChange={e => setBookingForm({ ...bookingForm, service_id: e.target.value })}><option value="">Select service (optional)</option>{services.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
                  <Field label="Appointment date and time" type="datetime-local" value={bookingForm.appointment_date} onChange={v => setBookingForm({ ...bookingForm, appointment_date: v })} />
                  <label className="field-label">Notes<textarea style={{ ...inputStyle, minHeight: 75 }} value={bookingForm.customer_notes} onChange={e => setBookingForm({ ...bookingForm, customer_notes: e.target.value })} /></label>
                  <div className="form-actions"><button className="gold-button" disabled={busy}>Save booking</button><button type="button" style={secondaryButton} onClick={() => setShowBookingForm(false)}>Cancel</button></div>
                </form>}
                <SearchBox value={search} onChange={setSearch} />
                <BookingTable bookings={filteredBookings} services={services} onStatus={updateBooking} onDelete={deleteBooking} />
              </Panel>}

              {section === "Services" && <Panel title="Your services" action={<button className="gold-button" onClick={() => { setEditingService(null); setServiceForm(emptyService); setShowServiceForm(!showServiceForm); }}><Plus size={16} /> Add service</button>}>
                {showServiceForm && <form className="form-panel" onSubmit={saveService}>
                  <h3>{editingService ? "Edit service" : "Add a service"}</h3>
                  <Field label="Service name" value={serviceForm.name} onChange={v => setServiceForm({ ...serviceForm, name: v })} />
                  <Field label="Description" value={serviceForm.description} onChange={v => setServiceForm({ ...serviceForm, description: v })} />
                  <Field label="Category" value={serviceForm.category} onChange={v => setServiceForm({ ...serviceForm, category: v })} />
                  <Field label="Price" type="number" value={serviceForm.price} onChange={v => setServiceForm({ ...serviceForm, price: v })} />
                  <Field label="Duration (minutes)" type="number" value={serviceForm.duration_minutes} onChange={v => setServiceForm({ ...serviceForm, duration_minutes: v })} />
                  <label className="checkbox-label"><input type="checkbox" checked={serviceForm.is_active} onChange={e => setServiceForm({ ...serviceForm, is_active: e.target.checked })} /> Active service</label>
                  <div className="form-actions"><button className="gold-button" disabled={busy}><Save size={15} /> Save service</button><button type="button" style={secondaryButton} onClick={() => setShowServiceForm(false)}>Cancel</button></div>
                </form>}
                <SearchBox value={search} onChange={setSearch} />
                {filteredServices.length ? filteredServices.map(s => <div className="data-row" key={s.id}>
                  <div className="data-row-main"><strong>{s.name}</strong><p>{s.category || "General"} · {s.duration_minutes} minutes · {s.is_active ? "Active" : "Inactive"}</p><span>{settings.currency || "USD"} {Number(s.price).toFixed(2)}</span></div>
                  <button style={secondaryButton} onClick={() => editService(s)}><Pencil size={14} /></button>
                  <button style={secondaryButton} onClick={() => deleteService(s.id)}><Trash2 size={14} /></button>
                </div>) : <p>No services found. Add your first service above.</p>}
              </Panel>}

              {section === "Customers" && <Panel title={`Customers (${customers.length})`}>
                <SearchBox value={search} onChange={setSearch} />
                {customers.filter(c => [c.name, c.email, c.phone].join(" ").toLowerCase().includes(search.toLowerCase())).map((c, i) =>
                  <div className="data-row" key={i}><div className="data-row-main"><strong>{c.name}</strong><p>{c.email || "No email"} · {c.phone || "No phone"}</p><span>{c.bookings} booking(s)</span></div></div>
                )}
                {!customers.length && <p>Customer records will appear here when appointments are added.</p>}
              </Panel>}

              {section === "Billing" && <Panel title="Subscription and billing">
                <div className="dashboard-stats">
                  <div><span>Current plan</span><strong>{subscription?.plan || "Free"}</strong><small>Workspace plan</small></div>
                  <div><span>Billing cycle</span><strong>{subscription?.billing_cycle || "Monthly"}</strong><small>Selected cycle</small></div>
                  <div><span>Status</span><strong>{subscription?.status || "Trialing"}</strong><small>Subscription status</small></div>
                </div>
                <div className="notice">Payment processing is not connected. No payment can be accepted and no paid plan can be activated from this screen yet.</div>
                <div className="feature-grid">
                  {["Starter", "Professional", "Business"].map(plan => <div className="feature-card" key={plan}><h3>{plan}</h3><p>Plan prices and billing features must be configured before subscriptions go live.</p><span className="coming-label">Payment setup required</span></div>)}
                </div>
              </Panel>}

              {section === "Settings" && <Panel title="Business profile and settings">
                <form onSubmit={saveSettings}>
                  <Field label="Business name" value={settings.business_name ?? business.name} onChange={v => setSettings({ ...settings, business_name: v })} />
                  <Field label="Business description" value={settings.description || ""} onChange={v => setSettings({ ...settings, description: v })} />
                  <Field label="Business category" value={settings.category || ""} onChange={v => setSettings({ ...settings, category: v })} />
                  <Field label="Phone" value={settings.phone || ""} onChange={v => setSettings({ ...settings, phone: v })} />
                  <Field label="Business email" type="email" value={settings.email ?? user?.email ?? ""} onChange={v => setSettings({ ...settings, email: v })} />
                  <Field label="Address" value={settings.address || ""} onChange={v => setSettings({ ...settings, address: v })} />
                  <Field label="Website" value={settings.website || ""} onChange={v => setSettings({ ...settings, website: v })} />
                  <Field label="WhatsApp number" value={settings.whatsapp || ""} onChange={v => setSettings({ ...settings, whatsapp: v })} />
                  <label className="field-label">Currency<select style={inputStyle} value={settings.currency || "USD"} onChange={e => setSettings({ ...settings, currency: e.target.value })}><option value="USD">USD — US Dollar</option><option value="NGN">NGN — Nigerian Naira</option><option value="GBP">GBP — British Pound</option><option value="EUR">EUR — Euro</option></select></label>
                  <button className="gold-button settings-save" disabled={busy}><Save size={15} /> Save settings</button>
                </form>
              </Panel>}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const mutedStyle: React.CSSProperties = { color: "#999da3", fontSize: 11, margin: "6px 0" };

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <div className="search-box"><Search size={16} /><input placeholder="Search..." value={value} onChange={e => onChange(e.target.value)} /></div>;
}

function BookingTable({ bookings, services, onStatus, onDelete }: {
  bookings: Booking[]; services: Service[];
  onStatus: (id: string, changes: Partial<Booking>) => void;
  onDelete: (id: string) => void;
}) {
  if (!bookings.length) return <p>No bookings found. Create your first appointment to see it here.</p>;
  const cell: React.CSSProperties = { padding: "12px 9px", borderBottom: "1px solid #292b2d", textAlign: "left", fontSize: 11, verticalAlign: "top" };
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="booking-table">
        <thead><tr>{["Customer", "Service", "Appointment", "Status", "Actions"].map(h => <th style={cell} key={h}>{h}</th>)}</tr></thead>
        <tbody>{bookings.map(b => <tr key={b.id}>
          <td style={cell}><strong>{b.customer_name || "Customer"}</strong><div style={mutedStyle}>{b.customer_email}</div><div style={mutedStyle}>{b.customer_phone}</div></td>
          <td style={cell}>{services.find(s => s.id === b.service_id)?.name || "Not selected"}</td>
          <td style={cell}>{new Date(b.appointment_date).toLocaleString()}</td>
          <td style={cell}><select className="status-select" value={b.status} onChange={e => onStatus(b.id, { status: e.target.value as BookingStatus })}>
            {["pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
          </select></td>
          <td style={cell}><button style={secondaryButton} onClick={() => onDelete(b.id)}><Trash2 size={14} /></button></td>
        </tr>)}</tbody>
      </table>
    </div>
  );
}
