#!/usr/bin/env node
/**
 * Script para criar usuário padrão no portfolio.
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://portfolio:portfolio@localhost:5433/portfolio?schema=public';
const DEFAULT_EMAIL = process.env.PORTFOLIO_DEFAULT_EMAIL || 'lucas.biason@foxcodesoftware.com';
const DEFAULT_PASSWORD = process.env.PORTFOLIO_DEFAULT_PASSWORD || 'Portfolio2025Secure!';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🚀 Criando usuário padrão no portfolio...');
  console.log(`📧 Email: ${DEFAULT_EMAIL}`);
  console.log();

  try {
    // Verifica se usuário já existe
    let user = await prisma.user.findUnique({
      where: { email: DEFAULT_EMAIL },
    });

    if (user) {
      console.log('✅ Usuário já existe!');
      console.log(`   ID: ${user.id}`);
      console.log(`   Nome: ${user.displayName}`);
    } else {
      // Cria hash da senha
      const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

      // Cria usuário
      user = await prisma.user.create({
        data: {
          email: DEFAULT_EMAIL,
          passwordHash,
          displayName: 'Lucas Biason',
          slug: 'lucas-biason',
          active: true,
        },
      });

      console.log('✅ Usuário criado!');
      console.log(`   ID: ${user.id}`);
    }

    // Verifica se perfil já existe
    let profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (profile) {
      console.log('✅ Perfil já existe!');
    } else {
      // Cria perfil básico
      profile = await prisma.profile.create({
        data: {
          userId: user.id,
          title: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
          subtitle: 'Backend Engineer | APIs, Microservices & Automation',
          bio: `Mais de 10 anos de experiência construindo sistemas robustos, integrados e orientados a impacto real no negócio.

Trabalho principalmente com Python (Django, FastAPI), focando em regras de negócio complexas, automação de processos e integração entre sistemas.

Minha abordagem prioriza código limpo, testes automatizados e arquitetura sustentável para garantir que o software realmente resolva problemas e seja fácil de evoluir.`,
          highlights: [
            '10+ anos de experiência em backend',
            'Especialista em Python (Django, FastAPI)',
            'Arquitetura de APIs escaláveis',
            'Automação de processos e integrações',
            'Código limpo e testes automatizados',
            'Manutenção e evolução de sistemas legados',
          ],
          seoTitle: 'Lucas Biason | Senior Backend Engineer - Python, APIs & Automation',
          seoDescription:
            'Senior Backend Engineer com 10+ anos de experiência em Python, Django, FastAPI, APIs escaláveis e automação de processos. Especialista em construir sistemas robustos que resolvem problemas reais.',
          sectionProjectsTitle: 'Projetos em Destaque',
          sectionProjectsSubtitle: 'Sistemas que resolvem problemas reais com arquitetura sólida e código limpo',
          footerTitle: 'Lucas Biason',
          footerDescription: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
          footerTagline: 'Transformando regras de negócio complexas em sistemas confiáveis',
        },
      });

      console.log('✅ Perfil criado!');
    }

    // Cria contatos sociais se não existirem
    const contactsCount = await prisma.contactInfo.count({
      where: { userId: user.id },
    });

    if (contactsCount === 0) {
      await prisma.contactInfo.createMany({
        data: [
          {
            userId: user.id,
            title: 'GitHub',
            value: 'github.com/LucasBiason',
            href: 'https://github.com/LucasBiason',
            icon: 'bxl-github',
            type: 'social',
            order: 1,
          },
          {
            userId: user.id,
            title: 'LinkedIn',
            value: 'linkedin.com/in/lucas-biason',
            href: 'https://linkedin.com/in/lucas-biason',
            icon: 'bxl-linkedin',
            type: 'social',
            order: 2,
          },
          {
            userId: user.id,
            title: 'Email',
            value: DEFAULT_EMAIL,
            href: `mailto:${DEFAULT_EMAIL}`,
            icon: 'bx-envelope',
            type: 'email',
            order: 3,
          },
        ],
      });

      console.log('✅ Contatos sociais criados!');
    } else {
      console.log(`✅ Contatos sociais já existem (${contactsCount})`);
    }

    console.log();
    console.log('🎉 Usuário padrão configurado com sucesso!');
    console.log();
    console.log('📋 Próximos passos:');
    console.log('   1. Recarregue o frontend (F5)');
    console.log('   2. Os erros devem desaparecer');
    console.log('   3. Você pode adicionar projetos via API');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

