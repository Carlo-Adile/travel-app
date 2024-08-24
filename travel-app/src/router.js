import { createRouter, createWebHistory } from 'vue-router';
import AppHome from './views/AppHome.vue';
import SingleTravel from './views/SingleTravel.vue';

const router = createRouter({
	history: createWebHistory(),
	routes: [
		{
			path: '/',
			name: 'Home',
			component: AppHome
		},
		{
			path: '/travels/:id/:slug',
			name: 'travel',
			component: SingleTravel
		}
	]
});

export default router;