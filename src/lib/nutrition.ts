import type { Client, FoodItem, NutritionTarget } from "../data/types";

/** Bază de alimente generice, valori medii la 100 g (gătite unde se specifică). */
export const FOODS: FoodItem[] = [
  { id: "f-ou", name: "Ou întreg", per100: { kcal: 143, p: 12.6, c: 0.7, f: 9.5 }, unit: { label: "1 ou", grams: 55 } },
  { id: "f-albus", name: "Albuș de ou", per100: { kcal: 52, p: 10.9, c: 0.7, f: 0.2 }, unit: { label: "1 albuș", grams: 33 } },
  { id: "f-pui", name: "Piept de pui, gătit", per100: { kcal: 165, p: 31, c: 0, f: 3.6 } },
  { id: "f-curcan", name: "Piept de curcan, gătit", per100: { kcal: 147, p: 30, c: 0, f: 2.1 } },
  { id: "f-vita", name: "Carne de vită slabă, gătită", per100: { kcal: 217, p: 26, c: 0, f: 12 } },
  { id: "f-porc", name: "Cotlet de porc, gătit", per100: { kcal: 231, p: 25.7, c: 0, f: 14 } },
  { id: "f-somon", name: "Somon, gătit", per100: { kcal: 206, p: 22, c: 0, f: 12.4 } },
  { id: "f-ton", name: "Ton în apă, scurs", per100: { kcal: 116, p: 25.5, c: 0, f: 0.8 }, unit: { label: "1 conservă", grams: 120 } },
  { id: "f-sunca", name: "Șuncă de curcan", per100: { kcal: 104, p: 17, c: 2, f: 3 }, unit: { label: "1 felie", grams: 15 } },
  { id: "f-orez", name: "Orez alb, fiert", per100: { kcal: 130, p: 2.7, c: 28.2, f: 0.3 } },
  { id: "f-orezb", name: "Orez brun, fiert", per100: { kcal: 123, p: 2.7, c: 25.6, f: 1 } },
  { id: "f-paste", name: "Paste, fierte", per100: { kcal: 158, p: 5.8, c: 30.9, f: 0.9 } },
  { id: "f-cartof", name: "Cartofi, fierți", per100: { kcal: 87, p: 1.9, c: 20.1, f: 0.1 } },
  { id: "f-cartofd", name: "Cartofi dulci, copți", per100: { kcal: 90, p: 2, c: 20.7, f: 0.2 } },
  { id: "f-mamaliga", name: "Mămăligă", per100: { kcal: 70, p: 1.6, c: 15, f: 0.4 } },
  { id: "f-ovaz", name: "Fulgi de ovăz", per100: { kcal: 379, p: 13.2, c: 67.7, f: 6.5 }, unit: { label: "1 lingură", grams: 10 } },
  { id: "f-paine", name: "Pâine integrală", per100: { kcal: 247, p: 13, c: 41, f: 3.4 }, unit: { label: "1 felie", grams: 35 } },
  { id: "f-painea", name: "Pâine albă", per100: { kcal: 265, p: 9, c: 49, f: 3.2 }, unit: { label: "1 felie", grams: 30 } },
  { id: "f-iaurtg", name: "Iaurt grecesc 2%", per100: { kcal: 73, p: 9.9, c: 3.9, f: 2 }, unit: { label: "1 pahar", grams: 150 } },
  { id: "f-iaurt", name: "Iaurt simplu 3,5%", per100: { kcal: 61, p: 3.5, c: 4.7, f: 3.3 }, unit: { label: "1 pahar", grams: 140 } },
  { id: "f-vaci", name: "Brânză de vaci", per100: { kcal: 98, p: 11, c: 3.4, f: 4.3 } },
  { id: "f-telemea", name: "Telemea de vacă", per100: { kcal: 264, p: 17, c: 1.5, f: 21 } },
  { id: "f-cascaval", name: "Cașcaval", per100: { kcal: 350, p: 25, c: 1.3, f: 27 }, unit: { label: "1 felie", grams: 20 } },
  { id: "f-lapte", name: "Lapte 1,5%", per100: { kcal: 46, p: 3.3, c: 4.8, f: 1.5 }, unit: { label: "1 cană", grams: 250 } },
  { id: "f-whey", name: "Proteină whey (pudră)", per100: { kcal: 380, p: 78, c: 7, f: 5 }, unit: { label: "1 măsură", grams: 30 } },
  { id: "f-banana", name: "Banană", per100: { kcal: 89, p: 1.1, c: 22.8, f: 0.3 }, unit: { label: "1 banană", grams: 120 } },
  { id: "f-mar", name: "Măr", per100: { kcal: 52, p: 0.3, c: 13.8, f: 0.2 }, unit: { label: "1 măr", grams: 180 } },
  { id: "f-portocala", name: "Portocală", per100: { kcal: 47, p: 0.9, c: 11.8, f: 0.1 }, unit: { label: "1 portocală", grams: 160 } },
  { id: "f-capsuni", name: "Căpșuni", per100: { kcal: 32, p: 0.7, c: 7.7, f: 0.3 } },
  { id: "f-afine", name: "Afine", per100: { kcal: 57, p: 0.7, c: 14.5, f: 0.3 } },
  { id: "f-avocado", name: "Avocado", per100: { kcal: 160, p: 2, c: 8.5, f: 14.7 }, unit: { label: "1/2 avocado", grams: 75 } },
  { id: "f-broccoli", name: "Broccoli", per100: { kcal: 34, p: 2.8, c: 6.6, f: 0.4 } },
  { id: "f-rosii", name: "Roșii", per100: { kcal: 18, p: 0.9, c: 3.9, f: 0.2 }, unit: { label: "1 roșie", grams: 120 } },
  { id: "f-castravete", name: "Castravete", per100: { kcal: 15, p: 0.7, c: 3.6, f: 0.1 } },
  { id: "f-salata", name: "Salată verde", per100: { kcal: 15, p: 1.4, c: 2.9, f: 0.2 } },
  { id: "f-fasole", name: "Fasole boabe, fiartă", per100: { kcal: 127, p: 8.7, c: 22.8, f: 0.5 } },
  { id: "f-linte", name: "Linte, fiartă", per100: { kcal: 116, p: 9, c: 20.1, f: 0.4 } },
  { id: "f-naut", name: "Năut, fiert", per100: { kcal: 164, p: 8.9, c: 27.4, f: 2.6 } },
  { id: "f-nuci", name: "Nuci", per100: { kcal: 654, p: 15.2, c: 13.7, f: 65.2 }, unit: { label: "1 mână", grams: 30 } },
  { id: "f-migdale", name: "Migdale", per100: { kcal: 579, p: 21.2, c: 21.6, f: 49.9 }, unit: { label: "1 mână", grams: 30 } },
  { id: "f-unta", name: "Unt de arahide", per100: { kcal: 588, p: 25, c: 20, f: 50 }, unit: { label: "1 lingură", grams: 16 } },
  { id: "f-ulei", name: "Ulei de măsline", per100: { kcal: 884, p: 0, c: 0, f: 100 }, unit: { label: "1 lingură", grams: 13 } },
  { id: "f-miere", name: "Miere", per100: { kcal: 304, p: 0.3, c: 82.4, f: 0 }, unit: { label: "1 linguriță", grams: 7 } },
  { id: "f-ciorba", name: "Ciorbă de legume", per100: { kcal: 35, p: 1.2, c: 5.5, f: 0.9 }, unit: { label: "1 bol", grams: 350 } },
  { id: "f-ciorbap", name: "Ciorbă de perișoare", per100: { kcal: 60, p: 3.5, c: 5, f: 2.8 }, unit: { label: "1 bol", grams: 350 } },
  { id: "f-sarmale", name: "Sarmale", per100: { kcal: 190, p: 9, c: 9, f: 13 }, unit: { label: "1 sarma", grams: 70 } },
  { id: "f-mici", name: "Mici", per100: { kcal: 275, p: 16, c: 2, f: 22.5 }, unit: { label: "1 mic", grams: 60 } },
  { id: "f-pizza", name: "Pizza (medie)", per100: { kcal: 266, p: 11, c: 33, f: 10 }, unit: { label: "1 felie", grams: 110 } },
  { id: "f-ciocolata", name: "Ciocolată neagră 70%", per100: { kcal: 598, p: 7.8, c: 45.9, f: 42.6 }, unit: { label: "1 pătrățel", grams: 10 } },
  { id: "f-cola", name: "Băutură carbogazoasă cu zahăr", per100: { kcal: 42, p: 0, c: 10.6, f: 0 }, unit: { label: "1 doză", grams: 330 } },
  { id: "f-bere", name: "Bere", per100: { kcal: 43, p: 0.5, c: 3.6, f: 0 }, unit: { label: "1 sticlă", grams: 500 } },
  // Produsele de la barul sălii — coduri interne (prefix 2 = uz intern magazin)
  { id: "f-sg-apa", name: "Apă plată 0,5 L", brand: "Bar Spartan", barcode: "2000000000017", per100: { kcal: 0, p: 0, c: 0, f: 0 }, unit: { label: "1 sticlă", grams: 500 } },
  { id: "f-sg-baton", name: "Baton proteic ciocolată", brand: "Bar Spartan", barcode: "2000000000024", per100: { kcal: 365, p: 33, c: 33, f: 11, sugar: 3 }, unit: { label: "1 baton", grams: 60 } },
  { id: "f-sg-shake", name: "Shake proteic vanilie", brand: "Bar Spartan", barcode: "2000000000031", per100: { kcal: 64, p: 10, c: 4.5, f: 0.6 }, unit: { label: "1 sticlă", grams: 330 } },
  { id: "f-sg-izo", name: "Băutură izotonică", brand: "Bar Spartan", barcode: "2000000000048", per100: { kcal: 24, p: 0, c: 5.9, f: 0 }, unit: { label: "1 sticlă", grams: 500 } },
];

