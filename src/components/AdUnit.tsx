import { useEffect, useRef } from "react";

interface AdUnitProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const AdUnit = ({ adClient, adSlot, adFormat = "auto", className = "" }: AdUnitProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adClient || !adSlot) return;
    if (pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [adClient, adSlot]);

  if (!adClient || !adSlot) return null;

  return (
    <div className={`ad-container my-8 flex justify-center ${className}`}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdUnit;
