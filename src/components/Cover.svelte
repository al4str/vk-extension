<script>
  import Image from '~/src/components/Image.svelte';

  export let src = '';
  export let alt = '';
</script>

<span class="cover {$$restProps.class || ''}">
  {#if src}
    <Image
      class="cover__img"
      src={src}
      alt={alt}
    />
  {:else}
    <span class="cover__alt">
      No cover
    </span>
  {/if}
</span>

<style global>
  .cover {
    position: relative;
    display: block;
    overflow: hidden;
    border-radius: 3px;
  }
  .cover__img {
    width: 100%;
    height: 100%;
  }
  .cover__alt {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    text-align: center;
    text-transform: uppercase;
    color: #999999;
    background-color: #383838;
  }
</style>
