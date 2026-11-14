
import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard, CalendarDays, BriefcaseBusiness, Users,
  CreditCard, Settings, LogOut, Menu, Plus, Search, Pencil,
  Trash2, Check, X, RefreshCw, Save, ArrowRight, Loader2
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./styles.css";

type Section = "Overview" | "Bookings" | "Services" | "Customers" | "Billing" | "Settings";
type BookingStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled";

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
  name: "", description: "", price: "0", duration_minutes: "60",
  category: "", is_active: true
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
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  gap: 8, padding: "12px 17px", border: 0, borderRadius: 8,
  background: "linear-gradient(130deg,#f1d895,#c49a48)",
  color: "#17130b", fontWeight: 800, fontSize: 12, cursor: "pointer"
};

const secondaryButton: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 7,
  padding: "10px 13px", border: "1px solid #383838",
  borderRadius: 8, background: "#17191b", color: "#eee",
  fontSize: 12, cursor: "pointer"
};

function Panel({ title, children, action }: {
  title: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <section className="dashboard-panel" style={{ marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{title}</h2>{action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; type?: string
}) {
  return (
    <label style={labelStyle}>
      {label}
      <input style={inputStyle} type={type} value={value}
        placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </label>
  );
}

function Notice({ message, error }: { message: string; error?: boolean }) {
  if (!message) return null;
  return (
    <div className="auth-message" style={{
      borderColor: error ? "#a84d4d" : "#d6ad5555",
      color: error ? "#ffaaaa" : "#f1d38b"
    }}>{message}</div>
  );
}

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<"home" | "login" | "register" | "dashboard">("home");
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
    setMessage(text);
    setIsError(error);
  }

  useEffect(() => {
    if (!supabase) {
      setReady(true);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      const current = data.session?.user ?? null;
      setUser(current);
      setScreen(current ? "dashboard" : "home");
      setReady(true);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setScreen(session?.user ? "dashboard" : "home");
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function loadBusinesses() {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("business_members")
      .select("business_id, businesses(id,name,slug)")
      .eq("user_id", user.id);
    if (error) throw error;
    const list = (data || []).map((row: any) => row.businesses).filter(Boolean);
    setBusinesses(list);
    if (list.length && !list.some((b: Business) => b.id === businessId)) {
      setBusinessId(list[0].id);
    }
  }

  async function loadWorkspace() {
    if (!supabase || !businessId) return;
    const [serviceResult, bookingResult, settingsResult, subscriptionResult] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("created_at", { ascending: false }),
      supabase.from("bookings").select("*").eq("business_id", businessId).order("appointment_date", { ascending: false }),
      supabase.from("business_settings").select("*").eq("business_id", businessId).maybeSingle(),
      supabase.from("subscriptions").select("*").eq("business_id", businessId).maybeSingle()
    ]);

    const firstError = serviceResult.error || bookingResult.error || settingsResult.error || subscriptionResult.error;
    if (firstError) throw firstError;

    setServices((serviceResult.data || []) as Service[]);
    setBookings((bookingResult.data || []) as Booking[]);
    setSettings(settingsResult.data || {});
    setSubscription(subscriptionResult.data || { plan: "free", billing_cycle: "monthly", status: "trialing" });
  }

  useEffect(() => {
    if (!user) return;
    loadBusinesses().catch(e => notify("Could not load workspaces: " + e.message, true));
  }, [user]);

  useEffect(() => {
    if (!businessId) return;
    loadWorkspace().catch(e => notify("Database error: " + e.message, true));
  }, [businessId]);

  async function refresh() {
    setBusy(true);
    try {
      await loadBusinesses();
      if (businessId) await loadWorkspace();
      notify("Workspace data refreshed.");
    } catch (e: any) {
      notify(e.message || "Refresh failed.", true);
    } finally {
      setBusy(false);
    }
  }

  async function authenticate(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return notify("Supabase environment variables are missing.", true);
    setBusy(true);
    try {
      if (screen === "register") {
        const { data, error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin }
        });
        if (error) throw error;
        if (data.session) {
          setUser(data.user);
          setScreen("dashboard");
        } else {
          notify("Check your email to confirm your account, then log in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        setScreen("dashboard");
      }
    } catch (e: any) {
      notify(e.message || "Authentication failed.", true);
    } finally {
      setBusy(false);
    }
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
    } catch (e: any) {
      notify(e.message || "Could not create workspace.", true);
    } finally {
      setBusy(false);
    }
  }

  async function signOut() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) notify(error.message, true);
    else {
      setUser(null);
      setBusinesses([]);
      setBusinessId("");
      setScreen("home");
    }
  }

  async function saveService(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessId) return;
    setBusy(true);
    const payload = {
      business_id: businessId,
      name: serviceForm.name.trim(),
      description: serviceForm.description.trim(),
      price: Number(serviceForm.price),
      duration_minutes: Number(serviceForm.duration_minutes),
      category: serviceForm.category.trim(),
      is_active: serviceForm.is_active
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
      setShowServiceForm(false);
      setEditingService(null);
      setServiceForm(emptyService);
      await loadWorkspace();
      notify(editingService ? "Service updated." : "Service created.");
    } catch (e: any) {
      notify(e.message || "Could not save service.", true);
    } finally {
      setBusy(false);
    }
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
    await loadWorkspace();
    notify("Service deleted.");
  }

  async function saveBooking(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessId) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("bookings").insert({
        business_id: businessId,
        service_id: bookingForm.service_id || null,
        customer_name: bookingForm.customer_name.trim(),
        customer_email: bookingForm.customer_email.trim(),
        customer_phone: bookingForm.customer_phone.trim(),
        appointment_date: new Date(bookingForm.appointment_date).toISOString(),
        customer_notes: bookingForm.customer_notes.trim(),
        status: "pending",
        payment_status: "unpaid"
      });
      if (error) throw error;
      setShowBookingForm(false);
      setBookingForm(emptyBooking);
      await loadWorkspace();
      notify("Appointment created.");
    } catch (e: any) {
      notify(e.message || "Could not create booking.", true);
    } finally {
      setBusy(false);
    }
  }

  async function updateBooking(id: string, changes: Partial<Booking>) {
    if (!supabase || !businessId) return;
    const { error } = await supabase.from("bookings").update({
      ...changes, updated_at: new Date().toISOString()
    }).eq("id", id).eq("business_id", businessId);
    if (error) return notify(error.message, true);
    await loadWorkspace();
    notify("Booking updated.");
  }

  async function deleteBooking(id: string) {
    if (!supabase || !businessId || !window.confirm("Delete this booking?")) return;
    const { error } = await supabase.from("bookings").delete().eq("id", id).eq("business_id", businessId);
    if (error) return notify(error.message, true);
    await loadWorkspace();
    notify("Booking deleted.");
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase || !businessId) return;
    setBusy(true);
    try {
      const payload = {
        business_id: businessId,
        business_name: settings.business_name || business?.name || "",
        description: settings.description || "",
        category: settings.category || "",
        phone: settings.phone || "",
        email: settings.email || user?.email || "",
        address: settings.address || "",
        currency: settings.currency || "USD",
        website: settings.website || "",
        whatsapp: settings.whatsapp || "",
        updated_at: new Date().toISOString()
      };
      const { error } = await supabase.from("business_settings").upsert(payload, { onConflict: "business_id" });
      if (error) throw error;
      notify("Business settings saved.");
      await loadWorkspace();
    } catch (e: any) {
      notify(e.message || "Could not save settings.", true);
    } finally {
      setBusy(false);
    }
  }

  const customers = useMemo(() => {
    const map = new Map<string, any>();
    bookings.forEach(b => {
      const key = (b.customer_email || b.customer_phone || b.customer_name).toLowerCase();
      if (key && !map.has(key)) map.set(key, {
        name: b.customer_name || "Unnamed customer",
        email: b.customer_email || "",
        phone: b.customer_phone || "",
        bookings: 0,
        lastBooking: b.appointment_date
      });
      if (key) map.get(key).bookings += 1;
    });
    return [...map.values()];
  }, [bookings]);

  const filteredBookings = bookings.filter(b =>
    [b.customer_name, b.customer_email, b.customer_phone, b.status]
      .join(" ").toLowerCase().includes(search.toLowerCase())
  );
  const filteredServices = services.filter(s =>
    [s.name, s.category, s.description].join(" ").toLowerCase().includes(search.toLowerCase())
  );

  if (!ready) return <div className="loading-screen"><Loader2 className="spin"/><p>Loading SERVORA...</p></div>;

  if (screen === "home" || screen === "login" || screen === "register") {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="site-brand auth-brand"><span className="site-brand-mark">S</span><span>SERVORA<small>BUSINESS MANAGEMENT</small></span></div>
          {screen === "home" ? (
            <>
              <div className="hero-label">BUSINESS MANAGEMENT PLATFORM</div>
              <h1>Run your business in one place.</h1>
              <p>Manage appointments, services and customer records with your own SERVORA workspace.</p>
              <button style={{ ...goldButton, width: "100%", marginTop: 15 }} onClick={() => setScreen("register")}>Create your account <ArrowRight size={16}/></button>
              <button style={{ ...secondaryButton, width: "100%", justifyContent: "center", marginTop: 10 }} onClick={() => setScreen("login")}>Log in</button>
            </>
          ) : (
            <>
              <div className="hero-label">{screen === "register" ? "CREATE YOUR ACCOUNT" : "WELCOME BACK"}</div>
              <h1>{screen === "register" ? "Get started with SERVORA." : "Log in to SERVORA."}</h1>
              <p>{screen === "register" ? "Create your account and set up your business workspace." : "Continue to your business workspace."}</p>
              <Notice message={message} error={isError}/>
              <form onSubmit={authenticate}>
                <Field label="Email address" value={email} onChange={setEmail} type="email" placeholder="you@example.com"/>
                <Field label="Password" value={password} onChange={setPassword} type="password" placeholder="At least 6 characters"/>
                <button disabled={busy} style={{ ...goldButton, width: "100%", marginTop: 20 }}>
                  {busy ? "Please wait..." : screen === "register" ? "Create account" : "Log in"}
                </button>
              </form>
              <p style={{ marginTop: 20, textAlign: "center" }}>
                <button style={{ background: "none", border: 0, color: "#e1bf70", fontSize: 12 }}
                  onClick={() => { setMessage(""); setScreen(screen === "register" ? "login" : "register"); }}>
                  {screen === "register" ? "Already registered? Log in" : "Need an account? Register"}
                </button>
              </p>
              <button onClick={() => { setMessage(""); setScreen("home"); }} style={{ ...secondaryButton, width: "100%", justifyContent: "center" }}>Back</button>
            </>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${menuOpen ? "dashboard-sidebar-open" : ""}`}>
        <div className="site-brand"><span className="site-brand-mark">S</span><span>SERVORA<small>BUSINESS MANAGEMENT</small></span></div>
        <div className="dashboard-label">BUSINESS WORKSPACE</div>
        {businesses.length > 0 && (
          <select value={businessId} onChange={e => setBusinessId(e.target.value)}>
            {businesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        )}
        <button style={{ ...secondaryButton, width: "100%", justifyContent: "center", marginTop: 8 }} onClick={() => setBusinessName("")}> </button>
        <div className="dashboard-label">MANAGEMENT</div>
        {sections.map(item => {
          const Icon = item === "Overview" ? LayoutDashboard : item === "Bookings" ? CalendarDays :
            item === "Services" ? BriefcaseBusiness : item === "Customers" ? Users :
            item === "Billing" ? CreditCard : Settings;
          return <button key={item} className={`dashboard-nav-item ${section === item ? "selected" : ""}`}
            onClick={() => { setSection(item); setSearch(""); setMessage(""); setMenuOpen(false); }}>
            <Icon size={17}/>{item}
          </button>;
        })}
        <button className="dashboard-logout" onClick={signOut}><LogOut size={17}/> Sign out</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="site-menu-button" onClick={() => setMenuOpen(!menuOpen)}><Menu/></button>
          <strong>{business?.name || "SERVORA"}</strong>
          <span className="dashboard-user">{user?.email}</span>
        </header>

        <div className="dashboard-content">
          <Notice message={message} error={isError}/>
          <div className="dashboard-heading" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div><div className="hero-label">BUSINESS WORKSPACE</div><h1>{section}</h1><p>Manage {business?.name || "your business"} with SERVORA.</p></div>
            <button style={secondaryButton} onClick={refresh} disabled={busy}><RefreshCw size={15}/> Refresh</button>
          </div>

          {!business ? (
            <div className="workspace-setup">
              <h1>Create your business workspace</h1>
              <p>Set up the business you want to manage.</p>
              <form onSubmit={createBusiness}>
                <Field label="Business name" value={businessName} onChange={setBusinessName} placeholder="e.g. Bright Cleaning Services"/>
                <button disabled={busy} style={{ ...goldButton, marginTop: 15 }}>Create workspace <ArrowRight size={16}/></button>
              </form>
            </div>
          ) : (
            <>
              {section === "Overview" && (
                <>
                  <div className="dashboard-stats">
                    <div><span>Total bookings</span><strong>{bookings.length}</strong><small>All recorded appointments</small></div>
                    <div><span>Pending</span><strong>{bookings.filter(b => b.status === "pending").length}</strong><small>Awaiting confirmation</small></div>
                    <div><span>Services</span><strong>{services.length}</strong><small>All listed services</small></div>
                    <div><span>Customers</span><strong>{customers.length}</strong><small>Unique booking contacts</small></div>
                  </div>
                  <Panel title="Recent bookings" action={<button style={secondaryButton} onClick={() => setSection("Bookings")}>View all <ArrowRight size={14}/></button>}>
                    <BookingTable bookings={bookings.slice(0, 6)} services={services} onStatus={updateBooking} onDelete={deleteBooking}/>
                  </Panel>
                  <Panel title="Your services" action={<button style={secondaryButton} onClick={() => setSection("Services")}>Manage services <ArrowRight size={14}/></button>}>
                    {services.length ? services.slice(0, 4).map(s => <div key={s.id} style={rowStyle}><strong>{s.name}</strong><span>{settings.currency || "USD"} {Number(s.price).toFixed(2)}</span></div>) : <p>No services added yet. Open Services to add your first one.</p>}
                  </Panel>
                </>
              )}

              {section === "Bookings" && (
                <Panel title="Appointment management" action={<button style={goldButton} onClick={() => setShowBookingForm(!showBookingForm)}><Plus size={16}/> New booking</button>}>
                  {showBookingForm && (
                    <form onSubmit={saveBooking} className="dashboard-panel" style={{ marginBottom: 20 }}>
                      <h3>New appointment</h3>
                      <Field label="Customer name" value={bookingForm.customer_name} onChange={v => setBookingForm({ ...bookingForm, customer_name: v })}/>
                      <Field label="Customer email" type="email" value={bookingForm.customer_email} onChange={v => setBookingForm({ ...bookingForm, customer_email: v })}/>
                      <Field label="Customer phone" value={bookingForm.customer_phone} onChange={v => setBookingForm({ ...bookingForm, customer_phone: v })}/>
                      <label style={labelStyle}>Service<select style={inputStyle} value={bookingForm.service_id} onChange={e => setBookingForm({ ...bookingForm, service_id: e.target.value })}><option value="">Select service (optional)</option>{services.filter(s => s.is_active).map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
                      <Field label="Appointment date and time" type="datetime-local" value={bookingForm.appointment_date} onChange={v => setBookingForm({ ...bookingForm, appointment_date: v })}/>
                      <label style={labelStyle}>Notes<textarea style={{ ...inputStyle, minHeight: 75 }} value={bookingForm.customer_notes} onChange={e => setBookingForm({ ...bookingForm, customer_notes: e.target.value }}/></label>
                      <div style={{ display: "flex", gap: 9, marginTop: 15 }}><button style={goldButton} disabled={busy}>Save booking</button><button type="button" style={secondaryButton} onClick={() => setShowBookingForm(false)}>Cancel</button></div>
                    </form>
                  )}
                  <SearchBox value={search} onChange={setSearch}/>
                  <BookingTable bookings={filteredBookings} services={services} onStatus={updateBooking} onDelete={deleteBooking}/>
                </Panel>
              )}

              {section === "Services" && (
                <Panel title="Your services" action={<button style={goldButton} onClick={() => { setEditingService(null); setServiceForm(emptyService); setShowServiceForm(!showServiceForm); }}><Plus size={16}/> Add service</button>}>
                  {showServiceForm && (
                    <form onSubmit={saveService} className="dashboard-panel" style={{ marginBottom: 20 }}>
                      <h3>{editingService ? "Edit service" : "Add a service"}</h3>
                      <Field label="Service name" value={serviceForm.name} onChange={v => setServiceForm({ ...serviceForm, name: v })} placeholder="e.g. Standard cleaning"/>
                      <Field label="Description" value={serviceForm.description} onChange={v => setServiceForm({ ...serviceForm, description: v })}/>
                      <Field label="Category" value={serviceForm.category} onChange={v => setServiceForm({ ...serviceForm, category: v })}/>
                      <Field label="Price" type="number" value={serviceForm.price} onChange={v => setServiceForm({ ...serviceForm, price: v })}/>
                      <Field label="Duration (minutes)" type="number" value={serviceForm.duration_minutes} onChange={v => setServiceForm({ ...serviceForm, duration_minutes: v })}/>
                      <label style={{ ...labelStyle, display: "flex", gap: 9, alignItems: "center" }}><input type="checkbox" checked={serviceForm.is_active} onChange={e => setServiceForm({ ...serviceForm, is_active: e.target.checked })}/> Active service</label>
                      <div style={{ display: "flex", gap: 9, marginTop: 15 }}><button style={goldButton} disabled={busy}><Save size={15}/> Save service</button><button type="button" style={secondaryButton} onClick={() => setShowServiceForm(false)}>Cancel</button></div>
                    </form>
                  )}
                  <SearchBox value={search} onChange={setSearch}/>
                  {filteredServices.length ? filteredServices.map(s => (
                    <div key={s.id} style={rowStyle}>
                      <div style={{ flex: 1 }}><strong>{s.name}</strong><p style={mutedStyle}>{s.category || "General"} · {s.duration_minutes} minutes · {s.is_active ? "Active" : "Inactive"}</p><span style={{ color: "#e5c77c" }}>{settings.currency || "USD"} {Number(s.price).toFixed(2)}</span></div>
                      <button style={secondaryButton} onClick={() => editService(s)}><Pencil size={14}/></button>
                      <button style={secondaryButton} onClick={() => deleteService(s.id)}><Trash2 size={14}/></button>
                    </div>
                  )) : <p>No services found. Add your first service above.</p>}
                </Panel>
              )}

              {section === "Customers" && (
                <Panel title={`Customers (${customers.length})`}>
                  <SearchBox value={search} onChange={setSearch}/>
                  {customers.filter(c => [c.name, c.email, c.phone].join(" ").toLowerCase().includes(search.toLowerCase())).length ? (
                    customers.filter(c => [c.name, c.email, c.phone].join(" ").toLowerCase().includes(search.toLowerCase())).map((c, i) => (
                      <div key={i} style={rowStyle}><div style={{ flex: 1 }}><strong>{c.name}</strong><p style={mutedStyle}>{c.email || "No email"} · {c.phone || "No phone"}</p><small style={{ color: "#d6ad55" }}>{c.bookings} booking(s)</small></div></div>
                    ))
                  ) : <p>Customer records will appear here when appointments are added.</p>}
                </Panel>
              )}

              {section === "Billing" && (
                <Panel title="Subscription and billing">
                  <div className="dashboard-stats">
                    <div><span>Current plan</span><strong style={{ fontSize: 21 }}>{subscription?.plan || "Free"}</strong><small>Workspace plan</small></div>
                    <div><span>Billing cycle</span><strong style={{ fontSize: 21 }}>{subscription?.billing_cycle || "Monthly"}</strong><small>Selected cycle</small></div>
                    <div><span>Status</span><strong style={{ fontSize: 21 }}>{subscription?.status || "Trialing"}</strong><small>Subscription status</small></div>
                  </div>
                  <p style={mutedStyle}>Monthly and yearly billing options can be offered here. Payment processing is not connected yet, so no charge or plan upgrade can be made from this screen.</p>
                  <div className="feature-grid" style={{ marginTop: 20 }}>
                    {["Starter", "Professional", "Business"].map(plan => <div className="feature-card" key={plan}><h3>{plan}</h3><p>Plan features and prices will be configured before subscriptions go live.</p><span style={{ color: "#d6ad55", fontSize: 11 }}>Coming with payment integration</span></div>)}
                  </div>
                </Panel>
              )}

              {section === "Settings" && (
                <Panel title="Business profile and settings">
                  <form onSubmit={saveSettings}>
                    <Field label="Business name" value={settings.business_name ?? business.name} onChange={v => setSettings({ ...settings, business_name: v })}/>
                    <Field label="Business description" value={settings.description || ""} onChange={v => setSettings({ ...settings, description: v })}/>
                    <Field label="Business category" value={settings.category || ""} onChange={v => setSettings({ ...settings, category: v })}/>
                    <Field label="Phone" value={settings.phone || ""} onChange={v => setSettings({ ...settings, phone: v })}/>
                    <Field label="Business email" type="email" value={settings.email ?? user?.email ?? ""} onChange={v => setSettings({ ...settings, email: v })}/>
                    <Field label="Address" value={settings.address || ""} onChange={v => setSettings({ ...settings, address: v })}/>
                    <Field label="Website" value={settings.website || ""} onChange={v => setSettings({ ...settings, website: v })}/>
                    <Field label="WhatsApp number" value={settings.whatsapp || ""} onChange={v => setSettings({ ...settings, whatsapp: v })}/>
                    <label style={labelStyle}>Currency<select style={inputStyle} value={settings.currency || "USD"} onChange={e => setSettings({ ...settings, currency: e.target.value })}><option value="USD">USD — US Dollar</option><option value="NGN">NGN — Nigerian Naira</option><option value="GBP">GBP — British Pound</option><option value="EUR">EUR — Euro</option></select></label>
                    <button style={{ ...goldButton, marginTop: 20 }} disabled={busy}><Save size={15}/> Save settings</button>
                  </form>
                </Panel>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

const rowStyle: React.CSSProperties = {
  display: "flex", alignItems: "center", gap: 12, padding: "15px 3px",
  borderBottom: "1px solid #292b2d", color: "#eee", fontSize: 12
};

const mutedStyle: React.CSSProperties = {
  color: "#999da3", fontSize: 11, margin: "6px 0"
};

function SearchBox({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return <div style={{ position: "relative", marginBottom: 17 }}>
    <Search size={16} style={{ position: "absolute", left: 12, top: 14, color: "#888" }}/>
    <input style={{ ...inputStyle, paddingLeft: 38, margin: 0 }} placeholder="Search..." value={value} onChange={e => onChange(e.target.value)}/>
  </div>;
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
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
        <thead><tr>{["Customer", "Service", "Appointment", "Status", "Actions"].map(h => <th key={h} style={{ ...cell, color: "#d6ad55" }}>{h}</th>)}</tr></thead>
        <tbody>
          {bookings.map(b => (
            <tr key={b.id}>
              <td style={cell}><strong>{b.customer_name || "Customer"}</strong><div style={mutedStyle}>{b.customer_email}</div><div style={mutedStyle}>{b.customer_phone}</div></td>
              <td style={cell}>{services.find(s => s.id === b.service_id)?.name || "Not selected"}</td>
              <td style={cell}>{new Date(b.appointment_date).toLocaleString()}</td>
              <td style={cell}>
                <select value={b.status} onChange={e => onStatus(b.id, { status: e.target.value as BookingStatus })}
                  style={{ ...inputStyle, width: 130, minHeight: 34, margin: 0, padding: 5 }}>
                  {["pending", "confirmed", "in_progress", "completed", "cancelled"].map(s => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                </select>
              </td>
              <td style={cell}><button style={secondaryButton} onClick={() => onDelete(b.id)}><Trash2 size={14}/></button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
