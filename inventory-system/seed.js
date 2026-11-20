require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Product = require('./models/Product');

const products = [
  { name: 'Wireless Mouse', sku: 'ELEC-MS-101', category: 'Electronics', price: 799, quantity: 25, reorderLevel: 10, supplier: 'Logitech India' },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KB-102', category: 'Electronics', price: 3499, quantity: 8, reorderLevel: 10, supplier: 'Redragon' },
  { name: 'Bluetooth Speaker', sku: 'ELEC-SP-103', category: 'Electronics', price: 2499, quantity: 40, reorderLevel: 15, supplier: 'boAt' },
  { name: 'Laptop 15 inch', sku: 'ELEC-LP-104', category: 'Electronics', price: 54999, quantity: 23, reorderLevel: 5, supplier: 'Dell India' },
  { name: 'Cotton T-Shirt', sku: 'APRL-TS-201', category: 'Apparel', price: 499, quantity: 50, reorderLevel: 20, supplier: 'Raymond' },
  { name: 'Denim Jeans', sku: 'APRL-JN-202', category: 'Apparel', price: 2299, quantity: 28, reorderLevel: 10, supplier: 'Levis India' },
  { name: 'Study Table', sku: 'FURN-TB-812', category: 'Furniture', price: 3999, quantity: 2, reorderLevel: 4, supplier: 'IKEA India' },
  { name: 'Office Chair', sku: 'FURN-CH-813', category: 'Furniture', price: 5499, quantity: 3, reorderLevel: 5, supplier: 'Godrej Interio' },
  { name: 'Gel Pen Pack of 10', sku: 'STNY-PN-711', category: 'Stationery', price: 100, quantity: 120, reorderLevel: 30, supplier: 'Cello Pens' },
  { name: 'A4 Notebook', sku: 'STNY-NB-712', category: 'Stationery', price: 60, quantity: 6, reorderLevel: 25, supplier: 'Classmate' },
  { name: 'Basmati Rice 5kg', sku: 'GROC-RC-901', category: 'Grocery', price: 650, quantity: 70, reorderLevel: 20, supplier: 'India Gate' },
  { name: 'Olive Oil 1L', sku: 'GROC-OL-902', category: 'Grocery', price: 899, quantity: 18, reorderLevel: 15, supplier: 'Figaro' },
];

(async () => {
  try {
    await connectDB();
    await Product.deleteMany({});
    await Product.insertMany(products);
    console.log(`Seeded ${products.length} products`);
  } catch (err) {
    console.error('Seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
})();
