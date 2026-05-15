// cwiczenie 2
use north0

db.customers.find()
db.orders.find();
db.orderdetails.find();

// zadanie 1 a

db.orders.aggregate([
  {
    $lookup: {
      from: "customers",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "Customer"
    }
  },
  { $unwind: "$Customer" },
  {
    $lookup: {
      from: "employees",
      localField: "EmployeeID",
      foreignField: "EmployeeID",
      as: "Employee"
    }
  },
  { $unwind: "$Employee" },
  {
    $lookup: {
      from: "shippers",
      localField: "ShipVia",
      foreignField: "ShipperID",
      as: "Shipper"
    }
  },
  { $unwind: "$Shipper" },

  {
    $lookup: {
      from: "orderdetails",
      localField: "OrderID",
      foreignField: "OrderID",
      as: "Orderdetails"
    }
  },
  { $unwind: "$Orderdetails" },

  {
    $lookup: {
      from: "products",
      localField: "Orderdetails.ProductID",
      foreignField: "ProductID",
      as: "Orderdetails.Product"
// zamiast osobno wydzielać, dodajemy do OrderDetails
    }
  },
  { $unwind: "$Orderdetails.Product" },
  {
    $lookup: {
      from: "categories",
      localField: "Orderdetails.Product.CategoryID",
      foreignField: "CategoryID",
      as: "Orderdetails.Product.Category"
    }
  },
  { $unwind: "$Orderdetails.Product.Category" },

  {
    $lookup: {
      from: "suppliers",
      localField: "Orderdetails.Product.SupplierID",
      foreignField: "SupplierID",
      as: "Orderdetails.Product.Supplier"
    }
  },
  { $unwind: "$Orderdetails.Product.Supplier" },

  // zgrupowanie wszystkich danych
  {
    $group: {
      _id: "$_id",
// stosujemy first, bo te OrderID sie powtarzają wielokrotnie (przez unwind)
      OrderID: { $first: "$OrderID" },
        Dates: {
          $first: {
            OrderDate: "$OrderDate",
            RequiredDate: "$RequiredDate",
            /*ShippedDate: "$ShippedDate" */ }
        },
      Customer: { $first: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        City: "$Customer.City",
        Country: "$Customer.Country"
      }},
      Employee: { $first: {
            EmployeeID: "$Employee.EmployeeID",
            FirstName: "$Employee.FirstName",
            LastName: "$Employee.LastName",
            Title: "$Employee.Title"
      }},
      Shipment: { $first: {
        "Shipper": {
            "ShipperID":  "$shipper.ShipperID",
            "CompanyName": "$shipper.CompanyName"
            },
        "ShipName": "$ShipName",
        "ShipAddress": "$ShipAddress",
        "ShipCity": "$ShipCity",
        "ShipCountry": "$ShipCountry"
        },
      },
      Orderdetails: {
      //oddzielne dopisujemy
        $push: {
          UnitPrice: "$Orderdetails.UnitPrice",
          Quantity: "$Orderdetails.Quantity",
          Discount: "$Orderdetails.Discount",
          Value: "$Orderdetails.Value",
          Product: {
            ProductID: "$Orderdetails.ProductID",
            ProductName: "$Orderdetails.Product.ProductName",
            QuantityPerUnit: "$Orderdetails.QuantityPerUnit",
            CategoryID: "$Orderdetails.Product.CategoryID",
            CategoryName: "$Orderdetails.Product.Category.CategoryName",
            },
        }
      },
      OrderTotal: {
        $sum: {
          $multiply: [
            "$Orderdetails.UnitPrice",
            "$Orderdetails.Quantity",
            // zniżka
            { $subtract: [1, "$Orderdetails.Discount"] }
          ]
        }
      },
      Freight: { $first: "$Freight"}
    }
  },
  { $out: "OrdersInfo" },
]);

db.OrdersInfo.find().limit(1)

