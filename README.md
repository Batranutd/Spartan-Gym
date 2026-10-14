# Spartan Gym

Aplicația sălii Spartan Gym (Turda): abonament, progres, nutriție, antrenori, clasamente și recompense.
Gândită white-label: pentru altă sală se schimbă `src/brand.ts` (nume, culori, contact).

## Pornire

```bash
npm install
npm run dev          # server local, deschide-l și de pe telefon (aceeași rețea Wi-Fi)
npm run build        # build pentru hosting (PWA)
npm run build:single # un singur fișier HTML, pentru demo rapid
```

## Tehnologie

- React + TypeScript + Vite, Tailwind CSS 4
- Motion pentru animații, Three.js (React Three Fiber) pentru elementele 3D
- Fonturi: Archivo (titluri) + Inter (text), cu diacritice complete
- Paleta „Volt”: fundal `#0E0F12`, accent `#D4FF3A`, secundar `#7C5CFF`
- Demo: datele stau local pe telefon (fără server). Server real și publicare în App Store / Google Play mai târziu.

## Stadiu

- [x] Pasul 1: bun venit, creare cont, acorduri (termeni, GDPR, locație), profil, obiective, card de membru, autentificare
- [ ] Abonamentul animat și check-in QR
- [ ] Antrenamente pe zile și pe aparate, progres, poze de evoluție
- [ ] Calculator nutrițional (cod de bare, tabel nutrițional, manual)
- [ ] Prețuri și dotările sălii
- [ ] Clasamente, provocări, puncte și recompense
- [ ] Secțiunea antrenorilor
- [ ] Panoul de administrare (clienți, abonamente, încasări, stoc, notificări, recenzii)

Textele legale din aplicație sunt modele pentru demo și trebuie verificate de un jurist înainte de lansare.
