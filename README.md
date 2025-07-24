# 📊 Enrollment Dashboard

A simple analytics dashboard built with **React**, **Tailwind CSS** and **Recharts**. It provides example pages for visualising enrolment statistics and can be used as a starting point for your own dashboards.

## Features

- React + React Router application bootstrapped with Create React App
- Tailwind CSS for styling and layout
- Recharts components for building interactive charts
- Mock API fallback so the app works even without a backend
- Example dashboard screen and an enrolments per year chart screen

## Getting Started

### Requirements

- Node.js with npm installed

### Installation

1. Clone this repository
   ```bash
   git clone https://github.com/your_username_/Project-Name.git
   cd Project-Name
   ```
2. Install dependencies
   ```bash
   npm install
   ```
3. Configure the API URL (optional)
   Create a `.env.local` file and set:
   ```bash
   REACT_APP_API_URL=http://localhost:3000
   ```
   If no API is available the chart page will automatically use mock data.
4. Start the development server
   ```bash
   npm start
   ```
   The app will open at http://localhost:3000.

### Scripts

- `npm start` – run the app in development mode
- `npm test` – run Jest tests
- `npm run build` – create a production build

## Project Structure

```
/
├── public/               # Static HTML template
├── src/
│   ├── components/
│   │   ├── MoodleDashboard.jsx          # landing page with categories
│   │   └── TotalMatriculasPorAno.jsx    # enrolments chart
│   ├── App.js              # route definitions
│   ├── index.js            # entry point
│   └── ...
├── tailwind.config.js
└── package.json
```

## Key Components

- **MoodleDashboard.jsx** – displays category cards, quick stats and links to analyses.
- **TotalMatriculasPorAno.jsx** – fetches enrolment data and renders a combined area/bar/line chart. Falls back to mock data if the API cannot be reached.

## Contributing

Pull requests are welcome! If you spot a bug or have an improvement, feel free to open an issue or submit a PR.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/YourFeature`)
3. Commit your changes (`git commit -m 'Add YourFeature'`)
4. Push to the branch (`git push origin feature/YourFeature`)
5. Open a pull request

Made with ❤️
