import DOMPurify, { type Config } from 'dompurify'

const ARTICLE_CONFIG: Config = {
  ALLOWED_TAGS: [
    'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
    'ul', 'ol', 'li', 'a', 'img', 'figure', 'figcaption',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div',
  ],
  ALLOWED_ATTR: [
    'href', 'title', 'target', 'rel', 'src', 'alt', 'width', 'height', 'loading',
  ],
  ALLOW_DATA_ATTR: false,
}

export function sanitizeArticleHtml(value?: string | null) {
  if (!value) return ''
  return DOMPurify.sanitize(value, ARTICLE_CONFIG)
}
