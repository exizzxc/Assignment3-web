# 🛒 AITU-Tech — Online Electronics Store (Assignment 3)

This project is a full-stack backend-driven web application developed as part of **Assignment 3**.  
The goal of the assignment was to migrate from local JSON storage to **MongoDB**, implement a full **CRUD REST API**, and connect it to a simple frontend interface.

---

## 🎯 Project Objective

- Replace local JSON-based storage with **MongoDB**
- Build a fully functional **CRUD API**
- Validate incoming data
- Connect backend API to frontend pages
- Remove all hardcoded (demo) data
- Prepare the project for Final Project extension

---

## 🧱 Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- dotenv
- cors

### Frontend
- HTML5
- CSS3 (Bootstrap 5)
- Vanilla JavaScript
- Fetch API

---

## 📦 Project Structure
server/
├─ src/
│   ├─ app.js
│   ├─ models/
│   │   └─ Product.js
│   └─ routes/
│       └─ products.js
├─ public/
│   ├─ index.html
│   ├─ catalog.html
│   ├─ product.html
│   ├─ cart.html
│   ├─ styles.css
│   ├─ script.js
│   └─ images/
├─ .env
└─ package.json

---

## 🗄️ Database Design

### Primary Object: Product

Each product document contains:

- `name` (String, required)
- `price` (Number, required)
- `category` (String, required)
- `brand` (String, required)
- `description` (String)
- `imageUrl` (String)
- `stock` (Number, required)
- `createdAt`, `updatedAt` (timestamps)

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|------|--------|-------------|
| POST | `/products` | Create a new product |
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

All POST and PUT requests are validated using Mongoose schema rules.

---

## 🖥️ Frontend Integration

- **catalog.html**  
  Loads products dynamically from MongoDB using `GET /products`

- **product.html**  
  Displays a single product using `GET /products/:id`  
  Product ID is passed via URL query parameters

- **cart.html**  
  Uses shared frontend logic from `script.js`  
  No inline JavaScript or demo logic

All demo and hardcoded data has been fully removed.

---

## 🧪 Testing

All endpoints were manually tested using **Postman**:

- Product creation (POST)
- Retrieval of all products (GET)
- Retrieval by ID (GET)
- Update (PUT)
- Deletion (DELETE)

Screenshots are provided below.

---

## ▶️ How to Run the Project

### 1. Install dependencies
cd server
npm install 

### 2. Configure environment variables
PORT=3000
MONGODB_URI=your_mongodb_atlas_connection_string

### 3. Start the server
npm run dev

### 4. Open frontend

http://localhost:3000/catalog.html
