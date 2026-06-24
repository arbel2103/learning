/** Extract a YouTube video id from common URL shapes, or null if not YouTube. */
export function youtubeId(url: string): string | null {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    if (host === 'youtu.be') return u.pathname.slice(1) || null
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (u.pathname === '/watch') return u.searchParams.get('v')
      if (u.pathname.startsWith('/embed/')) return u.pathname.split('/')[2] ?? null
      if (u.pathname.startsWith('/shorts/')) return u.pathname.split('/')[2] ?? null
    }
    return null
  } catch {
    return null
  }
}
