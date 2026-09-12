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
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setHasError(!resolvedSrc);
        setIsLoaded(false);
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

    return (
      <div className="relative w-full h-full overflow-hidden">
        {!isLoaded && (
          <div className="absolute inset-0 bg-[#F3EFEA] skeleton-shimmer z-0" />
        )}
        <img
          {...imageProps}
          src={resolvedSrc}
          alt={alt}
          className={`${className} transition-opacity duration-500 ease-out ${isLoaded ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
        />
      </div>
    );
};

export { SpecimenImage, getAssetUrl };
