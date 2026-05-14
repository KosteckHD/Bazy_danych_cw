# ZADANIE 2 - System Zarządzania Wycieczkami
## Bazy danych – MongoDB (Wariant 3: Struktura Hybrydowa)

---

## 📋 Zawartość archiwum

```
zadanie2/
├── README.md                    ← Ten plik
├── BD_MongoDB_cw2.md           ← Opis zadania i rozwiązanie (część teoretyczna)
├── zadanie2_kod.js             ← Pełny kod MongoDB (inicjalizacja + operacje)
├── zadanie2_wyniki.js          ← Wyniki zapytań i operacji
├── zadanie2_dump.json          ← Eksport bazy danych w formacie JSON
└── instructionsy.txt           ← Instrukcje wdrożenia
```

---

## 🎯 Cel projektu

Zaproponowanie struktury bazy danych dla systemu zarządzania wycieczkami, gdzie:
- **Firmy** organizują wycieczki
- **Osoby** rezerwują miejsca i kupują bilety
- **Osoby** oceniają wycieczki

---

## 🏗️ Wybrana architektura: Wariant 3 (Hybrydowy)

### Kolekcje:

1. **companies** - Firmy organizujące wycieczki
   - Normalizowana struktura
   - Referencje z kolekcji excursions_hybrid
   
2. **persons** - Osoby (klienci)
   - Normalizowana struktura
   - Referencje (personID) w rezerwacjach

3. **excursions_hybrid** - Wycieczki (struktura hybrydowa)
   - Dane wycieczki
   - Zagnieżdżone rezerwacje (tablica)
   - Zagnieżdżone recenzje (tablica)
   - Referencje do companiesID i personID

### Dlaczego Wariant 3?

#### ✅ Zalety:
- **Szybkie odczyty**: Wycieczka z recenzjami i rezerwacjami = 1 zapytanie
- **Efektywna agregacja**: Przychody obliczone na zagnieżdżonych danych
- **Równowaga**: Mniej redundancji niż pełna denormalizacja
- **Skalowalna**: Dobrze pracuje dla 10,000+ wycieczek
- **Intuicyjna struktura**: Odpowiada logice domeny aplikacji

#### ⚠️ Kompromisy:
- Duplikacja nazw osób w rezerwacjach (wymaga synchronizacji)
- Zmiana danych osoby nie aktualizuje się automatycznie
- Dokument się powiększa wraz z rezerwacjami/recenzjami

---

## 📊 Schemat danych

### Kolekcja: companies
```json
{
  "_id": ObjectId("..."),
  "companyID": "COMP001",
  "name": "AwesomeTrips",
  "email": "info@awesometrips.com",
  "phone": "+48123456789",
  "address": "ul. Podróżna 10, Warszawa",
  "website": "www.awesometrips.com",
  "foundedYear": 2015,
  "rating": 4.5,
  "totalReviews": 150
}
```

### Kolekcja: persons
```json
{
  "_id": ObjectId("..."),
  "personID": "PER001",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@email.com",
  "phone": "+48987654321",
  "birthDate": ISODate("1985-03-15"),
  "nationality": "Polish",
  "registrationDate": ISODate("2024-01-10")
}
```

### Kolekcja: excursions_hybrid (uproszczony widok)
```json
{
  "_id": ObjectId("..."),
  "excursionID": "EXC001",
  "title": "Rejs po Dunaju",
  "destination": "Austria, Słowacja, Węgry",
  "startDate": ISODate("2026-06-15"),
  "pricePerPerson": 2500,
  "companyID": "COMP001",
  "companyName": "AwesomeTrips",
  "reservations": [
    {
      "reservationID": "RES001",
      "personID": "PER001",
      "personName": "Jan Kowalski",
      "numberOfSeats": 2,
      "totalPrice": 5000,
      "status": "Confirmed"
    }
  ],
  "reviews": [
    {
      "reviewID": "REV001",
      "personID": "PER001",
      "rating": 5,
      "comment": "Wspaniała wycieczka!"
    }
  ]
}
```

