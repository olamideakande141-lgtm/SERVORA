import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2,
  ChevronDown, ChevronRight, Clock3, CreditCard, LayoutDashboard,
  LogOut, Menu, Plus, Search, Settings, ShieldCheck, Sparkles,
  Users, BriefcaseBusiness, Wrench, Scissors, Car, Zap, X,
  Loader2, Save, Pencil, Trash2, RefreshCw, Mail, Phone,
  BarChart3, CalendarCheck, CircleHelp, Star, Building2
} from "lucide-react";
import { supabase } from "./lib/supabase";

type Page =
  | "overview"
  | "bookings"
  | "services"
  | "customers"
  | "billing"
  | "settings";

type Business = {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  description?: string;
  category?: string;
};

type Service = {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration_minutes: number;
  is_active: boolean;
};

type Booking = {
  id: string;
  business_id: string;
  customer_id?: string;
  service_id?: string;
  appointment_date: string;
  status: string;
  payment_status?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  service_name?: string;
};

const money = (value: number) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0
  }).format(Number(value || 0));

function Brand() {
  return (
    <a href="#home" className="brand">
      <span className="brand-mark">S</span>
      <span className="brand-name">
        SERVORA
        <small>BUSINESS MANAGEMENT</small>
      </span>
    </a>
  );
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><span />{children}</div>;
}

