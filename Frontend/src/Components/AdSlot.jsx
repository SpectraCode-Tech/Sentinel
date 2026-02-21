import React, { useEffect, useState } from "react";
import { fetchAdvertisements } from "../api";

export default function AdSlot({ placement }) {
  const [ad, setAd] = useState(null);

  useEffect(() => {
    fetchAdvertisements().then(res => {
      const now = new Date();

      // Filter ads that are active and match placement
      const validAds = res.data.filter(ad =>
        ad.is_active &&
        ad.placement === placement &&
        new Date(ad.start_date) <= now &&
        new Date(ad.end_date) >= now
      );

      if (validAds.length > 0) {
        // Pick a random ad from valid ones
        setAd(validAds[Math.floor(Math.random() * validAds.length)]);
      }
    });
  }, [placement]);

  if (!ad) return null;

  // inside AdSlot.jsx
return (
  <a href={ad.link} target="_blank" rel="noreferrer" className="block w-full">
    <img
      src={ad.image}
      alt={ad.title}
      // Added max-h-48 or max-h-64 to keep it under control
      className="w-full max-h-[250px] border border-border object-contain bg-white" 
    />
    {ad.title && (
      <p className="text-[10px] mt-2 font-serif text-gray-500 text-center uppercase tracking-widest">
        {ad.title}
      </p>
    )}
  </a>
);
}
