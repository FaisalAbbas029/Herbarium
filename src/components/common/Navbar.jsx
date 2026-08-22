import { useState } from "react";
import { Leaf, Search, Shield, User as UserIcon, LogOut, Menu, X } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
const Navbar = ({ currentPath, onNavigate }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navLinks = [
    { label: "Archive", path: "/search" },
    { label: "Families", path: "/families" },
    { label: "About", path: "/about" },
    { label: "Contact", path: "/contact" }
  ];
  const handleNav = (path) => {
    onNavigate(path);
    setMobileOpen(false);
  };
  const isActive = (path) => {
    if (path === "/search" && (currentPath === "/search" || currentPath.startsWith("/search?"))) return true;
    return currentPath === path;
  };
  return <header className="sticky top-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-xs border-b border-[#E0D9CE]">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-18">
        {
          /* Zone 1: Brand Title (One single line text element) */
        }
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleNav("/")}
            className="flex items-center gap-2.5 text-left group focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#1F4529]"
          >
            <div className="w-9 h-9 rounded-sm bg-[#1F4529] text-[#FAF8F5] flex items-center justify-center shadow-xs transition-transform group-hover:scale-105">
              <Leaf className="w-5 h-5 text-[#E3D8C8]" />
            </div>
            <span className="font-display tracking-widest text-lg sm:text-xl font-bold text-[#1F4529] whitespace-nowrap">
              GB Herbarium
            </span>
          </button>
        </div>

        {
          /* Zone 2: Nav Links (4-6 links, 1-2 word labels, single line) */
        }
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <button
            onClick={() => handleNav("/")}
            className={`px-3.5 py-2 text-sm font-medium rounded-sm whitespace-nowrap shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-[#1F4529] ${currentPath === "/" ? "text-[#1F4529] bg-[#EAE5DE]" : "text-[#4A554D] hover:text-[#1F4529] hover:bg-[#F3EFEA]"}`}
          >
            Home
          </button>
          {navLinks.map((link) => <button
            key={link.path}
            onClick={() => handleNav(link.path)}
            className={`px-3.5 py-2 text-sm font-medium rounded-sm whitespace-nowrap shrink-0 transition-colors focus-visible:ring-2 focus-visible:ring-[#1F4529] ${isActive(link.path) ? "text-[#1F4529] bg-[#EAE5DE]" : "text-[#4A554D] hover:text-[#1F4529] hover:bg-[#F3EFEA]"}`}
          >
            {link.label}
          </button>)}
        </nav>

        {
          /* Zone 3: Primary Actions (1-2 actions) */
        }
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => handleNav("/search")}
            className="p-2 text-[#4A554D] hover:text-[#1F4529] hover:bg-[#F3EFEA] rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#1F4529]"
            title="Search Archive"
          >
            <Search className="w-5 h-5" />
          </button>

          {isAuthenticated ? <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav("/admin")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors border focus-visible:ring-2 focus-visible:ring-[#1F4529] ${currentPath.startsWith("/admin") ? "bg-[#1F4529] text-white border-[#1F4529]" : "bg-white text-[#1F4529] border-[#C7BEB1] hover:bg-[#F3EFEA]"}`}
            >
              <Shield className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap shrink-0">Admin Portal</span>
            </button>
            <button
              onClick={logout}
              className="p-2 text-[#6E7570] hover:text-[#8F2D14] hover:bg-[#F3EFEA] rounded-sm transition-colors"
              title="Sign out of Curator session"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div> : <button
            onClick={() => handleNav("/admin/login")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1F4529] bg-transparent hover:bg-[#F3EFEA] border border-[#C7BEB1] rounded-sm transition-colors focus-visible:ring-2 focus-visible:ring-[#1F4529]"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap shrink-0">Admin Sign In</span>
          </button>}
        </div>

        {
          /* Mobile menu toggle */
        }
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleNav("/search")}
            className="p-2 text-[#4A554D] hover:bg-[#F3EFEA] rounded-sm"
            aria-label="Search"
          >
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#4A554D] hover:bg-[#F3EFEA] rounded-sm focus-visible:ring-2 focus-visible:ring-[#1F4529]"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
    </div>

    {
      /* Mobile Drawer */
    }
    {mobileOpen && <div className="md:hidden border-t border-[#E0D9CE] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-2">
      <button
        onClick={() => handleNav("/")}
        className="block w-full text-left px-3 py-2.5 text-base font-medium text-[#1F4529] hover:bg-[#F3EFEA] rounded-sm"
      >
        Home
      </button>
      {navLinks.map((link) => <button
        key={link.path}
        onClick={() => handleNav(link.path)}
        className={`block w-full text-left px-3 py-2.5 text-base font-medium rounded-sm ${isActive(link.path) ? "text-[#1F4529] bg-[#EAE5DE] font-semibold" : "text-[#4A554D] hover:bg-[#F3EFEA]"}`}
      >
        {link.label}
      </button>)}
      <div className="pt-4 border-t border-[#E0D9CE] space-y-2">
        {isAuthenticated ? <>
          <button
            onClick={() => handleNav("/admin")}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider bg-[#1F4529] text-white rounded-sm"
          >
            <Shield className="w-4 h-4" />
            Admin Dashboard ({user?.name})
          </button>
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#8F2D14] hover:bg-[#F3EFEA] rounded-sm"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </> : <button
          onClick={() => handleNav("/admin/login")}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#1F4529] border border-[#1F4529] rounded-sm"
        >
          <UserIcon className="w-4 h-4" />
          Admin Sign In
        </button>}
      </div>
    </div>}
  </header>;
};
export {
  Navbar
};
