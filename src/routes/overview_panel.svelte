<script lang="ts">
  import { map } from "$lib"
  import { EffectConversion, type Effect, Item, type ItemDatabase } from "$lib/model"


  export let item_db : ItemDatabase


  let effect_references : {
    effect : Effect,
    input_references : Item[],
    output_references : Item[],
  }[]

  $: effect_references = [...map(item_db.effects.values(), (effect : Effect) => ({
    effect,
    input_references: find_effect_item_references(effect, true),
    output_references: find_effect_item_references(effect, false),
  }))]


  function find_effect_item_references(effect : Effect, inputs : boolean) : Item[] {
    const references = new Set<Item>()
    const conversion_tag = inputs ? EffectConversion.INPUTS : EffectConversion.OUTPUTS
    for (const conversion of effect.references(conversion_tag)) {
      for (const item of conversion.references(Item.CONVERSIONS)) {
        references.add(item as Item)
      }
    }
    return [...references]
  }


  function sort_by_effect_name(ascending : boolean) : void {
    effect_references = effect_references.sort(
      ascending
      ? (a, b) => a.effect.name.localeCompare(b.effect.name)
      : (a, b) => b.effect.name.localeCompare(a.effect.name)
    )
  }


  function sort_by_input_references(ascending : boolean) : void {
    effect_references = effect_references.sort(
      ascending
      ? (a, b) => a.input_references.length - b.input_references.length
      : (a, b) => b.input_references.length - a.input_references.length
    )
  }


  function sort_by_output_references(ascending : boolean) : void {
    effect_references = effect_references.sort(
      ascending
      ? (a, b) => a.output_references.length - b.output_references.length
      : (a, b) => b.output_references.length - a.output_references.length
    )
  }
</script>


<div class="root">
  <table>
    <thead>
      <tr>
        <th>
          <button class="flat" on:click={() => sort_by_effect_name(false)}>▼</button>
          Effect
          <button class="flat" on:click={() => sort_by_effect_name(true)}>▲</button>
        </th>
        <th>
          <button class="flat" on:click={() => sort_by_input_references(false)}>▼</button>
          Input References
          <button class="flat" on:click={() => sort_by_input_references(true)}>▲</button>
        </th>
        <th>
          <button class="flat" on:click={() => sort_by_output_references(false)}>▼</button>
          Output References
          <button class="flat" on:click={() => sort_by_output_references(true)}>▲</button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each effect_references as { effect, input_references, output_references } (effect)}
        <tr>
          <th>
            {effect.name}<br>
            <span class="detail">{input_references.length} in - {output_references.length} out</span>
          </th>
          <td>
            <ul>
              {#each input_references as item (item)}
                <li>{item.name}</li>
              {/each}
            </ul>
          </td>
          <td>
            <ul>
              {#each output_references as item (item)}
                <li>{item.name}</li>
              {/each}
            </ul>
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>


<style>
  .root {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: auto;
  }


  table {
    text-align: center;
    border-spacing: 0;
    width: 100%;
  }


  thead {
    background-color: var(--palette-1);
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.75);
  }


  thead tr {
    box-sizing: border-box;
    height: 2.5rem;
  }


  thead {
    position: sticky;
    top: 0;
  }


  th button {
    visibility: hidden;
  }


  th:hover button {
    visibility: visible;
  }


  tbody tr:nth-child(even) {
    background-color: rgba(255, 255, 255, 0.0625);
  }


  tbody th,
  tbody td {
    padding: 0.5rem;
  }


  .detail {
    font-size: 0.8em;
    font-weight: normal;
  }


  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }
</style>
