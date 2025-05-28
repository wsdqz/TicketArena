# TicketArena

![localhost_3000_](https://github.com/user-attachments/assets/c830b796-90bc-4536-82e0-a6515d61c124)


## Project Description

TicketArena is a full-featured web system for booking tickets for various events. The project includes both a user part for viewing events and booking tickets, and an administrative panel for managing events, users, and bookings.

## Key Features

- **Authentication and Authorization:** Registration, login, logout, password reset/update, role-based access (user, admin).
- **User Profile:** View and edit personal information, upload/update avatar.
- **Homepage:** Display a list of events with search and filtering capabilities.
- **Event Details:** View detailed information about an event and book tickets.
- **My Tickets:** View and manage personal bookings.
- **Admin Panel:** Manage users, events, and all bookings.
- **Notifications:** Notifications for successful operations.
- **Multilingual Support:** Switch between Russian (RU) and English (EN) languages.
- **Theme Support:** Switch between light and dark interface themes.
- **Responsive Design:** Optimize interface for various devices (desktop, tablets, mobile phones).

## Technologies Used

**Frontend:**
- React
- React Router
- Redux Toolkit
- Material UI (MUI)
- date-fns
- Other supporting libraries

**Backend:**
- Python (Flask)
- SQLAlchemy (ORM)
- Flask-Login
- Flask-CORS
- SQLite (default database)
- Other supporting libraries

## Setup and Running

### Backend Setup

Navigate to the `backend` directory.

```bash
cd backend
```

Create and activate a virtual environment (recommended).

```bash
# For Windows
python -m venv .venv
.venv\Scripts\activate

# For macOS/Linux
python3 -m venv .venv
source .venv/bin/activate
```

Install dependencies.

```bash
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with the following content (replace default values with your own):

```dotenv
FLASK_APP=app.py
FLASK_ENV=development
SECRET_KEY=ticket-arena-secret-key
DATABASE_URL=sqlite:///ticketarena.db
```

Initialize the database.

```bash
python init_db.py
```

Run the backend server.

```bash
flask run
```

The backend will be available at `http://localhost:5000`.

### Frontend Setup

Open a new terminal window or tab and navigate to the project root directory.

```bash
cd ..
cd frontend
```

Install dependencies.

```bash
npm install
```

Run the frontend application.

```bash
npm start
```

The frontend application typically runs on `http://localhost:3000`.

## Usage

Open a web browser and navigate to the frontend application address. You can register as a new user or log in if already existing admin account. To access the admin panel, log in with an account that has the "admin" role. (admin@gmail.com / admin123)
