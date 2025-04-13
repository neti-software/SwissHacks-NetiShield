import { useState, useEffect } from "react";
import { api } from "../api/api";

export const useAdminAddress = () => {
  const [adminAddress, setAdminAddress] = useState<string>("");

  useEffect(() => {
    const fetchAdminAddress = async () => {
      try {
        const response = await api.xrpl.xrplControllerGetConfig();
        if (response.data && response.data.adminAddress) {
          setAdminAddress(response.data.adminAddress);
        }
      } catch (error) {
        console.error("Error fetching admin address:", error);
      }
    };

    fetchAdminAddress();
  }, []);

  return { adminAddress };
};
