<script lang="ts">
  import { upload } from "$lib/io"
  import { createEventDispatcher } from "svelte"


  export let source : File | undefined

  export let placeholder = ""


  const dispatch = createEventDispatcher<{ change : File | undefined }>()


  let image : HTMLImageElement | undefined


  $: if (image) { update_image_src(image, source) }


  function update_image_src(image : HTMLImageElement, source : File | undefined) : void {
    if (source instanceof File) {
      const url = URL.createObjectURL(source)
      image.src = url
      image.addEventListener("load", () => {
        URL.revokeObjectURL(url)
      }, { once: true })
    } else {
      image.src = placeholder
    }
  }


  async function fetch_image() : Promise<void> {
    const url = prompt("Enter image URL:")
    if (!url) {
      return
    }

    try {
      const response = await fetch(url, { mode: "cors" })
      if (!response.ok) {
        throw new Error(response.statusText)
      }
      const content_type = response.headers.get("Content-Type")
      if (!content_type || !content_type.startsWith("image/")) {
        throw new Error(`File is not an image. Content-Type: ${content_type}.`)
      }
      const name = response.url.substring(response.url.lastIndexOf("/") + 1)
      const blob = await response.blob()
      source = new File([blob], name, { type: blob.type })
      dispatch("change", source)
    } catch (error) {
      alert(`Failed to load image. (${error})`)
    }
  }


  async function upload_image() : Promise<void> {
    const file = await upload("image/*")
    if (file) {
      source = file
      dispatch("change", source)
    }
  }


  function clear_image() : void {
    source = undefined
    dispatch("change", source)
  }
</script>


<div>
  <!-- svelte-ignore a11y-missing-attribute -->
  <img bind:this={image}>
  <menu>
    <li><button on:click={() => fetch_image()} title="Load Image From Web">🌐</button></li>
    <li><button on:click={() => upload_image()} title="Load Image From Device">📁</button></li>
    {#if source}
      <li><button on:click={() => clear_image()} title="Delete Image">❌</button></li>
    {/if}
  </menu>
</div>


<style>
  div {
    position: relative;
  }


  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }


  menu {
    list-style: none;
    display: flex;
    flex-direction: column;
    align-items: center;
    margin: 0;
    padding: 0;
    gap: 0.25em;

    position: absolute;
    right: 0;
    top: 50%;
    translate: 50% -50%;
    opacity: 0.0;
    transition: opacity 0.125s ease-in-out;
  }


  :hover > menu {
    opacity: 1.0;
  }
</style>
