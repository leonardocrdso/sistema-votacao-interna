const express = require('express');
const { PrismaClient } = require('@prisma/client');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * GET /api/filiais
 * Lista todas as filiais disponíveis
 */
router.get('/', async (req, res, next) => {
  try {
    const filiais = await prisma.filial.findMany({
      select: {
        id: true,
        nome: true
      },
      orderBy: {
        nome: 'asc'
      }
    });

    res.json(filiais);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/filiais/:id
 * Busca uma filial específica por ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const filial = await prisma.filial.findUnique({
      where: {
        id: parseInt(id)
      },
      select: {
        id: true,
        nome: true,
        _count: {
          select: {
            candidatos: true,
            votos: true
          }
        }
      }
    });

    if (!filial) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Filial não encontrada'
      });
    }

    res.json(filial);
  } catch (error) {
    next(error);
  }
});

module.exports = router;