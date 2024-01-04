<script lang="ts">
  import type { EffectConversion, Item, ItemDatabase, Tag } from "$lib/model"
  import EffectConversionEditor from "./effect_conversion_editor.svelte"
  import ImagePicker from "./image_picker.svelte"


  export let item_db : ItemDatabase

  export let item : Item | undefined =  undefined


  let add_tag_selection : Tag | undefined = undefined


  $: if (add_tag_selection) {
    add_tag(add_tag_selection)
    add_tag_selection = undefined
  }

  $: remaining_tags = item ? item_db.item_tags.filter(t => !item!.tags.includes(t)) : []


  function change_image(image : File | undefined) : void {
    if (item) {
      item.image = image
    }
  }


  function add_tag(tag : Tag) : void {
    if (item) {
      item.tags.push(tag)
      item.tags.sort((a, b) => a.name.localeCompare(b.name))
      item = item
    }
  }


  function remove_tag(tag : Tag) : void {
    if (item) {
      const index = item.tags.indexOf(tag)
      if (index < 0) {
        throw new Error("item does not contain tag")
      }
      item.tags.splice(index, 1)
      item = item
    }
  }


  function add_conversion() : void {
    if (item) {
      item.conversions.push({ inputs: [], outputs: [], tags: [] })
      item = item
    }
  }


  function remove_conversion(conversion : EffectConversion) : void {
    if (!item) {
      return
    }

    if (!confirm(`Are you sure you want to delete the effect conversion?`)) {
      return
    }

    const index = item.conversions.indexOf(conversion)
    if (index < 0) {
      throw new Error("item does not contain conversion")
    }
    item.conversions.splice(index, 1)

    item = item
  }
</script>


{#if item}
  <div class="main-container scrollable">
    <h3>Image</h3>
    <div class="item-image-container">
      <ImagePicker
        source={item.image}
        on:change={(evt) => change_image(evt.detail)}
      />
    </div>
    <h3>Tags</h3>
      <ul>
        {#each item.tags as tag (tag)}
          <li><button on:click={() => remove_tag(tag)} title="Delete Tag">{tag.name}</button></li>
        {/each}
        <li>
          <select bind:value={add_tag_selection}>
            <option value={undefined}>+</option>
            {#each remaining_tags as tag (tag)}
              <option value={tag}>{tag.name}</option>
            {/each}
          </select>
        </li>
      </ul>
    <h3>
      Effect Conversions
      <button class="flat large" on:click={add_conversion} title="Add Effect Conversion" style="padding: 0.125em 0.5em;">+</button>
    </h3>
    <div class="conversion-list">
      {#each item.conversions as conversion (conversion)}
        <div class="conversion">
          <EffectConversionEditor {item_db} {conversion}/>
          <menu>
            <li>
              <button
                on:click={() => remove_conversion(conversion)}
                title="Delete Effect Conversion"
              >❌</button>
            </li>
          </menu>
        </div>
      {/each}
    </div>
  </div>
{/if}


<style>
  .main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    overflow: auto;
    padding-bottom: 1em;
  }


  h3 {
    position: relative;
    align-self: stretch;
    text-align: center;
    font-size: 1rem;
    margin: 1em 0;
    padding: 0.25em;
    background-color: var(--palette-1);
  }


  h3 > button {
    position: absolute;
    right: 0.75em;
    top: 50%;
    translate: 0 -50%;
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


  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: center;
    gap: 0.25rem;
  }


  select {
    width: 3em;
    text-align: center;
    opacity: 0.2;
    transition: opacity 0.125s;
  }


  select:hover {
    opacity: 1.0;
  }


  .conversion-list {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1em;
  }


  .conversion {
    position: relative;
    min-width: 20em;
    background-color: var(--palette-1);
    border-radius: 0.5em;
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.5);
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
