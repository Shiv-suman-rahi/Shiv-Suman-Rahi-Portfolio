# 📝 Shiv Suman Rahi Portfolio

A modern and user-friendly **Paste Management Application** built with **React.js** that allows users to create, manage, and share multiple text/code pastes easily.

The application provides a simple interface for storing useful snippets, notes, code, and text while giving users complete control to **create, view, edit, delete, copy, and share** their pastes.

---

## 🚀 Features

* ✨ **Create Multiple Pastes**
  Create and store multiple text or code snippets.

* 👀 **View Pastes**
  View the complete content of any saved paste.

* ✏️ **Edit / Update Pastes**
  Modify existing pastes whenever required.

* 🗑️ **Delete Pastes**
  Remove unwanted pastes from the application.

* 📋 **Copy to Clipboard**
  Copy paste content to the clipboard with a single click.

* 🔗 **Share Pastes**
  Generate/share a link to easily access a particular paste.

* 🔍 **Search Pastes**
  Quickly find a paste using its title or content.

* 💾 **Local Storage**
  Pastes are stored in the browser's local storage so that they remain available after refreshing the page.

* 🔔 **Toast Notifications**
  Provides feedback for actions such as creating, updating, deleting, and copying pastes.

* 📱 **Responsive UI**
  Designed to work across desktop and mobile screen sizes.

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML5
* CSS3

### State Management

* Redux Toolkit
* React Redux

### Routing

* React Router DOM

### Storage

* Browser Local Storage

### UI / Utilities

* React Hot Toast
* Tailwind CSS *(if used in your project)*

---

## 📂 Project Structure

```text
PasteApp/
│
├── public/
│
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   ├── Home.jsx
│   │   ├── Paste.jsx
│   │   └── PasteBox.jsx
│   │
│   ├── redux/
│   │   ├── store.js
│   │   └── pasteSlice.js
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── package.json
├── package-lock.json
└── README.md
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/paste-app.git
```

### 2. Navigate to the Project

```bash
cd paste-app
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Configure the contact API

The contact form uses the Express API and MongoDB Atlas. Copy `.env.example` to
`.env`, then replace the MongoDB Atlas placeholder with a database connection
string. Keep `.env` private; it is ignored by Git.

Create a frontend environment file named `.env.local`:

```text
VITE_API_URL=http://localhost:5000
```

### 5. Start the Development Servers

Run the API and frontend in separate terminals:

```bash
npm run dev
# in another terminal
npm run server
```

The application will be available at:

```text
http://localhost:5173
```

The API exposes `POST /api/contact` and `GET /api/health`. The server validates
name, email, and message before storing contact messages in the `ContactMessage`
MongoDB collection. Set `CLIENT_ORIGIN` to a comma-separated list of allowed
frontend origins when deploying.

---

## 💡 How It Works

### Create a Paste

Users can enter a title and paste content into the application and save it.

Each paste is assigned a unique identifier.

```text
Title
   ↓
Paste Content
   ↓
Create Paste
   ↓
Save in Redux State
   ↓
Save in Local Storage
```

### Manage Pastes

After creating pastes, users can perform different operations:

```text
              Paste
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
     View      Edit      Delete
      │         │         │
      ↓         ↓         ↓
    Share      Update    Remove
      │
      ↓
    Copy
```

---

## 🧠 State Management

The application uses **Redux Toolkit** to manage paste data.

The paste state contains multiple paste objects.

Example:

```javascript
{
  _id: "12345",
  title: "React Notes",
  content: "React is a JavaScript library...",
  createdAt: "2026-09-01T10:30:00.000Z"
}
```

Redux manages operations such as:

```text
addToPastes()
updateToPastes()
removeFromPastes()
```

---

## 💾 Local Storage

The application uses browser **Local Storage** to persist paste data.

Whenever a paste is created, updated, or deleted, the application synchronizes the Redux state with Local Storage.

Example:

```javascript
localStorage.setItem(
  "pastes",
  JSON.stringify(pastes)
);
```

This allows users to keep their pastes even after refreshing the browser.

---

## 🔍 Search Functionality

Users can search through their saved pastes.

The search functionality can be used to filter pastes based on:

* Title
* Content

Example:

```text
Search: React

        ↓

React Hooks
React Router
React Redux
React Notes
```

---

## 📋 Copy Functionality

Users can copy paste content directly to their clipboard.

This is especially useful for:

* Code snippets
* URLs
* Notes
* Commands
* Frequently used text

---

## 🔗 Share Functionality

Each paste has a unique identifier that can be used to access or share the paste.

Example:

```text
/paste/12345
```

A user can share this URL with others to access the corresponding paste.

---

## 🎯 Use Cases

This application can be useful for:

* 👨‍💻 Developers storing code snippets
* 📚 Students saving notes
* 🔗 Saving frequently used URLs
* 📝 Temporary text storage
* 💻 Saving terminal commands
* 📋 Managing reusable content

---

## 🔮 Future Improvements

Some features that can be added in future versions:

* 🔐 User authentication
* ☁️ Cloud database storage
* 👥 User-specific pastes
* 🌙 Dark / Light mode
* 🏷️ Paste categories and tags
* ⭐ Favorite pastes
* 📌 Pin important pastes
* 📊 Paste analytics
* ⏳ Paste expiration
* 🔒 Private/password-protected pastes
* 🌐 Backend API
* 🗄️ MongoDB integration
* 🚀 Deployment

---

## 📸 Application Preview

Add screenshots of your application here:

```text
/screenshots
    ├── home.png
    ├── create-paste.png
    ├── paste-list.png
    └── view-paste.png
```

---

## 📚 Learning Outcomes

While building this project, I practiced:

* React component architecture
* React Hooks
* State management with Redux Toolkit
* React Router
* CRUD operations
* Local Storage
* Clipboard API
* Search and filtering
* Toast notifications
* Reusable React components
* Managing application state
* Building a complete frontend project

---

## 👨‍💻 Author

**Your Name**

Built with ❤️ using React.js.

---

## ⭐ Support

If you find this project useful, consider giving the repository a ⭐ on GitHub.
