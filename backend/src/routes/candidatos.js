const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, query, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/candidatos
 * Lista candidatos de uma filial específica
 */
router.get('/', [
  query('filial')
    .notEmpty()
    .withMessage('ID da filial é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número válido')
], async (req, res, next) => {
  try {
    // Verificar erros de validação
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Dados inválidos',
        detalhes: errors.array()
      });
    }

    const { filial } = req.query;
    const filialId = parseInt(filial);

    // Verificar se a filial existe
    const filialExiste = await prisma.filial.findUnique({
      where: { id: filialId }
    });

    if (!filialExiste) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Filial não encontrada'
      });
    }

    // Buscar candidatos da filial
    const candidatos = await prisma.candidato.findMany({
      where: {
        filialId: filialId
      },
      select: {
        id: true,
        nome: true,
        setor: true,
        fotoUrl: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    res.json(candidatos);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/candidatos/:id
 * Busca um candidato específico por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const candidato = await prisma.candidato.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        nome: true,
        setor: true,
        fotoUrl: true,
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
      }
    });

    if (!candidato) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Candidato não encontrado'
      });
    }

    res.json(candidato);
  } catch (error) {
    next(error);
  }
});

module.exports = router;