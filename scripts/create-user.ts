/**
 * Script interativo para criação do usuário inicial do Portfolio Suite.
 *
 * Uso:
 *   npx tsx scripts/create-user.ts
 *
 * O script solicita nome, email e senha no terminal e cria o usuário
 * com perfil e configurações padrão no banco de dados.
 *
 * Requer DATABASE_URL configurado em configs/.env ou como variável de ambiente.
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as readline from 'readline';

const prisma = new PrismaClient();

function ask(question: string, hidden = false): Promise<string> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    if (hidden) {
      // Ocultar input de senha
      process.stdout.write(question);
      const stdin = process.openStdin();
      let password = '';
      const onData = (char: Buffer) => {
        const c = char.toString();
        if (c === '\n' || c === '\r') {
          stdin.removeListener('data', onData);
          process.stdout.write('\n');
          rl.close();
          resolve(password);
        } else if (c === '\u007F' || c === '\b') {
          // Backspace
          password = password.slice(0, -1);
          process.stdout.clearLine(0);
          process.stdout.cursorTo(0);
          process.stdout.write(question + '*'.repeat(password.length));
        } else {
          password += c;
          process.stdout.write('*');
        }
      };
      stdin.on('data', onData);
    } else {
      rl.question(question, (answer) => {
        rl.close();
        resolve(answer.trim());
      });
    }
  });
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  console.log('\n=== Portfolio Suite - Criação de Usuário ===\n');

  // Verificar se já existe um usuário
  const existingCount = await prisma.user.count();
  if (existingCount > 0) {
    console.log(`Já existe(m) ${existingCount} usuário(s) no banco.`);
    const proceed = await ask('Deseja criar outro? (s/n): ');
    if (proceed.toLowerCase() !== 's') {
      console.log('Operação cancelada.');
      return;
    }
  }

  // Coletar dados
  const displayName = await ask('Nome completo: ');
  if (!displayName) {
    console.error('Nome é obrigatório.');
    return;
  }

  const email = await ask('Email: ');
  if (!email || !email.includes('@')) {
    console.error('Email inválido.');
    return;
  }

  // Verificar email duplicado
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.error(`Já existe um usuário com o email ${email}.`);
    return;
  }

  const password = await ask('Senha (mínimo 8 caracteres): ', true);
  if (password.length < 8) {
    console.error('Senha deve ter no mínimo 8 caracteres.');
    return;
  }

  const confirmPassword = await ask('Confirme a senha: ', true);
  if (password !== confirmPassword) {
    console.error('As senhas não conferem.');
    return;
  }

  // Criar usuário
  const slug = slugify(displayName);
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      displayName,
      slug,
      active: true,
    },
  });

  // Criar perfil padrão
  await prisma.profile.create({
    data: {
      userId: user.id,
      title: displayName,
      subtitle: 'Meu Portfólio',
      bio: '',
      highlights: [],
    },
  });

  // Criar configurações padrão
  await prisma.siteSettings.create({
    data: {
      userId: user.id,
    },
  });

  console.log(`\nUsuário criado com sucesso!`);
  console.log(`  Nome: ${displayName}`);
  console.log(`  Email: ${email}`);
  console.log(`  Slug: ${slug}`);
  console.log(`  ID: ${user.id}`);
  console.log(`\nAcesse /admin/login para entrar no painel.\n`);
}

main()
  .catch((e) => {
    console.error('Erro:', e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
