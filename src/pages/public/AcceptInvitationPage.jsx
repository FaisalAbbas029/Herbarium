import { useState, useEffect } from "react";
import { Shield, CheckCircle2, AlertCircle, Lock, ArrowRight } from "lucide-react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
const AcceptInvitationPage = ({
  token,
  onNavigate
}) => {
  const { refreshUser } = useAuth();
  const [invitation, setInvitation] = useState(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  useEffect(() => {
    if (!token) {
      setError("No invitation token provided in URL.");
      setIsLoading(false);
      return;
    }
    api.getInvitationByToken(token).then((res) => {
      setInvitation(res.invitation);
    }).catch((err) => {
      setError(err.message || "Invalid or expired invitation token.");
    }).finally(() => {
      setIsLoading(false);
    });
  }, [token]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setIsSubmitting(true);
    try {
      await api.acceptInvitation({ token, password });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => {
        onNavigate("/admin");
      }, 1500);
    } catch (err) {
      setError(err.message || "Failed to accept invitation.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return <div className="max-w-md mx-auto my-20 p-8 text-center space-y-4">
        <div className="w-8 h-8 border-3 border-[#1F4529] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-[#566158]">Verifying invitation token...</p>
      </div>;
  }
  return <div className="max-w-md mx-auto my-16 px-4">
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 shadow-sm space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-sm bg-[#EBF3ED] text-[#1F4529] mx-auto flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <h1 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
            Accept Curator Invitation
          </h1>
          <p className="text-xs text-[#566158]">
            Set up your credentials to join the Sylva Herbarium archival team.
          </p>
        </div>

        {error && <div className="p-3.5 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] text-xs rounded-sm flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>}

        {success ? <div className="p-4 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] text-xs rounded-sm space-y-2 text-center">
            <CheckCircle2 className="w-6 h-6 mx-auto text-[#2D5A3D]" />
            <p className="font-bold">Account Activated Successfully!</p>
            <p className="text-[#566158]">Redirecting to Curator Portal...</p>
          </div> : invitation ? <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 bg-[#FAF8F5] border border-[#EDE7DD] rounded-sm text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[#6E7570]">Invitee:</span>
                <strong className="text-[#1C241E]">{invitation.name}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7570]">Email:</span>
                <strong className="text-[#1C241E] font-mono-acc">{invitation.email}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7570]">Assigned Role:</span>
                <strong className="text-[#1F4529] uppercase">{invitation.role}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-[#6E7570]">Invited By:</span>
                <span className="text-[#1C241E]">{invitation.invitedByUserName}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#566158]">
                Create Password (Min. 8 characters)
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E9990] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
    type="password"
    required
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
  />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#566158]">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#8E9990] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
    type="password"
    required
    value={confirmPassword}
    onChange={(e) => setConfirmPassword(e.target.value)}
    placeholder="••••••••"
    className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
  />
              </div>
            </div>

            <button
    type="submit"
    disabled={isSubmitting}
    className="w-full py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
  >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              <span>Complete Setup & Enter Archive</span>
            </button>
          </form> : null}
      </div>
    </div>;
};
export {
  AcceptInvitationPage
};
