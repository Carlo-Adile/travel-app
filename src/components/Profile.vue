<script>
// Importa lo stato e i metodi di state.js
import { state, getters, login, logout, updateProfile, register } from '../state.js';
import { ref } from 'vue';
import axios from 'axios';

export default {
	data() {
		return {
			// Variabili per il login
			loginEmail: '',
			loginPassword: '',

			// Variabili per aggiornare il profilo
			updatedName: '',
			updatedEmail: '',

			// Variabili per la registrazione
			registerName: '',
			registerEmail: '',
			registerPassword: '',
			registerPasswordConfirmation: '',
			coverImage: null,

			// Visibilità Form
			showForm: false,
			showRegisterForm: false,
			showUpdateProfileForm: false,

			// Variabili per il popover
			isPopoverVisible: false,

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
		// Metodo per la registrazione
		handleFileUpload(event) {
			this.coverImage = event.target.files[0];
		},
		async register() {
			try {
				const formData = new FormData();
				formData.append('name', this.registerName);
				formData.append('email', this.registerEmail);
				formData.append('password', this.registerPassword);
				formData.append('password_confirmation', this.registerPasswordConfirmation);

				if (this.coverImage) {
					formData.append('cover_image', this.coverImage);
				}

				const response = await axios.post(`${state.base_api_url}/register`, formData, {
					headers: {
						'Content-Type': 'multipart/form-data',
					},
				});

				// Estrai il token e l'utente dalla risposta
				const { token, user } = response.data;

				// Imposta l'intestazione di autorizzazione per le richieste future
				axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

				console.log('Registrazione avvenuta con successo:', response.data);

				// Dopo la registrazione, esegui il login
				await this.login();

				// Aggiorna i dati del profilo
				this.refreshData();

			} catch (error) {
				console.error('Registrazione fallita:', error);
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
				// Prepara i dati da inviare per l'aggiornamento del profilo
				const profileData = {
					name: this.updatedName,
					email: this.updatedEmail,
				};

				// Richiama la funzione updateProfile di state.js
				const response = await updateProfile(profileData);

				// Verifica lo stato dell'utente
				if (!this.isLoggedIn) {
					console.error('User appears to be logged out after update.');
				}

				this.user.name = this.updatedName;
				this.refreshData();
				// Gestisci la risposta, se necessario
				console.log('Profile updated successfully:', response);

				// Potresti voler chiudere il form dopo l'aggiornamento
				this.closeForms();

			} catch (error) {
				// Gestisci l'errore, se necessario
				console.error('Profile update failed:', error);
			}
		},
		refreshData() {
			// Metodo per aggiornare i dati del profilo
			this.updatedName = this.user.name;
			this.updatedEmail = this.user.email;
		},
		/* Metodi per mostrare i Form */
		// Nascondi i form
		closeForms() {
			this.showUpdateProfileForm = false;
			this.showLogoutConfirm = false;
		},
		toggleForm() {
			this.showForm = !this.showForm;
			this.showRegisterForm = false;
		},
		toggleRegisterForm() {
			this.showForm = !this.showForm;
			this.showRegisterForm = !this.showRegisterForm;
		},
		togglePopover() {
			this.isPopoverVisible = !this.isPopoverVisible;
		},
		openUpdateProfileForm() {
			console.log("update richiamato");
			this.showUpdateProfileForm = true;
			this.isPopoverVisible = false;
		}
	}
};
</script>

<template>

	<div class="container p-0">

		<!-- utente loggato -->
		<div v-if="isLoggedIn && user" class="row px-3 pt-3" id="profile_header">
			<!-- Se l'utente è loggato, mostra i dettagli -->
			<div class="d-flex align-items-center justify-content-between">
				<!-- info profilo -->
				<div class="d-flex align-items-center mb-2">
					<!-- Icona profilo -->
					<img v-if="user.cover_image" :src="`${state.base_api_url}/storage/${user.cover_image}`" alt=""
						class="profile-picture">
					<img v-else src="https://placehold.co/400" alt="Profile Picture" class="profile-picture" />
					<h6 class="p-0 m-0">Benvenuto, <br> {{ user.name }}</h6>
				</div>

				<!-- Icona menu con popover -->
				<div class="popover-container">
					<button @click="togglePopover" class="popover-button">
						<i class="fa-solid fa-ellipsis-v"></i>
					</button>
					<div v-if="isPopoverVisible" class="popover-content">
						<p @click="openUpdateProfileForm">Impostazioni</p>
						<p @click="logout">Logout</p>
					</div>
				</div>

			</div>

			<!-- Form per aggiornare il profilo -->
			<div v-if="showUpdateProfileForm">
				<h3>Aggiorna profilo</h3>
				<form @submit.prevent="updateProfile">
					<div class="input-group mb-2">
						<span class="input-group-text" id="update-name">#</span>
						<input type="text" v-model="updatedName" placeholder="Nome utente" id="update-name"
							class="form-control" />
					</div>
					<div class="input-group mb-2">
						<span class="input-group-text" id="update-email">@</span>
						<input type="email" v-model="updatedEmail" id="update-email" placeholder="Email"
							class="form-control" />
					</div>
					<div class="d-flex gap-2 mb-3">
						<button type="submit" class="btn btn-primary rounded-pill fw-medium">Aggiorna</button>
						<button type="button" @click="closeForms"
							class="btn border rounded-pill fw-medium">Annulla</button>
					</div>
				</form>
			</div>
		</div>

		<!-- utente non loggato -->
		<div v-if="isLoggedIn === false" id="my_login_hero">

			<div id="hero_image" class="mb-3">
				<img src="/src/assets/login_hero.png" alt="" class="img-fluid">
			</div>

			<div class="px-3">
				<h1 class="mb-2">Pronto a partire per la tua <br>
					<span>prossima avventura?</span>
				</h1>
				<p class="fw-medium text-secondary">
					Con Travel App, pianificare il viaggio perfetto è semplice e veloce. <br>
					Esplora itinerari, aggiungi tappe, e
					organizza ogni dettaglio con pochi clic.
				</p>
			</div>

			<div class="px-3">
				<button v-if="showForm === false && showRegisterForm === false" @click="toggleForm()"
					class="btn btn-primary rounded-pill fw-medium w-100">inizia adesso</button>
				<div v-else>
					<div v-if="showForm">
						<h3>Login</h3>
						<form @submit.prevent="login">
							<div class="input-group mb-2">
								<span class="input-group-text" id="login-email">@</span>
								<input type="email" v-model="loginEmail" id="login-email" class="form-control"
									placeholder="Email" aria-label="Email" aria-describedby="basic-addon1" />
							</div>

							<div class="input-group mb-2">
								<span class="input-group-text" id="login-password"><i
										class="fa-solid fa-lock"></i></span>
								<input type="password" v-model="loginPassword" id="login-password" class="form-control"
									placeholder="Password" aria-label="Password" aria-describedby="login-password" />
							</div>

							<button type="submit"
								class="btn btn-primary rounded-pill fw-medium w-100 mb-1">Accedi</button>
						</form>
						<p class="pb-3">Non hai ancora un account? <strong
								@click="toggleRegisterForm()">Iscriviti</strong></p>
					</div>
				</div>

				<!-- Form di Registrazione -->
				<div v-if="showRegisterForm">
					<h3>Registrazione</h3>
					<form @submit.prevent="register">
						<div class="input-group mb-2">
							<span class="input-group-text" id="register-name"><i class="fa-regular fa-user"></i></span>
							<input type="text" v-model="registerName" id="register-name" class="form-control"
								placeholder="Nome" aria-label="Nome" />
						</div>

						<div class="input-group mb-3">
							<span class="input-group-text" id="register-email">@</span>
							<input type="email" v-model="registerEmail" id="register-email" class="form-control"
								placeholder="Email" aria-label="Email" />
						</div>

						<div class="input-group mb-2">
							<span class="input-group-text" id="register-password"><i
									class="fa-solid fa-lock"></i></span>
							<input type="password" v-model="registerPassword" id="register-password"
								class="form-control" placeholder="Password" aria-label="Password" />
						</div>

						<div class="input mb-2">
							<input type="password" v-model="registerPasswordConfirmation"
								id="register-password-confirmation" class="form-control" placeholder="Conferma Password"
								aria-label="Conferma Password" />
						</div>

						<div class="input mb-2">
							<input type="file" @change="handleFileUpload" id="cover-image" class="form-control"
								aria-label="Cover Image" />
						</div>

						<button type="submit"
							class="btn btn-primary rounded-pill fw-medium w-100 mb-1">Iscriviti</button>
					</form>
					<p>Hai già un account? <strong @click="toggleForm">Accedi</strong></p>
				</div>

			</div>
		</div>
	</div>

</template>

<style scoped>
#my_login_hero {
	height: 90vh;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: space-between;

	h1 {
		color: var(--primary-color);

		span {
			font-weight: bold;
			color: var(--tertiary-color);
		}
	}
}

#heroimage {
	position: relative;
	margin: 0;
	padding: 0;
	width: 100vw;
	height: 60vh;
	overflow: hidden;
}

#search_bar {
	width: 95%;
	margin: 0 auto;
	background-color: #fff;

	input[type="text"] {
		border: none;
		outline: none;
	}
}

.profile-picture {
	width: 50px;
	height: 50px;
	border-radius: 50%;
	margin-right: 10px;
	object-fit: cover;
}

button {
	margin-top: 10px;
}
</style>
