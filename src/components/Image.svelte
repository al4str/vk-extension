<script>
  import Pending from '~/src/components/Pending.svelte';

  export let src = '';
  export let sources = [];
  export let alt = '';
  export let theme = 'light';

  let loaded = false;
  let failed = false;

  function handleImageLoad() {
    if (!src) {
      return;
    }
    loaded = true;
  }
  function handleImageError() {
    if (!src) {
      return;
    }
    failed = true;
  }
  function imageRef(imageNode) {
    if (imageNode.complete) {
      handleImageLoad();
    }
  }
</script>

<div
  class="{$$restProps.class || ''}"
  class:image_loaded={loaded || failed}
>
  <picture>
    {#each sources as size}
      {#if size.media !== 'default'}
        <source
          media={`(min-width: ${size.media})`}
          srcset={size.srcset}
        />
      {:else}
        <img
          class="image__img"
          src={src}
          srcset={size.srcset}
          alt={alt}
          use:imageRef
          on:load={handleImageLoad}
          on:error={handleImageError}
        />
      {/if}
    {:else}
      <img
        class="image__img"
        src={src}
        alt={alt}
        use:imageRef
        on:load={handleImageLoad}
        on:error={handleImageError}
      />
    {/each}
  </picture>
  <Pending
    class="image__pending"
    finished={loaded || failed}
    {theme}
  />
</div>

<style global>
  .image__img {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    transition: opacity 0.15s linear;
  }
  .image_loaded .image__img {
    opacity: 1;
  }
  .image__pending {
    position: absolute;
    z-index: 1;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    overflow: hidden;
    pointer-events: none;
    transition: opacity 0.15s;
  }
  .image_loaded .image__pending {
    opacity: 0;
  }
</style>
