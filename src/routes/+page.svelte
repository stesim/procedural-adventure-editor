<script lang="ts">
  import "./styles.css"

  import { deserialize_item_db, serialize_item_db, type Effect, type EffectConversion, type Item, type ItemDatabase } from "$lib/model"
  import EffectConversionEditor from "./effect_conversion_editor.svelte"
  import { download, upload } from "$lib/io"
  import ImagePicker from "./image_picker.svelte"


  const SVELTE_TYPE_WORKAROUND : any = undefined


  let item_db : ItemDatabase = create_example_db()

  let selected_item : Item | undefined = item_db.items?.[0]

  let selected_effect : Effect | undefined = undefined


  $: if (selected_item && !item_db.items.includes(selected_item)) {
    selected_item = undefined
  } else if (!selected_item && item_db.items.length > 0) {
    selected_item = item_db.items[0]
  }


  function create_new_item_db() : void {
    if (!confirm("Are you sure you want to create a new item database?\nUnsaved changes will be discarded.")) {
      return
    }

    item_db = {
      name: "Unnamed Item Database",
      items: [],
      effects: [],
    }
    selected_item = undefined
  }


  async function import_item_db() : Promise<void> {
    const file = await upload("application/zip")
    if (file) {
      item_db = await deserialize_item_db(file)
      selected_item = undefined
    }
  }


  async function export_item_db() : Promise<void> {
    const file = await serialize_item_db(item_db)
    download(file)
  }


  function rename_item_db() : void {
    const new_name = prompt("Enter item database name:", item_db.name)
    if (new_name) {
      item_db.name = new_name
    }
  }


  function add_item() : void {
    const name = prompt("Enter item name:")
    if (!name) {
      return
    }

    const item : Item = {
      name,
      conversions: [],
    }

    item_db.items.push(item)
    item_db.items.sort((a, b) => a.name.localeCompare(b.name))

    selected_item = item

    item_db = item_db
  }


  function remove_item(item : Item) : void {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return
    }

    const index = item_db.items.indexOf(item)
    if (index < 0) {
      throw new Error("invalid item")
    }
    item_db.items.splice(index, 1)

    item_db = item_db
  }


  function rename_item(item : Item) : void {
    const name = prompt("Enter item name:", item.name)
    if (name) {
      item.name = name

      item_db = item_db
      if (selected_item === item) {
        selected_item = item
      }
    }
  }


  function change_item_image(item : Item, image : File | undefined) : void {
    item.image = image

    item_db = item_db
    if (selected_item === item) {
      selected_item = item
    }
  }


  function add_effect() : void {
    const name = prompt("Enter effect name:")
    if (!name) {
      return
    }

    const effect : Effect = { name }
    item_db.effects.push(effect)
    item_db.effects.sort((a, b) => a.name.localeCompare(b.name))

    item_db = item_db
  }


  function remove_effect(effect : Effect) : void {
    if (!confirm(`Are you sure you want to delete "${effect.name}"?\nAll references to the effect will be removed from the item database.`)) {
      return
    }

    const index = item_db.effects.indexOf(effect)
    if (index < 0) {
      throw new Error("invalid effect")
    }
    item_db.effects.splice(index, 1)

    for (const item of item_db.items) {
      for (const conversion of item.conversions) {
        const input_index = conversion.inputs.indexOf(effect)
        if (input_index >= 0) {
          conversion.inputs.splice(input_index, 1)
        }
        const output_index = conversion.outputs.indexOf(effect)
        if (output_index >= 0) {
          conversion.outputs.splice(output_index, 1)
        }
      }
    }

    item_db = item_db
    selected_item = selected_item
  }


  function rename_effect(effect : Effect) : void {
    const name = prompt("Enter effect name:", effect.name)
    if (name) {
      effect.name = name

      item_db = item_db
      selected_item = selected_item
    }
  }


  function add_conversion(item : Item) : void {
    const conversion : EffectConversion = { inputs: [], outputs: [] }
    item.conversions.push(conversion)

    item_db = item_db
  }


  function remove_conversion(item : Item, conversion : EffectConversion) : void {
    if (!confirm(`Are you sure you want to delete the effect conversion?`)) {
      return
    }

    const index = item.conversions.indexOf(conversion)
    if (index < 0) {
      throw new Error("item does not contain conversion")
    }
    item.conversions.splice(index, 1)

    item_db = item_db
  }


  function create_example_db() : ItemDatabase {
    const effects = ["electricity", "heat", "light"].sort().map(name => ({name}))

    const conversion_inputs = ["electricity"]
    const conversion_outputs = ["heat", "light"]
    const conversion : EffectConversion = {
      inputs: effects.filter(e => conversion_inputs.includes(e.name)),
      outputs: effects.filter(e => conversion_outputs.includes(e.name)),
    }

    const db : ItemDatabase = {
      name: "Example Item Database",
      items: [{name: "light bulb", conversions: [conversion]}],
      effects,
    }

    return db
  }
