<script lang="ts">
  import type { Effect, EffectConversion } from "$lib/model"


  export let conversion : EffectConversion

  export let effects : Effect[]


  let add_input_selection : Effect | undefined = undefined

  $: if (add_input_selection) {
    add_input(add_input_selection)
    add_input_selection = undefined
  }


  let add_output_selection : Effect | undefined = undefined

  $: if (add_output_selection) {
    add_output(add_output_selection)
    add_output_selection = undefined
  }


  $: remaining_input_effects = effects.filter(e => !conversion.inputs.includes(e))

  $: remaining_output_effects = effects.filter(e => !conversion.outputs.includes(e))


  function add_input(effect : Effect) : void {
    conversion.inputs.push(effect)
    conversion.inputs.sort((a, b) => a.name.localeCompare(b.name))
    conversion.inputs = conversion.inputs
  }


  function remove_input(effect : Effect) : void {
    const index = conversion.inputs.indexOf(effect)
    if (index < 0) {
      throw new Error("effect is not an input")
    }
    conversion.inputs.splice(index, 1)
    conversion.inputs = conversion.inputs
  }


  function add_output(effect : Effect) : void {
    conversion.outputs.push(effect)
    conversion.outputs.sort((a, b) => a.name.localeCompare(b.name))
    conversion.outputs = conversion.outputs
  }


  function remove_output(effect : Effect) : void {
    const index = conversion.outputs.indexOf(effect)
    if (index < 0) {
      throw new Error("effect is not an output")
    }
    conversion.outputs.splice(index, 1)
    conversion.outputs = conversion.outputs
  }
</script>


<div class="conversion-editor">
  <div class="inputs">
    <ul>
      {#each conversion.inputs as effect (effect)}
        <li><button on:click={() => remove_input(effect)}>{effect.name}</button></li>
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
        <li><button on:click={() => remove_output(effect)}>{effect.name}</button></li>
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
    grid-template-columns: 4fr 2fr 4fr;
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
</style>