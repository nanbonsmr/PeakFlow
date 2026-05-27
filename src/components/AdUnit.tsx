import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdUnitProps {
  adClient: string;
  adSlot: string;
  adFormat?: string;
  className?: string;
  slotName?: string;
  adSettingId?: string;
  articleId?: string;
}

declare global {
  interface Window {
    adsbygoogle: unknown[];
  }
}

const logEvent = async (
  eventType: "impression" | "click",
  slotName?: string,
  adSettingId?: string,
  articleId?: string,
) => {
  if (!slotName) return;
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await (supabase.from as any)("ad_events").insert({
      ad_slot_name: slotName,
      event_type: eventType,
      ad_setting_id: adSettingId ?? null,
      article_id: articleId ?? null,
      user_id: user?.id ?? null,
    });
  } catch (e) {
    // silent fail — tracking should never break the page
  }
};

const AdUnit = ({
  adClient,
  adSlot,
  adFormat = "auto",
  className = "",
  slotName,
  adSettingId,
  articleId,
}: AdUnitProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (!adClient || !adSlot) return;
    if (pushed.current) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
      logEvent("impression", slotName, adSettingId, articleId);
    } catch (e) {
      console.error("AdSense error:", e);
    }
  }, [adClient, adSlot, slotName, adSettingId, articleId]);

  if (!adClient || !adSlot) return null;

  return (
    <div
      className={`ad-container my-8 flex justify-center ${className}`}
      onClick={() => logEvent("click", slotName, adSettingId, articleId)}
    >
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
