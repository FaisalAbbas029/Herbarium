import { MapPin, Calendar, Image as ImageIcon } from "lucide-react";
import { ConservationBadge } from "./ConservationBadge.jsx";
const SpecimenCard = ({
  specimen,
  onClick,
  showAdminBadge = false
}) => {
  const primaryPhoto = specimen.photos.find((p) => p.isPrimary) || specimen.photos[0] || {
    storageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
    altText: specimen.scientificName
  };
  return <div
    onClick={onClick}
    className="group cursor-pointer bg-white rounded-sm border border-[#E0D9CE] hover:border-[#2D5A3D] transition-all duration-200 overflow-hidden flex flex-col h-full hover:shadow-md"
  >
      {
    /* Specimen Image Container */
  }
      <div className="relative aspect-4/3 bg-[#F3EFEA] overflow-hidden">
        <img
    src={primaryPhoto.storageUrl}
    alt={primaryPhoto.altText || specimen.scientificName}
    loading="lazy"
    className="w-full h-full object-cover object-center group-hover:scale-103 transition-transform duration-300"
    onError={(e) => {
      e.target.src = "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=800&q=80";
    }}
  />

        {
    /* Top Floating Badges */
  }
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between gap-1.5 pointer-events-none">
          <span className="font-mono-acc text-[11px] font-semibold bg-[#1C2820]/85 text-[#FAF8F5] px-2 py-0.5 rounded-sm backdrop-blur-xs">
            {specimen.accessionNumber}
          </span>
          <ConservationBadge status={specimen.conservationStatus} size="sm" showCode />
        </div>

        {
    /* Photo Counter */
  }
        {specimen.photos && specimen.photos.length > 1 && <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#1C2820]/75 text-white text-[11px] px-1.5 py-0.5 rounded-sm backdrop-blur-xs font-mono-acc">
            <ImageIcon className="w-3 h-3" />
            <span>{specimen.photos.length}</span>
          </div>}

        {
    /* Admin Draft Badge */
  }
        {showAdminBadge && specimen.status === "DRAFT" && <div className="absolute bottom-2 left-2 bg-[#A45D25] text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
            DRAFT
          </div>}
      </div>

      {
    /* Card Body */
  }
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          {
    /* Family & Genus header */
  }
          <div className="flex items-center justify-between text-xs text-[#6E7570] uppercase font-semibold tracking-wider mb-1">
            <span>{specimen.family}</span>
            <span className="text-[#8E9990]">{specimen.region || "Cataloged"}</span>
          </div>

          {
    /* Scientific Name (MUST ALWAYS BE ITALIC) */
  }
          <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors leading-snug">
            <span className="italic">{specimen.scientificName}</span>
          </h3>

          {
    /* Common Name */
  }
          {specimen.commonName && <p className="text-sm text-[#566158] font-medium line-clamp-1 mt-0.5">
              {specimen.commonName}
            </p>}
        </div>

        {
    /* Card Footer Details */
  }
        <div className="pt-2.5 border-t border-[#EDE7DD] flex items-center justify-between text-xs text-[#6E7570]">
          <div className="flex items-center gap-1 truncate max-w-[65%]" title={specimen.location || specimen.collectionLocation}>
            <MapPin className="w-3.5 h-3.5 text-[#47663B] shrink-0" />
            <span className="truncate">{specimen.location || specimen.region || "Preserved voucher"}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0 font-mono-acc text-[11px]">
            <Calendar className="w-3 h-3 text-[#8E9990]" />
            <span>{specimen.collectionDate ? specimen.collectionDate.slice(0, 4) : "Archive"}</span>
          </div>
        </div>
      </div>
    </div>;
};
export {
  SpecimenCard
};
