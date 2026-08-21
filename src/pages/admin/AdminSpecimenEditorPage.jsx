import { useState, useEffect } from "react";
import {
  ArrowLeft,
  Save,
  Image as ImageIcon,
  Plus,
  Trash2,
  Check,
  Star,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { api } from "../../services/api.js";
import { SpecimenImage } from "../../components/common/SpecimenImage.jsx";
const AdminSpecimenEditorPage = ({
  specimenId,
  onNavigate
}) => {
  const isEditing = Boolean(specimenId);
  const [formData, setFormData] = useState({
    accessionNumber: `SHB-${(/* @__PURE__ */ new Date()).getFullYear()}-${String(Math.floor(Math.random() * 900) + 100).padStart(3, "0")}`,
    scientificName: "",
    commonName: "",
    family: "",
    genus: "",
    species: "",
    kingdom: "Plantae",
    conservationStatus: "Least Concern",
    status: "PUBLISHED",
    collectionDate: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10),
    collectorName: "",
    collectionLocation: "",
    location: "",
    region: "Western Europe",
    coordinates: "",
    habitat: "",
    description: "",
    morphology: "",
    characteristics: "",
    geographicDistribution: "",
    traditionalUses: "",
    medicinalUses: "",
    ecologicalUses: "",
    collectionNotes: "",
    otherNotes: "",
    photos: []
  });
  const [isLoading, setIsLoading] = useState(isEditing);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoCaption, setNewPhotoCaption] = useState("");
  const [filePreviewUrl, setFilePreviewUrl] = useState("");
  // Tracks whether a local file is currently being sent to the server, so
  // we can show an "Uploading..." state and disable the Attach button
  // until the real specimen path (storageUrl) comes back.
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  useEffect(() => {
    if (isEditing && specimenId) {
      setIsLoading(true);
      api.getSpecimen(specimenId).then((res) => {
        setFormData(res.specimen);
      }).catch((err) => {
        setErrorMessage(err.message || "Failed to load specimen for editing");
      }).finally(() => {
        setIsLoading(false);
      });
    }
  }, [specimenId, isEditing]);
  useEffect(() => () => {
    if (filePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(filePreviewUrl);
  }, [filePreviewUrl]);
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === "scientificName") {
        const parts = value.trim().split(/\s+/);
        if (parts.length >= 1) updated.genus = parts[0];
        if (parts.length >= 2) updated.species = parts.slice(1).join(" ");
      }
      return updated;
    });
  };
  // Adds a photo (by direct URL, or the storageUrl from handleFileUpload
  // above) to this form's local state. The photo isn't saved to the
  // server yet — that happens when the whole specimen form is submitted
  // via handleSubmit, which sends the full "photos" array to the backend.
  const handleAddPhoto = () => {
    if (!newPhotoUrl.trim()) return;
    const currentPhotos = formData.photos || [];
    const newPhoto = {
      id: `photo-${Date.now()}`,
      specimenId: formData.id || "",
      storageUrl: newPhotoUrl.trim(),
      caption: newPhotoCaption.trim() || "Botanical voucher photograph",
      altText: formData.scientificName || "Botanical specimen",
      isPrimary: currentPhotos.length === 0,
      displayOrder: currentPhotos.length,
      uploadTimestamp: (/* @__PURE__ */ new Date()).toISOString()
    };
    setFormData((prev) => ({
      ...prev,
      photos: [...prev.photos || [], newPhoto]
    }));
    setNewPhotoUrl("");
    setNewPhotoCaption("");
    setFilePreviewUrl("");
  };
  const handleSetPrimaryPhoto = (index) => {
    setFormData((prev) => {
      const updated = (prev.photos || []).map((p, idx) => ({
        ...p,
        isPrimary: idx === index
      }));
      return { ...prev, photos: updated };
    });
  };
  const handleDeletePhoto = (index) => {
    setFormData((prev) => {
      const filtered = (prev.photos || []).filter((_, idx) => idx !== index);
      if (filtered.length > 0 && !filtered.some((p) => p.isPrimary)) {
        filtered[0].isPrimary = true;
      }
      return { ...prev, photos: filtered };
    });
  };
  // SPECIMEN FILE UPLOAD
  //
  // When an admin picks a local image file, we send it straight to the
  // server (POST /api/photos/upload via api.uploadPhotoFile) instead of
  // just previewing it in the browser. The server validates the file type
  // and size, saves it into the /uploads folder on disk, and returns a
  // real specimen path (storageUrl) like "/uploads/specimen-169..-a1b2.jpg".
  // That path is what we store on the specimen record when "Attach
  // Photograph to Record" is clicked below — the same photo will then
  // load correctly for every visitor, not just in this browser tab.
  const validateImageFile = async (file) => {
    const allowedTypes = new Set([
      "image/jpeg", "image/png", "image/webp", "image/gif", "image/bmp",
      "image/tiff", "image/tif", "image/svg+xml"
    ]);
    const allowedExtensions = /\.(jpe?g|png|webp|gif|bmp|tiff?|svg)$/i;
    const extension = file.name.match(/\.[^.]+$/)?.[0].toLowerCase();
    const inferredType = {
      ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".webp": "image/webp",
      ".gif": "image/gif", ".bmp": "image/bmp", ".tif": "image/tiff", ".tiff": "image/tiff", ".svg": "image/svg+xml"
    }[extension];
    const detectedType = file.type.toLowerCase() || inferredType;
    if ((!detectedType && !allowedExtensions.test(file.name)) || (detectedType && !allowedTypes.has(detectedType))) {
      throw new Error("Please choose a JPG, PNG, WebP, GIF, BMP, TIFF, or safe SVG image.");
    }
    if (file.size > 15 * 1024 * 1024) {
      throw new Error("Image is too large. Maximum file size is 15MB.");
    }
    const header = new Uint8Array(await file.slice(0, 16).arrayBuffer());
    const startsWith = (...bytes) => bytes.every((byte, index) => header[index] === byte);
    let signatureMatches;
    if (detectedType === "image/svg+xml") {
      const markup = await file.slice(0, 5120).text();
      signatureMatches = /<svg(?:\s|>)/i.test(markup) && !/<script|on[a-z]+\s*=|javascript:|<foreignObject/i.test(markup);
    } else {
      signatureMatches = startsWith(0xff, 0xd8, 0xff) || startsWith(137, 80, 78, 71, 13, 10, 26, 10) ||
        startsWith(0x47, 0x49, 0x46, 0x38) || startsWith(0x42, 0x4d) ||
        (startsWith(0x52, 0x49, 0x46, 0x46) && header[8] === 0x57 && header[9] === 0x45 && header[10] === 0x42 && header[11] === 0x50) ||
        (startsWith(0x49, 0x49, 0x2a, 0x00) || startsWith(0x4d, 0x4d, 0x00, 0x2a));
    }
    if (!signatureMatches) throw new Error("The selected file is not a valid supported image.");
  };
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await validateImageFile(file);
    } catch (err) {
      setErrorMessage(err.message);
      e.target.value = "";
      return;
    }
    setErrorMessage(null);
    if (filePreviewUrl.startsWith("blob:")) URL.revokeObjectURL(filePreviewUrl);
    const previewUrl = URL.createObjectURL(file);
    setFilePreviewUrl(previewUrl);
    setNewPhotoUrl("");
    setIsUploadingFile(true);
    try {
      const result = await api.uploadPhotoFile(file);
      // result.url is the specimen path returned by the server, e.g.
      // "/uploads/specimen-1699999999999-a1b2c3.jpg"
      setNewPhotoUrl(result.url);
    } catch (err) {
      setErrorMessage(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploadingFile(false);
      e.target.value = "";
    }
  };
  const handleSubmit = async (e, forceStatus) => {
    e.preventDefault();
    if (isSubmitting || isUploadingFile) return;
    setErrorMessage(null);
    setSuccessMessage(null);
    if (!formData.accessionNumber?.trim() || !formData.scientificName?.trim() || !formData.family?.trim()) {
      setErrorMessage("Accession Number, Scientific Name, and Family are mandatory.");
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        ...formData,
        status: forceStatus || formData.status || "PUBLISHED"
      };
      if (isEditing && specimenId) {
        const updated = await api.updateSpecimen(specimenId, payload);
        if (payload.status === "PUBLISHED" && updated.specimen?.status !== "PUBLISHED") {
          throw new Error("The specimen was saved, but publishing was not confirmed by the server.");
        }
        if (payload.status === "PUBLISHED") {
          sessionStorage.setItem("herbarium_catalog_notice", "Specimen published successfully!");
          onNavigate("/admin/specimens");
        } else {
          setSuccessMessage("Specimen voucher updated successfully.");
        }
      } else {
        const created = await api.createSpecimen(payload);
        if (!created.specimen || created.specimen.status !== payload.status) {
          throw new Error("The specimen save response did not confirm the requested status.");
        }
        if (payload.status === "PUBLISHED") {
          sessionStorage.setItem("herbarium_catalog_notice", "Specimen published successfully!");
          onNavigate("/admin/specimens");
        } else {
          setSuccessMessage("Specimen saved as draft.");
          onNavigate(`/admin/specimens/edit/${created.specimen.id}`);
        }
      }
    } catch (err) {
      setErrorMessage(err.message || "Error occurred while saving specimen record.");
    } finally {
      setIsSubmitting(false);
    }
  };
  if (isLoading) {
    return <div className="py-20 text-center space-y-4">
      <div className="w-8 h-8 border-3 border-[#1F4529] border-t-transparent rounded-full animate-spin mx-auto" />
      <p className="text-xs text-[#566158]">Loading voucher details...</p>
    </div>;
  }
  return <div className="space-y-8 max-w-5xl mx-auto pb-16">
    {
      /* Top Header & Actions */
    }
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E0D9CE] pb-4">
      <button
        onClick={() => onNavigate("/admin/specimens")}
        className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#47663B] hover:text-[#1F4529]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Specimens Catalog</span>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={isSubmitting || isUploadingFile}
          onClick={(e) => handleSubmit(e, "DRAFT")}
          className="px-4 py-2 bg-white hover:bg-[#FAF8F5] text-[#566158] border border-[#C7BEB1] text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
        >
          Save as Draft
        </button>
        <button
          type="button"
          disabled={isSubmitting || isUploadingFile}
          onClick={(e) => handleSubmit(e, "PUBLISHED")}
          className="px-5 py-2 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 shadow-xs"
        >
          {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSubmitting ? "Publishing..." : isEditing ? "Save & Publish Changes" : "Save & Publish Specimen"}</span>
        </button>
      </div>
    </div>

    {
      /* Messages */
    }
    {successMessage && <div className="p-4 bg-[#EBF3ED] border border-[#C5DDCB] text-[#1F4529] rounded-sm flex items-center gap-2.5 text-xs">
      <CheckCircle2 className="w-5 h-5 text-[#2D5A3D] shrink-0" />
      <span className="font-semibold">{successMessage}</span>
    </div>}

    {errorMessage && <div className="p-4 bg-[#FDF2F2] border border-[#F5C6C6] text-[#8F2D14] rounded-sm flex items-center gap-2.5 text-xs">
      <AlertCircle className="w-5 h-5 shrink-0" />
      <span>{errorMessage}</span>
    </div>}

    <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
      {
        /* Section 1: Identification & Taxonomy */
      }
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EDE7DD] pb-3">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
            1. Botanical Taxonomy & Identification
          </h2>
          <p className="text-xs text-[#566158]">
            Standardized binomial nomenclature and classification.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Accession Number <span className="text-[#8F2D14]">*</span>
            </label>
            <input
              type="text"
              required
              name="accessionNumber"
              value={formData.accessionNumber || ""}
              onChange={handleInputChange}
              placeholder="e.g. SHB-2024-001"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-mono-acc focus:ring-1 focus:ring-[#1F4529]"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Scientific Name (Binomen) <span className="text-[#8F2D14]">*</span>
            </label>
            <input
              type="text"
              required
              name="scientificName"
              value={formData.scientificName || ""}
              onChange={handleInputChange}
              placeholder="e.g. Ginkgo biloba L."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-serif-heading italic text-sm focus:ring-1 focus:ring-[#1F4529]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Botanical Family <span className="text-[#8F2D14]">*</span>
            </label>
            <input
              type="text"
              required
              name="family"
              value={formData.family || ""}
              onChange={handleInputChange}
              placeholder="e.g. Ginkgoaceae, Pinaceae"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Vernacular / Common Name
            </label>
            <input
              type="text"
              name="commonName"
              value={formData.commonName || ""}
              onChange={handleInputChange}
              placeholder="e.g. Maidenhair Tree"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              IUCN Conservation Status
            </label>
            <select
              name="conservationStatus"
              value={formData.conservationStatus || "Least Concern"}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm focus:ring-1 focus:ring-[#1F4529]"
            >
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
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Genus
            </label>
            <input
              type="text"
              name="genus"
              value={formData.genus || ""}
              onChange={handleInputChange}
              placeholder="e.g. Ginkgo"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm italic"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Specific Epithet
            </label>
            <input
              type="text"
              name="species"
              value={formData.species || ""}
              onChange={handleInputChange}
              placeholder="e.g. biloba"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm italic"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Archival Publication State
            </label>
            <select
              name="status"
              value={formData.status || "PUBLISHED"}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-semibold"
            >
              <option value="PUBLISHED">Published (Public Catalog)</option>
              <option value="DRAFT">Draft (Internal Curatorial Review)</option>
            </select>
          </div>
        </div>
      </div>

      {
        /* Section 2: Collection Field Metadata & Provenance */
      }
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EDE7DD] pb-3">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
            2. Field Collection Provenance & Ecology
          </h2>
          <p className="text-xs text-[#566158]">
            Georeferenced voucher details, dates, and ecological parameters.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Collector Name(s)
            </label>
            <input
              type="text"
              name="collectorName"
              value={formData.collectorName || ""}
              onChange={handleInputChange}
              placeholder="e.g. Dr. Eleanor Vance & A. Patel"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Collection Date
            </label>
            <input
              type="date"
              name="collectionDate"
              value={formData.collectionDate ? formData.collectionDate.slice(0, 10) : ""}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-mono-acc"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Biogeographic Region
            </label>
            <input
              type="text"
              name="region"
              value={formData.region || ""}
              onChange={handleInputChange}
              placeholder="e.g. East Asia, Western Europe"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Collection Site / Specific Locality
            </label>
            <input
              type="text"
              name="collectionLocation"
              value={formData.collectionLocation || formData.location || ""}
              onChange={handleInputChange}
              placeholder="e.g. Tianmu Mountain Reserve, Zhejiang Province"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              GPS Coordinates (WGS84)
            </label>
            <input
              type="text"
              name="coordinates"
              value={formData.coordinates || ""}
              onChange={handleInputChange}
              placeholder="e.g. 30.3421° N, 119.4312° E"
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm font-mono-acc"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
            Habitat, Substrate & Altitude
          </label>
          <input
            type="text"
            name="habitat"
            value={formData.habitat || ""}
            onChange={handleInputChange}
            placeholder="e.g. Deciduous mixed montane valley forest, acidic loam substrate, 1,100 m a.s.l."
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm"
          />
        </div>
      </div>

      {
        /* Section 3: High-Resolution Photographic Documentation */
      }
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EDE7DD] pb-3 flex items-center justify-between">
          <div>
            <h2 className="font-serif-heading text-lg font-bold text-[#1C241E] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#47663B]" />
              <span>3. Photographic Micrographs & Voucher Plates</span>
            </h2>
            <p className="text-xs text-[#566158]">
              Add digitized specimen sheets, anatomical micrographs, and field habit photos.
            </p>
          </div>
        </div>

        {
          /* Current Photos Gallery Grid */
        }
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {(formData.photos || []).map((photo, idx) => <div
            key={idx}
            className={`relative bg-[#FAF8F5] border rounded-sm p-2 flex flex-col justify-between ${photo.isPrimary ? "border-[#2D5A3D] ring-2 ring-[#2D5A3D]/20" : "border-[#E0D9CE]"}`}
          >
            <div className="aspect-4/3 bg-[#F3EFEA] rounded-xs overflow-hidden relative mb-2">
              <SpecimenImage
                src={photo.storageUrl}
                alt={photo.altText || ""}
                className="w-full h-full object-contain"
                fallbackClassName="w-full h-full"
              />
              {photo.isPrimary && <span className="absolute top-2 left-2 bg-[#2D5A3D] text-white text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-xs">
                Primary
              </span>}
            </div>

            <div className="space-y-1 text-xs">
              <p className="text-[11px] text-[#566158] line-clamp-2 leading-tight">
                {photo.caption || "No caption provided"}
              </p>
            </div>

            <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#EDE7DD] text-xs">
              {!photo.isPrimary && <button
                type="button"
                onClick={() => handleSetPrimaryPhoto(idx)}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1F4529] hover:underline"
              >
                <Star className="w-3.5 h-3.5" />
                <span>Set as Primary</span>
              </button>}
              {photo.isPrimary && <span className="text-[11px] font-bold text-[#2D5A3D] flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Primary View
              </span>}

              <button
                type="button"
                onClick={() => handleDeletePhoto(idx)}
                className="p-1 text-[#8F2D14] hover:bg-[#FDF2F2] rounded-xs transition-colors ml-auto"
                title="Remove Photo"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>)}
        </div>

        {
          /* Add New Photograph Subform */
        }
        <div className="bg-[#FAF8F5] border border-[#E0D9CE] rounded-sm p-4 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#1C241E]">
            Add Photo / Micrograph Voucher
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#566158]">
                Image URL or Direct Link
              </label>
              <input
                type="text"
                value={newPhotoUrl}
                onChange={(e) => setNewPhotoUrl(e.target.value)}
                placeholder="https://... or upload local file"
                className="w-full px-3 py-1.5 text-xs bg-white border border-[#C7BEB1] rounded-sm"
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#566158]">
                Or Upload Local File (Image)
              </label>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.gif,.bmp,.tif,.tiff,image/jpeg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml"
                onChange={handleFileUpload}
                disabled={isUploadingFile}
                className="w-full text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:bg-[#1F4529] file:text-white hover:file:bg-[#15321D] disabled:opacity-50"
              />
              {isUploadingFile && (
                <p className="text-[11px] text-[#566158]">Uploading image…</p>
              )}
              {(filePreviewUrl || newPhotoUrl) && <div className="mt-2 h-28 w-full overflow-hidden rounded-xs border border-[#C7BEB1] bg-white">
                <SpecimenImage
                  src={filePreviewUrl || newPhotoUrl}
                  alt="Selected specimen preview"
                  className="w-full h-full object-contain"
                  fallbackClassName="w-full h-full"
                />
              </div>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#566158]">
              Diagnostic Caption / Micrograph View Annotation
            </label>
            <input
              type="text"
              value={newPhotoCaption}
              onChange={(e) => setNewPhotoCaption(e.target.value)}
              placeholder="e.g. Transverse leaf cross-section showing resin ducts and stomatal crypts (400x)"
              className="w-full px-3 py-1.5 text-xs bg-white border border-[#C7BEB1] rounded-sm"
            />
          </div>

          <button
            type="button"
            onClick={handleAddPhoto}
            disabled={!newPhotoUrl.trim() || isUploadingFile}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#2D5A3D] hover:bg-[#22452E] text-white text-xs font-semibold uppercase tracking-wider rounded-sm disabled:opacity-40 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Attach Photograph to Record</span>
          </button>
        </div>
      </div>

      {
        /* Section 4: Botanical Descriptions & Morphology */
      }
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EDE7DD] pb-3">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
            4. Morphological Descriptions & Diagnostic Keys
          </h2>
          <p className="text-xs text-[#566158]">
            Detailed anatomical observations, vegetative traits, and diagnostic criteria.
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
            Morphology & Vegetative Architecture
          </label>
          <textarea
            name="morphology"
            rows={4}
            value={formData.morphology || ""}
            onChange={handleInputChange}
            placeholder="Describe leaves, venation, bark, phyllotaxy, flower/cone morphology, trichomes..."
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
            Key Diagnostic Characteristics (Separating from related taxa)
          </label>
          <textarea
            name="characteristics"
            rows={3}
            value={formData.characteristics || ""}
            onChange={handleInputChange}
            placeholder="Unique taxonomic discriminators..."
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
            Comprehensive Archival Description
          </label>
          <textarea
            name="description"
            rows={4}
            value={formData.description || ""}
            onChange={handleInputChange}
            placeholder="General scientific narrative and taxonomy summary..."
            className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
          />
        </div>
      </div>

      {
        /* Section 5: Ethnobotany, Pharmacognosy & Curatorial Notes */
      }
      <div className="bg-white border border-[#E0D9CE] rounded-sm p-6 sm:p-8 space-y-6">
        <div className="border-b border-[#EDE7DD] pb-3">
          <h2 className="font-serif-heading text-lg font-bold text-[#1C241E]">
            5. Ethnobotany, Pharmacognosy & Curatorial Notes
          </h2>
          <p className="text-xs text-[#566158]">
            Traditional preparations, phytochemical compounds, ecological roles, and notes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Traditional / Cultural Uses
            </label>
            <textarea
              name="traditionalUses"
              rows={3}
              value={formData.traditionalUses || ""}
              onChange={handleInputChange}
              placeholder="Folk botanical traditions, ceremonial usage, woodcraft..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Medicinal / Phytochemical Properties
            </label>
            <textarea
              name="medicinalUses"
              rows={3}
              value={formData.medicinalUses || ""}
              onChange={handleInputChange}
              placeholder="Bioactive compounds (flavonoids, alkaloids, terpenes) and pharmacological indications..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Ecological Interactions & Pollinators
            </label>
            <textarea
              name="ecologicalUses"
              rows={3}
              value={formData.ecologicalUses || ""}
              onChange={handleInputChange}
              placeholder="Mycorrhizal associations, specialized pollinators, host plant associations..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#566158]">
              Curatorial & Archival Notes
            </label>
            <textarea
              name="otherNotes"
              rows={3}
              value={formData.otherNotes || ""}
              onChange={handleInputChange}
              placeholder="Herbarium vault cabinet number, sheet condition, pest check notes..."
              className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#C7BEB1] rounded-sm resize-y"
            />
          </div>
        </div>
      </div>

      {
        /* Bottom Save Action Bar */
      }
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E0D9CE]">
        <button
          type="button"
          onClick={() => onNavigate("/admin/specimens")}
          className="px-4 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#566158] hover:bg-[#EAE5DE] rounded-sm transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={isSubmitting || isUploadingFile}
          onClick={(e) => handleSubmit(e, "DRAFT")}
          className="px-4 py-2.5 bg-white hover:bg-[#FAF8F5] text-[#566158] border border-[#C7BEB1] text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors"
        >
          Save as Draft
        </button>
        <button
          type="submit"
          disabled={isSubmitting || isUploadingFile}
          className="px-6 py-2.5 bg-[#1F4529] hover:bg-[#15321D] text-white text-xs font-semibold uppercase tracking-wider rounded-sm transition-colors flex items-center gap-2 shadow-xs"
        >
          {isSubmitting ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSubmitting ? "Publishing..." : isEditing ? "Save & Publish Changes" : "Save & Publish Specimen"}</span>
        </button>
      </div>
    </form>
  </div>;
};
export {
  AdminSpecimenEditorPage
};
