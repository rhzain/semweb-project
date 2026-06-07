import { useState } from "react";
import { ImageOff, Leaf, PawPrint } from "lucide-react";

import { cn } from "@/lib/utils";

interface SpeciesImageProps {
  imageUrl?: string;
  imageSource?: string;
  scientificName: string;
  kingdom: string;
  className?: string;
  showSourceLink?: boolean;
  blurredBackdrop?: boolean;
}

export function SpeciesImage({
  imageUrl,
  imageSource,
  scientificName,
  kingdom,
  className,
  showSourceLink = false,
  blurredBackdrop = false,
}: SpeciesImageProps) {
  const [failed, setFailed] = useState(false);
  const TypeIcon = kingdom === "Plantae" ? Leaf : PawPrint;
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div
      className={cn("relative flex overflow-hidden bg-secondary", className)}
    >
      {showImage ? (
        blurredBackdrop ? (
          <>
            {/* Blurred backdrop */}
            <img
              alt=""
              aria-hidden="true"
              className="absolute inset-0 size-full scale-110 object-cover blur-xl brightness-75"
              src={imageUrl}
            />
            {/* Main image */}
            <img
              alt={scientificName}
              className="relative size-full object-contain"
              loading="lazy"
              onError={() => setFailed(true)}
              src={imageUrl}
            />
          </>
        ) : (
          <img
            alt={scientificName}
            className="size-full object-cover object-top"
            loading="lazy"
            onError={() => setFailed(true)}
            src={imageUrl}
          />
        )
      ) : (
        <div className="flex size-full items-center justify-center text-primary/65">
          {failed ? <ImageOff /> : <TypeIcon />}
        </div>
      )}
      {showImage && imageSource && showSourceLink ? (
        <a
          className="absolute right-2 bottom-2 rounded-md bg-background/85 px-2 py-1 text-[10px] font-medium text-muted-foreground backdrop-blur hover:text-foreground"
          href={imageSource}
          onClick={(event) => event.stopPropagation()}
          rel="noreferrer"
          target="_blank"
        >
          Sumber
        </a>
      ) : null}
    </div>
  );
}
