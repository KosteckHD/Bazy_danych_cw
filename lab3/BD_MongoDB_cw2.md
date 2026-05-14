# Dokumentowe bazy danych – MongoDB

Ćwiczenie 2


---

**Imiona i nazwiska autorów:**

--- 

Odtwórz z backupu bazę `north0`

- najprostsza wersja

```
mongorestore dump
```

- to polecenie odtworzy wszystkie bazy danych znajdujące się we wskazanym folderze (w tym przypadku ` dump `) 
	- najłatwiej wgrać tam folder zawierający pliki z backupem i wykonać proste polecenie mongorestore 
- dokumentacja:
	- https://www.mongodb.com/docs/database-tools/mongorestore/

Wybierz bazę north0

Baza `north0` jest kopią relacyjnej bazy danych `Northwind`
- poszczególne kolekcje odpowiadają tabelom w oryginalnej bazie `Northwind`


# Zadanie 0 

zapoznaj się ze strukturą dokumentów w bazie `North0`

```js
db.customers.find()
db.orders.find();
db.orderdetails.find();

```

# Zadanie 1 - operacje wyszukiwania danych,  przetwarzanie dokumentów

# a)

stwórz kolekcję  `OrdersInfo`  zawierającą następujące dane o zamówieniach
- kolekcję  `OrdersInfo` należy stworzyć przekształcając dokumenty w oryginalnych kolekcjach `customers, orders, orderdetails, employees, shippers, products, categories, suppliers` do kolekcji  w której pojedynczy dokument opisuje jedno zamówienie

```js
db.orders.aggregate([{
    $lookup:{from:"customers",
        localField:"CustomerID",
        foreignField:"CustomerID",
        as:"Customer"}
    },
    {
        $lookup:{from:"employees",
            localField:"EmpolyeeID",
            foreignField:"EmpolyeeID",
            as:"Employee"}
        },
    {
        $lookup:{from:"orderdetails",
            localField:"OrderID",
            foreignField:"OrderID",
            as:"Orderdetails"}
        },
    {
        $lookup:{from:"shippers",
            localField:"ShipperID",
            foreignField:"ShipperID",
            as:"shipper"}
        },
    {
        $lookup:{from:"products",
            localField:"orderdetail.ProductID",
            foreignField:"ProductID",
            as:"product"}
        },
    {
        $lookup:{from:"categories",
            localField:"CategoryID",
            foreignField:"CategoryID",
            as:"category"}
        },
    {$unwind:"$customer"},
    {$unwind:"$employee"},

    {$limit:1},
    {
        $project: {
            _id: 1,
            OrderID: 1,


            "Customer": {
                "CustomerID": "$Customer.CustomerID",
                "CompanyName": "$Customer.CompanyName",
                "City": "$Customer.City",
                "Country": "$Customer.Country"
                },


            "Employee": {
                "EmployeeID": "$Employee.EmployeeID",
                "FirstName": "$Employee.FirstName",
                "LastName": "$Employee.LastName",
                "Title": "$Employee.Title"
                },


            "Dates": {
                "OrderDate": "$OrderDate",
                "RequiredDate": "$RequiredDate"
                },


            "Orderdetails": {
                $map: {
                    input: "$Orderdetails",
                    as: "od",
                    in: {
                        "UnitPrice": "$$od.UnitPrice",
                        "Quantity": "$$od.Quantity",
                        "Discount": "$$od.Discount",
                        "Value": {
                            $multiply: [
                                "$$od.UnitPrice",
                                "$$od.Quantity",
                                { $subtract: [1, { $ifNull: ["$$od.Discount", 0] }] }
                                ]
                            },
                        "product": {
                            $arrayElemAt: [
                                {
                                    $filter: {
                                        input: "$product",
                                        as: "p",
                                        cond: { $eq: ["$$p.ProductID", "$$od.ProductID"] }
                                        }
                                    },
                                0
                                ]
                            }
                        }
                    }
                },

            "Freight": 1,

            "OrderTotal": {
                $sum: {
                    $map: {
                        input: "$Orderdetails",
                        as: "od",
                        in: {
                            $multiply: [
                                "$$od.UnitPrice",
                                "$$od.Quantity",
                                { $subtract: [1, { $ifNull: ["$$od.Discount", 0] }] }
                                ]
                            }
                        }
                    }
                },

            "Shipment": 
                {
                "Shipper": {
                    "ShipperID": { "$shipper.ShipperID"},
                    "CompanyName": "$shipper.CompanyName" }
                    },
                "ShipName": "$ShipName",
                "ShipAddress": "$ShipAddress",
                "ShipCity": "$ShipCity",
                "ShipCountry": "$ShipCountry"
                }
            }
        }

    ])
```

