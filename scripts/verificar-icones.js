#!/usr/bin/env node

// Script para verificar se todos os ícones usados no projeto existem
// Execute: node scripts/verificar-icones.js

const fs = require('fs');
const path = require('path');

// Lista de ícones que sabemos que existem no react-icons/fa
const iconesValidos = [
  // Navegação
  'FaHome', 'FaArrowRight', 'FaArrowLeft', 'FaArrowUp', 'FaArrowDown',
  
  // Usuários e pessoas
  'FaUser', 'FaUsers', 'FaUserPlus', 'FaUserEdit', 'FaUserTimes',
  
  // Sistema e configuração
  'FaCog', 'FaCogs', 'FaWrench', 'FaTools', 'FaSync', 'FaRedo', 'FaUndo',
  
  // Votação e eleição
  'FaVoteYea', 'FaTrophy', 'FaMedal', 'FaAward', 'FaCheckCircle',
  
  // Interface
  'FaPlus', 'FaMinus', 'FaEdit', 'FaTrash', 'FaSave', 'FaTimes', 'FaCheck',
  'FaEye', 'FaEyeSlash', 'FaSearch', 'FaFilter', 'FaSort',
  
  // Dados e gráficos
  'FaChartBar', 'FaChartLine', 'FaChartPie', 'FaTable', 'FaList',
  
  // Arquivos e mídia
  'FaImage', 'FaFile', 'FaDownload', 'FaUpload', 'FaFileImage',
  
  // Estrutura
  'FaBuilding', 'FaIndustry', 'FaStore', 'FaWarehouse',
  
  // Identificação
  'FaIdCard', 'FaIdBadge', 'FaFingerprint',
  
  // Trabalho
  'FaBriefcase', 'FaHardHat', 'FaUserTie',
  
  // Status e alertas
  'FaExclamationTriangle', 'FaInfoCircle', 'FaTimesCircle', 'FaQuestionCircle',
  
  // Segurança
  'FaShieldAlt', 'FaLock', 'FaUnlock', 'FaKey'
];

// Ícones que NÃO existem (comuns de serem usados por engano)
const iconesInvalidos = [
  'FaRefresh',    // Use FaSync
  'FaReload',     // Use FaSync
  'FaRestart',    // Use FaRedo
  'FaUpdate',     // Use FaSync
  'FaSpin',       // Use FaSpinner
];

// Função para extrair ícones de um arquivo
function extrairIcones(conteudo) {
  const regex = /Fa[A-Za-z]+/g;
  const matches = conteudo.match(regex) || [];
  return [...new Set(matches)]; // Remove duplicatas
}

// Função para verificar arquivos recursivamente
function verificarDiretorio(dir, arquivosComIcones = []) {
  const arquivos = fs.readdirSync(dir);
  
  for (const arquivo of arquivos) {
    const caminhoCompleto = path.join(dir, arquivo);
    const stat = fs.statSync(caminhoCompleto);
    
    if (stat.isDirectory() && !arquivo.includes('node_modules') && !arquivo.includes('.git')) {
      verificarDiretorio(caminhoCompleto, arquivosComIcones);
    } else if (arquivo.endsWith('.jsx') || arquivo.endsWith('.js')) {
      const conteudo = fs.readFileSync(caminhoCompleto, 'utf8');
      if (conteudo.includes('react-icons/fa')) {
        const icones = extrairIcones(conteudo);
        if (icones.length > 0) {
          arquivosComIcones.push({
            arquivo: caminhoCompleto,
            icones: icones
          });
        }
      }
    }
  }
  
  return arquivosComIcones;
}

console.log('🔍 Verificando ícones do react-icons/fa no projeto...\n');

// Verificar diretório frontend/src
const diretorioFrontend = path.join(__dirname, '../frontend/src');

if (!fs.existsSync(diretorioFrontend)) {
  console.log('❌ Diretório frontend/src não encontrado');
  console.log('Execute este script na raiz do projeto');
  process.exit(1);
}

const arquivosComIcones = verificarDiretorio(diretorioFrontend);

let problemasEncontrados = false;

console.log('📄 Arquivos analisados:');
console.log('='.repeat(50));

for (const arquivo of arquivosComIcones) {
  const nomeArquivo = path.relative(diretorioFrontend, arquivo.arquivo);
  console.log(`\n📁 ${nomeArquivo}`);
  
  for (const icone of arquivo.icones) {
    if (iconesInvalidos.includes(icone)) {
      console.log(`   ❌ ${icone} - NÃO EXISTE`);
      problemasEncontrados = true;
      
      // Sugerir alternativas
      if (icone === 'FaRefresh') {
        console.log(`      💡 Use: FaSync ou FaRedo`);
      } else if (icone === 'FaReload') {
        console.log(`      💡 Use: FaSync`);
      } else {
        console.log(`      💡 Verificar documentação: https://react-icons.github.io/react-icons/icons?name=fa`);
      }
      
    } else if (iconesValidos.includes(icone)) {
      console.log(`   ✅ ${icone}`);
    } else {
      console.log(`   ⚠️  ${icone} - VERIFICAR (não na lista conhecida)`);
      console.log(`      💡 Confirmar em: https://react-icons.github.io/react-icons/icons?name=fa`);
    }
  }
}

console.log('\n' + '='.repeat(50));

if (problemasEncontrados) {
  console.log('❌ PROBLEMAS ENCONTRADOS!');
  console.log('\nÍcones que precisam ser corrigidos:');
  console.log('- FaRefresh → FaSync');
  console.log('- FaReload → FaSync');
  console.log('- FaRestart → FaRedo');
  process.exit(1);
} else {
  console.log('✅ Todos os ícones verificados estão corretos!');
  process.exit(0);
}