
import { useEffect, useState } from "react";
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2,
  ChevronDown, Clock3, CreditCard, LayoutDashboard, Menu,
  ShieldCheck, Sparkles, Users, BriefcaseBusiness, Settings,
  LogOut, X, Loader2
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./styles.css";

type Screen = "home" | "login" | "register" | "dashboard";
type Section = "Overview" | "Bookings" | "Services" | "Customers" | "Billing" | "Settings";

interface Business {
  id: string;
  name: string;
  slug?: string;
}

const features = [
  {
    icon: CalendarDays,
    title: "Appointment management",
    description: "Organise appointments, manage availability and keep every booking in one place."
  },
  {
    icon: BriefcaseBusiness,
    title: "Service management",
    description: "Create services, set prices and durations, and keep your offerings up to date."
  },
  {
    icon: Users,
    title: "Customer management",
    description: "Keep customer information and appointment history organised."
  },
  {
    icon: LayoutDashboard,
    title: "Business dashboard",
    description: "See your bookings and business activity through one clear workspace."
  },
  {
    icon: ShieldCheck,
    title: "Workspace security",
    description: "Separate business workspaces with account-based access controls."
  },
  {
    icon: CreditCard,
    title: "Subscription management",
    description: "Prepare for monthly or yearly plans as your business grows."
  }
];

