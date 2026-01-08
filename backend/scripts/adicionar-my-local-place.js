#!/usr/bin/env node
/**
 * Script para adicionar My Local Place ao portfolio com texto profissional
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

const MY_LOCAL_PLACE = {
  title: 'My Local Place',
  description: 'Local Infrastructure Platform for Developers',
  longDescription: `**O que resolve:** Plataforma Docker para padronizar e simplificar ambientes de desenvolvimento local.

**Como funciona:** Centraliza ferramentas de infraestrutura (PostgreSQL, Redis, Kafka, Ollama, etc.) em um ambiente único, observável e reproduzível. Dashboard operacional para gerenciar containers, monitorar recursos e inspecionar logs.

**Diferencial:** Evoluído de necessidades reais de uso diário. 92.28% de cobertura de testes. Pensamento de plataforma focado em Developer Experience, não apenas Docker. Demonstra capacidade de resolver problemas de infraestrutura local com soluções práticas e extensíveis.

**Stack:** Docker, Docker Compose, Python, FastAPI, React, TypeScript, Observability, DevEx`,
  technologies: ['Docker', 'Docker Compose', 'Python', 'FastAPI', 'React', 'TypeScript', 'DevEx', 'Observability'],
  githubUrl: 'https://github.com/LucasBiason/my-local-place',
  category: 'api',
  categoryLabel: 'DevTools & Automação',
  featured: true,
  order: 1,
  imageUrl: JSON.stringify(['/assets/projects/my-local-place.png']),
};

async function main() {
  console.log('🚀 Adicionando My Local Place ao portfolio...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado.');
      return;
    }

    const existing = await prisma.project.findFirst({
      where: {
        userId: user.id,
        title: MY_LOCAL_PLACE.title,
      },
    });

    if (existing) {
      await prisma.project.update({
        where: { id: existing.id },
        data: MY_LOCAL_PLACE,
      });
      console.log('   ✅ My Local Place atualizado');
    } else {
      await prisma.project.create({
        data: {
          userId: user.id,
          ...MY_LOCAL_PLACE,
        },
      });
      console.log('   ✅ My Local Place criado');
    }

    console.log();
    console.log('🎉 My Local Place adicionado ao portfolio!');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
