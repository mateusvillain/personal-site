export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Senha não informada' })
  }

  if (password !== process.env.PASSWORD_LOCAWEB_DS) {
    return res.status(401).json({ error: 'Senha incorreta' })
  }

  // Conteúdo confidencial
  const content = {
    title: 'Informações confidenciais bacanas!',
    description: 'Conteúdo liberado somente após autenticação.',
    sections: [
      {
        type: 'heading',
        level: 3,
        value: 'Projeto Locaweb Design System'
      },
      {
        type: 'block-title',
        value: 'Esse projeto envolveu decisões estratégicas e métricas internas.'
      },
      {
        type: 'text',
        value: 'Esse projeto envolveu decisões estratégicas e métricas internas.'
      },
      {
        type: 'quote',
        value: 'Esse projeto reduziu em 30% o tempo de desenvolvimento.'
      },
      {
        type: 'list',
        items: [
          'Padronização de componentes',
          'Redução de retrabalho',
          'Melhoria de consistência'
        ]
      },
      {
        type: 'link',
        label: 'Acessar protótipo',
        url: 'https://exemplo.com',
        external: true
      },
      {
        type: 'image',
        src: '/img/mateus-villain.jpg',
        alt: 'Visão geral do projeto'
      }
    ]
  }

  const isSession = password === '__SESSION__'

  if (!isSession && password !== process.env.PASSWORD_LOCAWEB_DS) {
    return res.status(401).json({ error: 'Senha incorreta' })
  }

  return res.status(200).json(content)
}
