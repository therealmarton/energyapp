import { useQuery } from "@tanstack/react-query";

import { api } from "../../api";
import { useDateWindow } from "../../stores/useDateWindow";

export function useSettlement() {
  const { start, end, startIso, endIso } = useDateWindow();
  return useQuery({
    queryKey: ["settlement", start, end],
    queryFn: () => api.settlement(startIso(), endIso()),
  });
}
