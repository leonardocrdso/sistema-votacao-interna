import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Button, Modal, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaVoteYea, FaUser, FaBuilding, FaCheck, FaTimes } from 'react-icons/fa'

import { useVoting } from '../context/VotingContext'
import { votosAPI, utils } from '../services/api'

function Votacao() {
  const navigate = useNavigate()
  const { 
    filial, 
    cadastro, 
    cpf, 
    candidatos, 
    setVotoRealizado, 
    setLoading, 
    setError, 
    loading 
  } = useVoting()

  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [votando, setVotando] = useState(false)

  // Verificar se os dados necessários estão disponíveis
  useEffect(() => {
    if (!filial || !cadastro || !cpf || !candidatos.length) {
      toast.error('Dados de identificação não encontrados. Redirecionando...')
      navigate('/identificacao')
      return
    }
  }, [filial, cadastro, cpf, candidatos, navigate])

  // Se não tiver dados, mostrar loading
  if (!filial || !candidatos.length) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Carregando...</p>
      </Container>
    )
  }

  // Handle seleção de candidato
  const handleSelecionarCandidato = (candidato) => {
    setCandidatoSelecionado(candidato)
    setShowModal(true)
  }

  // Handle confirmação do voto
  const handleConfirmarVoto = async () => {
    if (!candidatoSelecionado) return

    setVotando(true)
    setError(null)

    try {
      const dadosVoto = {
        filialId: filial.id,
        cadastro: cadastro,
        cpf: cpf,
        candidatoId: candidatoSelecionado.id
      }

      const resultado = await votosAPI.votar(dadosVoto)

      if (resultado.sucesso) {
        setVotoRealizado(candidatoSelecionado)
        toast.success(resultado.mensagem || 'Voto registrado com sucesso!')
        navigate('/resultado')
      } else {
        toast.error(resultado.mensagem || 'Erro ao registrar voto')
      }

    } catch (error) {
      console.error('Erro ao votar:', error)
      
      const mensagem = error.response?.data?.erro || 
                     error.response?.data?.message || 
                     'Erro ao registrar voto. Tente novamente.'
      
      toast.error(mensagem)
      setError(mensagem)
      
      // Se já votou, redirecionar
      if (error.response?.status === 409) {
        setTimeout(() => navigate('/'), 2000)
      }
    } finally {
      setVotando(false)
      setShowModal(false)
    }
  }

  // Handle cancelar
  const handleCancelarVoto = () => {
    setCandidatoSelecionado(null)
    setShowModal(false)
  }

  return (
    <Container>
      {/* Header da votação */}
      <div className="text-center mb-4">
        <h1 className="display-6 fw-bold text-primary mb-3">
          <FaVoteYea className="me-3" />
          Votação
        </h1>
        <Alert variant="info" className="mx-auto" style={{ maxWidth: '600px' }}>
          <div className="d-flex align-items-center justify-content-center flex-wrap">
            <span className="me-3">
              <FaBuilding className="me-1" />
              <strong>{filial.nome}</strong>
            </span>
            <span className="me-3">
              <FaUser className="me-1" />
              Cadastro: <strong>{cadastro}</strong>
            </span>
            <span>
              CPF: <strong>{utils.formatarCPF(cpf)}</strong>
            </span>
          </div>
        </Alert>
      </div>

      {/* Instruções */}
      <Row className="mb-4">
        <Col lg={8} className="mx-auto">
          <Alert variant="warning" className="text-center">
            <strong>⚠️ Atenção:</strong> Clique na foto do candidato de sua escolha. 
            Você poderá votar apenas uma vez!
          </Alert>
        </Col>
      </Row>

      {/* Lista de candidatos */}
      <Row className="mb-4">
        <Col lg={10} className="mx-auto">
          <h3 className="text-center mb-4">
            Candidatos da {filial.nome}
            <span className="badge bg-primary ms-2">{candidatos.length}</span>
          </h3>
          
          {candidatos.length === 0 ? (
            <Alert variant="warning" className="text-center">
              <h5>Nenhum candidato encontrado</h5>
              <p className="mb-0">
                Não há candidatos cadastrados para sua filial no momento.
              </p>
            </Alert>
          ) : (
            <Row>
              {candidatos.map(candidato => (
                <Col key={candidato.id} md={6} lg={4} xl={3} className="mb-4">
                  <Card 
                    className="h-100 shadow-sm candidate-card"
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                    onClick={() => handleSelecionarCandidato(candidato)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)'
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)'
                      e.currentTarget.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)'
                    }}
                  >
                    <div className="position-relative">
                      <Card.Img
                        variant="top"
                        src={utils.construirUrlImagem(candidato.fotoUrl)}
                        alt={`Foto de ${candidato.nome}`}
                        style={{ 
                          height: '200px', 
                          objectFit: 'cover',
                          cursor: 'pointer'
                        }}
                        onError={(e) => {
                          e.target.src = utils.construirUrlImagem('/uploads/placeholder.jpg')
                        }}
                      />
                      <div 
                        className="position-absolute top-0 end-0 m-2 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                        style={{ width: '40px', height: '40px' }}
                      >
                        <FaVoteYea />
                      </div>
                    </div>
                    
                    <Card.Body className="text-center">
                      <Card.Title className="h5 mb-2">
                        {candidato.nome}
                      </Card.Title>
                      <Card.Text className="text-muted mb-0">
                        <strong>{candidato.setor}</strong>
                      </Card.Text>
                    </Card.Body>
                    
                    <Card.Footer className="bg-light border-0 text-center">
                      <small className="text-muted">
                        Clique para votar
                      </small>
                    </Card.Footer>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Col>
      </Row>

      {/* Modal de confirmação */}
      <Modal 
        show={showModal} 
        onHide={handleCancelarVoto}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="bg-primary text-white">
          <Modal.Title>
            <FaVoteYea className="me-2" />
            Confirmar Voto
          </Modal.Title>
        </Modal.Header>
        
        <Modal.Body className="text-center py-4">
          {candidatoSelecionado && (
            <>
              <img
                src={utils.construirUrlImagem(candidatoSelecionado.fotoUrl)}
                alt={`Foto de ${candidatoSelecionado.nome}`}
                className="rounded-circle mb-3"
                style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.src = utils.construirUrlImagem('/uploads/placeholder.jpg')
                }}
              />
              
              <h4 className="mb-2">{candidatoSelecionado.nome}</h4>
              <p className="text-muted mb-3">
                <strong>{candidatoSelecionado.setor}</strong>
              </p>
              
              <Alert variant="warning">
                <strong>⚠️ Atenção:</strong> Esta ação não pode ser desfeita. 
                Você tem certeza que deseja votar neste candidato?
              </Alert>
            </>
          )}
        </Modal.Body>
        
        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleCancelarVoto}
            disabled={votando}
          >
            <FaTimes className="me-2" />
            Cancelar
          </Button>
          
          <Button 
            variant="success" 
            onClick={handleConfirmarVoto}
            disabled={votando}
          >
            {votando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Votando...
              </>
            ) : (
              <>
                <FaCheck className="me-2" />
                Confirmar Voto
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Botão para voltar */}
      <Row>
        <Col className="text-center">
          <Button 
            variant="outline-secondary" 
            onClick={() => navigate('/identificacao')}
            disabled={loading || votando}
          >
            ← Voltar para Identificação
          </Button>
        </Col>
      </Row>
    </Container>
  )
}

export default Votacao