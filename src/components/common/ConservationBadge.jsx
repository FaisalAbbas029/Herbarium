const ConservationBadge = ({
  status,
  size = "md",
  showCode = false
}) => {
  const getStatusConfig = (s) => {
    switch (s) {
      case "Critically Endangered":
        return {
          code: "CR",
          bg: "bg-[#781D1D]",
          text: "text-[#FFFFFF]",
          border: "border-[#5E1616]",
          label: "Critically Endangered"
        };
      case "Endangered":
        return {
          code: "EN",
          bg: "bg-[#8F2D14]",
          text: "text-[#FFFFFF]",
          border: "border-[#73230F]",
          label: "Endangered"
        };
      case "Vulnerable":
        return {
          code: "VU",
          bg: "bg-[#A45D25]",
          text: "text-[#FFFFFF]",
          border: "border-[#874A1C]",
          label: "Vulnerable"
        };
      case "Near Threatened":
        return {
          code: "NT",
          bg: "bg-[#8B7E2B]",
          text: "text-[#FFFFFF]",
          border: "border-[#706522]",
          label: "Near Threatened"
        };
      case "Least Concern":
        return {
          code: "LC",
          bg: "bg-[#2D5A3D]",
          text: "text-[#FFFFFF]",
          border: "border-[#22452E]",
          label: "Least Concern"
        };
      case "Extinct in the Wild":
        return {
          code: "EW",
          bg: "bg-[#3A104E]",
          text: "text-[#FFFFFF]",
          border: "border-[#2A0B39]",
          label: "Extinct in the Wild"
        };
      case "Extinct":
        return {
          code: "EX",
          bg: "bg-[#1C1C1C]",
          text: "text-[#FFFFFF]",
          border: "border-[#000000]",
          label: "Extinct"
        };
      case "Data Deficient":
        return {
          code: "DD",
          bg: "bg-[#555E68]",
          text: "text-[#FFFFFF]",
          border: "border-[#434A52]",
          label: "Data Deficient"
        };
      default:
        return {
          code: "NE",
          bg: "bg-[#6E7570]",
          text: "text-[#FFFFFF]",
          border: "border-[#585E5A]",
          label: status || "Not Evaluated"
        };
    }
  };
  const config = getStatusConfig(status);
  const sizeClasses = {
    sm: "text-[11px] px-2 py-0.5 tracking-wide",
    md: "text-xs px-2.5 py-1 tracking-wide",
    lg: "text-sm px-3.5 py-1.5 font-medium tracking-wide"
  };
  return <span
    className={`inline-flex items-center gap-1.5 font-medium rounded-sm border whitespace-nowrap shrink-0 ${config.bg} ${config.text} ${config.border} ${sizeClasses[size]}`}
    title={`IUCN Conservation Status: ${config.label}`}
  >
      {showCode && <span className="font-mono-acc font-bold opacity-90 border-r border-white/30 pr-1.5">
          {config.code}
        </span>}
      <span className="truncate">{config.label}</span>
    </span>;
};
export {
  ConservationBadge
};
