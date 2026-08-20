import { useState } from "react";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Leaf } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
const AdminLoginPage = ({ onNavigate }) => {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await login(email.trim(), password);
      onNavigate("/admin");
    } catch (err) {
      setError(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {
    /* Header */
  }
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-sm bg-[#1F4529] text-[#FAF8F5] mx-auto flex items-center justify-center shadow-sm">
            <Leaf className="w-6 h-6 text-[#E3D8C8]" />
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
            Curator Authentication
          </h1>
          <p className="text-xs text-[#566158]">
            Restricted access for Sylva Herbarium botanical staff and curators.
          </p>
        </div>

        {
    /* Notice: Invite only */
  }
        <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-3.5 text-xs text-[#566158] flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#47663B] shrink-0" />
          <span>
            <strong>Access Policy:</strong> Admin accounts are strictly invite-only. Public registration is disabled.
          </span>
        </div>

        {
    /* Login Card */
  }
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 shadow-sm space-y-5">
          {error && <div className="p-3.5 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] text-xs rounded-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#566158]">
                Staff Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#8E9990] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
    type="email"
    required
    value={email}
    onChange={(e) => setEmail(e.target.value)}
    placeholder="curator@sylva-herbarium.org"
    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E]"
  />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#566158]">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E9990] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••••••"
    className="w-full pl-9 pr-3.5 py-2.5 text-xs sm:text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E]"
  />
              </div>
            </div>

            <button
    type="submit"
    disabled={isLoading}
    className="w-full py-3 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-xs"
  >
              {isLoading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Verify & Sign In</span>
            </button>
          </form>

        </div>
      </div>
    </div>;
};
export {
  AdminLoginPage
};
