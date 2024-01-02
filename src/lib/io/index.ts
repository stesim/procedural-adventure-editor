export function download(file : File) : void {
  const object_url = URL.createObjectURL(file)

  const link = document.createElement("a")
  link.href = object_url
  link.download = file.name
  link.hidden = true

  link.click();

  URL.revokeObjectURL(object_url)
}


export async function upload(type : string) : Promise<File | undefined> {
  return new Promise((resolve) => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = type
    input.addEventListener("change", () => resolve(input.files?.[0]))
    input.addEventListener("cancel", () => resolve(undefined))
    input.click()
  })
}
