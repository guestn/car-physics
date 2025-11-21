// Utility function to get CSS custom property values
export const getCSSVariable = (variableName: string): string => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim()
}

// Convert CSS color to hex if needed
export const cssColorToHex = (cssColor: string): string => {
  // If it's already a hex color, return as is
  if (cssColor.startsWith('#')) {
    return cssColor
  }

  // Handle modern CSS color format: rgb(r g b / alpha%)
  if (cssColor.startsWith('rgb(')) {
    const rgbMatch = cssColor.match(
      /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*(\d+)%\)/
    )
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1])
      const g = parseInt(rgbMatch[2])
      const b = parseInt(rgbMatch[3])

      // Convert to hex
      const toHex = (n: number) => n.toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
  }

  // Handle legacy rgba format
  if (cssColor.startsWith('rgba')) {
    const rgbaMatch = cssColor.match(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
    )
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1])
      const g = parseInt(rgbaMatch[2])
      const b = parseInt(rgbaMatch[3])

      // Convert to hex
      const toHex = (n: number) => n.toString(16).padStart(2, '0')
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`
    }
  }

  return cssColor
}

// Convert CSS color to RGB array
export const cssColorToRgb = (
  cssColor: string
): [number, number, number, number] => {
  // Handle modern CSS color format: rgb(r g b / alpha%)
  if (cssColor.startsWith('rgb(')) {
    const rgbMatch = cssColor.match(
      /rgb\((\d+)\s+(\d+)\s+(\d+)\s*\/\s*(\d+)%\)/
    )
    if (rgbMatch) {
      return [
        parseInt(rgbMatch[1]),
        parseInt(rgbMatch[2]),
        parseInt(rgbMatch[3]),
        parseInt(rgbMatch[4]) / 100, // Convert percentage to decimal
      ]
    }
  }

  // Handle legacy rgba format
  if (cssColor.startsWith('rgba')) {
    const rgbaMatch = cssColor.match(
      /rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/
    )
    if (rgbaMatch) {
      return [
        parseInt(rgbaMatch[1]),
        parseInt(rgbaMatch[2]),
        parseInt(rgbaMatch[3]),
        parseFloat(rgbaMatch[4]),
      ]
    }
  }

  // Fallback for hex colors
  if (cssColor.startsWith('#')) {
    const hex = cssColor.slice(1)
    const r = parseInt(hex.slice(0, 2), 16)
    const g = parseInt(hex.slice(2, 4), 16)
    const b = parseInt(hex.slice(4, 6), 16)
    return [r, g, b, 1]
  }

  // Default fallback
  return [135, 206, 235, 1] // Sky blue
}
