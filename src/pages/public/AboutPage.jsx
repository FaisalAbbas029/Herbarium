import { BookOpen, Shield } from "lucide-react";
const AboutPage = ({ onNavigate }) => {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {
    /* Intro Header */
  }
      <div className="max-w-3xl space-y-4">
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
          Institutional Heritage
        </div>
        <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-[#1C241E] leading-tight">
          About the Gilgit-Baltistan Herbarium Archive
        </h1>
        <p className="text-base sm:text-lg text-[#566158] leading-relaxed">
          Founded as a center of systematic botany and phytogeography, the Gilgit-Baltistan Herbarium Archive houses comprehensive physical and digitized vouchers representing temperate, alpine, and Mediterranean floras.
        </p>
      </div>

      {
    /* Grid: Mission, History & Standards */
  }
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 space-y-4">
          <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
            Our Scientific Mission
          </h2>
          <p className="text-sm text-[#566158] leading-relaxed">
            The mission of the Gilgit-Baltistan Herbarium Archive is to discover, document, preserve, and interpret plant biodiversity for research, conservation biology, education, and pharmaceutical science. Our open digital repository provides researchers globally with open access to high-fidelity anatomical imagery and verified collection metadata.
          </p>
        </div>

        <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 space-y-4">
          <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
            <Shield className="w-5 h-5" />
          </div>
          <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
            Curation & Taxonomic Standards
          </h2>
          <p className="text-sm text-[#566158] leading-relaxed">
            All physical voucher sheets are mounted on neutral-pH, 100% cotton archival herbarium cardstock in accordance with the International Code of Nomenclature for algae, fungi, and plants (Shenzhen Code). Digital representations adhere strictly to Darwin Core (DwC) and Taxonomic Databases Working Group (TDWG) schema.
          </p>
        </div>
      </div>

      {
    /* Curatorial Staff & Research Board */
  }
      <div className="space-y-6">
        <div className="border-b border-[#E0D9CE] pb-3">
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
            Curatorial Leadership & Research Staff
          </h2>
          <p className="text-xs text-[#6E7570] mt-1">
            Our permanent academic faculty and herbarium management team.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE]">
              <img
    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
    alt="Dr. Eleanor Vance"
    className="w-full h-full object-cover"
  />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-[#1C241E]">
                Dr. Eleanor Vance
              </h3>
              <p className="text-xs uppercase font-semibold text-[#47663B]">
                Senior Curator & Cryptogamic Specialist
              </p>
            </div>
            <p className="text-xs text-[#566158] leading-relaxed">
              Ph.D. in Plant Systematics, Cambridge. Specializes in gymnosperm evolutionary morphology, relict Ginkgoales, and endangered montane pteridophytes.
            </p>
          </div>

          <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE]">
              <img
    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
    alt="Dr. Aarav Patel"
    className="w-full h-full object-cover"
  />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-[#1C241E]">
                Dr. Aarav Patel
              </h3>
              <p className="text-xs uppercase font-semibold text-[#47663B]">
                Field Taxonomist & Pharmacognosist
              </p>
            </div>
            <p className="text-xs text-[#566158] leading-relaxed">
              Ph.D. in Pharmacognosy & Ethnobotany. Leads field expeditions across the Alps, Carpathians, and Mediterranean basin investigating secondary metabolite biosynthesis.
            </p>
          </div>

          <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE]">
              <img
    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
    alt="Sarah Lindqvist"
    className="w-full h-full object-cover"
  />
            </div>
            <div>
              <h3 className="font-serif-heading text-lg font-bold text-[#1C241E]">
                Sarah Lindqvist
              </h3>
              <p className="text-xs uppercase font-semibold text-[#47663B]">
                Head of Physical Collections & Digitization
              </p>
            </div>
            <p className="text-xs text-[#566158] leading-relaxed">
              M.Sc. in Museum Conservation. Oversees environmental vault control (18°C, 45% RH), cryogenic pest quarantine, and gigapixel voucher imaging pipelines.
            </p>
          </div>
        </div>
      </div>

      {
    /* Institutional Loan & Consultation Policy */
  }
      <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-8 space-y-4">
        <h2 className="font-serif-heading text-xl font-bold text-[#1C241E]">
          Specimen Loans & Destructive Sampling Protocol
        </h2>
        <p className="text-xs sm:text-sm text-[#566158] leading-relaxed">
          Physical specimen loans are made exclusively to recognized botanical and academic institutions listed in <em>Index Herbariorum</em>. Destructive sampling (e.g., DNA extraction, leaf clearing for venation analysis, or palynological study) requires prior written authorization from the Senior Curator.
        </p>
        <button
    onClick={() => onNavigate("/contact")}
    className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#1F4529] hover:underline"
  >
          <span>Submit a Formal Loan Inquiry →</span>
        </button>
      </div>
    </div>;
};
export {
  AboutPage
};
