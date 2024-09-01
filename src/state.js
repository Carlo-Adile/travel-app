import axios from 'axios';
import { reactive } from 'vue';

// Usa reactive per creare uno stato reattivo
export const state = reactive({
	/* profile */
	/* base_api_url: 'http://localhost:8000/api', */
	/* base_api_url: import.meta.env.VITE_API_BASE_URL || 'https://localhost:8000/api', */
	base_api_url: 'https://api-travel-agenda.carloadile.com/api',
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

		// Salva i dati nel localStorage
		if (isLoggedIn) {
			localStorage.setItem('auth', JSON.stringify({ user, token }));
		} else {
			localStorage.removeItem('auth');
		}
	}
};

/* recupera i dati all'avvio */
const savedUser = localStorage.getItem('user');
const savedToken = localStorage.getItem('token');
if (savedUser && savedToken) {
	mutations.setAuthStatus(true, JSON.parse(savedUser), savedToken);
}

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

export const login = async (credentials) => {
	try {
		const response = await axios.post(`${state.base_api_url}/login`, credentials);
		const { user, token } = response.data;
		mutations.setAuthStatus(true, user, token);

		// Salva nel localStorage
		localStorage.setItem('user', JSON.stringify(user));
		localStorage.setItem('token', token);

		return response.data;
	} catch (error) {
		console.error('Login fallito', error);
		throw error;
	}
};

export const register = async (userData) => {
	localStorage.removeItem('user');
	localStorage.removeItem('token');
	localStorage.removeItem('auth');
	try {
		const formData = new FormData();
		Object.keys(userData).forEach(key => {
			formData.append(key, userData[key]);
		});

		const response = await axios.post(`${state.base_api_url}/register`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data',
			},
		});

		const { user, access_token } = response.data;
		mutations.setAuthStatus(true, user, access_token);
		return response.data;
	} catch (error) {
		console.error('Registrazione fallita', error);
		throw error.response.data;
	}
};

export const logout = async () => {
	localStorage.removeItem('user');
	localStorage.removeItem('token');
	localStorage.removeItem('auth');
	try {
		await axios.post(`${state.base_api_url}/logout`, {}, {
			headers: { Authorization: `Bearer ${getters.getToken()}` }
		});
		mutations.setAuthStatus(false, null, null);
		// Rimuovi dal localStorage

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
		/* mutations.setAuthStatus(true, user, getters.getToken()); */
		// Aggiorna solo le parti necessarie dell'utente, senza sovrascrivere l'intero oggetto

		// Controlla che l'oggetto `user` esista e non sia null o undefined
		if (user && typeof user === 'object') {
			Object.keys(user).forEach(key => {
				if (user[key] !== null && user[key] !== undefined) {
					state.auth.user[key] = user[key];
				}
			});
			console.log("Profile updated successfully:", state.auth.user);
		} else {
			console.warn("Nessun dato utente aggiornato è stato restituito dall'API.");
		}

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
		/* console.log("viaggi recuperati: ", state.travels); */
		return response.data;
	} catch (error) {
		console.error('Non è stato possibile recuperare i tuoi viaggi', error);
		throw error;
	}
};

/* stringa Template */
export const formattedDateRange = (startDate, endDate) => {
	if (!startDate) return 'Date non disponibili';

	const options = { day: 'numeric', month: 'long' };
	const start = new Date(startDate);
	const end = endDate ? new Date(endDate) : null;

	const startDateString = start.toLocaleDateString('it-IT', options);

	if (end) {
		const endDateString = end.toLocaleDateString('it-IT', options);
		const year = end.getFullYear();
		return `${startDateString} - ${endDateString}, ${year}`;
	} else {
		const year = start.getFullYear();
		return `${startDateString}, ${year}`;
	}
};

/* metodi step */
export const updateStep = async (stepId, stepData) => {
	try {
		const response = await axios.put(`${state.base_api_url}/steps/${stepId}`, stepData, {
			headers: { Authorization: `Bearer ${getters.getToken()}` }
		});

		return response.data;
	} catch (error) {
		console.error('Modifica alla tappa fallita', error);
		throw error;
	}
};

export const deleteStep = async () => {
	if (confirm('Sei sicuro di voler eliminare questa tappa?')) {
		try {
			await axios.delete(`${state.base_api_url}/steps/${this.step.id}`, {
				headers: {
					'Authorization': `Bearer ${getters.getToken()}`
				}
			});
			console.log('Tappa eliminata con successo');

			// Aggiorna la lista dei viaggi
			await getTravel();
		} catch (error) {
			console.error('Errore durante l\'eliminazione della tappa:', error.response?.data || error);
		}
	}
};

export const updateTravel = async (travelId, formData) => {
	try {
		const response = await axios.put(`${state.base_api_url}/travels/${travelId}`, formData, {
			headers: {
				'Authorization': `Bearer ${getters.getToken()}`,
				'Content-Type': 'multipart/form-data' // Importante per i file e formData
			}
		});
		return response.data;
	} catch (error) {
		if (error.response) {
			console.error('Errore durante la modifica del viaggio:', {
				status: error.response.status,
				data: error.response.data
			});
		} else {
			console.error('Errore durante la modifica del viaggio:', error.message);
		}
		throw error;
	}
};