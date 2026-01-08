#!/usr/bin/env node
/**
 * Script para atualizar projetos do portfolio com narrativas profissionais
 * baseadas no feedback estratégico (problema → solução → impacto).
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

// Projetos com narrativas profissionais baseadas no feedback
const PROJECTS = [
  {
    title: 'ArchThreat Analyzer',
    description: 'AI-Powered Threat Modeling Platform (STRIDE)',
    longDescription: `Plataforma de modelagem de ameaças assistida por Inteligência Artificial, projetada para apoiar engenheiros de software e arquitetos na identificação sistemática de riscos de segurança em sistemas distribuídos.

**Problema:**
Processos tradicionais de threat modeling costumam ser manuais, demorados, dependentes de especialistas em segurança e difíceis de escalar em times ágeis.

**Solução:**
Sistema que combina modelagem de ameaças baseada em STRIDE com análise semântica via LLMs, permitindo analisar descrições arquiteturais e gerar potenciais ameaças, riscos e recomendações de mitigação de forma automatizada. A IA atua como assistente, não como decisora final, reforçando boas práticas e permitindo revisão humana.

**Stack:**
Python, FastAPI, PostgreSQL, Docker, React, TypeScript, LLMs

**Impacto:**
- Redução do custo cognitivo e operacional da modelagem de ameaças
- Manutenção de aderência a boas práticas de segurança
- Escalabilidade para times ágeis
- Demonstra pensamento arquitetural e uso responsável de IA`,
    technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React', 'TypeScript', 'LLMs', 'STRIDE'],
    category: 'api',
    categoryLabel: 'Backend & IA',
    featured: true,
    order: 1,
    githubUrl: 'https://github.com/LucasBiason/threat-modeling-ai',
  },
  {
    title: 'ML Sales Forecasting',
    description: 'Production-Ready Forecasting System for Real Estate Prices',
    longDescription: `Sistema de previsão de preços de imóveis em produção, desenvolvido para apoiar tomada de decisão baseada em dados no mercado imobiliário do Reino Unido.

**Problema:**
Soluções tradicionais de previsão costumam falhar quando modelos são difíceis de atualizar, não há padronização de entrada/saída, previsões não são facilmente consumidas por outros sistemas e o processo de deploy é manual e frágil.

**Solução:**
Sistema completo que expõe previsões via API REST, encapsula o modelo de ML em um serviço backend, garante validação e padronização de dados, e permite fácil evolução do modelo sem quebrar consumidores. O modelo utiliza Random Forest, escolhido por equilíbrio entre performance, interpretabilidade e custo computacional.

**Stack:**
Python, FastAPI, Scikit-learn, Docker, React

**Impacto:**
- Previsões confiáveis e facilmente consumidas por outros sistemas
- Processo de deploy automatizado e reprodutível
- Facilidade para atualizar modelo sem impacto nos consumidores
- Demonstra capacidade de levar ML para produção com engenharia sólida`,
    technologies: ['Python', 'FastAPI', 'Scikit-learn', 'Docker', 'React', 'Machine Learning'],
    category: 'ml',
    categoryLabel: 'Machine Learning',
    featured: true,
    order: 2,
    githubUrl: 'https://github.com/LucasBiason/ml-sales-forecasting',
  },
  {
    title: 'ML Spam Classifier API',
    description: 'Email Classification Service',
    longDescription: `API backend para classificação de emails (spam/ham), estruturada para ser facilmente integrada a outros sistemas.

**Problema:**
Sistemas de classificação de emails costumam ser difíceis de integrar, não têm validação adequada de entradas e não são preparados para evolução do modelo.

**Solução:**
API REST com validação rigorosa de entradas, modelo isolado da camada web, arquitetura preparada para evolução e respostas determinísticas. O sistema utiliza SVM (LinearSVC) com vetorização TF-IDF, garantindo alta precisão e performance.

**Stack:**
Python, FastAPI, Scikit-learn, Docker, React

**Impacto:**
- Classificação confiável e facilmente integrada
- Arquitetura preparada para evolução do modelo
- Validação e tratamento de erros robustos
- Demonstra engenharia sólida em projeto clássico`,
    technologies: ['Python', 'FastAPI', 'Scikit-learn', 'Docker', 'React', 'SVM'],
    category: 'ml',
    categoryLabel: 'Machine Learning',
    featured: true,
    order: 3,
    githubUrl: 'https://github.com/LucasBiason/ml-spam-classifier-api',
  },
];

async function updateProjects() {
  console.log('📝 Atualizando projetos do portfolio...');
  console.log();

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado.');
      return false;
    }

    for (const projectData of PROJECTS) {
      // Verifica se projeto já existe
      const existing = await prisma.project.findFirst({
        where: {
          userId: user.id,
          title: projectData.title,
        },
      });

      if (existing) {
        // Atualiza projeto existente
        await prisma.project.update({
          where: { id: existing.id },
          data: {
            description: projectData.description,
            longDescription: projectData.longDescription,
            technologies: projectData.technologies,
            category: projectData.category,
            categoryLabel: projectData.categoryLabel,
            featured: projectData.featured,
            order: projectData.order,
            githubUrl: projectData.githubUrl,
          },
        });
        console.log(`  ✅ Projeto '${projectData.title}' atualizado`);
      } else {
        // Cria novo projeto
        await prisma.project.create({
          data: {
            userId: user.id,
            ...projectData,
          },
        });
        console.log(`  ✅ Projeto '${projectData.title}' criado`);
      }
    }

    console.log();
    console.log('✅ Projetos atualizados com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar projetos:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Atualizando projetos do portfolio...');
  console.log(`📧 Email: ${DEFAULT_EMAIL}`);
  console.log();

  try {
    await updateProjects();
    console.log();
    console.log('🎉 Atualização concluída!');
    console.log();
    console.log('📋 Próximos passos:');
    console.log('   1. Recarregue o frontend (F5)');
    console.log('   2. Verifique os projetos atualizados');
    console.log('   3. Adicione screenshots se necessário');
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

