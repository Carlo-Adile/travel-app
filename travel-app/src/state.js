import axios from 'axios';
import { reactive } from 'vue';

// Usa reactive per creare uno stato reattivo
export const state = reactive({
	base_api_url: 'http://localhost:8000/api',
	auth: {
		isLoggedIn: false,
		user: null,
		token: null
	}
});

// Aggiorna lo stato
export const mutations = {
	setAuthStatus(isLoggedIn, user, token) {
		state.auth.isLoggedIn = isLoggedIn;
		state.auth.user = user;
		state.auth.token = token;
	}
};

// Accedi allo stato
export const getters = {
	isLoggedIn() {
		return state.auth.isLoggedIn;
	},
	getUser() {
		return state.auth.user;
	},
	getToken() {
		return state.auth.token;
	}
};

// Metodi
export const login = async (credentials) => {
	try {
		const response = await axios.post(`${state.base_api_url}/login`, credentials);
		const { user, token } = response.data;
		mutations.setAuthStatus(true, user, token);
		return response.data;
	} catch (error) {
		console.error('Login fallito', error);
		throw error;
	}
};

export const logout = async () => {
	try {
		await axios.post(`${state.base_api_url}/logout`, {}, {
			headers: { Authorization: `Bearer ${getters.getToken()}` }
		});
		mutations.setAuthStatus(false, null, null);
	} catch (error) {
		console.log('Logout fallito', error);
		throw error;
	}
};

export const updateProfile = async (profileData) => {
	try {
		const response = await axios.put(`${state.base_api_url}/profile`, profileData, {
			headers: { Authorization: `Bearer ${getters.getToken()}` }
		});
		const { user } = response.data;
		mutations.setAuthStatus(true, user, getters.getToken());
		return response.data;
	} catch (error) {
		console.error('Modifica al profilo fallita', error);
		throw error;
	}
};
