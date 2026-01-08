#!/usr/bin/env node
/**
 * Script CRÍTICO para corrigir portfolio baseado em feedback de instrutor sênior.
 * 
 * 1. Remover ArchThreat Analyzer (guardar info para depois)
 * 2. Adicionar My Local Place com narrativa
 * 3. Melhorar textos (mais concisos, escaneáveis)
 * 4. Verificar/corrigir foto
 * 5. Adicionar screenshots aos projetos
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

// Info do ArchThreat para guardar (será adicionado depois)
const ARCHTHREAT_INFO = {
  title: 'ArchThreat Analyzer',
  description: 'AI-Powered Threat Modeling Platform (STRIDE)',
  longDescription: `Plataforma de modelagem de ameaças assistida por Inteligência Artificial, projetada para apoiar engenheiros de software e arquitetos na identificação sistemática de riscos de segurança em sistemas distribuídos.

**Problema:** Processos tradicionais de threat modeling costumam ser manuais, demorados, dependentes de especialistas em segurança e difíceis de escalar em times ágeis.

**Solução:** Sistema que combina modelagem de ameaças baseada em STRIDE com análise semântica via LLMs, permitindo analisar descrições arquiteturais e gerar potenciais ameaças, riscos e recomendações de mitigação de forma automatizada. A IA atua como assistente, não como decisora final, reforçando boas práticas e permitindo revisão humana.

**Stack:** Python, FastAPI, PostgreSQL, Docker, React, TypeScript, LLMs

**Impacto:** Redução do custo cognitivo e operacional da modelagem de ameaças, manutenção de aderência a boas práticas de segurança, escalabilidade para times ágeis, demonstra pensamento arquitetural e uso responsável de IA`,
  technologies: ['Python', 'FastAPI', 'PostgreSQL', 'Docker', 'React', 'TypeScript', 'LLMs', 'STRIDE'],
  githubUrl: 'https://github.com/LucasBiason/threat-modeling-ai',
  category: 'api',
  categoryLabel: 'Backend & IA',
};

// My Local Place - Narrativa profissional e concisa
const MY_LOCAL_PLACE = {
  title: 'My Local Place',
  description: 'Dashboard para gerenciamento de containers Docker locais',
  longDescription: `Sistema de gerenciamento de containers Docker para ambiente de desenvolvimento local.

**Contexto:** Necessidade de ferramentas que eu precisava instalar de forma fácil e que uso todo dia. Evolução de comandos num arquivo texto que eu copiava manualmente.

**Problema:** Gerenciar múltiplos serviços Docker (Postgres, Redis, MongoDB, etc.) era manual e trabalhoso. Cada projeto tinha comandos diferentes e não havia visibilidade centralizada do que estava rodando.

**Solução:** Dashboard web completo com API REST para gerenciar containers Docker, monitorar recursos em tempo real e automatizar inicialização de serviços. Sistema permite start/stop/restart, visualização de logs e métricas de CPU/RAM por container.

**Stack:** Python, FastAPI, React, TypeScript, Docker, TailwindCSS

**Impacto:** Economia de tempo diária significativa, automação de processos manuais, conhecimento inicial de Docker consolidado em ferramenta real de uso diário`,
  technologies: ['Python', 'FastAPI', 'React', 'TypeScript', 'Docker', 'TailwindCSS'],
  githubUrl: 'https://github.com/LucasBiason/my-local-place',
  category: 'api',
  categoryLabel: 'DevTools & Automação',
  featured: true,
  order: 1,
  imageUrl: JSON.stringify(['/assets/projects/my-local-place.png']),
};

// Projetos atualizados com textos mais concisos e escaneáveis
const PROJETOS_MELHORADOS = [
  {
    title: 'ML Sales Forecasting',
    description: 'Sistema de previsão de preços de imóveis em produção',
    longDescription: `**O que resolve:** Previsão de preços de imóveis no Reino Unido via API REST.

**Como funciona:** Modelo Random Forest encapsulado em serviço backend FastAPI. Previsões padronizadas e facilmente consumidas por outros sistemas.

**Diferencial:** Foco em produção, não apenas modelo. Sistema pronto para uso real com validação, versionamento e deploy automatizado.

**Stack:** Python, FastAPI, Scikit-learn, Docker, React`,
    technologies: ['Python', 'FastAPI', 'Scikit-learn', 'Docker', 'React'],
    category: 'ml',
    categoryLabel: 'Machine Learning',
    featured: true,
    order: 2,
    githubUrl: 'https://github.com/LucasBiason/ml-sales-forecasting',
    imageUrl: JSON.stringify([
      '/assets/projects/ml-sales-forecasting-1.png',
      '/assets/projects/ml-sales-forecasting-2.png',
    ]),
  },
  {
    title: 'ML Spam Classifier API',
    description: 'API de classificação de emails (spam/ham)',
    longDescription: `**O que resolve:** Classificação automática de emails em spam ou ham.

**Como funciona:** API REST com modelo SVM (LinearSVC) e vetorização TF-IDF. Validação rigorosa de entradas e respostas determinísticas.

**Diferencial:** Arquitetura preparada para evolução do modelo sem quebrar consumidores. Testes automatizados com 98.92% de cobertura.

**Stack:** Python, FastAPI, Scikit-learn, Docker, React`,
    technologies: ['Python', 'FastAPI', 'Scikit-learn', 'Docker', 'React', 'SVM'],
    category: 'ml',
    categoryLabel: 'Machine Learning',
    featured: true,
    order: 3,
    githubUrl: 'https://github.com/LucasBiason/ml-spam-classifier-api',
    imageUrl: JSON.stringify([
      '/assets/projects/ml-spam-classifier-ham.png',
      '/assets/projects/ml-spam-classifier-spam.png',
    ]),
  },
];

async function main() {
  console.log('🔧 CORREÇÕES CRÍTICAS DO PORTFOLIO');
  console.log('📋 Baseado em feedback de instrutor sênior\n');

  try {
    const user = await prisma.user.findFirst({
      where: { email: DEFAULT_EMAIL },
    });

    if (!user) {
      console.log('❌ Usuário não encontrado.');
      return;
    }

    // 1. Remover ArchThreat Analyzer
    console.log('1️⃣ Removendo ArchThreat Analyzer (guardando info para depois)...');
    const archThreat = await prisma.project.findFirst({
      where: {
        userId: user.id,
        title: ARCHTHREAT_INFO.title,
      },
    });

    if (archThreat) {
      await prisma.project.delete({
        where: { id: archThreat.id },
      });
      console.log('   ✅ ArchThreat removido (info salva para adicionar depois)');
    } else {
      console.log('   ℹ️  ArchThreat não encontrado (já foi removido?)');
    }

    // 2. Adicionar/Atualizar My Local Place
    console.log('\n2️⃣ Adicionando My Local Place...');
    const existingMyLocalPlace = await prisma.project.findFirst({
      where: {
        userId: user.id,
        title: MY_LOCAL_PLACE.title,
      },
    });

    if (existingMyLocalPlace) {
      await prisma.project.update({
        where: { id: existingMyLocalPlace.id },
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

    // 3. Atualizar projetos existentes com textos mais concisos
    console.log('\n3️⃣ Atualizando projetos com textos mais concisos...');
    for (const projetoData of PROJETOS_MELHORADOS) {
      const existing = await prisma.project.findFirst({
        where: {
          userId: user.id,
          title: projetoData.title,
        },
      });

      if (existing) {
        await prisma.project.update({
          where: { id: existing.id },
          data: {
            description: projetoData.description,
            longDescription: projetoData.longDescription,
            technologies: projetoData.technologies,
            category: projetoData.category,
            categoryLabel: projetoData.categoryLabel,
            featured: projetoData.featured,
            order: projetoData.order,
            githubUrl: projetoData.githubUrl,
            imageUrl: projetoData.imageUrl,
          },
        });
        console.log(`   ✅ ${projetoData.title} atualizado`);
      } else {
        await prisma.project.create({
          data: {
            userId: user.id,
            ...projetoData,
          },
        });
        console.log(`   ✅ ${projetoData.title} criado`);
      }
    }

    // 4. Verificar/Corrigir foto do perfil
    console.log('\n4️⃣ Verificando/Corrigindo foto do perfil...');
    const profile = await prisma.profile.findUnique({
      where: { userId: user.id },
    });

    if (profile) {
      if (!profile.avatarUrl || profile.avatarUrl !== '/assets/img/avatar.jpg') {
        // Atualiza para o caminho correto
        await prisma.profile.update({
          where: { userId: user.id },
          data: {
            avatarUrl: '/assets/img/avatar.jpg',
          },
        });
        console.log('   ✅ Foto atualizada para /assets/img/avatar.jpg');
      } else {
        console.log(`   ✅ Foto já configurada: ${profile.avatarUrl}`);
      }
    }

    console.log('\n🎉 Correções aplicadas!');
    console.log('\n📋 Próximos passos:');
    console.log('   1. Adicione screenshots em backend/public/assets/projects/');
    console.log('   2. Adicione foto em backend/public/assets/img/avatar.jpg');
    console.log('   3. Recarregue o frontend (F5)');
    console.log('   4. Verifique se a experiência está oculta no frontend');

  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();

