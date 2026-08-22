import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  ZoomIn,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  Info,
  Sparkles,
  TreeDeciduous
} from "lucide-react";
import { api } from "../../services/api.js";
import { ConservationBadge } from "../../components/common/ConservationBadge.jsx";
import { PhotoGalleryModal } from "../../components/common/PhotoGalleryModal.jsx";
import { SpecimenCard } from "../../components/common/SpecimenCard.jsx";
import { SpecimenImage } from "../../components/common/SpecimenImage.jsx";
const SpecimenDetailPage = ({
  specimenId,
  onNavigate
}) => {
  const [specimen, setSpecimen] = useState(null);
  const [related, setRelated] = useState([]);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [isGalleryModalOpen, setIsGalleryModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copiedCitation, setCopiedCitation] = useState(false);
  useEffect(() => {
    const loadSpecimenData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await api.getSpecimen(specimenId);
        setSpecimen(res.specimen);
        const primaryIdx = res.specimen.photos.findIndex((p) => p.isPrimary);
        setActivePhotoIndex(primaryIdx >= 0 ? primaryIdx : 0);
        const relatedRes = await api.getRelatedSpecimens(specimenId);
        setRelated(relatedRes.related);
      } catch (err) {
        setError(err.message || "Specimen record not found or inaccessible.");
      } finally {
        setIsLoading(false);
      }
    };
    loadSpecimenData();
  }, [specimenId]);
  if (isLoading) {
    return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
      <div className="w-10 h-10 border-3 border-[#1F4529] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-sm font-medium text-[#566158]">Retrieving specimen archival record...</p>
    </div>;
  }
  if (error || !specimen) {
    return <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
      <div className="w-12 h-12 rounded-full bg-[#FDF2F2] text-[#8F2D14] mx-auto flex items-center justify-center">
        <Info className="w-6 h-6" />
      </div>
      <h1 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
        Record Unavailable
      </h1>
      <p className="text-sm text-[#566158] leading-relaxed">
        {error || "This specimen record does not exist or is currently in curatorial review."}
      </p>
      <button
        onClick={() => onNavigate("/search")}
        className="px-4 py-2 bg-[#1F4529] text-white text-xs font-semibold uppercase tracking-wider rounded-sm hover:bg-[#15321D]"
      >
        Return to Catalog
      </button>
    </div>;
  }
  const photos = specimen.photos || [];
  const activePhoto = photos[activePhotoIndex];
  const formattedDate = specimen.collectionDate ? new Date(specimen.collectionDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  }) : "Not Recorded";
  const updatedDate = new Date(specimen.updatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
  const citationText = `Gilgit-Baltistan Herbarium Archive (${(/* @__PURE__ */ new Date()).getFullYear()}). Specimen Voucher Record: ${specimen.scientificName} [Accession No. ${specimen.accessionNumber}]. Collected by ${specimen.collectorName || "Institutional Staff"}, ${specimen.collectionLocation || specimen.region}. GB Herbarium (SHB).`;
  const copyCitation = () => {
    navigator.clipboard.writeText(citationText);
    setCopiedCitation(true);
    setTimeout(() => setCopiedCitation(false), 2500);
  };
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
    {
      /* Back button & Meta ribbon */
    }
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0D9CE] pb-4">
      <button
        onClick={() => onNavigate("/search")}
        className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#47663B] hover:text-[#1F4529] transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog Search</span>
      </button>

      <div className="flex items-center gap-3 text-xs text-[#6E7570] font-mono-acc">
        <span>Accession: <strong className="text-[#1C241E]">{specimen.accessionNumber}</strong></span>
        <span>•</span>
        <span>Last updated: {updatedDate}</span>
      </div>
    </div>

    {
      /* Main Specimen Title Header */
    }
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-xs uppercase font-bold tracking-widest text-[#47663B] bg-[#EBF3ED] px-2.5 py-1 rounded-xs">
          Family: {specimen.family}
        </span>
        <ConservationBadge status={specimen.conservationStatus} size="md" showCode />
        {specimen.status === "DRAFT" && <span className="text-xs font-bold uppercase tracking-wider bg-[#A45D25] text-white px-2.5 py-0.5 rounded-xs">
          Curatorial Draft
        </span>}
      </div>

      <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1C241E] leading-tight">
        <span className="italic">{specimen.scientificName}</span>
      </h1>

      {specimen.commonName && <p className="text-lg text-[#566158] font-medium">
        Common Name: <span className="text-[#1C241E]">{specimen.commonName}</span>
      </p>}
    </div>

    {
      /* Main Grid: Visual Voucher Stage + Key Archival Summary */
    }
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {
        /* Left 7 Columns: Photo Gallery Stage */
      }
      <div className="lg:col-span-7 space-y-4">
        <div className="relative bg-[#F3EFEA] border border-[#E0D9CE] rounded-sm overflow-hidden group">
          <div className="aspect-4/3 relative flex items-center justify-center bg-[#ECE6DC]">
            <SpecimenImage
              src={activePhoto?.storageUrl}
              alt={activePhoto?.altText || specimen.scientificName}
              className="w-full h-full object-contain cursor-zoom-in"
              fallbackClassName="w-full h-full"
              onClick={() => activePhoto && setIsGalleryModalOpen(true)}
            />

            {
              /* Zoom Action Overlay */
            }
            <button
              onClick={() => setIsGalleryModalOpen(true)}
              className="absolute top-3 right-3 p-2 bg-[#1C2820]/80 hover:bg-[#1C2820] text-white rounded-sm backdrop-blur-xs transition-all shadow-md flex items-center gap-1 text-xs"
              title="Inspect high-resolution micrograph"
            >
              <ZoomIn className="w-4 h-4" />
              <span className="hidden sm:inline">Inspect Micrograph</span>
            </button>

            {
              /* Photo Counter */
            }
            {photos.length > 0 && <div className="absolute bottom-3 left-3 bg-[#1C2820]/80 text-white text-xs px-2.5 py-1 rounded-sm font-mono-acc backdrop-blur-xs">
              Photo {activePhotoIndex + 1} of {photos.length}
            </div>}

            {
              /* Prev / Next controls on main view */
            }
            {photos.length > 1 && <>
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Previous photo"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setActivePhotoIndex((prev) => (prev + 1) % photos.length)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                aria-label="Next photo"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>}
          </div>

          {
            /* Photo Caption & Diagnostics */
          }
          {activePhoto && (activePhoto.caption || activePhoto.altText) && <div className="p-3 bg-white border-t border-[#EDE7DD] text-xs text-[#566158]">
            <strong className="text-[#1C241E]">Voucher view:</strong> {activePhoto.caption || activePhoto.altText}
          </div>}
        </div>

        {
          /* Thumbnails strip */
        }
        {photos.length > 1 && <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {photos.map((p, idx) => <button
            key={p.id || idx}
            onClick={() => setActivePhotoIndex(idx)}
            className={`relative w-20 h-20 rounded-xs overflow-hidden border-2 shrink-0 transition-all ${idx === activePhotoIndex ? "border-[#1F4529] shadow-sm scale-102" : "border-[#E0D9CE] opacity-70 hover:opacity-100"}`}
          >
            <SpecimenImage
              src={p.storageUrl}
              alt={p.altText || ""}
              className="w-full h-full object-contain"
              fallbackClassName="w-full h-full"
            />
            {p.isPrimary && <span className="absolute bottom-0 inset-x-0 bg-[#1F4529] text-[8px] text-center font-bold text-white uppercase">
              Primary
            </span>}
          </button>)}
        </div>}
      </div>

      {
        /* Right 5 Columns: Taxonomic & Field Data Summary */
      }
      <div className="lg:col-span-5 space-y-6">
        {
          /* Quick Herbarium Voucher Card */
        }
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-4 shadow-xs">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-2 flex items-center justify-between">
            <span>Taxonomic Hierarchy</span>
            <span className="text-xs font-mono-acc text-[#6E7570]">APG IV Classification</span>
          </h2>

          <dl className="grid grid-cols-2 gap-y-3 text-xs">
            <div>
              <dt className="text-[#6E7570] uppercase font-semibold">Kingdom</dt>
              <dd className="font-medium text-[#1C241E] mt-0.5">{specimen.kingdom || "Plantae"}</dd>
            </div>
            <div>
              <dt className="text-[#6E7570] uppercase font-semibold">Family</dt>
              <dd className="font-medium text-[#1C241E] mt-0.5">{specimen.family}</dd>
            </div>
            <div>
              <dt className="text-[#6E7570] uppercase font-semibold">Genus</dt>
              <dd className="font-medium text-[#1C241E] italic mt-0.5">{specimen.genus}</dd>
            </div>
            <div>
              <dt className="text-[#6E7570] uppercase font-semibold">Species</dt>
              <dd className="font-medium text-[#1C241E] italic mt-0.5">{specimen.species}</dd>
            </div>
          </dl>
        </div>

        {
          /* Collection Metadata Card */
        }
        <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-4 shadow-xs">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-2">
            Collection Provenance
          </h2>

          <div className="space-y-3 text-xs">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-[#47663B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#6E7570] block uppercase font-semibold text-[10px]">Collector(s)</span>
                <span className="text-[#1C241E] font-medium">{specimen.collectorName || "GB Herbarium Field Team"}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#47663B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#6E7570] block uppercase font-semibold text-[10px]">Collection Date</span>
                <span className="text-[#1C241E] font-mono-acc font-medium">{formattedDate}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <MapPin className="w-4 h-4 text-[#47663B] shrink-0 mt-0.5" />
              <div>
                <span className="text-[#6E7570] block uppercase font-semibold text-[10px]">Site & Region</span>
                <span className="text-[#1C241E] font-medium">{specimen.location || specimen.collectionLocation || specimen.region}</span>
                {specimen.coordinates && <div className="mt-1 font-mono-acc text-[11px] text-[#47663B] bg-[#F3EFEA] px-2 py-0.5 rounded-xs inline-block">
                  GPS: {specimen.coordinates}
                </div>}
              </div>
            </div>
          </div>
        </div>

        {
          /* Citation & Scientific Tooling */
        }
        <div className="bg-[#F3EFEA] border border-[#E0D9CE] rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#1C241E]">
              Standard Citation
            </span>
            <button
              onClick={copyCitation}
              className="inline-flex items-center gap-1 text-xs text-[#1F4529] hover:underline font-semibold"
            >
              {copiedCitation ? <>
                <Check className="w-3.5 h-3.5 text-[#2D5A3D]" />
                <span>Copied!</span>
              </> : <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Citation</span>
              </>}
            </button>
          </div>
          <p className="text-[11px] text-[#566158] font-mono-acc bg-white p-2.5 border border-[#E0D9CE] rounded-xs leading-relaxed">
            {citationText}
          </p>
        </div>
      </div>
    </div>

    {
      /* Structured Comprehensive Botanical Sections */
    }
    <div className="space-y-8 pt-4">
      {
        /* Section 1: Morphology & Diagnostic Features */
      }
      <section className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-4">
        <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-3 flex items-center gap-2">
          <TreeDeciduous className="w-5 h-5 text-[#47663B]" />
          <span>Morphology & Botanical Description</span>
        </h2>

        <div className="space-y-4 text-sm text-[#3E4A41] leading-relaxed">
          {specimen.morphology && <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E7570] mb-1">
              Morphological Architecture
            </h3>
            <p className="text-justify">{specimen.morphology}</p>
          </div>}

          {specimen.characteristics && <div className="bg-[#FAF8F5] p-4 border-l-3 border-[#47663B] rounded-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#1F4529] mb-1">
              Key Diagnostic Characteristics
            </h3>
            <p>{specimen.characteristics}</p>
          </div>}

          {specimen.description && <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6E7570] mb-1">
              Comprehensive Botanical Overview
            </h3>
            <p className="text-justify">{specimen.description}</p>
          </div>}
        </div>
      </section>

      {
        /* Section 2: Habitat, Biogeography & Field Ecology */
      }
      <section className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-4">
        <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-3 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-[#47663B]" />
          <span>Habitat & Geographic Distribution</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-[#3E4A41]">
          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E7570] block">
                Natural Habitat & Substrate
              </span>
              <p className="mt-1">{specimen.habitat || "Temperate forest and montane substrate"}</p>
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E7570] block">
                Geographic Range
              </span>
              <p className="mt-1">{specimen.geographicDistribution || specimen.region}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E7570] block">
                Voucher Collection Location
              </span>
              <p className="mt-1">{specimen.collectionLocation || specimen.location}</p>
            </div>

            {specimen.collectionNotes && <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#6E7570] block">
                Curatorial Field Notes
              </span>
              <p className="mt-1 text-xs italic text-[#566158]">{specimen.collectionNotes}</p>
            </div>}
          </div>
        </div>
      </section>

      {
        /* Section 3: Ethnobotany, Phytochemistry & Ecological Uses */
      }
      <section className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-4">
        <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E] border-b border-[#EDE7DD] pb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-[#47663B]" />
          <span>Ethnobotany, Pharmacognosy & Ecological Roles</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-[#3E4A41]">
          <div className="bg-[#FAF8F5] p-4 border border-[#E0D9CE] rounded-sm space-y-2">
            <h3 className="font-serif-heading text-sm font-bold text-[#1F4529]">
              Traditional & Cultural Uses
            </h3>
            <p className="leading-relaxed text-[#566158]">
              {specimen.traditionalUses || "No documented traditional folk preparations recorded for this taxon."}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 border border-[#E0D9CE] rounded-sm space-y-2">
            <h3 className="font-serif-heading text-sm font-bold text-[#1F4529]">
              Medicinal & Phytochemical Properties
            </h3>
            <p className="leading-relaxed text-[#566158]">
              {specimen.medicinalUses || "Phytochemical analysis pending bioassay characterization."}
            </p>
          </div>

          <div className="bg-[#FAF8F5] p-4 border border-[#E0D9CE] rounded-sm space-y-2">
            <h3 className="font-serif-heading text-sm font-bold text-[#1F4529]">
              Ecological Interactions
            </h3>
            <p className="leading-relaxed text-[#566158]">
              {specimen.ecologicalUses || "Integral canopy and pollinator food resource in native ecosystem."}
            </p>
          </div>
        </div>

        {specimen.otherNotes && <div className="mt-4 pt-3 border-t border-[#EDE7DD] text-xs text-[#6E7570]">
          <strong className="text-[#1C241E]">Archival Note:</strong> {specimen.otherNotes}
        </div>}
      </section>
    </div>

    {
      /* Section 4: Related Botanical Species in same Family/Genus */
    }
    {related.length > 0 && <section className="space-y-4 pt-6 border-t border-[#E0D9CE]">
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
          Taxonomic Affinities
        </div>
        <h2 className="font-serif-heading text-2xl font-bold text-[#1C241E]">
          Related Species in {specimen.family} / {specimen.genus}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {related.map((rel) => <SpecimenCard
          key={rel.id}
          specimen={rel}
          onClick={() => onNavigate(`/specimen/${rel.id}`)}
        />)}
      </div>
    </section>}

    {
      /* High-Resolution Interactive Modal Gallery */
    }
    <PhotoGalleryModal
      photos={photos}
      initialIndex={activePhotoIndex}
      specimenScientificName={specimen.scientificName}
      accessionNumber={specimen.accessionNumber}
      isOpen={isGalleryModalOpen}
      onClose={() => setIsGalleryModalOpen(false)}
    />
  </div>;
};
export {
  SpecimenDetailPage
};
