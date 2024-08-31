import { createApp } from 'vue';
import './style.css';
import App from './App.vue';
import router from './router';
import PortalVue from 'portal-vue';

createApp(App).use(router).use(PortalVue).mount('#app')
