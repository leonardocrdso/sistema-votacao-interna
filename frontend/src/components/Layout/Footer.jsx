import { Container, Row, Col } from 'react-bootstrap'

function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-dark text-light py-4 mt-auto">
      <Container fluid="lg">
        <Row>
          <Col md={6}>
            <h6 className="mb-2">Sistema de Votação Interna</h6>
            <p className="text-muted small mb-0">
              Plataforma segura e transparente para votação entre colaboradores.
            </p>
          </Col>
          
          <Col md={6} className="text-md-end">
            <p className="text-muted small mb-2">
              Desenvolvido com React + Node.js
            </p>
            <p className="text-muted small mb-0">
              © {currentYear} - Todos os direitos reservados
            </p>
          </Col>
        </Row>
        
        <hr className="my-3 border-secondary" />
        
        <Row>
          <Col className="text-center">
            <small className="text-muted">
              Sistema interno - Uso restrito a colaboradores autorizados
            </small>
          </Col>
        </Row>
      </Container>
    </footer>
  )
}

export default Footer