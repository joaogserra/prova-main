const crypto = require('crypto');
const prisma = require('../src/prisma');

// Gera um hash de senha usando o módulo "crypto" que já vem no Node,
// então não precisa instalar nenhuma biblioteca nova (tipo bcrypt).
// O salt é guardado junto do hash, separado por ":", para poder conferir depois.
function hashSenha(senha) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(senha, salt, 64).toString('hex');
  return salt + ':' + hash;
}

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@sistema.com';
  const senha = process.env.ADMIN_PASSWORD || 'admin123';

  const adminExistente = await prisma.user.findUnique({ where: { email } });

  if (adminExistente) {
    console.log('Usuário administrador já existe (' + email + '). Nada a fazer.');
    return;
  }

  const admin = await prisma.user.create({
    data: {
      name: 'Administrador',
      email,
      passwordHash: hashSenha(senha),
      role: 'admin',
    },
  });

  console.log('Usuário administrador criado: ' + admin.email);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
