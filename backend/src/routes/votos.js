const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { body, validationResult } = require('express-validator');

const router = express.Router();
const prisma = new PrismaClient();

/**
 * POST /api/verificar-voto
 * Verifica se o usuário já votou (baseado em filial + cadastro + CPF)
 */
router.post('/verificar-voto', [
  body('filialId')
    .notEmpty()
    .withMessage('ID da filial é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número válido'),
  body('cadastro')
    .notEmpty()
    .withMessage('Cadastro é obrigatório')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cadastro deve ter entre 1 e 50 caracteres'),
  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('CPF deve ter exatamente 11 dígitos')
    .matches(/^\d{11}$/)
    .withMessage('CPF deve conter apenas números')
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

    const { filialId, cadastro, cpf } = req.body;

    // Verificar se a filial existe
    const filialExiste = await prisma.filial.findUnique({
      where: { id: parseInt(filialId) }
    });

    if (!filialExiste) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Filial não encontrada'
      });
    }

    // Verificar se já existe voto para esta combinação
    const votoExistente = await prisma.voto.findUnique({
      where: {
        filialId_cadastro_cpf: {
          filialId: parseInt(filialId),
          cadastro: cadastro.trim(),
          cpf: cpf.trim()
        }
      }
    });

    res.json({
      elegivel: !votoExistente
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/votar
 * Registra um novo voto
 */
router.post('/votar', [
  body('filialId')
    .notEmpty()
    .withMessage('ID da filial é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID da filial deve ser um número válido'),
  body('cadastro')
    .notEmpty()
    .withMessage('Cadastro é obrigatório')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Cadastro deve ter entre 1 e 50 caracteres'),
  body('cpf')
    .notEmpty()
    .withMessage('CPF é obrigatório')
    .trim()
    .isLength({ min: 11, max: 11 })
    .withMessage('CPF deve ter exatamente 11 dígitos')
    .matches(/^\d{11}$/)
    .withMessage('CPF deve conter apenas números'),
  body('candidatoId')
    .notEmpty()
    .withMessage('ID do candidato é obrigatório')
    .isInt({ min: 1 })
    .withMessage('ID do candidato deve ser um número válido')
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

    const { filialId, cadastro, cpf, candidatoId } = req.body;
    const filialIdInt = parseInt(filialId);
    const candidatoIdInt = parseInt(candidatoId);

    // Verificar se a filial existe
    const filialExiste = await prisma.filial.findUnique({
      where: { id: filialIdInt }
    });

    if (!filialExiste) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Filial não encontrada'
      });
    }

    // Verificar se o candidato existe e pertence à filial
    const candidato = await prisma.candidato.findUnique({
      where: { id: candidatoIdInt },
      include: { filial: true }
    });

    if (!candidato) {
      return res.status(404).json({
        sucesso: false,
        erro: 'Candidato não encontrado'
      });
    }

    if (candidato.filialId !== filialIdInt) {
      return res.status(400).json({
        sucesso: false,
        erro: 'Candidato não pertence à filial selecionada'
      });
    }

    // Verificar se já existe voto para esta combinação
    const votoExistente = await prisma.voto.findUnique({
      where: {
        filialId_cadastro_cpf: {
          filialId: filialIdInt,
          cadastro: cadastro.trim(),
          cpf: cpf.trim()
        }
      }
    });

    if (votoExistente) {
      return res.status(409).json({
        sucesso: false,
        erro: 'Você já votou anteriormente'
      });
    }

    // Registrar o voto
    const novoVoto = await prisma.voto.create({
      data: {
        filialId: filialIdInt,
        cadastro: cadastro.trim(),
        cpf: cpf.trim(),
        candidatoId: candidatoIdInt
      },
      include: {
        candidato: {
          select: {
            nome: true,
            setor: true
          }
        },
        filial: {
          select: {
            nome: true
          }
        }
      }
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Voto registrado com sucesso!',
      voto: {
        id: novoVoto.id,
        candidato: novoVoto.candidato.nome,
        setor: novoVoto.candidato.setor,
        filial: novoVoto.filial.nome,
        dataHora: novoVoto.dataHora
      }
    });
  } catch (error) {
    // Se for erro de constraint única (tentativa de voto duplicado)
    if (error.code === 'P2002') {
      return res.status(409).json({
        sucesso: false,
        erro: 'Você já votou anteriormente'
      });
    }
    next(error);
  }
});

module.exports = router;