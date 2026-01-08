#!/usr/bin/env node
/**
 * Script para atualizar textos do portfolio com base no feedback estratégico recebido.
 * Reposiciona o portfolio como Senior Backend Engineer focado em sistemas inteligentes.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://portfolio:portfolio@localhost:5433/portfolio?schema=public';
const DEFAULT_EMAIL = process.env.PORTFOLIO_DEFAULT_EMAIL || 'lucas.biason@foxcodesoftware.com';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// Novos textos baseados no feedback estratégico
const PROFILE_UPDATES = {
  title: 'Senior Backend Engineer | Python, APIs & Intelligent Systems',
  subtitle: 'Backend Engineer | APIs, Microservices & Automation',
  bio: `Mais de 10 anos de experiência construindo sistemas backend robustos, APIs escaláveis e soluções orientadas a dados, com foco em qualidade, segurança e impacto real no negócio.

Trabalho principalmente com Python (Django, FastAPI), especializado em transformar regras de negócio complexas em sistemas confiáveis e fáceis de evoluir.

Nos últimos projetos, venho trabalhando com IA, Machine Learning e LLMs aplicados a problemas reais, sempre com foco em produção — não apenas experimentação.`,
  seoTitle: 'Lucas Biason | Senior Backend Engineer - Python, APIs & Intelligent Systems',
  seoDescription:
    'Senior Backend Engineer com 10+ anos de experiência em Python, FastAPI, Django, APIs escaláveis e sistemas inteligentes (IA/ML/LLMs). Especialista em levar soluções de IA para produção com engenharia sólida.',
  sectionProjectsTitle: 'Projetos em Destaque',
  sectionProjectsSubtitle: 'Sistemas que resolvem problemas reais com arquitetura sólida e código limpo',
  footerTitle: 'Lucas Biason',
  footerDescription: 'Senior Backend Engineer especializado em Python, APIs e sistemas inteligentes',
  footerTagline: 'Transformando regras de negócio complexas em sistemas confiáveis',
  highlights: [
    '10+ anos construindo sistemas backend robustos',
    'Especialista em Python (Django, FastAPI)',
    'APIs escaláveis e integrações',
    'IA/ML/LLMs aplicados a problemas reais',
    'Foco em produção, não apenas experimentação',
    'Código limpo e arquitetura sustentável',
  ],
};

const ABOUT_UPDATES = {
  title: 'Sobre Mim',
  subtitle: 'Desenvolvedor Backend Senior com foco em impacto e qualidade',
  description: `Sou desenvolvedor backend sênior com forte atuação em Python, FastAPI e Django, especializado em transformar regras de negócio complexas em sistemas confiáveis e fáceis de evoluir.

Tenho experiência tanto na criação de novas soluções quanto na manutenção e modernização de sistemas críticos em produção, sempre priorizando boas práticas de engenharia, testes automatizados e arquitetura sustentável.`,
  description2: `Nos últimos projetos, venho trabalhando com IA, Machine Learning e LLMs aplicados a problemas reais, sempre com foco em produção — não apenas experimentação.

Estou aberto a oportunidades no Brasil e internacionais, especialmente em ambientes que valorizam engenharia sólida e tomada de decisão técnica madura.`,
  highlights: [
    '10+ anos construindo sistemas backend robustos',
    'Especialista em transformar regras de negócio complexas em código',
    'Experiência em APIs REST, microserviços e integrações',
    'IA/ML/LLMs aplicados a problemas reais em produção',
    'Foco em qualidade: testes automatizados e código limpo',
    'Colaboração com times multidisciplinares',
    'Aberto a oportunidades Brasil e internacionais',
  ],
};

async function updateProfile() {
  console.log('📝 Atualizando perfil com novos textos estratégicos...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado. Execute criar-usuario-padrao.js primeiro.');
      return false;
    }

    const { highlights, ...profileData } = PROFILE_UPDATES;

    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        ...profileData,
        highlights,
      },
    });

    console.log('✅ Perfil atualizado!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar perfil:', error.message);
    return false;
  }
}

async function updateAbout() {
  console.log('📝 Atualizando seção About...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      return false;
    }

    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return false;
    }

    // A seção About usa campos do Profile
    // Atualizamos apenas os campos relevantes mantendo o resto
    await prisma.profile.update({
      where: { userId: user.id },
      data: {
        subtitle: ABOUT_UPDATES.subtitle,
        bio: `${ABOUT_UPDATES.description}\n\n${ABOUT_UPDATES.description2}`,
        highlights: ABOUT_UPDATES.highlights,
      },
    });

    console.log('✅ Seção About atualizada!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar About:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Atualizando textos do portfolio com base no feedback estratégico...');
  console.log(`📧 Email: ${DEFAULT_EMAIL}`);
  console.log();

  try {
    await updateProfile();
    console.log();
    await updateAbout();
    console.log();

    console.log('🎉 Atualização concluída!');
    console.log();
    console.log('📋 Próximos passos:');
    console.log('   1. Recarregue o frontend (F5)');
    console.log('   2. Verifique os novos textos');
    console.log('   3. Atualize os projetos com as narrativas sugeridas');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

