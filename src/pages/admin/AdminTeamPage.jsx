import { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Shield,
  Copy,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { ConfirmModal } from "../../components/common/ConfirmModal.jsx";

const AdminTeamPage = ({ onNavigate }) => {
  const { user: currentUser, isSuperAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteName, setInviteName] = useState("");
  const [inviteRole, setInviteRole] = useState("curator");
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);
  const [generatedInviteLink, setGeneratedInviteLink] = useState(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [userToToggle, setUserToToggle] = useState(null);
  const [isTogglingUser, setIsTogglingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [inviteToCancel, setInviteToCancel] = useState(null);
  const [isCancellingInvite, setIsCancellingInvite] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchTeam = async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    try {
      const data = await api.getTeam();
      setUsers(data.users || []);
      setInvitations((data.invitations || []).filter((i) => i.status === "pending"));
    } catch (err) {
      console.error("Failed to load team:", err);
      setPageError(err.message || "Failed to load team directory");
    } finally {
      if (showLoading) setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsSubmittingInvite(true);
    try {
      const res = await api.inviteColleague({
        email: inviteEmail.trim(),
        name: inviteName.trim(),
        role: inviteRole
      });
      const inviteUrl = `${window.location.origin}/accept-invitation?token=${res.invitation.token}`;
      setGeneratedInviteLink(inviteUrl);
      fetchTeam(false);
    } catch (err) {
      setErrorMsg(err.message || "Failed to send invitation.");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRevokeInvite = async (invitationId) => {
    setPageError(null);
    setSuccessMsg(null);
    try {
      setInvitations((prev) => prev.filter((i) => i.id !== invitationId));
      await api.revokeInvitation(invitationId);
      setSuccessMsg("Staff invitation revoked successfully.");
    } catch (err) {
      setPageError(err.message || "Failed to revoke invitation");
      fetchTeam(false);
    }
  };

  const handleConfirmCancelInvite = async () => {
    if (!inviteToCancel || isCancellingInvite) return;
    const targetId = inviteToCancel.id;
    setIsCancellingInvite(true);
    setPageError(null);
    setSuccessMsg(null);
    try {
      setInvitations((prev) => prev.filter((i) => i.id !== targetId));
      await api.cancelInvitation(targetId);
      setSuccessMsg("Staff invitation cancelled successfully.");
      setInviteToCancel(null);
    } catch (err) {
      console.error("Failed to cancel invitation:", err);
      setPageError(err.message || "Failed to cancel invitation. Please try again.");
      setInviteToCancel(null);
      fetchTeam(false);
    } finally {
      setIsCancellingInvite(false);
    }
  };

  const handleToggleUserStatus = async () => {
    if (!userToToggle || isTogglingUser) return;
    const targetId = userToToggle.id;
    const newStatus = userToToggle.status === "active" ? "inactive" : "active";
    setIsTogglingUser(true);
    setPageError(null);
    setSuccessMsg(null);
    try {
      await api.toggleUserStatus(targetId, newStatus);
      setUsers((prev) =>
        prev.map((u) => (u.id === targetId ? { ...u, status: newStatus } : u))
      );
      setSuccessMsg(`Account status updated to ${newStatus}.`);
      setUserToToggle(null);
    } catch (err) {
      console.error("Failed to update user status:", err);
      setPageError(err.message || "Failed to update user status. Please try again.");
      setUserToToggle(null);
    } finally {
      setIsTogglingUser(false);
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete || isDeletingUser) return;
    const targetId = userToDelete.id;
    const targetName = userToDelete.name;
    setIsDeletingUser(true);
    setPageError(null);
    setSuccessMsg(null);
    try {
      await api.removeStaffMember(targetId);
      setUsers((prev) => prev.filter((u) => u.id !== targetId));
      setSuccessMsg(`Staff member ${targetName} was permanently removed successfully.`);
      setUserToDelete(null);
    } catch (err) {
      console.error("Failed to remove staff member:", err);
      setPageError(err.message || "Failed to remove staff member. Please try again.");
      setUserToDelete(null);
    } finally {
      setIsDeletingUser(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  if (!isSuperAdmin) {
    return (
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 text-center space-y-3">
        <Shield className="w-8 h-8 text-[#8F2D14] mx-auto" />
        <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
          Curatorial Access Restricted
        </h2>
        <p className="text-xs text-[#566158] max-w-md mx-auto">
          Team management and user provisioning require Superadministrator credentials.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
            Governance & Staff
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
            Curatorial Team & Roles
          </h1>
          <p className="text-xs text-[#566158]">
            Manage herbarium curators, taxonomists, and superadministrator credentials.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedInviteLink(null);
            setInviteEmail("");
            setInviteName("");
            setErrorMsg(null);
            setShowInviteModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite New Curator</span>
        </button>
      </div>

      {pageError && (
        <div className="p-3.5 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] text-xs rounded-sm">
          {pageError}
        </div>
      )}

      {successMsg && (
        <div className="p-3.5 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] text-xs rounded-sm flex items-center justify-between gap-2 animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1F4529] shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="text-[#1F4529] hover:opacity-75 font-bold text-xs p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Active Team Members Section */}
      <div className="bg-white border border-[#E0D9CE] rounded-sm overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#EDE7DD] bg-[#FAF8F5] flex items-center justify-between">
          <h2 className="font-serif-heading text-sm font-bold text-[#1C241E] flex items-center gap-2">
            <Users className="w-4 h-4 text-[#2D5A3D]" />
            <span>Active Archival Curators ({users.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E0D9CE] text-[#566158] uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Name & Title</th>
                <th className="py-3 px-4">Institutional Email</th>
                <th className="py-3 px-4">System Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7DD]">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-xs text-[#6E7570]">
                    Loading staff directory...
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const isCurrent = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-[#FAF8F5] transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-[#1C241E] flex items-center gap-2">
                          <span>{u.name}</span>
                          {isCurrent && (
                            <span className="px-1.5 py-0.2 bg-[#EBF3ED] text-[#1F4529] text-[9px] font-bold rounded-xs uppercase">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono-acc text-[#566158]">{u.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                            u.role === "superadmin"
                              ? "bg-[#1F4529] text-white"
                              : "bg-[#EDE7DD] text-[#3D443F]"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs ${
                            u.status === "active"
                              ? "bg-[#EBF3ED] text-[#1F4529]"
                              : "bg-[#FDF2F2] text-[#8F2D14]"
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isCurrent && (
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => setUserToToggle(u)}
                              disabled={isDeletingUser || isTogglingUser}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#566158] hover:bg-[#EAE5DE] hover:text-[#1C241E] rounded-xs transition-colors border border-[#C7BEB1] disabled:opacity-50 disabled:cursor-not-allowed"
                              title={u.status === "active" ? "Deactivate Account" : "Activate Account"}
                            >
                              {u.status === "active" ? "Deactivate" : "Activate"}
                            </button>
                            <button
                              onClick={() => setUserToDelete(u)}
                              disabled={isDeletingUser || isTogglingUser}
                              className="px-2.5 py-1 text-[11px] font-semibold text-[#8F2D14] hover:bg-[#FDF2F2] rounded-xs transition-colors border border-[#F5C6C6] disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Permanently remove staff member"
                            >
                              Remove Staff
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending Invitations Section */}
      <div className="bg-white border border-[#E0D9CE] rounded-sm overflow-hidden shadow-xs">
        <div className="p-4 border-b border-[#EDE7DD] bg-[#FAF8F5] flex items-center justify-between">
          <h2 className="font-serif-heading text-sm font-bold text-[#1C241E] flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#A45D25]" />
            <span>Pending Staff Invitations ({invitations.length})</span>
          </h2>
        </div>

        {invitations.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6E7570]">
            No outstanding invitations. All curators are onboarded.
          </div>
        ) : (
          <div className="divide-y divide-[#EDE7DD]">
            {invitations.map((inv) => {
              const inviteLink = `${window.location.origin}/accept-invitation?token=${inv.token}`;
              return (
                <div
                  key={inv.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#FAF8F5]"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#1C241E]">
                        {inv.name || "Invited Curator"}
                      </span>
                      <span className="px-1.5 py-0.2 bg-[#EDE7DD] text-[#566158] text-[9px] font-bold uppercase rounded-xs">
                        {inv.role}
                      </span>
                    </div>
                    <div className="text-[11px] font-mono-acc text-[#6E7570]">{inv.email}</div>
                    <div className="text-[10px] text-[#8E9990]">
                      Invited on {new Date(inv.createdAt).toLocaleDateString()} • Status: {inv.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => copyToClipboard(inviteLink)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C7BEB1] rounded-sm text-[11px] font-semibold text-[#1C241E] hover:bg-white transition-colors"
                      title="Copy invitation link"
                    >
                      <Copy className="w-3.5 h-3.5 text-[#47663B]" />
                      <span>Copy Link</span>
                    </button>

                    <button
                      onClick={() => handleRevokeInvite(inv.id)}
                      className="px-3 py-1.5 text-[11px] font-semibold text-[#566158] hover:bg-[#EAE5DE] hover:text-[#1C241E] border border-[#C7BEB1] rounded-sm transition-colors"
                      title="Revoke this invitation"
                    >
                      Revoke
                    </button>

                    <button
                      onClick={() => setInviteToCancel(inv)}
                      className="px-3 py-1.5 text-[11px] font-semibold text-[#8F2D14] hover:bg-[#FDF2F2] border border-[#F5C6C6] rounded-sm transition-colors"
                      title="Cancel and permanently delete invitation"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E0D9CE] rounded-sm shadow-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE7DD] pb-3">
              <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-[#1F4529]" />
                <span>Invite Archival Curator</span>
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-[#6E7570] hover:text-[#1C241E] text-xs font-bold"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] rounded-sm flex items-center gap-2 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {generatedInviteLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] rounded-sm space-y-2 text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-[#1F4529]" />
                    <span>Invitation Created</span>
                  </div>
                  <p className="text-[11px] text-[#2D5A3D]">
                    Share this unique onboarding link with the curator. The link expires in 7 days.
                  </p>
                  <div className="p-2 bg-white border border-[#C5DDCB] rounded-xs font-mono-acc text-[10px] break-all text-[#1C241E]">
                    {generatedInviteLink}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => copyToClipboard(generatedInviteLink)}
                    className="flex-1 py-2 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 shadow-xs"
                  >
                    {copiedLink ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedLink ? "Copied to Clipboard" : "Copy Invite Link"}</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowInviteModal(false);
                      setGeneratedInviteLink(null);
                    }}
                    className="px-4 py-2 border border-[#C7BEB1] text-[#4A554D] hover:bg-[#F3EFEA] text-xs font-semibold uppercase tracking-wider rounded-sm"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
                    Curator Full Name <span className="text-[#8F2D14]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Dr. Arthur Cronquist"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
                    Institutional Email Address <span className="text-[#8F2D14]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="admin@gb-herbarium.org"
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
                    Permission Tier
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]"
                  >
                    <option value="curator">Curator / Taxonomist (Record Management)</option>
                    <option value="superadmin">Superadministrator (Full Governance & Logs)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#EDE7DD]">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-[#566158] hover:bg-[#EAE5DE] rounded-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingInvite}
                    className="px-5 py-2 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
                  >
                    {isSubmittingInvite ? "Generating..." : "Create Invitation Link"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Toggle User Modal */}
      <ConfirmModal
        isOpen={!!userToToggle}
        title={`${userToToggle?.status === "active" ? "Deactivate" : "Activate"} Curator?`}
        message={`Are you sure you want to ${
          userToToggle?.status === "active" ? "deactivate" : "reactivate"
        } ${userToToggle?.name} (${userToToggle?.email})?`}
        confirmLabel={userToToggle?.status === "active" ? "Deactivate Curator" : "Activate Curator"}
        cancelLabel="Cancel"
        isDestructive={userToToggle?.status === "active"}
        isLoading={isTogglingUser}
        onConfirm={handleToggleUserStatus}
        onCancel={() => setUserToToggle(null)}
      />

      {/* Remove Staff Member Confirmation Modal */}
      <ConfirmModal
        isOpen={!!userToDelete}
        title="Permanently Remove Staff Member?"
        message={`Are you sure you want to permanently remove ${userToDelete?.name} (${userToDelete?.email}) from the staff directory? This will permanently delete their account and immediately revoke all administrative access and sessions.`}
        confirmLabel="Remove Staff"
        cancelLabel="Keep Account"
        isDestructive={true}
        isLoading={isDeletingUser}
        onConfirm={handleConfirmDeleteUser}
        onCancel={() => setUserToDelete(null)}
      />

      {/* Cancel Invitation Confirmation Modal */}
      <ConfirmModal
        isOpen={!!inviteToCancel}
        title="Cancel Staff Invitation?"
        message={`Are you sure you want to permanently cancel and delete the pending invitation for ${
          inviteToCancel?.name || inviteToCancel?.email
        }? The invitation link will be invalidated immediately and removed from the system.`}
        confirmLabel="Cancel Invitation"
        cancelLabel="Keep Invitation"
        isDestructive={true}
        isLoading={isCancellingInvite}
        onConfirm={handleConfirmCancelInvite}
        onCancel={() => setInviteToCancel(null)}
      />
    </div>
  );
};

export { AdminTeamPage };
