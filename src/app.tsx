
import { useEffect, useState } from "react";
import {
  LayoutDashboard, CalendarDays, BriefcaseBusiness, Users,
  Settings, CreditCard, Menu, X, Search, Bell, Plus,
  TrendingUp, Clock, CheckCircle2, ChevronRight, LogOut,
  Sparkles, Building2, ArrowUpRight, MessageCircle
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Tab = "Overview" | "Bookings" | "Services" | "Customers" | "Billing" | "Settings";

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Bookings", icon: CalendarDays },
  { name: "Services", icon: BriefcaseBusiness },
  { name: "Customers", icon: Users },
  { name: "Billing", icon: CreditCard },
  { name: "Settings", icon: Settings }
] as const;

export default function App() {
  const [tab, setTab] = useState<Tab>("Overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [businessName, setBusinessName] = useState("My Business");
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [newBusiness, setNewBusiness] = useState("");

  useEffect(() => {
    async function loadWorkspace() {
      if (!supabase) {
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      setUserEmail(user.email || "");

      const { data } = await supabase
        .from("business_members")
        .select("business_id, role, businesses(id,name,slug)")
        .eq("user_id", user.id);

      const items = (data || []).map((item: any) => ({
        ...item.businesses,
        role: item.role
      }));

      setBusinesses(items);
      if (items.length) setBusinessName(items[0].name);
      setLoading(false);
    }

    loadWorkspace();
  }, []);

  async function createBusiness() {
    if (!supabase || !newBusiness.trim()) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert("Please sign in first.");
      return;
    }

    const slug = newBusiness.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString().slice(-5);

    const { data, error } = await supabase.rpc("create_business_workspace", {
      business_name: newBusiness.trim(),
      business_slug: slug
    });

    if (error) {
      alert(error.message);
      return;
    }

    setBusinesses((old) => [...old, {
      id: data,
      name: newBusiness.trim(),
      slug,
      role: "owner"
    }]);
    setBusinessName(newBusiness.trim());
    setNewBusiness("");
    setShowBusinessForm(false);
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    window.location.reload();
  }

  if (loading) {
    return <div className="loading-screen"><div className="loader" /><p>Preparing your workspace...</p></div>;
  }

  if (!supabase) {
    return (
      <div className="setup-screen">
        <div className="brand-mark">S</div>
        <h1>Connect your <span>workspace</span></h1>
        <p>Add your Supabase URL and publishable key to your environment variables.</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div><strong>SERVORA</strong><small>BUSINESS OS</small></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)}><X /></button>
        </div>

        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-select">
          <Building2 size={18} />
          <select value={businessName} onChange={(e) => setBusinessName(e.target.value)}>
            {businesses.map((b) => <option key={b.id} value={b.name}>{b.name}</option>)}
            {!businesses.length && <option>My Business</option>}
          </select>
          <button title="Create business" onClick={() => setShowBusinessForm(true)}><Plus size={17} /></button>
        </div>

        <div className="workspace-label nav-heading">MENU</div>
        <nav className="side-nav">
          {navigation.map(({ name, icon: Icon }) => (
            <button key={name} className={tab === name ? "nav-link active" : "nav-link"}
              onClick={() => { setTab(name); setMobileOpen(false); }}>
              <Icon size={19} /><span>{name}</span>
              {tab === name && <span className="active-dot" />}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="upgrade-card">
            <Sparkles size={19} />
            <strong>Grow your business</strong>
            <p>Unlock more tools with a SERVORA plan.</p>
            <button onClick={() => setTab("Billing")}>Explore plans <ArrowUpRight size={14} /></button>
          </div>
          <div className="profile-row">
            <div className="avatar">{userEmail.slice(0, 1).toUpperCase() || "U"}</div>
            <div className="profile-info"><strong>{userEmail.split("@")[0] || "Account"}</strong><small>{userEmail}</small></div>
            <button title="Sign out" onClick={logout}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>

      {mobileOpen && <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />}

      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu" onClick={() => setMobileOpen(true)}><Menu /></button>
          <div className="breadcrumb">Workspace <ChevronRight size={14} /> <strong>{tab}</strong></div>
          <div className="top-actions">
            <button className="icon-button" title="Notifications"><Bell size={19} /></button>
            <div className="top-avatar">{userEmail.slice(0, 1).toUpperCase() || "U"}</div>
          </div>
        </header>

        <section className="page-content">
          {tab === "Overview" && <Overview businessName={businessName} onNavigate={setTab} />}
          {tab === "Bookings" && <Bookings />}
          {tab === "Services" && <Services />}
          {tab === "Customers" && <Customers />}
          {tab === "Billing" && <Billing />}
          {tab === "Settings" && <SettingsPage businesses={businesses} />}
        </section>
      </main>

      {showBusinessForm && (
        <div className="modal-backdrop">
          <div className="modal">
            <button className="modal-close" onClick={() => setShowBusinessForm(false)}><X /></button>
            <span className="eyebrow">NEW WORKSPACE</span>
            <h2>Create a business</h2>
            <p>Each business gets its own services, customers and bookings.</p>
            <label>Business name</label>
            <input value={newBusiness} onChange={(e) => setNewBusiness(e.target.value)}
              placeholder="e.g. Golden Touch Salon" />
            <button className="gold-button full-button" onClick={createBusiness}>Create workspace <ArrowUpRight size={17} /></button>
          </div>
        </div>
      )}
    </div>
  );
}

function PageHeading({ eyebrow, title, description, action }: any) {
  return <div className="page-heading"><div><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p>{description}</p></div>{action}</div>;
}

function Overview({ businessName, onNavigate }: any) {
  const [stats, setStats] = useState({ bookings: 0, pending: 0, customers: 0, revenue: 0 });
  const [recent, setRecent] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: membership } = await supabase.from("business_members")
        .select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
      if (!membership) return;
      const id = membership.business_id;

      const [bookings, pending, customers, revenue, recentBookings] = await Promise.all([
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("business_id", id),
        supabase.from("bookings").select("id", { count: "exact", head: true }).eq("business_id", id).eq("status", "pending"),
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("payment_records").select("amount").eq("business_id", id).eq("status", "paid"),
        supabase.from("bookings").select("id,appointment_date,status,profiles(full_name),services(name)")
          .eq("business_id", id).order("created_at", { ascending: false }).limit(5)
      ]);

      const total = (revenue.data || []).reduce((sum: number, row: any) => sum + Number(row.amount || 0), 0);
      setStats({
        bookings: bookings.count || 0,
        pending: pending.count || 0,
        customers: customers.count || 0,
        revenue: total
      });
      setRecent(recentBookings.data || []);
    }
    load();
  }, []);

  const cards = [
    { label: "Total bookings", value: stats.bookings, icon: CalendarDays, note: "All appointments" },
    { label: "Pending bookings", value: stats.pending, icon: Clock, note: "Awaiting confirmation" },
    { label: "Customers", value: stats.customers, icon: Users, note: "Registered profiles" },
    { label: "Recorded revenue", value: stats.revenue.toLocaleString(), icon: TrendingUp, note: "Confirmed paid records" }
  ];

  return <>
    <PageHeading eyebrow="BUSINESS OVERVIEW" title={`Welcome to ${businessName}`} description="Here's what's happening with your business today."
      action={<button className="gold-button" onClick={() => onNavigate("Bookings")}><Plus size={17} /> New booking</button>} />
    <div className="welcome-banner">
      <div><span className="eyebrow">YOUR BUSINESS, BETTER MANAGED</span><h2>Make every appointment <em>count.</em></h2><p>Manage your services, customers and bookings from one elegant workspace.</p></div>
      <div className="banner-art"><div className="art-ring" /><Sparkles size={60} /></div>
    </div>
    <div className="stats-grid">
      {cards.map(({ label, value, icon: Icon, note }) => <div className="stat-card" key={label}>
        <div className="stat-top"><span>{label}</span><div className="stat-icon"><Icon size={19} /></div></div>
        <strong>{value}</strong><small>{note}</small>
      </div>)}
    </div>
    <div className="content-grid">
      <div className="panel recent-panel">
        <div className="panel-heading"><div><h3>Recent bookings</h3><p>Your latest appointment activity</p></div><button className="text-button" onClick={() => onNavigate("Bookings")}>View all <ChevronRight size={15} /></button></div>
        {recent.length ? recent.map((item) => <div className="booking-row" key={item.id}>
          <div className="booking-icon"><CalendarDays size={18} /></div>
          <div className="booking-detail"><strong>{item.profiles?.full_name || "Customer"}</strong><small>{item.services?.name || "Service"} · {new Date(item.appointment_date).toLocaleDateString()}</small></div>
          <span className={`status ${item.status}`}>{item.status}</span>
        </div>) : <div className="empty-state"><CalendarDays size={30} /><strong>No bookings yet</strong><p>New customer appointments will appear here.</p></div>}
      </div>
      <div className="panel quick-panel"><div className="panel-heading"><div><h3>Quick actions</h3><p>Keep your business moving</p></div></div>
        {[["Manage services", BriefcaseBusiness, "Services"], ["View customers", Users, "Customers"], ["Business settings", Settings, "Settings"]].map(([label, Icon, destination]: any) => <button className="quick-action" key={label} onClick={() => onNavigate(destination)}><Icon size={18} /><span>{label}</span><ChevronRight size={16} /></button>)}
      </div>
    </div>
  </>;
}