export const findByBarcode = (code: string) => FOODS.find((f) => f.barcode === code);

export function searchFoods(q: string, extra: FoodItem[] = []): FoodItem[] {
  const norm = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  const n = norm(q.trim());
  const all = [...extra, ...FOODS];
  if (!n) return all.slice(0, 12);
  return all.filter((f) => norm(`${f.name} ${f.brand ?? ""}`).includes(n)).slice(0, 20);
}

/** Caută produsul în Open Food Facts (baza publică, gratuită). Necesită internet. */
export async function lookupOpenFoodFacts(code: string): Promise<FoodItem | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 6000);
  try {
    const r = await fetch(
      `https://world.openfoodfacts.org/api/v2/product/${encodeURIComponent(code)}.json?fields=product_name,product_name_ro,brands,nutriments`,
      { signal: ctrl.signal },
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (j.status !== 1 || !j.product) return null;
    const n = j.product.nutriments ?? {};
    const kcal = n["energy-kcal_100g"] ?? (n["energy_100g"] ? n["energy_100g"] / 4.184 : undefined);
    if (kcal == null) return null;
    return {
      id: `off-${code}`,
      name: j.product.product_name_ro || j.product.product_name || `Produs ${code}`,
      brand: j.product.brands?.split(",")[0],
      barcode: code,
      per100: {
        kcal: Math.round(kcal),
        p: +(n.proteins_100g ?? 0),
        c: +(n.carbohydrates_100g ?? 0),
        f: +(n.fat_100g ?? 0),
        fiber: n.fiber_100g,
        sugar: n.sugars_100g,
        salt: n.salt_100g,
      },
    };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

/** Citește codul de bare dintr-o poză (funcționează offline). */
export async function decodeBarcodeFromFile(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);
  try {
    // 1. API-ul nativ al telefonului, unde există (Chrome Android)
    const BD = (globalThis as unknown as { BarcodeDetector?: new (o: object) => { detect: (s: ImageBitmapSource) => Promise<{ rawValue: string }[]> } }).BarcodeDetector;
    const img = await loadImage(url);
    if (BD) {
      try {
        const det = new BD({ formats: ["ean_13", "ean_8", "upc_a", "upc_e", "code_128"] });
        const res = await det.detect(img);
        if (res[0]?.rawValue) return res[0].rawValue;
      } catch {
        /* trecem la ZXing */
      }
    }
    // 2. ZXing (bibliotecă JS)
    const { BrowserMultiFormatReader } = await import("@zxing/library");
    const reader = new BrowserMultiFormatReader();
    for (const scale of [1, 0.6, 1.6]) {
      try {
        const c = document.createElement("canvas");
        c.width = Math.round(img.naturalWidth * scale);
        c.height = Math.round(img.naturalHeight * scale);
        c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
        const scaled = await loadImage(c.toDataURL("image/jpeg", 0.92));
        const r = await reader.decodeFromImageElement(scaled);
        if (r?.getText()) return r.getText();
      } catch {
        /* încercăm altă scară */
      }
    }
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

export interface LabelValues {
  kcal?: number;
  p?: number;
  c?: number;
  f?: number;
  sugar?: number;
  fiber?: number;
  salt?: number;
}

/** Extrage valorile la 100 g din textul unei etichete nutriționale (română sau engleză). */
export function parseNutritionLabel(raw: string): LabelValues {
  const t = raw.toLowerCase().replace(/,/g, ".").replace(/[|]/g, " ");
  const num = (re: RegExp) => {
    const m = t.match(re);
    return m ? parseFloat(m[1]) : undefined;
  };
  const out: LabelValues = {};
  out.kcal = num(/(\d+(?:\.\d+)?)\s*kcal/) ?? (() => {
    const kj = num(/(\d+(?:\.\d+)?)\s*kj/);
    return kj ? Math.round(kj / 4.184) : undefined;
  })();
  out.f = num(/(?:gr[aă]simi|fat|lipide)[^\d]{0,25}(\d+(?:\.\d+)?)/);
  out.c = num(/(?:glucide|carbohydrate|carbohidra[tț]i)[^\d]{0,25}(\d+(?:\.\d+)?)/);
  out.sugar = num(/(?:zaharuri|sugars)[^\d]{0,25}(\d+(?:\.\d+)?)/);
  out.fiber = num(/(?:fibre|fibers|fibre alimentare)[^\d]{0,25}(\d+(?:\.\d+)?)/);
  out.p = num(/(?:proteine|protein)[^\d]{0,25}(\d+(?:\.\d+)?)/);
  out.salt = num(/(?:sare|salt)[^\d]{0,25}(\d+(?:\.\d+)?)/);
  return out;
}

/** Recunoaștere text (OCR) pe poza etichetei. Se încarcă doar la nevoie și are nevoie de internet prima dată. */
export async function ocrLabel(file: File, onProgress?: (p: number) => void): Promise<LabelValues | null> {
  try {
    const { createWorker } = await import("tesseract.js");
    const worker = await createWorker(["ron", "eng"], 1, {
      logger: (m: { status: string; progress: number }) => m.status === "recognizing text" && onProgress?.(m.progress),
    });
    const { data } = await worker.recognize(file);
    await worker.terminate();
    const v = parseNutritionLabel(data.text);
    return v.kcal != null || v.p != null ? v : null;
  } catch {
    return null;
  }
}

export function macrosFor(food: FoodItem, grams: number) {
  const k = grams / 100;
  return {
    kcal: Math.round(food.per100.kcal * k),
    p: +(food.per100.p * k).toFixed(1),
    c: +(food.per100.c * k).toFixed(1),
    f: +(food.per100.f * k).toFixed(1),
  };
}

/** Țintă zilnică orientativă: Mifflin-St Jeor, activitate moderată, ajustată după scop. */
export function targetFor(c: Pick<Client, "age" | "heightCm" | "weightKg" | "goals"> & { sex?: "M" | "F" | null }): NutritionTarget {
  const w = c.weightKg ?? 75;
  const h = c.heightCm ?? 175;
  const a = c.age ?? 30;
  const base = 10 * w + 6.25 * h - 5 * a + (c.sex === "M" ? 5 : c.sex === "F" ? -161 : -78);
  let kcal = base * 1.55;
  if (c.goals.includes("Slăbire")) kcal *= 0.85;
  else if (c.goals.includes("Masă musculară")) kcal *= 1.1;
  kcal = Math.round(kcal / 10) * 10;
  const p = Math.round(w * (c.goals.includes("Masă musculară") || c.goals.includes("Forță") ? 2 : 1.7));
  const f = Math.round(w * 0.9);
  const carbs = Math.max(50, Math.round((kcal - p * 4 - f * 9) / 4));
  return { kcal, p, c: carbs, f };
}