</script>


<div class="main-layout">
  <menu class="stretch">
    <li><button on:click={create_new_item_db}>New</button></li>
    <li><button on:click={import_item_db}>Load</button></li>
    <li><button on:click={export_item_db}>Save</button></li>
  </menu>
  <header>
    <h1>{item_db.name}</h1>
    <button class="flat" on:click={rename_item_db} title="Rename Item Database">🖉</button>
  </header>
  <header class="centered">
    {item_db.effects.length} effects, {item_db.items.length} items
  </header>
  <aside>
    <header>
      <h2>Items</h2>
      <menu>
        <li><button class="flat large" on:click={add_item} title="Add Item">+</button></li>
      </menu>
    </header>
    <ul class="scrollable">
      {#each item_db.items as item, index (item)}
        {@const id = `radio-button-item-${index}`}
        <li>
          <input type="radio" {id} bind:group={selected_item} value={item}>
          <label for={id} class="item-row">
            <span class="fill-right">{item.name}</span>
            <button class="flat on-parent-hover" on:click={() => rename_item(item)} title="Rename Item" style="line-height: 1.25em;">🖉</button>
            <button class="flat on-parent-hover" on:click={() => remove_item(item)} title="Delete Item">❌</button>
          </label>
        </li>
      {/each}
    </ul>
  </aside>
  <main style="row-gap: 0;">
    <header style="z-index: 1;">
      {#if selected_item}
        <h2 class="centered">{selected_item?.name ?? ""}</h2>
        <menu>
          <li>
            <button
              class="flat large"
              on:click={() => add_conversion(selected_item ?? SVELTE_TYPE_WORKAROUND)}
              title="Add Effect Conversion"
            >+</button>
          </li>
        </menu>
      {/if}
    </header>
    {#if selected_item}
      <div class="main-container scrollable">
        <div class="item-image-container">
          <ImagePicker
            source={selected_item.image}
            on:change={(evt) => change_item_image(selected_item ?? SVELTE_TYPE_WORKAROUND, evt.detail)}
          />
        </div>
        <div class="conversion-list">
          {#each selected_item.conversions as conversion (conversion)}
            <div class="conversion">
              <EffectConversionEditor effects={item_db.effects} {conversion}/>
              <menu>
                <li>
                  <button
                    on:click={() => remove_conversion(selected_item ?? SVELTE_TYPE_WORKAROUND, conversion)}
                    title="Delete Effect Conversion"
                  >❌</button>
                </li>
              </menu>
            </div>
          {/each}
        </div>
      </div>
    {/if}
  </main>
  <aside>
    <header>
      <h2>Effects</h2>
      <menu>
        <li><button class="flat large" on:click={add_effect} title="Add Effect">+</button></li>
      </menu>
    </header>
    <ul class="scrollable">
      {#each item_db.effects as effect, index (effect)}
        {@const id = `radio-button-effect-${index}`}
        <li>
          <input type="radio" {id} bind:group={selected_effect} value={effect}>
          <label for={id} class="item-row">
            <span class="fill-right">{effect.name}</span>
            <button class="flat on-parent-hover" on:click={() => rename_effect(effect)} title="Rename Effect" style="line-height: 1.25em;">🖉</button>
            <button class="flat on-parent-hover" on:click={() => remove_effect(effect)} title="Delete Effect">❌</button>
          </label>
        </li>
      {/each}
    </ul>
  </aside>
</div>


<style>
  .main-layout {
    display: grid;
    grid-template-columns: 2fr 6fr 2fr;
    grid-template-rows: auto 1fr;
    gap: 0.5em;
    height: 100vh;
    padding: 0.5em;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.25);
  }


  .main-layout > * {
    position: relative;
    border-radius: 0.5em;
    overflow: hidden;
  }


  .main-layout > *::after {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    border-radius: 0.5em;
    box-shadow: inset 0 0 0.5em rgba(0, 0, 0, 0.75);
    pointer-events: none;
    z-index: 10;
  }


  main,
  aside {
    background-color: var(--palette-0);
    display: grid;
    grid-template-rows: auto 1fr;
    row-gap: 0.5rem;
  }


  h1 {
    font-size: inherit;
    margin: 0 auto;
    padding: 0.5em;
  }


  header {
    background-color: var(--palette-1);
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0 0.75rem;
  }


  header.centered {
    justify-content: center;
  }


  aside > header,
  main > header {
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.75);
    min-height: 1.5rem;
    padding: 0.5rem 0.75rem;
  }


  h2 {
    font-size: inherit;
    margin: 0;
    margin-right: auto;
  }


  h2.centered {
    margin: 0 auto;
  }


  .scrollable {
    overflow: auto;
  }


  menu {
    list-style: none;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin: 0;
    padding: 0;
    gap: 0.25em;
  }


  menu.stretch {
    align-items: stretch;
    justify-content: stretch;
  }


  menu.stretch > li {
    display: contents;
  }


  menu.stretch > li > * {
    flex-grow: 1;
  }


  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
  }


  li > input[type=radio] {
    display: none;
  }


  li > label {
    display: block;
    color: var(--palette-2);
  }


  li > label:hover {
    color: var(--palette-4);
  }


  .item-row {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    min-height: 1.5em;
    padding: 0 0.75rem;
    gap: 0.25em;
  }


  .item-row > span {
    align-self: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
  }


  .fill-right {
    margin-right: auto;
  }


  button.flat {
    appearance: none;
    background: none;
    outline: none;
    border: none;
    color: inherit;
  }


  button.flat:hover {
    background-color: rgba(255, 255, 255, 0.125);
  }


  button.flat.large {
    font-size: inherit;
    padding: 0.125em 0.5em;
  }


  :not(:hover) > .on-parent-hover {
    display: none;
  }


  :checked + label {
    background-color: var(--palette-2);
    background-color: rgba(255, 255, 255, 0.125);
    color: var(--palette-4);
  }


  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-top: 1rem;
  }


  .item-image-container {
    width: 9em;
    height: 9em;
    display: grid;
    grid-template-columns: 100%;
    grid-template-rows: 100%;
    background-color: var(--palette-1);
    border-radius: 0.5em;
    padding: 0.5em;
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
    flex-shrink: 0;
  }


  .conversion-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
    padding: 1em;
  }


  .conversion {
    position: relative;
    min-width: 20em;
    background-color: var(--palette-1);
    border-radius: 0.5em;
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
  }


  .conversion > menu {
    position: absolute;
    right: 0;
    top: 50%;
    translate: 50% -50%;
    flex-direction: column;

    opacity: 0.0;
    transition: opacity 0.125s ease-in-out;
  }


  .conversion:hover > menu {
    opacity: 1.0;
  }
</style>
