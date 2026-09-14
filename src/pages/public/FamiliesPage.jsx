import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faPagelines } from "@fortawesome/free-brands-svg-icons";
import { api } from "../../services/api.js";
import { ScrollReveal } from "../../components/common/ScrollReveal.jsx";

const FamiliesPage = ({ onNavigate }) => {
  const [families, setFamilies] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    api.getPublicStats().then((res) => {
      setFamilies(res.families || []);
      setIsLoading(false);
    }).catch((err) => {
      console.error(err);
      setIsLoading(false);
    });
  }, []);
  const filtered = families.filter(
    (f) => f.family.toLowerCase().includes(filter.toLowerCase().trim())
  );
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-w-0">
      <div className="space-y-2">
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B] animate-fade-in">
          Systematic Taxonomy
        </div>
        <h1 className="font-serif-heading text-3xl sm:text-4xl font-bold text-[#1C241E] animate-heading-enter">
          Botanical Family Index
        </h1>
        <p className="text-sm text-[#566158] mt-1 max-w-2xl leading-relaxed animate-desc-enter">
          Browse digitized herbarium vouchers organized by taxonomic family under the Angiosperm Phylogeny Group (APG IV) and gymnosperm systematics.
        </p>
      </div>

      {/* Filter search */}
      <div className="max-w-md bg-white border border-[#E0D9CE] rounded-sm p-2 flex items-center gap-2 shadow-xs transition-colors focus-within:border-[#1F4529]">
        <FontAwesomeIcon icon={faMagnifyingGlass} className="w-3.5 h-3.5 text-[#6E7570] ml-2 shrink-0" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter families (e.g. Pinaceae, Asteraceae)..."
          className="w-full text-xs sm:text-sm text-[#1C241E] focus:outline-hidden"
        />
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div key={n} className="h-32 bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-5 flex flex-col justify-between overflow-hidden relative">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xs skeleton-shimmer" />
                <div className="w-20 h-5 rounded-xs skeleton-shimmer" />
              </div>
              <div className="w-32 h-6 rounded-xs skeleton-shimmer mt-2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 text-center text-sm text-[#6E7570]">
          No botanical families match your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((item, idx) => (
            <ScrollReveal key={item.family} delay={Math.min(idx * 30, 250)}>
              <button
                onClick={() => onNavigate(`/search?family=${encodeURIComponent(item.family)}`)}
                className="w-full bg-white border border-[#E0D9CE] hover:border-[#1F4529] hover:bg-[#FAF8F5] p-5 rounded-sm text-left transition-all duration-300 ease-out group flex flex-col justify-between h-32 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="w-8 h-8 rounded-xs bg-[#EBF3ED] text-[#1F4529] group-hover:bg-[#1F4529] group-hover:text-[#FAF8F5] flex items-center justify-center transition-colors duration-200">
                    <FontAwesomeIcon icon={faPagelines} className="w-3.5 h-3.5 group-hover:!text-[#FAF8F5] transition-colors duration-200" />
                  </div>
                  <span className="font-mono-acc text-xs bg-[#FAF8F5] px-2 py-0.5 border border-[#EDE7DD] rounded-xs text-[#566158]">
                    {item.count} {item.count === 1 ? "specimen" : "specimens"}
                  </span>
                </div>

                <div className="flex items-center justify-between mt-2 w-full">
                  <span className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors">
                    {item.family}
                  </span>
                  <FontAwesomeIcon icon={faArrowRight} className="w-3.5 h-3.5 text-[#8E9990] group-hover:text-[#1F4529] group-hover:translate-x-1.5 transition-all duration-200" />
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>
      )}
    </div>;
};
export {
  FamiliesPage
};
