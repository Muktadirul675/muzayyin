import { capitalize } from "vue"

export function convert_to_snake_word(string){
    let s = String(string).trim()
    return s.split(' ').join('_').toLowerCase()
}

export function convert_to_normal_word(string){
    let s = String(string)
    let ls = s.split('_').map((s)=>capitalize(s)).join(' ')
    return ls
}

export function transformSection(section) {
  return {
    type: section.type || '',
    title: section.title || '',
    subtitle: section.subtitle || '',
    notice_ids: (section.notices || []),
    image_ids: (section.images || []),
    image_each_slide: section.image_each_slide ?? null,
    category_ids: (section.categories || []).map(c => c.id),
    product_ids: (section.products || []).map(p => p.id),
    category_id: section.category?.id ?? null,
    products_each_slide: section.products_each_slide ?? null,
    slides: (section.slides || []).map(slide => ({
      ...slide,
      caption: slide.caption || '',
      link: slide.link || (slide.category_id ? `/category/${slide.category_id}` : '')
    })),
    args: section.args || {},
    is_active: section.is_active ?? true,
    position: section.position ?? 0
  }
}