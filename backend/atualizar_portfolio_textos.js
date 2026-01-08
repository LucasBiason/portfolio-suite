#!/usr/bin/env node
/**
 * Script para atualizar textos do portfolio com base no feedback recebido.
 * Melhora headlines, descrições, SEO e narrativas dos projetos.
 */

require('dotenv').config({ path: require('path').join(__dirname, '../../Portfólio/portfolio-suite/backend/configs/.env') });

const { PrismaClient } = require('@prisma/client');
const path = require('path');

// Configura o caminho do Prisma schema
process.env.PRISMA_SCHEMA_PATH = path.join(__dirname, '../../Portfólio/portfolio-suite/backend/prisma/schema.prisma');

// Garante que DATABASE_URL está definido
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://portfolio:portfolio@localhost:5433/portfolio?schema=public';
process.env.DATABASE_URL = DATABASE_URL;

// Inicializa Prisma Client com DATABASE_URL explícito
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

// Configurações
const DEFAULT_EMAIL = process.env.PORTFOLIO_DEFAULT_EMAIL || 'lucas.biason@foxcodesoftware.com';

// Novos textos baseados no feedback
const PROFILE_UPDATES = {
  title: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
  subtitle: 'Backend Engineer | APIs, Microservices & Automation',
  bio: `Mais de 10 anos de experiência construindo sistemas robustos, integrados e orientados a impacto real no negócio.

Trabalho principalmente com Python (Django, FastAPI), focando em regras de negócio complexas, automação de processos e integração entre sistemas.

Minha abordagem prioriza código limpo, testes automatizados e arquitetura sustentável para garantir que o software realmente resolva problemas e seja fácil de evoluir.`,
  seoTitle: 'Lucas Biason | Senior Backend Engineer - Python, APIs & Automation',
  seoDescription:
    'Senior Backend Engineer com 10+ anos de experiência em Python, Django, FastAPI, APIs escaláveis e automação de processos. Especialista em construir sistemas robustos que resolvem problemas reais.',
  sectionProjectsTitle: 'Projetos em Destaque',
  sectionProjectsSubtitle: 'Sistemas que resolvem problemas reais com arquitetura sólida e código limpo',
  footerTitle: 'Lucas Biason',
  footerDescription: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
  footerTagline: 'Transformando regras de negócio complexas em sistemas confiáveis',
  highlights: [
    '10+ anos de experiência em backend',
    'Especialista em Python (Django, FastAPI)',
    'Arquitetura de APIs escaláveis',
    'Automação de processos e integrações',
    'Código limpo e testes automatizados',
    'Manutenção e evolução de sistemas legados',
  ],
};

const ABOUT_UPDATES = {
  title: 'Sobre Mim',
  subtitle: 'Desenvolvedor Backend Senior com foco em impacto e qualidade',
  description: `Sou desenvolvedor backend com mais de 10 anos de experiência, atuando principalmente com Python, Django e FastAPI.

Tenho forte foco em regras de negócio, automação de processos, integração entre sistemas e manutenção de aplicações críticas em produção.

Ao longo da carreira, trabalhei tanto na criação de novos sistemas quanto na evolução de soluções legadas, sempre priorizando código limpo, testes automatizados e arquitetura sustentável.`,
  description2: `Busco oportunidades onde possa contribuir tecnicamente, ajudar na tomada de decisões e construir software que realmente resolva problemas.

Minha abordagem é colaborativa e orientada a resultados, trabalhando com times multidisciplinares para entregar valor real ao negócio.`,
  highlights: [
    '10+ anos construindo sistemas robustos e escaláveis',
    'Especialista em transformar regras de negócio complexas em código',
    'Experiência em APIs REST, microserviços e integrações',
    'Foco em qualidade: testes automatizados e código limpo',
    'Colaboração com times multidisciplinares',
    'Aberto a oportunidades Brasil e internacionais',
  ],
};