// zadanie 1 b
db.customers.aggregate([
  {
    $lookup: {
      from: "OrdersInfo",
      localField: "CustomerID",
      foreignField: "Customer.CustomerID",
      as: "Orders"
    }
  },

  {
    $project: {
      _id: 1,
      CustomerID: 1,
      CompanyName: 1,
      City: 1,
      Country: 1,
      // wybieramy to co nam potrzeba
      Orders: {
        $map: {
          input: "$Orders",
          as: "order",
          in: {
            // $$ - odniesienie do zmiennej (przez map)
            OrderID: "$$order.OrderID",
            Dates: "$$order.Dates",
            Employee: "$$order.Employee",
            Orderdetails: "$$order.Orderdetails",
            Freight: "$$order.Freight",
            OrderTotal: "$$order.OrderTotal",
            ShipAddress: "$$order.ShipAddress",
            Shipment: "$$order.Shipment"
          }
        }
      }
    }
  },

  { $out: "CustomerInfo" }
]);

db.CustomerInfo.find().limit(1);

// Zadanie 1 c) Napisz polecenie/zapytanie: Dla każdego klienta pokaż wartość zakupionych przez niego produktów z kategorii 'Confections' w 1997r

//oryginalne kolekcje (customers, orders, orderdetails, products, categories)
db.customers.find()
db.orders.find()
db.orderdetails.find()

db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      let: { custId: "$CustomerID" }, // przypisanie do custId
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$CustomerID", "$$custId"] },
                { $eq: [{ $year: "$OrderDate" }, 1997] }
              ]
            }
          }
        },
        { $lookup: { from: "orderdetails", localField: "OrderID", foreignField: "OrderID", as: "details" } },
        { $unwind: "$details" },
        { $lookup: { from: "products", localField: "details.ProductID", foreignField: "ProductID", as: "product" } },
        { $unwind: "$product" },
        { $lookup: { from: "categories", localField: "product.CategoryID", foreignField: "CategoryID", as: "category" } },
        { $unwind: "$category" },
        // filtr na confections
        { $match: { "category.CategoryName": "Confections" } },
        {
          $project: {
            value: {
              $multiply: [
                "$details.UnitPrice",
                "$details.Quantity",
                { $subtract: [1, "$details.Discount"] }
              ]
            }
          }
        }
      ],
      as: "orders_with_conf_1997"
    }
  },
  {
    $project: {
      _id: 1,
      CustomerID: 1,
      CompanyName: 1,
      ConfectionsSale97: { $sum: "$orders_with_conf_1997.value" }
    }
  },
]);

db.orderdetails.find().limit(1)
db.OrdersInfo.find().limit(1)

//1c wykorzystując OrderInfo

db.OrdersInfo.aggregate([
  {
    $unwind: {
      path: "$Orderdetails",
    }
  },
  {
    $group: {
      _id: "$Customer.CustomerID",
      CompanyName: { $first: "$Customer.CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $cond: [
            // if
            {
              $and: [
                { $gte: ["$Dates.OrderDate", ISODate("1997-01-01")] },
                { $lt: ["$Dates.OrderDate", ISODate("1998-01-01")] },
                { $eq: ["$Orderdetails.Product.CategoryName", "Confections"] }
              ]
            },
            // true
            {
              $multiply: [
                "$Orderdetails.UnitPrice",
                "$Orderdetails.Quantity",
                { $subtract: [1, "$Orderdetails.Discount"] }
              ]
            },
            // false
            0
          ]
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1
    }
  }
]);

//1c wykorzystując CustomerInfo


