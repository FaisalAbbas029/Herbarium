import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLocationDot, faCalendarDays, faImages } from "@fortawesome/free-solid-svg-icons";
import { ConservationBadge } from "./ConservationBadge.jsx";
import { SpecimenImage } from "./SpecimenImage.jsx";
import { getSpecimenGeoData } from "../../utils/location.js";
const SpecimenCard = ({
  specimen,
  onClick,
  showAdminBadge = false
}) => {
  const primaryPhoto = specimen.photos?.find((p) => p.isPrimary) || specimen.photos?.[0];
  const geo = getSpecimenGeoData(specimen);
  return <div
    onClick={onClick}
    className="group cursor-pointer bg-white rounded-sm border border-[#E0D9CE] hover:border-[#2D5A3D] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg overflow-hidden flex flex-col h-full"
  >
    {/* Specimen Image Container */}
    <div className="relative aspect-4/3 bg-[#F3EFEA] overflow-hidden">
      <SpecimenImage
        src={primaryPhoto?.storageUrl}
        alt={primaryPhoto?.altText || specimen.scientificName}
        loading="lazy"
        className="w-full h-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
        fallbackClassName="w-full h-full"
      />

      {/* Top Floating Badges */}
      <div className="absolute top-2.5 left-2.5 right-2.5 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
        <span className="font-mono-acc text-[11px] font-semibold bg-[#1C2820]/85 text-[#FAF8F5] px-2 py-0.5 rounded-sm backdrop-blur-xs shrink-0">
          {specimen.accessionNumber}
        </span>
        <ConservationBadge status={specimen.conservationStatus} size="sm" showCode />
      </div>

      {/* Photo Counter */}
      {specimen.photos && specimen.photos.length > 1 && (
        <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#1C2820]/75 text-white text-[11px] px-1.5 py-0.5 rounded-sm backdrop-blur-xs font-mono-acc">
          <FontAwesomeIcon icon={faImages} className="w-3 h-3" />
          <span>{specimen.photos.length}</span>
        </div>
      )}

      {/* Admin Draft Badge */}
      {showAdminBadge && specimen.status === "DRAFT" && (
        <div className="absolute bottom-2 left-2 bg-[#A45D25] text-white text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
          DRAFT
        </div>
      )}
    </div>

    {/* Card Body */}
    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 min-w-0">
      <div>
        {/* Family & Genus header */}
        <div className="flex items-center justify-between text-xs text-[#6E7570] uppercase font-semibold tracking-wider mb-1 gap-2">
          <span className="truncate">{specimen.family}</span>
          <span className="text-[#8E9990] truncate text-right">{specimen.region || "Cataloged"}</span>
        </div>

        {/* Scientific Name (MUST ALWAYS BE ITALIC) */}
        <h3 className="font-serif-heading text-lg font-bold text-[#1C241E] group-hover:text-[#1F4529] transition-colors leading-snug break-words">
          <span className="italic">{specimen.scientificName}</span>
        </h3>

        {/* Common Name */}
        {specimen.commonName && (
          <p className="text-sm text-[#566158] font-medium break-words line-clamp-1 mt-0.5">
            {specimen.commonName}
          </p>
        )}
      </div>

      {/* Card Footer Details */}
      <div className="pt-2.5 border-t border-[#EDE7DD] flex flex-wrap items-center justify-between gap-2 text-xs text-[#6E7570]">
        <div className="flex-1 min-w-0 pr-1">
          {geo.hasCoordinates ? (
            <a
              href={geo.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-start gap-1.5 text-xs text-[#47663B] hover:text-[#1F4529] hover:underline font-medium break-words leading-tight"
              title={`View collection site on Google Maps (${geo.latitude}, ${geo.longitude})`}
            >
              <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#47663B] shrink-0 mt-0.5" />
              <span className="break-words leading-tight">{specimen.location || specimen.region || "Preserved voucher"}</span>
            </a>
          ) : (
            <div className="inline-flex items-start gap-1.5 text-xs text-[#6E7570] break-words leading-tight" title={specimen.location || specimen.collectionLocation}>
              <FontAwesomeIcon icon={faLocationDot} className="w-3 h-3 text-[#47663B] shrink-0 mt-0.5" />
              <span className="break-words leading-tight">{specimen.location || specimen.region || "Preserved voucher"}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0 font-mono-acc text-[11px] text-[#8E9990] self-end sm:self-center">
          <FontAwesomeIcon icon={faCalendarDays} className="w-3 h-3 text-[#8E9990]" />
          <span>{specimen.collectionDate ? specimen.collectionDate.slice(0, 4) : "Archive"}</span>
        </div>
      </div>
    </div>
  </div>;
};
export {
  SpecimenCard
};
