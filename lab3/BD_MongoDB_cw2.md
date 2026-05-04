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

> Wyniki: 
> 
> przykłady, kod, zrzuty ekranów, komentarz ...

```js
--  ...
```