function PublicSite({
  onLogin,
  onRegister
}: {
  onLogin: () => void;
  onRegister: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const closeMenu = () => setMenuOpen(false);

  const features = [
    {
      icon: <CalendarDays />,
      title: "Appointment Management",
      text: "Keep bookings organised, review upcoming appointments and manage changes from one workspace."
    },
    {
      icon: <BriefcaseBusiness />,
      title: "Service Management",
      text: "Create and organise your services, descriptions, prices and estimated service durations."
    },
    {
      icon: <Users />,
      title: "Customer Records",
      text: "Keep customer and appointment information together so your team can stay organised."
    },
    {
      icon: <BarChart3 />,
      title: "Business Overview",
      text: "See useful booking and service information in a central dashboard."
    },
    {
      icon: <Settings />,
      title: "Business Settings",
      text: "Manage your workspace details and configure your business information."
    },
    {
      icon: <ShieldCheck />,
      title: "Account Access",
      text: "Sign in to your workspace and keep business management separate from the public website."
    }
  ];

  const industries = [
    ["01", "Cleaning services", "Manage residential and commercial cleaning appointments."],
    ["02", "Salons and barbers", "Organise customer visits and service schedules."],
    ["03", "Plumbing and electrical", "Keep track of customer requests and scheduled jobs."],
    ["04", "Vehicle maintenance", "Organise repair appointments and service records."],
    ["05", "AC and appliance repair", "Manage service visits and customer details."],
    ["06", "General maintenance", "Bring everyday service operations into one workspace."]
  ];

  const faqs = [
    [
      "What is SERVORA?",
      "SERVORA is a business management platform designed to help service businesses organise appointments, services and customer records."
    ],
    [
      "Which businesses can use SERVORA?",
      "It is designed for appointment-based businesses such as cleaning companies, salons, barbers, mechanics, plumbers, electricians and maintenance providers."
    ],
    [
      "Can I manage my services?",
      "The workspace includes service management features for creating and maintaining service information, pricing and duration."
    ],
    [
      "Does SERVORA process online payments?",
      "Payment processing is not currently connected. Do not treat the billing screen as an active payment gateway until a payment provider has been integrated and tested."
    ],
    [
      "Can I access SERVORA on my phone?",
      "The interface is designed to adapt to mobile phones, tablets and desktop screens."
    ],
    [
      "How do I get started?",
      "Create an account, sign in and create a business workspace to begin setting up your business."
    ]
  ];

  return (
    <div className="marketing-site" id="home">
      <header className="site-header">
        <div className="site-header-inner">
          <Brand />

          <nav className={`site-nav ${menuOpen ? "site-nav-open" : ""}`}>
            <a href="#features" onClick={closeMenu}>Features</a>
            <a href="#industries" onClick={closeMenu}>Industries</a>
            <a href="#how-it-works" onClick={closeMenu}>How it works</a>
            <a href="#pricing" onClick={closeMenu}>Plans</a>
            <a href="#faq" onClick={closeMenu}>FAQ</a>
            <button className="nav-login" onClick={() => { closeMenu(); onLogin(); }}>
              Log in
            </button>
            <button className="gold-button nav-cta" onClick={() => { closeMenu(); onRegister(); }}>
              Get started <ArrowRight size={14} />
            </button>
          </nav>

          <button
            className="mobile-nav-toggle"
            aria-label="Toggle navigation"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <Eyebrow>BUSINESS MANAGEMENT, REIMAGINED</Eyebrow>
              <h1>
                Run your business.
                <br />
                <em>Without the chaos.</em>
              </h1>
              <p className="hero-description">
                Bring appointments, services and customer records together
                with one organised workspace built for service businesses.
              </p>

              <div className="hero-actions">
                <button className="gold-button large-button" onClick={onRegister}>
                  Create your workspace <ArrowRight size={15} />
                </button>
                <a className="text-link" href="#features">
                  Explore the platform <ArrowUpRight size={15} />
                </a>
              </div>

              <div className="hero-trust">
                <span><CheckCircle2 size={13} /> Appointment organisation</span>
                <span><CheckCircle2 size={13} /> Customer records</span>
                <span><CheckCircle2 size={13} /> Business workspace</span>
              </div>
            </div>

            <div className="hero-visual">
              <div className="visual-glow" />
              <div className="dashboard-preview">
                <div className="preview-top">
                  <Brand />
                  <span className="preview-live">● WORKSPACE PREVIEW</span>
                </div>

                <div className="preview-welcome">
                  <div>
                    <small>BUSINESS OVERVIEW</small>
                    <h3>Welcome back</h3>
                  </div>
                  <div className="preview-avatar">S</div>
                </div>

                <div className="preview-stats">
                  <div>
                    <CalendarDays />
                    <small>Appointments</small>
                    <strong>Manage bookings</strong>
                  </div>
                  <div>
                    <BriefcaseBusiness />
                    <small>Services</small>
                    <strong>Organise services</strong>
                  </div>
                  <div>
                    <Users />
                    <small>Customers</small>
                    <strong>Customer records</strong>
                  </div>
                </div>

                <div className="preview-bookings">
                  <div className="preview-booking-heading">
                    <strong>Appointment workflow</strong>
                    <span>Workspace preview</span>
                  </div>
                  <div className="preview-booking-row">
                    <i className="preview-dot gold-dot" />
                    <div><b>New appointment</b><small>Review booking details</small></div>
                    <span className="preview-status">Pending</span>
                  </div>
                  <div className="preview-booking-row">
                    <i className="preview-dot green-dot" />
                    <div><b>Confirmed booking</b><small>Appointment scheduled</small></div>
                    <span className="preview-status confirmed">Confirmed</span>
                  </div>
                  <div className="preview-booking-row">
                    <i className="preview-dot grey-dot" />
                    <div><b>Completed service</b><small>Update appointment status</small></div>
                    <span className="preview-status">Completed</span>
                  </div>
                </div>

                <div className="preview-footer">
                  <ShieldCheck size={12} /> ONE WORKSPACE FOR YOUR BUSINESS
                </div>
              </div>

              <div className="floating-note">
                <span><Check size={16} /></span>
                <div>
                  <b>Stay organised</b>
                  <small>Manage business activity in one place</small>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-bottom-line">
            <span>BUILT FOR SERVICE-BASED BUSINESSES</span>
            <span>BOOKINGS · SERVICES · CUSTOMERS · WORKSPACE</span>
          </div>
        </section>

        <section className="intro-strip">
          <div>
            <span className="strip-number">01</span>
            <strong>One organised workspace</strong>
            <p>Keep important business information together.</p>
          </div>
          <div>
            <span className="strip-number">02</span>
            <strong>Clear daily operations</strong>
            <p>Review appointments and manage services.</p>
          </div>
          <div>
            <span className="strip-number">03</span>
            <strong>Designed to grow</strong>
            <p>Build a more organised way to manage your work.</p>
          </div>
        </section>

        <section className="section-block" id="features">
          <div className="section-heading">
            <Eyebrow>THE SERVORA WORKSPACE</Eyebrow>
            <h2>Everything organised. <em>One place.</em></h2>
            <p>
              Essential tools to help service businesses manage their daily
              operations with greater clarity.
            </p>
          </div>

          <div className="feature-grid">
            {features.map((feature, index) => (
              <article className="feature-card" key={feature.title}>
                <div className="feature-icon">{feature.icon}</div>
                <span className="feature-index">0{index + 1}</span>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="industries-section" id="industries">
          <div className="industries-inner">
            <div className="section-heading left-heading">
              <Eyebrow>MADE FOR SERVICE BUSINESSES</Eyebrow>
              <h2>Different businesses. <em>One organised system.</em></h2>
              <p>
                Whether you manage appointments, repairs or scheduled
                services, SERVORA gives your business a central workspace.
              </p>
              <button className="gold-button" onClick={onRegister}>
                Start with SERVORA <ArrowRight size={14} />
              </button>
            </div>

            <div className="industry-list">
              {industries.map(([number, title, description]) => (
                <div className="industry-item" key={number}>
                  <span>{number}</span>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                  <ChevronRight size={17} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="section-block" id="how-it-works">
          <div className="section-heading">
            <Eyebrow>GET STARTED</Eyebrow>
            <h2>A clearer way to <em>manage your work.</em></h2>
            <p>Set up your workspace and start organising your business.</p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <span>01</span>
              <Building2 />
              <h3>Create an account</h3>
              <p>Register with your email and sign in to your SERVORA account.</p>
            </article>
            <article className="step-card">
              <span>02</span>
              <BriefcaseBusiness />
              <h3>Set up your business</h3>
              <p>Create a workspace and add your business information.</p>
            </article>
            <article className="step-card">
              <span>03</span>
              <CalendarCheck />
              <h3>Manage your operations</h3>
              <p>Add services, review bookings and organise customer records.</p>
            </article>
          </div>
        </section>

        <section className="pricing-section" id="pricing">
          <div className="section-heading">
            <Eyebrow>PLATFORM ACCESS</Eyebrow>
            <h2>Choose how to <em>get started.</em></h2>
            <p>
              Explore the platform and review the available workspace
              features before choosing a commercial subscription.
            </p>
          </div>

          <div className="pricing-notice">
            <ShieldCheck size={19} />
            <div>
              <strong>Subscription payments are not yet connected.</strong>
              <p>
                The plans below are presentation placeholders. No payment
                will be collected through this page until a payment provider
                and subscription system are integrated.
              </p>
            </div>
          </div>

          <div className="pricing-grid">
            {[
              {
                name: "Starter",
                description: "For a small service business getting organised.",
                features: ["Business workspace", "Service management", "Booking overview", "Customer records"]
              },
              {
                name: "Professional",
                description: "For businesses managing more daily activity.",
                features: ["Starter features", "Expanded business tools", "Operational overview", "Workspace settings"],
                featured: true
              },
              {
                name: "Business",
                description: "For growing service operations.",
                features: ["Professional features", "Business management tools", "Team-ready structure", "Business support options"]
              }
            ].map(plan => (
              <article
                className={`price-card ${plan.featured ? "price-card-featured" : ""}`}
                key={plan.name}
              >
                {plan.featured && <span className="popular-tag">FEATURED PLAN</span>}
                <div className="price-plan">{plan.name}</div>
                <p>{plan.description}</p>
                <div className="price-amount">Contact for pricing</div>
                <div className="price-cycle">Subscription details to be announced</div>
                <button
                  className={plan.featured ? "gold-button price-cta" : "outline-button price-cta"}
                  onClick={onRegister}
                >
                  Create an account <ArrowRight size={13} />
                </button>
                <div className="price-divider" />
                {plan.features.map(item => (
                  <div className="price-feature" key={item}>
                    <Check size={13} /> {item}
                  </div>
                ))}
              </article>
            ))}
          </div>
        </section>

        <section className="buyer-section">
          <div className="buyer-panel">
            <div className="buyer-decoration"><Sparkles size={190} /></div>
            <Eyebrow>YOUR BUSINESS, MORE ORGANISED</Eyebrow>
            <h2>Make room for <em>better work.</em></h2>
            <p>
              Start building a more organised way to manage appointments,
              services and customer information.
            </p>
            <button className="gold-button" onClick={onRegister}>
              Create your workspace <ArrowRight size={14} />
            </button>
          </div>
        </section>

        <section className="section-block" id="faq">
          <div className="faq-layout">
            <div className="section-heading left-heading">
              <Eyebrow>NEED TO KNOW</Eyebrow>
              <h2>Frequently asked <em>questions.</em></h2>
              <p>Find answers to common questions about the SERVORA platform.</p>
            </div>
            <div className="faq-list">
              {faqs.map(([question, answer], index) => (
                <div className={`faq-item ${openFaq === index ? "faq-active" : ""}`} key={question}>
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)}>
                    {question}
                    <ChevronDown size={17} />
                  </button>
                  {openFaq === index && <p>{answer}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section" id="contact">
          <div>
            <Eyebrow>TAKE THE NEXT STEP</Eyebrow>
            <h2>Bring your business into <em>focus.</em></h2>
          </div>
          <div>
            <p>
              Create a SERVORA account and set up your business workspace.
              You can manage your services and booking information from there.
            </p>
            <button className="gold-button" onClick={onRegister}>
              Get started <ArrowRight size={14} />
            </button>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <div className="footer-main">
          <div>
            <Brand />
            <p>
              A business management and appointment organisation platform
              for service businesses.
            </p>
          </div>
          <div className="footer-links">
            <strong>PLATFORM</strong>
            <a href="#features">Features</a>
            <a href="#industries">Industries</a>
            <a href="#pricing">Plans</a>
          </div>
          <div className="footer-links">
            <strong>COMPANY</strong>
            <a href="#how-it-works">How it works</a>
            <a href="#faq">FAQ</a>
            <a href="#contact">Contact</a>
          </div>
          <div className="footer-links">
            <strong>ACCOUNT</strong>
            <button onClick={onLogin}>Log in</button>
            <button onClick={onRegister}>Create account</button>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} SERVORA. All rights reserved.</span>
          <span>Business management platform</span>
        </div>
      </footer>
    </div>
  );
}

function AuthPage({
  mode,
  setMode,
  onBack,
  onSuccess
}: {
  mode: "login" | "register";
  setMode: (mode: "login" | "register") => void;
  onBack: () => void;
  onSuccess: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      if (!supabase) throw new Error("Supabase is not configured. Add your project URL and publishable key.");

      if (mode === "register") {
        const { data, error: authError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: { full_name: fullName.trim() }
          }
        });

        if (authError) throw authError;

        if (data.session) {
          onSuccess();
        } else {
          setMessage("Your account was created. Check your email for a confirmation link, then log in.");
        }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password
        });

        if (authError) throw authError;
        onSuccess();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <button className="auth-back" onClick={onBack}>← Back to website</button>

      <div className="auth-card">
        <Brand />
        <Eyebrow>{mode === "login" ? "WELCOME BACK" : "GET STARTED WITH SERVORA"}</Eyebrow>
        <h1>{mode === "login" ? "Sign in to your account" : "Create your account"}</h1>
        <p>
          {mode === "login"
            ? "Access your business workspace and manage your operations."
            : "Create an account to set up your business workspace."}
        </p>

        {error && <div className="notice notice-error">{error}</div>}
        {message && <div className="notice">{message}</div>}

        <form onSubmit={submit}>
          {mode === "register" && (
            <>
              <label className="field-label">Full name</label>
              <input
                className="auth-input"
                value={fullName}
                onChange={event => setFullName(event.target.value)}
                placeholder="Your full name"
                required
                autoComplete="name"
              />
            </>
          )}

          <label className="field-label">Email address</label>
          <input
            className="auth-input"
            type="email"
            value={email}
            onChange={event => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            autoComplete="email"
          />

          <label className="field-label">Password</label>
          <input
            className="auth-input"
            type="password"
            value={password}
            onChange={event => setPassword(event.target.value)}
            placeholder="Enter your password"
            required
            minLength={6}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />

          <button className="gold-button auth-submit" type="submit" disabled={loading}>
            {loading ? <Loader2 className="spin" size={16} /> : null}
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Create account"}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <button
          className="auth-switch"
          onClick={() => {
            setError("");
            setMessage("");
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login" ? "Don't have an account? Create one" : "Already have an account? Sign in"}
        </button>

        <button className="back-home" onClick={onBack}>Return to SERVORA website</button>
        <div className="auth-security"><ShieldCheck size={13} /> Account authentication powered by Supabase</div>
      </div>
    </div>
  );
}

function Dashboard({
  userEmail,
  onLogout
}: {
  userEmail: string;
  onLogout: () => void;
}) {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [page, setPage] = useState<Page>("overview");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");

  const [businessName, setBusinessName] = useState("");
  const [businessSlug, setBusinessSlug] = useState("");

  const [serviceName, setServiceName] = useState("");
  const [serviceDescription, setServiceDescription] = useState("");
  const [servicePrice, setServicePrice] = useState("");
  const [serviceDuration, setServiceDuration] = useState("60");
  const [editingService, setEditingService] = useState<string | null>(null);

  const [settingsName, setSettingsName] = useState("");
  const [settingsDescription, setSettingsDescription] = useState("");
  const [settingsCategory, setSettingsCategory] = useState("");

  const navItems: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: "overview", label: "Overview", icon: <LayoutDashboard /> },
    { id: "bookings", label: "Bookings", icon: <CalendarDays /> },
    { id: "services", label: "Services", icon: <BriefcaseBusiness /> },
    { id: "customers", label: "Customers", icon: <Users /> },
    { id: "billing", label: "Billing", icon: <CreditCard /> },
    { id: "settings", label: "Settings", icon: <Settings /> }
  ];

  async function loadBusinesses() {
    if (!supabase) throw new Error("Supabase is not configured.");

    const { data: authData } = await supabase.auth.getUser();
    const user = authData.user;
    if (!user) throw new Error("Your session has expired. Please sign in again.");

    const { data: owned, error: ownedError } = await supabase
      .from("businesses")
      .select("*")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false });

    if (ownedError) throw ownedError;

    let allBusinesses = (owned || []) as Business[];

    const { data: memberships, error: memberError } = await supabase
      .from("business_members")
      .select("business_id")
      .eq("user_id", user.id);

    if (!memberError && memberships?.length) {
      const ids = memberships.map(item => item.business_id);
      const { data: memberBusinesses } = await supabase
        .from("businesses")
        .select("*")
        .in("id", ids);

      if (memberBusinesses) {
        const existing = new Set(allBusinesses.map(item => item.id));
        allBusinesses = [
          ...allBusinesses,
          ...(memberBusinesses as Business[]).filter(item => !existing.has(item.id))
        ];
      }
    }

    setBusinesses(allBusinesses);
    if (allBusinesses.length) {
      setBusiness(current =>
        current && allBusinesses.some(item => item.id === current.id)
          ? current
          : allBusinesses[0]
      );
    } else {
      setBusiness(null);
    }
  }

  async function loadWorkspace(businessId: string) {
    if (!supabase) return;

    const [serviceResult, bookingResult] = await Promise.all([
      supabase.from("services").select("*").eq("business_id", businessId).order("name"),
      supabase.from("bookings").select("*").eq("business_id", businessId).order("appointment_date", { ascending: false })
    ]);

    if (serviceResult.error) throw serviceResult.error;
    if (bookingResult.error) throw bookingResult.error;

    setServices((serviceResult.data || []) as Service[]);
    setBookings((bookingResult.data || []) as Booking[]);
  }

  async function refresh() {
    setLoading(true);
    setError("");
    try {
      await loadBusinesses();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load your workspace.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  useEffect(() => {
    if (!business) {
      setServices([]);
      setBookings([]);
      return;
    }

    setSettingsName(business.name || "");
    setSettingsDescription(business.description || "");
    setSettingsCategory(business.category || "");

    loadWorkspace(business.id).catch(err => {
      setError(err instanceof Error ? err.message : "Unable to load workspace data.");
    });
  }, [business?.id]);

  async function createWorkspace(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase) return;

    setSaving(true);
    setError("");
    setNotice("");

    const slug = businessSlug.trim().toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    try {
      const { data, error: rpcError } = await supabase.rpc("create_business_workspace", {
        business_name: businessName.trim(),
        business_slug: slug
      });

      if (rpcError) throw rpcError;

      await loadBusinesses();

      if (data && typeof data === "string") {
        const { data: created } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", data)
          .maybeSingle();

        if (created) setBusiness(created as Business);
      }

      setBusinessName("");
      setBusinessSlug("");
      setNotice("Your workspace has been created.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Workspace creation failed. Check that the create_business_workspace database function exists."
      );
    } finally {
      setSaving(false);
    }
  }

  async function saveService(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !business) return;

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      business_id: business.id,
      name: serviceName.trim(),
      description: serviceDescription.trim(),
      price: Number(servicePrice),
      duration_minutes: Number(serviceDuration),
      is_active: true
    };

    try {
      if (editingService) {
        const { error: updateError } = await supabase
          .from("services")
          .update(payload)
          .eq("id", editingService)
          .eq("business_id", business.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from("services")
          .insert(payload);
        if (insertError) throw insertError;
      }

      await loadWorkspace(business.id);
      resetServiceForm();
      setNotice("Service saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save service.");
    } finally {
      setSaving(false);
    }
  }

  function resetServiceForm() {
    setServiceName("");
    setServiceDescription("");
    setServicePrice("");
    setServiceDuration("60");
    setEditingService(null);
  }

  function editService(service: Service) {
    setServiceName(service.name);
    setServiceDescription(service.description || "");
    setServicePrice(String(service.price));
    setServiceDuration(String(service.duration_minutes));
    setEditingService(service.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function deleteService(id: string) {
    if (!supabase || !business) return;
    if (!window.confirm("Delete this service?")) return;

    setError("");
    setNotice("");

    const { error: deleteError } = await supabase
      .from("services")
      .delete()
      .eq("id", id)
      .eq("business_id", business.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    await loadWorkspace(business.id);
    setNotice("Service deleted.");
  }

  async function updateBookingStatus(id: string, status: string) {
    if (!supabase || !business) return;

    const { error: updateError } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id)
      .eq("business_id", business.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    await loadWorkspace(business.id);
    setNotice("Booking status updated.");
  }

  async function saveSettings(event: React.FormEvent) {
    event.preventDefault();
    if (!supabase || !business) return;

    setSaving(true);
    setError("");
    setNotice("");

    try {
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          name: settingsName.trim(),
          description: settingsDescription.trim(),
          category: settingsCategory.trim()
        })
        .eq("id", business.id);

      if (updateError) throw updateError;

      const updated = {
        ...business,
        name: settingsName.trim(),
        description: settingsDescription.trim(),
        category: settingsCategory.trim()
      };

      setBusiness(updated);
      setBusinesses(current =>
        current.map(item => item.id === updated.id ? updated : item)
      );
      setNotice("Business settings saved.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const customerCount = useMemo(() => {
    const ids = new Set(bookings.map(item => item.customer_id).filter(Boolean));
    return ids.size || new Set(bookings.map(item => item.customer_email).filter(Boolean)).size;
  }, [bookings]);

  const filteredBookings = useMemo(() => {
    const term = search.toLowerCase();
    return bookings.filter(item =>
      (item.customer_name || "").toLowerCase().includes(term) ||
      (item.customer_email || "").toLowerCase().includes(term) ||
      (item.status || "").toLowerCase().includes(term)
    );
  }, [bookings, search]);

  const customers = useMemo(() => {
    const seen = new Map<string, Booking>();
    bookings.forEach(item => {
      const key = item.customer_id || item.customer_email || item.customer_phone || item.id;
      if (!seen.has(key)) seen.set(key, item);
    });
    return Array.from(seen.values());
  }, [bookings]);

  const pendingBookings = bookings.filter(item => item.status === "pending").length;
  const confirmedBookings = bookings.filter(item => item.status === "confirmed").length;

  const pageTitle = navItems.find(item => item.id === page)?.label || "Overview";

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-brand">SERVORA</div>
        <Loader2 className="spin" size={24} />
        <p>Preparing your workspace...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      <aside className={`dashboard-sidebar ${sidebarOpen ? "dashboard-sidebar-open" : ""}`}>
        <Brand />

        <div className="dashboard-label">YOUR WORKSPACE</div>

        {businesses.length > 0 && (
          <select
            className="workspace-select"
            value={business?.id || ""}
            onChange={event => {
              const selected = businesses.find(item => item.id === event.target.value);
              if (selected) setBusiness(selected);
            }}
          >
            {businesses.map(item => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        )}

        <button
          className="workspace-create"
          onClick={() => {
            setBusiness(null);
            setPage("overview");
            setSidebarOpen(false);
          }}
        >
          <Plus size={14} /> Create workspace
        </button>

        <div className="dashboard-label">MANAGEMENT</div>

        {navItems.map(item => (
          <button
            key={item.id}
            className={`dashboard-nav-item ${page === item.id ? "selected" : ""}`}
            onClick={() => {
              setPage(item.id);
              setSidebarOpen(false);
              setError("");
              setNotice("");
            }}
          >
            {item.icon}
            {item.label}
          </button>
        ))}

        <button className="dashboard-logout" onClick={onLogout}>
          <LogOut size={17} /> Sign out
        </button>
      </aside>

      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <button
            className="site-menu-button"
            aria-label="Open dashboard menu"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu size={21} />
          </button>
          <strong>{pageTitle}</strong>
          <span className="dashboard-user">{userEmail}</span>
        </header>

        <div className="dashboard-content">
          {error && <div className="notice notice-error">{error}</div>}
          {notice && <div className="notice">{notice}</div>}

          {!business ? (
            <section className="workspace-setup">
              <Eyebrow>YOUR BUSINESS STARTS HERE</Eyebrow>
              <h1>Create your business workspace</h1>
              <p>
                Add your business name and a unique workspace address.
                You can manage your services and bookings after setup.
              </p>

              <form onSubmit={createWorkspace}>
                <label className="field-label">Business name</label>
                <input
                  className="auth-input"
                  value={businessName}
                  onChange={event => setBusinessName(event.target.value)}
                  placeholder="Example: Lateef Auto Services"
                  required
                />

                <label className="field-label">Workspace address</label>
                <input
                  className="auth-input"
                  value={businessSlug}
                  onChange={event => setBusinessSlug(event.target.value)}
                  placeholder="lateef-auto-services"
                  required
                />

                <button className="gold-button" type="submit" disabled={saving}>
                  {saving ? <Loader2 className="spin" size={15} /> : <Plus size={15} />}
                  {saving ? "Creating..." : "Create workspace"}
                </button>
              </form>

              <small>
                Workspace creation requires the `create_business_workspace`
                database function and the appropriate Supabase permissions.
              </small>
            </section>
          ) : (
            <>
              <div className="dashboard-heading">
                <div>
                  <Eyebrow>BUSINESS WORKSPACE</Eyebrow>
                  <h1>
                    {page === "overview" ? "Business overview" : pageTitle}
                  </h1>
                  <p>
                    {business.name} · Manage your business activity from here.
                  </p>
                </div>
                <button className="outline-button" onClick={() => loadWorkspace(business.id)}>
                  <RefreshCw size={14} /> Refresh
                </button>
              </div>

              {page === "overview" && (
                <>
                  <div className="dashboard-stats">
                    <div>
                      <span>Total bookings</span>
                      <strong>{bookings.length}</strong>
                      <small>Bookings recorded in this workspace</small>
                    </div>
                    <div>
                      <span>Pending bookings</span>
                      <strong>{pendingBookings}</strong>
                      <small>Awaiting review</small>
                    </div>
                    <div>
                      <span>Confirmed bookings</span>
                      <strong>{confirmedBookings}</strong>
                      <small>Marked as confirmed</small>
                    </div>
                    <div>
                      <span>Customers</span>
                      <strong>{customerCount}</strong>
                      <small>Based on available booking records</small>
                    </div>
                  </div>

                  <section className="dashboard-panel">
                    <div className="panel-heading">
                      <h2>Recent bookings</h2>
                      <button className="outline-button" onClick={() => setPage("bookings")}>
                        View all <ArrowRight size={13} />
                      </button>
                    </div>

                    {bookings.length === 0 ? (
                      <p>No bookings have been recorded for this workspace yet.</p>
                    ) : bookings.slice(0, 6).map(item => (
                      <div className="data-row" key={item.id}>
                        <CalendarDays size={17} />
                        <div className="data-row-main">
                          <strong>{item.customer_name || item.customer_email || "Customer booking"}</strong>
                          <p>{new Date(item.appointment_date).toLocaleString()}</p>
                        </div>
                        <span>{item.status}</span>
                      </div>
                    ))}
                  </section>

                  <section className="dashboard-panel">
                    <div className="panel-heading">
                      <h2>Services</h2>
                      <button className="outline-button" onClick={() => setPage("services")}>
                        Manage services <ArrowRight size={13} />
                      </button>
                    </div>
                    {services.length === 0 ? (
                      <p>You have not added any services yet.</p>
                    ) : services.slice(0, 5).map(service => (
                      <div className="data-row" key={service.id}>
                        <BriefcaseBusiness size={17} />
                        <div className="data-row-main">
                          <strong>{service.name}</strong>
                          <p>{service.duration_minutes} minutes</p>
                        </div>
                        <span>{money(service.price)}</span>
                      </div>
                    ))}
                  </section>
                </>
              )}

              {page === "bookings" && (
                <section className="dashboard-panel">
                  <div className="panel-heading">
                    <h2>Booking management</h2>
                    <span>{bookings.length} records</span>
                  </div>

                  <div className="search-box">
                    <Search size={16} />
                    <input
                      value={search}
                      onChange={event => setSearch(event.target.value)}
                      placeholder="Search by customer or status..."
                    />
                  </div>

                  {filteredBookings.length === 0 ? (
                    <p>No matching bookings were found.</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table className="booking-table">
                        <thead>
                          <tr>
                            <th>Customer</th>
                            <th>Appointment</th>
                            <th>Status</th>
                            <th>Update status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredBookings.map(item => (
                            <tr key={item.id}>
                              <td>
                                <strong>{item.customer_name || "Customer"}</strong>
                                <p>{item.customer_email || item.customer_phone || ""}</p>
                              </td>
                              <td>{new Date(item.appointment_date).toLocaleString()}</td>
                              <td>{item.status}</td>
                              <td>
                                <select
                                  className="status-select"
                                  value={item.status}
                                  onChange={event => updateBookingStatus(item.id, event.target.value)}
                                >
                                  <option value="pending">Pending</option>
                                  <option value="confirmed">Confirmed</option>
                                  <option value="in_progress">In progress</option>
                                  <option value="completed">Completed</option>
                                  <option value="cancelled">Cancelled</option>
                                </select>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {page === "services" && (
                <>
                  <section className="form-panel">
                    <h3>{editingService ? "Edit service" : "Add a service"}</h3>
                    <form onSubmit={saveService}>
                      <label className="field-label">Service name</label>
                      <input
                        className="auth-input"
                        value={serviceName}
                        onChange={event => setServiceName(event.target.value)}
                        placeholder="Example: Home cleaning"
                        required
                      />

                      <label className="field-label">Description</label>
                      <input
                        className="auth-input"
                        value={serviceDescription}
                        onChange={event => setServiceDescription(event.target.value)}
                        placeholder="Describe your service"
                      />

                      <label className="field-label">Price (NGN)</label>
                      <input
                        className="auth-input"
                        type="number"
                        min="0"
                        value={servicePrice}
                        onChange={event => setServicePrice(event.target.value)}
                        placeholder="Enter price"
                        required
                      />

                      <label className="field-label">Duration (minutes)</label>
                      <input
                        className="auth-input"
                        type="number"
                        min="1"
                        value={serviceDuration}
                        onChange={event => setServiceDuration(event.target.value)}
                        required
                      />

                      <div className="form-actions">
                        <button className="gold-button" type="submit" disabled={saving}>
                          <Save size={14} /> {saving ? "Saving..." : editingService ? "Update service" : "Add service"}
                        </button>
                        {editingService && (
                          <button className="outline-button" type="button" onClick={resetServiceForm}>
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </section>

                  <section className="dashboard-panel">
                    <div className="panel-heading">
                      <h2>Your services</h2>
                      <span>{services.length} services</span>
                    </div>

                    {services.length === 0 ? (
                      <p>No services yet. Add your first service above.</p>
                    ) : services.map(service => (
                      <div className="data-row" key={service.id}>
                        <BriefcaseBusiness size={17} />
                        <div className="data-row-main">
                          <strong>{service.name}</strong>
                          <p>{service.description || "No description"} · {service.duration_minutes} minutes</p>
                        </div>
                        <span>{money(service.price)}</span>
                        <button className="outline-button" onClick={() => editService(service)} aria-label="Edit service">
                          <Pencil size={13} />
                        </button>
                        <button className="outline-button" onClick={() => deleteService(service.id)} aria-label="Delete service">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </section>
                </>
              )}

              {page === "customers" && (
                <section className="dashboard-panel">
                  <div className="panel-heading">
                    <h2>Customer records</h2>
                    <span>{customers.length} customers</span>
                  </div>

                  {customers.length === 0 ? (
                    <p>Customer records will appear here when bookings are added.</p>
                  ) : customers.map(item => (
                    <div className="data-row" key={item.id}>
                      <Users size={17} />
                      <div className="data-row-main">
                        <strong>{item.customer_name || "Customer"}</strong>
                        <p>{item.customer_email || "No email recorded"}</p>
                      </div>
                      <span>{item.customer_phone || "No phone recorded"}</span>
                    </div>
                  ))}
                </section>
              )}

              {page === "billing" && (
                <section className="dashboard-panel">
                  <div className="panel-heading">
                    <h2>Subscription and billing</h2>
                    <CreditCard size={19} />
                  </div>
                  <div className="notice">
                    Payment processing is not connected yet. No subscription
                    payment or renewal can currently be completed from this page.
                  </div>
                  <p>
                    Your subscription plans, invoices and payment history
                    can be displayed here after a payment provider and
                    subscription backend have been integrated.
                  </p>
                </section>
              )}

              {page === "settings" && (
                <section className="form-panel">
                  <h3>Business settings</h3>
                  <form onSubmit={saveSettings}>
                    <label className="field-label">Business name</label>
                    <input
                      className="auth-input"
                      value={settingsName}
                      onChange={event => setSettingsName(event.target.value)}
                      required
                    />

                    <label className="field-label">Business description</label>
                    <input
                      className="auth-input"
                      value={settingsDescription}
                      onChange={event => setSettingsDescription(event.target.value)}
                      placeholder="Describe your business"
                    />

                    <label className="field-label">Business category</label>
                    <input
                      className="auth-input"
                      value={settingsCategory}
                      onChange={event => setSettingsCategory(event.target.value)}
                      placeholder="Example: Cleaning services"
                    />

                    <button className="gold-button settings-save" type="submit" disabled={saving}>
                      <Save size={14} /> {saving ? "Saving..." : "Save settings"}
                    </button>
                  </form>
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [mode, setMode] = useState<"home" | "login" | "register" | "dashboard">("home");
  const [session, setSession] = useState<any>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session) setMode("dashboard");
      setCheckingSession(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setMode("dashboard");
      else if (mode === "dashboard") setMode("home");
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setMode("home");
  }

  if (checkingSession) {
    return (
      <div className="loading-screen">
        <div className="loading-brand">SERVORA</div>
        <Loader2 className="spin" size={24} />
        <p>Loading SERVORA...</p>
      </div>
    );
  }

  if (session && mode === "dashboard") {
    return (
      <Dashboard
        userEmail={session.user?.email || "Account"}
        onLogout={logout}
      />
    );
  }

  if (mode === "login" || mode === "register") {
    return (
      <AuthPage
        mode={mode}
        setMode={setMode}
        onBack={() => setMode("home")}
        onSuccess={() => setMode("dashboard")}
      />
    );
  }

  return (
    <PublicSite
      onLogin={() => setMode("login")}
      onRegister={() => setMode("register")}
    />
  );
}
