# Running ZenTasks Locally

Follow these steps to launch the application.

## Prerequisites
- [Node.js](https://nodejs.org/) installed.
- [MongoDB](https://www.mongodb.com/try/download/community) installed and running on `localhost:27017`.

## 1. Backend Setup
Navigate to the `backend` directory and start the server:
```powershell
cd backend
npm install  # If not already installed
npm start
```
> [!NOTE]
> The server will run on [http://localhost:5000](http://localhost:5000). Ensure MongoDB is active before starting.

## 2. Frontend Setup
In a separate terminal, navigate to the `frontend` directory and start the development server:
```powershell
cd frontend
npm install  # If not already installed
npm run dev
```
> [!TIP]
> The app will be available at the URL provided in the terminal (usually [http://localhost:5173](http://localhost:5173)).

## 3. Initial Admin Setup
To create an admin account, you can use the Register page. Once the user is created in the database, you can manually update their `role` to `admin` in MongoDB (e.g., using MongoDB Compass or the shell):
```javascript
db.users.updateOne({ email: "your@email.com" }, { $set: { role: "admin" } });
```
Once set, you will see the **Admin** link in the navigation bar.
