import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext.jsx";
import { Navbar } from "./components/common/Navbar.jsx";
import { Footer } from "./components/common/Footer.jsx";
import { HomePage } from "./pages/public/HomePage.jsx";
import { SearchResultsPage } from "./pages/public/SearchResultsPage.jsx";
import { SpecimenDetailPage } from "./pages/public/SpecimenDetailPage.jsx";
import { FamiliesPage } from "./pages/public/FamiliesPage.jsx";
import { AboutPage } from "./pages/public/AboutPage.jsx";
import { ContactPage } from "./pages/public/ContactPage.jsx";
import { AcceptInvitationPage } from "./pages/public/AcceptInvitationPage.jsx";
import { NotFoundPage } from "./pages/public/NotFoundPage.jsx";
import { AdminLoginPage } from "./pages/admin/AdminLoginPage.jsx";
import { AdminLayout } from "./pages/admin/AdminLayout.jsx";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage.jsx";
import { AdminSpecimensListPage } from "./pages/admin/AdminSpecimensListPage.jsx";
import { AdminSpecimenEditorPage } from "./pages/admin/AdminSpecimenEditorPage.jsx";
import { AdminTeamPage } from "./pages/admin/AdminTeamPage.jsx";
import { AdminAuditLogsPage } from "./pages/admin/AdminAuditLogsPage.jsx";
function AppContent() {
  const [currentPath, setCurrentPath] = useState(
    window.location.pathname + window.location.search
  );
  const { isAuthenticated, isLoading } = useAuth();
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname + window.location.search);
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);
  const handleNavigate = (path) => {
    window.history.pushState({}, "", path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const pathname = currentPath.split("?")[0];
  if (isLoading) {
    return <div className="min-h-screen bg-[#FAF8F5] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-3 border-[#1F4529] border-t-transparent rounded-full animate-spin" />
        <div className="font-serif-heading text-sm text-[#1F4529] font-bold tracking-wider uppercase">
          Sylva Herbarium Archive
        </div>
      </div>;
  }
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      if (isAuthenticated) {
        handleNavigate("/admin");
        return null;
      }
      return <AdminLoginPage onNavigate={handleNavigate} />;
    }
    if (!isAuthenticated) {
      return <AdminLoginPage
        onNavigate={handleNavigate}
        redirectAfterLogin={currentPath}
      />;
    }
    let currentAdminTab = "dashboard";
    if (pathname.startsWith("/admin/specimens/new")) {
      currentAdminTab = "new-specimen";
    } else if (pathname.startsWith("/admin/specimens")) {
      currentAdminTab = "specimens";
    } else if (pathname.startsWith("/admin/team")) {
      currentAdminTab = "team";
    } else if (pathname.startsWith("/admin/audit-logs")) {
      currentAdminTab = "audit-logs";
    }
    return <AdminLayout currentAdminTab={currentAdminTab} onNavigate={handleNavigate}>
        {pathname === "/admin" || pathname === "/admin/dashboard" ? <AdminDashboardPage onNavigate={handleNavigate} /> : pathname === "/admin/specimens" ? <AdminSpecimensListPage onNavigate={handleNavigate} /> : pathname === "/admin/specimens/new" ? <AdminSpecimenEditorPage onNavigate={handleNavigate} /> : pathname.startsWith("/admin/specimens/edit/") ? <AdminSpecimenEditorPage
      specimenId={pathname.replace("/admin/specimens/edit/", "")}
      onNavigate={handleNavigate}
    /> : pathname === "/admin/team" ? <AdminTeamPage onNavigate={handleNavigate} /> : pathname === "/admin/audit-logs" ? <AdminAuditLogsPage onNavigate={handleNavigate} /> : <AdminDashboardPage onNavigate={handleNavigate} />}
      </AdminLayout>;
  }
  let publicPage = null;
  if (pathname === "/" || pathname === "/home") {
    publicPage = <HomePage onNavigate={handleNavigate} />;
  } else if (pathname === "/search") {
    publicPage = <SearchResultsPage onNavigate={handleNavigate} />;
  } else if (pathname.startsWith("/specimen/")) {
    const specimenId = pathname.replace("/specimen/", "");
    publicPage = <SpecimenDetailPage specimenId={specimenId} onNavigate={handleNavigate} />;
  } else if (pathname === "/families") {
    publicPage = <FamiliesPage onNavigate={handleNavigate} />;
  } else if (pathname === "/about") {
    publicPage = <AboutPage onNavigate={handleNavigate} />;
  } else if (pathname === "/contact") {
    publicPage = <ContactPage onNavigate={handleNavigate} />;
  } else if (pathname === "/accept-invitation") {
    publicPage = <AcceptInvitationPage onNavigate={handleNavigate} />;
  } else {
    publicPage = <NotFoundPage onNavigate={handleNavigate} />;
  }
  return <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C241E]">
      <Navbar currentPath={pathname} onNavigate={handleNavigate} />
      <main className="flex-1">{publicPage}</main>
      <Footer onNavigate={handleNavigate} />
    </div>;
}
function App() {
  return <AuthProvider>
      <AppContent />
    </AuthProvider>;
}
export {
  App as default
};
