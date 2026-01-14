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
    bio: 'Mais de 10 anos de experiência construindo sistemas robustos, integrados e orientados a impacto real no negócio.\n\nTrabalho principalmente com Python (Django, FastAPI), focando em regras de negócio complexas, automação de processos e integração entre sistemas.\n\nMinha abordagem prioriza código limpo, testes automatizados e arquitetura sustentável para garantir que o software realmente resolva problemas e seja fácil de evoluir.',
    highlights: [
      '10+ anos de experiência em backend',
      'Especialista em Python (Django, FastAPI)',
      'Arquitetura de APIs escaláveis',
      'Automação de processos e integrações',
      'Código limpo e testes automatizados',
      'Manutenção e evolução de sistemas legados',
    ],
    avatarUrl: 'http://localhost:3001/assets/img/avatar.jpg',
    heroBackgroundUrl: null,
    seoTitle: 'Lucas Biason | Senior Backend Engineer - Python, APIs & Automation',
    seoDescription: 'Senior Backend Engineer com 10+ anos de experiência em Python, Django, FastAPI, APIs escaláveis e automação de processos. Especialista em construir sistemas robustos que resolvem problemas reais.',
    footerTitle: 'Lucas Biason',
    footerDescription: 'Senior Backend Engineer especializado em Python, APIs e automação de processos',
    footerTagline: 'Transformando regras de negócio complexas em sistemas confiáveis',
    sectionProjectsTitle: 'Projetos em Destaque',
    sectionProjectsSubtitle: 'Sistemas que resolvem problemas reais com arquitetura sólida e código limpo',
    contactTitle: null,
    contactSubtitle: null,
    contactDescription: null,
    createdAt: new Date('2026-01-09T12:20:47.622Z'),
    updatedAt: new Date('2026-01-09T12:34:02.610Z'),
  };

  // Limpa dados existentes
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

  // Cria projects, services, contacts (dados completos do JSON)
  // Por enquanto, apenas user e profile para testar
  console.log('✅✅✅ Seed concluído!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

