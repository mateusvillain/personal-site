import { sanity, imageUrl } from './_sanity.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  const locale = req.query?.locale === 'en' ? 'en' : 'pt'

  try {
    const docs = await sanity.fetch(
      `*[_type == "caseStudy" && isPublic == true]{
        title, "slug": slug.current, requiresPassword, coverImage
      }`
    )

    const projects = docs.map((doc) => ({
      title: doc.title?.[locale] || doc.title?.pt || '',
      slug: doc.slug || '',
      requires_password: doc.requiresPassword || false,
      cover_image: imageUrl(doc.coverImage)
    }))

    return res.status(200).json(projects)
  } catch (error) {
    console.error('Server error:', error)
    return res.status(500).json({ error: 'Erro interno' })
  }
}
