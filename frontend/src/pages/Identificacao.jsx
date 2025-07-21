import { useState, useEffect } from 'react'
import { Container, Row, Col, Card, Form, Button, Alert, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-hot-toast'
import { FaUser, FaBuilding, FaIdCard, FaArrowRight } from 'react-icons/fa'

import { useVoting } from '../context/VotingContext'
import { filiaisAPI, votosAPI, candidatosAPI, utils } from '../services/api'

function Identificacao() {
  const navigate = useNavigate()
  const { 
    filial, 
    cadastro, 
    cpf, 
    setIdentificacao, 
    setCandidatos,
    setLoading, 
    setError, 
    loading 
  } = useVoting()

  const [filiais, setFiliais] = useState([])
  const [formData, setFormData] = useState({
    filialId: filial?.id || '',
    cadastro: cadastro || '',
    cpf: cpf || ''
  })
  const [errors, setErrors] = useState({})

  // Carregar filiais ao montar o componente
  useEffect(() => {
    const carregarFiliais = async () => {
      try {
        const filiaisData = await filiaisAPI.listar()
        setFiliais(filiaisData)
      } catch (error) {
        console.error('Erro ao carregar filiais:', error)
        toast.error('Erro ao carregar filiais. Tente novamente.')
      }
    }

    carregarFiliais()
  }, [])

  // Atualizar form data quando o contexto mudar
  useEffect(() => {
    setFormData({
      filialId: filial?.id || '',
      cadastro: cadastro || '',
      cpf: cpf || ''
    })
  }, [filial, cadastro, cpf])

  // Validar formulário
  const validarFormulario = () => {
    const newErrors = {}

    if (!formData.filialId) {
      newErrors.filialId = 'Selecione uma filial'
    }

    if (!formData.cadastro.trim()) {
      newErrors.cadastro = 'Informe seu cadastro'
    } else if (formData.cadastro.trim().length < 1 || formData.cadastro.trim().length > 50) {
      newErrors.cadastro = 'Cadastro deve ter entre 1 e 50 caracteres'
    }

    if (!formData.cpf.trim()) {
      newErrors.cpf = 'Informe seu CPF'
    } else {
      const cpfLimpo = utils.limparCPF(formData.cpf)
      if (!utils.validarCPF(cpfLimpo)) {
        newErrors.cpf = 'CPF deve ter 11 dígitos'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Limpar erro do campo quando começar a digitar
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle CPF change com formatação
  const handleCpfChange = (e) => {
    let value = e.target.value
    
    // Remover tudo que não é dígito
    value = value.replace(/\D/g, '')
    
    // Limitar a 11 dígitos
    if (value.length > 11) {
      value = value.slice(0, 11)
    }
    
    setFormData(prev => ({
      ...prev,
      cpf: value
    }))

    // Limpar erro do CPF
    if (errors.cpf) {
      setErrors(prev => ({
        ...prev,
        cpf: ''
      }))
    }
  }

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validarFormulario()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const filialSelecionada = filiais.find(f => f.id === parseInt(formData.filialId))
      const cpfLimpo = utils.limparCPF(formData.cpf)

      // Verificar elegibilidade
      const elegibilidade = await votosAPI.verificarElegibilidade({
        filialId: parseInt(formData.filialId),
        cadastro: formData.cadastro.trim(),
        cpf: cpfLimpo
      })

      if (!elegibilidade.elegivel) {
        toast.error('Você já votou anteriormente nesta eleição!')
        setLoading(false)
        return
      }

      // Buscar candidatos da filial
      const candidatosData = await candidatosAPI.listarPorFilial(formData.filialId)

      if (candidatosData.length === 0) {
        toast.error('Não há candidatos cadastrados para esta filial.')
        setLoading(false)
        return
      }

      // Salvar dados no contexto
      setIdentificacao({
        filial: filialSelecionada,
        cadastro: formData.cadastro.trim(),
        cpf: cpfLimpo
      })

      setCandidatos(candidatosData)

      toast.success('Identificação verificada com sucesso!')

      // Redirecionar para votação
      navigate('/votacao')

    } catch (error) {
      console.error('Erro na verificação:', error)
      
      const mensagem = error.response?.data?.erro || 
                     error.response?.data?.message || 
                     'Erro ao verificar identificação. Tente novamente.'
      
      toast.error(mensagem)
      setError(mensagem)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container>
      <Row className="justify-content-center">
        <Col lg={8} xl={6}>
          {/* Header */}
          <div className="text-center mb-4">
            <h1 className="display-6 fw-bold text-primary mb-3">
              <FaUser className="me-3" />
              Identificação
            </h1>
            <p className="lead text-muted">
              Informe seus dados para verificar se você pode votar
            </p>
          </div>

          {/* Formulário */}
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-primary text-white">
              <h4 className="mb-0">
                <FaIdCard className="me-2" />
                Dados de Identificação
              </h4>
            </Card.Header>

            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {/* Filial */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaBuilding className="me-2 text-primary" />
                    Filial *
                  </Form.Label>
                  <Form.Select
                    name="filialId"
                    value={formData.filialId}
                    onChange={handleInputChange}
                    isInvalid={!!errors.filialId}
                    disabled={loading}
                  >
                    <option value="">Selecione sua filial</option>
                    {filiais.map(filial => (
                      <option key={filial.id} value={filial.id}>
                        {filial.nome}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    {errors.filialId}
                  </Form.Control.Feedback>
                </Form.Group>

                {/* Cadastro */}
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaUser className="me-2 text-primary" />
                    Número do Cadastro *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="cadastro"
                    value={formData.cadastro}
                    onChange={handleInputChange}
                    placeholder="Digite seu número de cadastro"
                    isInvalid={!!errors.cadastro}
                    disabled={loading}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cadastro}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    Número do seu cadastro na empresa
                  </Form.Text>
                </Form.Group>

                {/* CPF */}
                <Form.Group className="mb-4">
                  <Form.Label className="fw-semibold">
                    <FaIdCard className="me-2 text-primary" />
                    CPF *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="cpf"
                    value={formData.cpf}
                    onChange={handleCpfChange}
                    placeholder="Digite seu CPF (apenas números)"
                    isInvalid={!!errors.cpf}
                    disabled={loading}
                    maxLength={11}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.cpf}
                  </Form.Control.Feedback>
                  <Form.Text className="text-muted">
                    {formData.cpf && utils.validarCPF(formData.cpf) 
                      ? `CPF: ${utils.formatarCPF(formData.cpf)}`
                      : 'Digite apenas os números do CPF (11 dígitos)'
                    }
                  </Form.Text>
                </Form.Group>

                {/* Alert de informação */}
                <Alert variant="info" className="mb-4">
                  <strong>ℹ️ Importante:</strong> Estes dados serão usados para verificar 
                  se você já votou anteriormente. Cada pessoa pode votar apenas uma vez.
                </Alert>

                {/* Botão de envio */}
                <div className="d-grid">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={loading}
                    className="fw-semibold"
                  >
                    {loading ? (
                      <>
                        <Spinner animation="border" size="sm" className="me-2" />
                        Verificando...
                      </>
                    ) : (
                      <>
                        <FaArrowRight className="me-2" />
                        Continuar para Votação
                      </>
                    )}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* Informações adicionais */}
          <div className="mt-4 text-center">
            <small className="text-muted">
              Seus dados são usados apenas para validação e não são armazenados permanentemente.
            </small>
          </div>
        </Col>
      </Row>
    </Container>
  )
}

export default Identificacao