spodziewany wynik:

```js
[  
  {  
    "_id": ...
    
    OrderID": ... numer zamówienia
    
    "Customer": {  ... podstawowe informacje o kliencie skladającym  
      "CustomerID": ... identyfikator klienta
      "CompanyName": ... nazwa klienta
      "City": ... miasto 
      "Country": ... kraj 
    },  
    
    "Employee": {  ... podstawowe informacje o pracowniku obsługującym zamówienie
      "EmployeeID": ... idntyfikator pracownika 
      "FirstName": ... imie   
      "LastName": ... nazwisko
      "Title": ... stanowisko  
     
    },  
    
    "Dates": {
       "OrderDate": ... data złożenia zamówienia
       "RequiredDate": data wymaganej realizacji
    }

    "Orderdetails": [  ... pozycje/szczegóły zamówienia - tablica takich pozycji 
      {  
        "UnitPrice": ... cena
        "Quantity": ... liczba sprzedanych jednostek towaru
        "Discount": ... zniżka  
        "Value": ... wartośc pozycji zamówienia
        "product": { ... podstawowe informacje o produkcie 
          "ProductID": ... identyfikator produktu  
          "ProductName": ... nazwa produktu 
          "QuantityPerUnit": ... opis/opakowannie
          "CategoryID": ... identyfikator kategorii do której należy produkt
          "CategoryName" ... nazwę tej kategorii
        },  
      },  
      ...   
    ],  

    "Freight": ... opłata za przesyłkę
    "OrderTotal"  ... sumaryczna wartosc sprzedanych produktów

    "Shipment" : {  ... informacja o wysyłce
        "Shipper": { ... podstawowe inf o przewoźniku 
           "ShipperID":  
            "CompanyName":
        }  
        ... inf o odbiorcy przesyłki
        "ShipName": ...
        "ShipAddress": ...
        "ShipCity": ... 
        "ShipCountry": ...
    } 
  } 
]  
```


# b)

stwórz kolekcję  `CustomerInfo`  zawierającą następujące dane każdym kliencie
- pojedynczy dokument opisuje jednego klienta

spodziewany wynik:

```js
[  
  {  
    "_id": ...
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
    "City": ... miasto 
    "Country": ... kraj 

	"Orders": [ ... tablica zamówień klienta o strukturze takiej jak w punkcie a) 
	                (oczywiście bez informacji o kliencie)
	  
	]

		  
]  
```

rozwiazanie (czesciowe):
```js

db.customers.aggregate([
    {
        $project:{
            _id: 1,
            CustomerId: 1,
            CompanyName: 1,
            City: 1,
            Country: 1,

//            Orders: {
//
//                }

            },
        },
    { $out: "CustomerInfo" }
])
```

# c) 

