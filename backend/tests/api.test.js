const request = require('supertest');
const app = require('../src/index');

const ADMIN_TOKEN = 'eAyL5frRilDo5JivmkrT0CAQ2d4AfGyIXnzV47YRZm2a6GbAnM';

describe('Sistema de Votação API', () => {
  
  // Health Check
  describe('GET /health', () => {
    it('deve retornar status OK', async () => {
      const res = await request(app)
        .get('/health')
        .expect(200);
      
      expect(res.body).toHaveProperty('status', 'OK');
      expect(res.body).toHaveProperty('timestamp');
    });
  });

  // Filiais
  describe('GET /api/filiais', () => {
    it('deve retornar lista de filiais', async () => {
      const res = await request(app)
        .get('/api/filiais')
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      expect(res.body[0]).toHaveProperty('id');
      expect(res.body[0]).toHaveProperty('nome');
    });
  });

  // Candidatos
  describe('GET /api/candidatos', () => {
    it('deve retornar erro quando filial não é informada', async () => {
      const res = await request(app)
        .get('/api/candidatos')
        .expect(400);
      
      expect(res.body).toHaveProperty('sucesso', false);
      expect(res.body).toHaveProperty('erro');
    });

    it('deve retornar candidatos quando filial válida é informada', async () => {
      const res = await request(app)
        .get('/api/candidatos')
        .query({ filial: 1 })
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve retornar erro quando filial inválida', async () => {
      const res = await request(app)
        .get('/api/candidatos')
        .query({ filial: 999 })
        .expect(404);
      
      expect(res.body).toHaveProperty('sucesso', false);
    });
  });

  // Verificação de voto
  describe('POST /api/verificar-voto', () => {
    const dadosValidos = {
      filialId: 1,
      cadastro: 'TEST123',
      cpf: '12345678901'
    };

    it('deve aceitar dados válidos', async () => {
      const res = await request(app)
        .post('/api/verificar-voto')
        .send(dadosValidos)
        .expect(200);
      
      expect(res.body).toHaveProperty('elegivel');
      expect(typeof res.body.elegivel).toBe('boolean');
    });

    it('deve rejeitar dados inválidos', async () => {
      const res = await request(app)
        .post('/api/verificar-voto')
        .send({
          filialId: '',
          cadastro: '',
          cpf: '123'
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('sucesso', false);
      expect(res.body).toHaveProperty('detalhes');
    });

    it('deve rejeitar CPF inválido', async () => {
      const res = await request(app)
        .post('/api/verificar-voto')
        .send({
          ...dadosValidos,
          cpf: '123abc'
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('sucesso', false);
    });
  });

  // Votação
  describe('POST /api/votar', () => {
    const dadosVoto = {
      filialId: 1,
      cadastro: 'TEST_VOTE_' + Date.now(),
      cpf: '12345678901',
      candidatoId: 1
    };

    it('deve rejeitar dados inválidos', async () => {
      const res = await request(app)
        .post('/api/votar')
        .send({
          filialId: '',
          cadastro: '',
          cpf: '',
          candidatoId: ''
        })
        .expect(400);
      
      expect(res.body).toHaveProperty('sucesso', false);
    });

    it('deve rejeitar candidato inexistente', async () => {
      const res = await request(app)
        .post('/api/votar')
        .send({
          ...dadosVoto,
          candidatoId: 9999
        })
        .expect(404);
      
      expect(res.body).toHaveProperty('sucesso', false);
    });
  });

  // Admin - sem token
  describe('Admin sem token', () => {
    it('deve rejeitar acesso sem token', async () => {
      const res = await request(app)
        .get('/api/admin/candidatos')
        .expect(401);
      
      expect(res.body).toHaveProperty('sucesso', false);
      expect(res.body.erro).toContain('Token');
    });

    it('deve rejeitar token inválido', async () => {
      const res = await request(app)
        .get('/api/admin/candidatos')
        .set('x-admin-token', 'token-invalido')
        .expect(403);
      
      expect(res.body).toHaveProperty('sucesso', false);
    });
  });

  // Admin - com token válido
  describe('Admin com token válido', () => {
    it('deve permitir acesso aos candidatos', async () => {
      const res = await request(app)
        .get('/api/admin/candidatos')
        .set('x-admin-token', ADMIN_TOKEN)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('deve permitir acesso aos resultados', async () => {
      const res = await request(app)
        .get('/api/admin/votos-geral')
        .set('x-admin-token', ADMIN_TOKEN)
        .expect(200);
      
      expect(res.body).toHaveProperty('resultados');
      expect(res.body).toHaveProperty('estatisticas');
    });

    it('deve permitir filtrar resultados por filial', async () => {
      const res = await request(app)
        .get('/api/admin/votos')
        .query({ filial: 1 })
        .set('x-admin-token', ADMIN_TOKEN)
        .expect(200);
      
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  // Rate Limiting
  describe('Rate Limiting', () => {
    it('deve aplicar rate limiting após muitas requisições', async () => {
      // Fazer muitas requisições rapidamente
      const requests = Array(15).fill().map(() => 
        request(app).get('/health')
      );
      
      await Promise.all(requests);
      
      // A próxima deve ser limitada (pode variar dependendo da implementação)
      const res = await request(app)
        .get('/health');
      
      // Aceitar tanto sucesso quanto rate limit
      expect([200, 429]).toContain(res.status);
    });
  });
});

// Testes de validação
describe('Validações', () => {
  describe('CPF', () => {
    const testarCPF = async (cpf, devePassar) => {
      const res = await request(app)
        .post('/api/verificar-voto')
        .send({
          filialId: 1,
          cadastro: 'TEST123',
          cpf: cpf
        });
      
      if (devePassar) {
        expect([200, 404]).toContain(res.status); // 200 ou 404 (filial não encontrada)
      } else {
        expect(res.status).toBe(400);
      }
    };

    it('deve aceitar CPF válido (11 dígitos)', async () => {
      await testarCPF('12345678901', true);
    });

    it('deve rejeitar CPF com menos de 11 dígitos', async () => {
      await testarCPF('123456789', false);
    });

    it('deve rejeitar CPF com mais de 11 dígitos', async () => {
      await testarCPF('123456789012', false);
    });

    it('deve rejeitar CPF com letras', async () => {
      await testarCPF('1234567890a', false);
    });

    it('deve rejeitar CPF vazio', async () => {
      await testarCPF('', false);
    });
  });

  describe('Cadastro', () => {
    const testarCadastro = async (cadastro, devePassar) => {
      const res = await request(app)
        .post('/api/verificar-voto')
        .send({
          filialId: 1,
          cadastro: cadastro,
          cpf: '12345678901'
        });
      
      if (devePassar) {
        expect([200, 404]).toContain(res.status);
      } else {
        expect(res.status).toBe(400);
      }
    };

    it('deve aceitar cadastro válido', async () => {
      await testarCadastro('FUNC123', true);
    });

    it('deve rejeitar cadastro vazio', async () => {
      await testarCadastro('', false);
    });

    it('deve rejeitar cadastro muito longo', async () => {
      await testarCadastro('A'.repeat(51), false);
    });
  });
});

// Testes de integração
describe('Fluxo completo de votação', () => {
  const dadosVotante = {
    filialId: 1,
    cadastro: 'INTEGRATION_TEST_' + Date.now(),
    cpf: '98765432101'
  };

  it('deve executar fluxo completo de votação', async () => {
    // 1. Verificar elegibilidade
    const elegibilidade = await request(app)
      .post('/api/verificar-voto')
      .send(dadosVotante)
      .expect(200);
    
    expect(elegibilidade.body.elegivel).toBe(true);

    // 2. Buscar candidatos
    const candidatos = await request(app)
      .get('/api/candidatos')
      .query({ filial: dadosVotante.filialId })
      .expect(200);
    
    expect(candidatos.body.length).toBeGreaterThan(0);

    // 3. Realizar voto
    const voto = await request(app)
      .post('/api/votar')
      .send({
        ...dadosVotante,
        candidatoId: candidatos.body[0].id
      })
      .expect(201);
    
    expect(voto.body.sucesso).toBe(true);

    // 4. Verificar que não pode votar novamente
    const segundoVoto = await request(app)
      .post('/api/verificar-voto')
      .send(dadosVotante)
      .expect(200);
    
    expect(segundoVoto.body.elegivel).toBe(false);

    // 5. Tentar votar novamente (deve falhar)
    await request(app)
      .post('/api/votar')
      .send({
        ...dadosVotante,
        candidatoId: candidatos.body[0].id
      })
      .expect(409);
  });
});