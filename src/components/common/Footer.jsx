import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faLeaf,
  faShieldHalved,
  faLocationDot,
  faEnvelope,
  faBookOpen
} from "@fortawesome/free-solid-svg-icons";
const Footer = ({ onNavigate }) => {
  return <footer className="bg-[#1C2820] text-[#D3DDD5] border-t border-[#2D3F33] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {
    /* Col 1: Herbarium Profile */
  }
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-sm bg-[#2D5A3D] text-[#FAF8F5] flex items-center justify-center">
                <FontAwesomeIcon icon={faLeaf} className="w-4 h-4 text-[#D8E6DC]" />
              </div>
              <span className="font-display tracking-widest text-lg font-bold text-[#FAF8F5]">
                GB Herbarium
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#A4B3A8]">
              International Index Herbariorum Code: <strong className="text-white font-mono-acc">SHB</strong>. Dedicated to the systematic preservation, digitized taxonomy, and open botanical research of vascular flora and cryptogamic vouchers.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-[#8A9B8F]">
              <FontAwesomeIcon icon={faShieldHalved} className="w-4 h-4 text-[#5A9E72]" />
              <span>Compliant with Darwin Core & TDWG Standards</span>
            </div>
          </div>

          {
    /* Col 2: Research & Archives */
  }
          <div className="space-y-3">
            <h3 className="font-serif-heading text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] border-b border-[#2D3F33] pb-2">
              Archive Resources
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
    onClick={() => onNavigate("/search")}
    className="hover:text-white transition-colors text-left"
  >
                  Digital Specimen Catalog
                </button>
              </li>
              <li>
                <button
    onClick={() => onNavigate("/families")}
    className="hover:text-white transition-colors text-left"
  >
                  Taxonomic Family Index
                </button>
              </li>
              <li>
                <button
    onClick={() => onNavigate("/search?conservationStatus=Vulnerable")}
    className="hover:text-white transition-colors text-left"
  >
                  Threatened & Red List Flora
                </button>
              </li>
              <li>
                <button
    onClick={() => onNavigate("/about")}
    className="hover:text-white transition-colors text-left"
  >
                  Herbarium Preservation Protocols
                </button>
              </li>
            </ul>
          </div>

          {
    /* Col 3: Institutional Links */
  }
          <div className="space-y-3">
            <h3 className="font-serif-heading text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] border-b border-[#2D3F33] pb-2">
              Institutional Curation
            </h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button
    onClick={() => onNavigate("/about")}
    className="hover:text-white transition-colors text-left"
  >
                  Curatorial Board & Staff
                </button>
              </li>
              <li>
                <button
    onClick={() => onNavigate("/contact")}
    className="hover:text-white transition-colors text-left"
  >
                  Specimen Loan Requests
                </button>
              </li>
              <li>
                <button
    onClick={() => onNavigate("/contact")}
    className="hover:text-white transition-colors text-left"
  >
                  Voucher Deposition Inquiries
                </button>
              </li>
              <li>
                <button
    onClick={() => onNavigate("/admin/login")}
    className="hover:text-[#88C49D] text-[#5A9E72] font-semibold transition-colors text-left"
  >
                  Curator / Admin Authentication →
                </button>
              </li>
            </ul>
          </div>

          {
    /* Col 4: Botanical Repository Contacts */
  }
          <div className="space-y-3">
            <h3 className="font-serif-heading text-sm font-semibold uppercase tracking-wider text-[#FAF8F5] border-b border-[#2D3F33] pb-2">
              Location & Contact
            </h3>
            <div className="space-y-2.5 text-xs text-[#A4B3A8]">
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faLocationDot} className="w-4 h-4 text-[#5A9E72] shrink-0 mt-0.5" />
                <a
                  href="https://www.google.com/maps/search/?api=1&query=35.92485897764096,74.36684641557514"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View Karakoram International University on Google Maps"
                  className="hover:text-[#5A9E72] transition-colors leading-relaxed"
                >
                  Department of Plant Sciences, Karakoram International University, Gilgit, Gilgit-Baltistan, Pakistan
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faEnvelope} className="w-4 h-4 text-[#5A9E72] shrink-0" />
                <a
                  href="mailto:gbherbarium@gmail.com"
                  aria-label="Email GB Herbarium"
                  className="hover:text-[#5A9E72] transition-colors cursor-pointer"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const mailtoUrl = "mailto:gbherbarium@gmail.com";
                    const gmailUrl = "https://mail.google.com/mail/?view=cm&fs=1&to=gbherbarium@gmail.com";
                    // Try to open native mail client
                    const iframe = document.createElement("iframe");
                    iframe.style.display = "none";
                    iframe.src = mailtoUrl;
                    document.body.appendChild(iframe);
                    setTimeout(() => {
                      document.body.removeChild(iframe);
                    }, 1000);
                    // After a short delay, if still on page, offer Gmail fallback
                    const start = Date.now();
                    window.addEventListener("blur", function onBlur() {
                      window.removeEventListener("blur", onBlur);
                    });
                    setTimeout(() => {
                      if (Date.now() - start < 1500) {
                        window.open(gmailUrl, "_blank", "noopener,noreferrer");
                      }
                    }, 1000);
                    window.location.href = mailtoUrl;
                  }}
                >
                  gbherbarium@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faBookOpen} className="w-4 h-4 text-[#5A9E72] shrink-0" />
                <span>Open for Research Mon–Fri 09:00–17:00</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-[#2D3F33] flex flex-col sm:flex-row items-center justify-between text-xs text-[#7A8B7F] gap-4">
          <div>
            © {(/* @__PURE__ */ new Date()).getFullYear()} Gilgit-Baltistan Herbarium Archive. All voucher records published under Creative Commons Attribution-NonCommercial (CC BY-NC 4.0).
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => onNavigate("/about")} className="hover:text-white transition-colors">
              Preservation Ethics
            </button>
            <button onClick={() => onNavigate("/contact")} className="hover:text-white transition-colors">
              Contact Curators
            </button>
            <button onClick={() => onNavigate("/admin")} className="hover:text-white transition-colors">
              Staff Portal
            </button>
          </div>
        </div>
      </div>
    </footer>;
};
export {
  Footer
};
