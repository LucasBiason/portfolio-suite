#!/usr/bin/env node
/**
 * Script para atualizar projetos finais do portfolio
 * Mantém apenas: My Local Place, ML Sales Forecasting, Knowledge Base
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

const PROJECTS = {
  'My Local Place': {
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
  },
  'ML Sales Forecasting': {
    title: 'ML Sales Forecasting',
    description: 'Production-Ready Forecasting System for Real Estate Prices',
    longDescription: `**O que resolve:** Sistema de previsão de preços de imóveis em produção, desenvolvido para apoiar tomada de decisão baseada em dados no mercado imobiliário do Reino Unido.

**Problema:** Soluções tradicionais de previsão costumam falhar quando modelos são difíceis de atualizar, não há padronização de entrada/saída, previsões não são facilmente consumidas por outros sistemas e o processo de deploy é manual e frágil.

**Solução:** Sistema completo que expõe previsões via API REST, encapsula o modelo de ML em um serviço backend, garante validação e padronização de dados, e permite fácil evolução do modelo sem quebrar consumidores. O modelo utiliza Random Forest, escolhido por equilíbrio entre performance, interpretabilidade e custo computacional.

**Stack:** Python, FastAPI, Scikit-learn, Docker, React

**Impacto:** Previsões confiáveis e facilmente consumidas por outros sistemas, processo de deploy automatizado e reprodutível, facilidade para atualizar modelo sem impacto nos consumidores, demonstra capacidade de levar ML para produção com engenharia sólida`,
    technologies: ['Python', 'FastAPI', 'Scikit-learn', 'Docker', 'React'],
    githubUrl: 'https://github.com/LucasBiason/ml-sales-forecasting',
    category: 'ml',
    categoryLabel: 'Machine Learning',
    featured: true,
    order: 2,
    imageUrl: JSON.stringify(['/assets/projects/ml-sales-forecasting.png']),
  },
  'Engineering Knowledge Base': {
    title: 'Engineering Knowledge Base',
    description: 'Curated Knowledge Platform for Software Engineering and AI Practices',
    longDescription: `**O que resolve:** Base de conhecimento curada e em evolução focada em engenharia de software, arquitetura backend e inteligência artificial aplicada.

**Como funciona:** Plataforma viva que consolida experiência do mundo real, melhores práticas e lições aprendidas de sistemas em produção. Organizada por domínios (arquitetura, IA, backend, DevOps) com exemplos práticos, decisões técnicas e quando usar/não usar cada abordagem.

**Diferencial:** Não é um laboratório ou caderno de estudos. É um projeto de disseminação de conhecimento que reflete maturidade técnica, capacidade de mentorar e contribuição para a comunidade. Demonstra pensamento arquitetural, boas práticas de engenharia e uso responsável de IA.

**Stack:** Markdown, Documentação, Exemplos Práticos, Arquitetura, IA/ML`,
    technologies: ['Documentation', 'Architecture', 'AI/ML', 'Best Practices', 'Software Engineering'],
    githubUrl: null, // Sem link GitHub por enquanto
    category: 'api',
    categoryLabel: 'Conhecimento & Documentação',
    featured: true,
    order: 3,
    imageUrl: JSON.stringify(['/assets/projects/knowledge-base.png']),
  },
};

async function main() {
  console.log('🚀 Atualizando projetos finais do portfolio...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado.');
      return;
    }

    // Remover projetos que não devem estar mais
    const projectsToRemove = ['ML Spam Classifier API', 'ArchThreat Analyzer'];
    for (const title of projectsToRemove) {
      const project = await prisma.project.findFirst({
        where: { userId: user.id, title },
      });
      if (project) {
        await prisma.project.delete({ where: { id: project.id } });
        console.log(`   ✅ Removido: ${title}`);
      }
    }

    // Atualizar/criar projetos finais
    for (const [key, projectData] of Object.entries(PROJECTS)) {
      const existing = await prisma.project.findFirst({
        where: {
          userId: user.id,
          title: projectData.title,
        },
      });

      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: projectData,
        });
        console.log(`   ✅ Atualizado: ${projectData.title}`);
      } else {
        await prisma.project.create({
          data: {
            userId: user.id,
            ...projectData,
          },
        });
        console.log(`   ✅ Criado: ${projectData.title}`);
      }
    }

    console.log();
    console.log('🎉 Projetos atualizados!');
    console.log('   • My Local Place (ordem 1)');
    console.log('   • ML Sales Forecasting (ordem 2)');
    console.log('   • Engineering Knowledge Base (ordem 3)');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

