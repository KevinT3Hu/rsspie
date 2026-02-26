import DOMPurify from 'isomorphic-dompurify';

// Allowed tags for RSS content - safe semantic HTML only
const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'strong', 'b', 'em', 'i', 'u', 'strike', 'del', 's',
  'a', 'abbr', 'acronym', 'address',
  'blockquote', 'cite', 'q',
  'code', 'pre', 'kbd', 'samp', 'var',
  'ul', 'ol', 'li', 'dl', 'dt', 'dd',
  'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption', 'colgroup', 'col',
  'div', 'span', 'small', 'sub', 'sup', 'mark', 'time', 'wbr',
  'details', 'summary', 'figure', 'figcaption',
  // Do NOT include: img, picture, video, audio, source, iframe, embed, object, canvas, svg, math, script, style, link, meta, form, input, textarea, button, select, option
];

// Allowed attributes - minimal and safe
const ALLOWED_ATTR = [
  'href', 'title', 'target',
  'src', // Will be filtered out by hook, but listed for completeness
  'alt', 'title',
  'cite', 'datetime',
  'colspan', 'rowspan', 'headers',
  'start', 'reversed', 'type', // for ol
  'class', 'id',
  'lang', 'dir',
];

// Protocols allowed in URLs
const ALLOWED_URI_REGEXP = /^(?:(?:https?|mailto|tel|sms|data):|[^a-z]|[a-z+.-]+(?:[^a-z+._-]|$))/i;

/**
 * Sanitizes HTML content for safe display
 * - Removes all event handlers (onclick, onerror, etc.)
 * - Removes javascript: URLs
 * - Removes images and other media
 * - Allows only safe HTML tags
 */
export function sanitizeHtml(dirty: string | null | undefined): string {
  if (!dirty) return '';

  // Add a hook to specifically strip src attributes (images)
  DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
    // Remove any src attribute (prevents images)
    if (data.attrName === 'src') {
      data.keepAttr = false;
    }
    // Remove any background-image styles
    if (data.attrName === 'style') {
      data.keepAttr = false;
    }
    // Ensure links open safely
    if (data.attrName === 'target' && node.tagName === 'A') {
      // Only allow _blank target with proper rel
      if (data.attrValue !== '_blank') {
        data.keepAttr = false;
      }
    }
  });

  // Add hook to ensure links have proper rel attributes
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A') {
      const href = node.getAttribute('href');
      // Remove javascript: URLs that might slip through
      if (href && /^(?:javascript|data|vbscript):/i.test(href)) {
        node.removeAttribute('href');
        node.removeAttribute('target');
      } else {
        // Add security attributes for external links
        node.setAttribute('rel', 'noopener noreferrer nofollow');
        node.setAttribute('target', '_blank');
      }
    }
  });

  const clean = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOWED_URI_REGEXP,
    // Strip all event handlers
    ALLOW_DATA_ATTR: false,
    // Prevent DOM clobbering
    SANITIZE_DOM: true,
    // Keep the content of removed elements (don't remove text inside script/style)
    KEEP_CONTENT: true,
    // Return entire document or just body content
    WHOLE_DOCUMENT: false,
    // Return a string
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  });

  // Clean up hooks to prevent memory leaks
  DOMPurify.removeHook('uponSanitizeAttribute');
  DOMPurify.removeHook('afterSanitizeAttributes');

  return clean;
}

/**
 * Checks if content contains potentially dangerous HTML
 * Used to determine if sanitization banner should be shown
 */
export function containsDangerousContent(content: string | null | undefined): boolean {
  if (!content) return false;

  const dangerousPatterns = [
    /<script\b/i,
    /<style\b/i,
    /javascript:/i,
    /on\w+\s*=/i, // event handlers like onclick, onerror, etc.
    /<iframe\b/i,
    /<embed\b/i,
    /<object\b/i,
  ];

  return dangerousPatterns.some(pattern => pattern.test(content));
}

/**
 * Checks if content contains images
 */
export function containsImages(content: string | null | undefined): boolean {
  if (!content) return false;
  return /<img\b/i.test(content);
}
