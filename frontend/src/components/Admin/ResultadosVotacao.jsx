import { useState, useEffect } from 'react'
import { 
  Row, Col, Card, Form, Table, Alert, Spinner, Badge, Button 
} from 'react-bootstrap'
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts'
import { toast } from 'react-hot-toast'
import { 
  FaChartBar, FaBuilding, FaUsers, FaVoteYea, 
  FaDownload, FaSync, FaTrophy 
} from 'react-icons/fa'

import { adminAPI } from '../../services/api'

// Cores para os gráficos
const CORES_GRAFICO = [
  '#0d6efd', '#198754', '#dc3545', '#ffc107', '#6f42c1',
  '#fd7e14', '#20c997', '#e83e8c', '#6c757d', '#212529'
]

function ResultadosVotacao({ filiais, loading: loadingFiliais }) {
  const [resultados, setResultados] = useState([])
  const [estatisticas, setEstatisticas] = useState(null)
  const [loading, setLoading] = useState(false)
  const [filtroFilial, setFiltroFilial] = useState('')
  const [tipoVisualizacao, setTipoVisualizacao] = useState('barras') // 'barras' ou 'pizza'

  // Carregar resultados
  const carregarResultados = async (filialId = null) => {
    try {
      setLoading(true)
      
      let data
      if (filialId) {
        data = await adminAPI.resultados.porFilial(filialId)
        setResultados(data)
        setEstatisticas(null)
      } else {
        data = await adminAPI.resultados.geral()
        setResultados(data.resultados || data)
        setEstatisticas(data.estatisticas || null)
      }
      
    } catch (error) {
      console.error('Erro ao carregar resultados:', error)
      toast.error('Erro ao carregar resultados')
    } finally {
      setLoading(false)
    }
  }

  // Carregar resultados inicialmente
  useEffect(() => {
    if (!loadingFiliais) {
      carregarResultados()
    }
  }, [loadingFiliais])

  // Carregar resultados quando filtro mudar
  useEffect(() => {
    if (!loadingFiliais) {
      const filialId = filtroFilial || null
      carregarResultados(filialId)
    }
  }, [filtroFilial, loadingFiliais])

  // Preparar dados para gráfico
  const prepararDadosGrafico = () => {
    return resultados.map((item, index) => ({
      nome: item.nome.length > 15 ? `${item.nome.substring(0, 15)}...` : item.nome,
      nomeCompleto: item.nome,
      votos: item.total,
      setor: item.setor,
      filial: item.filial,
      cor: CORES_GRAFICO[index % CORES_GRAFICO.length]
    }))
  }

  // Agrupar resultados por filial para visão geral
  const agruparPorFilial = () => {
    if (filtroFilial) return []
    
    const grupos = {}
    resultados.forEach(item => {
      if (!grupos[item.filial]) {
        grupos[item.filial] = {
          filial: item.filial,
          votos: 0,
          candidatos: 0
        }
      }
      grupos[item.filial].votos += item.total
      grupos[item.filial].candidatos += 1
    })
    
    return Object.values(grupos)
  }

  // Handle refresh
  const handleRefresh = () => {
    carregarResultados(filtroFilial || null)
  }

  // Handle export (simples - apenas mostra dados)
  const handleExport = () => {
    const dados = resultados.map(item => ({
      Nome: item.nome,
      Setor: item.setor,
      Filial: item.filial,
      Votos: item.total
    }))
    
    console.table(dados)
    toast.success('Dados exportados para o console do navegador')
  }

  const dadosGrafico = prepararDadosGrafico()
  const dadosPorFilial = agruparPorFilial()

  return (
    <>
      {/* Cabeçalho e controles */}
      <Row className="mb-4">
        <Col md={6}>
          <h3 className="mb-3">
            <FaChartBar className="me-2 text-primary" />
            Resultados da Votação
          </h3>
        </Col>
        <Col md={6} className="text-md-end">
          <div className="d-flex justify-content-md-end gap-2 flex-wrap">
            <Button 
              variant="outline-primary" 
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              <FaSync className="me-1" />
              Atualizar
            </Button>
            
            <Button 
              variant="outline-success" 
              size="sm"
              onClick={handleExport}
              disabled={loading || resultados.length === 0}
            >
              <FaDownload className="me-1" />
              Exportar
            </Button>
          </div>
        </Col>
      </Row>

      {/* Estatísticas gerais */}
      {estatisticas && (
        <Row className="mb-4">
          <Col md={3}>
            <Card className="text-center border-primary">
              <Card.Body>
                <FaVoteYea className="text-primary mb-2" size={32} />
                <h4 className="text-primary">{estatisticas.totalVotos}</h4>
                <small className="text-muted">Total de Votos</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-success">
              <Card.Body>
                <FaUsers className="text-success mb-2" size={32} />
                <h4 className="text-success">{estatisticas.totalCandidatos}</h4>
                <small className="text-muted">Candidatos</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-info">
              <Card.Body>
                <FaBuilding className="text-info mb-2" size={32} />
                <h4 className="text-info">{estatisticas.filiaisParticipantes}</h4>
                <small className="text-muted">Filiais Participantes</small>
              </Card.Body>
            </Card>
          </Col>
          <Col md={3}>
            <Card className="text-center border-warning">
              <Card.Body>
                <FaTrophy className="text-warning mb-2" size={32} />
                <h4 className="text-warning">
                  {resultados.length > 0 ? resultados[0].total : 0}
                </h4>
                <small className="text-muted">Mais Votado</small>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      {/* Filtros e controles do gráfico */}
      <Card className="mb-4">
        <Card.Body>
          <Row>
            <Col md={4}>
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
                  <option value="">Visão Geral (Todas)</option>
                  {filiais.map(filial => (
                    <option key={filial.id} value={filial.id}>
                      {filial.nome}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">
                  <FaChartBar className="me-2" />
                  Tipo de Gráfico
                </Form.Label>
                <Form.Select
                  value={tipoVisualizacao}
                  onChange={(e) => setTipoVisualizacao(e.target.value)}
                  disabled={loading}
                >
                  <option value="barras">Gráfico de Barras</option>
                  <option value="pizza">Gráfico de Pizza</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={4} className="d-flex align-items-end">
              <div>
                <Badge bg="info" className="me-2">
                  {resultados.length} candidatos
                </Badge>
                <Badge bg="success">
                  {resultados.reduce((acc, item) => acc + item.total, 0)} votos
                </Badge>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Conteúdo principal */}
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Carregando resultados...</p>
        </div>
      ) : resultados.length === 0 ? (
        <Alert variant="info" className="text-center">
          <FaVoteYea size={48} className="text-muted mb-3" />
          <h5>Nenhum resultado encontrado</h5>
          <p className="mb-0">
            {filtroFilial 
              ? 'Ainda não há votos para esta filial.'
              : 'A votação ainda não começou ou não há votos registrados.'
            }
          </p>
        </Alert>
      ) : (
        <>
          {/* Gráficos */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    📊 Visualização dos Resultados
                    {filtroFilial && (
                      <Badge bg="secondary" className="ms-2">
                        {filiais.find(f => f.id.toString() === filtroFilial)?.nome}
                      </Badge>
                    )}
                  </h5>
                </Card.Header>
                
                <Card.Body>
                  <div style={{ width: '100%', height: '400px' }}>
                    {tipoVisualizacao === 'barras' ? (
                      <ResponsiveContainer>
                        <BarChart data={dadosGrafico}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="nome" 
                            angle={-45}
                            textAnchor="end"
                            height={80}
                            fontSize={12}
                          />
                          <YAxis />
                          <Tooltip 
                            labelFormatter={(label, payload) => {
                              const item = payload?.[0]?.payload
                              return item ? item.nomeCompleto : label
                            }}
                            formatter={(value, name, props) => [
                              `${value} votos`,
                              props.payload.setor
                            ]}
                          />
                          <Legend />
                          <Bar 
                            dataKey="votos" 
                            fill="#0d6efd"
                            name="Votos"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <ResponsiveContainer>
                        <PieChart>
                          <Pie
                            data={dadosGrafico}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ nome, votos, percent }) => 
                              `${nome}: ${votos} (${(percent * 100).toFixed(1)}%)`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="votos"
                          >
                            {dadosGrafico.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.cor} />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value, name, props) => [
                              `${value} votos`,
                              props.payload.nomeCompleto
                            ]}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tabela de resultados */}
          <Row className="mb-4">
            <Col>
              <Card>
                <Card.Header>
                  <h5 className="mb-0">
                    📋 Resultados Detalhados
                  </h5>
                </Card.Header>
                
                <Card.Body className="p-0">
                  <Table responsive className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th>Posição</th>
                        <th>Candidato</th>
                        <th>Setor</th>
                        {!filtroFilial && <th>Filial</th>}
                        <th>Votos</th>
                        <th>Percentual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.map((item, index) => {
                        const totalVotos = resultados.reduce((acc, r) => acc + r.total, 0)
                        const percentual = totalVotos > 0 ? (item.total / totalVotos * 100) : 0
                        
                        return (
                          <tr key={item.candidatoId}>
                            <td>
                              <Badge 
                                bg={index === 0 ? 'warning' : index === 1 ? 'secondary' : index === 2 ? 'dark' : 'light'}
                                text={index > 2 ? 'dark' : 'light'}
                              >
                                {index + 1}º
                              </Badge>
                            </td>
                            <td>
                              <strong>{item.nome}</strong>
                              {index === 0 && <FaTrophy className="text-warning ms-2" />}
                            </td>
                            <td>{item.setor}</td>
                            {!filtroFilial && (
                              <td>
                                <Badge bg="secondary">{item.filial}</Badge>
                              </td>
                            )}
                            <td>
                              <Badge bg="primary">{item.total}</Badge>
                            </td>
                            <td>
                              <div className="d-flex align-items-center">
                                <div 
                                  className="bg-primary me-2" 
                                  style={{ 
                                    width: `${Math.max(percentual, 5)}%`, 
                                    height: '8px',
                                    minWidth: '20px'
                                  }}
                                ></div>
                                <small>{percentual.toFixed(1)}%</small>
                              </div>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </Table>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Resumo por filial (apenas na visão geral) */}
          {!filtroFilial && dadosPorFilial.length > 0 && (
            <Row>
              <Col>
                <Card>
                  <Card.Header>
                    <h5 className="mb-0">
                      🏢 Resumo por Filial
                    </h5>
                  </Card.Header>
                  
                  <Card.Body className="p-0">
                    <Table responsive className="mb-0">
                      <thead className="bg-light">
                        <tr>
                          <th>Filial</th>
                          <th>Candidatos</th>
                          <th>Total de Votos</th>
                          <th>Média por Candidato</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dadosPorFilial
                          .sort((a, b) => b.votos - a.votos)
                          .map(item => (
                            <tr key={item.filial}>
                              <td>
                                <strong>{item.filial}</strong>
                              </td>
                              <td>
                                <Badge bg="info">{item.candidatos}</Badge>
                              </td>
                              <td>
                                <Badge bg="primary">{item.votos}</Badge>
                              </td>
                              <td>
                                <Badge bg="secondary">
                                  {item.candidatos > 0 ? (item.votos / item.candidatos).toFixed(1) : '0'}
                                </Badge>
                              </td>
                            </tr>
                          ))
                        }
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </>
      )}
    </>
  )
}

export default ResultadosVotacao