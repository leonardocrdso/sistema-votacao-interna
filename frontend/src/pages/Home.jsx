import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import { FaVoteYea, FaUsers, FaBuilding, FaShieldAlt, FaChartBar } from 'react-icons/fa'

function Home() {
  return (
    <Container>
      {/* Hero Section */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto text-center">
          <div className="bg-primary text-white rounded-lg p-5 mb-4">
            <FaVoteYea size={64} className="mb-3" />
            <h1 className="display-4 fw-bold mb-3">
              Sistema de Votação Interna
            </h1>
            <p className="lead mb-4">
              Plataforma segura e transparente para votação entre colaboradores. 
              Cada pessoa pode votar apenas uma vez em candidatos da sua própria filial.
            </p>
            <Button 
              as={Link} 
              to="/identificacao" 
              variant="light" 
              size="lg" 
              className="fw-bold"
            >
              <FaVoteYea className="me-2" />
              Começar a Votar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Instruções */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <Alert variant="info" className="border-0 shadow-sm">
            <Alert.Heading className="h5">
              📋 Como Funciona
            </Alert.Heading>
            <ol className="mb-0">
              <li><strong>Identificação:</strong> Selecione sua filial e informe seu cadastro e CPF</li>
              <li><strong>Verificação:</strong> O sistema verifica se você já votou anteriormente</li>
              <li><strong>Votação:</strong> Escolha entre os candidatos da sua filial</li>
              <li><strong>Confirmação:</strong> Receba confirmação do seu voto</li>
            </ol>
          </Alert>
        </Col>
      </Row>

      {/* Recursos */}
      <Row className="mb-5">
        <Col lg={10} className="mx-auto">
          <h2 className="text-center mb-4">Recursos do Sistema</h2>
          <Row>
            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body>
                  <FaShieldAlt className="text-success mb-3" size={48} />
                  <Card.Title className="h5">Seguro</Card.Title>
                  <Card.Text className="text-muted">
                    Validação por filial, cadastro e CPF. Impossível votar duas vezes.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body>
                  <FaBuilding className="text-primary mb-3" size={48} />
                  <Card.Title className="h5">Por Filial</Card.Title>
                  <Card.Text className="text-muted">
                    Cada filial tem seus próprios candidatos. Vote apenas na sua.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body>
                  <FaUsers className="text-warning mb-3" size={48} />
                  <Card.Title className="h5">Transparente</Card.Title>
                  <Card.Text className="text-muted">
                    Interface clara e feedback imediato sobre o status do seu voto.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>

            <Col md={6} lg={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm text-center">
                <Card.Body>
                  <FaChartBar className="text-info mb-3" size={48} />
                  <Card.Title className="h5">Resultados</Card.Title>
                  <Card.Text className="text-muted">
                    Painel administrativo com gráficos e estatísticas em tempo real.
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Filiais Participantes */}
      <Row className="mb-5">
        <Col lg={8} className="mx-auto">
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-light">
              <h3 className="h5 mb-0">
                <FaBuilding className="me-2" />
                Filiais Participantes
              </h3>
            </Card.Header>
            <Card.Body>
              <Row>
                <Col md={6}>
                  <ul className="list-unstyled mb-md-0">
                    <li className="mb-2">
                      <span className="badge bg-primary me-2">1</span>
                      LIVE! INDUSTRIAL
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-primary me-2">2</span>
                      LIVE! ROUPAS
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-primary me-2">3</span>
                      LIVE! TEXTIL
                    </li>
                  </ul>
                </Col>
                <Col md={6}>
                  <ul className="list-unstyled">
                    <li className="mb-2">
                      <span className="badge bg-primary me-2">4</span>
                      FILIAL CISSA
                    </li>
                    <li className="mb-2">
                      <span className="badge bg-primary me-2">5</span>
                      FILIAL CORUPÁ
                    </li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* CTA */}
      <Row>
        <Col lg={6} className="mx-auto text-center">
          <Card className="border-0 bg-light">
            <Card.Body className="py-4">
              <h3 className="mb-3">Pronto para Votar?</h3>
              <p className="text-muted mb-4">
                Sua participação é importante! Faça sua escolha de forma consciente.
              </p>
              <Button 
                as={Link} 
                to="/identificacao" 
                variant="primary" 
                size="lg"
                className="px-4"
              >
                <FaVoteYea className="me-2" />
                Iniciar Votação
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default Home