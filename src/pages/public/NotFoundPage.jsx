import { Leaf, Search, ArrowLeft } from "lucide-react";
const NotFoundPage = ({ onNavigate }) => {
  return <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-6">
      <div className="w-16 h-16 rounded-full bg-[#EBF3ED] text-[#1F4529] mx-auto flex items-center justify-center">
        <Leaf className="w-8 h-8 text-[#47663B]" />
      </div>

      <div className="space-y-2">
        <span className="font-mono-acc text-sm font-bold text-[#8F2D14]">ERROR 404</span>
        <h1 className="font-serif-heading text-3xl font-bold text-[#1C241E]">
          Botanical Voucher Not Found
        </h1>
        <p className="text-sm text-[#566158] leading-relaxed">
          The requested page, specimen index, or taxonomic voucher path does not exist in the digital archive.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-4">
        <button
    onClick={() => onNavigate("/")}
    className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
  >
          <ArrowLeft className="w-4 h-4" />
          <span>Return Home</span>
        </button>
        <button
    onClick={() => onNavigate("/search")}
    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#C7BEB1] hover:bg-[#F3EFEA] text-[#1C241E] text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
  >
          <Search className="w-4 h-4" />
          <span>Search Catalog</span>
        </button>
      </div>
    </div>;
};
export {
  NotFoundPage
};
