import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface ProductImagesProps {
  images: string[];
  productName?: string;
}

export function ProductImages({ images, productName }: ProductImagesProps) {
  const validImages = images.filter((img) => img && img.trim() !== "");

  const [resolvedImages, setResolvedImages] = useState<string[]>([]);

  useEffect(() => {
    const loadImages = async () => {
      const result: string[] = [];

      for (const img of validImages) {
        if (img.includes("wikipedia.org/w/api.php")) {
          try {
            const res = await fetch(img);
            const data = await res.json();

            const page = data?.query?.pages
              ? Object.values(data.query.pages)[0] as any
              : null;

            if (page?.thumbnail?.source) {
              result.push(page.thumbnail.source);
            } else {
              result.push(""); // fallback to hide
            }
          } catch {
            result.push("");
          }
        } else {
          result.push(img);
        }
      }

      setResolvedImages(result.filter(Boolean));
    };

    loadImages();
  }, [validImages]);

  if (resolvedImages.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card/40 border-2 border-border/60 rounded-[28px] p-6 shadow-[0_0_30px_rgba(124,58,237,0.1)]"
    >
      <h3 className="text-3xl font-bold text-accent mb-6 cool-font flex items-center gap-3">
        Product Images
      </h3>

      <div
        className={`grid gap-4 ${
          resolvedImages.length === 1
            ? "grid-cols-1 h-full"
            : resolvedImages.length === 2
            ? "grid-cols-2"
            : "grid-cols-2 md:grid-cols-3"
        }`}
      >
        {resolvedImages.map((img, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className={`relative rounded-[20px] overflow-hidden bg-background/40 border border-border/50 group ${
              resolvedImages.length === 1
                ? "h-[250px] w-auto mx-auto aspect-square"
                : "aspect-square"
            }`}
          >
            <img
              src={img}
              alt={`${productName || "Product"} - Image ${index + 1}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
