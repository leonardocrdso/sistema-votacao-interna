import axios from 'axios'

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const ADMIN_TOKEN = 'eAyL5frRilDo5JivmkrT0CAQ2d4AfGyIXnzV47YRZm2a6GbAnM'

// Instância do axios
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Interceptador para requests
api.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('❌ Request Error:', error)
    return Promise.reject(error)
  }
)

// Interceptador para responses
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`)
    return response
  },
  (error) => {
    console.error('❌ Response Error:', error.response?.data || error.message)
    
    // Tratamento de erros específicos
    if (error.response?.status === 401) {
      console.error('Token inválido ou expirado')
    } else if (error.response?.status === 403) {
      console.error('Acesso negado')
    } else if (error.response?.status >= 500) {
      console.error('Erro interno do servidor')
    }
    
    return Promise.reject(error)
  }
)

// Serviços da API

// Filiais
export const filiaisAPI = {
  // Listar todas as filiais
  listar: async () => {
    const response = await api.get('/filiais')
    return response.data
  },

  // Buscar filial por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/filiais/${id}`)
    return response.data
  }
}

// Candidatos
export const candidatosAPI = {
  // Listar candidatos por filial
  listarPorFilial: async (filialId) => {
    const response = await api.get('/candidatos', {
      params: { filial: filialId }
    })
    return response.data
  },

  // Buscar candidato por ID
  buscarPorId: async (id) => {
    const response = await api.get(`/candidatos/${id}`)
    return response.data
  }
}

// Votos
export const votosAPI = {
  // Verificar se o usuário pode votar
  verificarElegibilidade: async (dados) => {
    const response = await api.post('/verificar-voto', dados)
    return response.data
  },

  // Realizar voto
  votar: async (dados) => {
    const response = await api.post('/votar', dados)
    return response.data
  }
}

// Admin
export const adminAPI = {
  // Headers para autenticação admin
  getAuthHeaders: () => ({
    'x-admin-token': ADMIN_TOKEN
  }),

  // Candidatos
  candidatos: {
    // Listar candidatos (admin)
    listar: async (filialId = null) => {
      const params = filialId ? { filial: filialId } : {}
      const response = await api.get('/admin/candidatos', {
        params,
        headers: adminAPI.getAuthHeaders()
      })
      return response.data
    },

    // Criar candidato
    criar: async (dados) => {
      const formData = new FormData()
      formData.append('filialId', dados.filialId)
      formData.append('nome', dados.nome)
      formData.append('setor', dados.setor)
      if (dados.foto) {
        formData.append('foto', dados.foto)
      }

      const response = await api.post('/admin/candidatos', formData, {
        headers: {
          ...adminAPI.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },

    // Atualizar candidato
    atualizar: async (id, dados) => {
      const formData = new FormData()
      if (dados.nome) formData.append('nome', dados.nome)
      if (dados.setor) formData.append('setor', dados.setor)
      if (dados.foto) formData.append('foto', dados.foto)

      const response = await api.put(`/admin/candidatos/${id}`, formData, {
        headers: {
          ...adminAPI.getAuthHeaders(),
          'Content-Type': 'multipart/form-data'
        }
      })
      return response.data
    },

    // Remover candidato
    remover: async (id) => {
      const response = await api.delete(`/admin/candidatos/${id}`, {
        headers: adminAPI.getAuthHeaders()
      })
      return response.data
    }
  },

  // Resultados
  resultados: {
    // Resultados por filial
    porFilial: async (filialId = null) => {
      const params = filialId ? { filial: filialId } : {}
      const response = await api.get('/admin/votos', {
        params,
        headers: adminAPI.getAuthHeaders()
      })
      return response.data
    },

    // Resultados gerais
    geral: async () => {
      const response = await api.get('/admin/votos-geral', {
        headers: adminAPI.getAuthHeaders()
      })
      return response.data
    },

    // Estatísticas
    estatisticas: async () => {
      const response = await api.get('/admin/estatisticas', {
        headers: adminAPI.getAuthHeaders()
      })
      return response.data
    }
  }
}

// Utilitários
export const utils = {
  // Construir URL completa para imagens
  construirUrlImagem: (caminho) => {
    if (!caminho) return null
    if (caminho.startsWith('http')) return caminho
    return `${API_BASE_URL}${caminho}`
  },

  // Validar CPF básico (apenas formato)
  validarCPF: (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    return cpfLimpo.length === 11 && /^\d{11}$/.test(cpfLimpo)
  },

  // Formatar CPF
  formatarCPF: (cpf) => {
    const cpfLimpo = cpf.replace(/\D/g, '')
    return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
  },

  // Limpar CPF (apenas números)
  limparCPF: (cpf) => {
    return cpf.replace(/\D/g, '')
  }
}

export default api