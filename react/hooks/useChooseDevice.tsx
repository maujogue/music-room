import { getAvailableDevices } from "@/services/player";
import { useState, useEffect, useCallback } from "react";

export default function useGetDevice() {
  const [devices, setDevices] = useState<SpotifyDevice[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const getDevice = useCallback(async (): Promise<SpotifyDevice[]> => {
    setLoading(true);
    setError(null);
    try {
      const available = await getAvailableDevices();
      setDevices(available ?? []);
      return available ?? [];
    } catch (err) {
      console.error("Error choosing device:", err);
      setError(err instanceof Error ? err : new Error(String(err)));
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void getDevice();
  }, [getDevice]);

  return {
    devices,
    loading,
    error,
    getDevice,
  };
}