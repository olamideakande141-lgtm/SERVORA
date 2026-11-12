
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  BriefcaseBusiness,
  Settings,
  CreditCard,
  Bell,
  Search,
  Plus,
  Menu,
  X,
  LogOut,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import "./styles.css";

type View =
  | "Overview"
  | "Bookings"
  | "Services"
  | "Customers"
  | "Billing"
  | "Settings";

interface Business {
  id: string;
  name: string;
  slug?: string;
}

interface Booking {
  id: string;
  appointment_date?: string;
  status?: string;
  payment_status?: string;
  customer_name?: string;
  service_name?: string;
}

const navigation = [
  { name: "Overview", icon: LayoutDashboard },
  { name: "Bookings", icon: CalendarDays },
  { name: "Services", icon: BriefcaseBusiness },
  { name: "Customers", icon: Users },
  { name: "Billing", icon: CreditCard },
  { name: "Settings", icon: Settings },
] as const;

export default function App() {
  const [view, setView] = useState<View>("Overview");
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeBusiness, setActiveBusiness] = useState("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  const currentBusiness = businesses.find(
    (business) => business.id === activeBusiness
  );

  useEffect(() => {
    let mounted = true;

    async function loadWorkspace() {
      if (!supabase) {
        if (mounted) {
          setLoading(false);
          setError(
            "Supabase is not configured. Add your Supabase environment variables in Render."
          );
        }
        return;
      }

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          if (mounted) {
            setLoading(false);
            setError("Please sign in through your Supabase account.");
          }
          return;
        }

        if (mounted) setUserEmail(user.email || "");

        const { data, error: businessError } = await supabase
          .from("business_members")
          .select("business_id, businesses(id, name, slug)")
          .eq("user_id", user.id);

        if (businessError) throw businessError;

        const foundBusinesses = (data || [])
          .map((item: any) => item.businesses)
          .filter(Boolean) as Business[];

        if (mounted) {
          setBusinesses(foundBusinesses);

          if (foundBusinesses.length > 0) {
            setActiveBusiness(foundBusinesses[0].id);
          }
        }
      } catch (err: any) {
        if (mounted) {
          setError(err.message || "Unable to load your workspace.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadWorkspace();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    async function loadBookings() {
      if (!supabase || !activeBusiness) {
        setBookings([]);
        return;
      }

      const { data, error: bookingError } = await supabase
        .from("bookings")
        .select("*")
        .eq("business_id", activeBusiness)
        .order("appointment_date", { ascending: false })
        .limit(10);

      if (!mounted) return;

      if (bookingError) {
        setError(bookingError.message);
        return;
      }

      setBookings((data || []) as Booking[]);
    }

    loadBookings();

    return () => {
      mounted = false;
    };
  }, [activeBusiness]);

  async function createWorkspace() {
    const name = window.prompt("Enter your business name:");

    if (!name?.trim() || !supabase) return;

    setCreating(true);
    setError("");

    try {
      const slug = name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");

      const { data, error: createError } = await supabase.rpc(
        "create_business_workspace",
        {
          business_name: name.trim(),
          business_slug: slug,
        }
      );

      if (createError) throw createError;

      const businessId =
        typeof data === "string" ? data : data?.business_id || data?.id;

      if (!businessId) {
        throw new Error(
          "Workspace creation returned no business ID. Check your database function."
        );
      }

      const newBusiness = {
        id: businessId,
        name: name.trim(),
        slug,
      };

      setBusinesses((previous) => [...previous, newBusiness]);
      setActiveBusiness(businessId);
    } catch (err: any) {
      setError(err.message || "Could not create your workspace.");
    } finally {
      setCreating(false);
    }
  }

  async function signOut() {
    if (!supabase) return;

    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    window.location.reload();
  }

  const totalBookings = bookings.length;
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "pending"
  ).length;
  const confirmedBookings = bookings.filter(
    (booking) => booking.status === "confirmed"
  ).length;
  const completedBookings = bookings.filter(
    (booking) => booking.status === "completed"
  ).length;

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-brand">SERVORA</div>
        <Loader2 className="spin" size={28} />
        <p>Preparing your workspace...</p>
      </div>
    );
  }

  if (!supabase || error.includes("Supabase is not configured")) {
    return (
      <div className="loading-screen">
        <div className="loading-brand">SERVORA</div>
        <AlertCircle size={32} />
        <h2>Configuration required</h2>
        <p>{error}</p>
        <p>
          Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your Render
          environment variables.
        </p>
      </div>
    );
  }

  if (error.includes("Please sign in")) {
    return (
      <div className="loading-screen">
        <div className="loading-brand">SERVORA</div>
        <h2>Sign in required</h2>
        <p>{error}</p>
        <p>Sign in using your configured Supabase authentication page.</p>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {menuOpen && (
        <button
          className="mobile-overlay"
          aria-label="Close menu"
          onClick={() => setMenuOpen(false)}
        />
      )}

      <aside className={`sidebar ${menuOpen ? "sidebar-open" : ""}`}>
        <div className="brand">
          <div className="brand-mark">S</div>
          <div>
            <strong>SERVORA</strong>
            <span>BUSINESS MANAGEMENT</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <div className="workspace-label">WORKSPACE</div>

        <select
          className="workspace-select"
          value={activeBusiness}
          onChange={(event) => setActiveBusiness(event.target.value)}
        >
          {businesses.map((business) => (
            <option key={business.id} value={business.id}>
              {business.name}
            </option>
          ))}
        </select>

        <button
          className="new-workspace"
          onClick={createWorkspace}
          disabled={creating}
        >
          <Plus size={16} />
          {creating ? "Creating..." : "New workspace"}
        </button>

        <div className="sidebar-section-label">MENU</div>

        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                className={`nav-item ${view === item.name ? "active" : ""}`}
                onClick={() => {
                  setView(item.name);
                  setMenuOpen(false);
                }}
              >
                <Icon size={19} />
                <span>{item.name}</span>
                {view === item.name && <span className="active-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-help">
            <div className="help-icon">✦</div>
            <strong>Need assistance?</strong>
            <p>We're here to help you grow your business.</p>
            <a href="mailto:support@servora.com">Contact support</a>
          </div>

          <button className="logout-button" onClick={signOut}>
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="main-area">
        <header className="topbar">
          <button
            className="mobile-menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Open navigation"
          >
            <Menu size={22} />
          </button>

          <div className="breadcrumb">
            <span>Workspace</span>
            <span>/</span>
            <strong>{view}</strong>
          </div>

          <div className="topbar-actions">
            <button
              className="icon-button"
              aria-label="Search"
              onClick={() => window.alert("Search is coming soon.")}
            >
              <Search size={19} />
            </button>

            <button
              className="icon-button notification-button"
              aria-label="Notifications"
              onClick={() => window.alert("No new notifications.")}
            >
              <Bell size={19} />
            </button>

            <div className="user-profile">
              <div className="avatar">
                {(userEmail.charAt(0) || "U").toUpperCase()}
              </div>
              <div className="user-info">
                <strong>{userEmail.split("@")[0] || "User"}</strong>
                <span>Workspace member</span>
              </div>
            </div>
          </div>
        </header>

        <div className="page-content">
          {error && (
            <div className="error-message">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button onClick={() => setError("")}>Dismiss</button>
            </div>
          )}

          {!currentBusiness && (
            <section className="empty-workspace">
              <div className="empty-icon">
                <Building2 size={30} />
              </div>
              <h1>Welcome to SERVORA</h1>
              <p>
                Create your first business workspace to start managing
                appointments, services and customers.
              </p>
              <button
                className="gold-button"
                onClick={createWorkspace}
                disabled={creating}
              >
                <Plus size={18} />
                {creating ? "Creating..." : "Create business workspace"}
              </button>
            </section>
          )}

          {currentBusiness && (
            <>
              {view === "Overview" && (
                <>
                  <section className="page-heading">
                    <div>
                      <div className="eyebrow">BUSINESS OVERVIEW</div>
                      <h1>Welcome back.</h1>
                      <p>
                        Here's what's happening at{" "}
                        <strong>{currentBusiness.name}</strong>.
                      </p>
                    </div>

                    <button
                      className="gold-button"
                      onClick={() => setView("Bookings")}
                    >
                      <Plus size={17} />
                      View bookings
                    </button>
                  </section>

                  <section className="stats-grid">
                    <StatCard
                      title="Total bookings"
                      value={String(totalBookings)}
                      detail="Latest 10 records"
                      icon={<CalendarDays />}
                    />
                    <StatCard
                      title="Pending bookings"
                      value={String(pendingBookings)}
                      detail="Awaiting confirmation"
                      icon={<Clock />}
                    />
                    <StatCard
                      title="Confirmed bookings"
                      value={String(confirmedBookings)}
                      detail="Confirmed appointments"
                      icon={<CheckCircle />}
                    />
                    <StatCard
                      title="Completed bookings"
                      value={String(completedBookings)}
                      detail="Marked as completed"
                      icon={<TrendingUp />}
                    />
                  </section>

                  <section className="content-grid">
                    <div className="panel bookings-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Recent bookings</h2>
                          <p>Your latest appointment activity</p>
                        </div>
                        <button
                          className="text-button"
                          onClick={() => setView("Bookings")}
                        >
                          View all <ArrowUpRight size={15} />
                        </button>
                      </div>

                      <BookingTable bookings={bookings.slice(0, 5)} />
                    </div>

                    <div className="panel quick-panel">
                      <div className="panel-heading">
                        <div>
                          <h2>Quick actions</h2>
                          <p>Manage your workspace</p>
                        </div>
                      </div>

                      <QuickAction
                        icon={<CalendarDays />}
                        title="Manage bookings"
                        description="Review and update appointments"
                        onClick={() => setView("Bookings")}
                      />
                      <QuickAction
                        icon={<BriefcaseBusiness />}
                        title="Manage services"
                        description="Add or edit your services"
                        onClick={() => setView("Services")}
                      />
                      <QuickAction
                        icon={<Users />}
                        title="Customers"
                        description="View your customer records"
                        onClick={() => setView("Customers")}
                      />
                      <QuickAction
                        icon={<Settings />}
                        title="Business settings"
                        description="Configure your workspace"
                        onClick={() => setView("Settings")}
                      />
                    </div>
                  </section>

                  <section className="panel note-panel">
                    <div className="note-symbol">✦</div>
                    <div>
                      <h3>Your business, organised.</h3>
                      <p>
                        Use SERVORA to manage appointments, services and
                        customer activity from one workspace.
                      </p>
                    </div>
                  </section>
                </>
              )}

              {view === "Bookings" && (
                <PageSection
                  title="Bookings"
                  subtitle="Review and manage customer appointments."
                >
                  <BookingTable bookings={bookings} />
                </PageSection>
              )}

              {view === "Services" && (
                <PageSection
                  title="Services"
                  subtitle="Manage the services your business offers."
                >
                  <EmptyState
                    icon={<BriefcaseBusiness />}
                    title="Your services"
                    description="Your service records will appear here once your services database is configured."
                  />
                </PageSection>
              )}

              {view === "Customers" && (
                <PageSection
                  title="Customers"
                  subtitle="Keep track of your customer relationships."
                >
                  <EmptyState
                    icon={<Users />}
                    title="Customer management"
                    description="Customer records will appear here when your customer profiles are connected."
                  />
                </PageSection>
              )}

              {view === "Billing" && (
                <PageSection
                  title="Billing and subscriptions"
                  subtitle="Manage your SERVORA subscription."
                >
                  <div className="billing-card">
                    <div className="billing-icon">
                      <CreditCard size={25} />
                    </div>
                    <h2>Subscription management</h2>
                    <p>
                      Monthly and yearly subscription management can be
                      connected here. No payment has been collected through
                      this screen.
                    </p>
                    <span className="status-pill">Payment integration required</span>
                  </div>
                </PageSection>
              )}

              {view === "Settings" && (
                <PageSection
                  title="Settings"
                  subtitle="Manage your business workspace."
                >
                  <div className="settings-card">
                    <label>Business name</label>
                    <input
                      value={currentBusiness.name}
                      readOnly
                    />
                    <label>Business workspace ID</label>
                    <input value={currentBusiness.id} readOnly />
                    <p>
                      Business profile editing will be enabled after the
                      business settings database is connected.
                    </p>
                  </div>
                </PageSection>
              )}
            </>
          )}
        </div>

        <footer className="app-footer">
          <span>© {new Date().getFullYear()} SERVORA</span>
          <span>Business management made simpler.</span>
        </footer>
      </main>
    </div>
  );
}

function StatCard({
  title,
  value,
  detail,
  icon,
}: {
  title: string;
  value: string;
  detail: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{title}</span>
        <div className="stat-icon">{icon}</div>
      </div>
      <strong className="stat-value">{value}</strong>
      <span className="stat-detail">{detail}</span>
    </div>
  );
}

function PageSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <section className="page-heading">
        <div>
          <div className="eyebrow">SERVORA WORKSPACE</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </section>
      <section className="panel page-panel">{children}</section>
    </>
  );
}

function BookingTable({ bookings }: { bookings: Booking[] }) {
  if (bookings.length === 0) {
    return (
      <EmptyState
        icon={<CalendarDays />}
        title="No bookings yet"
        description="New customer appointments will appear here."
      />
    );
  }

  return (
    <div className="table-wrapper">
      <table className="data-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Appointment</th>
            <th>Status</th>
            <th>Payment</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((booking) => (
            <tr key={booking.id}>
              <td>
                <strong>{booking.customer_name || "Customer"}</strong>
                <small>{booking.service_name || "Service booking"}</small>
              </td>
              <td>
                {booking.appointment_date
                  ? new Date(booking.appointment_date).toLocaleString()
                  : "Not specified"}
              </td>
              <td>
                <span className={`status-pill ${booking.status || "pending"}`}>
                  {booking.status || "Pending"}
                </span>
              </td>
              <td>
                <span className="payment-status">
                  {booking.payment_status || "Unpaid"}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function QuickAction({
  icon,
  title,
  description,
  onClick,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button className="quick-action" onClick={onClick}>
      <div className="quick-action-icon">{icon}</div>
      <div>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <ArrowUpRight size={17} />
    </button>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
