import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faArrowRight,
  faBookOpen,
  faFileImage,
  faClipboardCheck
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../services/api.js";
import { SpecimenCard } from "../../components/common/SpecimenCard.jsx";
import { ScrollReveal } from "../../components/common/ScrollReveal.jsx";
import { AnimatedCounter } from "../../components/common/AnimatedCounter.jsx";
const HomePage = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [featuredSpecimens, setFeaturedSpecimens] = useState([]);
  const [recentSpecimens, setRecentSpecimens] = useState([]);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const searchContainerRef = useRef(null);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [specimensRes, statsRes] = await Promise.all([
          api.searchSpecimens({ limit: 8, sortBy: "updated-desc" }),
          api.getPublicStats()
        ]);
        const all = specimensRes.data;
        setFeaturedSpecimens(all.slice(0, 4));
        setRecentSpecimens(all.slice(0, 6));
        setStats(statsRes);
      } catch (err) {
        console.error("Failed to load homepage data:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.getSuggestions(searchQuery);
        setSuggestions(res.suggestions);
      } catch (e) {
        console.error(e);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate("/search");
    }
  };
  const handleSelectSuggestion = (s) => {
    setShowSuggestions(false);
    if (s.type === "family") {
      const familyName = s.title.replace(" (Family)", "");
      onNavigate(`/search?family=${encodeURIComponent(familyName)}`);
    } else {
      onNavigate(`/specimen/${s.id}`);
    }
  };
  return <div className="space-y-16 pb-12">
      {
    /* 1. Hero Section */
  }
      <section className="relative bg-[#18261D] text-[#FAF8F5] pt-16 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {
    /* Background botanical subtle pattern */
  }
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#FAF8F5_1px,transparent_1px)] [background-size:24px_24px]" />

        <div className="max-w-5xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#2D5A3D]/60 border border-[#3E7050] text-[#D8E6DC] text-xs font-semibold uppercase tracking-widest max-w-full animate-fade-in">
            <FontAwesomeIcon icon={faBookOpen} className="w-3.5 h-3.5 shrink-0" />
            <span className="text-center leading-snug">Digital Herbarium Repository &amp; Taxonomic Archive</span>
          </div>

          <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-tight animate-heading-enter">
            Preserving Earth’s Botanical Heritage for Scientific Discovery
          </h1>

          <p className="text-base sm:text-lg text-[#C5D4C9] max-w-3xl mx-auto font-normal leading-relaxed animate-desc-enter">
            Access cataloged vascular plant vouchers, morphological descriptions, high-resolution micrographs, and verified collection data curated under international botanical standards.
          </p>

          {/* Prominent Search Bar */}
          <div ref={searchContainerRef} className="max-w-2xl mx-auto mt-8 relative animate-fade-in">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative flex-1">
                <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6E7570]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search by scientific name, family, common name, or accession # (e.g., Ginkgo, SHB-2024-001)..."
                  className="w-full pl-12 pr-4 py-4 rounded-sm bg-white text-[#1C241E] placeholder:text-[#7E8C81] text-sm sm:text-base border border-[#E0D9CE] focus:outline-hidden focus:ring-2 focus:ring-[#5A9E72] shadow-lg transition-shadow duration-200"
                />
              </div>
              <button
                type="submit"
                className="group ml-2 px-4 sm:px-6 py-4 bg-[#2D5A3D] hover:bg-[#22452E] text-white text-sm font-semibold uppercase tracking-wider rounded-sm transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2 whitespace-nowrap shrink-0 hover:-translate-y-0.5"
              >
                <span className="hidden sm:inline">Search</span>
                <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
              </button>
            </form>

            {/* Live Autocomplete Dropdown */}
            {showSuggestions && suggestions.length > 0 && <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-sm border border-[#E0D9CE] shadow-2xl text-left z-30 overflow-hidden animate-nav-drop">
                <div className="px-3 py-1.5 bg-[#F3EFEA] border-b border-[#E0D9CE] text-[11px] font-semibold uppercase tracking-wider text-[#6E7570]">
                  Taxonomic Suggestions
                </div>
                <div className="divide-y divide-[#EDE7DD] max-h-64 overflow-y-auto">
                  {suggestions.map((s, idx) => <button
    key={idx}
    onClick={() => handleSelectSuggestion(s)}
    className="w-full px-4 py-2.5 hover:bg-[#F3EFEA] flex items-center justify-between text-left transition-colors group"
  >
                      <div>
                        <span className="text-sm font-medium text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                          {s.type === "scientific" ? <span className="italic font-serif-heading font-semibold">{s.title}</span> : s.title}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-acc uppercase px-2 py-0.5 rounded-xs bg-[#EAE5DE] text-[#566158]">
                        {s.type}
                      </span>
                    </button>)}
                </div>
              </div>}

            {/* Quick Filter Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-xs text-[#A4B3A8]">
              <span className="text-[#8A9B8F]">Quick explorations:</span>
              <button
                onClick={() => onNavigate("/search?family=Ginkgoaceae")}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#D8E6DC] rounded-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                Ginkgoaceae
              </button>
              <button
                onClick={() => onNavigate("/search?family=Pinaceae")}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#D8E6DC] rounded-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                Pinaceae
              </button>
              <button
                onClick={() => onNavigate("/search?family=Asteraceae")}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-[#D8E6DC] rounded-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                Asteraceae
              </button>
              <button
                onClick={() => onNavigate("/search?conservationStatus=Vulnerable")}
                className="px-2.5 py-1 bg-[#A45D25]/40 hover:bg-[#A45D25]/60 text-white rounded-xs transition-all duration-200 hover:-translate-y-0.5"
              >
                Vulnerable Taxa
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Scientific Metrics Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <ScrollReveal>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white border border-[#E0D9CE] rounded-sm p-6 shadow-sm">
            <div className="text-center p-3 md:border-r md:last:border-r-0 border-[#EDE7DD]">
              <div className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1F4529]">
                <AnimatedCounter value={stats?.totalPublished || 12} />
              </div>
              <div className="text-xs uppercase font-semibold tracking-wider text-[#6E7570] mt-1">
                Cataloged Specimen Vouchers
              </div>
            </div>
            <div className="text-center p-3 md:border-r md:last:border-r-0 border-[#EDE7DD]">
              <div className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1F4529]">
                <AnimatedCounter value={stats?.totalFamilies || 8} />
              </div>
              <div className="text-xs uppercase font-semibold tracking-wider text-[#6E7570] mt-1">
                Botanical Families
              </div>
            </div>
            <div className="text-center p-3 md:border-r md:last:border-r-0 border-[#EDE7DD]">
              <div className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1F4529]">
                <AnimatedCounter value={stats?.totalGenera || 10} />
              </div>
              <div className="text-xs uppercase font-semibold tracking-wider text-[#6E7570] mt-1">
                Documented Genera
              </div>
            </div>
            <div className="text-center p-3">
              <div className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1F4529]">
                <AnimatedCounter value={100} suffix="%" />
              </div>
              <div className="text-xs uppercase font-semibold tracking-wider text-[#6E7570] mt-1">
                Peer-Verified Taxonomy
              </div>
            </div>
          </div>
        </ScrollReveal>
      </section>

      {/* 3. Curated Featured Specimens */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E0D9CE] pb-4">
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-[#47663B] mb-1">
                Curatorial Highlights
              </div>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
                Featured Botanical Vouchers
              </h2>
            </div>
            <button
              onClick={() => onNavigate("/search")}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F4529] hover:text-[#15321D] transition-colors"
            >
              <span>Explore All Records</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </ScrollReveal>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-white rounded-sm border border-[#E0D9CE] overflow-hidden flex flex-col h-80">
                <div className="aspect-4/3 bg-[#F3EFEA] skeleton-shimmer" />
                <div className="p-4 space-y-3 flex-1">
                  <div className="h-3 w-20 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                  <div className="h-5 w-36 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                  <div className="h-3 w-24 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredSpecimens.map((specimen, idx) => (
              <ScrollReveal key={specimen.id} delay={idx * 70}>
                <SpecimenCard
                  specimen={specimen}
                  onClick={() => onNavigate(`/specimen/${specimen.id}`)}
                />
              </ScrollReveal>
            ))}
          </div>
        )}
      </section>

      {/* 4. Herbarium Research Pillars & Preservation Method */}
      <section className="bg-[#F3EFEA] border-y border-[#E0D9CE] py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ScrollReveal>
            <div className="max-w-3xl mb-12">
              <span className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
                Scientific Standard
              </span>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E] mt-1">
                Methodology of Archival Preservation
              </h2>
              <p className="text-sm text-[#566158] mt-2 leading-relaxed">
                Every specimen in the Gilgit-Baltistan Herbarium Archive follows rigorous physical and digital curation protocols to support worldwide botanical, ecological, and pharmacological research.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <ScrollReveal delay={0}>
              <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#47663B] h-full">
                <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
                  <FontAwesomeIcon icon={faBookOpen} className="w-5 h-5" />
                </div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E]">
                  Morphological Vouchering
                </h3>
                <p className="text-xs text-[#566158] leading-relaxed">
                  Specimens are pressed on 100% rag archival cotton mounting boards with water-soluble methylcellulose and linen tape strapping to preserve reproductive and vegetative anatomy indefinitely.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={90}>
              <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#47663B] h-full">
                <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
                  <FontAwesomeIcon icon={faFileImage} className="w-5 h-5" />
                </div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E]">
                  High-Resolution Digitization
                </h3>
                <p className="text-xs text-[#566158] leading-relaxed">
                  Optical micrographic scanning under standardized cross-polarized 5000K illumination ensures color fidelity, sub-millimeter venation clarity, and trichome resolution.
                </p>
              </div>
            </ScrollReveal>

            <ScrollReveal delay={180}>
              <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 space-y-3 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-md hover:border-[#47663B] h-full">
                <div className="w-10 h-10 rounded-sm bg-[#EBF3ED] text-[#1F4529] flex items-center justify-center">
                  <FontAwesomeIcon icon={faClipboardCheck} className="w-5 h-5" />
                </div>
                <h3 className="font-serif-heading text-lg font-bold text-[#1C241E]">
                  Taxonomic Audit Trail
                </h3>
                <p className="text-xs text-[#566158] leading-relaxed">
                  Every annotation, taxonomic revision, and photograph update maintains an immutable administrative audit log verifying provenance and scholarly authorship.
                </p>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 5. Recently Cataloged Records */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <ScrollReveal>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E0D9CE] pb-4">
            <div>
              <div className="text-xs uppercase font-bold tracking-widest text-[#47663B] mb-1">
                Active Archive
              </div>
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
                Recently Updated Specimens
              </h2>
            </div>
            <button
              onClick={() => onNavigate("/search?sortBy=updated-desc")}
              className="group inline-flex items-center gap-1.5 text-sm font-semibold text-[#1F4529] hover:text-[#15321D] transition-colors"
            >
              <span>View Full Chronology</span>
              <FontAwesomeIcon icon={faArrowRight} className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentSpecimens.slice(0, 6).map((specimen, idx) => (
            <ScrollReveal key={specimen.id} delay={idx * 60}>
              <SpecimenCard
                specimen={specimen}
                onClick={() => onNavigate(`/specimen/${specimen.id}`)}
              />
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 6. Call to Action / Research Collaboration Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="bg-[#1F4529] text-white rounded-sm p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
            <div className="space-y-3 max-w-2xl text-center md:text-left">
              <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold">
                Conducting Botanical or Pharmacognosy Research?
              </h2>
              <p className="text-sm text-[#D8E6DC] leading-relaxed">
                The Gilgit-Baltistan Herbarium Archive facilitates digital loan requests, high-resolution TIFF image exports, and DNA-grade tissue sampling permissions for accredited institutions.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
              <button
                onClick={() => onNavigate("/contact")}
                className="px-5 py-3 bg-[#FAF8F5] text-[#1F4529] hover:bg-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-all duration-200 shadow-xs hover:shadow-md hover:-translate-y-0.5 whitespace-nowrap"
              >
                Request Specimen Access
              </button>
              <button
                onClick={() => onNavigate("/about")}
                className="px-5 py-3 bg-transparent border border-white/40 hover:bg-white/10 text-white font-semibold text-xs uppercase tracking-wider rounded-sm transition-all duration-200 hover:-translate-y-0.5 whitespace-nowrap"
              >
                Learn About Archive
              </button>
            </div>
          </div>
        </ScrollReveal>
      </section>
    </div>;
};
export {
  HomePage
};
