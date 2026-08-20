import { useState, useEffect } from "react";
import {
  Shield
} from "lucide-react";
import { api } from "../../services/api.js";
import { useAuth } from "../../context/AuthContext.jsx";
const AdminAuditLogsPage = ({ onNavigate }) => {
  const { isSuperAdmin } = useAuth();
  const [logs, setLogs] = useState([]);
  const [actionFilter, setActionFilter] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.getActivityLogs(
        100,
        actionFilter !== "ALL" ? actionFilter : void 0
      );
      setLogs(res.logs || []);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    if (isSuperAdmin) {
      fetchLogs();
    }
  }, [actionFilter, isSuperAdmin]);
  if (!isSuperAdmin) {
    return <div className="bg-white border border-[#E0D9CE] rounded-sm p-8 text-center space-y-3">
        <Shield className="w-8 h-8 text-[#8F2D14] mx-auto" />
        <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
          Curatorial Audit Trail Restricted
        </h2>
        <p className="text-xs text-[#566158] max-w-md mx-auto">
          Audit logs contain security and governance history accessible only by Superadministrators.
        </p>
      </div>;
  }
  const getActionBadgeClass = (action) => {
    if (action.includes("DELETE") || action.includes("REVOKE")) {
      return "bg-[#FDF2F2] text-[#8F2D14] border-[#F5C6C6]";
    }
    if (action.includes("CREATE") || action.includes("INVITE") || action.includes("REGISTER") || action.includes("PUBLISH")) {
      return "bg-[#EBF3ED] text-[#1F4529] border-[#C5DDCB]";
    }
    if (action.includes("UPDATE") || action.includes("EDIT") || action.includes("REPLACE")) {
      return "bg-[#FEF7EC] text-[#A45D25] border-[#FBD9A5]";
    }
    return "bg-[#FAF8F5] text-[#566158] border-[#E0D9CE]";
  };
  return <div className="space-y-6">
      {
    /* Header */
  }
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs uppercase font-bold tracking-widest text-[#47663B]">
            System Governance
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#1C241E]">
            Archival Audit Logs & History
          </h1>
          <p className="text-xs text-[#566158]">
            Tamper-evident record of all voucher modifications, taxonomic updates, and staff actions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
    value={actionFilter}
    onChange={(e) => {
      setActionFilter(e.target.value);
    }}
    className="px-3 py-2 text-xs bg-white border border-[#C7BEB1] rounded-sm focus:outline-hidden focus:ring-1 focus:ring-[#1F4529]"
  >
            <option value="ALL">All Curatorial Actions</option>
            <option value="CREATE">Specimen Created</option>
            <option value="UPDATE">Specimen Updated</option>
            <option value="DELETE">Specimen Deleted</option>
            <option value="PUBLISH">Specimen Published</option>
            <option value="UNPUBLISH">Specimen Unpublished</option>
            <option value="PHOTO_ADD">Photo Attached</option>
            <option value="PRIMARY_PHOTO_CHANGE">Primary Photo Changed</option>
          </select>
        </div>
      </div>

      {
    /* Logs Table */
  }
      <div className="bg-white border border-[#E0D9CE] rounded-sm overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#E0D9CE] text-[#566158] uppercase font-semibold text-[11px] tracking-wider">
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4">Curator</th>
                <th className="py-3 px-4">Action Event</th>
                <th className="py-3 px-4">Specimen / Target</th>
                <th className="py-3 px-4">Modification Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE7DD]">
              {isLoading ? <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#6E7570]">
                    Loading audit trail events...
                  </td>
                </tr> : logs.length === 0 ? <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-[#6E7570]">
                    No audit records recorded for this filter.
                  </td>
                </tr> : logs.map((log) => <tr key={log.id} className="hover:bg-[#FAF8F5] transition-colors">
                    <td className="py-3 px-4 whitespace-nowrap font-mono-acc text-[#6E7570]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="font-semibold text-[#1C241E]">{log.userName}</div>
                      <div className="text-[10px] text-[#8E9990] font-mono-acc">{log.userEmail}</div>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
    className={`inline-block px-2 py-0.5 text-[10px] font-bold font-mono-acc uppercase border rounded-xs ${getActionBadgeClass(
      log.action
    )}`}
  >
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 whitespace-nowrap">
                      {log.specimenScientificName ? <div>
                          <span className="font-bold italic text-[#1C241E] block">
                            {log.specimenScientificName}
                          </span>
                          <span className="text-[10px] text-[#6E7570] font-mono-acc">
                            {log.specimenAccession || log.specimenId}
                          </span>
                        </div> : <span className="text-[#8E9990]">—</span>}
                    </td>
                    <td className="py-3 px-4 text-[#566158] leading-relaxed">
                      {log.notes || "Recorded system event"}
                      {log.fieldChanged && <span className="block font-mono-acc text-[10px] text-[#47663B] mt-0.5">
                          Field: {log.fieldChanged}
                        </span>}
                    </td>
                  </tr>)}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};
export {
  AdminAuditLogsPage
};
