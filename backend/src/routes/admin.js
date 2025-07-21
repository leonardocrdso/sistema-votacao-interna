const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, query, param, validationResult } = require('express-validator');
const path = require('path');
const fs = require('fs');

const { adminAuth } = require('../middleware/auth');
const { uploadMiddleware } = require('../middleware/upload');

const router = express.Router();
const prisma = new PrismaClient();

// Aplicar middleware de autenticação em todas as rotas admin
router.use(adminAuth);

/**
 * GET /api/admin/candidatos
 * Lista candidatos por filial (para administração)
 */
router.get('/candidatos', [
  query('filial')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número válido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { filial } = req.query;
    
    const whereClause = filial ? { filialId: parseInt(filial) } : {};

    const candidatos = await prisma.candidato.findMany({
      where: whereClause,
      include: {
        filial: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: {
            votos: true
          }
        }
      },
      orderBy: [
        { filial: { nome: 'asc' } },
        { nome: 'asc' }
      ]
    });

    const candidatosFormatados = candidatos.map(candidato => ({
      id: candidato.id,
      nome: candidato.nome,
      setor: candidato.setor,
      fotoUrl: candidato.fotoUrl,
      filial: candidato.filial,
      totalVotos: candidato._count.votos
    }));

    res.json(candidatosFormatados);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/admin/candidatos
 * Cadastrar novo candidato
 */
router.post('/candidatos', uploadMiddleware, [
  body('filialId')
    .notEmpty()
    .withMessage('ID da filial é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número válido'),
  body('nome')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('setor')
    .notEmpty()
    .withMessage('Setor é obrigatório')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Setor deve ter entre 2 e 50 caracteres')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // Remover arquivo upado se houver erro de validação
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { filialId, nome, setor } = req.body;

    // Verificar se a filial existe
    const filialExiste = await prisma.filial.findUnique({
      where: { id: parseInt(filialId) }
    });

    if (!filialExiste) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        sucesso: false,
        erro: 'Filial não encontrada'
      });
    }

    // URL da foto (usar placeholder se não houver upload)
    const fotoUrl = req.file ? `/uploads/${req.file.filename}` : '/uploads/placeholder.jpg';

    const novoCandidato = await prisma.candidato.create({
      data: {
        filialId: parseInt(filialId),
        nome: nome.trim(),
        setor: setor.trim(),
        fotoUrl: fotoUrl
      },
      include: {
        filial: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Candidato criado com sucesso',
      candidato: {
        id: novoCandidato.id,
        nome: novoCandidato.nome,
        setor: novoCandidato.setor,
        fotoUrl: novoCandidato.fotoUrl,
        filial: novoCandidato.filial
      }
    });
  } catch (error) {
    // Remover arquivo upado em caso de erro
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * PUT /api/admin/candidatos/:id
 * Atualizar candidato existente
 */
router.put('/candidatos/:id', uploadMiddleware, [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do candidato deve ser um número válido'),
  body('nome')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('setor')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Setor deve ter entre 2 e 50 caracteres')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { id } = req.params;
    const { nome, setor } = req.body;

    // Verificar se o candidato existe
    const candidatoExistente = await prisma.candidato.findUnique({
      where: { id: parseInt(id) }
    });

    if (!candidatoExistente) {
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(404).json({
        sucesso: false,
        erro: 'Candidato não encontrado'
      });
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {};
    if (nome) dadosAtualizacao.nome = nome.trim();
    if (setor) dadosAtualizacao.setor = setor.trim();

    // Se houver novo arquivo de foto
    if (req.file) {
      dadosAtualizacao.fotoUrl = `/uploads/${req.file.filename}`;
      
      // Remover foto anterior (se não for placeholder)
      if (candidatoExistente.fotoUrl !== '/uploads/placeholder.jpg') {
        const fotoAnterior = path.join(__dirname, '../../', candidatoExistente.fotoUrl);
        if (fs.existsSync(fotoAnterior)) {
          fs.unlinkSync(fotoAnterior);
        }
      }
    }

    const candidatoAtualizado = await prisma.candidato.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao,
      include: {
        filial: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Candidato atualizado com sucesso',
      candidato: {
        id: candidatoAtualizado.id,
        nome: candidatoAtualizado.nome,
        setor: candidatoAtualizado.setor,
        fotoUrl: candidatoAtualizado.fotoUrl,
        filial: candidatoAtualizado.filial
      }
    });
  } catch (error) {
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
});

/**
 * DELETE /api/admin/candidatos/:id
 * Remover candidato
 */
router.delete('/candidatos/:id', [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID do candidato deve ser um número válido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { id } = req.params;

    // Verificar se o candidato existe
    const candidato = await prisma.candidato.findUnique({
      where: { id: parseInt(id) },
      include: {
        _count: {
          select: {
            votos: true
          }
        }
      }
    });

    if (!candidato) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Candidato não encontrado'
      });
    }

    // Verificar se o candidato tem votos
    if (candidato._count.votos > 0) {
      return res.status(409).json({
        sucesso: false,
        erro: 'Não é possível remover candidato que já recebeu votos'
      });
    }

    // Remover candidato
    await prisma.candidato.delete({
      where: { id: parseInt(id) }
    });

    // Remover foto (se não for placeholder)
    if (candidato.fotoUrl !== '/uploads/placeholder.jpg') {
      const fotoPath = path.join(__dirname, '../../', candidato.fotoUrl);
      if (fs.existsSync(fotoPath)) {
        fs.unlinkSync(fotoPath);
      }
    }

    res.json({
      sucesso: true,
      mensagem: 'Candidato removido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/votos
 * Resultados de votação por filial
 */
router.get('/votos', [
  query('filial')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número válido')
], async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { filial } = req.query;
    const filialId = filial ? parseInt(filial) : undefined;

    // Se filial específica foi solicitada, verificar se existe
    if (filialId) {
      const filialExiste = await prisma.filial.findUnique({
        where: { id: filialId }
      });

      if (!filialExiste) {
        return res.status(404).json({
          sucesso: false,
          erro: 'Filial não encontrada'
        });
      }
    }

    // Buscar candidatos com contagem de votos
    const whereClause = filialId ? { filialId } : {};

    const candidatos = await prisma.candidato.findMany({
      where: whereClause,
      include: {
        filial: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: {
            votos: true
          }
        }
      },
      orderBy: [
        { filial: { nome: 'asc' } },
        { _count: { votos: 'desc' } }
      ]
    });

    const resultados = candidatos.map(candidato => ({
      candidatoId: candidato.id,
      nome: candidato.nome,
      setor: candidato.setor,
      filial: candidato.filial.nome,
      total: candidato._count.votos
    }));

    res.json(resultados);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/votos-geral
 * Visão geral de votos (todas as filiais)
 */
router.get('/votos-geral', async (req, res, next) => {
  try {
    // Buscar todos os candidatos com contagem de votos
    const candidatos = await prisma.candidato.findMany({
      include: {
        filial: {
          select: {
            id: true,
            nome: true
          }
        },
        _count: {
          select: {
            votos: true
          }
        }
      },
      orderBy: [
        { _count: { votos: 'desc' } },
        { filial: { nome: 'asc' } },
        { nome: 'asc' }
      ]
    });

    const resultados = candidatos.map(candidato => ({
      candidatoId: candidato.id,
      nome: candidato.nome,
      setor: candidato.setor,
      filial: candidato.filial.nome,
      total: candidato._count.votos
    }));

    // Estatísticas gerais
    const totalVotos = await prisma.voto.count();
    const totalCandidatos = candidatos.length;
    const filiaisParticipantes = await prisma.filial.count({
      where: {
        candidatos: {
          some: {}
        }
      }
    });

    res.json({
      resultados,
      estatisticas: {
        totalVotos,
        totalCandidatos,
        filiaisParticipantes
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/admin/estatisticas
 * Estatísticas gerais do sistema
 */
router.get('/estatisticas', async (req, res, next) => {
  try {
    const [totalVotos, totalCandidatos, totalFiliais, votosPorFilial] = await Promise.all([
      prisma.voto.count(),
      prisma.candidato.count(),
      prisma.filial.count(),
      prisma.filial.findMany({
        include: {
          _count: {
            select: {
              votos: true,
              candidatos: true
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      })
    ]);

    const estatisticas = {
      totais: {
        votos: totalVotos,
        candidatos: totalCandidatos,
        filiais: totalFiliais
      },
      porFilial: votosPorFilial.map(filial => ({
        id: filial.id,
        nome: filial.nome,
        votos: filial._count.votos,
        candidatos: filial._count.candidatos
      }))
    };

    res.json(estatisticas);
  } catch (error) {
    next(error);
  }
});

module.exports = router;