import axios from 'axios';
import { reactive } from 'vue';

// Usa reactive per creare uno stato reattivo
export const state = reactive({
	/* profile */
	base_api_url: 'http://localhost:8000/api',
	auth: {
		isLoggedIn: false,
		user: null,
		token: null
	},
	/* travels and steps */
	travel_api_url: 'http',
	travels: [],
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

// Metodi profile
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

// Metodi travel
export const getTravel = async () => {
	try {
		const response = await axios.get(`${state.base_api_url}/travels`, {
			headers: { Authorization: `Bearer ${getters.getToken()}` }
		});
		state.travels = response.data;
		console.log("viaggi recuperati: ", state.travels);
		return response.data;
	} catch (error) {
		console.error('Non è stato possibile recuperare i tuoi viaggi', error);
		throw error;
	}
};