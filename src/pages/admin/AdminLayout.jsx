import { useState } from "react";
import {
  LayoutDashboard,
  Layers,
  PlusCircle,
  Users,
  History,
  LogOut,
  ExternalLink,
  Shield,
  Leaf,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
const AdminLayout = ({
  currentAdminTab,
  onNavigate,
  children
}) => {
  const { user, logout, isSuperAdmin } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    { id: "dashboard", label: "Overview", path: "/admin", icon: LayoutDashboard },
    { id: "specimens", label: "Specimen Catalog", path: "/admin/specimens", icon: Layers },
    { id: "new-specimen", label: "New Voucher Entry", path: "/admin/specimens/new", icon: PlusCircle },
    { id: "team", label: "Curatorial Team", path: "/admin/team", icon: Users, superadminOnly: true },
    { id: "audit-logs", label: "Audit Trail", path: "/admin/audit-logs", icon: History, superadminOnly: true }
  ];
  const handleNavItemClick = (path) => {
    onNavigate(path);
    setMobileMenuOpen(false);
  };
  return <div className="h-screen w-full bg-[#F7F5F0] flex flex-col md:flex-row text-[#1C241E] overflow-hidden">
      {
    /* Mobile Top Navigation Bar */
  }
      <div className="md:hidden bg-[#18261D] text-[#D8E6DC] px-4 py-3 border-b border-[#2D3F33] flex items-center justify-between shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-sm bg-[#2D5A3D] text-[#FAF8F5] flex items-center justify-center">
            <Leaf className="w-4 h-4 text-[#D8E6DC]" />
          </div>
          <span className="font-display tracking-widest text-xs font-bold text-white">
            GB HERBARIUM CURATORIAL
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleNavItemClick("/admin/specimens/new")}
            className="p-1.5 bg-[#2D5A3D] text-white rounded-xs"
            title="New Specimen"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 text-[#D8E6DC] hover:text-white rounded-xs"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {
    /* Backdrop for Mobile Menu */
  }
      {mobileMenuOpen && <div
        className="md:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-xs"
        onClick={() => setMobileMenuOpen(false)}
      />}

      {
    /* Sidebar Navigation (Fixed 100vh on desktop, drawer on mobile) */
  }
      <aside
        className={`
          fixed inset-y-0 left-0 z-50 w-64 bg-[#18261D] text-[#D8E6DC] flex flex-col justify-between border-r border-[#2D3F33]
          transform transition-transform duration-200 ease-in-out
          md:static md:translate-x-0 md:h-screen md:shrink-0
          ${mobileMenuOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Top Header & Profile Section (Fixed at top of sidebar) */}
        <div className="shrink-0">
          {/* Mobile Drawer Header with Close Button */}
          <div className="md:hidden p-4 border-b border-[#2D3F33] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-sm bg-[#2D5A3D] text-[#FAF8F5] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-[#D8E6DC]" />
              </div>
              <div>
                <span className="font-display tracking-widest text-xs font-bold text-white block">
                  GB Herbarium
                </span>
                <span className="text-[9px] uppercase font-mono-acc text-[#8A9B8F] tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-1 text-[#8A9B8F] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Desktop Branding Zone */}
          <div className="hidden md:flex p-5 border-b border-[#2D3F33] items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-[#2D5A3D] text-[#FAF8F5] flex items-center justify-center">
                <Leaf className="w-4 h-4 text-[#D8E6DC]" />
              </div>
              <div>
                <span className="font-display tracking-widest text-sm font-bold text-white block">
                  GB Herbarium
                </span>
                <span className="text-[10px] uppercase font-mono-acc text-[#8A9B8F] tracking-wider">
                  Admin Panel
                </span>
              </div>
            </div>
          </div>

          {/* User Profile Card */}
          <div className="p-4 bg-[#141F18] border-b border-[#2D3F33]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#2D5A3D] text-white text-xs font-bold flex items-center justify-center font-mono-acc shrink-0">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span
                    className={`inline-block w-1.5 h-1.5 rounded-full ${user?.role === "superadmin" ? "bg-[#5A9E72]" : "bg-[#E3D8C8]"}`}
                  />
                  <span className="text-[10px] uppercase font-mono-acc tracking-wider text-[#A4B3A8]">
                    {user?.role === "curator" ? "ADMIN" : user?.role || "ADMIN"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Navigation Menu Area */}
        <nav className="flex-1 overflow-y-auto min-h-0 p-3 space-y-1">
          {navItems.map((item) => {
            if (item.superadminOnly && !isSuperAdmin) return null;
            const Icon = item.icon;
            const isActive = item.id === currentAdminTab || item.id === "specimens" && currentAdminTab === "specimens-list";
            return <button
              key={item.id}
              onClick={() => handleNavItemClick(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-xs font-medium transition-colors ${isActive ? "bg-[#2D5A3D] text-white shadow-xs font-semibold" : "text-[#B8C8BD] hover:bg-[#233529] hover:text-white"}`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 shrink-0 text-[#D8E6DC]" />
                <span className="truncate">{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 text-[#A4B3A8] shrink-0" />}
            </button>;
          })}
        </nav>

        {/* Dedicated Fixed Bottom Section (Public Archive & Sign Out always visible) */}
        <div className="shrink-0 p-4 border-t border-[#2D3F33] space-y-2 text-xs bg-[#18261D]">
          <button
            onClick={() => handleNavItemClick("/")}
            className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-[#A4B3A8] hover:bg-[#233529] hover:text-white transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              Public Archive
            </span>
          </button>

          <button
            onClick={() => {
              logout();
              handleNavItemClick("/admin/login");
            }}
            className="w-full flex items-center justify-between px-3 py-2 rounded-sm text-[#E58373] hover:bg-[#381B18] transition-colors"
          >
            <span className="flex items-center gap-2 font-medium">
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content Area (Scrolls independently of sidebar) */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-y-auto">
        {/* Desktop Header */}
        <header className="hidden md:flex bg-white border-b border-[#E0D9CE] px-6 py-3.5 items-center justify-between shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-2 text-xs text-[#6E7570] font-mono-acc">
            <Shield className="w-3.5 h-3.5 text-[#2D5A3D]" />
            <span className="uppercase tracking-wider font-semibold text-[#1C241E]">
              GB Herbarium Curatorial Console
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate("/admin/specimens/new")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Catalog New Specimen</span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">{children}</div>
      </main>
    </div>;
};
export {
  AdminLayout
};
