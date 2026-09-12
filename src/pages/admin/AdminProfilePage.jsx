import { useRef, useState } from "react";
import { Camera, CheckCircle2, Eye, EyeOff, KeyRound, Save, Trash2, UserRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext.jsx";
import { api } from "../../services/api.js";

const AdminProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    institution: user?.institution || "",
    avatarUrl: user?.avatarUrl || ""
  });
  const [passwordData, setPasswordData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState({ current: false, next: false, confirm: false });
  const avatarInputRef = useRef(null);

  const updateField = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage(null);
    setErrorMessage(null);
    setIsUploadingAvatar(true);
    try {
      const result = await api.uploadPhotoFile(file);
      setFormData((current) => ({ ...current, avatarUrl: result.url }));
      setMessage("Profile picture uploaded. Save your profile to keep it.");
    } catch (error) {
      setErrorMessage(error.message || "Unable to upload profile picture.");
    } finally {
      setIsUploadingAvatar(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage(null);
    setErrorMessage(null);
    if (passwordData.newPassword && passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorMessage("New password and confirmation do not match.");
      return;
    }
    setIsSaving(true);
    try {
      const result = await updateProfile({
        ...formData,
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setMessage(`${result.message || "Profile updated successfully."} Sign in next time with ${result.user.email}.`);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      setErrorMessage(error.message || "Unable to update your profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return <div className="space-y-8 max-w-4xl mx-auto pb-16">
    <div className="border-b border-[#E0D9CE] pb-4">
      <p className="text-xs uppercase tracking-widest font-bold text-[#47663B]">Account Settings</p>
      <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E] mt-1">Curator Profile</h1>
      <p className="text-sm text-[#566158] mt-2">Update your profile details and secure your curator account.</p>
    </div>

    {message && <div className="p-4 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] rounded-sm flex items-center gap-2 text-sm">
      <CheckCircle2 className="w-5 h-5 shrink-0" />
      <span>{message}</span>
    </div>}
    {errorMessage && <div className="p-4 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] rounded-sm text-sm">{errorMessage}</div>}

    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-[#EDE7DD] pb-4">
          <UserRound className="w-5 h-5 text-[#2D5A3D]" />
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">Profile Details</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-6 items-start">
          <div className="w-24 h-24 rounded-full bg-[#2D5A3D] text-white flex items-center justify-center overflow-hidden shrink-0">
            {/^(https?:\/\/|\/uploads\/)/i.test(formData.avatarUrl) ? <img src={formData.avatarUrl} alt="Profile preview" className="w-full h-full object-cover" /> : <span className="text-3xl font-bold">{formData.name.charAt(0) || "A"}</span>}
          </div>
          <div className="sm:w-44 space-y-2">
            <input ref={avatarInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff" onChange={handleAvatarUpload} className="hidden" />
            <button type="button" onClick={() => avatarInputRef.current?.click()} disabled={isUploadingAvatar} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-[#1F4529] border border-[#C7BEB1] hover:bg-[#F3EFEA] rounded-sm disabled:opacity-50">
              <Camera className="w-4 h-4" />
              {isUploadingAvatar ? "Uploading..." : "Choose Image"}
            </button>
            {formData.avatarUrl && <button type="button" onClick={() => { setFormData((current) => ({ ...current, avatarUrl: "" })); setErrorMessage(null); }} className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#8F2D14] hover:bg-[#FDF2F2] rounded-sm">
              <Trash2 className="w-3.5 h-3.5" />
              Remove Picture
            </button>}
            <p className="text-[11px] text-[#6E7570] leading-relaxed">JPG, PNG, WebP, GIF, BMP, or TIFF. Maximum 15MB.</p>
          </div>
          <div className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">Full Name</label>
              <input name="name" value={formData.name} onChange={updateField} required className="w-full px-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">Email</label>
              <input type="email" name="email" value={formData.email} onChange={updateField} required className="w-full px-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">Institution</label>
              <input name="institution" value={formData.institution} onChange={updateField} className="w-full px-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]" />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">Profile Picture URL</label>
              <div className="relative">
                <Camera className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7570]" />
                <input name="avatarUrl" value={formData.avatarUrl} onChange={updateField} placeholder="https://example.com/your-photo.jpg" className="w-full pl-9 pr-3 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-5">
        <div className="flex items-center gap-3 border-b border-[#EDE7DD] pb-4">
          <KeyRound className="w-5 h-5 text-[#2D5A3D]" />
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">Change Password</h2>
        </div>
        <p className="text-xs text-[#566158]">Leave these fields empty if you do not want to change your password.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">Current Password</label>
            <div className="relative"><input type={visiblePasswords.current ? "text" : "password"} value={passwordData.currentPassword} onChange={(event) => setPasswordData((current) => ({ ...current, currentPassword: event.target.value }))} className="w-full px-3 pr-10 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm" /><button type="button" onClick={() => setVisiblePasswords((current) => ({ ...current, current: !current.current }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6E7570]" aria-label={visiblePasswords.current ? "Hide current password" : "Show current password"}>{visiblePasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">New Password</label>
            <div className="relative"><input type={visiblePasswords.next ? "text" : "password"} value={passwordData.newPassword} onChange={(event) => setPasswordData((current) => ({ ...current, newPassword: event.target.value }))} minLength={8} className="w-full px-3 pr-10 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm" /><button type="button" onClick={() => setVisiblePasswords((current) => ({ ...current, next: !current.next }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6E7570]" aria-label={visiblePasswords.next ? "Hide new password" : "Show new password"}>{visiblePasswords.next ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158] mb-1.5">Confirm New Password</label>
            <div className="relative"><input type={visiblePasswords.confirm ? "text" : "password"} value={passwordData.confirmPassword} onChange={(event) => setPasswordData((current) => ({ ...current, confirmPassword: event.target.value }))} minLength={8} className="w-full px-3 pr-10 py-2.5 text-sm bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm" /><button type="button" onClick={() => setVisiblePasswords((current) => ({ ...current, confirm: !current.confirm }))} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#6E7570]" aria-label={visiblePasswords.confirm ? "Hide password confirmation" : "Show password confirmation"}>{visiblePasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-50">
          <Save className="w-4 h-4" />
          {isSaving ? "Saving..." : "Save Profile"}
        </button>
      </div>
    </form>
  </div>;
};

export { AdminProfilePage };
