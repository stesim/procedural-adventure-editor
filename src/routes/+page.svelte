<script lang="ts">
  import "./styles.css"

  import { deserialize_item_db, serialize_item_db, Effect, EffectConversion, Item, ItemDatabase, Tag } from "$lib/model"
  import { download, upload } from "$lib/io"
  import ItemEditor from "./item_editor.svelte"


  let item_db : ItemDatabase = create_example_db()

  let selected_item : Item | undefined = undefined

  let selected_effect : Effect | undefined = undefined


  $: if (selected_item && !item_db.items.has(selected_item)) {
    selected_item = undefined
  } else if (!selected_item && item_db.items.size > 0) {
    selected_item = item_db.items.values().next().value
  }


  function create_new_item_db() : void {
    if (!confirm("Are you sure you want to create a new item database?\nUnsaved changes will be discarded.")) {
      return
    }

    item_db = new ItemDatabase("Unnamed Item Database")
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

    const item = item_db.items_create(name)

    selected_item = item

    item_db = item_db
  }


  function remove_item(item : Item) : void {
    if (!confirm(`Are you sure you want to delete "${item.name}"?`)) {
      return
    }

    item_db.items_delete(item)

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


  function add_effect() : void {
    const name = prompt("Enter effect name:")
    if (!name) {
      return
    }

    item_db.effects_create(name)

    item_db = item_db
  }


  function remove_effect(effect : Effect) : void {
    if (!confirm(`Are you sure you want to delete "${effect.name}"?\nAll references to the effect will be removed from the item database.`)) {
      return
    }

    item_db.effects_delete(effect)

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


  function add_item_tag() : void {
    const name = prompt("Enter tag name:")
    if (!name) {
      return
    }

    item_db.item_tags_create(name)

    item_db = item_db
  }


  function remove_item_tag(tag : Tag) : void {
    if (!confirm(`Are you sure you want to delete "${tag.name}"?\nAll references to the tag will be removed from the item database.`)) {
      return
    }

    item_db.item_tags_delete(tag)

    item_db = item_db
    selected_item = selected_item
  }


  function rename_item_tag(tag : Tag) : void {
    const name = prompt("Enter tag name:", tag.name)
    if (name) {
      tag.name = name

      item_db = item_db
      selected_item = selected_item
    }
  }


  function add_conversion_tag() : void {
    const name = prompt("Enter tag name:")
    if (!name) {
      return
    }

    item_db.conversion_tags_create(name)

    item_db = item_db
  }


  function remove_conversion_tag(tag : Tag) : void {
    if (!confirm(`Are you sure you want to delete "${tag.name}"?\nAll references to the tag will be removed from the item database.`)) {
      return
    }

    item_db.conversion_tags_delete(tag)

    item_db = item_db
    selected_item = selected_item
  }


  function rename_conversion_tag(tag : Tag) : void {
    const name = prompt("Enter tag name:", tag.name)
    if (name) {
      tag.name = name

      item_db = item_db
      selected_item = selected_item
    }
  }


  function create_example_db() : ItemDatabase {
    const db = new ItemDatabase("Example Item Database")

    const effects = ["electricity", "heat", "light"].map(name => db.effects_create(name))

    const conversion_inputs = ["electricity"]
    const conversion_outputs = ["heat", "light"]
    const conversion = db.conversions_create()
    effects.filter(e => conversion_inputs.includes(e.name)).forEach(e => conversion.inputs_add(e))
    effects.filter(e => conversion_outputs.includes(e.name)).forEach(e => conversion.outputs_add(e))

    const item = db.items_create("light bulb")
    item.conversions_add(conversion)

    db.item_tags_create("garage")
    db.item_tags_create("kitchen")

    db.conversion_tags_create("fun")
    db.conversion_tags_create("realistic")

    return db
  }


  function by_name(a : { name : string }, b : { name : string }) : number {
    return a.name.localeCompare(b.name)
  }
</script>


<svelte:head>
  <title>Procedural Adventure Editor</title>
</svelte:head>

<div class="main-layout">
  <menu class="inset stretch">
    <li><button on:click={create_new_item_db}>New</button></li>
    <li><button on:click={import_item_db}>Load</button></li>
    <li><button on:click={export_item_db}>Save</button></li>
  </menu>
  <header class="inset">
    <h1>{item_db.name}</h1>
    <button class="flat" on:click={rename_item_db} title="Rename Item Database">🖉</button>
  </header>
  <header class="inset centered">
    {item_db.effects.size} effects, {item_db.items.size} items
  </header>
  <aside class="inset panel">
    <header>
      <h2>Items</h2>
      <menu>
        <li><button class="flat large" on:click={add_item} title="Add Item">+</button></li>
      </menu>
    </header>
    <ul class="scrollable">
      {#each [...item_db.items].sort(by_name) as item, index (item)}
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
  <main class="inset panel" style="row-gap: 0;">
    <header style="z-index: 1;">
      {#if selected_item}
        <h2 class="centered">{selected_item?.name ?? ""}</h2>
      {/if}
    </header>
    <ItemEditor {item_db} item={selected_item}/>
  </main>
  <aside class="grid auto-rows" style="gap: inherit;">
    <section class="inset panel">
      <header>
        <h2>Effects</h2>
        <menu>
          <li><button class="flat large" on:click={add_effect} title="Add Effect">+</button></li>
        </menu>
      </header>
      <ul class="scrollable">
        {#each [...item_db.effects].sort(by_name) as effect, index (effect)}
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
    </section>
    <section class="inset panel">
      <header>
        <h2>Item Tags</h2>
        <menu>
          <li><button class="flat large" on:click={add_item_tag} title="Add Item Tag">+</button></li>
        </menu>
      </header>
      <ul class="scrollable">
        {#each [...item_db.item_tags].sort(by_name) as tag (tag)}
          <li class="item-row">
            <span class="fill-right">{tag.name}</span>
            <button class="flat on-parent-hover" on:click={() => rename_item_tag(tag)} title="Rename Item Tag" style="line-height: 1.25em;">🖉</button>
            <button class="flat on-parent-hover" on:click={() => remove_item_tag(tag)} title="Delete Item Tag">❌</button>
          </li>
        {/each}
      </ul>
    </section>
    <section class="inset panel">
      <header>
        <h2>Effect Conversion Tags</h2>
        <menu>
          <li><button class="flat large" on:click={add_conversion_tag} title="Add Conversion Tag">+</button></li>
        </menu>
      </header>
      <ul class="scrollable">
        {#each [...item_db.conversion_tags].sort(by_name) as tag (tag)}
          <li class="item-row">
            <span class="fill-right">{tag.name}</span>
            <button class="flat on-parent-hover" on:click={() => rename_conversion_tag(tag)} title="Rename Item Tag" style="line-height: 1.25em;">🖉</button>
            <button class="flat on-parent-hover" on:click={() => remove_conversion_tag(tag)} title="Delete Item Tag">❌</button>
          </li>
        {/each}
      </ul>
    </section>
  </aside>
</div>


<style>
  .main-layout {
    display: grid;
    grid-template-columns: 2fr 6fr 2fr;
    grid-template-rows: auto minmax(0, 1fr);
    gap: 0.5em;
    height: 100vh;
    padding: 0.5em;
    box-sizing: border-box;
    background-color: rgba(0, 0, 0, 0.25);
  }


  .inset {
    position: relative;
    border-radius: 0.5em;
    overflow: hidden;
  }


  .inset::after {
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


  .panel {
    background-color: var(--palette-0);
    display: grid;
    grid-template-rows: auto minmax(0, 1fr);
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


  .panel > header {
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
    color: var(--palette-2);
  }


  .item-row > span {
    align-self: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 1;
    cursor: default;
  }


  .item-row:hover {
    color: var(--palette-4);
  }


  .fill-right {
    margin-right: auto;
  }


  :not(:hover) > .on-parent-hover {
    display: none;
  }


  :checked + label {
    background-color: var(--palette-2);
    background-color: rgba(255, 255, 255, 0.125);
    color: var(--palette-4);
  }
</style>
