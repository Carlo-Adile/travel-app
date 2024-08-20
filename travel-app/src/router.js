import { createRouter, createWebHistory } from 'vue-router';
import AppHome from './views/AppHome.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: AppHome
		}
	]
});

export default router;