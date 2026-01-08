#!/usr/bin/env node
/**
 * Script para corrigir foto do perfil e garantir que serviços existam
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

const SERVICES = [
  {
    title: 'IA/ML/LLMs aplicados em produção',
    description: 'Sistemas de Machine Learning e IA prontos para produção, não apenas experimentação.',
    icon: 'bx-brain',
    order: 1,
  },
  {
    title: 'Testes automatizados e código limpo',
    description: 'Engenharia de software com foco em qualidade, manutenibilidade e boas práticas.',
    icon: 'bx-code-alt',
    order: 2,
  },
  {
    title: 'Aberto a oportunidades Brasil e internacionais',
    description: 'Disponível para projetos remotos e presenciais, com foco em engenharia sólida.',
    icon: 'bx-world',
    order: 3,
  },
];

async function main() {
  console.log('🔧 Corrigindo foto e serviços...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado.');
      return;
    }

    // Corrigir foto do perfil
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (profile) {
      await prisma.profile.update({
        where: { userId: user.id },
        data: {
          avatarUrl: '/assets/img/avatar.jpg',
        },
      });
      console.log('   ✅ Foto do perfil corrigida: /assets/img/avatar.jpg');
    }

    // Garantir que serviços existam
    for (const serviceData of SERVICES) {
      const existing = await prisma.service.findFirst({
        where: {
          userId: user.id,
          title: serviceData.title,
        },
      });

      if (existing) {
        await prisma.service.update({
          where: { id: existing.id },
          data: serviceData,
        });
        console.log(`   ✅ Serviço atualizado: ${serviceData.title}`);
      } else {
        await prisma.service.create({
          data: {
            userId: user.id,
            ...serviceData,
          },
        });
        console.log(`   ✅ Serviço criado: ${serviceData.title}`);
      }
    }

    console.log();
    console.log('🎉 Correções aplicadas!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

