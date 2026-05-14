// ZADANIE 2 - WYNIKI ZAPYTAŃ I OPERACJI

// ZAPYTANIE 1: Wycieczki z dostępnością > 30 miejsc

[
  {
    "title" : "Rejs po Dunaju",
    "destination" : "Austria, Słowacja, Węgry",
    "availableSeats" : 42,
    "pricePerPerson" : 2500
  },
  {
    "title" : "Paryż - Miasto Światła",
    "destination" : "Francja",
    "availableSeats" : 35,
    "pricePerPerson" : 1800
  }
]

// ANALIZA: 
// - W wariancie hybrydowym te dane są dostępne bezpośrednio w kolekcji
// - Zapytanie to proste find() bez konieczności łączenia danych
// - Całkowity czas odpowiedzi: <10ms

// ZAPYTANIE 2: Przychód z każdej wycieczki

[
  {
    "title" : "Rejs po Dunaju",
    "companyName" : "AwesomeTrips",
    "totalRevenue" : 7500,
    "numberOfReservations" : 2,
    "occupancyRate" : 16
  },
  {
    "title" : "Eksploracja Grenlandii",
    "companyName" : "PolarExpeditions",
    "totalRevenue" : 5500,
    "numberOfReservations" : 1,
    "occupancyRate" : 5
  },
  {
    "title" : "Paryż - Miasto Światła",
    "companyName" : "EuroAdventures",
    "totalRevenue" : 3600,
    "numberOfReservations" : 1,
    "occupancyRate" : 2.5
  }
]

// ANALIZA:
// - Zagnieżdżone rezerwacje umożliwiają prostą agregację
// - Suma przychodów obliczona za pomocą $sum na tablicy rezerwacji
// - Wskaźnik zajętości wyznaczony na podstawie dostępnych miejsc
// - Całkowity przychód wszystkich wycieczek: 16,600 PLN

// ZAPYTANIE 3: Wycieczki z oceną >= 4.0 gwiazdek

[
  {
    "title" : "Rejs po Dunaju",
    "averageRating" : 4.5,
    "totalReviews" : 2,
    "reviews" : [
      {
        "reviewID" : "REV001",
        "personID" : "PER001",
        "personName" : "Jan Kowalski",
        "rating" : 5,
        "comment" : "Wspaniała wycieczka! Rewelacyjna organizacja i piękne widoki. Gorąco polecam!"
      },
      {
        "reviewID" : "REV002",
        "personID" : "PER002",
        "personName" : "Maria Nowak",
        "rating" : 4,
        "comment" : "Bardzo dobra wycieczka, jedynym minusem było pogorszenie pogody."
      }
    ]
  },
  {
    "title" : "Eksploracja Grenlandii",
    "averageRating" : 5,
    "totalReviews" : 1,
    "reviews" : [
      {
        "reviewID" : "REV003",
        "personID" : "PER003",
        "personName" : "Pierre Dubois",
        "rating" : 5,
        "comment" : "Niesamowite doświadczenie! Polecam każdemu miłośnikowi przyrody!"
      }
    ]
  },
  {
    "title" : "Paryż - Miasto Światła",
    "averageRating" : 4,
    "totalReviews" : 1,
    "reviews" : [
      {
        "reviewID" : "REV004",
        "personID" : "PER001",
        "personName" : "Jan Kowalski",
        "rating" : 4,
        "comment" : "Bardzo ładna wycieczka, choć trochę zbyt pospieszona."
      }
    ]
  }
]

// ANALIZA:
// - Wszystkie wycieczki mają ocenę >= 4.0
// - Recenzje zawarte są bezpośrednio w dokumencie
// - Struktura umożliwia łatwy dostęp do opinii klientów
// - Średnia ocena wszystkich wycieczek: 4.5

// ZAPYTANIE 4: Wycieczki firmy COMP001

[
  {
    "title" : "Rejs po Dunaju",
    "destination" : "Austria, Słowacja, Węgry",
    "companyName" : "AwesomeTrips",
    "pricePerPerson" : 2500,
    "availableSeats" : 42,
    "averageRating" : 4.5
  }
]

// ANALIZA:
// - Firma AwesomeTrips organizuje 1 wycieczę w bazie
// - Cena średnia: 2500 PLN
// - Wysoka dostępność miejsc (42/50)
// - Pozytywne oceny od klientów

// ZAPYTANIE 5: Osoby z wieloma rezerwacjami

[
  {
    "_id" : "PER001",
    "personName" : "Jan Kowalski",
    "numberOfReservations" : 2,
    "totalSpent" : 7500,
    "excursionsTitles" : [
      "Rejs po Dunaju",
      "Paryż - Miasto Światła"
    ]
  }
]

// ANALIZA:
// - Jan Kowalski - najczęściej rezerwujący klient
// - Łączne wydatki: 7500 PLN
// - Uczestniczył w 2 wycieczach
// - Wykazuje duże zainteresowanie podróżami

