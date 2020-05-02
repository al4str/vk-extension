<script>
  export let theme = 'light';
  export let finished = false;
</script>

<span
  class="pending {$$restProps.class || ''}"
  class:pending_light={theme === 'light'}
  class:pending_dark={theme === 'dark'}
  class:pending_finished={finished}
>
  <span class="pending__runner"></span>
</span>

<style global>
  @keyframes pending {
    0%   { transform: translateX(-100%) }
    100% { transform: translateX(100%) }
  }
  .pending__runner {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    color: inherit;
    background: linear-gradient(100deg, transparent 10%, currentColor 40%, transparent 80%);
    backface-visibility: hidden;
    animation: pending 0.75s linear infinite forwards;
  }
  .pending_light .pending__runner {
    color: rgba(0, 0, 0, 0.03);
  }
  .pending_dark .pending__runner {
    color: rgba(255, 255, 255, 0.05);
  }
  .pending_finished .pending__runner {
    display: none;
  }
</style>
