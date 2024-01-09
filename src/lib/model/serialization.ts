import Zip from "jszip"
import { ItemDatabase, type Effect, type Tag } from "./graph"
import { map } from "$lib"


const FILE_NAME_SANITATION_REGEX = /[^a-z0-9.]/g

const ZIP_MIME_TYPES = ["application/zip", "application/x-zip-compressed"]


export async function serialize_item_db(database : ItemDatabase, file_name = database.name + ".zip") : Promise<File> {
  const image_names = new Map<File, string>()
  database.items.forEach((item) => {
    if (item.image) {
      const extension_position = item.image.name.lastIndexOf(".")
      const extension = extension_position >= 0 ? item.image.name.substring(extension_position) : ""
      image_names.set(item.image, to_file_name(item.name + extension))
    }
  })

  const effects = [...map(database.effects.values(), e => e.name)]
  const item_tags = [...map(database.item_tags.values(), e => e.name)]
  const conversion_tags = [...map(database.conversion_tags.values(), e => e.name)]

  const items = [...database.items].map((item) => {
    const serialized = {
      name: item.name,
      image: item.image ? image_names.get(item.image) : undefined,
      tags: [...map(item.tags.values(), t => t.name)],
      conversions: [...map(item.conversions.values(), conversion => ({
        tags: [...map(conversion.tags.values(), t => t.name)],
        inputs: [...map(conversion.inputs.values(), t => t.name)],
        outputs: [...map(conversion.outputs.values(), t => t.name)],
      }))],
    }
    return serialized
  })

  const json = JSON.stringify({
    name: database.name,
    effects,
    item_tags,
    conversion_tags,
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
  if (!ZIP_MIME_TYPES.includes(blob.type)) {
    throw new Error("Invalid item database file type.")
  }

  const zip = await Zip.loadAsync(blob)

  const images = new Map<string, File>()
  const image_folder = zip.folder("images")
  if (image_folder) {
    const image_file_promises : Promise<void>[] = []
    const load_file = async (file_name : string, file : Zip.JSZipObject) => {
      const blob = await file.async("blob")
      images.set(file_name, new File([blob], file_name, { type: blob.type }))
    }
    image_folder.forEach((file_name, file) => {
      image_file_promises.push(load_file(file_name, file))
    })

    await Promise.all(image_file_promises)
  }

  const json_file = zip.file("database.json")
  if (!json_file) {
    throw new Error("Cannot find item database file.")
  }
  const json = await json_file.async("text")

  const object = JSON.parse(json)

  const database = new ItemDatabase(object.name)

  const effects : Effect[] = object.effects.map((name : string) => database.effects_create(name))
  const effects_map = Object.fromEntries(effects.map(e => [e.name, e]))

  const item_tags : Tag[] = object.item_tags?.map((name : string) => database.item_tags_create(name)) ?? []
  const item_tags_map = Object.fromEntries(item_tags.map(t => [t.name, t]))

  const conversion_tags : Tag[] = object.conversion_tags?.map((name : string) => database.conversion_tags_create(name)) ?? []
  const conversion_tags_map = Object.fromEntries(conversion_tags.map(t => [t.name, t]))

  object.items.forEach((item : any) => {
    const instance = database.items_create(item.name, images.get(item.image))
    item.tags.forEach((tag : string) => instance.tags_add(item_tags_map[tag]))
    item.conversions.forEach((conversion : any) => {
      const conversion_instance = database.conversions_create()
      conversion.tags.forEach((tag : string) => conversion_instance.tags_add(conversion_tags_map[tag]))
      conversion.inputs.forEach((effect : string) => conversion_instance.inputs_add(effects_map[effect]))
      conversion.outputs.forEach((effect : string) => conversion_instance.outputs_add(effects_map[effect]))
      instance.conversions_add(conversion_instance)
    })
  })

  return database
}


function to_file_name(name : string) : string {
  return name.toLowerCase().replaceAll(FILE_NAME_SANITATION_REGEX, "_")
}