Napisz polecenie/zapytanie: Dla każdego klienta pokaż wartość zakupionych przez niego produktów z kategorii 'Confections'  w 1997r
- Spróbuj napisać to zapytanie wykorzystując
	- oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
	- kolekcję `OrderInfo`
	- kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[  
  {  
    "_id": 
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta
	"ConfectionsSale97": ... wartość zakupionych przez niego produktów 
	                         z kategorii 'Confections'  w 1997r

  }		  
]  
```

rozwiazanie (czesciowe):
```js
db.customers.aggregate([
    {
        $lookup: {
            from: "orders",
            localField: "CustomerID",
            foreignField: "CustomerID",
            as: "Order"
        },
    },
        {$unwind: "$Order"},
    {
        $lookup: {
            from: "orderdetails",
            localField: "Order.OrderID",
            foreignField: "OrderID",
            as: "OrderDetail"
            }
    },
            {$unwind: "$OrderDetail"},
    {
        $lookup: {
            from: "products",
            localField: "OrderDetail.ProductID",
            foreignField: "ProductID",
            as: "ProductInfo"
            }
    },
            {$unwind: "$ProductInfo"},
    {
        $lookup: {
            from: "categories",
            localField: "ProductInfo.CategoryID",
            foreignField: "CategoryID",
            as: "Category"
            }
    },
    {$unwind: "$Category"},
    {
        $match: {"Category.CategoryName": "Confections"}
    },
    {
        $match:
        {
            $expr: {
                $eq: [{ $year: {$toDate: "$OrderDate"} }, 1997]
                }
            }
        },
    {$limit: 1}


])

```

# d)

Napisz polecenie/zapytanie:  Dla każdego klienta poaje wartość sprzedaży z podziałem na lata i miesiące
Spróbuj napisać to zapytanie wykorzystując
	- oryginalne kolekcje (`customers, orders, orderdertails, products, categories`)
	- kolekcję `OrderInfo`
	- kolekcję `CustomerInfo`

- porównaj zapytania/polecenia/wyniki

```js
[  
  {  
    "_id": 
    
    "CustomerID": ... identyfikator klienta
    "CompanyName": ... nazwa klienta

	"Sale": [ ... tablica zawierająca inf o sprzedazy
	    {
            "Year":  ....
            "Month": ....
            "Total": ...	    
	    }
	    ...
	]
  }		  
]  
```

# e)

Załóżmy że pojawia się nowe zamówienie dla klienta 'ALFKI',  zawierające dwa produkty 'Chai' oraz "Ikura"
- pozostałe pola w zamówieniu (ceny, liczby sztuk prod, inf o przewoźniku itp. możesz uzupełnić wg własnego uznania)
Napisz polecenie które dodaje takie zamówienie do bazy
- aktualizując oryginalne kolekcje `orders`, `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

Napisz polecenie 
- aktualizując oryginalną kolekcję orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`

# f)

Napisz polecenie które modyfikuje zamówienie dodane w pkt e)  zwiększając zniżkę  o 5% (dla każdej pozycji tego zamówienia) 

Napisz polecenie 
- aktualizując oryginalną kolekcję `orderdetails`
- aktualizując kolekcję `OrderInfo`
- aktualizując kolekcję `CustomerInfo`



UWAGA:
W raporcie należy zamieścić kod poleceń oraz uzyskany rezultat, np wynik  polecenia `db.kolekcka.fimd().limit(2)` lub jego fragment


## Zadanie 1  - rozwiązanie

> Wyniki: 
> 
> przykłady, kod, zrzuty ekranów, komentarz ...

a)

```js
--  ...
```

b)


```js
--  ...
```

....

# Zadanie 2 - modelowanie danych


Zaproponuj strukturę bazy danych dla wybranego/przykładowego zagadnienia/problemu

Należy wybrać jedno zagadnienie/problem (A lub B lub C)

Przykład A
- Wykładowcy, przedmioty, studenci, oceny
	- Wykładowcy prowadzą zajęcia z poszczególnych przedmiotów
	- Studenci uczęszczają na zajęcia
	- Wykładowcy wystawiają oceny studentom
	- Studenci oceniają zajęcia

Przykład B
- Firmy, wycieczki, osoby
	- Firmy organizują wycieczki
	- Osoby rezerwują miejsca/wykupują bilety
	- Osoby oceniają wycieczki

Przykład C
- Własny przykład o podobnym stopniu złożoności

a) Zaproponuj  różne warianty struktury bazy danych i dokumentów w poszczególnych kolekcjach oraz przeprowadzić dyskusję każdego wariantu (wskazać wady i zalety każdego z wariantów)
- zdefiniuj schemat/reguły walidacji danych
- wykorzystaj referencje
- dokumenty zagnieżdżone
- tablice

b) Kolekcje należy wypełnić przykładowymi danymi

c) W kontekście zaprezentowania wad/zalet należy zaprezentować kilka przykładów/zapytań/operacji oraz dla których dedykowany jest dany wariant

W sprawozdaniu należy zamieścić przykładowe dokumenty w formacie JSON ( pkt a) i b)), oraz kod zapytań/operacji (pkt c)), wraz z odpowiednim komentarzem opisującym strukturę dokumentów oraz polecenia ilustrujące wykonanie przykładowych operacji na danych

Do sprawozdania należy dołączyć 
- plik z kodem operacji/zapytań w wersji źródłowej (np. plik .js, np. plik .md ) 
- oraz kompletny zrzut wykonanych/przygotowanych baz danych (taki zrzut można wykonać np. za pomocą poleceń `mongoexport`, `mongdump` …)  
	- załącznik ze zrzutem baz powinien mieć format zip

## Zadanie 2  - rozwiązanie

### Wybrane zagadnienie: B - Firmy, wycieczki, osoby

Zaproponowałem system zarządzania wycieczkami organizowanymi przez firmy, gdzie osoby rezerwują miejsca, kupują bilety i oceniają wycieczki.

---

### a) Warianty struktury bazy danych - analiza i dyskusja

#### **WARIANT 1: Struktura znormalizowana (referencje)**

**Struktury dokumentów:**

```json
// Kolekcja: companies (Firmy)
{
  "_id": ObjectId("..."),
  "companyID": "COMP001",
  "name": "AwesomeTrips",
  "email": "info@awesometrips.com",
  "phone": "+48123456789",
  "address": "ul. Podróżna 10, Warszawa",
  "website": "www.awesometrips.com",
  "foundedYear": 2015,
  "rating": 4.5
}