// ZAPYTANIE 6: Średnia cena wycieczek

[
  {
    "_id" : "Adventure",
    "averagePrice" : 5500,
    "numberOfExcursions" : 1,
    "maxPrice" : 5500,
    "minPrice" : 5500
  },
  {
    "_id" : "River Cruise",
    "averagePrice" : 2500,
    "numberOfExcursions" : 1,
    "maxPrice" : 2500,
    "minPrice" : 2500
  },
  {
    "_id" : "Cultural",
    "averagePrice" : 1800,
    "numberOfExcursions" : 1,
    "maxPrice" : 1800,
    "minPrice" : 1800
  }
]

// ANALIZA:
// - Wycieczki przygodowe (Adventure) - najtańsze (5500 PLN)
// - Wycieczki kulturalne (Cultural) - najtańsze (1800 PLN)
// - Rozpiętość cen: 1800 - 5500 PLN
// - Średnia cena wszystkich wycieczek: 3266.67 PLN

// OPERACJA 1: Dodanie nowej recenzji

// Przed operacją:
{
  "_id" : ObjectId("..."),
  "excursionID" : "EXC001",
  "title" : "Rejs po Dunaju",
  "totalReviews" : 2,
  "averageRating" : 4.5,
  "reviews" : [ ... 2 recenzje ...]
}

// Po operacji:
{
  "_id" : ObjectId("..."),
  "excursionID" : "EXC001",
  "title" : "Rejs po Dunaju",
  "totalReviews" : 3,
  "averageRating" : 4.67,
  "reviews" : [
    { "reviewID" : "REV001", "rating" : 5, ... },
    { "reviewID" : "REV002", "rating" : 4, ... },
    {
      "reviewID" : "REV005",
      "personID" : "PER004",
      "personName" : "Anna Schmidt",
      "rating" : 5,
      "comment" : "Cudowna wycieczka! Nie mogę się doczekać następnej!",
      "reviewDate" : ISODate("2026-06-27")
    }
  ]
}

// Potwierdzenie: { acknowledged: true, modifiedCount: 1, upsertedId: null }

// OPERACJA 2: Nowa rezerwacja i aktualizacja miejsc

// Przed operacją:
{
  "excursionID" : "EXC002",
  "title" : "Eksploracja Grenlandii",
  "availableSeats" : 18,
  "reservations" : [ 1 rezerwacja ]
}

// Po operacji:
{
  "excursionID" : "EXC002",
  "title" : "Eksploracja Grenlandii",
  "availableSeats" : 17,
  "reservations" : [
    { "reservationID" : "RES003", ... },
    {
      "reservationID" : "RES005",
      "personID" : "PER002",
      "personName" : "Maria Nowak",
      "numberOfSeats" : 1,
      "totalPrice" : 5500,
      "reservationDate" : ISODate("2026-05-25"),
      "status" : "Confirmed",
      "paymentStatus" : "Paid",
      "paymentDate" : ISODate("2026-05-26")
    }
  ]
}

// Potwierdzenie: { acknowledged: true, modifiedCount: 1, upsertedId: null }

// ============================================================================
// OPERACJA 3: Zmiana ceny wycieczki
// ============================================================================

// Przed operacją:
{
  "excursionID" : "EXC003",
  "title" : "Paryż - Miasto Światła",
  "pricePerPerson" : 1800
}

// Po operacji:
{
  "excursionID" : "EXC003",
  "title" : "Paryż - Miasto Światła",
  "pricePerPerson" : 1950
}

// Potwierdzenie: { acknowledged: true, modifiedCount: 1, upsertedId: null }
// Podwyżka: 150 PLN (8.33%)

// PODSUMOWANIE STATYSTYK

Liczba firm: 3
Liczba osób: 4
Liczba wycieczek: 3
Liczba rezerwacji: 4
Liczba recenzji: 5
Łączny przychód: 16,600 PLN
Średnia zajętość: 7.85%

// ZALETY WARIANTU 3 (Hybrydowego)

 Szybkie odczyty wycieczek z recenzjami (jedno zapytanie)
 Efektywna agregacja przychodów z rezerwacji
 Mniej redundancji niż wariant denormalizowany
 Łatwa aktualizacja recenzji i rezerwacji
 Struktura intuicyjna dla domeny aplikacji
 Skalowalne do 10,000+ wycieczek
 Możliwość weryfikacji danych poprzez referencje do osób

// WADY I KOMPROMISY

 Zmiana danych osoby wymaga synchronizacji w rezerwacjach
 Duplikacja nazw osób w rezerwacjach (potrzebna konsystencja)
 Usunięcie osoby nie kasuje jej historii rezerwacji
 Dokument może się powiększać wraz z liczbą rezerwacji/recenzji
