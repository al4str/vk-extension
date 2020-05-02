import Root from '~/src/components/Root.svelte';

const target = window.document.getElementById('root');

const root = new Root({ target });

export default root;
