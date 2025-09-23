export function cloudinaryUrl(
  url: string | undefined,
  width: number,
  height: number,
  format: "webp" | "jpg" | "auto" = "webp"
) {
  if (!url) return ""           // evita errores si url es undefined
  if (!url.includes("/upload/")) return url
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_fill,f_${format}/`
  )
}
