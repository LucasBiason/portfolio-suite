#!/usr/bin/env node
/**
 * Script para melhorar textos do About - mais escaneáveis e menos densos
 */

const { PrismaClient } = require('@prisma/client');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://portfolio:portfolio@localhost:5433/portfolio?schema=public';
const DEFAULT_EMAIL = process.env.PORTFOLIO_DEFAULT_EMAIL || 'lucas.biason@foxcodesoftware.com';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// Bio melhorada - mais escaneável, menos densa
const BIO_MELHORADA = `Sou desenvolvedor backend sênior com forte atuação em Python, FastAPI e Django, especializado em transformar regras de negócio complexas em sistemas confiáveis e fáceis de evoluir.

Tenho experiência tanto na criação de novas soluções quanto na manutenção e modernização de sistemas críticos em produção, sempre priorizando boas práticas de engenharia, testes automatizados e arquitetura sustentável.

Nos últimos projetos, venho trabalhando com IA, Machine Learning e LLMs aplicados a problemas reais, sempre com foco em produção — não apenas experimentação.

Estou aberto a oportunidades no Brasil e internacionais, especialmente em ambientes que valorizam engenharia sólida e tomada de decisão técnica madura.`;

// Highlights melhorados - mais diretos
const HIGHLIGHTS_MELHORADOS = [
  '10+ anos construindo sistemas backend robustos',
  'Especialista em Python (FastAPI, Django)',
  'APIs escaláveis e integrações',
  'IA/ML/LLMs aplicados em produção',
  'Testes automatizados e código limpo',
  'Aberto a oportunidades Brasil e internacionais',
];

async function main() {
  console.log('📝 Melhorando textos do About...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado.');
      return;
    }

    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        bio: BIO_MELHORADA,
        highlights: HIGHLIGHTS_MELHORADOS,
      },
    });

    console.log('✅ Textos do About melhorados!');
    console.log('   - Bio mais escaneável e menos densa');
    console.log('   - Highlights mais diretos');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

