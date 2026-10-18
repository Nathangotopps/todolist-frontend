# Real-Time Shared To-Do List (Frontend)

A themed, real-time to-do list built with React and Firebase. Tasks sync instantly across devices, and each category has its own background, color palette and music.

This is the **frontend** repo. Login and session handling live in a separate PHP/MySQL backend: (https://github.com/Nathangotopps/todolist-backend).

**Live demo:** start at https://yoyin-todo.xo.je and click "Try as Anonymous Guest" to look around without signing up.
The React app itself is hosted at https://todolist-frontend-l46h.vercel.app (it needs a login token from the backend, so open it from the demo above).

### Known limitations
- No password reset: the free host can't send email, so a forgotten password means creating a new account.
- Guest accounts are temporary: once you log out, you can't get back to a guest's tasks.
- Runs on free tiers (Firebase Spark, InfinityFree, Vercel Hobby), so only about 100 people can be connected at once and the backend may be slow at times.

## Features

- Real-time sync with Firebase Realtime Database
- Four categories: Financial, Fitness, Academic and Personal (with subcategories)
- Per-category background, theme and background music, plus a completion chime and mute toggle
- Secure sign-in: the PHP backend mints a Firebase custom token, so each user only sees their own data
- Mobile-friendly layout

## How it works

1. The user logs in through the PHP backend (`login.php`).
2. `dashboard.php` creates a Firebase custom token for the logged-in user and links to this app as `?token=...&category=...&theme=...`.
3. The app signs in with that token via Firebase Authentication and reads and writes only under that user's own `uid`.

## Getting started

Requirements: Node.js and npm, a Firebase project, and the backend running (for example on XAMPP).

```bash
npm install
npm start
```

The app opens at http://localhost:3000. It needs a token from the backend to sign in, so start from the backend's dashboard page instead of opening the app directly.

### Firebase setup

1. Create a Firebase project with **Realtime Database** and **Authentication** enabled.
2. Put your own web config in `src/firebase.js`. These values are public by design. Your database rules are what protect the data.
3. Use rules that scope each user to their own data, for example:

```json
{
  "rules": {
    "users": {
      "$uid": {
        "personal": {
          "$subcategory": {
            ".read": "auth != null && auth.uid === $uid",
            ".write": "auth != null && auth.uid === $uid",
            "$todoId": {
              ".validate": "newData.hasChildren(['text', 'completed'])"
            }
          }
        },
        "$category": {
          ".read": "auth != null && auth.uid === $uid",
          ".write": "auth != null && auth.uid === $uid",
          "$todoId": {
            ".validate": "newData.hasChildren(['text', 'completed'])"
          }
        }
      }
    }
  }
}
```

### Production build

```bash
npm run build
```

The dashboard link in `src/App.js` currently points to `http://localhost/MYSQL_work/dashboard.php`. Change it to your deployed backend URL before hosting.

## License

The source code in this repository is released under the [MIT License](LICENSE).

The music, sound effects and images used by the app are **not** covered by that license.
They belong to their respective creators and are used under their own licenses.
See [CREDITS.md](CREDITS.md) for the full list and attribution.