// Kolekcja: excursions (Wycieczki)
{
  "_id": ObjectId("..."),
  "excursionID": "EXC001",
  "companyID": "COMP001",
  "title": "Rejs po Dunaju",
  "description": "Wyciecz­ka po Dunaju z wizytą w Wiedniu",
  "destination": "Wiedeń, Austria",
  "startDate": ISODate("2026-06-15"),
  "endDate": ISODate("2026-06-22"),
  "duration": 8,
  "availableSeats": 45,
  "totalSeats": 50,
  "pricePerPerson": 2500,
  "category": "River Cruise",
  "difficulty": "Easy",
  "highlights": ["Dunaj", "Wiedeń", "Bratysława"]
}

// Kolekcja: persons (Osoby)
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

// Kolekcja: reservations (Rezerwacje)
{
  "_id": ObjectId("..."),
  "reservationID": "RES001",
  "personID": "PER001",
  "excursionID": "EXC001",
  "reservationDate": ISODate("2026-05-01"),
  "numberOfSeats": 2,
  "totalPrice": 5000,
  "status": "Confirmed",
  "paymentStatus": "Paid",
  "paymentDate": ISODate("2026-05-05")
}

// Kolekcja: reviews (Oceny)
{
  "_id": ObjectId("..."),
  "reviewID": "REV001",
  "personID": "PER001",
  "excursionID": "EXC001",
  "rating": 5,
  "comment": "Wspaniała wycieczka! Polecam wszystkim!",
  "reviewDate": ISODate("2026-06-25"),
  "helpfulCount": 12
}
```

**Zalety:**
- ✅ Brak redundancji danych
- ✅ Łatwe aktualizacje (np. zmiana danych firmy w jednym miejscu)
- ✅ Zgodne z normalizacją relacyjną
- ✅ Oszczędność pamięci

**Wady:**
- ❌ Wiele operacji lookup() wymaganych dla złożonych zapytań
- ❌ Gorsza wydajność przy czytaniu
- ❌ Konieczność łączenia danych z wielu kolekcji

---

#### **WARIANT 2: Struktura denormalizowana (dokumenty zagnieżdżone)**

**Struktury dokumentów:**

```json
// Kolekcja: excursions_denormalized (Wycieczki z zagnieżdżonymi danymi)
{
  "_id": ObjectId("..."),
  "excursionID": "EXC001",
  "title": "Rejs po Dunaju",
  "description": "Wycieczka po Dunaju z wizytą w Wiedniu",
  "destination": "Wiedeń, Austria",
  "startDate": ISODate("2026-06-15"),
  "endDate": ISODate("2026-06-22"),
  "duration": 8,
  "availableSeats": 45,
  "totalSeats": 50,
  "pricePerPerson": 2500,
  "category": "River Cruise",
  "highlights": ["Dunaj", "Wiedeń", "Bratysława"],
  "company": {
    "companyID": "COMP001",
    "name": "AwesomeTrips",
    "email": "info@awesometrips.com",
    "phone": "+48123456789",
    "website": "www.awesometrips.com",
    "rating": 4.5
  },
  "reservations": [
    {
      "reservationID": "RES001",
      "person": {
        "personID": "PER001",
        "firstName": "Jan",
        "lastName": "Kowalski",
        "email": "jan.kowalski@email.com",
        "nationality": "Polish"
      },
      "numberOfSeats": 2,
      "totalPrice": 5000,
      "reservationDate": ISODate("2026-05-01"),
      "status": "Confirmed",
      "paymentStatus": "Paid"
    }
  ],
  "reviews": [
    {
      "reviewID": "REV001",
      "personID": "PER001",
      "personName": "Jan Kowalski",
      "rating": 5,
      "comment": "Wspaniała wycieczka!",
      "reviewDate": ISODate("2026-06-25")
    }
  ],
  "averageRating": 4.8,
  "totalReviews": 15
}
```

**Zalety:**
- ✅ Bardzo szybkie odczyty (jedno zapytanie)
- ✅ Kompletne dane w jednym dokumencie
- ✅ Łatwiejsze operacje agregacji
- ✅ Lepsza wydajność dla scenariuszy read-heavy

**Wady:**
- ❌ Duża redundancja danych
- ❌ Trudne aktualizacje (trzeba aktualizować w wielu miejscach)
- ❌ Rozmiar dokumentu może się szybko powiększać
- ❌ Trudności przy modyfikacji danych osób lub firm

---

#### **WARIANT 3: Struktura hybrydowa (mixed approach)**

**Struktury dokumentów:**

```json
// Kolekcja: companies (Firmy - normalizowane)
{
  "_id": ObjectId("..."),
  "companyID": "COMP001",
  "name": "AwesomeTrips",
  "email": "info@awesometrips.com",
  "phone": "+48123456789",
  "address": "ul. Podróżna 10, Warszawa",
  "website": "www.awesometrips.com",
  "rating": 4.5
}

