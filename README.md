# Spartan Gym

Aplicația sălii Spartan Gym (Turda), gândită white-label pentru săli mici: clienții își văd abonamentul și progresul, antrenorii își urmăresc clienții, iar administratorul gestionează totul dintr-un singur panou.

## Pornire

```bash
npm install
npm run dev          # server local; deschide-l și de pe telefon (aceeași rețea Wi-Fi)
npm run build        # build pentru hosting (PWA)
npm run build:single # un singur fișier HTML, pentru demo
```

## Cum intri în demo

| Rol | Cum |
| --- | --- |
| Client nou | „Creează cont” pe ecranul de început |
| Client existent | „Am deja cont”. Clienții generați au parola `demo1234` |
| Antrenor | „Personal sală” → Antrenor. De exemplu `mihai.rus@spartangym.ro`, parola `demo1234` |
| Antrenor nou | „Personal sală” → Devino antrenor. Profilul apare după aprobarea administratorului |
| Administrator | „Personal sală” → Administrator, PIN `1234` |

Datele sunt comune pentru toate rolurile (stau în browser, în demo). Ce face clientul apare imediat la antrenor și la administrator, inclusiv între tab-uri deschise în paralel.

## Ce conține

**Client**: cont cu termeni, GDPR și locație; profil (poză, vârstă, înălțime, greutate, obiective, puncte forte și slabe); abonament animat cu zilele rămase; plată cu cardul în aplicație sau la recepție; check-in cu cod QR; plan de antrenament pe zile, modificabil pentru ziua curentă; notarea seriilor la fiecare aparat, cu valorile de data trecută; cronometru de pauză; recorduri personale; corp 3D cu grupele lucrate în săptămână; grafic de greutate și volum; poze de evoluție private, publice sau doar pentru anumite persoane; calculator nutrițional (cod de bare, poză la eticheta nutrițională, căutare, manual); clasamente; provocări validate de antrenor; puncte, niveluri și recompense; prețuri, bar, dotări, galerie, aparate; profilurile antrenorilor și programări; recenzii, reclamații și propuneri; notificări; export și ștergere date.

**Antrenor**: înscriere cu aprobare; profil public (poză, istoric, descriere, poze de evoluție, pachete și prețuri); disponibilitate pe zile și zile libere; cereri de programare; clienții care i-au dat acces, cu antrenamente, nutriție, progres și poze permise; notițe private și recomandări; validarea provocărilor.

**Administrator**: panou cu clienți activi, încasări, check-in-uri, abonamente care expiră și clienți la risc; recepție (check-in prin QR sau nume, încasare abonamente, vânzare la bar, coduri de recompensă); fișa fiecărui client cu plăți și calendar de prezență; rapoarte de încasări pe perioade și metode de plată; stoc; abonamente și prețuri; notificări și reamintiri de reînnoire; reguli de puncte și recompense; provocări; aprobarea antrenorilor; recenzii și reclamații cu răspuns; datele sălii, programul, dotările, pozele reale și aparatele; culoarea sălii (white-label).

## Tehnologie

- React 18 + TypeScript + Vite, Tailwind CSS 4
- Motion pentru animații, Three.js (React Three Fiber) pentru 3D
- Zustand pentru date, salvate local în demo
- QR: `qrcode`; coduri de bare: API-ul nativ al telefonului sau ZXing; etichete nutriționale: Tesseract (OCR); produse: Open Food Facts
- Fonturi Archivo + Inter, paleta Volt cu contrast verificat automat (WCAG AA)

## Înainte de lansare

- Server și bază de date (de exemplu Supabase), autentificare reală, roluri pentru personal
- Procesator de plăți (Stripe sau Netopia); casa de marcat rămâne obligatorie pentru plățile la recepție
- Notificări push reale
- Publicare în App Store și Google Play (împachetare cu Capacitor)
- Textele legale verificate de un jurist
