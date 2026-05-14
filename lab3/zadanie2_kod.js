// ZADANIE 2 - System zarządzania wycieczkami (Firmy, wycieczki, osoby)
// Wariant 3: Struktura hybrydowa (dokumenty zagnieżdżone + referencje)

// CZĘŚĆ 1: INICJALIZACJA I POPULACJA DANYCH

// Wyczyszczenie istniejących danych
db.companies.deleteMany({});
db.persons.deleteMany({});
db.excursions_hybrid.deleteMany({});

// 1. DODANIE FIRM
db.companies.insertMany([
  {
    "companyID": "COMP001",
    "name": "AwesomeTrips",
    "email": "info@awesometrips.com",
    "phone": "+48123456789",
    "address": "ul. Podróżna 10, Warszawa",
    "website": "www.awesometrips.com",
    "foundedYear": 2015,
    "rating": 4.5,
    "totalReviews": 150
  },
  {
    "companyID": "COMP002",
    "name": "EuroAdventures",
    "email": "hello@euroadventures.com",
    "phone": "+33123456789",
    "address": "10 Rue de Paris, Lyon",
    "website": "www.euroadventures.com",
    "foundedYear": 2010,
    "rating": 4.3,
    "totalReviews": 200
  },
  {
    "companyID": "COMP003",
    "name": "PolarExpeditions",
    "email": "contact@polarexp.com",
    "phone": "+47987654321",
    "address": "Arctic House, Tromsø",
    "website": "www.polarexp.com",
    "foundedYear": 2018,
    "rating": 4.7,
    "totalReviews": 80
  }
]);

print("✓ Dodano 3 firmy");

// 2. DODANIE OSÓB
db.persons.insertMany([
  {
    "personID": "PER001",
    "firstName": "Jan",
    "lastName": "Kowalski",
    "email": "jan.kowalski@email.com",
    "phone": "+48987654321",
    "birthDate": ISODate("1985-03-15"),
    "nationality": "Polish",
    "registrationDate": ISODate("2024-01-10")
  },
  {
    "personID": "PER002",
    "firstName": "Maria",
    "lastName": "Nowak",
    "email": "maria.nowak@email.com",
    "phone": "+48987654322",
    "birthDate": ISODate("1990-07-22"),
    "nationality": "Polish",
    "registrationDate": ISODate("2024-02-15")
  },
  {
    "personID": "PER003",
    "firstName": "Pierre",
    "lastName": "Dubois",
    "email": "pierre.dubois@email.fr",
    "phone": "+33612345678",
    "birthDate": ISODate("1988-11-05"),
    "nationality": "French",
    "registrationDate": ISODate("2024-03-20")
  },
  {
    "personID": "PER004",
    "firstName": "Anna",
    "lastName": "Schmidt",
    "email": "anna.schmidt@email.de",
    "phone": "+49301234567",
    "birthDate": ISODate("1992-05-30"),
    "nationality": "German",
    "registrationDate": ISODate("2024-04-01")
  }
]);

print("✓ Dodano 4 osoby");