function Bookings() {
  const [items, setItems] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: m } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
      if (!m) return;
      let query = supabase.from("bookings").select("*,profiles(full_name),services(name)").eq("business_id", m.business_id).order("appointment_date");
      if (filter !== "all") query = query.eq("status", filter);
      const { data } = await query;
      setItems(data || []);
    }
    load();
  }, [filter]);
  return <><PageHeading eyebrow="APPOINTMENTS" title="Bookings" description="Review and manage customer appointments." />
    <div className="filter-row">{["all","pending","confirmed","in_progress","completed","cancelled"].map(x => <button className={filter === x ? "filter active-filter" : "filter"} key={x} onClick={() => setFilter(x)}>{x.replace("_"," ")}</button>)}</div>
    <div className="panel table-panel"><div className="table-scroll"><table><thead><tr><th>Customer</th><th>Service</th><th>Date</th><th>Status</th></tr></thead><tbody>{items.map(b => <tr key={b.id}><td>{b.profiles?.full_name || "Customer"}</td><td>{b.services?.name || "Service"}</td><td>{new Date(b.appointment_date).toLocaleString()}</td><td><span className={`status ${b.status}`}>{b.status}</span></td></tr>)}</tbody></table></div>{!items.length && <div className="empty-state">No bookings found.</div>}</div>
  </>;
}

