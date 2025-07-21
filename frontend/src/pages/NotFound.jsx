import { Container, Row, Col, Card, Button } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaHome, FaExclamationTriangle, FaArrowLeft } from 'react-icons/fa'

function NotFound() {
  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          <div className="text-center py-5">
            {/* Ícone de erro */}
            <div className="mb-4">
              <FaExclamationTriangle 
                size={120} 
                className="text-warning mb-4"
                style={{ filter: 'drop-shadow(0 4px 8px rgba(255, 193, 7, 0.3))' }}
              />
            </div>

            {/* Título principal */}
            <h1 className="display-1 fw-bold text-primary mb-3">
              404
            </h1>
            
            <h2 className="h1 fw-bold text-dark mb-3">
              Página Não Encontrada
            </h2>

            <p className="lead text-muted mb-4">
              Oops! A página que você está procurando não existe ou foi movida.
            </p>

            {/* Card com informações */}
            <Card className="border-0 bg-light mb-4">
              <Card.Body className="py-4">
                <h5 className="mb-3">O que você pode fazer:</h5>
                
                <div className="d-flex flex-column gap-2 text-start">
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-3">1</span>
                    <span>Verificar se o endereço foi digitado corretamente</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-3">2</span>
                    <span>Voltar para a página inicial</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-3">3</span>
                    <span>Usar o menu de navegação</span>
                  </div>
                  
                  <div className="d-flex align-items-center">
                    <span className="badge bg-primary me-3">4</span>
                    <span>Entrar em contato com o suporte</span>
                  </div>
                </div>
              </Card.Body>
            </Card>

            {/* Botões de ação */}
            <div className="d-grid gap-2 d-md-block">
              <Button 
                as={Link} 
                to="/" 
                variant="primary" 
                size="lg"
                className="me-md-3 mb-2 mb-md-0"
              >
                <FaHome className="me-2" />
                Ir para o Início
              </Button>
              
              <Button 
                variant="outline-secondary" 
                size="lg"
                onClick={() => window.history.back()}
              >
                <FaArrowLeft className="me-2" />
                Voltar
              </Button>
            </div>

            {/* Links úteis */}
            <div className="mt-5 pt-4 border-top">
              <h6 className="text-muted mb-3">Links Úteis:</h6>
              
              <div className="d-flex justify-content-center flex-wrap gap-3">
                <Link 
                  to="/" 
                  className="text-decoration-none"
                >
                  🏠 Página Inicial
                </Link>
                
                <Link 
                  to="/identificacao" 
                  className="text-decoration-none"
                >
                  🗳️ Votação
                </Link>
                
                <Link 
                  to="/admin" 
                  className="text-decoration-none"
                >
                  ⚙️ Admin
                </Link>
              </div>
            </div>

            {/* Mensagem de suporte */}
            <div className="mt-4">
              <small className="text-muted">
                Se o problema persistir, entre em contato com o administrador do sistema.
              </small>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default NotFound