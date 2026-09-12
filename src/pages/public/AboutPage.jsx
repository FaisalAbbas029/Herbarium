import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { ScrollReveal } from "../../components/common/ScrollReveal.jsx";

const AboutPage = ({ onNavigate }) => {
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Intro Header */}
      <div className="max-w-3xl space-y-4">
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B] animate-fade-in">
          Institutional Heritage
        </div>
        <h1 className="font-serif-heading text-3xl sm:text-5xl font-bold text-[#1C241E] leading-tight animate-heading-enter">
          About the Gilgit-Baltistan Herbarium Archive
        </h1>
        <p className="text-base sm:text-lg text-[#566158] leading-relaxed animate-desc-enter">
          Founded as a center of systematic botany and phytogeography, the Gilgit-Baltistan Herbarium Archive houses comprehensive physical and digitized vouchers representing temperate, alpine, and Mediterranean floras.
        </p>
      </div>

      {/* Grid: Mission, History & Standards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ScrollReveal delay={0}>
          <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 space-y-4 transition-all duration-300 hover:shadow-md hover:border-[#47663B] h-full">
            <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
              <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5" />
            </div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
              Our Scientific Mission
            </h2>
            <p className="text-sm text-[#566158] leading-relaxed">
              The mission of the Gilgit-Baltistan Herbarium Archive is to discover, document, preserve, and interpret plant biodiversity for research, conservation biology, education, and pharmaceutical science. Our open digital repository provides researchers globally with open access to high-fidelity anatomical imagery and verified collection metadata.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 space-y-4 transition-all duration-300 hover:shadow-md hover:border-[#47663B] h-full">
            <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
              <FontAwesomeIcon icon={faClipboardCheck} className="w-5 h-5" />
            </div>
            <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
              Curation &amp; Taxonomic Standards
            </h2>
            <p className="text-sm text-[#566158] leading-relaxed">
              All physical voucher sheets are mounted on neutral-pH, 100% cotton archival herbarium cardstock in accordance with the International Code of Nomenclature for algae, fungi, and plants (Shenzhen Code). Digital representations adhere strictly to Darwin Core (DwC) and Taxonomic Databases Working Group (TDWG) schema.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* SECTION 1 — Curatorial Leadership & Supervisors */}
      <div className="space-y-6">
        <ScrollReveal>
          <div className="border-b border-[#E0D9CE] pb-3">
            <div className="text-xs uppercase font-bold tracking-widest text-[#47663B] mb-1">
              Senior Leadership
            </div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
              Curatorial Leadership &amp; Supervisors
            </h2>
            <p className="text-xs text-[#6E7570] mt-1">
              Academic leadership, scientific supervision, and institutional oversight.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Dr. Eleanor Vance */}
          <ScrollReveal delay={0}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Eleanor Vance"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Eleanor Vance
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Senior Curator &amp; Cryptogamic Specialist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Plant Systematics, Cambridge. Specializes in gymnosperm evolutionary morphology, relict Ginkgoales, and endangered montane pteridophytes.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Aarav Patel */}
          <ScrollReveal delay={80}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Aarav Patel"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Aarav Patel
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Field Taxonomist &amp; Pharmacognosist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Pharmacognosy &amp; Ethnobotany. Leads field expeditions across the Alps, Carpathians, and Mediterranean basin investigating secondary metabolite biosynthesis.
              </p>
            </div>
          </ScrollReveal>

          {/* Sarah Lindqvist */}
          <ScrollReveal delay={160}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80"
                  alt="Sarah Lindqvist"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Sarah Lindqvist
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Head of Physical Collections &amp; Digitization
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                M.Sc. in Museum Conservation. Oversees environmental vault control (18°C, 45% RH), cryogenic pest quarantine, and gigapixel voucher imaging pipelines.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </div>

      {/* SECTION 2 — Research & Collections Team */}
      <div className="space-y-6">
        <ScrollReveal>
          <div className="border-b border-[#E0D9CE] pb-3">
            <div className="text-xs uppercase font-bold tracking-widest text-[#47663B] mb-1">
              Research Staff
            </div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
              Research &amp; Collections Team
            </h2>
            <p className="text-xs text-[#6E7570] mt-1">
              Researchers, specialists, and collection professionals supporting our botanical research and digital herbarium.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Dr. Maya Rahman */}
          <ScrollReveal delay={0}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Maya Rahman"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Maya Rahman
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Plant Systematist &amp; Biodiversity Researcher
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Plant Systematics. Specializes in alpine plant diversity, vascular plant taxonomy, and biodiversity assessment across high-elevation ecosystems.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Daniel Morgan */}
          <ScrollReveal delay={60}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Daniel Morgan"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Daniel Morgan
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Herbarium Data Scientist &amp; Digital Collections Lead
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Biodiversity Informatics. Develops specimen databases, digital collection standards, data quality workflows, and biodiversity data integration systems.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Laila Hussain */}
          <ScrollReveal delay={120}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Laila Hussain"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Laila Hussain
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Ethnobotanist &amp; Medicinal Plant Researcher
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Ethnobotany. Researches traditional plant knowledge, medicinal flora, and the relationship between local communities and botanical resources.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Thomas Weber */}
          <ScrollReveal delay={180}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Thomas Weber"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Thomas Weber
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Bryologist &amp; Alpine Flora Specialist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Botany. Specializes in mosses, liverworts, alpine ecosystems, and the documentation of cryptogamic diversity in mountainous regions.
              </p>
            </div>
          </ScrollReveal>

          {/* Amina Khan */}
          <ScrollReveal delay={240}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
                  alt="Amina Khan"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Amina Khan
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Herbarium Collections Manager &amp; Conservation Specialist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                M.Sc. in Conservation Biology. Oversees specimen preservation, collection management, archival standards, pest monitoring, and long-term herbarium storage.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Yusuf Karim */}
          <ScrollReveal delay={300}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Yusuf Karim"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Yusuf Karim
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Molecular Botanist &amp; Plant Genomics Researcher
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Plant Molecular Biology. Uses DNA barcoding, molecular systematics, and plant genomics to support accurate identification and evolutionary research.
              </p>
            </div>
          </ScrollReveal>
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