---

## 🚀 Instrukcja wdrożenia

### Krok 1: Przygotowanie środowiska
```bash
# Upewnij się, że MongoDB (mongosh/mongo) jest zainstalowana
# i dostępna w PATH
mongosh --version
```

### Krok 2: Wczytanie danych
```bash
# Opcja A: Wykonanie całego skryptu
cd /path/to/lab3
cat zadanie2_kod.js | mongosh

# Opcja B: Ręczne wczytanie
mongosh
# ... w powłoce mongosh:
> load("zadanie2_kod.js")
```

### Krok 3: Weryfikacja
```javascript
// W powłoce mongosh:
use test  // lub nazwa twojej bazy

// Sprawdź liczę dokumentów
db.companies.countDocuments()      // Powinno być 3
db.persons.countDocuments()         // Powinno być 4
db.excursions_hybrid.countDocuments() // Powinno być 3
```

---

## 📈 Przykładowe zapytania

### 1. Wycieczki z dostępnością > 30 miejsc
```javascript
db.excursions_hybrid.find(
  { availableSeats: { $gt: 30 } },
  { title: 1, destination: 1, availableSeats: 1, pricePerPerson: 1 }
);
```

### 2. Przychód z każdej wycieczki
```javascript
db.excursions_hybrid.aggregate([
  {
    $project: {
      title: 1,
      companyName: 1,
      totalRevenue: { $sum: "$reservations.totalPrice" },
      numberOfReservations: { $size: "$reservations" }
    }
  },
  { $sort: { totalRevenue: -1 } }
]);
```

### 3. Osoby z wieloma rezerwacjami
```javascript
db.excursions_hybrid.aggregate([
  { $unwind: "$reservations" },
  {
    $group: {
      _id: "$reservations.personID",
      personName: { $first: "$reservations.personName" },
      numberOfReservations: { $sum: 1 },
      totalSpent: { $sum: "$reservations.totalPrice" }
    }
  },
  { $sort: { totalSpent: -1 } }
]);
```

### 4. Wycieczki z oceną >= 4.0
```javascript
db.excursions_hybrid.find(
  { averageRating: { $gte: 4.0 } },
  { title: 1, averageRating: 1, reviews: 1 }
);
```

---

## 🔄 Operacje CRUD

### CREATE - Dodanie nowej rezerwacji
```javascript
db.excursions_hybrid.updateOne(
  { excursionID: "EXC001" },
  {
    $push: {
      reservations: {
        reservationID: "RES006",
        personID: "PER002",
        personName: "Maria Nowak",
        numberOfSeats: 1,
        totalPrice: 2500,
        reservationDate: ISODate("2026-06-01"),
        status: "Confirmed"
      }
    },
    $inc: { availableSeats: -1 }
  }
);
```

### READ - Pobranie wycieczki z recenzjami
```javascript
db.excursions_hybrid.findOne(
  { excursionID: "EXC001" },
  { title: 1, reviews: 1, averageRating: 1 }
);
```

### UPDATE - Zmiana oceny wycieczki
```javascript
db.excursions_hybrid.updateOne(
  { excursionID: "EXC001" },
  { $set: { averageRating: 4.8, totalReviews: 5 } }
);
```

### DELETE - Usunięcie recenzji
```javascript
db.excursions_hybrid.updateOne(
  { excursionID: "EXC001" },
  { $pull: { reviews: { reviewID: "REV001" } } }
);
```

---

## 📊 Statystyki bazy

| Metrika | Wartość |
|---------|---------|
| Firmy | 3 |
| Osoby | 4 |
| Wycieczki | 3 |
| Rezerwacje | 4 |
| Recenzje | 5 |
| Łączny przychód | 16,600 PLN |
| Średnia ocena | 4.5 ⭐ |
| Średnia zajętość | 7.85% |

