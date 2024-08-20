<script>
// Importa lo stato e i metodi di state.js
import { state, getters, login, logout, updateProfile } from '../state.js';
import { ref } from 'vue';

export default {
	data() {
		return {
			// Variabili per il login
			loginEmail: '',
			loginPassword: '',

			// Variabili per aggiornare il profilo
			updatedName: '',
			updatedEmail: '',
		};
	},
	mounted() {
		if (this.isLoggedIn) {
			this.refreshData();
		}
	},
	computed: {
		// Usa i getter per accedere allo stato globale
		isLoggedIn() {
			return getters.isLoggedIn(state);
		},
		user() {
			return getters.getUser(state);
		}
	},
	watch: {
		isLoggedIn(newValue) {
			if (newValue) {
				// L'utente è loggato, ricarica i dati del profilo
				this.refreshData();
			}
		}
	},
	methods: {
		// Metodo per il login
		async login() {
			try {
				const credentials = {
					email: this.loginEmail,
					password: this.loginPassword,
				};
				const response = await login(credentials); // Chiamata diretta alla funzione login
				console.log('Login successful:', response);
			} catch (error) {
				console.error('Login failed:', error);
			}
		},
		// Metodo per il logout
		async logout() {
			try {
				const response = await logout(); // Chiamata diretta alla funzione logout
				console.log('Logout successful:', response);
			} catch (error) {
				console.error('Logout failed:', error);
			}
		},
		// Metodo per aggiornare il profilo
		async updateProfile() {
			try {
				const profileData = {
					name: this.updatedName,
					email: this.updatedEmail,
				};
				const response = await updateProfile(profileData); // Chiamata diretta alla funzione updateProfile
				console.log('Profile updated successfully:', response);
			} catch (error) {
				console.error('Profile update failed:', error);
			}
		},
		refreshData() {
			// Metodo per aggiornare i dati del profilo
			this.updatedName = this.user.name;
			this.updatedEmail = this.user.email;
		}
	}
};
</script>

<template>
	<div class="profile-container">
		<h1>User Profile</h1>

		<!-- Se l'utente è loggato, mostra i dettagli -->
		<div v-if="isLoggedIn && user">
			<p><strong>Name:</strong> {{ user.name }}</p>
			<p><strong>Email:</strong> {{ user.email }}</p>

			<!-- Form per aggiornare il profilo -->
			<h2>Update Profile</h2>
			<form @submit.prevent="updateProfile">
				<div>
					<label for="name">Name:</label>
					<input type="text" v-model="updatedName" id="name" />
				</div>
				<div>
					<label for="email">Email:</label>
					<input type="email" v-model="updatedEmail" id="email" />
				</div>
				<button type="submit">Update</button>
			</form>

			<!-- Logout -->
			<button @click="logout">Logout</button>
		</div>

		<!-- Se l'utente non è loggato, mostra il form di login -->
		<div v-else>
			<h3>Login</h3>
			<form @submit.prevent="login">
				<div>
					<label for="email">Email:</label>
					<input type="email" v-model="loginEmail" id="login-email" />
				</div>
				<div>
					<label for="password">Password:</label>
					<input type="password" v-model="loginPassword" id="login-password" />
				</div>
				<button type="submit">Login</button>
			</form>
		</div>
	</div>
</template>

<style scoped>
.profile-container {
	max-width: 800px;
	margin: 0 auto;
	padding: 20px;
}

button {
	margin-top: 10px;
}
</style>