db.CustomerInfo.aggregate([
  {
    $unwind: {
      path: "$Orders",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $unwind: {
      path: "$Orders.Orderdetails",
      preserveNullAndEmptyArrays: true
    }
  },
  {
    $group: {
      _id: "$CustomerID",
      CompanyName: { $first: "$CompanyName" },
      ConfectionsSale97: {
        $sum: {
          $cond: [
            // if
            {
              $and: [
                { $gte: ["$Orders.Dates.OrderDate", ISODate("1997-01-01")] },
                { $lt: ["$Orders.Dates.OrderDate", ISODate("1998-01-01")] },
                { $eq: ["$Orders.Orderdetails.Product.CategoryName", "Confections"] }
              ]
            },
            // true
            {
              $multiply: [
                "$Orders.Orderdetails.UnitPrice",
                "$Orders.Orderdetails.Quantity",
                { $subtract: [1, "$Orders.Orderdetails.Discount"] }
              ]
            },
            // false
            0
          ]
        }
      }
    }
  },
  {
    $project: {
      _id: 1,
      CustomerID: "$_id",
      CompanyName: 1,
      ConfectionsSale97: 1
    }
  }
]);

// zadanie 1 d


// 1d - wszystkie

db.customers.aggregate([
  {
    $lookup: {
      from: "orders",
      localField: "CustomerID",
      foreignField: "CustomerID",
      as: "Order"
    }
  },
  { $unwind: { path: "$Order", preserveNullAndEmptyArrays: true } },
    {
    $lookup: {
      from: "orderdetails",
      localField: "Order.OrderID",
      foreignField: "OrderID",
      as: "OrderDetail"
    }
  },
  { $unwind: { path: "$OrderDetail", preserveNullAndEmptyArrays: true } },
  {
    $lookup: {
      from: "products",
      localField: "OrderDetail.ProductID",
      foreignField: "ProductID",
      as: "Product"
    }
  },
  { $unwind: { path: "$Product", preserveNullAndEmptyArrays: true } },
    {
    $lookup: {
      from: "categories",
      localField: "Product.CategoryID",
      foreignField: "CategoryID",
      as: "Category"
    }
  },
  { $unwind: { path: "$Category", preserveNullAndEmptyArrays: true } },
    // grupowanie ze wzdlegu na rok i miesiąc
  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        CompanyName: "$CompanyName",
        Year: { $year: "$Order.OrderDate" },
        Month: { $month: "$Order.OrderDate" }
      },
      MonthlyValue: {
        $sum: {
          $cond: [
            { $ifNull: ["$OrderDetail.UnitPrice", false] }, // czy istnieje
            {
              $multiply: [
                "$OrderDetail.UnitPrice",
                "$OrderDetail.Quantity",
                { $subtract: [1, "$OrderDetail.Discount"] }
              ]
            },
            0 // brak zamowień
          ]
        }
      }
    }
  },

// do jednego klienta
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      TotalLifetimeValue: { $sum: "$MonthlyValue" },
      SalesHistory: {
        $push: {
          Year: "$_id.Year",
          Month: "$_id.Month",
          Value: "$MonthlyValue"
        }
      }
    }
  },

  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      TotalLifetimeValue: 1,
      SalesHistory: "$SalesHistory"
      }
    }
]);


// 1d - OrdersInfo

db.OrdersInfo.aggregate([
  {
    $unwind: {
      path: "$Orderdetails",
      preserveNullAndEmptyArrays: true
    }
  },

    // group: year + month
  {
    $group: {
      _id: {
        CustomerID: "$Customer.CustomerID",
        CompanyName: "$Customer.CompanyName",
        Year: { $year: "$Dates.OrderDate" },
        Month: { $month: "$Dates.OrderDate" }
      },
      MonthlyValue: {
        $sum: {
          $cond: [
            { $ifNull: ["$Orderdetails.UnitPrice", false] },
            {
              $multiply: [
                "$Orderdetails.UnitPrice",
                "$Orderdetails.Quantity",
                { $subtract: [1, "$Orderdetails.Discount"] }
              ]
            },
            0 // nie ma
          ]
        }
      }
    }
  },
        // group: by customer
  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      TotalLifetimeValue: { $sum: "$MonthlyValue" },
      SalesHistory: {
        $push: {
          Year: "$_id.Year",
          Month: "$_id.Month",
          Value: "$MonthlyValue"
        }
      }
    }
  },

  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      TotalLifetimeValue: 1,
      SalesHistory: "$SalesHistory"
    }
  },
]);

// 1d - customerInfo

db.CustomerInfo.aggregate([
  {
    $unwind: {
      path: "$Orders",
      preserveNullAndEmptyArrays: true
    }
  },

  {
    $unwind: {
      path: "$Orders.Orderdetails",
      preserveNullAndEmptyArrays: true
    }
  },

  {
    $group: {
      _id: {
        CustomerID: "$CustomerID",
        CompanyName: "$CompanyName",
        Year: { $year: "$Orders.Dates.OrderDate" },
        Month: { $month: "$Orders.Dates.OrderDate" }
      },
      MonthlyValue: {
        $sum: {
          $cond: [
            { $ifNull: ["$Orders.Orderdetails.UnitPrice", false] },
            {
              $multiply: [
                "$Orders.Orderdetails.UnitPrice",
                "$Orders.Orderdetails.Quantity",
                { $subtract: [1, "$Orders.Orderdetails.Discount"] }
              ]
            },
            0
          ]
        }
      }
    }
  },

  {
    $group: {
      _id: "$_id.CustomerID",
      CompanyName: { $first: "$_id.CompanyName" },
      TotalLifetimeValue: { $sum: "$MonthlyValue" },
      SalesHistory: {
        $push: {
          Year: "$_id.Year",
          Month: "$_id.Month",
          Value: "$MonthlyValue"
        }
      }
    }
  },

  {
    $project: {
      _id: 0,
      CustomerID: "$_id",
      CompanyName: 1,
      TotalLifetimeValue: 1,
      SalesHistory: "$SalesHistory"
    }
  },
]);

