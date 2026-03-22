import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AdSetting {
  id: string;
  ad_slot_name: string;
  ad_client: string;
  ad_slot: string;
  ad_format: string;
  is_enabled: boolean;
  custom_style: string | null;
}

export const useAdSettings = () => {
  const [ads, setAds] = useState<AdSetting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAds();
  }, []);

  const fetchAds = async () => {
    const { data } = await supabase
      .from("ad_settings")
      .select("*");
    setAds((data as AdSetting[]) || []);
    setLoading(false);
  };

  const getAd = (slotName: string) => ads.find(a => a.ad_slot_name === slotName && a.is_enabled);

  return { ads, loading, refetch: fetchAds, getAd };
};

export const usePublicAds = () => {
  const [ads, setAds] = useState<AdSetting[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("ad_settings")
        .select("*");
      setAds((data as AdSetting[]) || []);
    };
    fetch();
  }, []);

  const getAd = (slotName: string) => ads.find(a => a.ad_slot_name === slotName);

  return { ads, getAd };
};