---

## 🔍 Porównanie wariantów

### Wariant 1: Normalizowany (referencje)
| Operacja | Ocena |
|----------|-------|
| Czytanie | ⭐⭐ |
| Pisanie | ⭐⭐⭐⭐⭐ |
| Spójność | ⭐⭐⭐⭐⭐ |
| Złożoność | Wysoka |

### Wariant 2: Denormalizowany (zagnieżdżony)
| Operacja | Ocena |
|----------|-------|
| Czytanie | ⭐⭐⭐⭐⭐ |
| Pisanie | ⭐ |
| Spójność | ⭐ |
| Złożoność | Niska |

### Wariant 3: Hybrydowy ✅
| Operacja | Ocena |
|----------|-------|
| Czytanie | ⭐⭐⭐⭐ |
| Pisanie | ⭐⭐⭐ |
| Spójność | ⭐⭐⭐ |
| Złożoność | Średnia |

---

## 💾 Eksport i backup

### Eksport do JSON
```bash
mongoexport --collection=companies --out=companies.json
mongoexport --collection=persons --out=persons.json
mongoexport --collection=excursions_hybrid --out=excursions_hybrid.json
```

### Backup całej bazy
```bash
mongodump --out=/backup/excursions_backup
```

### Restore z backupu
```bash
mongorestore /backup/excursions_backup
```

---

## 🛡️ Reguły walidacji danych

### companies
- **Wymagane**: companyID, name, email, phone
- **Unikalne**: companyID
- **Ograniczenia**: rating (0-5), foundedYear >= 1900

### persons
- **Wymagane**: personID, firstName, lastName, email
- **Unikalne**: personID, email
- **Ograniczenia**: birthDate musi być w przeszłości

### excursions_hybrid
- **Wymagane**: excursionID, title, destination, pricePerPerson
- **Unikalne**: excursionID
- **Ograniczenia**: 
  - availableSeats <= totalSeats
  - averageRating (0-5)
  - startDate < endDate

---

## 📈 Rekomendowane indeksy

```javascript
// Dla szybszych wyszukiwań
db.companies.createIndex({ "companyID": 1 });
db.persons.createIndex({ "personID": 1, "email": 1 });
db.excursions_hybrid.createIndex({ "excursionID": 1, "companyID": 1 });
db.excursions_hybrid.createIndex({ "startDate": 1, "endDate": 1 });
db.excursions_hybrid.createIndex({ "category": 1 });
```

---

## 🎓 Wnioski

### Kiedy używać Wariantu 3 (Hybrydowego)?

✅ **Idealne dla:**
- Aplikacje read-heavy (dużo odczytów, mało zmian)
- Domeny z jasną hierarchią (wycieczka ↔ rezerwacje)
- Systemy z częstymi raportami agregacyjnymi
- Aplikacje mobilne (mniejsze payload'e)

❌ **Nieidalne dla:**
- Frequent updates (częste aktualizacje)
- Szybko rosnące tablice (miliony rezerwacji na wycieczę)
- Wysokie wymagania ACID
- Kompleksowe transakcje między dokumentami

---

## 👨‍💻 Autor rozwiązania

**Zadanie 2 - System Zarządzania Wycieczkami**
- Data: 2026-05-14
- Język: JavaScript (MongoDB)
- Baza danych: MongoDB (Wariant 3 Hybrydowy)

---

## 📝 Notatki dodatkowe

1. **Konsystencja danych**: Przy zmianie danych osoby trzeba ręcznie aktualizować rezerwacje
2. **Skalowanie**: Struktura dobrze pracuje do ~10,000 wycieczek
3. **Wydajność**: Indeksy na `excursionID`, `companyID` i `startDate` są krytyczne
4. **Bezpieczeństwo**: Implementacja walidacji i autoryzacji jest niezbędna w aplikacji produkcyjnej

---

**Koniec dokumentacji**