// 1e

db.products.find({ "ProductName": "Chai" }) // unitprice = 18
db.products.find({ "ProductName": "Ikura" }) // unitprice = 31

// 1e kolekcje (orders + orderdetails)
db.orders.insertOne({
  OrderID: 99999,
  CustomerID: "ALFKI",
  EmployeeID: 1,
  OrderDate: ISODate("2026-05-15"),
  RequiredDate: ISODate("2026-06-15"),
  ShipVia: 1,
  Freight: 15.50,
  ShipName: "Alfreds Futterkiste",
  ShipAddress: "Obere Str. 57",
  ShipCity: "Berlin",
  ShipCountry: "Germany"
});

db.orderdetails.insertMany([
  { OrderID: 99999, ProductID: 1, UnitPrice: 18.00, Quantity: 10, Discount: 0 }, // Chai
  { OrderID: 99999, ProductID: 10, UnitPrice: 31.00, Quantity: 5, Discount: 0 }  // Ikura
]);
db.orderdetails.find()


// 1e OrdersInfo
db.customers.find({ "CustomerID": "ALFKI" })
db.employees.find({ "EmployeeID": 1 })

db.OrdersInfo.insertOne({
  OrderID: 99999,
  Customer: {
    CustomerID: "ALFKI",
    CompanyName: "Alfreds Futterkiste",
    City: "Berlin",
    Country: "Germany"
  },
  Dates: {
    OrderDate: ISODate("2026-05-15"),
    RequiredDate: ISODate("2026-06-15")
  },
  Employee: { EmployeeID: 1, FirstName: "Nancy", LastName: "Davolio", Title: "Sales Representative" },
  Freight: 15.50,
  OrderTotal: 335.00, // 18*10+31*5
  Shipment: {
    Shipper: { ShipperID: 1, CompanyName: "Speedy Express" },
    ShipName: "Alfreds Futterkiste",
    ShipAddress: "Obere Str. 57",
    ShipCity: "Berlin",
    ShipCountry: "Germany"
  },
  Orderdetails: [
    {
      UnitPrice: 18.00, Quantity: 10, Discount: 0,
      Product: { ProductID: 1, ProductName: "Chai", CategoryID: 1, CategoryName: "Beverages" }
    },
    {
      UnitPrice: 31.00, Quantity: 5, Discount: 0,
      Product: { ProductID: 10, ProductName: "Ikura", CategoryID: 8, CategoryName: "Seafood" }
    }
  ]
});


// 1e customerInfo

db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" },
  {
    $push: { // dodaj do tablicy Orders klienta
      Orders: {
        OrderID: 99999,
        Dates: { OrderDate: ISODate("2026-05-15T00:00:00Z"), RequiredDate: ISODate("2026-06-15T00:00:00Z") },
        Employee: { EmployeeID: 1, FirstName: "Nancy", LastName: "Davolio", Title: "Sales Representative" },
        Freight: 15.50,
        OrderTotal: 335.00,
        Shipment: {
            Shipper: { ShipperID: 1, CompanyName: "Speedy Express" },
            ShipName: "Alfreds Futterkiste",
            ShipAddress: "Obere Str. 57",
            ShipCity: "Berlin",
            ShipCountry: "Germany"
          },
        Orderdetails: [
          { UnitPrice: 18.00, Quantity: 10, Discount: 0, Product: { ProductID: 1, ProductName: "Chai" } },
          { UnitPrice: 31.00, Quantity: 5, Discount: 0, Product: { ProductID: 10, ProductName: "Ikura" } }
        ]
      }
    }
  }
);