function Services() {
  const [items, setItems] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  async function load() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (!m) return;
    const { data } = await supabase.from("services").select("*").eq("business_id", m.business_id).order("created_at", { ascending: false });
    setItems(data || []);
  }
  useEffect(() => { load(); }, []);
  async function addService() {
    if (!supabase || !name.trim() || Number(price) < 0) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (!m) return;
    const { error } = await supabase.from("services").insert({
      business_id: m.business_id, name: name.trim(), price: Number(price),
      description, duration_minutes: 60, is_active: true
    });
    if (error) alert(error.message);
    else { setName(""); setPrice(""); setDescription(""); load(); }
  }
  return <><PageHeading eyebrow="YOUR OFFERINGS" title="Services" description="Create and manage the services your business provides." />
    <div className="panel form-panel"><h3>Add a service</h3><div className="form-grid"><input placeholder="Service name" value={name} onChange={e => setName(e.target.value)} /><input type="number" min="0" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} /><input placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} /><button className="gold-button" onClick={addService}><Plus size={16}/> Add service</button></div></div>
    <div className="service-grid">{items.map(s => <div className="service-card" key={s.id}><div className="service-art"><BriefcaseBusiness size={26}/></div><h3>{s.name}</h3><p>{s.description}</p><strong>{Number(s.price).toLocaleString()}</strong><small>{s.duration_minutes} minutes · {s.is_active ? "Active" : "Inactive"}</small></div>)}</div>
    {!items.length && <div className="empty-state">No services have been added yet.</div>}
  </>;
}

