import { useEffect, useState } from "react";
import { fetchAdvertisements } from "../api";

export default function AdSlot({ placement }) {
  const [ads, setAds] = useState([]);

  useEffect(() => {
    fetchAdvertisements(placement)
      .then((res) => {
        setAds(res.data.results || res.data);
      })
      .catch(() => { });
  }, [placement]);

  if (!ads.length) return null;

  return (
    <div>
      {ads.map((ad) => (
        <a
          key={ad.id}
          href={ad.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={ad.image} alt={ad.title} />
        </a>
      ))}
    </div>
  );
}