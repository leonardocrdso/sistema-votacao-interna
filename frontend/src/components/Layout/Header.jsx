import { Navbar, Nav, Container } from 'react-bootstrap'
import { Link, useLocation } from 'react-router-dom'
import { FaVoteYea, FaCog } from 'react-icons/fa'

function Header() {
  const location = useLocation()

  return (
    <Navbar bg="primary" variant="dark" expand="lg" className="shadow-sm">
      <Container fluid="lg">
        <Navbar.Brand as={Link} to="/" className="fw-bold">
          <FaVoteYea className="me-2" />
          Sistema de Votação
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={Link} 
              to="/" 
              active={location.pathname === '/'}
            >
              Início
            </Nav.Link>
            
            <Nav.Link 
              as={Link} 
              to="/identificacao" 
              active={location.pathname === '/identificacao'}
            >
              Votar
            </Nav.Link>
          </Nav>
          
          <Nav>
            <Nav.Link 
              as={Link} 
              to="/admin" 
              active={location.pathname === '/admin'}
              className="text-warning"
            >
              <FaCog className="me-1" />
              Admin
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  )
}

export default Header