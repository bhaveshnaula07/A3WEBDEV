# Inventory and Data Management System

REST API built with Node.js, Express, MongoDB and Mongoose (Web Dev III, Assignment 3).

## Setup

1. Install MongoDB locally (or use a MongoDB Atlas URI).
2. Install dependencies: `npm install`
3. Check `.env` (copy from `.env.example`):
   ```
   PORT=5000
   MONGO_URI=mongodb://127.0.0.1:27017/inventory_db
   ```
4. (Optional) load 12 sample products: `npm run seed`
5. Start the server: `npm start` (or `npm run dev` for auto-reload)

## Folder structure

```
config/db.js                  MongoDB connection
models/Product.js             Schema, validation, stockValue virtual
controllers/productController.js
routes/productRoutes.js
middleware/errorHandler.js    404 + centralized error handler
middleware/validateId.js      ObjectId check
middleware/validateStockChange.js
seed.js                       Sample data
server.js                     App entry point
```

## Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| POST | /api/products | Create product |
| GET | /api/products | List with filter, sort, pagination |
| GET | /api/products/:id | Single product |
| PUT | /api/products/:id | Update product details |
| PATCH | /api/products/:id/stock | Restock / sale, body `{ "change": 10 }` or `{ "change": -3 }` |
| DELETE | /api/products/:id | Delete product |
| GET | /api/products/low-stock | Items with quantity <= reorderLevel (aggregation) |
| GET | /api/products/summary | Category-wise summary (aggregation) |

### Query parameters for GET /api/products

- `category=Furniture`, `supplier=ikea`, `search=pen`
- `minPrice=100&maxPrice=5000`, `inStock=true`
- `sort=-price,name` (prefix `-` for descending)
- `page=2&limit=5` (default page 1, limit 10, max 100)

### Sample POST body

```json
{
  "name": "Gel Pen Pack of 15",
  "sku": "STNY-PN-713",
  "category": "Stationery",
  "price": 120,
  "quantity": 40,
  "reorderLevel": 20,
  "supplier": "Cello Pens"
}
```

Valid categories: Electronics, Apparel, Furniture, Stationery, Grocery, Books, Toys, Sports, Other.

## Notes

- A sale (negative `change`) is rejected with 400 if it would take stock below zero. The update uses an atomic `$inc`, so concurrent sales are safe.
- Errors always return `{ "success": false, "message": "...", "errors": [...] }` with 400 (validation), 404 (not found) or 409 (duplicate SKU).
