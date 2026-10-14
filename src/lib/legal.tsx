import type { ReactNode } from "react";
import { brand } from "../brand";

// Texte model pentru demo. Înainte de lansare trebuie verificate de un jurist.

function S({ t, children }: { t: string; children: ReactNode }) {
  return (
    <section className="mb-5">
      <h3 className="text-text font-semibold text-[16px] mb-1.5">{t}</h3>
      {children}
    </section>
  );
}

export const TermsText = (
  <>
    <S t="1. Despre aplicație">
      <p>
        Aplicația {brand.gymName} te ajută să îți vezi abonamentul, să îți urmărești antrenamentele, alimentația și
        progresul și să comunici cu sala și cu antrenorii.
      </p>
    </S>
    <S t="2. Contul tău">
      <p>
        Datele din cont trebuie să fie reale. Contul este personal: nu îl împrumuta altei persoane. Codul de check-in
        este valabil doar pentru tine.
      </p>
    </S>
    <S t="3. Abonamente și plăți">
      <p>
        Abonamentele se pot plăti cu cardul în aplicație sau la recepție, cash ori cu cardul. Perioada de valabilitate
        este cea afișată în aplicație. Regulile de înghețare și rambursare sunt cele afișate de sală la secțiunea
        Prețuri.
      </p>
    </S>
    <S t="4. Puncte și recompense">
      <p>
        Punctele se acordă pentru prezență și pentru provocări validate de sală. Nu au valoare bănească, nu se
        transferă și expiră după 12 luni. Sala poate anula punctele obținute prin fraudă.
      </p>
    </S>
    <S t="5. Sănătate">
      <p>
        Informațiile din aplicație nu sunt sfat medical. Consultă un medic înainte de a începe un program de
        antrenament sau o dietă, mai ales dacă ai o afecțiune.
      </p>
    </S>
    <S t="6. Conduită">
      <p>
        Recenziile, pozele publice și mesajele trebuie să fie respectuoase. Conținutul nepotrivit poate fi șters de
        administratorul sălii.
      </p>
    </S>
  </>
);

export const GdprText = (
  <>
    <S t="Cine prelucrează datele">
      <p>
        {brand.legalEntity}, {brand.city}. Contact: {brand.supportEmail}.
      </p>
    </S>
    <S t="Ce date folosim">
      <p>
        Nume, e-mail, telefon, poza de profil, vârsta, înălțimea, greutatea, obiectivele, antrenamentele, alimentația,
        pozele de progres și prezența la sală.
      </p>
    </S>
    <S t="De ce">
      <p>
        Pentru administrarea abonamentului, evidența prezenței, afișarea progresului tău și, doar dacă îți dai acordul,
        pentru ca un antrenor să te poată îndruma.
      </p>
    </S>
    <S t="Cine vede datele">
      <p>
        Datele despre corp și pozele de progres sunt private implicit. Antrenorii le văd doar dacă le dai tu acces, și
        poți retrage accesul oricând. Administratorul sălii vede datele de cont, abonamentul și prezența.
      </p>
    </S>
    <S t="Cât le păstrăm">
      <p>Cât timp ai cont activ. După ștergerea contului, datele sunt șterse în 30 de zile, cu excepția celor fiscale.</p>
    </S>
    <S t="Drepturile tale">
      <p>
        Acces, rectificare, ștergere, restricționare, portabilitate, opoziție și retragerea consimțământului, oricând,
        din setări sau la {brand.supportEmail}. Te poți adresa și ANSPDCP.
      </p>
    </S>
  </>
);

export const LocationText = (
  <>
    <p className="mb-3">
      Folosim locația doar cât aplicația este deschisă, ca să îți propunem check-in automat când ajungi la sală și să
      îți arătăm cât de aglomerată e sala.
    </p>
    <p>Nu urmărim locația în fundal și nu o păstrăm în istoric. Poți schimba oricând permisiunea din setările telefonului.</p>
  </>
);
