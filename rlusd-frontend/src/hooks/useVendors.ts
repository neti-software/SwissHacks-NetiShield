import { useState, useEffect } from "react";
import { VendorEntity } from "../generated/backendApi";
import { api } from "../api/api";

export const useVendors = () => {
  const [vendors, setVendors] = useState<VendorEntity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const { data } = await api.vendors.vendorsControllerGetAllVendors();
        setVendors(data);
      } catch (err) {
        console.error("Error fetching vendors:", err);
        setError("Failed to load vendors");
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, []);

  return { vendors, loading, error };
};
