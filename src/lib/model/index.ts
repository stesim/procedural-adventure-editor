import Zip from "jszip"


const FILE_NAME_SANITATION_REGEX = /[^a-z0-9.]/g


export type Effect = {
  name : string
}


export type EffectConversion = {
  inputs : Effect[]
  outputs : Effect[]
}


export type Item = {
  name : string
  image? : File
  conversions : EffectConversion[]
}


export type ItemDatabase = {
  name : string
  effects : Effect[]
  items : Item[]
}


export async function serialize_item_db(database : ItemDatabase, file_name = database.name + ".zip") : Promise<File> {
  const image_names = new Map<File, string>()
  database.items.forEach((item) => {
    if (item.image) {
      const extension_position = item.image.name.lastIndexOf(".")
      const extension = extension_position >= 0 ? item.image.name.substring(extension_position) : ""
      image_names.set(item.image, to_file_name(item.name + extension))
    }
  })

  const effects = database.effects.map(e => e.name).sort()

  const items = database.items.map((item) => {
    const serialized = {
      name: item.name,
      image: item.image ? image_names.get(item.image) : undefined,
      conversions: item.conversions.map(conversion => ({
        inputs: conversion.inputs.map(e => e.name),
        outputs: conversion.outputs.map(e => e.name),
      })),
    }
    return serialized
  })

  const json = JSON.stringify({
    name: database.name,
    effects,
    items,
  })

  const zip = new Zip()
  zip.file("database.json", json)

  const image_folder = zip.folder("images")!
  image_names.forEach((name, file) => {
    image_folder.file(name, file)
  })

  const blob = await zip.generateAsync({ type: "blob",  })
  return new File([blob], to_file_name(file_name), { type: blob.type })
}


export async function deserialize_item_db(blob : Blob) : Promise<ItemDatabase> {
  if (!blob.type.startsWith("application/zip")) {
    throw new Error("Invalid item database file type.")
  }

  const zip = await Zip.loadAsync(blob)

  const image_folder = zip.folder("images")
  if (!image_folder) {
    throw new Error("Cannot find image folder.")
  }

  const images = new Map<string, File>()
  const image_file_promises : Promise<void>[] = []
  const load_file = async (file_name : string, file : Zip.JSZipObject) => {
    const blob = await file.async("blob")
    images.set(file_name, new File([blob], file_name, { type: blob.type }))
  }
  image_folder.forEach((file_name, file) => {
    image_file_promises.push(load_file(file_name, file))
  })

  await Promise.all(image_file_promises)

  const json_file = zip.file("database.json")
  if (!json_file) {
    throw new Error("Cannot find item database file.")
  }
  const json = await json_file.async("text")

  const object = JSON.parse(json)

  const effects : Effect[] = object.effects.map((name : string) => ({ name }))
  const effects_map = Object.fromEntries(effects.map(e => [e.name, e]))

  const items = object.items.map((item : any) => {
    return {
      name: item.name,
      image: item.image ? images.get(item.image) : undefined,
      conversions: item.conversions.map((conversion : any) => ({
        inputs: conversion.inputs.map((effect : string) => effects_map[effect]),
        outputs: conversion.outputs.map((effect : string) => effects_map[effect]),
      }))
    }
  })

  return {
    name: object.name,
    effects,
    items,
  }
}


function to_file_name(name : string) : string {
  return name.toLowerCase().replaceAll(FILE_NAME_SANITATION_REGEX, "_")
}
