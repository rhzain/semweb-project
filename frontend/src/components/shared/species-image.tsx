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
}

export function SpeciesImage({
  imageUrl,
  imageSource,
  scientificName,
  kingdom,
  className,
  showSourceLink = false,
}: SpeciesImageProps) {
  const [failed, setFailed] = useState(false);
  const TypeIcon = kingdom === "Plantae" ? Leaf : PawPrint;
  const showImage = Boolean(imageUrl) && !failed;

  return (
    <div
      className={cn("relative flex overflow-hidden bg-secondary", className)}
    >
      {showImage ? (
        <img
          alt={scientificName}
          className="size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          onError={() => setFailed(true)}
          src={imageUrl}
        />
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