async function updateProfile(userId) {
  console.log(`📝 Atualizando perfil do usuário ${userId}...`);

  try {
    const { highlights, ...profileData } = PROFILE_UPDATES;

    // Atualiza ou cria o perfil
    const profile = await prisma.profile.upsert({
      where: { userId },
      update: { ...profileData, highlights },
      create: {
        ...profileData,
        highlights,
        userId,
      },
    });

    console.log(`✅ Perfil atualizado com sucesso!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar perfil:`, error.message);
    return false;
  }
}

async function updateAboutSection(userId) {
  console.log(`📝 Atualizando seção About...`);

  try {
    const profile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      console.log(`❌ Perfil não encontrado. Execute updateProfile primeiro.`);
      return false;
    }

    // A seção About usa os campos do Profile (title, subtitle, bio, highlights)
    // Então atualizamos apenas os campos específicos do About
    await prisma.profile.update({
      where: { userId },
      data: {
        // Mantém o title como "Sobre Mim"
        subtitle: ABOUT_UPDATES.subtitle,
        bio: `${ABOUT_UPDATES.description}\n\n${ABOUT_UPDATES.description2}`,
        sectionProjectsSubtitle: ABOUT_UPDATES.sectionProjectsSubtitle || profile.sectionProjectsSubtitle,
        highlights: ABOUT_UPDATES.highlights,
      },
    });

    console.log(`✅ Seção About atualizada!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar About:`, error.message);
    return false;
  }
}

async function updateProjectNarratives(userId) {
  console.log(`📝 Atualizando narrativas dos projetos...`);

  try {
    const projects = await prisma.project.findMany({
      where: { userId },
      orderBy: { order: 'asc' },
    });

    if (!projects || projects.length === 0) {
      console.log(`⚠️  Nenhum projeto encontrado. Você pode adicionar projetos via API depois.`);
      return true;
    }

    console.log(`📦 Encontrados ${projects.length} projetos`);

    for (const project of projects) {
      const currentDesc = project.description || '';
      const currentLong = project.longDescription || '';

      // Se já tem longDescription boa, mantém; senão melhora
      if (!currentLong || currentLong.length < 100) {
        const techList =
          project.technologies && project.technologies.length > 0
            ? project.technologies.slice(0, 5).join(', ')
            : 'Python, APIs';

        const improvedLong = `${currentDesc}

Sistema backend desenvolvido com foco em escalabilidade, manutenibilidade e impacto real no negócio.

**Stack técnica:** ${techList}

**Características:**
- Arquitetura bem definida com separação de responsabilidades
- Testes automatizados para garantir qualidade
- Código limpo e documentado
- Pronto para escalar e evoluir`;

        await prisma.project.update({
          where: { id: project.id },
          data: { longDescription: improvedLong.trim() },
        });

        console.log(`  ✅ Projeto '${project.title}' atualizado`);
      } else {
        console.log(`  ⏭️  Projeto '${project.title}' já tem descrição completa, mantido como está`);
      }
    }

    console.log(`✅ Narrativas dos projetos atualizadas!`);
    return true;
  } catch (error) {
    console.error(`❌ Erro ao atualizar projetos:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Iniciando atualização de textos do portfolio...');
  console.log(`📧 Email padrão: ${DEFAULT_EMAIL}`);
  console.log();

  try {
    // Busca o usuário pelo email
    const user = await prisma.user.findUnique({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log(`❌ Usuário com email '${DEFAULT_EMAIL}' não encontrado!`);
      console.log(`   Crie o usuário primeiro via API ou script de seed.`);
      return;
    }

    console.log(`✅ Usuário encontrado: ${user.displayName} (${user.email})`);
    console.log();

    // Atualiza perfil
    await updateProfile(user.id);
    console.log();

    // Atualiza About
    await updateAboutSection(user.id);
    console.log();

    // Atualiza projetos
    await updateProjectNarratives(user.id);
    console.log();

    console.log('🎉 Atualização concluída!');
    console.log();
    console.log('📋 Próximos passos:');
    console.log('   1. Recarregue o frontend para ver as mudanças');
    console.log('   2. Revise os textos e ajuste conforme necessário');
    console.log('   3. Para projetos específicos, use a API ou edite manualmente no banco');
  } catch (error) {
    console.error(`❌ Erro:`, error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Erro fatal:', error);
  process.exit(1);
});

