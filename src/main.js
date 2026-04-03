import { createApp } from 'vue';
import { Icon } from '@iconify/vue';
import App from './App.vue';
import './index.css';
import 'highlight.js/styles/github-dark.css';

const app = createApp(App);

app.component('AppIcon', Icon);
app.mount('#app');
