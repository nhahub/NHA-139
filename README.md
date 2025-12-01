Absolutely! Here's the full **English README content in one single block**. You can copy it all at once and save it as `README.md`:

````markdown
# Where 2 Go — Local Business & Entertainment Directory

**Summary**  
Where 2 Go is a comprehensive platform that helps users discover outing spots (restaurants, cafes, entertainment activities) across Egyptian governorates. Users can filter by Price Level, city, category, and distance. The application supports Arabic/English (RTL), allows owners to manage their listings, and admins to control approvals.

---

## 📌 Key Features
- Advanced search and filtering by `city`, `category`, `priceLevel`, and distance (lat/lng radius).  
- Listing management (Owners: CRUD on their listings).  
- Listing lifecycle: **Submitted (pending) → Admin Review → Accepted / Rejected**. Owner updates reset the status to `pending`.  
- Favorites and history stored as arrays of Place IDs within the User entity.  
- Authentication and Role-Based Access Control (RBAC) using JWT.  
- Bilingual interface (Arabic/English) with RTL support.  
- Scalable architecture: React + Node.js/Express + MongoDB.

---

## 🏗️ Tech Stack
- **Frontend:** React, TypeScript, Tailwind CSS, shadcn/ui, react-i18next  
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT  
- **Media/Storage:** Cloudinary (optional)  
- **Deployment:** Heroku / Render / Cloud VM / any cloud provider

---

## 🚀 Local Setup

1. Clone the repository:
```bash
git clone <repo-url>
cd where2go
````

2. Setup the backend:

```bash
cd server
npm install
# create a .env file in the server folder
```

3. Setup the frontend:

```bash
cd ../client
npm install
```

4. Example environment variables (`server/.env`):

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster0.example.mongodb.net/where_to_go_db?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_here
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

5. Run the project locally:

* Start the server:

```bash
cd server
npm run dev
```

* Start the frontend:

```bash
cd ../client
npm run dev
```

---

## 🔌 Key API Endpoints

> Note: Endpoints are examples — check server routes for complete details.

### Places / Search

* `GET /api/v1/places/search`

  * Query params: `city`, `category`, `priceLevel`, `lat`, `lng`, `radius`, `sortBy`
  * Returns filtered list of places sorted by distance or rating.

### Users

* `POST /api/users/favorites` — Add/remove favorite place (Authenticated)
* `POST /api/users/history` — Add visit history (Authenticated)
* `POST /api/auth/signup` — Register a new user
* `POST /api/auth/login` — Login (returns JWT)

### Listings (Owner / Admin)

* `POST /api/listings/submit` — Owner only. Submit a listing (status = pending)
* `PUT /api/listings/:id/own` — Owner only. Update own listing (resets status to pending)
* `PATCH /api/listings/:id/status` — Admin only. Change status (`accepted`, `rejected`)

---

## 🔁 Listing Lifecycle

1. Owner submits → **status = pending**
2. Admin review:

   * **Accepted** → visible in search results
   * **Rejected** → removed or flagged according to project policy
3. Any owner update → resets status to `pending` (requires re-review)

---

## 🛡️ Security & RBAC

* Authentication via **JWT**
* Ownership verification on sensitive endpoints
* Roles: `admin`, `owner`, `user`
* Optional: Rate limiting for sensitive endpoints

---

## ✅ Testing & Quality

* Unit tests for backend (e.g., using Jest)
* Integration tests for key API endpoints
* Manual testing: search, filtering, lifecycle flow, RBAC enforcement

---

## 🧭 Additional Notes / Docs

* Include `ERD` and `Architecture Diagram` in `docs/` folder or link images.
* Optional `API_DOCS.md` for full endpoint request/response examples.

---

## 👥 Team

* **Supervisor:** Eng. Basma Abdel Halim
* **Team Members:**

  * Amira Hesham — Globalization & Documentation / Frontend
  * Saif Harraz — Frontend (Listing Management)
  * Amr Ahmed — Frontend (Home & Catalog)
  * Mohamed Hossam — Backend (System Logic & Contact)
  * Awad Fahim — Backend (Authentication & User Management)

---

## 💡 Contributing

1. Open an Issue describing the bug or feature.
2. Create a branch from `main` (e.g., `feature/add-search-filters`).
3. Send a Pull Request with clear description.
4. Follow code style and linting rules.

---

## 📄 License

```
MIT License
```

---

## ✉️ Contact

* **Team Lead:** Amira Hesham
* Email / amiirahesham.1@gmail.com

