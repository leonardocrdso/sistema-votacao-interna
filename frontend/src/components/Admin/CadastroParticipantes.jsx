import { useState, useEffect } from 'react'
import { 
  Row, Col, Card, Form, Button, Table, Modal, Alert, 
  Spinner, Badge, Image 
} from 'react-bootstrap'
import { toast } from 'react-hot-toast'
import { 
  FaPlus, FaEdit, FaTrash, FaUser, FaBuilding, 
  FaBriefcase, FaImage, FaEye, FaSave, FaTimes, FaUsers 
} from 'react-icons/fa'

import { adminAPI, utils } from '../../services/api'

function CadastroParticipantes({ filiais, loading: loadingFiliais }) {
  const [candidatos, setCandidatos] = useState([])
  const [loading, setLoading] = useState(false)
  const [filtroFilial, setFiltroFilial] = useState('')
  
  // Modal de cadastro/edição
  const [showModal, setShowModal] = useState(false)
  const [editando, setEditando] = useState(false)
  const [candidatoSelecionado, setCandidatoSelecionado] = useState(null)
  
  // Formulário
  const [formData, setFormData] = useState({
    filialId: '',
    nome: '',
    setor: '',
    foto: null
  })
  const [errors, setErrors] = useState({})
  const [salvando, setSalvando] = useState(false)

  // Carregar candidatos
  const carregarCandidatos = async (filialId = null) => {
    try {
      setLoading(true)
      const data = await adminAPI.candidatos.listar(filialId)
      setCandidatos(data)
    } catch (error) {
      console.error('Erro ao carregar candidatos:', error)
      toast.error('Erro ao carregar candidatos')
    } finally {
      setLoading(false)
    }
  }

  // Carregar candidatos inicialmente
  useEffect(() => {
    if (!loadingFiliais) {
      carregarCandidatos()
    }
  }, [loadingFiliais])

  // Carregar candidatos quando filtro mudar
  useEffect(() => {
    if (!loadingFiliais) {
      const filialId = filtroFilial || null
      carregarCandidatos(filialId)
    }
  }, [filtroFilial, loadingFiliais])

  // Abrir modal para novo candidato
  const handleNovoCandidato = () => {
    setEditando(false)
    setCandidatoSelecionado(null)
    setFormData({
      filialId: filtroFilial || '',
      nome: '',
      setor: '',
      foto: null
    })
    setErrors({})
    setShowModal(true)
  }

  // Abrir modal para editar candidato
  const handleEditarCandidato = (candidato) => {
    setEditando(true)
    setCandidatoSelecionado(candidato)
    setFormData({
      filialId: candidato.filial.id.toString(),
      nome: candidato.nome,
      setor: candidato.setor,
      foto: null
    })
    setErrors({})
    setShowModal(true)
  }

  // Fechar modal
  const handleFecharModal = () => {
    setShowModal(false)
    setEditando(false)
    setCandidatoSelecionado(null)
    setFormData({
      filialId: '',
      nome: '',
      setor: '',
      foto: null
    })
    setErrors({})
  }

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Limpar erro
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  // Handle file change
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    setFormData(prev => ({
      ...prev,
      foto: file
    }))
    
    // Limpar erro
    if (errors.foto) {
      setErrors(prev => ({
        ...prev,
        foto: ''
      }))
    }
  }

  // Validar formulário
  const validarFormulario = () => {
    const newErrors = {}

    if (!formData.filialId) {
      newErrors.filialId = 'Selecione uma filial'
    }

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório'
    } else if (formData.nome.trim().length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres'
    }

    if (!formData.setor.trim()) {
      newErrors.setor = 'Setor é obrigatório'
    }

    // Validar foto apenas para novo candidato
    if (!editando && !formData.foto) {
      newErrors.foto = 'Foto é obrigatória'
    }

    // Validar tipo de arquivo
    if (formData.foto) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(formData.foto.type)) {
        newErrors.foto = 'Arquivo deve ser uma imagem (JPG, PNG, GIF, WebP)'
      }
      
      // Validar tamanho (5MB)
      if (formData.foto.size > 5 * 1024 * 1024) {
        newErrors.foto = 'Arquivo muito grande. Máximo 5MB'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Salvar candidato
  const handleSalvar = async () => {
    if (!validarFormulario()) {
      return
    }

    setSalvando(true)

    try {
      const dados = {
        filialId: parseInt(formData.filialId),
        nome: formData.nome.trim(),
        setor: formData.setor.trim(),
        foto: formData.foto
      }

      if (editando) {
        await adminAPI.candidatos.atualizar(candidatoSelecionado.id, dados)
        toast.success('Candidato atualizado com sucesso!')
      } else {
        await adminAPI.candidatos.criar(dados)
        toast.success('Candidato cadastrado com sucesso!')
      }

      handleFecharModal()
      carregarCandidatos(filtroFilial || null)
      
    } catch (error) {
      console.error('Erro ao salvar candidato:', error)
      const mensagem = error.response?.data?.erro || 'Erro ao salvar candidato'
      toast.error(mensagem)
    } finally {
      setSalvando(false)
    }
  }

  // Remover candidato
  const handleRemover = async (candidato) => {
    if (!window.confirm(`Tem certeza que deseja remover ${candidato.nome}?`)) {
      return
    }

    try {
      await adminAPI.candidatos.remover(candidato.id)
      toast.success('Candidato removido com sucesso!')
      carregarCandidatos(filtroFilial || null)
    } catch (error) {
      console.error('Erro ao remover candidato:', error)
      const mensagem = error.response?.data?.erro || 'Erro ao remover candidato'
      toast.error(mensagem)
    }
  }

  return (
    <>
      {/* Cabeçalho e filtros */}
      <Row className="mb-4">
        <Col md={6}>
          <h3 className="mb-3">
            <FaUsers className="me-2 text-primary" />
            Gestão de Candidatos
          </h3>
        </Col>
        <Col md={6} className="text-md-end">
          <Button 
            variant="primary" 
            onClick={handleNovoCandidato}
            disabled={loadingFiliais}
          >
            <FaPlus className="me-2" />
            Novo Candidato
          </Button>
        </Col>
      </Row>

      {/* Filtros */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <FaBuilding className="me-2" />
                  Filtrar por Filial
                </Form.Label>
                <Form.Select
                  value={filtroFilial}
                  onChange={(e) => setFiltroFilial(e.target.value)}
                  disabled={loadingFiliais || loading}
                >
                  <option value="">Todas as filiais</option>
                  {filiais.map(filial => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end">
              <div>
                <Badge bg="info" className="me-2">
                  Total: {candidatos.length}
                </Badge>
                {filtroFilial && (
                  <Badge bg="secondary">
                    Filial: {filiais.find(f => f.id.toString() === filtroFilial)?.nome}
                  </Badge>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Lista de candidatos */}
      <Card>
        <Card.Header>
          <h5 className="mb-0">
            Candidatos Cadastrados
            <Badge bg="primary" className="ms-2">{candidatos.length}</Badge>
          </h5>
        </Card.Header>
        
        <Card.Body className="p-0">
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-3 text-muted">Carregando candidatos...</p>
            </div>
          ) : candidatos.length === 0 ? (
            <div className="text-center py-5">
              <FaUser size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Nenhum candidato encontrado</h5>
              <p className="text-muted">
                {filtroFilial 
                  ? 'Não há candidatos cadastrados para esta filial.'
                  : 'Clique em "Novo Candidato" para começar.'
                }
              </p>
            </div>
          ) : (
            <Table responsive className="mb-0">
              <thead className="bg-light">
                <tr>
                  <th>Foto</th>
                  <th>Nome</th>
                  <th>Setor</th>
                  <th>Filial</th>
                  <th>Votos</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {candidatos.map(candidato => (
                  <tr key={candidato.id}>
                    <td>
                      <Image
                        src={utils.construirUrlImagem(candidato.fotoUrl)}
                        alt={candidato.nome}
                        width={50}
                        height={50}
                        className="rounded-circle"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = utils.construirUrlImagem('/uploads/placeholder.jpg')
                        }}
                      />
                    </td>
                    <td>
                      <strong>{candidato.nome}</strong>
                    </td>
                    <td>{candidato.setor}</td>
                    <td>
                      <Badge bg="secondary">{candidato.filial.nome}</Badge>
                    </td>
                    <td>
                      <Badge bg="primary">{candidato.totalVotos || 0}</Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEditarCandidato(candidato)}
                          title="Editar"
                        >
                          <FaEdit />
                        </Button>
                        
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleRemover(candidato)}
                          title="Remover"
                          disabled={candidato.totalVotos > 0}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      {/* Modal de cadastro/edição */}
      <Modal 
        show={showModal} 
        onHide={handleFecharModal}
        size="lg"
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title>
            {editando ? (
              <>
                <FaEdit className="me-2" />
                Editar Candidato
              </>
            ) : (
              <>
                <FaPlus className="me-2" />
                Novo Candidato
              </>
            )}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaBuilding className="me-2" />
                    Filial *
                  </Form.Label>
                  <Form.Select
                    name="filialId"
                    value={formData.filialId}
                    onChange={handleInputChange}
                    isInvalid={!!errors.filialId}
                    disabled={salvando}
                  >
                    <option value="">Selecione uma filial</option>
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
              </Col>

              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <FaBriefcase className="me-2" />
                    Setor *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="setor"
                    value={formData.setor}
                    onChange={handleInputChange}
                    placeholder="Ex: Vendas, Produção, RH..."
                    isInvalid={!!errors.setor}
                    disabled={salvando}
                    maxLength={50}
                  />
                  <Form.Control.Feedback type="invalid">
                    {errors.setor}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <FaUser className="me-2" />
                Nome Completo *
              </Form.Label>
              <Form.Control
                type="text"
                name="nome"
                value={formData.nome}
                onChange={handleInputChange}
                placeholder="Digite o nome completo do candidato"
                isInvalid={!!errors.nome}
                disabled={salvando}
                maxLength={100}
              />
              <Form.Control.Feedback type="invalid">
                {errors.nome}
              </Form.Control.Feedback>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">
                <FaImage className="me-2" />
                Foto {!editando && '*'}
              </Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                isInvalid={!!errors.foto}
                disabled={salvando}
              />
              <Form.Control.Feedback type="invalid">
                {errors.foto}
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                Formatos aceitos: JPG, PNG, GIF, WebP. Máximo 5MB.
                {editando && ' Deixe em branco para manter a foto atual.'}
              </Form.Text>
            </Form.Group>

            {/* Preview da foto atual (edição) */}
            {editando && candidatoSelecionado && (
              <div className="text-center mb-3">
                <p className="text-muted mb-2">Foto atual:</p>
                <Image
                  src={utils.construirUrlImagem(candidatoSelecionado.fotoUrl)}
                  alt={candidatoSelecionado.nome}
                  width={100}
                  height={100}
                  className="rounded-circle"
                  style={{ objectFit: 'cover' }}
                />
              </div>
            )}
          </Form>
        </Modal.Body>

        <Modal.Footer>
          <Button 
            variant="secondary" 
            onClick={handleFecharModal}
            disabled={salvando}
          >
            <FaTimes className="me-2" />
            Cancelar
          </Button>
          
          <Button 
            variant="primary" 
            onClick={handleSalvar}
            disabled={salvando}
          >
            {salvando ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Salvando...
              </>
            ) : (
              <>
                <FaSave className="me-2" />
                {editando ? 'Atualizar' : 'Cadastrar'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  )
}

export default CadastroParticipantes