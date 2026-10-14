import { useRef } from "react";
import { useStore } from "../../store/useStore";
import type { Client } from "../../data/types";

/**
 * Clientul autentificat. La ieșirea din cont (sau ștergerea contului) ecranele
 * încă se animă câteva clipe, așa că păstrăm ultimul profil cunoscut.
 */
export function useMe(): Client {
  const me = useStore((s) => s.clients.find((c) => c.id === s.session.clientId));
  const last = useRef<Client | undefined>(me);
  if (me) last.current = me;
  return (me ?? last.current) as Client;
}
