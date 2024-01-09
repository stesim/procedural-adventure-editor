<script lang="ts">
  import { filter } from "$lib";
  import type { Effect, EffectConversion, ItemDatabase, Tag } from "$lib/model"


  export let item_db : ItemDatabase

  export let conversion : EffectConversion


  let add_input_selection : Effect | undefined = undefined

  $: if (add_input_selection) {
    add_input(add_input_selection)
    add_input_selection = undefined
  }

  $: remaining_input_effects = [...filter(item_db.effects.values(), e => !conversion.inputs.has(e))]


  let add_output_selection : Effect | undefined = undefined

  $: if (add_output_selection) {
    add_output(add_output_selection)
    add_output_selection = undefined
  }

  $: remaining_output_effects = [...filter(item_db.effects.values(), e => !conversion.outputs.has(e))]


  let add_tag_selection : Tag | undefined = undefined

  $: if (add_tag_selection) {
    add_tag(add_tag_selection)
    add_tag_selection = undefined
  }

  $: remaining_tags = [...filter(item_db.conversion_tags.values(), t => !conversion!.tags.has(t))]


  function add_input(effect : Effect) : void {
    conversion.inputs_add(effect)
    conversion = conversion
  }


  function remove_input(effect : Effect) : void {
    conversion.inputs_remove(effect)
    conversion = conversion
  }


  function add_output(effect : Effect) : void {
    conversion.outputs_add(effect)
    conversion = conversion
  }


  function remove_output(effect : Effect) : void {
    conversion.outputs_remove(effect)
    conversion = conversion
  }


  function add_tag(tag : Tag) : void {
    conversion.tags_add(tag)
    conversion = conversion
  }


  function remove_tag(tag : Tag) : void {
    conversion.tags_remove(tag)
    conversion = conversion
  }
</script>


<div class="conversion-editor">
  <ul class="tags">
    {#each conversion.tags as tag (tag)}
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
  <div class="inputs">
    <ul>
      {#each conversion.inputs as effect (effect)}
        <li><button on:click={() => remove_input(effect)} title="Delete Input">{effect.name}</button></li>
      {/each}
      <li>
        <select bind:value={add_input_selection}>
          <option value={undefined}>+</option>
          {#each remaining_input_effects as effect (effect)}
            <option value={effect}>{effect.name}</option>
          {/each}
        </select>
      </li>
    </ul>
  </div>
  <span class="maps_to">🠒</span>
  <div class="outputs">
    <ul>
      {#each conversion.outputs as effect (effect)}
        <li><button on:click={() => remove_output(effect)} title="Delete Output">{effect.name}</button></li>
      {/each}
      <li>
        <select bind:value={add_output_selection}>
          <option value={undefined}>+</option>
          {#each remaining_output_effects as effect (effect)}
            <option value={effect}>{effect.name}</option>
          {/each}
        </select>
      </li>
    </ul>
  </div>
</div>


<style>
  .conversion-editor {
    display: grid;
    grid-template-columns: 4fr auto 4fr;
    grid-template-rows: auto auto;
    gap: 1em 0.5em;
    padding: 1em;
  }


  .inputs,
  .outputs {
    justify-self: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }


  ul {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
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


  .maps_to {
    align-self: center;
    justify-self: center;
    font-size: 2em;
    line-height: 2em;
    cursor: default;
  }


  .tags {
    grid-column: 1 / -1;
    flex-direction: row;
  }
</style>
