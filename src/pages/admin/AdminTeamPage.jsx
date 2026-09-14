import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faUsers,
  faUserPlus,
  faShieldHalved,
  faCopy,
  faCheck,
  faClock,
  faCircleExclamation,
  faCircleCheck,
  faRotate,
  faEnvelope
} from "@fortawesome/free-solid-svg-icons";
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
  const [nameError, setNameError] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [pageError, setPageError] = useState(null);
  const [resendingInviteId, setResendingInviteId] = useState(null);
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
    const trimmedName = inviteName.trim();
    const trimmedEmail = inviteEmail.trim().toLowerCase();
    setNameError(null);
    setEmailError(null);
    setErrorMsg(null);
    setSuccessMsg(null);

    let hasValidationError = false;
    if (!trimmedName) {
      setNameError("Name is required.");
      hasValidationError = true;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setEmailError("Please enter a valid email address.");
      hasValidationError = true;
    }
    const existingDuplicate = users.find((u) => u.email.toLowerCase() === trimmedEmail);
    if (existingDuplicate) {
      setEmailError("This email is already registered.");
      hasValidationError = true;
    }
    if (hasValidationError) return;

    setIsSubmittingInvite(true);
    try {
      const res = await api.inviteColleague({
        email: trimmedEmail,
        name: trimmedName,
        role: inviteRole
      });
      const inviteUrl = res.inviteLink || `${window.location.origin}/accept-invitation?token=${res.invitation.token}`;
      setGeneratedInviteLink(inviteUrl);
      if (res.emailSent) {
        setSuccessMsg("Invitation email sent successfully.");
      } else {
        setPageError("Admin invitation created, but the invitation email could not be sent.");
      }
      fetchTeam(false);
    } catch (err) {
      if (err.status === 409 || err.message?.includes("already registered") || err.message?.includes("already exists")) {
        setEmailError("This email is already registered.");
      } else if (err.message?.includes("valid email")) {
        setEmailError("Please enter a valid email address.");
      } else {
        setErrorMsg(err.message || "Unable to create Admin. Please try again.");
      }
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleResendInvite = async (inv) => {
    if (!inv || resendingInviteId) return;
    setResendingInviteId(inv.id);
    setPageError(null);
    setSuccessMsg(null);
    try {
      const res = await api.resendInvitation(inv.id);
      setSuccessMsg(res.message || `Invitation email resent successfully to ${inv.email}.`);
      fetchTeam(false);
    } catch (err) {
      console.error("Failed to resend invitation:", err);
      setPageError(err.message || "Failed to resend invitation email.");
      fetchTeam(false);
    } finally {
      setResendingInviteId(null);
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
        <FontAwesomeIcon icon={faShieldHalved} className="w-8 h-8 text-[#8F2D14] mx-auto" />
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
            Admin Management
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
            Admin Management
          </h1>
          <p className="text-xs text-[#566158]">
            Manage administrators who can access GB Herbarium.
          </p>
        </div>

        <button
          onClick={() => {
            setGeneratedInviteLink(null);
            setInviteEmail("");
            setInviteName("");
            setInviteRole("curator");
            setNameError(null);
            setEmailError(null);
            setErrorMsg(null);
            setShowInviteModal(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs self-start sm:self-auto"
        >
          <FontAwesomeIcon icon={faUserPlus} className="w-3.5 h-3.5" />
          <span>+ Add Admin</span>
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
            <FontAwesomeIcon icon={faCircleCheck} className="w-4 h-4 text-[#1F4529] shrink-0" />
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
            <FontAwesomeIcon icon={faUsers} className="w-3.5 h-3.5 text-[#2D5A3D]" />
            <span>Active Administrators ({users.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#E0D9CE] text-[#566158] uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
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
                          {u.role === "superadmin" ? "SUPER ADMIN" : "ADMIN"}
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
            <FontAwesomeIcon icon={faClock} className="w-3.5 h-3.5 text-[#A45D25]" />
            <span>Pending Administrator Invitations ({invitations.length})</span>
          </h2>
        </div>

        {invitations.length === 0 ? (
          <div className="p-6 text-center text-xs text-[#6E7570]">
            No outstanding invitations. All administrators are onboarded.
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
                        {inv.name || "Invited Admin"}
                      </span>
                      <span
                        className={`px-1.5 py-0.2 text-[9px] font-bold uppercase rounded-xs ${
                          inv.role === "superadmin"
                            ? "bg-[#1F4529] text-white"
                            : "bg-[#EDE7DD] text-[#566158]"
                        }`}
                      >
                        {inv.role === "superadmin" ? "SUPER ADMIN" : "ADMIN"}
                      </span>
                      {inv.emailDeliveryStatus === "failed" ? (
                        <span className="px-1.5 py-0.2 bg-[#FDF2F2] text-[#8F2D14] text-[9px] font-bold uppercase rounded-xs">
                          Email Failed
                        </span>
                      ) : inv.emailDeliveryStatus === "sent" ? (
                        <span className="px-1.5 py-0.2 bg-[#EBF3ED] text-[#1F4529] text-[9px] font-bold uppercase rounded-xs">
                          Delivered
                        </span>
                      ) : (
                        <span className="px-1.5 py-0.2 bg-[#FAF8F5] border border-[#EDE7DD] text-[#566158] text-[9px] font-bold uppercase rounded-xs">
                          Invited
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] font-mono-acc text-[#6E7570]">{inv.email}</div>
                    <div className="text-[10px] text-[#8E9990]">
                      Invited on {new Date(inv.createdAt).toLocaleDateString()} • Status: {inv.status === "pending" ? "Invited" : inv.status}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleResendInvite(inv)}
                      disabled={resendingInviteId === inv.id}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#1F4529] bg-[#FAF8F5] hover:bg-[#EBF3ED] text-[#1F4529] rounded-sm text-[11px] font-semibold transition-colors disabled:opacity-50"
                      title="Resend invitation email"
                    >
                      <FontAwesomeIcon
                        icon={faRotate}
                        className={`w-3 h-3 ${resendingInviteId === inv.id ? "animate-spin" : ""}`}
                      />
                      <span>{resendingInviteId === inv.id ? "Resending..." : "Resend"}</span>
                    </button>

                    <button
                      onClick={() => copyToClipboard(inviteLink)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#C7BEB1] rounded-sm text-[11px] font-semibold text-[#1C241E] hover:bg-white transition-colors"
                      title="Copy invitation link"
                    >
                      <FontAwesomeIcon icon={faCopy} className="w-3 h-3 text-[#47663B]" />
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

      {/* Add Admin Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-[#E0D9CE] rounded-sm shadow-xl max-w-md w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EDE7DD] pb-3">
              <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] flex items-center gap-2">
                <FontAwesomeIcon icon={faUserPlus} className="w-4 h-4 text-[#1F4529]" />
                <span>Add Admin</span>
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
                <FontAwesomeIcon icon={faCircleExclamation} className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {generatedInviteLink ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] rounded-sm space-y-2 text-xs">
                  <div className="font-bold flex items-center gap-1.5">
                    <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5 text-[#1F4529]" />
                    <span>Invitation Created</span>
                  </div>
                  <p className="text-[11px] text-[#2D5A3D]">
                    Share this unique onboarding link with the admin. The link expires in 7 days.
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
                    {copiedLink ? <FontAwesomeIcon icon={faCheck} className="w-3.5 h-3.5" /> : <FontAwesomeIcon icon={faCopy} className="w-3.5 h-3.5" />}
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
                    Full Name <span className="text-[#8F2D14]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={inviteName}
                    onChange={(e) => {
                      setInviteName(e.target.value);
                      if (nameError) setNameError(null);
                    }}
                    placeholder="e.g. Dr. Arthur Cronquist"
                    className={`w-full px-3 py-2 text-xs bg-[#FAF8F5] border rounded-sm focus:ring-1 focus:ring-[#1F4529] ${
                      nameError ? "border-[#8F2D14]" : "border-[#C7BEB1]"
                    }`}
                  />
                  {nameError && (
                    <p className="text-[11px] text-[#8F2D14]">{nameError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
                    Email <span className="text-[#8F2D14]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => {
                      setInviteEmail(e.target.value);
                      if (emailError) setEmailError(null);
                    }}
                    placeholder="admin@gb-herbarium.org"
                    className={`w-full px-3 py-2 text-xs bg-[#FAF8F5] border rounded-sm focus:ring-1 focus:ring-[#1F4529] ${
                      emailError ? "border-[#8F2D14]" : "border-[#C7BEB1]"
                    }`}
                  />
                  {emailError && (
                    <p className="text-[11px] text-[#8F2D14]">{emailError}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
                    Administrative Role <span className="text-[#8F2D14]">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label
                      className={`flex flex-col p-3 border rounded-sm cursor-pointer transition-all ${
                        inviteRole === "curator"
                          ? "border-[#1F4529] bg-[#FAFBF9] ring-1 ring-[#1F4529]"
                          : "border-[#C7BEB1] bg-white hover:border-[#8E9990]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1C241E] text-xs">Admin</span>
                        <input
                          type="radio"
                          name="inviteRole"
                          value="curator"
                          checked={inviteRole === "curator"}
                          onChange={() => setInviteRole("curator")}
                          className="text-[#1F4529] focus:ring-[#1F4529]"
                        />
                      </div>
                      <span className="text-[11px] text-[#566158] leading-snug">
                        Can manage, edit, catalog, and publish botanical specimens.
                      </span>
                    </label>

                    <label
                      className={`flex flex-col p-3 border rounded-sm cursor-pointer transition-all ${
                        inviteRole === "superadmin"
                          ? "border-[#1F4529] bg-[#FAFBF9] ring-1 ring-[#1F4529]"
                          : "border-[#C7BEB1] bg-white hover:border-[#8E9990]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-[#1C241E] text-xs flex items-center gap-1.5">
                          <FontAwesomeIcon icon={faShieldHalved} className="w-3 h-3 text-[#1F4529]" />
                          <span>Super Admin</span>
                        </span>
                        <input
                          type="radio"
                          name="inviteRole"
                          value="superadmin"
                          checked={inviteRole === "superadmin"}
                          onChange={() => setInviteRole("superadmin")}
                          className="text-[#1F4529] focus:ring-[#1F4529]"
                        />
                      </div>
                      <span className="text-[11px] text-[#566158] leading-snug">
                        Full control: can invite and manage administrators and view audit logs.
                      </span>
                    </label>
                  </div>
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
                    {isSubmittingInvite ? "Creating Admin..." : "Add Admin"}
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