function Customers() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    async function load() {
      if (!supabase) return;
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: m } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
      if (!m) return;
      const { data } = await supabase.from("bookings").select("customer_id,profiles(id,full_name,email)").eq("business_id", m.business_id);
      const unique = new Map();
      (data || []).forEach((row: any) => { if (row.profiles) unique.set(row.customer_id, row.profiles); });
      setItems(Array.from(unique.values()));
    }
    load();
  }, []);
  return <><PageHeading eyebrow="RELATIONSHIPS" title="Customers" description="Customers who have booked with this business." /><div className="panel table-panel"><table><thead><tr><th>Name</th><th>Email</th></tr></thead><tbody>{items.map(c => <tr key={c.id}><td>{c.full_name || "Customer"}</td><td>{c.email || "—"}</td></tr>)}</tbody></table>{!items.length && <div className="empty-state">No customer records yet.</div>}</div></>;
}

function Billing() {
  return <><PageHeading eyebrow="SERVORA PLANS" title="Subscription & billing" description="Choose a plan and billing cycle for your business workspace." />
    <div className="billing-toggle"><span>Choose monthly or yearly billing</span></div>
    <div className="plan-grid">{[
      {name:"Free",monthly:0,yearly:0,features:["1 business workspace","Basic service listing","Booking overview"]},
      {name:"Starter",monthly:9,yearly:90,features:["More services","Booking management","Customer records"]},
      {name:"Professional",monthly:19,yearly:190,features:["Advanced analytics","Custom branding","Priority support"]},
      {name:"Business",monthly:39,yearly:390,features:["Team access","Advanced management","Multiple staff accounts"]}
    ].map(p=><div className="plan-card" key={p.name}><span className="eyebrow">SERVORA PLAN</span><h2>{p.name}</h2><strong>${p.monthly}<small>/month</small></strong><p>Or ${p.yearly} billed yearly</p>{p.features.map(f=><div className="plan-feature" key={f}><CheckCircle2 size={16}/>{f}</div>)}<button className="gold-button" onClick={()=>alert("Subscription checkout must be connected to your payment provider before activation.")}>Select plan</button></div>)}</div>
    <p className="muted-note">Prices are sample configuration values. Connect a payment provider and configure your actual pricing before selling subscriptions.</p>
  </>;
}

function SettingsPage({ businesses }: any) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [message, setMessage] = useState("");
  async function save() {
    if (!supabase) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: m } = await supabase.from("business_members").select("business_id").eq("user_id", user.id).limit(1).maybeSingle();
    if (!m) return;
    const { error } = await supabase.from("business_settings").upsert({
      business_id: m.business_id, business_name: name, phone, currency
    }, { onConflict: "business_id" });
    setMessage(error ? error.message : "Settings saved.");
  }
  return <><PageHeading eyebrow="CONFIGURATION" title="Business settings" description="Customize your workspace identity and contact details." />
    <div className="panel settings-panel"><label>Business name</label><input value={name} onChange={e=>setName(e.target.value)} placeholder="Your business name"/><label>Phone number</label><input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+234..."/><label>Currency</label><select value={currency} onChange={e=>setCurrency(e.target.value)}><option value="USD">USD</option><option value="NGN">NGN</option><option value="GBP">GBP</option><option value="EUR">EUR</option></select><button className="gold-button" onClick={save}>Save settings</button>{message && <p>{message}</p>}</div>
    <div className="panel"><h3>Your workspaces</h3>{businesses.map((b:any)=><p key={b.id}>{b.name} · {b.role}</p>)}</div>
  </>;
}