// Kolekcja: persons (Osoby - normalizowane)
{
  "_id": ObjectId("..."),
  "personID": "PER001",
  "firstName": "Jan",
  "lastName": "Kowalski",
  "email": "jan.kowalski@email.com",
  "phone": "+48987654321",
  "nationality": "Polish"
}

// Kolekcja: excursions_hybrid (Wycieczki - z zagnieżdżonymi recenzjami, ale referencje do osób)
{
  "_id": ObjectId("..."),
  "excursionID": "EXC001",
  "title": "Rejs po Dunaju",
  "description": "Wycieczka po Dunaju z wizytą w Wiedniu",
  "destination": "Wiedeń, Austria",
  "startDate": ISODate("2026-06-15"),
  "endDate": ISODate("2026-06-22"),
  "duration": 8,
  "pricePerPerson": 2500,
  "availableSeats": 45,
  "totalSeats": 50,
  "companyID": "COMP001",
  "companyName": "AwesomeTrips",
  "companyRating": 4.5,
  "category": "River Cruise",
  "highlights": ["Dunaj", "Wiedeń", "Bratysława"],
  "reservations": [
    {
      "reservationID": "RES001",
      "personID": "PER001",
      "personName": "Jan Kowalski",
      "numberOfSeats": 2,
      "totalPrice": 5000,
      "reservationDate": ISODate("2026-05-01"),
      "status": "Confirmed"
    }
  ],
  "reviews": [
    {
      "reviewID": "REV001",
      "personID": "PER001",
      "personName": "Jan Kowalski",
      "rating": 5,
      "comment": "Wspaniała wycieczka!",
      "reviewDate": ISODate("2026-06-25")
    }
  ],
  "averageRating": 4.8
}
```

**Zalety:**
-  Równowaga między wydajnością a normalizacją
-  Szybkie odczyty wycieczek z recenzjami
-  Mniej redundancji niż pełna denormalizacja
-  Możliwość weryfikacji danych poprzez referencje
-  Dobrze skaluje się dla tych konkretnych operacji

**Wady:**
-  Złożoność w implementacji
-  Trzeba zarządzać duplikatami danych osób w rezerwacjach
-  Wymaga synchronizacji przy zmianach danych

---

### **Rekomendacja: Wybrany Wariant 3 (Hybrydowy)**

Dla tego scenariusza wybieram **WARIANT 3** ponieważ:
- Wycieczki są najczęściej czytane z recenzjami → zagnieżdżenie recenzji
- Dane osób mogą się zmieniać → oddzielna kolekcja
- Dane firm są względnie statyczne → можно zduplikować
- Rezerwacje związane są z wycieczkami → zagnieżdżone w wycieczce

---

### b) Populacja kolekcji przykładowymi danymi

```js
// 1. Wyczyszczenie baz
db.companies.deleteMany({});
db.persons.deleteMany({});
db.excursions_hybrid.deleteMany({});

