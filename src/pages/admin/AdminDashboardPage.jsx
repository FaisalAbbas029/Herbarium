import { useState, useEffect } from "react";
import {
  Layers,
  FileEdit,
  Sparkles,
  Users,
  History,
  ArrowRight,
  PlusCircle,
  Eye,
  Shield
} from "lucide-react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { SpecimenImage } from "../../components/common/SpecimenImage.jsx";
const AdminDashboardPage = ({ onNavigate }) => {
  const { user, isSuperAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentSpecimens, setRecentSpecimens] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [dashRes, specimensRes, logsRes] = await Promise.all([
          api.getDashboardStats().catch(() => null),
          api.searchSpecimens({ limit: 6, sortBy: "updated-desc" }).catch(() => ({ data: [] })),
          api.getActivityLogs(6).catch(() => ({ logs: [] }))
        ]);
        if (dashRes) {
          setStats(dashRes.stats);
        }
        if (specimensRes && specimensRes.data) {
          setRecentSpecimens(specimensRes.data);
        }
        if (logsRes && logsRes.logs) {
          setRecentLogs(logsRes.logs);
        }
      } catch (err) {
        console.error("Failed to load admin dashboard:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);
  if (isLoading) {
    return <div className="space-y-6 animate-pulse">
      <div className="h-24 bg-white border border-[#E0D9CE] rounded-sm" />
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-28 bg-white border border-[#E0D9CE] rounded-sm" />)}
      </div>
    </div>;
  }
  return <div className="space-y-8">
    {
      /* Welcome Banner */
    }
    <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="space-y-1">
        <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
          Archival Management
        </div>
        <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
          Welcome back, {user?.name}
        </h1>
        <p className="text-xs text-[#566158]">
          Gilgit-Baltistan Herbarium Archive Admin Panel • Role:{" "}
          <strong className="text-[#1F4529] uppercase">{user?.role === "curator" ? "Admin" : user?.role || "Admin"}</strong>
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onNavigate("/admin/specimens/new")}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors shadow-xs"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Specimen Voucher</span>
        </button>
      </div>
    </div>

    {
      /* Metrics Row */
    }
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-2">
        <div className="flex items-center justify-between text-[#6E7570]">
          <span className="text-xs uppercase font-semibold tracking-wider">Total Vouchers</span>
          <Layers className="w-4 h-4 text-[#2D5A3D]" />
        </div>
        <div className="font-serif-heading text-3xl font-bold text-[#1C241E]">
          {stats?.totalSpecimens ?? 0}
        </div>
        <div className="text-[11px] text-[#6E7570] flex items-center gap-1 font-mono-acc">
          <span className="text-[#2D5A3D] font-bold">{stats?.publishedCount ?? 0} published</span>
          <span>•</span>
          <span className="text-[#A45D25] font-bold">{stats?.draftCount ?? 0} drafts</span>
        </div>
      </div>

      <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-2">
        <div className="flex items-center justify-between text-[#6E7570]">
          <span className="text-xs uppercase font-semibold tracking-wider">Botanical Families</span>
          <Sparkles className="w-4 h-4 text-[#2D5A3D]" />
        </div>
        <div className="font-serif-heading text-3xl font-bold text-[#1C241E]">
          {stats?.totalFamilies ?? 0}
        </div>
        <div className="text-[11px] text-[#6E7570] font-mono-acc">
          Across {stats?.totalGenera ?? 0} distinct genera
        </div>
      </div>

      <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-2">
        <div className="flex items-center justify-between text-[#6E7570]">
          <span className="text-xs uppercase font-semibold tracking-wider">Digitized Photos</span>
          <Eye className="w-4 h-4 text-[#2D5A3D]" />
        </div>
        <div className="font-serif-heading text-3xl font-bold text-[#1C241E]">
          {stats?.totalPhotos ?? 0}
        </div>
        <div className="text-[11px] text-[#6E7570]">Micrographs & voucher sheets</div>
      </div>

      <div className="bg-white border border-[#E0D9CE] rounded-sm p-5 space-y-2">
        <div className="flex items-center justify-between text-[#6E7570]">
          <span className="text-xs uppercase font-semibold tracking-wider">Recent Activity</span>
          <Users className="w-4 h-4 text-[#2D5A3D]" />
        </div>
        <div className="font-serif-heading text-3xl font-bold text-[#1C241E]">
          {stats?.addedThisMonth ?? 0}
        </div>
        <div className="text-[11px] text-[#6E7570] font-mono-acc">
          Vouchers added this month
        </div>
      </div>
    </div>

    {
      /* Main 2-Column Split: Recent Specimens + Audit Logs */
    }
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {
        /* Left 7 Columns: Specimen Catalog Activity */
      }
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D9CE] pb-2">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
            Recent Specimen Records
          </h2>
          <button
            onClick={() => onNavigate("/admin/specimens")}
            className="text-xs font-semibold text-[#1F4529] hover:underline inline-flex items-center gap-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white border border-[#E0D9CE] rounded-sm divide-y divide-[#EDE7DD] overflow-hidden">
          {recentSpecimens.length === 0 ? <div className="p-8 text-center text-xs text-[#6E7570]">No specimens cataloged yet.</div> : recentSpecimens.map((specimen) => <div
            key={specimen.id}
            className="p-4 flex items-center justify-between gap-4 hover:bg-[#FAF8F5] transition-colors"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-12 h-12 rounded-xs bg-[#F3EFEA] overflow-hidden shrink-0 border border-[#E0D9CE]">
                <SpecimenImage
                  src={specimen.photos?.find((photo) => photo.isPrimary)?.storageUrl || specimen.photos?.[0]?.storageUrl}
                  alt={specimen.scientificName}
                  className="w-full h-full object-contain"
                  fallbackClassName="w-full h-full"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-mono-acc text-[#6E7570]">
                  <span className="font-bold text-[#1F4529]">{specimen.accessionNumber}</span>
                  <span>•</span>
                  <span className="uppercase">{specimen.family}</span>
                </div>
                <h3 className="font-serif-heading text-sm font-bold text-[#1C241E] truncate">
                  <span className="italic">{specimen.scientificName}</span>
                </h3>
                <p className="text-[11px] text-[#566158] truncate">{specimen.commonName || "No vernacular recorded"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {specimen.status === "DRAFT" ? <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#A45D25] text-white">
                Draft
              </span> : <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-xs bg-[#2D5A3D] text-white">
                Published
              </span>}
              <button
                onClick={() => onNavigate(`/admin/specimens/edit/${specimen.id}`)}
                className="p-1.5 text-[#566158] hover:text-[#1F4529] hover:bg-[#EAE5DE] rounded-xs transition-colors"
                title="Edit Specimen Record"
              >
                <FileEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onNavigate(`/specimen/${specimen.id}`)}
                className="p-1.5 text-[#566158] hover:text-[#1F4529] hover:bg-[#EAE5DE] rounded-xs transition-colors"
                title="View Public Sheet"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>
          </div>)}
        </div>
      </div>

      {
        /* Right 5 Columns: Curatorial Audit Trail */
      }
      <div className="lg:col-span-5 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E0D9CE] pb-2">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E] flex items-center gap-2">
            <History className="w-4 h-4 text-[#2D5A3D]" />
            <span>Curatorial Audit Trail</span>
          </h2>
          {isSuperAdmin && <button
            onClick={() => onNavigate("/admin/audit-logs")}
            className="text-xs font-semibold text-[#1F4529] hover:underline"
          >
            Full Logs
          </button>}
        </div>

        <div className="bg-white border border-[#E0D9CE] rounded-sm p-4 space-y-3">
          {recentLogs.length === 0 ? <div className="py-6 text-center text-xs text-[#6E7570]">
            No recent modifications recorded.
          </div> : <div className="divide-y divide-[#EDE7DD]">
            {recentLogs.slice(0, 6).map((log) => <div key={log.id} className="py-2.5 first:pt-0 last:pb-0 text-xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[#1C241E] font-mono-acc">
                  {log.action}
                </span>
                <span className="text-[10px] text-[#8E9990] font-mono-acc">
                  {new Date(log.timestamp).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit"
                  })}
                </span>
              </div>
              <p className="text-[11px] text-[#566158] leading-tight">
                {log.notes || (log.specimenScientificName ? `Specimen: ${log.specimenScientificName}` : "Curatorial action")}
              </p>
              <div className="text-[10px] text-[#6E7570]">
                By: <span className="font-medium text-[#1F4529]">{log.userName}</span>
              </div>
            </div>)}
          </div>}
        </div>

        {
          /* Quick Institutional Resources */
        }
        <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-4 space-y-2 text-xs">
          <div className="font-bold text-[#1C241E] uppercase text-[11px] flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-[#47663B]" />
            <span>Curatorial Guidelines Reminder</span>
          </div>
          <p className="text-[#566158] leading-relaxed">
            Ensure binomial epithets adhere to ICN nomenclature rules. All photographic uploads must specify morphological view annotations and magnification index.
          </p>
        </div>
      </div>
    </div>
  </div>;
};
export {
  AdminDashboardPage
};
