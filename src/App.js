import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import MoodleDashboard from './components/MoodleDashboard';
import TotalMatriculasPorAno from './components/TotalMatriculasPorAno';
import MapaCeara from './components/MapaCeara';
import MapaEstadosBrasil from './components/MapaEstadosBrasil';
import Analytics_Behavour from './components/Analytics_Behavour';

function App() {
    return ( < Router >
        <
        div className = "App" >
        <
        Routes >
        <
        Route path = "/"
        element = { < MoodleDashboard / > }
        />  <
        Route path = "/matriculas-por-ano"
        element = { < TotalMatriculasPorAno / > }
        />  <
        Route path = "/mapa-ceara"
        element = { < MapaCeara / > }
        />  <
        Route path = "/mapa-estados-brasil"
        element = { < MapaEstadosBrasil / > }
        />  <
        Route path = "/analytics-behavour"
        element = { < Analytics_Behavour / > }
        />  <
        /Routes>  <
        /div>  <
        /Router>
    );
}

export default App;