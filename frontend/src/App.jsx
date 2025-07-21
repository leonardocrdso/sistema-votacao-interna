import { Routes, Route } from 'react-router-dom'
import { Container } from 'react-bootstrap'

// Componentes
import Header from './components/Layout/Header'
import Footer from './components/Layout/Footer'

// Páginas
import Home from './pages/Home'
import Identificacao from './pages/Identificacao'
import Votacao from './pages/Votacao'
import Resultado from './pages/Resultado'
import Admin from './pages/Admin'
import NotFound from './pages/NotFound'

// Contexto
import { VotingProvider } from './context/VotingContext'

function App() {
  return (
    <VotingProvider>
      <div className="d-flex flex-column min-vh-100">
        <Header />
        
        <main className="flex-grow-1 py-4">
          <Container fluid="lg">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/identificacao" element={<Identificacao />} />
              <Route path="/votacao" element={<Votacao />} />
              <Route path="/resultado" element={<Resultado />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Container>
        </main>

        <Footer />
      </div>
    </VotingProvider>
  )
}

export default App