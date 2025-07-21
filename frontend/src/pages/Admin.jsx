import { useState, useEffect } from 'react'
import { Container, Row, Col, Nav, Tab, Alert } from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { FaCogs, FaUsers, FaChartBar } from 'react-icons/fa'

// Componentes das abas
import CadastroParticipantes from '../components/Admin/CadastroParticipantes'
import ResultadosVotacao from '../components/Admin/ResultadosVotacao'

// Services
import { filiaisAPI } from '../services/api'

function Admin() {
  const [activeTab, setActiveTab] = useState('candidatos')
  const [filiais, setFiliais] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Carregar filiais ao montar componente
  useEffect(() => {
    const carregarFiliais = async () => {
      try {
        setLoading(true)
        const filiaisData = await filiaisAPI.listar()
        setFiliais(filiaisData)
        setError(null)
      } catch (error) {
        console.error('Erro ao carregar filiais:', error)
        const mensagem = 'Erro ao carregar filiais. Verifique sua conexão.'
        setError(mensagem)
        toast.error(mensagem)
      } finally {
        setLoading(false)
      }
    }

    carregarFiliais()
  }, [])

  return (
    <Container fluid>
      {/* Header do Admin */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap">
          <div>
            <h1 className="display-6 fw-bold text-primary mb-2">
              <FaCogs className="me-3" />
              Painel Administrativo
            </h1>
            <p className="text-muted mb-0">
              Gerencie candidatos e visualize resultados da votação
            </p>
          </div>
          
          <div className="mt-3 mt-md-0">
            <Alert variant="warning" className="mb-0 py-2 px-3">
              <small>
                🔒 <strong>Acesso Restrito</strong> - Área administrativa
              </small>
            </Alert>
          </div>
        </div>
      </div>

      {/* Verificar se há erro no carregamento */}
      {error && (
        <Alert variant="danger" className="mb-4">
          <Alert.Heading className="h5">Erro de Conexão</Alert.Heading>
          <p className="mb-0">{error}</p>
        </Alert>
      )}

      {/* Abas do Admin */}
      <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
        {/* Navegação das abas */}
        <Row>
          <Col>
            <Nav variant="pills" className="nav-fill mb-4">
              <Nav.Item>
                <Nav.Link 
                  eventKey="candidatos"
                  className="fw-semibold"
                >
                  <FaUsers className="me-2" />
                  Cadastro de Participantes
                </Nav.Link>
              </Nav.Item>
              
              <Nav.Item>
                <Nav.Link 
                  eventKey="resultados"
                  className="fw-semibold"
                >
                  <FaChartBar className="me-2" />
                  Resultados da Votação
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
        </Row>

        {/* Conteúdo das abas */}
        <Tab.Content>
          {/* Aba de Cadastro de Participantes */}
          <Tab.Pane eventKey="candidatos">
            <CadastroParticipantes 
              filiais={filiais} 
              loading={loading}
            />
          </Tab.Pane>

          {/* Aba de Resultados */}
          <Tab.Pane eventKey="resultados">
            <ResultadosVotacao 
              filiais={filiais} 
              loading={loading}
            />
          </Tab.Pane>
        </Tab.Content>
      </Tab.Container>

      {/* Footer do admin */}
      <div className="mt-5 pt-4 border-top">
        <Row>
          <Col className="text-center">
            <small className="text-muted">
              Sistema de Votação Interna - Painel Administrativo
              <br />
              Acesso restrito a administradores autorizados
            </small>
          </Col>
        </Row>
      </div>
    </Container>
  )
}

export default Admin