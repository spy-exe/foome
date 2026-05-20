import * as Crypto from 'expo-crypto';
import { salvarUsuario, getUsuario, removerUsuario } from './storage';

export async function hashSenha(senha) {
  return await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    senha
  );
}

async function migrarSenhaLegada(usuario) {
  if (!usuario || usuario.senhaHash || !usuario.senha) return usuario;

  const migrado = {
    ...usuario,
    senhaHash: await hashSenha(usuario.senha),
  };
  delete migrado.senha;

  await salvarUsuario(migrado);
  return migrado;
}

export async function validarSessao() {
  const usuario = await getUsuario();
  return await migrarSenhaLegada(usuario);
}

export async function autenticar(email, senha) {
  const usuarioSalvo = await getUsuario();

  if (!usuarioSalvo) {
    return { sucesso: false, erro: 'email_nao_encontrado', usuario: null };
  }

  const emailNormalizado = email.trim().toLowerCase();
  const emailSalvo = usuarioSalvo.email?.trim().toLowerCase();

  if (emailNormalizado !== emailSalvo) {
    return { sucesso: false, erro: 'email_nao_encontrado', usuario: null };
  }

  const usuario = await migrarSenhaLegada(usuarioSalvo);
  const hash = await hashSenha(senha);

  if (hash !== usuario.senhaHash) {
    return { sucesso: false, erro: 'senha_incorreta', usuario: null };
  }

  return { sucesso: true, erro: null, usuario };
}

export async function cadastrar({ nome, email, senha, fotoUri }) {
  const emailNormalizado = email.trim().toLowerCase();
  const existente = await getUsuario();

  if (existente?.email?.trim().toLowerCase() === emailNormalizado) {
    return { sucesso: false, erro: 'email_duplicado' };
  }

  const usuario = {
    nome: nome.trim(),
    email: emailNormalizado,
    senhaHash: await hashSenha(senha),
    fotoUri: fotoUri || null,
    criadoEm: new Date().toISOString(),
  };

  await salvarUsuario(usuario);
  return { sucesso: true, erro: null, usuario };
}

export async function logout() {
  await removerUsuario();
}
