# Portfolio Backend Setup Guide

## Overview
This backend is built with Node.js + Express and uses SQLite for data persistence. It provides API endpoints for managing users (contact form submissions) and projects.

## Features
- ✅ Express.js REST API
- ✅ SQLite Database
- ✅ CORS enabled for frontend integration
- ✅ Full CRUD operations for Users and Projects

## Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start the Server
```bash
# Development mode (auto-reload)
npm run dev

# Production mode
npm start
```

The server will run on `http://localhost:5000`

## Database

> ⚠️ **PORT conflicts**
> If you see an `EADDRINUSE` error when starting the server, another process is already
> using port 5000. Kill the process or run with a different port:
> ```bash
> PORT=3000 npm start
> ```
>

### Tables

#### Users Table
- `id` - Auto-increment primary key
- `name` - User's name
- `email` - User's email (unique)
- `message` - Optional message
- `created_at` - Timestamp

#### Projects Table
- `id` - Auto-increment primary key
- `title` - Project title
- `description` - Project description
- `technologies` - Technologies used (comma-separated)
- `link` - Project URL
- `created_at` - Timestamp

## API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Projects
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get project by ID
- `POST /api/projects` - Create new project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Health Check
- `GET /api/health` - Check if server is running

## Frontend Integration

### Example: Submit Contact Form
```javascript
const contactForm = document.getElementById('contact-form');

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    message: document.getElementById('message').value
  };

  try {
    const response = await fetch('http://localhost:5000/api/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (response.ok) {
      console.log('Contact form submitted:', data);
      contactForm.reset();
    } else {
      console.error('Error:', data.error);
    }
  } catch (error) {
    console.error('Network error:', error);
  }
});
```

### Example: Fetch All Projects
```javascript
async function loadProjects() {
  try {
    const response = await fetch('http://localhost:5000/api/projects');
    const projects = await response.json();
    console.log('Projects:', projects);
    // Render projects on your page
  } catch (error) {
    console.error('Error loading projects:', error);
  }
}

loadProjects();
```

## Database File
The SQLite database file (`portfolio.db`) is automatically created in the `backend` folder when you run the server for the first time.

## Troubleshooting

**Port 5000 already in use?**
Set a different port:
```bash
PORT=3000 npm start
```

**Database not persisting?**
Check that you have write permissions in the backend folder.

**CORS errors?**
The backend allows all origins by default. Modify `cors()` in `server.js` for production:
```javascript
app.use(cors({
  origin: 'http://localhost:3000'
}));
```
