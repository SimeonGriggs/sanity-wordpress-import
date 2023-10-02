export function getFilenameFromUrl(url?: string) {
  if (!url) {
    return null
  }

  try {
    return new URL(url).pathname.split('/').pop()
  } catch (error) {
    console.log(`Error parsing URL: ${url}`)
    console.error(error)
    return null
  }
}
