import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faMagnifyingGlass,
  faUserShield,
  faUserTie,
  faArrowRightFromBracket,
  faBars,
  faXmark
} from "@fortawesome/free-solid-svg-icons";
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
              <FontAwesomeIcon icon={faLeaf} className="w-5 h-5 text-[#E3D8C8]" />
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
            className={`px-3.5 py-2 text-sm font-medium rounded-sm whitespace-nowrap shrink-0 transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#1F4529] ${currentPath === "/" ? "text-[#1F4529] bg-[#EAE5DE] shadow-2xs font-semibold" : "text-[#4A554D] hover:text-[#1F4529] hover:bg-[#F3EFEA] hover:-translate-y-0.5"}`}
          >
            Home
          </button>
          {navLinks.map((link) => <button
            key={link.path}
            onClick={() => handleNav(link.path)}
            className={`px-3.5 py-2 text-sm font-medium rounded-sm whitespace-nowrap shrink-0 transition-all duration-200 ease-out focus-visible:ring-2 focus-visible:ring-[#1F4529] ${isActive(link.path) ? "text-[#1F4529] bg-[#EAE5DE] shadow-2xs font-semibold" : "text-[#4A554D] hover:text-[#1F4529] hover:bg-[#F3EFEA] hover:-translate-y-0.5"}`}
          >
            {link.label}
          </button>)}
        </nav>

        {/* Zone 3: Primary Actions (1-2 actions) */}
        <div className="hidden md:flex items-center gap-2.5">
          <button
            onClick={() => handleNav("/search")}
            className="p-2 text-[#4A554D] hover:text-[#1F4529] hover:bg-[#F3EFEA] rounded-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1F4529]"
            title="Search Archive"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
          </button>

          {isAuthenticated ? <div className="flex items-center gap-2">
            <button
              onClick={() => handleNav("/admin")}
              className={`inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 border hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1F4529] ${currentPath.startsWith("/admin") ? "bg-[#1F4529] text-white border-[#1F4529] shadow-xs" : "bg-white text-[#1F4529] border-[#C7BEB1] hover:bg-[#F3EFEA]"}`}
            >
              <FontAwesomeIcon icon={faUserShield} className="w-3.5 h-3.5" />
              <span className="whitespace-nowrap shrink-0">Admin Portal</span>
            </button>
            <button
              onClick={logout}
              className="p-2 text-[#6E7570] hover:text-[#8F2D14] hover:bg-[#F3EFEA] rounded-sm transition-all duration-200 hover:-translate-y-0.5"
              title="Sign out of Curator session"
            >
              <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4" />
            </button>
          </div> : <button
            onClick={() => handleNav("/admin/login")}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-[#1F4529] bg-transparent hover:bg-[#F3EFEA] border border-[#C7BEB1] rounded-sm transition-all duration-200 hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#1F4529]"
          >
            <FontAwesomeIcon icon={faUserTie} className="w-3.5 h-3.5" />
            <span className="whitespace-nowrap shrink-0">Admin Sign In</span>
          </button>}
        </div>

        {/* Mobile menu toggle */}
        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={() => handleNav("/search")}
            className="p-2 text-[#4A554D] hover:bg-[#F3EFEA] rounded-sm transition-colors"
            aria-label="Search"
          >
            <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4" />
          </button>
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 text-[#4A554D] hover:bg-[#F3EFEA] rounded-sm focus-visible:ring-2 focus-visible:ring-[#1F4529] transition-transform duration-200"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? <FontAwesomeIcon icon={faXmark} className="w-5 h-5 transition-transform duration-200 rotate-90" /> : <FontAwesomeIcon icon={faBars} className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>

    {/* Mobile Drawer */}
    {mobileOpen && <div className="md:hidden border-t border-[#E0D9CE] bg-[#FAF8F5] px-4 pt-3 pb-6 space-y-2 animate-nav-drop shadow-md">
      <button
        onClick={() => handleNav("/")}
        className="block w-full text-left px-3 py-2.5 text-base font-medium text-[#1F4529] hover:bg-[#F3EFEA] rounded-sm transition-colors"
      >
        Home
      </button>
      {navLinks.map((link) => <button
        key={link.path}
        onClick={() => handleNav(link.path)}
        className={`block w-full text-left px-3 py-2.5 text-base font-medium rounded-sm transition-colors ${isActive(link.path) ? "text-[#1F4529] bg-[#EAE5DE] font-semibold" : "text-[#4A554D] hover:bg-[#F3EFEA]"}`}
      >
        {link.label}
      </button>)}
      <div className="pt-4 border-t border-[#E0D9CE] space-y-2">
        {isAuthenticated ? <>
          <button
            onClick={() => handleNav("/admin")}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider bg-[#1F4529] text-white rounded-sm shadow-xs transition-colors"
          >
            <FontAwesomeIcon icon={faUserShield} className="w-4 h-4" />
            Admin Dashboard ({user?.name})
          </button>
          <button
            onClick={logout}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm text-[#8F2D14] hover:bg-[#F3EFEA] rounded-sm transition-colors"
          >
            <FontAwesomeIcon icon={faArrowRightFromBracket} className="w-4 h-4" />
            Sign Out
          </button>
        </> : <button
          onClick={() => handleNav("/admin/login")}
          className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold uppercase tracking-wider text-[#1F4529] border border-[#1F4529] rounded-sm transition-colors"
        >
          <FontAwesomeIcon icon={faUserTie} className="w-4 h-4" />
          Admin Sign In
        </button>}
      </div>
    </div>}
  </header>;
};
export {
  Navbar
};
