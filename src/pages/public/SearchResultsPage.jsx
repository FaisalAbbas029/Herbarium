import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faXmark,
  faRotateLeft,
  faChevronLeft,
  faChevronRight,
  faChevronDown,
  faSliders,
  faTableCellsLarge,
  faList,
  faArrowDownWideShort
} from "@fortawesome/free-solid-svg-icons";
import { api } from "../../services/api.js";
import { SpecimenCard } from "../../components/common/SpecimenCard.jsx";
import { ConservationBadge } from "../../components/common/ConservationBadge.jsx";
import { SpecimenImage } from "../../components/common/SpecimenImage.jsx";
import { ScrollReveal } from "../../components/common/ScrollReveal.jsx";
const SearchResultsPage = ({
  initialParams,
  onNavigate
}) => {
  const [query, setQuery] = useState(initialParams?.query || "");
  const [family, setFamily] = useState(initialParams?.family || "ALL");
  const [genus, setGenus] = useState(initialParams?.genus || "ALL");
  const [habitat, setHabitat] = useState(initialParams?.habitat || "ALL");
  const [conservationStatus, setConservationStatus] = useState(initialParams?.conservationStatus || "ALL");
  const [region, setRegion] = useState(initialParams?.region || "ALL");
  const [location, setLocation] = useState(initialParams?.location || "");
  const [dateFrom, setDateFrom] = useState(initialParams?.dateFrom || "");
  const [dateTo, setDateTo] = useState(initialParams?.dateTo || "");
  const [sortBy, setSortBy] = useState(
    initialParams?.sortBy || "updated-desc"
  );
  const [page, setPage] = useState(initialParams?.page || 1);
  const [results, setResults] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [availableFamilies, setAvailableFamilies] = useState([]);
  useEffect(() => {
    api.getPublicStats().then((res) => {
      if (res.families) {
        setAvailableFamilies(res.families.map((f) => f.family));
      }
    }).catch(console.error);
  }, []);
  const fetchResults = async () => {
    setIsLoading(true);
    try {
      const res = await api.searchSpecimens({
        query: query.trim() || void 0,
        family: family !== "ALL" ? family : void 0,
        genus: genus !== "ALL" ? genus : void 0,
        habitat: habitat !== "ALL" ? habitat : void 0,
        conservationStatus: conservationStatus !== "ALL" ? conservationStatus : void 0,
        region: region !== "ALL" ? region : void 0,
        location: location.trim() || void 0,
        dateFrom: dateFrom || void 0,
        dateTo: dateTo || void 0,
        sortBy,
        page,
        limit: 12
      });
      setResults(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      console.error("Search query failed:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchResults();
  }, [query, family, genus, habitat, conservationStatus, region, location, dateFrom, dateTo, sortBy, page]);
  const handleClearFilters = () => {
    setQuery("");
    setFamily("ALL");
    setGenus("ALL");
    setHabitat("ALL");
    setConservationStatus("ALL");
    setRegion("ALL");
    setLocation("");
    setDateFrom("");
    setDateTo("");
    setSortBy("updated-desc");
    setPage(1);
  };
  const activeFilterCount = (
    (family !== "ALL" ? 1 : 0) +
    (conservationStatus !== "ALL" ? 1 : 0) +
    (region !== "ALL" ? 1 : 0) +
    (location.trim() ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0)
  );
  const hasActiveFilters = Boolean(query.trim() || activeFilterCount > 0);

  const renderFilterControls = (isMobilePanel = false) => (
    <>
      {/* Botanical Family */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
          Botanical Family
        </label>
        <select
          value={family}
          onChange={(e) => {
            setFamily(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
        >
          <option value="ALL">All Families</option>
          {availableFamilies.map((fam) => (
            <option key={fam} value={fam}>
              {fam}
            </option>
          ))}
        </select>
      </div>

      {/* IUCN Conservation Status */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
          IUCN Conservation Status
        </label>
        <select
          value={conservationStatus}
          onChange={(e) => {
            setConservationStatus(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
        >
          <option value="ALL">All Statuses</option>
          <option value="Least Concern">Least Concern (LC)</option>
          <option value="Near Threatened">Near Threatened (NT)</option>
          <option value="Vulnerable">Vulnerable (VU)</option>
          <option value="Endangered">Endangered (EN)</option>
          <option value="Critically Endangered">Critically Endangered (CR)</option>
          <option value="Extinct in the Wild">Extinct in the Wild (EW)</option>
          <option value="Extinct">Extinct (EX)</option>
          <option value="Data Deficient">Data Deficient (DD)</option>
        </select>
      </div>

      {/* Biogeographic Region */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
          Biogeographic Region
        </label>
        <select
          value={region}
          onChange={(e) => {
            setRegion(e.target.value);
            setPage(1);
          }}
          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
        >
          <option value="ALL">All Global Regions</option>
          <option value="East Asia">East Asia</option>
          <option value="Western Europe">Western Europe</option>
          <option value="Northern Europe & Taiga">Northern Europe & Taiga</option>
          <option value="Mediterranean Basin">Mediterranean Basin</option>
          <option value="European Mountain Ranges">European Mountain Ranges</option>
          <option value="Central & Eastern Europe">Central & Eastern Europe</option>
          <option value="North America">North America</option>
        </select>
      </div>

      {/* Collection Site / Country */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
          Collection Site / Country
        </label>
        <input
          type="text"
          value={location}
          onChange={(e) => {
            setLocation(e.target.value);
            setPage(1);
          }}
          placeholder="Search by country or site..."
          className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
        />
      </div>

      {/* Collection Date Range */}
      <div className={`space-y-1.5 ${isMobilePanel ? "sm:col-span-2" : ""}`}>
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
          Collection Date Range
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="space-y-0.5">
            <span className="block text-[10px] uppercase font-semibold text-[#8E9990]">From</span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-mono-acc focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
            />
          </div>
          <div className="space-y-0.5">
            <span className="block text-[10px] uppercase font-semibold text-[#8E9990]">To</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(1);
              }}
              className="w-full px-2 py-1.5 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-mono-acc focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
            />
          </div>
        </div>
      </div>
    </>
  );

  return <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8 min-w-0">
    {/* Header & Main Search Bar */}
    <div className="space-y-4 min-w-0">
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
          Catalog Index
        </div>
        <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E] break-words">
          Search Herbarium Vouchers
        </h1>
        <p className="text-xs sm:text-sm text-[#566158] mt-1 max-w-3xl leading-relaxed">
          Search through systematically vouchered botanical specimens with morphological descriptors and taxonomic provenance.
        </p>
      </div>

      {/* Search Input Bar & Mobile Filters Button */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-1.5 sm:p-2 flex items-center gap-2 shadow-xs flex-1 min-w-0">
          <FontAwesomeIcon icon={faMagnifyingGlass} className="w-4 h-4 text-[#6E7570] ml-2 sm:ml-3 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search by scientific name, common name, collector, or accession ID..."
            className="flex-1 min-w-0 px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm md:text-base text-[#1C241E] placeholder:text-[#8E9990] focus:outline-hidden"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="p-1.5 text-[#6E7570] hover:text-[#1C241E] rounded-xs shrink-0"
              title="Clear search query"
              aria-label="Clear search query"
            >
              <FontAwesomeIcon icon={faXmark} className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Mobile / Tablet Filter Toggle Button */}
        <button
          type="button"
          onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
          aria-expanded={filterDrawerOpen}
          className={`lg:hidden px-4 py-2.5 sm:py-2 text-xs font-semibold uppercase tracking-wider rounded-sm border flex items-center justify-center gap-2 transition-colors shrink-0 ${
            filterDrawerOpen || activeFilterCount > 0
              ? "bg-[#1F4529] text-white border-[#1F4529]"
              : "bg-[#F3EFEA] text-[#1C241E] border-[#C7BEB1] hover:bg-[#EAE5DE]"
          }`}
        >
          <FontAwesomeIcon icon={faSliders} className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold bg-white text-[#1F4529]">
              {activeFilterCount}
            </span>
          )}
          <FontAwesomeIcon
            icon={faChevronDown}
            className={`w-3 h-3 ml-0.5 transition-transform duration-200 ${filterDrawerOpen ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      {/* Collapsible Inline Filters Panel for Mobile & Tablet */}
      {filterDrawerOpen && (
        <div className="lg:hidden bg-white border border-[#E0D9CE] rounded-sm p-4 sm:p-5 space-y-4 shadow-xs animate-nav-drop">
          <div className="flex items-center justify-between border-b border-[#EDE7DD] pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1C241E]">
              <FontAwesomeIcon icon={faFilter} className="w-3.5 h-3.5 text-[#47663B]" />
              <span>Filter Criteria</span>
              {activeFilterCount > 0 && (
                <span className="text-[11px] font-normal text-[#566158]">
                  ({activeFilterCount} active)
                </span>
              )}
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-[#8F2D14] hover:underline font-medium flex items-center gap-1"
              >
                <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
                <span>Reset all</span>
              </button>
            )}
          </div>

          {/* Controls: 1 column on mobile (< sm), 2 columns on tablet (sm:) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {renderFilterControls(true)}
          </div>

          <div className="pt-2 border-t border-[#EDE7DD] flex items-center justify-end gap-3">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="px-3 py-1.5 text-xs text-[#8F2D14] hover:underline font-semibold"
              >
                Clear all
              </button>
            )}
            <button
              type="button"
              onClick={() => setFilterDrawerOpen(false)}
              className="px-5 py-2 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs pt-1">
          <span className="text-[#6E7570] font-medium shrink-0">Active criteria:</span>
          {query && (
            <span className="inline-flex items-center gap-1 bg-[#EAE5DE] px-2.5 py-1 rounded-sm text-[#1C241E] break-all max-w-full">
              Query: "{query}"
              <button onClick={() => setQuery("")} className="hover:text-red-700 shrink-0" aria-label="Clear query filter">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          )}
          {family !== "ALL" && (
            <span className="inline-flex items-center gap-1 bg-[#EAE5DE] px-2.5 py-1 rounded-sm text-[#1C241E]">
              Family: {family}
              <button onClick={() => setFamily("ALL")} className="hover:text-red-700 shrink-0" aria-label="Clear family filter">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          )}
          {conservationStatus !== "ALL" && (
            <span className="inline-flex items-center gap-1 bg-[#EAE5DE] px-2.5 py-1 rounded-sm text-[#1C241E]">
              IUCN: {conservationStatus}
              <button onClick={() => setConservationStatus("ALL")} className="hover:text-red-700 shrink-0" aria-label="Clear conservation status filter">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          )}
          {region !== "ALL" && (
            <span className="inline-flex items-center gap-1 bg-[#EAE5DE] px-2.5 py-1 rounded-sm text-[#1C241E]">
              Region: {region}
              <button onClick={() => setRegion("ALL")} className="hover:text-red-700 shrink-0" aria-label="Clear region filter">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 bg-[#EAE5DE] px-2.5 py-1 rounded-sm text-[#1C241E] break-all max-w-full">
              Site: {location}
              <button onClick={() => setLocation("")} className="hover:text-red-700 shrink-0" aria-label="Clear site filter">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          )}
          {(dateFrom || dateTo) && (
            <span className="inline-flex items-center gap-1 bg-[#EAE5DE] px-2.5 py-1 rounded-sm text-[#1C241E]">
              Date: {dateFrom || "Any"} to {dateTo || "Any"}
              <button onClick={() => { setDateFrom(""); setDateTo(""); }} className="hover:text-red-700 shrink-0" aria-label="Clear date filter">
                <FontAwesomeIcon icon={faXmark} className="w-3 h-3" />
              </button>
            </span>
          )}
          <button
            onClick={handleClearFilters}
            className="inline-flex items-center gap-1 text-[#8F2D14] hover:underline font-semibold ml-1 shrink-0"
          >
            <FontAwesomeIcon icon={faRotateLeft} className="w-3 h-3" />
            <span>Reset all</span>
          </button>
        </div>
      )}
    </div>

    {/* Main Layout: Filters Sidebar (Desktop) + Results */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 items-start min-w-0">
      {/* Left Filter Sidebar (Desktop) */}
      <div className="hidden lg:block lg:col-span-1 space-y-6">
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-5">
          <div className="flex items-center justify-between border-b border-[#EDE7DD] pb-3">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#1C241E]">
              <FontAwesomeIcon icon={faFilter} className="w-4 h-4 text-[#47663B]" />
              <span>Filters</span>
            </div>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-xs text-[#8F2D14] hover:underline font-medium"
              >
                Clear all
              </button>
            )}
          </div>

          {renderFilterControls(false)}
        </div>
      </div>

      {/* Right Results Column */}
      <div className="lg:col-span-3 space-y-5 sm:space-y-6 min-w-0">
        {/* Controls Bar: Results count, sorting, view toggle */}
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs text-[#566158] font-medium">
            Showing <strong className="text-[#1C241E] font-mono-acc">{results.length}</strong> of{" "}
            <strong className="text-[#1C241E] font-mono-acc">{total}</strong> cataloged specimen(s)
          </div>

          <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2.5 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs flex-1 sm:flex-initial min-w-0">
              <FontAwesomeIcon icon={faArrowDownWideShort} className="w-3.5 h-3.5 text-[#6E7570] shrink-0" />
              <span className="text-[#566158] uppercase font-semibold text-[11px] whitespace-nowrap">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full sm:w-auto min-w-0 px-2.5 py-1.5 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] truncate"
              >
                <option value="updated-desc">Recently Updated</option>
                <option value="name-asc">Name (A → Z)</option>
                <option value="name-desc">Name (Z → A)</option>
                <option value="accession-asc">Accession (Asc)</option>
                <option value="conservation">Conservation Priority</option>
              </select>
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-[#F3EFEA] border border-[#E0D9CE] rounded-sm p-0.5 shrink-0">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xs transition-colors ${viewMode === "grid" ? "bg-white shadow-xs text-[#1F4529]" : "text-[#6E7570] hover:text-[#1C241E]"}`}
                title="Grid view"
                aria-label="Grid view"
              >
                <FontAwesomeIcon icon={faTableCellsLarge} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-xs transition-colors ${viewMode === "list" ? "bg-white shadow-xs text-[#1F4529]" : "text-[#6E7570] hover:text-[#1C241E]"}`}
                title="List view"
                aria-label="List view"
              >
                <FontAwesomeIcon icon={faList} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Results Grid / List */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-sm border border-[#E0D9CE] overflow-hidden flex flex-col h-80">
                <div className="aspect-4/3 bg-[#F3EFEA] skeleton-shimmer" />
                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="h-3 w-24 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                    <div className="h-5 w-44 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                    <div className="h-3 w-28 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                  </div>
                  <div className="pt-2.5 border-t border-[#EDE7DD] flex justify-between items-center">
                    <div className="h-3 w-28 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                    <div className="h-3 w-12 bg-[#EAE5DE] skeleton-shimmer rounded-xs" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : results.length === 0 ? (
          /* Professional Empty State with Suggestions */
          <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-12 text-center space-y-5">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#F3EFEA] text-[#6E7570] mx-auto flex items-center justify-center">
              <FontAwesomeIcon icon={faMagnifyingGlass} className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#1C241E]">
                No specimens found
              </h2>
              <p className="text-xs text-[#566158] leading-relaxed">
                We could not find any cataloged vouchers matching your exact search criteria or filter combinations.
              </p>
            </div>

            <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-4 max-w-md mx-auto text-left space-y-2 text-xs text-[#566158]">
              <span className="font-semibold text-[#1C241E] block">Search Recommendations:</span>
              <ul className="list-disc list-inside space-y-1 text-[#6E7570]">
                <li>Check spelling of scientific binomen or botanical family</li>
                <li>Try a broader genus or family query (e.g. <em>Pinus</em> or <em>Rosaceae</em>)</li>
                <li>Remove specific IUCN status or geographic constraints</li>
                <li>Search by numeric accession code (e.g. <em>SHB-2024-001</em>)</li>
              </ul>
            </div>

            <div>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider bg-[#1F4529] hover:bg-[#15321D] text-white rounded-sm transition-colors"
              >
                Clear All Filters & Reset
              </button>
            </div>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 animate-fade-in">
            {results.map((specimen, idx) => (
              <ScrollReveal key={specimen.id} delay={Math.min(idx * 35, 200)}>
                <SpecimenCard
                  specimen={specimen}
                  onClick={() => onNavigate(`/specimen/${specimen.id}`)}
                />
              </ScrollReveal>
            ))}
          </div>
        ) : (
          /* List / Table View */
          <div className="bg-white border border-[#E0D9CE] rounded-sm overflow-hidden divide-y divide-[#EDE7DD]">
            {results.map((specimen) => {
              const primary = specimen.photos.find((p) => p.isPrimary) || specimen.photos[0];
              return (
                <div
                  key={specimen.id}
                  onClick={() => onNavigate(`/specimen/${specimen.id}`)}
                  className="p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 hover:bg-[#FAF8F5] transition-colors cursor-pointer group min-w-0"
                >
                  <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1">
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xs bg-[#F3EFEA] overflow-hidden shrink-0">
                      <SpecimenImage
                        src={primary?.storageUrl}
                        alt={primary?.altText || specimen.scientificName}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform"
                        fallbackClassName="w-full h-full"
                      />
                    </div>

                    <div className="space-y-0.5 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-[#6E7570] font-mono-acc">
                        <span className="font-bold text-[#1F4529]">{specimen.accessionNumber}</span>
                        <span>•</span>
                        <span className="uppercase truncate">{specimen.family}</span>
                      </div>
                      <h3 className="font-serif-heading text-sm sm:text-base font-bold text-[#1C241E] group-hover:text-[#1F4529] break-words">
                        <span className="italic">{specimen.scientificName}</span>
                      </h3>
                      {specimen.commonName && (
                        <p className="text-xs text-[#566158] break-words">{specimen.commonName}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EDE7DD]">
                    <ConservationBadge status={specimen.conservationStatus} size="sm" showCode />
                    <span className="text-[11px] text-[#6E7570] font-mono-acc break-words max-w-[200px] text-right">
                      {specimen.location || specimen.region || "Preserved voucher"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between bg-white border border-[#E0D9CE] rounded-sm p-3 sm:p-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C241E] border border-[#C7BEB1] rounded-sm hover:bg-[#F3EFEA] disabled:opacity-30 disabled:pointer-events-none"
            >
              <FontAwesomeIcon icon={faChevronLeft} className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <div className="text-xs text-[#566158]">
              Page <strong className="text-[#1C241E] font-mono-acc">{page}</strong> of{" "}
              <strong className="text-[#1C241E] font-mono-acc">{totalPages}</strong>
            </div>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#1C241E] border border-[#C7BEB1] rounded-sm hover:bg-[#F3EFEA] disabled:opacity-30 disabled:pointer-events-none"
            >
              <span>Next</span>
              <FontAwesomeIcon icon={faChevronRight} className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  </div>;
};
export {
  SearchResultsPage
};
