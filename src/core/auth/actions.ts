'use server'

import { prisma as db } from '@/core/db'
import { createSession, deleteSession, getSession } from './session'
import { redirect } from 'next/navigation'
import bcrypt from 'bcryptjs'

export async function setupAdmin(formData: FormData) {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const projectName = formData.get('projectName') as string

  if (!name || !email || !password || !confirmPassword || !projectName) {
    return { error: 'Preencha todos os campos' }
  }

  if (password !== confirmPassword) {
    return { error: 'As senhas não coincidem' }
  }

  if (password.length < 8) {
    return { error: 'A senha deve ter pelo menos 8 caracteres' }
  }

  // Verifica se já existe um usuário
  const userCount = await db.user.count()
  if (userCount > 0) {
    return { error: 'O sistema já foi configurado' }
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  // Salva o usuário
  const user = await db.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    },
  })

  // Salva o nome do projeto
  await db.systemConfig.create({
    data: {
      key: 'projectName',
      value: projectName,
    }
  })

  // Cria a sessão
  await createSession(user.id)
  
  redirect('/')
}

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Preencha email e senha' }
  }

  const user = await db.user.findUnique({
    where: { email },
  })

  if (!user) {
    return { error: 'Credenciais inválidas' }
  }

  const isPasswordValid = await bcrypt.compare(password, user.password)

  if (!isPasswordValid) {
    return { error: 'Credenciais inválidas' }
  }

  await createSession(user.id)
  
  redirect('/')
}

export async function logout() {
  await deleteSession()
  redirect('/login')
}

export async function updateProfile(prevState: any, formData: FormData) {
  const session = await getSession()
  if (!session) {
    return { error: 'Usuário não autenticado' }
  }

  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const oldPassword = formData.get('oldPassword') as string
  const newPassword = formData.get('newPassword') as string

  if (!name || !email) {
    return { error: 'Nome e Email são obrigatórios' }
  }

  // Find user
  const user = await db.user.findUnique({
    where: { id: session.userId }
  })

  if (!user) {
    return { error: 'Usuário não encontrado' }
  }

  // Se o usuário quiser trocar a senha
  let dataToUpdate: any = { name, email }

  if (newPassword) {
    if (!oldPassword) {
      return { error: 'Para alterar a senha, você precisa informar a senha atual.' }
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password)
    if (!isPasswordValid) {
      return { error: 'A senha atual está incorreta.' }
    }

    if (newPassword.length < 8) {
      return { error: 'A nova senha deve ter pelo menos 8 caracteres.' }
    }

    dataToUpdate.password = await bcrypt.hash(newPassword, 10)
  }

  try {
    await db.user.update({
      where: { id: session.userId },
      data: dataToUpdate
    })
    return { success: 'Perfil atualizado com sucesso!' }
  } catch (error) {
    return { error: 'Erro ao atualizar o perfil. O e-mail já pode estar em uso.' }
  }
}
