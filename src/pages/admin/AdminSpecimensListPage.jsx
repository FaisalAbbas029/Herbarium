import { useState, useEffect } from "react";
import {
  Search,
  PlusCircle,
  FileEdit,
  Trash2,
  Eye,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { api } from "../../services/api.js";
import { ConservationBadge } from "../../components/common/ConservationBadge.jsx";
import { ConfirmModal } from "../../components/common/ConfirmModal.jsx";
import { SpecimenImage } from "../../components/common/SpecimenImage.jsx";
const AdminSpecimensListPage = ({ onNavigate }) => {
  const [specimens, setSpecimens] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [familyFilter, setFamilyFilter] = useState("ALL");
  const [sortBy, setSortBy] = useState("updated-desc");
  const [isLoading, setIsLoading] = useState(true);
  const [specimenToDelete, setSpecimenToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [availableFamilies, setAvailableFamilies] = useState([]);
  const [successNotice, setSuccessNotice] = useState(() => {
    const notice = sessionStorage.getItem("herbarium_catalog_notice");
    sessionStorage.removeItem("herbarium_catalog_notice");
    return notice;
  });
  const fetchSpecimens = async () => {
    setIsLoading(true);
    setActionError(null);
    try {
      const res = await api.searchSpecimens({
        query: query.trim() || void 0,
        status: statusFilter,
        family: familyFilter !== "ALL" ? familyFilter : void 0,
        sortBy,
        page,
        limit: 15
      });
      setSpecimens(res.data || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error("Failed to fetch admin specimens:", err);
      setActionError(err.message || "Failed to load specimens");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    api.getPublicStats().then((res) => {
      if (res.families) setAvailableFamilies(res.families.map((f) => f.family));
    }).catch(console.error);
  }, []);
  useEffect(() => {
    fetchSpecimens();
  }, [query, statusFilter, familyFilter, sortBy, page]);
  useEffect(() => {
    if (!successNotice) return undefined;
    const timer = window.setTimeout(() => setSuccessNotice(null), 3500);
    return () => window.clearTimeout(timer);
  }, [successNotice]);
  const handleDeleteConfirm = async () => {
    if (!specimenToDelete) return;
    setIsDeleting(true);
    setActionError(null);
    try {
      await api.deleteSpecimen(specimenToDelete.id);
      setSpecimenToDelete(null);
      await fetchSpecimens();
    } catch (err) {
      setActionError(err.message || "Failed to delete specimen");
    } finally {
      setIsDeleting(false);
    }
  };
  return <div className="space-y-6">
    {
      /* Header */
    }
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
          Specimen Catalog
        </div>
        <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
          Herbarium Voucher Records
        </h1>
        <p className="text-xs text-[#566158]">
          Manage published botanical vouchers, draft revisions, and anatomical descriptions.
        </p>
      </div>

      <button
        onClick={() => onNavigate("/admin/specimens/new")}
        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
      >
        <PlusCircle className="w-4 h-4" />
        <span>New Specimen Entry</span>
      </button>
    </div>

    {actionError && <div className="p-3.5 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] text-xs rounded-sm">
      {actionError}
    </div>}
    {successNotice && <div className="p-3.5 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] text-xs rounded-sm">
      {successNotice}
    </div>}

    {
      /* Filter and Search Bar */
    }
    <div className="bg-white border border-[#E0D9CE] rounded-sm p-4 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {
          /* Text Search */
        }
        <div className="relative">
          <Search className="w-4 h-4 text-[#8E9990] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder="Search scientific name, code, collector..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529] text-[#1C241E]"
          />
        </div>

        {
          /* Status Filter */
        }
        <div>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
          >
            <option value="ALL">All Statuses</option>
            <option value="PUBLISHED">Published Only</option>
            <option value="DRAFT">Drafts Only</option>
          </select>
        </div>

        {
          /* Family Filter */
        }
        <div>
          <select
            value={familyFilter}
            onChange={(e) => {
              setFamilyFilter(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
          >
            <option value="ALL">All Families</option>
            {availableFamilies.map((fam) => <option key={fam} value={fam}>
              {fam}
            </option>)}
          </select>
        </div>

        {
          /* Sorting */
        }
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-[#6E7570] shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
          >
            <option value="updated-desc">Recently Updated</option>
            <option value="name-asc">Scientific Name (A-Z)</option>
            <option value="name-desc">Scientific Name (Z-A)</option>
            <option value="accession-asc">Accession # (Asc)</option>
          </select>
        </div>
      </div>
    </div>

    {
      /* Specimen Management Table */
    }
    <div className="bg-white border border-[#E0D9CE] rounded-sm overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#FAF8F5] border-b border-[#E0D9CE] text-[#566158] uppercase font-semibold text-[11px] tracking-wider">
              <th className="py-3 px-4">Specimen Voucher</th>
              <th className="py-3 px-4">Family & Genus</th>
              <th className="py-3 px-4">IUCN Status</th>
              <th className="py-3 px-4">Collection Provenance</th>
              <th className="py-3 px-4">State</th>
              <th className="py-3 px-4 text-right">Curatorial Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EDE7DD]">
            {isLoading ? <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-[#6E7570]">
                Loading specimen vouchers...
              </td>
            </tr> : specimens.length === 0 ? <tr>
              <td colSpan={6} className="py-12 text-center text-xs text-[#6E7570]">
                No botanical specimens match your query.
              </td>
            </tr> : specimens.map((specimen) => {
              const primaryPhoto = specimen.photos.find((p) => p.isPrimary) || specimen.photos[0];
              return <tr key={specimen.id} className="hover:bg-[#FAF8F5] transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xs bg-[#F3EFEA] overflow-hidden shrink-0 border border-[#E0D9CE]">
                      <SpecimenImage
                        src={primaryPhoto?.storageUrl}
                        alt={specimen.scientificName}
                        className="w-full h-full object-contain"
                        fallbackClassName="w-full h-full"
                      />
                    </div>
                    <div>
                      <span className="font-mono-acc text-[11px] font-bold text-[#1F4529] block">
                        {specimen.accessionNumber}
                      </span>
                      <span className="font-serif-heading text-sm font-bold text-[#1C241E] block">
                        <span className="italic">{specimen.scientificName}</span>
                      </span>
                      {specimen.commonName && <span className="text-[11px] text-[#6E7570] block">
                        {specimen.commonName}
                      </span>}
                    </div>
                  </div>
                </td>

                <td className="py-3 px-4">
                  <div className="font-semibold text-[#1C241E]">{specimen.family}</div>
                  <div className="text-[11px] text-[#6E7570] italic">{specimen.genus}</div>
                </td>

                <td className="py-3 px-4">
                  <ConservationBadge status={specimen.conservationStatus} size="sm" showCode />
                </td>

                <td className="py-3 px-4">
                  <div className="text-[#1C241E] truncate max-w-xs" title={specimen.location || specimen.collectionLocation}>
                    {specimen.location || specimen.region || "Archived voucher"}
                  </div>
                  <div className="text-[11px] text-[#6E7570] font-mono-acc">
                    {specimen.collectionDate ? specimen.collectionDate.slice(0, 10) : "Undated"}
                  </div>
                </td>

                <td className="py-3 px-4">
                  {specimen.status === "DRAFT" ? <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#A45D25] text-white">
                    Draft
                  </span> : <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#2D5A3D] text-white">
                    Published
                  </span>}
                </td>

                <td className="py-3 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => onNavigate(`/specimen/${specimen.id}`)}
                      className="p-1.5 text-[#566158] hover:text-[#1F4529] hover:bg-[#EAE5DE] rounded-xs transition-colors"
                      title="View Public Sheet"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => onNavigate(`/admin/specimens/edit/${specimen.id}`)}
                      className="p-1.5 text-[#1F4529] hover:bg-[#EBF3ED] rounded-xs transition-colors"
                      title="Edit Specimen"
                    >
                      <FileEdit className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setSpecimenToDelete(specimen)}
                      className="p-1.5 text-[#8F2D14] hover:bg-[#FDF2F2] rounded-xs transition-colors"
                      title="Delete Specimen Voucher"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      {
        /* Pagination Bar */
      }
      {totalPages > 1 && <div className="flex items-center justify-between bg-[#FAF8F5] border-t border-[#E0D9CE] px-4 py-3 text-xs">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold uppercase tracking-wider text-[#1C241E] border border-[#C7BEB1] rounded-sm hover:bg-white disabled:opacity-30"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <span className="text-[#566158]">
          Page <strong className="text-[#1C241E] font-mono-acc">{page}</strong> of{" "}
          <strong className="text-[#1C241E] font-mono-acc">{totalPages}</strong> ({total} total records)
        </span>

        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 font-semibold uppercase tracking-wider text-[#1C241E] border border-[#C7BEB1] rounded-sm hover:bg-white disabled:opacity-30"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>}
    </div>

    {
      /* Delete Confirmation Modal */
    }
    <ConfirmModal
      isOpen={!!specimenToDelete}
      title="Delete Botanical Voucher?"
      message={`Are you sure you want to permanently remove specimen ${specimenToDelete?.scientificName} (${specimenToDelete?.accessionNumber}) from the herbarium archive? This action cannot be undone.`}
      confirmLabel="Permanently Delete"
      cancelLabel="Keep Record"
      isDestructive={true}
      isLoading={isDeleting}
      onConfirm={handleDeleteConfirm}
      onCancel={() => setSpecimenToDelete(null)}
    />
  </div>;
};
export {
  AdminSpecimensListPage
};