const industries = [
  "Salons & beauty studios",
  "Barbershops",
  "Cleaning companies",
  "Plumbing services",
  "Electrical services",
  "AC repair & maintenance"
];

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [section, setSection] = useState<Section>("Overview");
  const [user, setUser] = useState<any>(null);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState("");
  const [bookings, setBookings] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [authReady, setAuthReady] = useState(false);

  const currentBusiness = businesses.find(b => b.id === activeBusiness);

  useEffect(() => {
    if (!supabase) {
      setAuthReady(true);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setAuthReady(true);
      if (data.session?.user) setScreen("dashboard");
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) setScreen("dashboard");
      else setScreen("home");
    });

    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !supabase) return;

    async function loadBusinesses() {
      const { data, error } = await supabase!
        .from("business_members")
        .select("business_id, businesses(id, name, slug)")
        .eq("user_id", user.id);

      if (error) {
        setMessage("Could not load your business workspaces: " + error.message);
        return;
      }

      const list = (data || [])
        .map((row: any) => row.businesses)
        .filter(Boolean) as Business[];

      setBusinesses(list);
      if (list.length && !activeBusiness) setActiveBusiness(list[0].id);
    }

    loadBusinesses();
  }, [user]);

  useEffect(() => {
    if (!activeBusiness || !supabase) {
      setBookings([]);
      return;
    }

    async function loadBookings() {
      const { data, error } = await supabase!
        .from("bookings")
        .select("*")
        .eq("business_id", activeBusiness)
        .order("appointment_date", { ascending: false })
        .limit(20);

      if (error) {
        setMessage("Bookings could not be loaded: " + error.message);
        return;
      }
      setBookings(data || []);
    }

    loadBookings();
  }, [activeBusiness]);

  function goTo(target: Screen) {
    setMessage("");
    setMenuOpen(false);
    setScreen(target);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submitAuth(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) {
      setMessage("Supabase is not configured yet. Add your project URL and publishable key.");
      return;
    }

    setBusy(true);
    setMessage("");

    try {
      if (screen === "register") {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;

        if (data.session) {
          setUser(data.user);
          setMessage("Account created. Create your business workspace next.");
          setScreen("dashboard");
        } else {
          setMessage("Registration received. Check your email to confirm your account, then log in.");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        setUser(data.user);
        setScreen("dashboard");
      }
    } catch (err: any) {
      setMessage(err.message || "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  async function createBusiness(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !businessName.trim()) return;

    setBusy(true);
    setMessage("");

    try {
      const slug = businessName.toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

      const { data, error } = await supabase.rpc("create_business_workspace", {
        business_name: businessName.trim(),
        business_slug: slug
      });

      if (error) throw error;

      const id = typeof data === "string" ? data : data?.business_id || data?.id;
      if (!id) throw new Error("Workspace function returned no business ID.");

      setBusinesses(previous => [...previous, { id, name: businessName.trim(), slug }]);
      setActiveBusiness(id);
      setBusinessName("");
      setMessage("Your business workspace has been created.");
    } catch (err: any) {
      setMessage(err.message || "Could not create your workspace.");
    } finally {
      setBusy(false);
    }
  }

  async function logout() {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) setMessage(error.message);
    else {
      setUser(null);
      setBusinesses([]);
      setActiveBusiness("");
      setScreen("home");
    }
  }

  if (!authReady) {
    return <div className="loading-screen"><div className="loading-brand">SERVORA</div><Loader2 className="spin" /><p>Loading your experience...</p></div>;
  }

  if (screen === "home") {
    return (
      <div className="public-site">
        <header className="site-header">
          <a className="site-brand" href="#home" onClick={e => { e.preventDefault(); goTo("home"); }}>
            <span className="site-brand-mark">S</span>
            <span>SERVORA<small>BUSINESS MANAGEMENT</small></span>
          </a>

          <nav className={`site-nav ${menuOpen ? "site-nav-open" : ""}`}>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#industries" onClick={() => setMenuOpen(false)}>Solutions</a>
            <a href="#how-it-works" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
          </nav>

          <div className="site-header-actions">
            <button className="site-login" onClick={() => goTo("login")}>Log in</button>
            <button className="gold-button" onClick={() => goTo("register")}>Get started <ArrowRight size={16}/></button>
          </div>

          <button className="site-menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            {menuOpen ? <X/> : <Menu/>}
          </button>
        </header>

        <main id="home">
          <section className="hero-section">
            <div className="hero-copy">
              <div className="hero-label"><Sparkles size={14}/> BUSINESS MANAGEMENT, REIMAGINED</div>
              <h1>Run your business.<br/><span>Not after it.</span></h1>
              <p className="hero-description">
                A smarter way to manage appointments, customers and services.
                Bring your daily business operations together in one organised workspace.
              </p>
              <div className="hero-actions">
                <button className="gold-button hero-cta" onClick={() => goTo("register")}>Start your workspace <ArrowRight size={17}/></button>
                <a className="secondary-cta" href="#features">Explore the platform <ArrowUpRight size={16}/></a>
              </div>
              <div className="hero-trust">
                <span><Check size={14}/> Organised appointments</span>
                <span><Check size={14}/> Business workspace</span>
                <span><Check size={14}/> Customer records</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="hero-glow"/>
              <div className="dashboard-preview">
                <div className="preview-topbar">
                  <div className="preview-brand"><span>S</span> SERVORA</div>
                  <span className="preview-live"><i/> WORKSPACE PREVIEW</span>
                </div>
                <div className="preview-welcome">
                  <div><small>BUSINESS OVERVIEW</small><h3>Your workspace</h3><p>Manage your day in one place.</p></div>
                  <div className="preview-avatar">B</div>
                </div>
                <div className="preview-stats">
                  <div><span>Appointments</span><strong>Manage</strong><CalendarDays/></div>
                  <div><span>Customers</span><strong>Organise</strong><Users/></div>
                  <div><span>Services</span><strong>Control</strong><BriefcaseBusiness/></div>
                </div>
                <div className="preview-calendar">
                  <div className="preview-calendar-heading"><strong>Appointment management</strong><span>Workspace tools</span></div>
                  <div className="preview-line"><i/><span>Booking overview</span><b>Organised</b></div>
                  <div className="preview-line"><i/><span>Customer records</span><b>Connected</b></div>
                  <div className="preview-line"><i/><span>Service catalogue</span><b>Manageable</b></div>
                </div>
                <div className="preview-footer"><ShieldCheck size={14}/> A dedicated workspace for your business</div>
              </div>
              <div className="floating-note"><span><CheckCircle2 size={16}/></span><div><b>One organised workspace</b><small>Bookings, services & customers</small></div></div>
            </div>
          </section>

          <section className="trust-strip">
            <p>BUILT FOR SERVICE-BASED BUSINESSES</p>
            <div>{industries.slice(0, 4).map(item => <span key={item}>{item}</span>)}</div>
          </section>

          <section className="site-section features-section" id="features">
            <div className="section-heading">
              <div className="hero-label">THE SERVORA PLATFORM</div>
              <h2>Everything your operations need.<br/><span>Nothing you don't.</span></h2>
              <p>Tools that help service businesses stay organised, serve customers and manage their day.</p>
            </div>
            <div className="feature-grid">
              {features.map(({ icon: Icon, title, description }) => (
                <article className="feature-card" key={title}>
                  <div className="feature-icon"><Icon size={22}/></div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <span className="feature-arrow"><ArrowUpRight size={17}/></span>
                </article>
              ))}
            </div>
          </section>

          <section className="site-section industries-section" id="industries">
            <div className="industry-copy">
              <div className="hero-label">MADE FOR YOUR INDUSTRY</div>
              <h2>Different businesses.<br/><span>One organised platform.</span></h2>
              <p>Whether you manage a salon, a cleaning team or a repair service, SERVORA gives your business its own workspace.</p>
              <button className="gold-button" onClick={() => goTo("register")}>Create your workspace <ArrowRight size={16}/></button>
            </div>
            <div className="industry-list">
              {industries.map((industry, index) => (
                <div className="industry-item" key={industry}>
                  <span>0{index + 1}</span><strong>{industry}</strong><ArrowUpRight size={17}/>
                </div>
              ))}
            </div>
          </section>

          <section className="site-section process-section" id="how-it-works">
            <div className="section-heading">
              <div className="hero-label">GET STARTED</div>
              <h2>A clearer way to run your day.</h2>
              <p>Start with your business workspace and build from there.</p>
            </div>
            <div className="process-grid">
              <article><span>01</span><h3>Create an account</h3><p>Register securely with your email and create your owner account.</p></article>
              <article><span>02</span><h3>Set up your business</h3><p>Create a workspace for your business and configure its services.</p></article>
              <article><span>03</span><h3>Manage your operations</h3><p>Use your dashboard to organise bookings, customers and services.</p></article>
            </div>
          </section>

          <section className="pricing-section site-section" id="pricing">
            <div className="section-heading">
              <div className="hero-label">SIMPLE SUBSCRIPTIONS</div>
              <h2>Choose how you grow.</h2>
              <p>Monthly and yearly subscription options are planned for SERVORA.</p>
            </div>
            <div className="pricing-card">
              <div className="pricing-card-icon"><CreditCard size={23}/></div>
              <h3>Flexible business plans</h3>
              <p>Plan features and final subscription prices will be published when billing is configured.</p>
              <button className="gold-button" onClick={() => goTo("register")}>Create an account <ArrowRight size={16}/></button>
              <small>No payment is taken on this page.</small>
            </div>
          </section>

          <section className="final-cta site-section" id="contact">
            <div className="hero-label">YOUR NEXT CHAPTER STARTS HERE</div>
            <h2>Give your business<br/>a better way to work.</h2>
            <p>Create your SERVORA account and set up your business workspace.</p>
            <button className="gold-button" onClick={() => goTo("register")}>Get started with SERVORA <ArrowRight size={17}/></button>
          </section>
        </main>

        <footer className="site-footer">
          <a className="site-brand" href="#home"><span className="site-brand-mark">S</span><span>SERVORA<small>BUSINESS MANAGEMENT</small></span></a>
          <p>Business management made simpler.</p>
          <div><a href="#features">Features</a><a href="#industries">Solutions</a><a href="#pricing">Pricing</a><a href="mailto:support@servora.com">Contact</a></div>
          <small>© {new Date().getFullYear()} SERVORA. All rights reserved.</small>
        </footer>
      </div>
    );
  }

  if (screen === "login" || screen === "register") {
    const registering = screen === "register";
    return (
      <div className="auth-page">
        <button className="auth-back" onClick={() => goTo("home")}>← Back to SERVORA</button>
        <div className="auth-card">
          <div className="site-brand auth-brand"><span className="site-brand-mark">S</span><span>SERVORA<small>BUSINESS MANAGEMENT</small></span></div>
          <div className="hero-label">{registering ? "START YOUR JOURNEY" : "WELCOME BACK"}</div>
          <h1>{registering ? "Create your account." : "Welcome back."}</h1>
          <p>{registering ? "Set up your owner account to create a business workspace." : "Log in to continue to your business workspace."}</p>

          {message && <div className="auth-message">{message}</div>}

          <form onSubmit={submitAuth} className="auth-form">
            <label>Email address</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com"/>
            <label>Password</label>
            <input type="password" required minLength={6} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters"/>
            <button className="gold-button auth-submit" disabled={busy}>
              {busy ? <Loader2 className="spin" size={17}/> : registering ? "Create account" : "Log in"}
              {!busy && <ArrowRight size={16}/>}
            </button>
          </form>

          <div className="auth-switch">
            {registering ? "Already have an account?" : "New to SERVORA?"}
            <button onClick={() => { setMessage(""); setScreen(registering ? "login" : "register"); }}>
              {registering ? "Log in" : "Create an account"}
            </button>
          </div>
          <small className="auth-security"><ShieldCheck size={14}/> Your account is protected by Supabase authentication.</small>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${menuOpen ? "dashboard-sidebar-open" : ""}`}>
        <div className="site-brand"><span className="site-brand-mark">S</span><span>SERVORA<small>BUSINESS MANAGEMENT</small></span></div>
        <div className="dashboard-label">YOUR WORKSPACE</div>
        <select value={activeBusiness} onChange={e => setActiveBusiness(e.target.value)}>
          {businesses.map(b => <option value={b.id} key={b.id}>{b.name}</option>)}
        </select>
        <div className="dashboard-label">MENU</div>
        {(["Overview", "Bookings", "Services", "Customers", "Billing", "Settings"] as Section[]).map(item => (
          <button key={item} className={`dashboard-nav-item ${section === item ? "selected" : ""}`} onClick={() => { setSection(item); setMenuOpen(false); }}>
            {item === "Overview" ? <LayoutDashboard/> : item === "Bookings" ? <CalendarDays/> : item === "Services" ? <BriefcaseBusiness/> : item === "Customers" ? <Users/> : item === "Billing" ? <CreditCard/> : <Settings/>}
            {item}
          </button>
        ))}
        <button className="dashboard-logout" onClick={logout}><LogOut/> Sign out</button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button className="site-menu-button" onClick={() => setMenuOpen(!menuOpen)}><Menu/></button>
          <span>{currentBusiness?.name || "Your business"}</span>
          <span className="dashboard-user">{user?.email}</span>
        </header>

        <div className="dashboard-content">
          {message && <div className="auth-message">{message}</div>}

          {!currentBusiness ? (
            <div className="workspace-setup">
              <div className="feature-icon"><BriefcaseBusiness size={25}/></div>
              <div className="hero-label">YOUR BUSINESS WORKSPACE</div>
              <h1>Create your business workspace.</h1>
              <p>Tell us your business name to create a dedicated workspace. You can configure services and settings afterwards.</p>
              <form onSubmit={createBusiness}>
                <label>Business name</label>
                <input value={businessName} onChange={e => setBusinessName(e.target.value)} required placeholder="e.g. Bright Cleaning Services"/>
                <button className="gold-button" disabled={busy}>{busy ? "Creating..." : "Create workspace"} <ArrowRight size={16}/></button>
              </form>
              <small>If this fails, the database workspace function still needs to be installed.</small>
            </div>
          ) : (
            <>
              <div className="dashboard-heading">
                <div><div className="hero-label">BUSINESS WORKSPACE</div><h1>{section}</h1><p>Manage {currentBusiness.name} with SERVORA.</p></div>
              </div>
              {section === "Overview" && (
                <>
                  <div className="dashboard-stats">
                    <div><span>Bookings loaded</span><strong>{bookings.length}</strong><small>Latest 20 records</small></div>
                    <div><span>Pending</span><strong>{bookings.filter(b => b.status === "pending").length}</strong><small>Awaiting action</small></div>
                    <div><span>Confirmed</span><strong>{bookings.filter(b => b.status === "confirmed").length}</strong><small>Confirmed bookings</small></div>
                    <div><span>Completed</span><strong>{bookings.filter(b => b.status === "completed").length}</strong><small>Completed bookings</small></div>
                  </div>
                  <DashboardPanel title="Recent bookings">
                    {bookings.length ? <div className="table-wrapper"><table className="data-table"><thead><tr><th>Appointment</th><th>Status</th><th>Payment</th></tr></thead><tbody>{bookings.map(b => <tr key={b.id}><td>{b.appointment_date ? new Date(b.appointment_date).toLocaleString() : "Date not set"}</td><td>{b.status || "Pending"}</td><td>{b.payment_status || "Unpaid"}</td></tr>)}</tbody></table></div> : <p>No booking records have been created yet.</p>}
                  </DashboardPanel>
                </>
              )}
              {section !== "Overview" && (
                <DashboardPanel title={section}>
                  <p>{section === "Bookings" ? "Your business appointment records will appear here." : section === "Services" ? "Create and manage the services your business offers." : section === "Customers" ? "Your customer records will appear here." : section === "Billing" ? "Monthly and yearly subscription billing will appear here when payment processing is connected." : "Business profile and workspace settings."}</p>
                  <p>Connect the corresponding database features to enable management in this section.</p>
                </DashboardPanel>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function DashboardPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return <section className="dashboard-panel"><h2>{title}</h2>{children}</section>;
}
