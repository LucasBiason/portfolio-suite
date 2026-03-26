import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Dados do portfolio
  const userData = {
    id: '5fe28527-d681-419c-a65a-32b844a057f8',
    email: 'lucas.biason@foxcodesoftware.com',
    passwordHash: '$2b$10$k9En7UVNUbAqL/Iiliw9r.g2jFyrdhCYWGQ1ONuXmnZUTBsVkEaUS',
    displayName: 'Lucas Biason',
    slug: 'lucas-biason',
    active: true,
    createdAt: new Date('2026-01-09T12:20:47.613Z'),
    updatedAt: new Date('2026-01-09T12:20:47.613Z'),
  };

  const profileData = {
    id: 'e8481a73-3969-4f49-a477-c5d3b4925c83',
    userId: '5fe28527-d681-419c-a65a-32b844a057f8',
    title: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
    subtitle: 'Backend Engineer | APIs, Microservices & Automation',
    bio: 'Mais de 13 anos de experiência construindo sistemas robustos, integrados e orientados a impacto real no negócio.\n\nTrabalho principalmente com Python (Django, FastAPI), focando em regras de negócio complexas, automação de processos e integração entre sistemas.\n\nMinha abordagem prioriza código limpo, testes automatizados e arquitetura sustentável para garantir que o software realmente resolva problemas e seja fácil de evoluir.',
    highlights: [
      '13+ anos de experiência em backend',
      'Especialista em Python (Django, FastAPI)',
      'Arquitetura de APIs escaláveis',
      'Automação de processos e integrações',
      'Código limpo e testes automatizados',
      'Manutenção e evolução de sistemas legados',
    ],
    avatarUrl: 'http://localhost:3001/assets/img/avatar.jpg',
    heroBackgroundUrl: null,
    seoTitle: 'Lucas Biason | Senior Backend Engineer - Python, APIs & Automation',
    seoDescription: 'Senior Backend Engineer com 13+ anos de experiência em Python, Django, FastAPI, APIs escaláveis e automação de processos. Especialista em construir sistemas robustos que resolvem problemas reais.',
    footerTitle: 'Lucas Biason',
    footerDescription: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
    footerTagline: 'Transformando regras de negócio complexas em sistemas confiáveis',
    sectionProjectsTitle: 'Projetos em Destaque',
    sectionProjectsSubtitle: 'Sistemas que resolvem problemas reais com arquitetura sólida e código limpo',
    contactTitle: 'Vamos conversar',
    contactSubtitle: 'Precisa de ajuda com APIs, automação de processos ou integrações?',
    contactDescription: 'Fale um pouco sobre o contexto do projeto e como posso somar. Respondo com clareza sobre prazos, escopo e os próximos passos possíveis.',
    createdAt: new Date('2026-01-09T12:20:47.622Z'),
    updatedAt: new Date('2026-01-09T12:34:02.610Z'),
  };

  // Limpa dados existentes
  await prisma.projectStack.deleteMany();
  await prisma.projectCategory.deleteMany();
  await prisma.projectImage.deleteMany();
  await prisma.category.deleteMany();
  await prisma.careerDomain.deleteMany();
  await prisma.domain.deleteMany();
  await prisma.careerStack.deleteMany();
  await prisma.careerEntry.deleteMany();
  await prisma.stackDetail.deleteMany();
  await prisma.contactInfo.deleteMany();
  await prisma.experience.deleteMany();
  await prisma.service.deleteMany();
  await prisma.project.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.user.deleteMany();

  // Cria user
  const user = await prisma.user.create({ data: userData });
  console.log('✅ User criado:', user.email);

  // Cria profile
  const profile = await prisma.profile.create({ data: profileData });
  console.log('✅ Profile criado:', profile.id);

  // =============================================
  // PROJETOS EM DESTAQUE
  // =============================================
  const projectsData = [
    {
      userId: user.id,
      title: 'FIAP Tech Challenge - Fase 05: Threat Modeling AI (90/90)',
      description: 'Sistema de análise automatizada de ameaças em arquiteturas cloud com pipeline 100% LLM: extração de componentes via Vision, identificação STRIDE com RAG, pontuação DREAD e relatório de mitigações.',
      longDescription:
        '**Nota:** 90/90 (Nota Máxima)\n\n**Contexto:** Projeto final e mais complexo da pós-graduação em IA da FIAP. Arquitetura completa de microsserviços com frontend React, backend FastAPI e pipeline de IA multimodal.\n\n**O que resolve:** A partir do upload de um diagrama de arquitetura cloud, gera automaticamente um relatório completo de ameaças (STRIDE), priorização de riscos (DREAD) e recomendações de mitigação.\n\n**Pipeline (100% LLM):** Upload do diagrama -> Guardrail (validação se é diagrama) -> DiagramAgent (extração de componentes e conexões via LLM Vision) -> StrideAgent (identificação de ameaças por componente, enriquecido com RAG via ChromaDB) -> DreadAgent (pontuação de risco) -> Relatório agregado (LOW/MEDIUM/HIGH/CRITICAL).\n\n**Arquitetura:** 6 containers Docker: threat-frontend (React 18 + Vite + Tailwind + Framer Motion), threat-service (FastAPI - API REST e uploads), threat-analyzer (FastAPI - pipeline LLM), Celery Worker + Beat (processamento assíncrono), PostgreSQL, Redis, Nginx.\n\n**Diferenciais:** Fallback automático entre provedores LLM (Gemini -> OpenAI -> Ollama), notificações em tempo real, interface profissional com dark theme, análise assíncrona, documentação completa (specs, ADRs, manual do usuário, Postman collections).',
      technologies: ['Python', 'FastAPI', 'React 18', 'Tailwind', 'STRIDE', 'DREAD', 'LangChain', 'ChromaDB', 'RAG', 'Celery', 'Redis', 'PostgreSQL', 'Docker', 'Nginx'],
      githubUrl: 'https://github.com/LucasBiason/threat-modeling-ai',
      demoUrl: 'https://lucasbiason.com/threat-modeling-ai/',
      imageUrl: null,
      featured: true,
      order: 2,
    },
    {
      userId: user.id,
      title: 'Fullcycle Semantic Search (RAG)',
      description: 'Pipeline completo de busca semântica com RAG: embeddings OpenAI, armazenamento pgvector, retrieval e geração de respostas contextualizadas.',
      longDescription:
        '**O que resolve:** Busca inteligente em documentos usando linguagem natural, com respostas contextualizadas baseadas no conteúdo indexado.\n\n**Como funciona:** Upload de documentos -> chunking -> geração de embeddings (OpenAI) -> armazenamento em pgvector (PostgreSQL) -> busca por similaridade coseno -> geração de resposta contextualizada (LLM).\n\n**Stack:** Python, FastAPI, LangChain, OpenAI API, PostgreSQL + pgvector, Docker Compose.',
      technologies: ['Python', 'FastAPI', 'LangChain', 'OpenAI', 'pgvector', 'PostgreSQL', 'RAG', 'Docker'],
      githubUrl: 'https://github.com/LucasBiason/fullcycle-semantic-search',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 4,
    },
    {
      userId: user.id,
      title: 'ML Sales Forecasting',
      description: 'API de previsão de vendas usando scikit-learn com modelos de regressão treinados em dados históricos, servida via FastAPI.',
      longDescription:
        '**O que resolve:** Previsão de vendas futuras baseada em dados históricos, auxiliando na tomada de decisão de estoque e planejamento comercial.\n\n**Como funciona:** Ingestão de dados -> feature engineering -> treinamento de modelos (Linear Regression, Random Forest) -> avaliação (MAE, RMSE, R2) -> API de predição.\n\n**Stack:** Python, FastAPI, scikit-learn, Pandas, Docker.',
      technologies: ['Python', 'FastAPI', 'scikit-learn', 'Pandas', 'Machine Learning', 'Docker'],
      githubUrl: 'https://github.com/LucasBiason/ml-sales-forecasting',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 5,
    },
    {
      userId: user.id,
      title: 'Multi-Agent System + Notion MCP Server',
      description: 'Ecossistema de produtividade com IA: framework de agentes especializados para desenvolvimento (30+ skills, 8 agents) integrado a um servidor MCP customizado para automação do Notion em trabalho, estudos e vida pessoal.',
      longDescription:
        '**O que é:** Dois projetos complementares que formam um ecossistema completo de produtividade assistida por IA, cobrindo desde o desenvolvimento de software até a gestão de tarefas e organização pessoal.\n\n**Multi-Agent System:** Framework modular para coordenação de agentes IA no Cursor IDE e Claude Code. 30+ skills técnicas reutilizáveis (backend, frontend, infra, workflow), 8 agents especializados (backend-developer, code-reviewer, deploy-manager, test-runner, plan-lead, etc), commands slash customizados. Workflow padronizado com Spec-Driven Development, code review automatizado, testes, deploy e gestão de issues. Utilizado diariamente em todos os meus projetos profissionais e pessoais.\n\n**Notion Automation Suite (MCP Server):** Servidor MCP próprio construído com FastMCP (Python) que expõe tools compatíveis com Claude Code e Cursor para automação do Notion. 4 domínios suportados: trabalho, estudos, pessoal e conteúdo. Regras de negócio embutidas (validação de título, status, relações, períodos) antes da chamada HTTP. Permite que a IA gerencie cards, tarefas, planejamentos e anotações de estudo diretamente pelo terminal, sem abrir o Notion.\n\n**Por que importa:** Essa integração entre agentes de IA e gestão de tarefas é rara no mercado. Demonstra domínio prático de MCP (Model Context Protocol), construção de ferramentas de IA e automação de workflows reais - não apenas PoCs.',
      technologies: ['MCP', 'FastMCP', 'Claude Code', 'Cursor', 'Python', 'Notion API', 'httpx', 'pytest', 'Shell', 'Multi-Agent'],
      githubUrl: 'https://github.com/LucasBiason/cursor-multiagent-system',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 3,
    },
    {
      userId: user.id,
      title: 'My Local Place - Plataforma de Infraestrutura Local',
      description: 'Plataforma de infraestrutura local para desenvolvedores: databases, message brokers, IA, automação e observabilidade em containers Docker com dashboard operacional.',
      longDescription:
        '**O que é:** Plataforma de infraestrutura local criada para melhorar a experiência do desenvolvedor ao trabalhar com múltiplos serviços de backend, dados e IA. Centraliza ferramentas em um ambiente único, observável e reproduzível.\n\n**Por que existe:** Configurar ambientes de desenvolvimento é repetitivo e propenso a erros. Este projeto evoluiu de um guia de setup para uma plataforma completa que reduz o tempo de configuração, melhora a reprodutibilidade e fornece visibilidade sobre os serviços.\n\n**Serviços de Infraestrutura:** PostgreSQL, MongoDB, MySQL (databases), RabbitMQ e Kafka (message brokers), Redis (cache), n8n (automação de workflows), Ollama (LLMs locais), LangFlow (workflows de IA), Jupyter (notebooks), BentoPDF (processamento de PDF).\n\n**Dashboard Operacional (FastAPI + React):** Gerenciamento de ciclo de vida dos containers (start, stop, restart), monitoramento de recursos (CPU e memória por container), visualização de logs em tempo real, métricas do sistema. Cobertura de testes: 92.28%.\n\n**Princípios:** Arquitetura modular (cada serviço isolado e independente), simplicidade sobre completude, foco na experiência do desenvolvedor. Usado diariamente em workflows de backend, data pipelines e experimentação com IA.',
      technologies: ['Docker', 'Docker Compose', 'FastAPI', 'React', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'RabbitMQ', 'Kafka', 'Ollama', 'LangFlow', 'Jupyter', 'n8n'],
      githubUrl: 'https://github.com/LucasBiason/my-local-place',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 1,
    },
    {
      userId: user.id,
      title: 'Engineering Knowledge Base',
      description: 'Ecossistema de conhecimento versionado em engenharia de software. 4 Knowledge Bases independentes, 73+ notebooks Jupyter, projetos práticos aplicados. Estudo profundo, não tutoriais.',
      longDescription:
        '**O que é:** Sistema de conhecimento versionado, construído a partir de estudo real, problemas vividos e decisões técnicas documentadas. Não é um conjunto de tutoriais - é um corpo de conhecimento coerente, evolutivo e público.\n\n**Estrutura (4 Knowledge Bases como Git Submodules):**\n\n**Fundamentos:**\n- Programming KB - Algoritmos, estruturas de dados, complexidade, Design Patterns, perguntas de entrevistas técnicas\n- Data Science KB - Manipulação de dados, EDA, estatística aplicada\n\n**Arquitetura e Sistemas:**\n- IA/ML KB - OpenAI API (fundamentos, chat, imagens, áudio, embeddings, vision), LangChain (prompts, chains, memory, agents, RAG, cache), Computer Vision (face detection, label inspection), Data Engineering (PySpark, Airflow)\n- Microservices KB - Arquitetura distribuída, patterns, trade-offs, STRIDE Threat Modeling\n\n**Projetos práticos inclusos:** Chat multimodal (OpenAI), Meeting Room Agent, Doc-Chat RAG (LangChain), Label Inspection (Computer Vision), Pokemon Recognition\n\n**Princípios:** Estudo profundo antes de abstração, clareza sobre trade-offs, documentação como ferramenta de aprendizado, código como consequência do entendimento.',
      technologies: ['Python', 'Jupyter', 'OpenAI API', 'LangChain', 'Computer Vision', 'RAG', 'Design Patterns', 'Algoritmos', 'PySpark', 'Git Submodules'],
      githubUrl: 'https://github.com/LucasBiason/engineering-knowledge-base',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 0,
    },
    {
      userId: user.id,
      title: 'FIAP Tech Challenge - Fase 04: Análise de Vídeo com IA (Nota: 85/90)',
      description: 'Pipeline de análise de vídeo com detecção facial (YOLOv11), reconhecimento de emoções (DeepFace), análise de atividades por pose estimation e geração de relatórios estatísticos.',
      longDescription:
        '**Nota:** 85/90\n\n**Contexto:** Quarto Tech Challenge da pós-graduação em IA da FIAP. Projeto de Computer Vision aplicado à análise comportamental em vídeos.\n\n**O que resolve:** Processa vídeos automaticamente para detectar rostos, reconhecer emoções, identificar atividades e gerar relatórios estatísticos completos em Markdown.\n\n**Pipeline:** Vídeo de entrada -> Detecção facial (YOLOv11) -> Análise de emoções (DeepFace) -> Reconhecimento de atividades (pose estimation) -> Geração de relatório estatístico.\n\n**Arquitetura Clean Architecture:** Domain Layer (modelos: BoundingBox, FaceDetection, EmotionAnalysis, ActivityDetection), Services Layer (lógica de negócio e orquestração), Utils Layer (helpers). Desenvolvimento documentado em 6 Jupyter notebooks progressivos: processamento de vídeo, detecção facial, reconhecimento de emoções, atividades, análise de cena e pipeline integrado.\n\n**Stack:** Python 3.13+, OpenCV, YOLOv11, DeepFace, NumPy, Pandas, Matplotlib.',
      technologies: ['Python', 'OpenCV', 'YOLOv11', 'DeepFace', 'Computer Vision', 'Pose Estimation', 'NumPy', 'Pandas', 'Matplotlib', 'Clean Architecture'],
      githubUrl: 'https://github.com/LucasBiason/fiap-tech-challenger-fase04',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 7,
    },
    {
      userId: user.id,
      title: 'FIAP Tech Challenge - Fase 03: Fine-Tuning de LLMs (Nota: 90/90)',
      description: 'Sistema completo de fine-tuning de modelos de linguagem com detecção automática de hardware, integração Unsloth, fallback inteligente para Transformers e processamento de datasets grandes em chunks.',
      longDescription:
        '**Nota:** 90/90 (Nota Máxima)\n\n**Contexto:** Terceiro Tech Challenge da pós-graduação em IA da FIAP. Projeto de NLP avançado focado em customização de modelos de linguagem.\n\n**O que resolve:** Permite realizar fine-tuning de LLMs de forma automatizada, adaptando-se ao hardware disponível (GPU T4, CPU-only, etc.) e selecionando automaticamente o modelo e configuração ideais.\n\n**Módulos Python organizados:** model_detector.py (detecção automática de modelo e configuração por hardware), config.py (gerenciamento de configuração), trainer.py (pipeline principal de treinamento), dataset_downloader.py e dataset_analyzer.py (manipulação de dados), data_processor.py (transformação para formato Alpaca).\n\n**Diferenciais:** Detecção automática do melhor modelo baseada no hardware (DialoGPT-medium, DistilGPT2, etc.), integração nativa com Unsloth para treinamento otimizado com fallback automático para Transformers, processamento em chunks para datasets grandes sem problemas de memória, modo de teste rápido (5-15 min) e treinamento completo, compatível com Google Colab e ambiente local.\n\n**Stack:** Python, Transformers, Unsloth, PyTorch, Google Colab, Jupyter Notebooks.',
      technologies: ['Python', 'Transformers', 'Unsloth', 'PyTorch', 'Fine-Tuning', 'LLM', 'NLP', 'Google Colab', 'Jupyter'],
      githubUrl: 'https://github.com/LucasBiason/fiap-tech-challenger-fase03',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 8,
    },
    {
      userId: user.id,
      title: 'FIAP Tech Challenge - Fase 02: Otimização de Carga com Algoritmos Genéticos (Nota: 90/90)',
      description: 'Sistema de gerenciamento de produtos com otimização de carga usando algoritmos genéticos. 3 microsserviços em Clean Architecture com cobertura de testes 90%+.',
      longDescription:
        '**Nota:** 90/90 (Nota Máxima)\n\n**Contexto:** Segundo Tech Challenge da pós-graduação em IA da FIAP. Projeto focado em algoritmos de otimização aplicados a logística.\n\n**O que resolve:** Otimização de carga de veículos de transporte usando algoritmos genéticos para maximizar a ocupação, com gerenciamento completo de produtos e interface visual.\n\n**Arquitetura de 3 microsserviços (Clean Architecture):** Products Service (FastAPI + SQLAlchemy + PostgreSQL, porta 8000) com CRUD completo e validação Pydantic; Optimizer Service (FastAPI + Algoritmo Genético, porta 8002) com parâmetros configuráveis de otimização; Products Frontend (Streamlit, porta 8501) com interface visual para gestão e otimização.\n\n**Qualidade:** Clean Architecture com controllers, repositories, models e schemas. Cobertura de testes 90%+ com pytest. Alembic para migrations. Suporte Linux e Windows com Makefile. Docker Compose para orquestração completa.\n\n**Stack:** Python, FastAPI, SQLAlchemy, PostgreSQL, Alembic, Streamlit, Algoritmos Genéticos, Pydantic, pytest, Docker Compose.',
      technologies: ['Python', 'FastAPI', 'SQLAlchemy', 'PostgreSQL', 'Alembic', 'Streamlit', 'Algoritmos Genéticos', 'Pydantic', 'pytest', 'Docker', 'Clean Architecture'],
      githubUrl: 'https://github.com/LucasBiason/fiap-tech-challenger-fase02',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 9,
    },
    {
      userId: user.id,
      title: 'FIAP Tech Challenge - Fase 01: Previsão de Custos Médicos (Nota: 90/90)',
      description: 'Modelo preditivo de custos médicos com análise exploratória completa, comparação de técnicas de regressão, avaliação de métricas e API de predição via microsserviço.',
      longDescription:
        '**Nota:** 90/90 (Nota Máxima)\n\n**Contexto:** Primeiro Tech Challenge da pós-graduação em IA da FIAP. Projeto de Machine Learning clássico com foco em regressão.\n\n**O que resolve:** Previsão de custos médicos individuais baseada em características do paciente (idade, IMC, região, hábito de fumar, número de filhos), auxiliando seguradoras e planos de saúde no planejamento e precificação.\n\n**Etapa 01 - Análise e Preparação:** Análise exploratória completa do dataset de seguros médicos, identificação de padrões e correlações, limpeza e preparação dos dados para modelagem. Documentada em Jupyter notebook.\n\n**Etapa 02 - Modelo Preditivo:** Treinamento e comparação de múltiplos modelos de regressão, avaliação com métricas (MAE, RMSE, R2, MAPE), seleção do melhor modelo. Documentada em Jupyter notebook.\n\n**Entregável:** API Predict Service (FastAPI, porta 8004) com endpoint POST /predict que recebe dados do paciente e retorna a previsão de custo. Frontend Streamlit para visualização.\n\n**Stack:** Python, scikit-learn, Pandas, Jupyter, FastAPI, Streamlit, Docker.',
      technologies: ['Python', 'scikit-learn', 'Pandas', 'Jupyter', 'FastAPI', 'Streamlit', 'Regressão', 'Machine Learning', 'Docker'],
      githubUrl: 'https://github.com/LucasBiason/fiap-tech-challenger-fase01',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 10,
    },
    {
      userId: user.id,
      title: 'ML Spam Classifier API',
      description: 'API de classificação de spam com NLP: pipeline de processamento de texto, treinamento de modelo e endpoint de predição servido via FastAPI.',
      longDescription:
        '**O que resolve:** Classificação automática de mensagens como spam ou não-spam, utilizando técnicas de NLP e Machine Learning.\n\n**Como funciona:** Pré-processamento de texto (tokenização, stemming, TF-IDF) -> treinamento de classificador (Naive Bayes, SVM) -> API REST para predição em tempo real.\n\n**Stack:** Python, FastAPI, scikit-learn, NLTK, Pandas, Docker.',
      technologies: ['Python', 'FastAPI', 'scikit-learn', 'NLP', 'NLTK', 'Pandas', 'Docker'],
      githubUrl: 'https://github.com/LucasBiason/ml-spam-classifier-api',
      demoUrl: null,
      imageUrl: null,
      featured: true,
      order: 6,
    },
  ];

  // GitHub raw base URL
  const ghRaw = 'https://raw.githubusercontent.com/LucasBiason';

  // Map of project title prefix -> image URLs
  const projectImages: Record<string, { url: string; alt: string }[]> = {
    'Engineering Knowledge Base': [],
    'My Local Place': [
      { url: `${ghRaw}/my-local-place/main/docs/assets/my-local-place-banner.png`, alt: 'My Local Place - Banner' },
      { url: `${ghRaw}/my-local-place/main/docs/screenshots/dashboard.png`, alt: 'My Local Place - Dashboard' },
    ],
    'Threat Modeling AI': [],
    'Multi-Agent System': [
      { url: `${ghRaw}/cursor-multiagent-system/main/assets/cursor-multiagent-banner.png`, alt: 'Multi-Agent System - Banner' },
    ],
    'Fullcycle Semantic Search': [
      { url: `${ghRaw}/fullcycle-semantic-search/main/assets/screenshot.png`, alt: 'Fullcycle Semantic Search - Screenshot' },
    ],
    'ML Sales Forecasting': [],
    'ML Spam Classifier': [
      { url: `${ghRaw}/ml-spam-classifier-api/main/docs/screenshots/spam-classification.png`, alt: 'Spam Classifier - Classificação Spam' },
      { url: `${ghRaw}/ml-spam-classifier-api/main/docs/screenshots/ham-classification.png`, alt: 'Spam Classifier - Classificação Ham' },
    ],
  };

  // =============================================
  // CATEGORIAS
  // =============================================
  const categoriesData = [
    { name: 'IA Generativa', slug: 'ia-generativa', icon: 'bx-brain', color: '#88c0d0', order: 0 },
    { name: 'Machine Learning', slug: 'machine-learning', icon: 'bx-chip', color: '#a3be8c', order: 1 },
    { name: 'Backend & APIs', slug: 'backend-apis', icon: 'bx-server', color: '#5e81ac', order: 2 },
    { name: 'DevTools & Produtividade', slug: 'devtools', icon: 'bx-code-alt', color: '#b48ead', order: 3 },
    { name: 'Infraestrutura & DevOps', slug: 'infraestrutura', icon: 'bxl-docker', color: '#d08770', order: 4 },
    { name: 'Conhecimento & Estudo', slug: 'conhecimento', icon: 'bx-book-open', color: '#ebcb8b', order: 5 },
    { name: 'Computer Vision', slug: 'computer-vision', icon: 'bx-camera', color: '#bf616a', order: 6 },
    { name: 'NLP', slug: 'nlp', icon: 'bx-message-dots', color: '#8fbcbb', order: 7 },
    { name: 'FIAP Tech Challenge', slug: 'fiap-tech-challenge', icon: 'bx-trophy', color: '#ebcb8b', order: 8 },
    { name: 'Full-Stack', slug: 'full-stack', icon: 'bx-layer', color: '#81a1c1', order: 9 },
    { name: 'Segurança', slug: 'seguranca', icon: 'bx-shield', color: '#bf616a', order: 10 },
    { name: 'Automação', slug: 'automacao', icon: 'bx-bot', color: '#a3be8c', order: 11 },
    // Stack categories
    { name: 'Linguagens', slug: 'linguagens', icon: 'code', color: '#a3be8c', order: 100 },
    { name: 'Frameworks Backend', slug: 'frameworks-backend', icon: 'layers', color: '#5e81ac', order: 101 },
    { name: 'Databases', slug: 'databases', icon: 'database', color: '#88c0d0', order: 102 },
    { name: 'Mensageria / Filas', slug: 'mensageria-filas', icon: 'workflow', color: '#d08770', order: 103 },
    { name: 'Cloud / Infra', slug: 'cloud-infra', icon: 'cloud', color: '#bf616a', order: 104 },
    { name: 'IA / Machine Learning', slug: 'ia-machine-learning', icon: 'cpu', color: '#b48ead', order: 105 },
    { name: 'Frontend', slug: 'frontend', icon: 'monitor', color: '#81a1c1', order: 106 },
    { name: 'Testes / Qualidade', slug: 'testes-qualidade', icon: 'test-tube', color: '#ebcb8b', order: 107 },
    { name: 'Arquitetura / Padrões', slug: 'arquitetura-padroes', icon: 'layers', color: '#8fbcbb', order: 108 },
  ];

  const categoryMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const created = await prisma.category.create({
      data: { ...cat, userId: user.id },
    });
    categoryMap[cat.slug] = created.id;
  }
  console.log('Categorias criadas:', categoriesData.length);

  // Map project title -> category slugs
  const projectCategoryMap: Record<string, string[]> = {
    'Engineering Knowledge Base': ['conhecimento', 'ia-generativa', 'machine-learning', 'computer-vision', 'nlp'],
    'My Local Place': ['infraestrutura', 'devtools', 'backend-apis'],
    'Threat Modeling AI': ['fiap-tech-challenge', 'ia-generativa', 'seguranca', 'full-stack'],
    'Multi-Agent System': ['devtools', 'ia-generativa', 'automacao'],
    'Fullcycle Semantic Search': ['ia-generativa', 'backend-apis', 'nlp'],
    'ML Sales Forecasting': ['machine-learning', 'backend-apis'],
    'ML Spam Classifier': ['machine-learning', 'nlp', 'backend-apis'],
    'Fase 04': ['fiap-tech-challenge', 'computer-vision', 'machine-learning'],
    'Fase 03': ['fiap-tech-challenge', 'ia-generativa', 'nlp'],
    'Fase 02': ['fiap-tech-challenge', 'machine-learning', 'backend-apis'],
    'Fase 01': ['fiap-tech-challenge', 'machine-learning', 'backend-apis'],
  };

  for (const p of projectsData) {
    const project = await prisma.project.create({ data: p });

    // Images
    const matchKey = Object.keys(projectImages).find((key) => project.title.includes(key));
    if (matchKey && projectImages[matchKey].length > 0) {
      for (let i = 0; i < projectImages[matchKey].length; i++) {
        await prisma.projectImage.create({
          data: {
            projectId: project.id,
            url: projectImages[matchKey][i].url,
            alt: projectImages[matchKey][i].alt,
            order: i,
          },
        });
      }
    }

    // Categories
    const catKey = Object.keys(projectCategoryMap).find((key) => project.title.includes(key));
    if (catKey) {
      for (const slug of projectCategoryMap[catKey]) {
        if (categoryMap[slug]) {
          await prisma.projectCategory.create({
            data: { projectId: project.id, categoryId: categoryMap[slug] },
          });
        }
      }
    }
  }
  console.log('Projetos criados:', projectsData.length);

  // =============================================
  // SERVICOS / ESPECIALIDADES
  // =============================================
  const servicesData = [
    {
      userId: user.id,
      title: 'Backend Development',
      description: 'APIs robustas com Python (Django, FastAPI, Flask), Node.js/TypeScript. Microsserviços, integração com APIs externas (SOAP/REST), regras de negócio complexas.',
      icon: 'bxl-python',
      order: 0,
    },
    {
      userId: user.id,
      title: 'Arquitetura de Software',
      description: 'Design de microsserviços (CQRS, Event-Driven), patterns (Repository, Strategy, Adapter), SOLID. Experiência com 82+ microsserviços em produção.',
      icon: 'bx-layer',
      order: 1,
    },
    {
      userId: user.id,
      title: 'IA Generativa em Produção',
      description: 'OCR inteligente, RAG com busca semântica, relatórios automatizados, análise de ameaças. LangChain, OpenAI, Google GenAI, Mistral AI.',
      icon: 'bx-brain',
      order: 2,
    },
    {
      userId: user.id,
      title: 'DevOps & Deploy',
      description: 'Docker, Docker Compose, Kubernetes (AWS EKS), VPS com nginx, CI/CD. Deploy e operação de sistemas em produção.',
      icon: 'bxl-docker',
      order: 3,
    },
    {
      userId: user.id,
      title: 'Integrações & APIs',
      description: '30+ integrações em produção: SOAP (GDS aéreo), REST, OAuth2, APIs do Banco Central, Google Workspace, pagamentos. Engine de pricing e booking.',
      icon: 'bx-transfer',
      order: 4,
    },
    {
      userId: user.id,
      title: 'Frontend React',
      description: 'React 18+, TypeScript, Tailwind CSS, React Hook Form + Zod. SPAs completas, dashboards interativos, testes E2E com Playwright.',
      icon: 'bxl-react',
      order: 5,
    },
  ];

  for (const s of servicesData) {
    await prisma.service.create({ data: s });
  }
  console.log('Servicos criados:', servicesData.length);

  // =============================================
  // CONTACT INFO (Social Links + Contact Cards)
  // =============================================
  const contactsData = [
    {
      userId: user.id,
      title: 'GitHub',
      value: 'github.com/LucasBiason',
      href: 'https://github.com/LucasBiason',
      icon: 'bxl-github',
      type: 'social',
      order: 0,
    },
    {
      userId: user.id,
      title: 'LinkedIn',
      value: 'linkedin.com/in/lucas-biason-0b70a334',
      href: 'https://linkedin.com/in/lucas-biason-0b70a334',
      icon: 'bxl-linkedin',
      type: 'social',
      order: 1,
    },
    {
      userId: user.id,
      title: 'E-mail',
      value: 'lucas.biason@foxcodesoftware.com',
      href: 'mailto:lucas.biason@foxcodesoftware.com',
      icon: 'bx-envelope',
      type: 'social',
      order: 2,
    },
    {
      userId: user.id,
      title: 'E-mail',
      value: 'lucas.biason@foxcodesoftware.com',
      href: 'mailto:lucas.biason@foxcodesoftware.com',
      icon: 'bx-envelope',
      type: 'contact',
      order: 0,
    },
    {
      userId: user.id,
      title: 'LinkedIn',
      value: 'linkedin.com/in/lucas-biason-0b70a334',
      href: 'https://linkedin.com/in/lucas-biason-0b70a334',
      icon: 'bxl-linkedin',
      type: 'contact',
      order: 1,
    },
    {
      userId: user.id,
      title: 'GitHub',
      value: 'github.com/LucasBiason',
      href: 'https://github.com/LucasBiason',
      icon: 'bxl-github',
      type: 'contact',
      order: 2,
    },
  ];

  for (const c of contactsData) {
    await prisma.contactInfo.create({ data: c });
  }
  console.log('Contacts criados:', contactsData.length);

  // =============================================
  // DOMAINS (Domínios de Negócio)
  // =============================================
  const domainsData = [
    { name: 'Automação e Análise de Dados', slug: 'automacao-analise-dados', color: '#88c0d0', icon: 'bx-bot', order: 0 },
    { name: 'Turismo', slug: 'turismo', color: '#a3be8c', icon: 'bx-globe', order: 1 },
    { name: 'RH e Gestão de Talentos', slug: 'rh-gestao-talentos', color: '#5e81ac', icon: 'bx-group', order: 2 },
    { name: 'Plataforma Educacional', slug: 'plataforma-educacional', color: '#ebcb8b', icon: 'bx-book', order: 3 },
    { name: 'Crédito e Serviços Financeiros', slug: 'credito-financeiro', color: '#bf616a', icon: 'bx-credit-card', order: 4 },
    { name: 'E-commerce', slug: 'ecommerce', color: '#d08770', icon: 'bx-cart', order: 5 },
    { name: 'Workflows e Automação', slug: 'workflows-automacao', color: '#b48ead', icon: 'bx-git-branch', order: 6 },
    { name: 'Dashboard e Analytics', slug: 'dashboard-analytics', color: '#81a1c1', icon: 'bx-bar-chart-alt-2', order: 7 },
  ];

  const domainSlugMap: Record<string, string> = {};
  for (const dom of domainsData) {
    const created = await prisma.domain.create({
      data: { ...dom, userId: user.id },
    });
    domainSlugMap[dom.slug] = created.id;
  }
  console.log('Domains criados:', domainsData.length);

  // =============================================
  // CAREER ENTRIES (Histórico Profissional)
  // Ordem: mais recente primeiro
  // Datas conforme CV oficial
  // =============================================
  const careerData = [
    {
      company: 'Astracode',
      role: 'Desenvolvedor Sênior',
      contractType: 'PJ',
      startDate: new Date('2025-02-01'),
      endDate: null,
      summary: 'Desenvolvimento e manutenção de soluções backend para automação, coleta e análise de dados. Implementação de microsserviços com IA generativa (OCR, relatórios automatizados), deploy completo em VPS.',
      projectTypes: [
        'SaaS multi-tenant de gestão de despesas corporativas (9 microsserviços)',
        'Serviço de OCR inteligente com IA generativa',
        'Serviço de relatórios automatizados com IA',
        'Frontend completo com React + TypeScript',
        'Infraestrutura de deploy em VPS',
      ],
      actions: [
        'Desenvolvi 9 microsserviços (1 Django + 8 FastAPI) com 606+ commits',
        'Implementei OCR inteligente de recibos com LangChain + Google GenAI + Mistral AI',
        'Criei relatórios automatizados com IA (LangChain + OpenAI)',
        'Deploy completo em VPS com Docker, nginx e Uptime Kuma',
        'Cobertura de testes 90%+ (pytest) + E2E (Playwright)',
        'Implementação de fluxos de processamento orientados à geração de insights estratégicos',
      ],
      order: 0,
      domainSlugs: ['automacao-analise-dados'],
    },
    {
      company: 'Rede Comunita',
      role: 'Full-Stack Developer (Freelance)',
      contractType: 'Freelancer',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2026-03-01'),
      summary: 'Criei dashboard de KPIs financeiros para rede com 30+ unidades. Upload e processamento de planilhas Excel, gráficos interativos com Plotly, deploy em VPS com Docker.',
      projectTypes: [
        'Dashboard de KPIs financeiros multi-tenant (30+ unidades)',
        'Pipeline de processamento de dados Excel',
        'Gráficos interativos para análise financeira',
      ],
      actions: [
        'Criei dashboard de KPIs financeiros para rede com 30+ unidades (139+ commits)',
        'Implementei upload e processamento de planilhas Excel',
        'Desenvolvi gráficos interativos com Plotly + Kaleido',
        'Deploy completo em VPS com Docker e nginx',
        'Testes E2E com Playwright',
      ],
      order: 1,
      domainSlugs: ['dashboard-analytics'],
    },
    {
      company: 'Voetur Turismo',
      role: 'Desenvolvedor Sênior',
      contractType: 'CLT',
      startDate: new Date('2023-07-01'),
      endDate: new Date('2025-01-01'),
      summary: 'Desenvolvimento de automações de processos no setor de turismo utilizando Python e Django. Integração com APIs de terceiros e sistemas corporativos. Criação de soluções de análise de dados para apoio à tomada de decisão.',
      projectTypes: [
        'Automações de processos para o setor de turismo',
        'Integrações com APIs de terceiros e sistemas corporativos',
        'Soluções de análise de dados para tomada de decisão',
      ],
      actions: [
        'Desenvolvi automações de processos no setor de turismo com Python e Django',
        'Integrei APIs de terceiros e sistemas corporativos',
        'Criei soluções de análise de dados para apoio à tomada de decisão',
      ],
      order: 2,
      domainSlugs: ['turismo'],
    },
    {
      company: 'FDTE - Fundação para o Desenvolvimento Tecnológico da Engenharia',
      role: 'Desenvolvedor Python',
      contractType: 'PJ',
      startDate: new Date('2020-07-01'),
      endDate: new Date('2023-05-01'),
      summary: 'Desenvolvimento de funcionalidades backend com Python e Django para clientes corporativos. Atuação em projetos de plataforma de empréstimos online (43+ microsserviços, BACEN, AWS), reescrita de e-commerce enterprise (24 microsserviços, CQRS, TypeScript) e motor de workflows distribuídos (Kafka, lib open-source publicada no npm). Implementação de testes automatizados e participação em times ágeis.',
      projectTypes: [
        'Plataforma de crédito pessoal regulada pelo BACEN (43+ microsserviços)',
        'Reescrita de e-commerce enterprise (24 microsserviços, CQRS)',
        'Motor de workflows distribuídos (Kafka, lib open-source)',
        'Serviço de análise de dados BACEN SCR',
        'Infraestrutura Kubernetes (4 ambientes)',
      ],
      actions: [
        'Desenvolvi serviço de análise de dados SCR do Banco Central (~85 commits)',
        'Criei engine de agregação financeira para decisões de crédito',
        'Integrei novo parceiro financeiro em toda a plataforma (~51 commits)',
        'Trabalhei com contratos, pagamentos, scoring e pricing de crédito',
        'Trabalhei no monorepo e-commerce com 24 microsserviços CQRS (86 commits)',
        'Documentei toda a arquitetura com diagramas antes do desenvolvimento',
        'Desenvolvi carrinho de compras completo (command + query)',
        'Criei do zero a biblioteca @flowbuild/streamers (publicada no npm)',
        'Unifiquei Kafka, RabbitMQ, MQTT e BullMQ numa única interface',
        'Configurei tooling de qualidade para o time (commitizen, pre-commit, linters)',
        'Fiz deploys em Kubernetes (4 ambientes) com AWS EKS',
      ],
      order: 3,
      domainSlugs: ['credito-financeiro', 'ecommerce', 'workflows-automacao'],
    },
    {
      company: 'Colaborativa Educação',
      role: 'Desenvolvedor Python (Freelance)',
      contractType: 'Freelancer',
      startDate: new Date('2021-05-01'),
      endDate: new Date('2022-01-01'),
      summary: 'Construí plataformas de analytics educacional integrando Google Classroom/Workspace e Zoom. Coletores automatizados para Meets, Docs, Drive e Gmail com OAuth2 e scheduling.',
      projectTypes: [
        'Plataforma de analytics educacional (Google Workspace)',
        'Plataforma de analytics de videoconferências',
        'Coletores automatizados com scheduling',
      ],
      actions: [
        'Construí plataforma de analytics educacional com Google Classroom (~70 commits)',
        'Criei coletores automatizados para Google Meets, Docs, Drive, Gmail',
        'Desenvolvi plataforma de analytics de videoconferências (~32 commits)',
        'Implementei métricas de Quality of Service (QoS) e satisfação',
        'Configurei autenticação OAuth2 com Google',
        'Implementei scheduling automatizado com APScheduler',
      ],
      order: 4,
      domainSlugs: ['plataforma-educacional'],
    },
    {
      company: 'ITM Tecnologia / Tour House',
      role: 'Desenvolvedor Python (CLT)',
      contractType: 'CLT',
      startDate: new Date('2018-12-01'),
      endDate: new Date('2020-06-01'),
      summary: 'Trabalhei na API central que orquestra voos, hotéis e veículos para turismo corporativo. Refatorei integrações aéreas com 3 companhias (SOAP), engine de pricing, booking e cache para 15+ fornecedores.',
      projectTypes: [
        'API orquestradora de turismo (voos, hotéis, veículos)',
        'Bibliotecas de integração aérea (SOAP/REST)',
        'Engine de pricing e booking em tempo real',
        'Fluxo B2B corporativo',
      ],
      actions: [
        'Trabalhei na API central que orquestra 15+ fornecedores (146 commits)',
        'Refatorei integrações aéreas com 3 companhias via SOAP',
        'Desenvolvi engine de pricing, booking e gestão de cache',
        'Implementei fluxo B2B corporativo completo',
        'Integrei 30+ APIs externas (aéreo, hotel, veículo, pagamento)',
        'Trabalhei com APIs legadas e instáveis (XML, WSDL, certificados SSL)',
      ],
      order: 5,
      domainSlugs: ['turismo'],
    },
    {
      company: 'Leme Consultoria em Gestão de RH',
      role: 'Programador Web - Estagiário a Pleno (CLT)',
      contractType: 'CLT',
      startDate: new Date('2012-08-01'),
      endDate: new Date('2018-12-01'),
      summary: 'Evolução profissional de estagiário para programador pleno. Desenvolvi o produto principal da empresa: plataforma SaaS de avaliação de competências e desempenho de funcionários com engine de cálculo, relatórios PDF complexos e sistema de recrutamento.',
      projectTypes: [
        'SaaS de avaliação de competências e desempenho',
        'ATS (Applicant Tracking System) para recrutamento',
        'Microsserviço de integração com assessment comportamental (DISC)',
        'Reescrita de sistema legado como API REST moderna',
        'Portal de empregos com upload de currículos',
      ],
      actions: [
        'Desenvolvi o produto principal da empresa (~696 entradas git)',
        'Construí engine de cálculo de competências e avaliação de desempenho',
        'Criei sistema completo de recrutamento e seleção (ATS)',
        'Implementei microsserviço de integração com assessment DISC',
        'Gerei relatórios PDF complexos com gráficos e cálculos (ReportLab, matplotlib)',
        'Reescrevi sistema legado como API REST com frontend desacoplado',
        'Desenvolvi importação de dados, filtros avançados e assessments',
        'Evolução de estagiário a programador pleno ao longo de 6 anos',
      ],
      order: 6,
      domainSlugs: ['rh-gestao-talentos'],
    },
  ];

  for (const entry of careerData) {
    const { domainSlugs, ...entryData } = entry;
    const created = await prisma.careerEntry.create({
      data: {
        ...entryData,
        userId: user.id,
      },
    });
    for (const slug of domainSlugs) {
      const domainId = domainSlugMap[slug];
      if (domainId) {
        await prisma.careerDomain.create({
          data: { careerEntryId: created.id, domainId },
        });
      }
    }
  }
  console.log('Career entries criados:', careerData.length);

  // =============================================
  // STACK DETAILS (Detalhamento por Tecnologia)
  // =============================================
  // Helper to get categoryId by slug
  const catId = (slug: string) => {
    const id = categoryMap[slug];
    if (!id) throw new Error(`Category not found: ${slug}`);
    return id;
  };

  const stacksData = [
    // --- LINGUAGENS ---
    {
      name: 'Python',
      categoryId: catId('linguagens'),
      startYear: 2012,
      endYear: null as number | null,
      level: 'Especialista',
      icon: 'python',
      profProjects: [
        'Plataforma SaaS de avaliação de competências (5 anos, produto principal)',
        'API orquestradora de turismo corporativo (15+ fornecedores SOAP/REST)',
        'Analytics educacional com Google Workspace e Zoom',
        'Serviços de análise BACEN SCR em fintech regulada (43+ microsserviços)',
        'SaaS de despesas corporativas (9 microsserviços com IA)',
        'Dashboard financeiro multi-tenant (30+ unidades)',
      ],
      personalProjects: [
        'Análise de ameaças em arquitetura cloud com LLMs (STRIDE/DREAD)',
        'Pipeline de automação de freelancing (scraping + LLM scoring)',
        'Busca semântica com RAG e pgvector',
        'Previsão de vendas com scikit-learn',
        'Hub de conhecimento técnico (54+ notebooks Jupyter)',
      ],
      solutions: [
        'Engine de cálculo de competências com relatórios PDF complexos (ReportLab, matplotlib)',
        'OCR inteligente de recibos com LangChain + Gemini + Mistral',
        'Relatórios automatizados com IA generativa (LangChain + OpenAI)',
        'Coletores automatizados para APIs externas com scheduling',
        'Engine de agregação financeira para decisões de crédito (BACEN SCR)',
        'Integrações SOAP com APIs de aviação (GDS aéreo)',
        'Pipeline de web scraping + LLM para scoring automatizado',
      ],
      patterns: [
        'Repository Pattern',
        'Service Layer',
        'Factory Pattern',
        'Strategy Pattern',
        'Dependency Injection',
        'Clean Architecture',
      ],
      order: 0,
    },
    {
      name: 'Django / DRF',
      categoryId: catId('frameworks-backend'),
      startYear: 2012,
      endYear: null as number | null,
      level: 'Especialista',
      icon: 'django',
      profProjects: [
        'Plataforma SaaS de avaliação de competências (produto principal, 5 anos)',
        'Sistema de recrutamento e seleção (ATS)',
        'API orquestradora de turismo corporativo',
        'Analytics educacional (Google Workspace + Zoom)',
        'SaaS de despesas corporativas (user-service)',
        'Dashboard financeiro multi-tenant',
      ],
      personalProjects: [
        'Hub de conhecimento tecnico com admin customizado',
      ],
      solutions: [
        'Multi-app complexo (avaliação, mapeamento, relatórios, candidaturas)',
        'Sistema de permissões customizado por empresa/usuário',
        'Importação massiva de dados com validação',
        'Celery + Redis/RabbitMQ para tarefas assíncronas',
        'Upload e processamento de planilhas Excel (Pandas + openpyxl)',
        'Gráficos interativos server-side (Plotly + Kaleido)',
        'OAuth2 com Google Workspace (múltiplas APIs)',
      ],
      patterns: [
        'MVT (Model-View-Template)',
        'Fat Models / Thin Views',
        'Custom Managers',
        'Signals',
        'Middleware customizado',
        'Class-Based Views',
        'Serializer Validation (DRF)',
      ],
      order: 1,
    },
    {
      name: 'FastAPI',
      categoryId: catId('frameworks-backend'),
      startYear: 2025,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'fastapi',
      profProjects: [
        'SaaS de despesas corporativas (8 microsserviços FastAPI)',
      ],
      personalProjects: [
        'Análise de ameaças com IA (STRIDE/DREAD pipeline)',
        'Busca semântica com RAG e pgvector',
        'API de previsão de vendas com ML',
        'API de classificação de spam com NLP',
      ],
      solutions: [
        'OCR inteligente de recibos com LangChain + Google GenAI',
        'Relatórios automatizados com IA generativa',
        'Pipeline assíncrono com Celery + Redis',
        'Validação robusta com Pydantic v2',
        'Microsserviços independentes com Docker',
        'Testes com 90%+ de cobertura (pytest)',
      ],
      patterns: [
        'Repository Pattern',
        'Dependency Injection (nativo)',
        'Pydantic Schemas (request/response)',
        'Router modular',
        'Middleware customizado',
        'Background Tasks',
      ],
      order: 2,
    },
    {
      name: 'Flask',
      categoryId: catId('frameworks-backend'),
      startYear: 2020,
      endYear: 2022 as number | null,
      level: 'Intermediário',
      icon: 'flask',
      profProjects: [
        'Plataforma fintech regulada pelo BACEN (43+ microsserviços, framework interno baseado em Flask)',
      ],
      personalProjects: [],
      solutions: [
        'Framework interno customizado para microsserviços fintech',
        'Proxies para APIs do Banco Central',
        'Celery com AWS SQS como broker em produção',
        'Validação com marshmallow',
      ],
      patterns: [
        'Blueprint modular',
        'Application Factory',
        'Middleware chain',
      ],
      order: 3,
    },
    {
      name: 'TypeScript / Node.js',
      categoryId: catId('frameworks-backend'),
      startYear: 2022,
      endYear: 2023 as number | null,
      level: 'Intermediário-Avançado',
      icon: 'typescript',
      profProjects: [
        'Reescrita de e-commerce enterprise (24 microsserviços CQRS)',
        'Motor de workflows distribuídos (6 microsserviços, lib open-source)',
      ],
      personalProjects: [
        'Portfolio profissional (Express + Prisma)',
      ],
      solutions: [
        'CQRS com PostgreSQL (command) + DynamoDB (query)',
        'Biblioteca multi-broker publicada no npm (Kafka, RabbitMQ, MQTT, BullMQ)',
        'Monorepo com NPM privado e bibliotecas compartilhadas',
        'Auth library compartilhada entre microsserviços',
        'Carrinho de compras completo (command + query)',
      ],
      patterns: [
        'CQRS',
        'Adapter Pattern',
        'Strategy Pattern',
        'Monorepo com packages/',
        'Event-Driven Architecture',
      ],
      order: 4,
    },
    // --- DATABASES ---
    {
      name: 'PostgreSQL',
      categoryId: catId('databases'),
      startYear: 2012,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'postgresql',
      profProjects: [
        'Todos os projetos profissionais (principal banco em todas as empresas)',
      ],
      personalProjects: [
        'Busca semântica com pgvector (embeddings)',
        'Todos os projetos pessoais',
      ],
      solutions: [
        'Modelagem relacional complexa (multi-tenant, permissões, hierarquias)',
        'Migrations com Django (makemigrations) e Alembic',
        'Migrations com Prisma e TypeORM',
        'Indexação e otimização de queries',
        'pgvector para busca semântica por similaridade',
        'Backup e restore em produção',
      ],
      patterns: [
        'Normalização (3NF)',
        'Indexes compostos',
        'Migrations versionadas',
        'Connection pooling',
      ],
      order: 5,
    },
    {
      name: 'Redis',
      categoryId: catId('databases'),
      startYear: 2018,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'redis',
      profProjects: [
        'Cache de API orquestradora de turismo',
        'Broker Celery em fintech (com SQS)',
        'Cache e broker em SaaS de despesas',
        'Cache em motor de workflows distribuídos',
      ],
      personalProjects: [
        'Análise de ameaças (broker Celery)',
        'Infraestrutura local (cache + broker)',
      ],
      solutions: [
        'Cache de respostas de APIs externas (TTL configurável)',
        'Broker para Celery (produção)',
        'Session storage',
        'Rate limiting',
      ],
      patterns: [
        'Cache-Aside',
        'TTL-based invalidation',
        'Pub/Sub (via BullMQ)',
      ],
      order: 6,
    },
    {
      name: 'DynamoDB',
      categoryId: catId('databases'),
      startYear: 2022,
      endYear: 2023 as number | null,
      level: 'Intermediário',
      icon: 'dynamodb',
      profProjects: [
        'Query side de e-commerce CQRS (24 microsserviços)',
      ],
      personalProjects: [],
      solutions: [
        'Leitura otimizada para e-commerce (catálogo, listagem, wishlist)',
        'Modelagem NoSQL para CQRS (query side)',
        'AWS SDK direto (sem ORM)',
      ],
      patterns: [
        'Single Table Design',
        'CQRS (Query side)',
        'Eventual Consistency',
      ],
      order: 7,
    },
    // --- MENSAGERIA ---
    {
      name: 'Celery',
      categoryId: catId('mensageria-filas'),
      startYear: 2018,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'celery',
      profProjects: [
        'Tarefas assíncronas em plataforma de RH (Celery + Redis)',
        'Processamento de integração de turismo (Celery + RabbitMQ)',
        'Tarefas em fintech regulada (Celery + AWS SQS)',
        'Pipeline assíncrono em SaaS de despesas (Celery + Redis)',
      ],
      personalProjects: [
        'Pipeline de análise de ameaças com LLM (Celery + Redis)',
      ],
      solutions: [
        'Processamento assíncrono de relatórios PDF',
        'Integração com múltiplos brokers (Redis, RabbitMQ, AWS SQS)',
        'Scheduled tasks com Celery Beat',
        'Retry com backoff exponencial',
        'Task chains e groups',
      ],
      patterns: [
        'Task Queue',
        'Retry with Backoff',
        'Task Chains/Groups',
        'Scheduled Tasks (Beat)',
      ],
      order: 8,
    },
    {
      name: 'Kafka',
      categoryId: catId('mensageria-filas'),
      startYear: 2023,
      endYear: null as number | null,
      level: 'Intermediário',
      icon: 'kafka',
      profProjects: [
        'Motor de workflows distribuídos (comunicação entre 6 microsserviços)',
      ],
      personalProjects: [
        'Infraestrutura local com Kafka (Confluent)',
      ],
      solutions: [
        'Comunicação event-driven entre microsserviços',
        'Biblioteca unificada que abstrai Kafka, RabbitMQ, MQTT e BullMQ',
        'Configuração de topics, consumers e producers',
        'SSL/SASL authentication',
      ],
      patterns: [
        'Event-Driven Architecture',
        'Pub/Sub',
        'Adapter Pattern (multi-broker)',
      ],
      order: 9,
    },
    // --- CLOUD ---
    {
      name: 'Docker / Docker Compose',
      categoryId: catId('cloud-infra'),
      startYear: 2020,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'docker',
      profProjects: [
        'Todos os projetos desde 2019',
        'Multi-stage builds em produção',
        'Orquestração de 9 microsserviços + databases + cache',
      ],
      personalProjects: [
        'Infraestrutura local completa (12+ containers: PG, Mongo, Redis, RabbitMQ, Kafka, Ollama, Prometheus, Grafana)',
        'Todos os projetos pessoais',
      ],
      solutions: [
        'Multi-stage builds otimizados',
        'Docker Compose para dev e produção',
        'Health checks e restart policies',
        'Networking customizado entre serviços',
        'Volume management para persistencia',
      ],
      patterns: [
        'Multi-stage Build',
        'Container Orchestration',
        'Service Discovery (internal DNS)',
        'Health Checks',
      ],
      order: 10,
    },
    {
      name: 'AWS (EKS, SQS, S3, ECR)',
      categoryId: catId('cloud-infra'),
      startYear: 2020,
      endYear: 2022 as number | null,
      level: 'Intermediário',
      icon: 'aws',
      profProjects: [
        'Deploy de fintech regulada em AWS EKS (4 ambientes)',
        'Celery com SQS como broker em produção',
        'Armazenamento de documentos em S3',
        'Container registry privado (ECR)',
      ],
      personalProjects: [],
      solutions: [
        'Deploy em Kubernetes (EKS) com Helm charts',
        'Celery com SQS como broker (padrão enterprise)',
        'Migração Docker Hub para ECR',
        'boto3 para automação de serviços AWS',
      ],
      patterns: [
        'Infrastructure as Code (Helm)',
        'Multi-environment (dev/nonprod/sandbox/prod)',
        'Managed Kubernetes (EKS)',
      ],
      order: 11,
    },
    {
      name: 'VPS / nginx',
      categoryId: catId('cloud-infra'),
      startYear: 2025,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'nginx',
      profProjects: [
        'Deploy de SaaS de despesas corporativas (VPS Hostinger)',
        'Deploy de dashboard financeiro (VPS Hostinger)',
      ],
      personalProjects: [
        'Deploy de portfólio profissional',
      ],
      solutions: [
        'Reverse proxy com nginx (multi-servico)',
        'SSL/TLS com certificados',
        'Deploy automatizado com scripts Python (paramiko/SSH)',
        'Monitoramento com Uptime Kuma',
        'Backup e recovery',
      ],
      patterns: [
        'Reverse Proxy',
        'SSL Termination',
        'Zero-downtime Deploy',
      ],
      order: 12,
    },
    // --- IA / ML ---
    {
      name: 'LangChain / IA Generativa',
      categoryId: catId('ia-machine-learning'),
      startYear: 2025,
      endYear: null as number | null,
      level: 'Intermediário-Avançado',
      icon: 'ai',
      profProjects: [
        'OCR inteligente de recibos com Google GenAI + Mistral AI',
        'Relatórios automatizados com OpenAI',
      ],
      personalProjects: [
        'RAG com busca semântica (pgvector + LangChain)',
        'Análise de ameaças com LLMs multimodais (Gemini, OpenAI, Ollama)',
        'Pipeline de scoring de propostas com Gemini',
        'Hub de conhecimento (24 notebooks LangChain)',
      ],
      solutions: [
        'OCR com LLM Vision (extração estruturada de recibos)',
        'RAG pipeline completo (embedding + pgvector + retrieval + generation)',
        'Pipeline multi-LLM com fallback entre provedores',
        'Análise automatizada de segurança (STRIDE/DREAD)',
        'Scoring automatizado de textos com LLM',
      ],
      patterns: [
        'RAG (Retrieval-Augmented Generation)',
        'Chain of Thought',
        'Multi-provider Fallback',
        'Structured Output (Pydantic)',
        'Agent Pipeline',
      ],
      order: 13,
    },
    // --- FRONTEND ---
    {
      name: 'React + TypeScript',
      categoryId: catId('frontend'),
      startYear: 2025,
      endYear: null as number | null,
      level: 'Intermediário-Avançado',
      icon: 'react',
      profProjects: [
        'Frontend de SaaS de despesas corporativas (React 18 + TypeScript + Tailwind)',
        'Frontend de dashboard financeiro (React 18 + TypeScript)',
      ],
      personalProjects: [
        'Portfólio profissional (React 19 + TypeScript + Tailwind)',
        'Frontend de análise de ameaças (React 18 + Vite)',
      ],
      solutions: [
        'Aplicações SPA completas com custom hooks',
        'Formulários complexos com React Hook Form + Zod',
        'Lazy loading e code splitting',
        'Responsive design com Tailwind CSS',
        'Comunicação com APIs REST (fetch + JWT)',
      ],
      patterns: [
        'Custom Hooks',
        'Component Composition',
        'Lazy Loading (Suspense)',
        'Error Boundaries',
        'Controlled Forms',
      ],
      order: 14,
    },
    // --- TESTES ---
    {
      name: 'pytest / Playwright',
      categoryId: catId('testes-qualidade'),
      startYear: 2014,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'test',
      profProjects: [
        'Testes unitários e integração em todos os projetos Python',
        'E2E com Playwright em SaaS de despesas e dashboard financeiro',
      ],
      personalProjects: [
        'Testes em todos os projetos pessoais',
        'Web scraping com Playwright (automação de freelancing)',
      ],
      solutions: [
        'Cobertura 90%+ em projetos de produção',
        'Fixtures compartilhadas e factory pattern',
        'Testes de integração com banco real',
        'E2E completo com Playwright (login, CRUD, relatórios)',
        'Web scraping automatizado com Playwright',
      ],
      patterns: [
        'AAA (Arrange-Act-Assert)',
        'Factory Pattern (fixtures)',
        'Parametrized Tests',
        'Integration over Mocking',
        'Page Object Model (E2E)',
      ],
      order: 15,
    },
    // --- ARQUITETURA ---
    {
      name: 'Microsserviços',
      categoryId: catId('arquitetura-padroes'),
      startYear: 2020,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'architecture',
      profProjects: [
        'Fintech regulada (43+ microsserviços Python/Flask)',
        'E-commerce enterprise (24 microsserviços TypeScript, CQRS)',
        'SaaS de despesas corporativas (9 microsserviços Django + FastAPI)',
        'Motor de workflows distribuídos (6 microsserviços TypeScript)',
      ],
      personalProjects: [
        'Infraestrutura local completa (12+ containers)',
      ],
      solutions: [
        '82+ microsserviços em produção no total',
        'CQRS com PostgreSQL (command) + DynamoDB (query)',
        'Event-driven com Kafka entre serviços',
        'Framework compartilhado entre microsserviços',
        'Monorepo com bibliotecas internas (NPM privado)',
        'Multi-broker messaging (Kafka, RabbitMQ, MQTT, BullMQ)',
      ],
      patterns: [
        'CQRS',
        'Event-Driven Architecture',
        'API Gateway',
        'Service Mesh',
        'Monorepo',
        'Adapter/Strategy Pattern',
        'Repository Pattern',
        'Dependency Injection',
        'Clean Architecture',
        'SOLID Principles',
      ],
      order: 16,
    },
    {
      name: 'Integrações (SOAP/REST/APIs)',
      categoryId: catId('arquitetura-padroes'),
      startYear: 2012,
      endYear: null as number | null,
      level: 'Avançado',
      icon: 'api',
      profProjects: [
        '30+ integrações em turismo corporativo (GDS aéreo, hotéis, veículos, pagamentos)',
        'APIs do Banco Central (SCR) em fintech regulada',
        'Google Workspace APIs (Classroom, Meets, Drive, Gmail)',
        'Zoom API (reuniões, gravações, QoS)',
        'Assessment comportamental DISC',
      ],
      personalProjects: [
        'OpenAI / Gemini / Mistral APIs',
        'Automação com múltiplas APIs de plataformas de freelancing',
      ],
      solutions: [
        'Integrações SOAP complexas (zeep, suds, PySimpleSOAP)',
        'Engine de pricing e booking em tempo real',
        'OAuth2 com múltiplos providers',
        'Retry e fallback entre provedores',
        'Cache de respostas de APIs externas',
        'Parsing de XML/WSDL com certificados SSL',
      ],
      patterns: [
        'Adapter Pattern',
        'Circuit Breaker',
        'Retry with Backoff',
        'API Gateway',
        'OAuth2 Flow',
        'Cache-Aside',
      ],
      order: 17,
    },
  ];

  for (const stack of stacksData) {
    await prisma.stackDetail.create({
      data: {
        ...stack,
        userId: user.id,
      },
    });
  }
  console.log('Stack details criados:', stacksData.length);

  // =============================================
  // EDUCAÇÃO / FORMAÇÃO ACADÊMICA
  // =============================================
  const educationData = [
    {
      userId: user.id,
      title: 'Pós-graduação em Inteligência Artificial para Desenvolvedores',
      institution: 'FIAP',
      period: 'Em andamento',
      description: 'Formação avançada em Machine Learning, Deep Learning, NLP, Computer Vision e IA Generativa. Os 5 Tech Challenges fazem parte dessa formação, aplicando conceitos em cenários reais de produção.',
      status: 'in_progress',
      tags: ['Machine Learning', 'Deep Learning', 'NLP', 'Computer Vision', 'IA Generativa', 'LLMs'],
      order: 0,
    },
    {
      userId: user.id,
      title: 'MBA em Engenharia de Computação com IA',
      institution: 'Full Cycle',
      period: 'Em andamento',
      description: 'MBA focado em IA Generativa aplicada à engenharia de software: fundamentos de IA e LLMs, Prompt Engineering, agentes de codificação e busca semântica.',
      status: 'in_progress',
      tags: ['IA Generativa', 'LLMs', 'Prompt Engineering', 'RAG', 'LangChain', 'Agentes de IA'],
      order: 1,
    },
    {
      userId: user.id,
      title: 'Engenharia de Computação',
      institution: 'Fundação Santo André',
      period: '2009 - 2013',
      description: 'Graduação em Engenharia de Computação com base sólida em algoritmos, estruturas de dados, sistemas operacionais, redes, banco de dados e engenharia de software.',
      status: 'completed',
      tags: [],
      order: 2,
    },
    {
      userId: user.id,
      title: 'Técnico em Informática',
      institution: 'Colégio Singular',
      period: '2006 - 2008',
      description: 'Formação técnica em informática com fundamentos de programação, lógica, hardware e redes que deram início à carreira em tecnologia.',
      status: 'completed',
      tags: [],
      order: 3,
    },
  ];

  for (const edu of educationData) {
    await prisma.education.create({ data: edu });
  }
  console.log('Formações criadas:', educationData.length);

  // =============================================
  // CONFIGURAÇÕES DAS PÁGINAS
  // =============================================
  await prisma.siteSettings.upsert({
    where: { userId: user.id },
    update: {
      projectsPageTitle: 'Projetos Pessoais & Formação',
      projectsPageSubtitle: 'Projetos que desenvolvo para estudar, experimentar e aplicar tecnologias de ponta. Cada projeto resolve um problema real e demonstra habilidades que vão além do dia a dia profissional.',
      projectsGithubUrl: 'https://github.com/LucasBiason',
      projectsGithubLabel: 'Ver meu GitHub',
      projectsGithubHint: 'Todos os projetos com código-fonte aberto e documentação completa',
      careerPageTitle: 'Histórico Profissional',
      careerPageSubtitle: 'Trajetória completa com tipos de projeto, ações realizadas e stack utilizada em cada empresa.',
      stacksPageTitle: 'Stack & Ferramentas',
      stacksPageSubtitle: 'Detalhamento de cada tecnologia: tempo de uso, projetos, soluções e padrões aplicados.',
    },
    create: {
      userId: user.id,
      projectsPageTitle: 'Projetos Pessoais & Formação',
      projectsPageSubtitle: 'Projetos que desenvolvo para estudar, experimentar e aplicar tecnologias de ponta. Cada projeto resolve um problema real e demonstra habilidades que vão além do dia a dia profissional.',
      projectsGithubUrl: 'https://github.com/LucasBiason',
      projectsGithubLabel: 'Ver meu GitHub',
      projectsGithubHint: 'Todos os projetos com código-fonte aberto e documentação completa',
      careerPageTitle: 'Histórico Profissional',
      careerPageSubtitle: 'Trajetória completa com tipos de projeto, ações realizadas e stack utilizada em cada empresa.',
      stacksPageTitle: 'Stack & Ferramentas',
      stacksPageSubtitle: 'Detalhamento de cada tecnologia: tempo de uso, projetos, soluções e padrões aplicados.',
    },
  });
  console.log('Configurações de páginas criadas');

  // =============================================
  // VINCULAR STACKS AOS PROJETOS
  // =============================================
  const allStacks = await prisma.stackDetail.findMany({ where: { userId: user.id } });
  const stackNameMap: Record<string, string> = {};
  for (const s of allStacks) stackNameMap[s.name] = s.id;

  const allProjectsDb = await prisma.project.findMany({ where: { userId: user.id } });

  // Map: título do projeto contém -> nomes de stacks
  const projectStackMap: Record<string, string[]> = {
    'Engineering Knowledge Base': ['Python', 'LangChain / IA Generativa'],
    'My Local Place': ['Docker / Docker Compose', 'FastAPI', 'React + TypeScript', 'PostgreSQL', 'Redis', 'VPS / nginx'],
    'Threat Modeling AI': ['Python', 'FastAPI', 'React + TypeScript', 'PostgreSQL', 'Redis', 'Docker / Docker Compose', 'LangChain / IA Generativa', 'Celery', 'pytest / Playwright'],
    'Multi-Agent System': ['Python', 'Docker / Docker Compose'],
    'Fullcycle Semantic Search': ['Python', 'FastAPI', 'PostgreSQL', 'Docker / Docker Compose', 'LangChain / IA Generativa'],
    'ML Sales Forecasting': ['Python', 'FastAPI', 'Docker / Docker Compose', 'pytest / Playwright'],
    'ML Spam Classifier': ['Python', 'FastAPI', 'Docker / Docker Compose', 'pytest / Playwright'],
    'Fase 04': ['Python', 'pytest / Playwright'],
    'Fase 03': ['Python', 'LangChain / IA Generativa'],
    'Fase 02': ['Python', 'FastAPI', 'PostgreSQL', 'Docker / Docker Compose', 'pytest / Playwright'],
    'Fase 01': ['Python', 'FastAPI', 'Docker / Docker Compose', 'pytest / Playwright'],
  };

  for (const proj of allProjectsDb) {
    const matchKey = Object.keys(projectStackMap).find((key) => proj.title.includes(key));
    if (matchKey) {
      for (const stackName of projectStackMap[matchKey]) {
        const stackId = stackNameMap[stackName];
        if (stackId) {
          await prisma.projectStack.create({
            data: { projectId: proj.id, stackDetailId: stackId },
          }).catch(() => {}); // ignore duplicates
        }
      }
    }
  }
  console.log('Stacks vinculadas aos projetos');

  // =============================================
  // VINCULAR STACKS AOS CAREER ENTRIES
  // =============================================
  const allCareerDb = await prisma.careerEntry.findMany({ where: { userId: user.id } });

  const careerStackMap: Record<string, string[]> = {
    'Astracode': ['Python', 'Django / DRF', 'FastAPI', 'PostgreSQL', 'Redis', 'Docker / Docker Compose', 'LangChain / IA Generativa', 'React + TypeScript', 'pytest / Playwright', 'VPS / nginx'],
    'Rede Comunita': ['Python', 'Django / DRF', 'PostgreSQL', 'React + TypeScript', 'Docker / Docker Compose', 'pytest / Playwright', 'VPS / nginx'],
    'Voetur Turismo': ['Python', 'Django / DRF', 'PostgreSQL', 'Integrações (SOAP/REST/APIs)'],
    'FDTE': ['Python', 'Flask', 'TypeScript / Node.js', 'PostgreSQL', 'Redis', 'DynamoDB', 'Celery', 'Kafka', 'AWS (EKS, SQS, S3, ECR)', 'Docker / Docker Compose', 'pytest / Playwright', 'Microsserviços'],
    'Colaborativa': ['Python', 'Django / DRF', 'PostgreSQL'],
    'ITM Tecnologia': ['Python', 'Django / DRF', 'PostgreSQL', 'Redis', 'Celery', 'Integrações (SOAP/REST/APIs)'],
    'Leme Consultoria': ['Python', 'Django / DRF', 'PostgreSQL', 'Redis', 'Celery', 'pytest / Playwright'],
  };

  for (const career of allCareerDb) {
    const matchKey = Object.keys(careerStackMap).find((key) => career.company.includes(key) || career.role.includes(key));
    if (matchKey) {
      for (const stackName of careerStackMap[matchKey]) {
        const stackId = stackNameMap[stackName];
        if (stackId) {
          await prisma.careerStack.create({
            data: { careerEntryId: career.id, stackDetailId: stackId },
          }).catch(() => {});
        }
      }
    }
  }
  console.log('Stacks vinculadas ao histórico');

  console.log('Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

