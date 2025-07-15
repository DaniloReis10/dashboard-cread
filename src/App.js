import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MoodleDashboard from './components/MoodleDashboard';
import TotalMatriculasPorAno from './components/TotalMatriculasPorAno';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<MoodleDashboard />} />
          <Route path="/matriculas-por-ano" element={<TotalMatriculasPorAno />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