// aktualizacja 1e kolekcje
db.orderdetails.updateOne(
  { OrderID: 99999, ProductID: 1 },
  { $set: { Quantity: 20 } }
);

db.orders.find({ OrderID: 99999})
db.orderdetails.find({ OrderID: 99999})


// aktualizacja 1e OrdersInfo

db.OrdersInfo.updateOne(
  { OrderID: 99999 },
  {
    $set: {
      "Orderdetails.$[elem].Quantity": 20, // dla elem
      "OrderTotal": 515.00      // suma sie zmienia
    }
  },
  { // przypisanie
    arrayFilters: [ { "elem.Product.ProductID": 1 } ]   // := elem
  }
);

db.OrdersInfo.find({ OrderID: 99999})

// aktualizacja 1e CustomerInfo

db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" },
  {
    $set: {
      // "ord" to element tablicy Orders, a "prod" to element tablicy Orderdetails
      "Orders.$[ord].Orderdetails.$[prod].Quantity": 20,
      "Orders.$[ord].OrderTotal": 515.00 // suma sie zmienia
    }
  },
  {
    arrayFilters: [ // przypisania
      { "ord.OrderID": 99999 },           // := ord (orderid = 99999)
      { "prod.Product.ProductID": 1 }     // := prod (prodid = 1)
    ]
  }
);


// 1f kolekcje

db.orderdetails.updateMany(
  { OrderID: 99999 },
  { $inc: { Discount: 0.05 } } //zwiększ o
);

// 1f OrdersInfo
db.OrdersInfo.updateOne(
  { OrderID: 99999 },
  [ // [] Aggregation Pipeline

  // + 5% discount
    {
      $set: {
        Orderdetails: {
          $map: {
            input: "$Orderdetails",
            as: "item",
            in: {
              // $mergeObjects nadpisuje tylko discount, reszte zostawia
              $mergeObjects: [
                "$$item",
                { Discount: { $add: ["$$item.Discount", 0.05] } }
              ]
            }
          }
        }
      }
    },

    // musimy przeliczyc OrderTotal
    {
      $set: {
        OrderTotal: {
          $sum: {
            $map: {
              input: "$Orderdetails", // to jest już ta NOWA tablica
              as: "item",
              in: {
                $multiply: [
                  "$$item.UnitPrice",
                  "$$item.Quantity",
                  { $subtract: [1, "$$item.Discount"] }
                ]
              }
            }
          }
        }
      }
    }
  ]
);



// aktualizacja discount, podzielona na dwie części bo to jakas masakra z pipeline
// 1. discount
db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI" }, // Znajdź klienta
  {
    $inc: {
      // w [ord] dla wszystkich produktów ($[]), inc. 0.05
      "Orders.$[ord].Orderdetails.$[].Discount": -0.05
    }
  },
  {
    arrayFilters: [
      { "ord.OrderID": 99999 } // := ord
    ]
  }
);

// 2. aktualizacja OrderTotal
db.CustomerInfo.updateOne(
  { CustomerID: "ALFKI", "Orders.OrderID": 99999 },
  [
    {
      $set: {
        Orders: {
          $map: {
            input: "$Orders",
            as: "order",
            in: {
              $cond: {
                if: { $eq: ["$$order.OrderID", 99999] },
                // Jeśli to szukane zamówienie, nadpisujemy tylko pole OrderTotal
                then: {
                  $mergeObjects: [
                    "$$order",
                    {
                    // wyliczenie nowego OrderTotal
                      OrderTotal: {
                        $sum: {
                          $map: {
                            input: "$$order.Orderdetails", // po aktualizacji
                            as: "prod",
                            in: {
                              $multiply: [
                                "$$prod.UnitPrice",
                                "$$prod.Quantity",
                                { $subtract: [1, "$$prod.Discount"] }
                              ]
                            }
                          }
                        }
                      }
                    }
                  ]
                },
                // jeśli to inne zamówienie, zostawiamy je w spokoju
                else: "$$order"
              }
            }
          }
        }
      }
    }
  ]
);

db.CustomerInfo.find(  { "Orders.OrderID": 99999}, {
    _id: 0,
    CustomerID: 1,
    Orders: { $elemMatch: { OrderID: 99999 } }
  })

