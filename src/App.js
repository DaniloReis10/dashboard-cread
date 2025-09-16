import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MoodleDashboard from './components/MoodleDashboard';
import TotalMatriculasPorAno from './components/TotalMatriculasPorAno';
import MapaCeara from './components/MapaCeara';
import MapaEstadosBrasil from './components/MapaEstadosBrasil';
import StudentDashboard from './components/AnaliseEstudantesDashboard';

function App() {
    return ( <
        Router >
        <
        div className = "App" >
        <
        Routes >
        <
        Route path = "/"
        element = { < MoodleDashboard / > }
        /> <
        Route path = "/matriculas-por-ano"
        element = { < TotalMatriculasPorAno / > }
        /> <
        Route path = "/mapa-ceara"
        element = { < MapaCeara / > }
        /> <
        Route path = "/mapa-estados-brasil"
        element = { < MapaEstadosBrasil / > }
        /> <
        Route path = "/student-dashboard"
        element = { < StudentDashboard / > }
        /> <
        /Routes> <
        /div> <
        /Router>
    );
}

export default App;