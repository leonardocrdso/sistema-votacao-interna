const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar filiais
  const filiais = await Promise.all([
    prisma.filial.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        nome: 'LIVE! INDUSTRIAL'
      }
    }),
    prisma.filial.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        nome: 'LIVE! ROUPAS'
      }
    }),
    prisma.filial.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        nome: 'LIVE! TEXTIL'
      }
    }),
    prisma.filial.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        nome: 'FILIAL CISSA'
      }
    }),
    prisma.filial.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        nome: 'FILIAL CORUPÁ'
      }
    })
  ]);

  console.log('✅ Filiais criadas:', filiais.map(f => f.nome));

  // Criar candidatos de exemplo para cada filial
  const candidatos = [];

  // LIVE! INDUSTRIAL
  const candidatosIndustrial = await Promise.all([
    prisma.candidato.upsert({
      where: { id: 1 },
      update: {},
      create: {
        id: 1,
        filialId: 1,
        nome: 'Ana Silva Santos',
        setor: 'Produção',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    }),
    prisma.candidato.upsert({
      where: { id: 2 },
      update: {},
      create: {
        id: 2,
        filialId: 1,
        nome: 'Carlos Eduardo Lima',
        setor: 'Qualidade',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    }),
    prisma.candidato.upsert({
      where: { id: 3 },
      update: {},
      create: {
        id: 3,
        filialId: 1,
        nome: 'Mariana Costa Pereira',
        setor: 'Logística',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    })
  ]);

  // LIVE! ROUPAS
  const candidatosRoupas = await Promise.all([
    prisma.candidato.upsert({
      where: { id: 4 },
      update: {},
      create: {
        id: 4,
        filialId: 2,
        nome: 'João Pedro Oliveira',
        setor: 'Vendas',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    }),
    prisma.candidato.upsert({
      where: { id: 5 },
      update: {},
      create: {
        id: 5,
        filialId: 2,
        nome: 'Fernanda Rodrigues',
        setor: 'Marketing',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    })
  ]);

  // LIVE! TEXTIL
  const candidatosTextil = await Promise.all([
    prisma.candidato.upsert({
      where: { id: 6 },
      update: {},
      create: {
        id: 6,
        filialId: 3,
        nome: 'Roberto Silva Nunes',
        setor: 'Tecelagem',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    }),
    prisma.candidato.upsert({
      where: { id: 7 },
      update: {},
      create: {
        id: 7,
        filialId: 3,
        nome: 'Camila Fernandes',
        setor: 'Acabamento',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    })
  ]);

  // FILIAL CISSA
  const candidatosCissa = await Promise.all([
    prisma.candidato.upsert({
      where: { id: 8 },
      update: {},
      create: {
        id: 8,
        filialId: 4,
        nome: 'Paulo Henrique Sousa',
        setor: 'Administração',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    })
  ]);

  // FILIAL CORUPÁ
  const candidatosCorupa = await Promise.all([
    prisma.candidato.upsert({
      where: { id: 9 },
      update: {},
      create: {
        id: 9,
        filialId: 5,
        nome: 'Laura Beatriz Santos',
        setor: 'Recursos Humanos',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    }),
    prisma.candidato.upsert({
      where: { id: 10 },
      update: {},
      create: {
        id: 10,
        filialId: 5,
        nome: 'Diego Almeida Costa',
        setor: 'Financeiro',
        fotoUrl: '/uploads/placeholder.jpg'
      }
    })
  ]);

  candidatos.push(...candidatosIndustrial, ...candidatosRoupas, ...candidatosTextil, ...candidatosCissa, ...candidatosCorupa);

  console.log('✅ Candidatos criados:', candidatos.length);
  console.log('🎉 Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });