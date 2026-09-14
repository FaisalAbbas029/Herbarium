import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBookOpen, faClipboardCheck } from "@fortawesome/free-solid-svg-icons";
import { ScrollReveal } from "../../components/common/ScrollReveal.jsx";

import saqibAliImg from "../../assets/Saqib Ali.jpeg";
import faisalAbbasImg from "../../assets/Faisal Abbas.jpg";
import heeraFatimaImg from "../../assets/Heera Fatima.jpg";
import reefaZehraImg from "../../assets/Reefa Zehra.jpg";
import samreenZehraImg from "../../assets/Samreen Zehra.jpeg";
import tasleemZehraImg from "../../assets/Tasleem Zehra.jpeg";
import tehsenaBatoolImg from "../../assets/Tehsena Batool.jpeg";
import zehraSherImg from "../../assets/Zehra Sher.jpeg";

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

          {/* Saqib Ali */}
          <ScrollReveal delay={80}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={saqibAliImg}
                  alt="Saqib Ali"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Saqib Ali
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Curatorial Supervisor &amp; Field Botanist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Supervises curatorial operations, field taxonomy expeditions, and the systematic collection of flora across Gilgit-Baltistan and surrounding alpine regions.
              </p>
            </div>
          </ScrollReveal>

          {/* Faisal Abbas */}
          <ScrollReveal delay={160}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={faisalAbbasImg}
                  alt="Faisal Abbas"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Faisal Abbas
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Lead Curator &amp; Archive Administrator
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Oversees archival administration, systematic botanical classification, digitisation infrastructure, and institutional research collaborations.
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
          {/* Heera Fatima */}
          <ScrollReveal delay={0}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={heeraFatimaImg}
                  alt="Heera Fatima"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Heera Fatima
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Plant Systematist &amp; Biodiversity Researcher
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Specializes in alpine vascular plant taxonomy, phytogeographic mapping, and biodiversity assessment across northern high-elevation ecosystems.
              </p>
            </div>
          </ScrollReveal>

          {/* Reefa Zehra */}
          <ScrollReveal delay={60}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={reefaZehraImg}
                  alt="Reefa Zehra"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Reefa Zehra
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Herbarium Collections Specialist &amp; Taxonomist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Focuses on systematic voucher preparation, morphological characterization, and diagnostic taxonomy for regional botanical archives.
              </p>
            </div>
          </ScrollReveal>

          {/* Samreen Zehra */}
          <ScrollReveal delay={120}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={samreenZehraImg}
                  alt="Samreen Zehra"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Samreen Zehra
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Ethnobotanist &amp; Medicinal Plant Researcher
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Researches ethnobotanical folk traditions, medicinal plant properties, and conservation strategies for vulnerable mountain species.
              </p>
            </div>
          </ScrollReveal>

          {/* Tasleem Zehra */}
          <ScrollReveal delay={180}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={tasleemZehraImg}
                  alt="Tasleem Zehra"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Tasleem Zehra
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Cryptogamic Botanist &amp; Alpine Flora Specialist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Specializes in mosses, liverworts, lichens, and cryptogamic flora across alpine screes and glacial valley habitats.
              </p>
            </div>
          </ScrollReveal>

          {/* Tehsena Batool */}
          <ScrollReveal delay={240}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={tehsenaBatoolImg}
                  alt="Tehsena Batool"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Tehsena Batool
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Herbarium Collections Manager &amp; Conservationist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Oversees archival mounting standards, specimen preservation, cryogenic pest control, and long-term herbarium repository integrity.
              </p>
            </div>
          </ScrollReveal>

          {/* Zehra Sher */}
          <ScrollReveal delay={300}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src={zehraSherImg}
                  alt="Zehra Sher"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Zehra Sher
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Digital Archivist &amp; Botanical Data Specialist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Directs high-resolution gigapixel voucher digitization, biodiversity informatics database management, and open-access data pipelines.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Naila Abbas */}
          <ScrollReveal delay={360}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Naila Abbas"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Naila Abbas
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Field Collections Coordinator &amp; Flora Surveyor
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Plant Ecology. Coordinates field collections, habitat surveys, voucher preparation, and georeferenced sampling across the western Himalaya.
              </p>
            </div>
          </ScrollReveal>

          {/* Dr. Omar Shah */}
          <ScrollReveal delay={420}>
            <div className="group bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#2D5A3D] h-full">
              <div className="w-20 h-20 rounded-full overflow-hidden border border-[#E0D9CE] transition-colors duration-300 group-hover:border-[#47663B]">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=300&q=80"
                  alt="Dr. Omar Shah"
                  className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-108"
                />
              </div>
              <div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                  Dr. Omar Shah
                </h3>
                <p className="text-xs uppercase font-semibold text-[#47663B]">
                  Lichenologist &amp; Conservation Geneticist
                </p>
              </div>
              <p className="text-xs text-[#566158] leading-relaxed">
                Ph.D. in Conservation Genetics. Studies lichen diversity, population structure, and genetic indicators of ecological change in high-altitude habitats.
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