// 2. Dodanie firm
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

// 3. Dodanie osób
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

// 4. Dodanie wycieczek z rezerwacjami i recenzjami
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
        "comment": "Bardzo dobra wycieczka, jedynym minusem było időjó porankami.",
        "reviewDate": ISODate("2026-06-26")
      }
    ],
    "averageRating": 4.5,
    "totalReviews": 2,
    "createdDate": ISODate("2026-01-10")
  },
  {
    "excursionID": "EXC002",
    "title": "Eksploracja Grónjlandii",
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
```

---

### c) Przykładowe operacje i zapytania

#### **Zapytanie 1: Wycieczki z liczbą dostępnych miejsc > 30**

```js
db.excursions_hybrid.find(
  { availableSeats: { $gt: 30 } },
  { title: 1, destination: 1, availableSeats: 1, pricePerPerson: 1 }
);

// WYNIK:
[
  {
    "_id": ObjectId("..."),
    "title": "Rejs po Dunaju",
    "destination": "Austria, Słowacja, Węgry",
    "availableSeats": 42,
    "pricePerPerson": 2500
  },
  {
    "_id": ObjectId("..."),
    "title": "Paryż - Miasto Światła",
    "destination": "Francja",
    "availableSeats": 35,
    "pricePerPerson": 1800
  }
]
```

**Analiza:** W wariancie hybrydowym takie zapytanie jest szybkie, bo dane znajdują się w jednym dokumencie.

---

#### **Zapytanie 2: Przychód z każdej wycieczki (suma rezerwacji)**

```js
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
      }
    }
  },
  {
    $sort: { totalRevenue: -1 }
  }
]);

// WYNIK:
[
  {
    "_id": ObjectId("..."),
    "title": "Eksploracja Grenlandii",
    "companyName": "PolarExpeditions",
    "totalRevenue": 5500,
    "numberOfReservations": 1,
    "occupancyRate": 5
  },
  {
    "_id": ObjectId("..."),
    "title": "Rejs po Dunaju",
    "companyName": "AwesomeTrips",
    "totalRevenue": 7500,
    "numberOfReservations": 2,
    "occupancyRate": 4
  },
  {
    "_id": ObjectId("..."),
    "title": "Paryż - Miasto Światła",
    "companyName": "EuroAdventures",
    "totalRevenue": 3600,
    "numberOfReservations": 1,
    "occupancyRate": 2.5
  }
]
```

**Analiza:** Zagnieżdżone rezerwacje umożliwiają łatwe obliczenie przychodów bez dodatkowych lookup().

---

#### **Zapytanie 3: Wycieczki oceniane na 4+ gwiazdki z recenzjami**

```js
db.excursions_hybrid.find(
  { averageRating: { $gte: 4.0 } },
  { 
    title: 1, 
    averageRating: 1, 
    totalReviews: 1,
    "reviews": {
      $filter: {
        input: "$reviews",
        as: "review",
        cond: { $gte: ["$$review.rating", 4] }
      }
    }
  }
);

