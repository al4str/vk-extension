<script>
  export let className = '';
  export let type = 'button';
  export let disabled = false;
  export let multiline = false;
  export let pending = false;
  export let label = '';
  export let icon = '';
  export let onClick = Function.prototype;
</script>

<button
  class="btn {className}"
  type={type}
  disabled={disabled}
  on:click={onClick}
>
  <slot>
    <span class="btn__wrp">
      {#if label}
        <span
          class="btn__label"
          class:btn__label_multi={multiline}
        >
          {label}
        </span>
      {/if}
      {#if icon}
        <span class="btn__icon">
          {icon}
        </span>
      {/if}
    </span>
  </slot>
</button>
