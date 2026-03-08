import { useEffect, useState } from "react";
import { fetchAdvertisements } from "../api";

export default function AdSlot({ placement }) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchAdvertisements(placement)
      .then((res) => {
        const data = res.data.results || res.data;

        /**
         * THE FIX: Strictly filter ads to match the placement prop.
         * This prevents 'footer' ads from appearing in 'sidebar' slots.
         */
        const filtered = data.filter(ad => ad.placement === placement);
        setAds(filtered);
      })
      .catch((err) => {
        console.error("Ad fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, [placement]);

  // Hide the entire component if there are no matching ads
  if (!loading && !ads.length) return null;

  return (
    <div className="my-8 w-full overflow-hidden">
      {/* Editorial Label - Keeps your site looking professional */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
          Advertisement
        </span>
        <div className="h-[1px] bg-border flex-grow opacity-50" />
      </div>

      <div className="flex flex-col gap-6">
        {ads.map((ad) => (
          <a
            key={ad.id}
            href={ad.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block w-full relative"
          >
            {/* Aspect container prevents layout shift during load */}
            <div className="bg-gray-50 rounded overflow-hidden">
              <img
                src={ad.image}
                alt={ad.title || "Sponsored Content"}
                className="w-full h-auto rounded border border-border transition-all duration-300 group-hover:opacity-90 group-hover:scale-[1.01]"
                loading="lazy"
              />
            </div>

            {ad.title && (
              <p className="mt-2 text-[11px] font-serif italic text-gray-500 text-center leading-tight px-2">
                {ad.title}
              </p>
            )}
          </a>
        ))}
      </div>
    </div>
  );
}