# Fasal Rakshak - Frontend

Vite + React frontend scaffold with TailwindCSS, Redux Toolkit, React Router, Axios, i18next, react-hook-form, and a mock API for development. Includes a simple PWA service worker and offline upload queue.

Quick start

```powershell
npm install
npm run dev
# open http://localhost:5174/ (Vite may pick another port if 5173 is busy)
```

Run tests:

```powershell
npm test
```

Docker (build & serve):

```powershell
docker build -t fasal-rakshak-frontend .
docker run -p 8080:80 fasal-rakshak-frontend
```
