import { useEffect } from 'react'
import { Container, Row, Col, Card, Button, Alert } from 'react-bootstrap'
import { Link, useNavigate } from 'react-router-dom'
import { FaCheckCircle, FaVoteYea, FaHome, FaUser, FaBuilding } from 'react-icons/fa'

import { useVoting } from '../context/VotingContext'
import { utils } from '../services/api'

function Resultado() {
  const navigate = useNavigate()
  const { 
    filial, 
    cadastro, 
    cpf, 
    votoRealizado, 
    candidatoEscolhido, 
    resetState 
  } = useVoting()

  // Verificar se chegou aqui com dados válidos
  useEffect(() => {
    if (!votoRealizado || !candidatoEscolhido || !filial) {
      navigate('/')
      return
    }
  }, [votoRealizado, candidatoEscolhido, filial, navigate])

  // Se não tiver dados, não renderizar nada (será redirecionado)
  if (!votoRealizado || !candidatoEscolhido || !filial) {
    return null
  }

  // Handle novo voto (limpar estado e ir para início)
  const handleNovoVoto = () => {
    resetState()
    navigate('/')
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {/* Mensagem de sucesso */}
          <div className="text-center mb-4">
            <div className="mb-4">
              <FaCheckCircle 
                size={80} 
                className="text-success mb-3" 
                style={{ filter: 'drop-shadow(0 4px 8px rgba(40, 167, 69, 0.3))' }}
              />
            </div>
            
            <h1 className="display-5 fw-bold text-success mb-3">
              Voto Registrado!
            </h1>
            
            <p className="lead text-muted">
              Seu voto foi registrado com sucesso no sistema.
            </p>
          </div>

          {/* Card com informações do voto */}
          <Card className="shadow-lg border-0 mb-4">
            <Card.Header className="bg-success text-white text-center">
              <h4 className="mb-0">
                <FaVoteYea className="me-2" />
                Confirmação do Voto
              </h4>
            </Card.Header>

            <Card.Body className="p-4">
              {/* Informações do votante */}
              <Alert variant="light" className="border">
                <h6 className="mb-3">
                  <FaUser className="me-2 text-primary" />
                  Dados do Votante
                </h6>
                <Row>
                  <Col sm={6}>
                    <p className="mb-2">
                      <FaBuilding className="me-2 text-muted" />
                      <strong>Filial:</strong><br />
                      {filial.nome}
                    </p>
                  </Col>
                  <Col sm={6}>
                    <p className="mb-2">
                      <FaUser className="me-2 text-muted" />
                      <strong>Cadastro:</strong><br />
                      {cadastro}
                    </p>
                  </Col>
                </Row>
                <p className="mb-0">
                  <strong>CPF:</strong> {utils.formatarCPF(cpf)}
                </p>
              </Alert>

              {/* Informações do candidato */}
              <div className="text-center">
                <h5 className="mb-3">Você votou em:</h5>
                
                <div className="mb-3">
                  <img
                    src={utils.construirUrlImagem(candidatoEscolhido.fotoUrl)}
                    alt={`Foto de ${candidatoEscolhido.nome}`}
                    className="rounded-circle"
                    style={{ 
                      width: '120px', 
                      height: '120px', 
                      objectFit: 'cover',
                      border: '4px solid #28a745'
                    }}
                    onError={(e) => {
                      e.target.src = utils.construirUrlImagem('/uploads/placeholder.jpg')
                    }}
                  />
                </div>

                <h3 className="text-primary mb-2">
                  {candidatoEscolhido.nome}
                </h3>
                
                <p className="text-muted lead mb-0">
                  {candidatoEscolhido.setor}
                </p>
              </div>
            </Card.Body>
          </Card>

          {/* Informações importantes */}
          <Alert variant="info" className="mb-4">
            <h6 className="mb-2">
              📋 Informações Importantes
            </h6>
            <ul className="mb-0">
              <li>Seu voto foi registrado com segurança no sistema</li>
              <li>Não é possível alterar ou cancelar o voto após a confirmação</li>
              <li>O resultado será divulgado conforme cronograma da empresa</li>
              <li>Em caso de dúvidas, entre em contato com o RH</li>
            </ul>
          </Alert>

          {/* Ações */}
          <div className="text-center">
            <div className="d-grid gap-2 d-md-block">
              <Button 
                as={Link} 
                to="/" 
                variant="primary" 
                size="lg"
                className="me-md-3 mb-2 mb-md-0"
                onClick={handleNovoVoto}
              >
                <FaHome className="me-2" />
                Voltar ao Início
              </Button>
              
              <Button 
                variant="outline-secondary" 
                size="lg"
                onClick={() => window.print()}
              >
                🖨️ Imprimir Comprovante
              </Button>
            </div>
          </div>

          {/* Timestamp */}
          <div className="text-center mt-4">
            <small className="text-muted">
              Voto registrado em: {new Date().toLocaleString('pt-BR')}
            </small>
          </div>
        </Col>
      </Row>

      {/* Estilo para impressão */}
      <style jsx>{`
        @media print {
          .btn, .alert-info {
            display: none !important;
          }
          
          .card {
            border: 2px solid #000 !important;
            box-shadow: none !important;
          }
          
          .card-header {
            background: #000 !important;
            color: #fff !important;
          }
          
          body {
            font-size: 12pt;
          }
          
          h1, h2, h3, h4, h5, h6 {
            color: #000 !important;
          }
        }
      `}</style>
    </Container>
  )
}

export default Resultado