// 3. DODANIE WYCIECZEK Z REZERWACJAMI I RECENZJAMI
db.excursions_hybrid.insertMany([
  {
    "excursionID": "EXC001",
    "title": "Rejs po Dunaju",
    "description": "8-dniowa wycieczka po Dunaju z wizytą w Wiedniu, Bratysławie i Budapeszcie",
    "destination": "Austria, Słowacja, Węgry",
    "startDate": ISODate("2026-06-15"),
    "endDate": ISODate("2026-06-22"),
    "duration": 8,
    "pricePerPerson": 2500,
    "availableSeats": 42,
    "totalSeats": 50,
    "companyID": "COMP001",
    "companyName": "AwesomeTrips",
    "companyRating": 4.5,
    "category": "River Cruise",
    "difficulty": "Easy",
    "highlights": ["Dunaj", "Wiedeń", "Bratysława", "Budapeszt"],
    "accommodationType": "4-star hotel",
    "mealsPlan": "Half Board",
    "reservations": [
      {
        "reservationID": "RES001",
        "personID": "PER001",
        "personName": "Jan Kowalski",
        "numberOfSeats": 2,
        "totalPrice": 5000,
        "reservationDate": ISODate("2026-05-01"),
        "status": "Confirmed",
        "paymentStatus": "Paid",
        "paymentDate": ISODate("2026-05-05")
      },
      {
        "reservationID": "RES002",
        "personID": "PER002",
        "personName": "Maria Nowak",
        "numberOfSeats": 1,
        "totalPrice": 2500,
        "reservationDate": ISODate("2026-05-03"),
        "status": "Confirmed",
        "paymentStatus": "Paid",
        "paymentDate": ISODate("2026-05-08")
      }
    ],
    "reviews": [
      {
        "reviewID": "REV001",
        "personID": "PER001",
        "personName": "Jan Kowalski",
        "rating": 5,
        "comment": "Wspaniała wycieczka! Rewelacyjna organizacja i piękne widoki. Gorąco polecam!",
        "reviewDate": ISODate("2026-06-25")
      },
      {
        "reviewID": "REV002",
        "personID": "PER002",
        "personName": "Maria Nowak",
        "rating": 4,
        "comment": "Bardzo dobra wycieczka, jedynym minusem było pogorszenie pogody.",
        "reviewDate": ISODate("2026-06-26")
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 2,
    "createdDate": ISODate("2026-01-10")
  },
  {
    "excursionID": "EXC002",
    "title": "Eksploracja Grenlandii",
    "description": "10-dniowa arktyczna eksploracja Grenlandii z obserwacją lodowców i aurory",
    "destination": "Grenlandia",
    "startDate": ISODate("2026-08-20"),
    "endDate": ISODate("2026-08-30"),
    "duration": 10,
    "pricePerPerson": 5500,
    "availableSeats": 18,
    "totalSeats": 20,
    "companyID": "COMP003",
    "companyName": "PolarExpeditions",
    "companyRating": 4.7,
    "category": "Adventure",
    "difficulty": "Hard",
    "highlights": ["Lodowce", "Aurora Borealis", "Inuici", "Nuuk"],
    "accommodationType": "Luxury lodge",
    "mealsPlan": "Full Board",
    "reservations": [
      {
        "reservationID": "RES003",
        "personID": "PER003",
        "personName": "Pierre Dubois",
        "numberOfSeats": 1,
        "totalPrice": 5500,
        "reservationDate": ISODate("2026-05-10"),
        "status": "Confirmed",
        "paymentStatus": "Paid",
        "paymentDate": ISODate("2026-05-15")
      }
    ],
    "reviews": [
      {
        "reviewID": "REV003",
        "personID": "PER003",
        "personName": "Pierre Dubois",
        "rating": 5,
        "comment": "Niesamowite doświadczenie! Polecam każdemu miłośnikowi przyrody!",
        "reviewDate": ISODate("2026-08-31")
      }
    ],
    "averageRating": 5.0,
    "totalReviews": 1,
    "createdDate": ISODate("2026-02-01")
  },
  {
    "excursionID": "EXC003",
    "title": "Paryż - Miasto Światła",
    "description": "5-dniowa wycieczka po Paryżu z wizytą w Luwrze, Notre-Dame i Wieży Eiffla",
    "destination": "Francja",
    "startDate": ISODate("2026-07-10"),
    "endDate": ISODate("2026-07-14"),
    "duration": 5,
    "pricePerPerson": 1800,
    "availableSeats": 35,
    "totalSeats": 40,
    "companyID": "COMP002",
    "companyName": "EuroAdventures",
    "companyRating": 4.3,
    "category": "Cultural",
    "difficulty": "Easy",
    "highlights": ["Wieża Eiffla", "Luwr", "Notre-Dame", "Pałac Wersalski"],
    "accommodationType": "3-star hotel",
    "mealsPlan": "Breakfast",
    "reservations": [
      {
        "reservationID": "RES004",
        "personID": "PER004",
        "personName": "Anna Schmidt",
        "numberOfSeats": 2,
        "totalPrice": 3600,
        "reservationDate": ISODate("2026-05-20"),
        "status": "Confirmed",
        "paymentStatus": "Pending"
      }
    ],
    "reviews": [
      {
        "reviewID": "REV004",
        "personID": "PER001",
        "personName": "Jan Kowalski",
        "rating": 4,
        "comment": "Bardzo ładna wycieczka, choć trochę zbyt pospieszona.",
        "reviewDate": ISODate("2026-07-15")
      }
    ],
    "averageRating": 4.0,
    "totalReviews": 1,
    "createdDate": ISODate("2026-01-20")
  }
]);

print("✓ Dodano 3 wycieczki z rezerwacjami i recenzjami");

// CZĘŚĆ 2: ZAPYTANIA I OPERACJE

print("\n========== ZAPYTANIE 1: Wycieczki z dostępnością > 30 miejsc ==========\n");
db.excursions_hybrid.find(
  { availableSeats: { $gt: 30 } },
  { title: 1, destination: 1, availableSeats: 1, pricePerPerson: 1, _id: 0 }
).pretty();

print("\n========== ZAPYTANIE 2: Przychód z każdej wycieczki ==========\n");
db.excursions_hybrid.aggregate([
  {
    $project: {
      title: 1,
      companyName: 1,
      totalRevenue: {
        $sum: "$reservations.totalPrice"
      },
      numberOfReservations: {
        $size: "$reservations"
      },
      occupancyRate: {
        $round: [
          {
            $multiply: [
              {
                $divide: [
                  { $subtract: ["$totalSeats", "$availableSeats"] },
                  "$totalSeats"
                ]
              },
              100
            ]
          },
          2
        ]
      },
      _id: 0
    }
  },
  {
    $sort: { totalRevenue: -1 }
  }
]).pretty();

print("\n========== ZAPYTANIE 3: Wycieczki z oceną >= 4.0 gwiazdek ==========\n");
db.excursions_hybrid.find(
  { averageRating: { $gte: 4.0 } },
  { 
    title: 1, 
    averageRating: 1, 
    totalReviews: 1,
    reviews: 1,
    _id: 0
  }
).pretty();

print("\n========== ZAPYTANIE 4: Wycieczki firmy COMP001 ==========\n");
db.excursions_hybrid.aggregate([
  { 
    $match: { companyID: "COMP001" }
  },
  {
    $project: {
      title: 1,
      destination: 1,
      companyName: 1,
      pricePerPerson: 1,
      availableSeats: 1,
      averageRating: 1,
      _id: 0
    }
  }
]).pretty();

print("\n========== ZAPYTANIE 5: Osoby z wieloma rezerwacjami ==========\n");
db.excursions_hybrid.aggregate([
  {
    $unwind: "$reservations"
  },
  {
    $group: {
      _id: "$reservations.personID",
      personName: { $first: "$reservations.personName" },
      numberOfReservations: { $sum: 1 },
      totalSpent: { $sum: "$reservations.totalPrice" },
      excursionsTitles: { $push: "$title" }
    }
  },
  {
    $sort: { totalSpent: -1 }
  },
  {
    $project: {
      _id: 1,
      personName: 1,
      numberOfReservations: 1,
      totalSpent: 1,
      excursionsTitles: 1
    }
  }
]).pretty();

print("\n========== ZAPYTANIE 6: Średnia cena wycieczek ==========\n");
db.excursions_hybrid.aggregate([
  {
    $group: {
      _id: "$category",
      averagePrice: { $avg: "$pricePerPerson" },
      numberOfExcursions: { $sum: 1 },
      maxPrice: { $max: "$pricePerPerson" },
      minPrice: { $min: "$pricePerPerson" }
    }
  },
  {
    $sort: { averagePrice: -1 }
  }
]).pretty();

print("\n========== OPERACJA 1: Dodanie nowej recenzji ==========\n");
db.excursions_hybrid.updateOne(
  { excursionID: "EXC001" },
  {
    $push: {
      reviews: {
        reviewID: "REV005",
        personID: "PER004",
        personName: "Anna Schmidt",
        rating: 5,
        comment: "Cudowna wycieczka! Nie mogę się doczekać następnej!",
        reviewDate: ISODate("2026-06-27")
      }
    },
    $inc: {
      totalReviews: 1
    },
    $set: {
      averageRating: 4.67
    }
  }
);
print("✓ Dodano nową recenzję do wycieczki EXC001");

print("\n========== OPERACJA 2: Nowa rezerwacja i aktualizacja miejsc ==========\n");
db.excursions_hybrid.updateOne(
  { excursionID: "EXC002" },
  {
    $push: {
      reservations: {
        reservationID: "RES005",
        personID: "PER002",
        personName: "Maria Nowak",
        numberOfSeats: 1,
        totalPrice: 5500,
        reservationDate: ISODate("2026-05-25"),
        status: "Confirmed",
        paymentStatus: "Paid",
        paymentDate: ISODate("2026-05-26")
      }
    },
    $inc: { availableSeats: -1 }
  }
);
print("✓ Dodano nową rezerwację - zmniejszono dostępne miejsca");

print("\n========== OPERACJA 3: Zmiana ceny wycieczki ==========\n");
db.excursions_hybrid.updateOne(
  { excursionID: "EXC003" },
  {
    $set: { pricePerPerson: 1950 }
  }
);
print("✓ Zmieniono cenę wycieczki EXC003");

print("\n========== VERYFIKACJA: Aktualna struktura danych ==========\n");
print("Liczba firm: " + db.companies.countDocuments({}));
print("Liczba osób: " + db.persons.countDocuments({}));
print("Liczba wycieczek: " + db.excursions_hybrid.countDocuments({}));

print("\n========== KONIEC SKRYPTU ==========\n");
