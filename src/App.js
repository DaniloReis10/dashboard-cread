import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import MoodleDashboard from './components/MoodleDashboard';
import TotalMatriculasPorAno from './components/TotalMatriculasPorAno';
import MapaCeara from './components/MapaCeara';
import MapaEstadosBrasil from './components/MapaEstadosBrasil';
import PoloDashboardPage from './PoloDashboardPage.tsx';

import Analytics_Behavour from './components/Analytics_Behavour';
import Analytics_Resources from './components/Analytics_Resources';
import MoodleSessionboard from './components/MoodleSessionboard';

import './App.css';

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
        Route path = "/polo-dashboard-ead"
        element = { < PoloDashboardPage / > }
        /> <
        Route path = "/analytics-behavour"
        element = { < Analytics_Behavour / > }
        /> <
        Route path = "/analytics-resources"
        element = { < Analytics_Resources / > }
        /> <
        Route path = "/moodle-sessionboard"
        element = { < MoodleSessionboard / > }
        /> { /* rota com typo redirecionando para a correta */ } <
        Route path = "/analytics-resorces"
        element = { < Navigate to = "/analytics-resources"
            replace / > }
        /> <
        Route path = "*"
        element = { < div > 404– página não encontrada < /div>} / >
            <
            /Routes> <
            /div> <
            /Router>
        );
    }

    export default App;