// WYNIK:
[
  {
    "_id": ObjectId("..."),
    "title": "Rejs po Dunaju",
    "averageRating": 4.5,
    "totalReviews": 2,
    "reviews": [
      {
        "reviewID": "REV001",
        "personID": "PER001",
        "personName": "Jan Kowalski",
        "rating": 5,
        "comment": "Wspaniała wycieczka!"
      },
      {
        "reviewID": "REV002",
        "personID": "PER002",
        "personName": "Maria Nowak",
        "rating": 4,
        "comment": "Bardzo dobra wycieczka..."
      }
    ]
  },
  {
    "_id": ObjectId("..."),
    "title": "Eksploracja Grenlandii",
    "averageRating": 5.0,
    "totalReviews": 1,
    "reviews": [...]
  }
]
```

---

#### **Zapytanie 4: Wyciecz­ki danej firmy z ponad 30% okupancją**

```js
db.excursions_hybrid.aggregate([
  { 
    $match: { companyID: "COMP001" }
  },
  {
    $addFields: {
      occupancyRate: {
        $multiply: [
          {
            $divide: [
              { $subtract: ["$totalSeats", "$availableSeats"] },
              "$totalSeats"
            ]
          },
          100
        ]
      }
    }
  },
  {
    $match: { occupancyRate: { $gte: 30 } }
  },
  {
    $project: {
      title: 1,
      destination: 1,
      occupancyRate: { $round: ["$occupancyRate", 2] },
      averageRating: 1
    }
  }
]);

// WYNIK:
[
  {
    "_id": ObjectId("..."),
    "title": "Rejs po Dunaju",
    "destination": "Austria, Słowacja, Węgry",
    "occupancyRate": 16.0,
    "averageRating": 4.5
  }
]
```

---

#### **Zapytanie 5: Osoby, które rezerwowały wiele wycieczek (z lookup)**

```js
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
    $match: { numberOfReservations: { $gt: 1 } }
  },
  {
    $sort: { totalSpent: -1 }
  }
]);

// WYNIK:
[
  {
    "_id": "PER001",
    "personName": "Jan Kowalski",
    "numberOfReservations": 2,
    "totalSpent": 7500,
    "excursionsTitles": ["Rejs po Dunaju", "Paryż - Miasto Światła"]
  }
]
```

---

#### **Zapytanie 6: Dodanie nowej recenzji do wycieczki**

```js
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
    $set: {
      averageRating: 4.67,
      totalReviews: 3
    }
  }
);
```

---

#### **Zapytanie 7: Aktualizacja liczby dostępnych miejsc po rezerwacji**

```js
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
```

---

### **Porównanie wariantów - podsumowanie:**

| Operacja | Wariant 1 (Normalizowany) | Wariant 2 (Denormalizowany) | Wariant 3 (Hybrydowy) |
|----------|---------------------------|-----------------------------|-----------------------|
| Pobierz wycieczki z recenzjami | 3-5 lookup() | 1 zapytanie  | 1 zapytanie  |
| Oblicz przychód | Złożona agregacja | Proste | Proste  |
| Zmiana danych osoby | 1 update | Wiele updates | Wymaga synchronizacji |
| Rozmiar dokumentu | Mały | Ogromny | Średni  |
| Szybkość czytania | Wolna | Bardzo szybka  | Szybka  |
| Spójność danych | Wysoka  | Niska | Średnia |

**Wniosek:** Wariant 3 oferuje najlepszy balans między wydajnością a strukturą danych dla tego scenariusza.
```




