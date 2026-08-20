import { useState } from "react";
import { Mail, MapPin, Send, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { api } from "../../services/api.js";
const ContactPage = ({ onNavigate }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill out all required contact fields.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await api.submitContact(formData);
      setSuccessMessage(res.message || "Your inquiry has been successfully transmitted.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setErrorMessage(err.message || "Failed to transmit message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="max-w-3xl space-y-3">
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
          Inquiries & Research Loans
        </div>
        <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1C241E]">
          Contact the Curatorial Team
        </h1>
        <p className="text-sm text-[#566158] leading-relaxed">
          For scientific inquiries, specimen loan requests, high-resolution TIFF image permissions, or voucher deposition consultations, please submit the form below or contact our department directly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {
    /* Left 7 Cols: Contact Form */
  }
        <div className="lg:col-span-7 bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
          <h2 className="font-serif-heading text-xl font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-3">
            Send an Archival Inquiry
          </h2>

          {successMessage && <div className="p-4 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] rounded-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5 text-[#2D5A3D]" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">Message Received</p>
                <p className="mt-0.5">{successMessage}</p>
              </div>
            </div>}

          {errorMessage && <div className="p-4 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] rounded-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold">Transmission Error</p>
                <p className="mt-0.5">{errorMessage}</p>
              </div>
            </div>}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block font-semibold uppercase tracking-wider text-[#566158] text-[11px]">
                  Your Full Name <span className="text-[#8F2D14]">*</span>
                </label>
                <input
    type="text"
    required
    value={formData.name}
    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
    placeholder="e.g. Dr. Arthur Holmes"
    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E]"
  />
              </div>

              <div className="space-y-1.5">
                <label className="block font-semibold uppercase tracking-wider text-[#566158] text-[11px]">
                  Institutional Email <span className="text-[#8F2D14]">*</span>
                </label>
                <input
    type="email"
    required
    value={formData.email}
    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
    placeholder="name@university.edu"
    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E]"
  />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold uppercase tracking-wider text-[#566158] text-[11px]">
                Inquiry Subject / Accession Reference
              </label>
              <input
    type="text"
    value={formData.subject}
    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
    placeholder="e.g. Voucher Loan Request: SHB-2024-001 (Ginkgo biloba)"
    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E]"
  />
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold uppercase tracking-wider text-[#566158] text-[11px]">
                Message & Research Context <span className="text-[#8F2D14]">*</span>
              </label>
              <textarea
    required
    rows={5}
    value={formData.message}
    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
    placeholder="Please describe your research scope, requested voucher numbers, or inquiry details..."
    className="w-full px-3.5 py-2.5 bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E] resize-y"
  />
            </div>

            <button
    type="submit"
    disabled={isSubmitting}
    className="w-full sm:w-auto px-6 py-3 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
  >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
              <span>Transmit Botanical Inquiry</span>
            </button>
          </form>
        </div>

        {
    /* Right 5 Cols: Institutional Info */
  }
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-6 space-y-4">
            <h2 className="font-serif-heading text-lg font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-2">
              Herbarium Physical Repository
            </h2>

            <div className="space-y-3.5 text-xs text-[#566158]">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#47663B] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#1C241E] block">Sylva Herbarium (SHB)</strong>
                  <span>Wing C, Institute of Botanical Sciences</span>
                  <br />
                  <span>Reserve Botanical Station, Europe</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-[#47663B] shrink-0" />
                <span>curation@sylva-herbarium.org</span>
              </div>

              <div className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-[#47663B] shrink-0" />
                <span>Reading Room Hours: Mon–Fri, 09:00 – 17:00 CET</span>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 text-xs text-[#566158]">
            <h3 className="font-serif-heading text-sm font-bold text-[#1C241E]">
              Voucher Deposition Requirements
            </h3>
            <p className="leading-relaxed">
              Botanists submitting novel vouchers must provide fertile material (flowers or fruiting bodies), GPS coordinates (WGS84), duplicate field tags, and documentation of land-access permits.
            </p>
          </div>
        </div>
      </div>
    </div>;
};
export {
  ContactPage
};
