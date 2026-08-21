import { useEffect, useState } from "react";

const getAssetUrl = (source) => {
    if (!source || /^(blob:|data:|https?:\/\/)/i.test(source)) return source;
    if (!source.startsWith("/uploads/")) return source;

    const configuredApiUrl = (import.meta.env.VITE_API_URL || "").trim().replace(/\/+$/, "");
    if (!configuredApiUrl) return source;
    const apiOrigin = configuredApiUrl.replace(/\/api\/?$/, "");
    return `${apiOrigin}${source}`;
};

const SpecimenImage = ({
    src,
    alt = "Specimen image",
    className = "",
    fallbackClassName = "",
    ...imageProps
}) => {
    const resolvedSrc = getAssetUrl(src);
    const [hasError, setHasError] = useState(!resolvedSrc);

    useEffect(() => {
        setHasError(!resolvedSrc);
    }, [resolvedSrc]);

    if (hasError) {
        return <div
            role="img"
            aria-label={alt}
            className={`flex items-center justify-center bg-[#F3EFEA] text-center text-xs text-[#566158] p-3 ${fallbackClassName || className}`}
        >
            Unable to display this specimen image. Please upload the image again.
        </div>;
    }

    return <img
        {...imageProps}
        src={resolvedSrc}
        alt={alt}
        className={className}
        onError={() => setHasError(true)}
    />;
};

export { SpecimenImage, getAssetUrl };
