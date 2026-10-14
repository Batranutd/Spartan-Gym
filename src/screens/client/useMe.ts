import { useStore } from "../../store/useStore";
import type { Client } from "../../data/types";

/** Clientul autentificat. Ecranele clientului se afișează doar când există sesiune. */
export function useMe(): Client {
  const me = useStore((s) => s.clients.find((c) => c.id === s.session.clientId));
  return me as Client;
}
