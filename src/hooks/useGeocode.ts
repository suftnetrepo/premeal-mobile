import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { suggestAddresses } from "../api/geocode";

export function useAddressSuggestions(query: string) {
  const [debounced, setDebounced] = useState(query);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  return useQuery({
    queryKey: ["geocode-suggest", debounced],
    queryFn: () => suggestAddresses(debounced),
    enabled: debounced.trim().length >= 3,
  });
}
