<script>
import axios from 'axios';
import TravelCard from '../components/TravelCard.vue';
import { state, getters, login, logout, updateProfile, register, getTravel } from '../state.js';
import DatePicker from 'vue3-datepicker';
import Profile from '../components/Profile.vue';
import gsap from 'gsap';


export default {
	name: 'AppHome',
	components: {
		TravelCard,
		DatePicker,
		Profile
	},
	data() {
		return {
			baseApiUrl: 'https://api-travel-agenda.carloadile.com/api',
			travels: [],
			showForm: false,
			highlightedTravelId: null,
			newTravel: {
				title: '',
				start_date: null,
				end_date: null,
				cover_image: null
			}
		}
	},
	mounted() {
		if (this.isLoggedIn) {
			// Carica i viaggi all'avvio se l'utente è già loggato
			this.loadTravels();
		}
	},
	computed: {
		isLoggedIn() {
			return getters.isLoggedIn();
		},
		futureTravels() {
			const today = new Date();
			return this.travels.filter(travel => new Date(travel.end_date) >= today);
		},
		pastTravels() {
			const today = new Date();
			return this.travels.filter(travel => new Date(travel.end_date) < today);
		}
	},
	watch: {
		isLoggedIn(newValue) {
			if (newValue) {
				// L'utente è loggato, carica i viaggi
				this.loadTravels();
			}
		}
	},
	methods: {
		/* metodi per ottenere i dati */
		async loadTravels() {
			try {
				const travels = await getTravel();
				console.log('Viaggi recuperati:', travels);
				this.travels = travels;
			} catch (error) {
				console.error('Errore nel recupero dei viaggi:', error);
			}
		},
		/* metodi per la creazione */
		handleImageUpload(event) {
			const file = event.target.files[0];
			if (file) {
				this.newTravel.cover_image = file;
			}
		},
		async addNewTravel() {
			const formatDate = (date) => {
				if (!date) return null;
				const d = new Date(date);
				return d.toISOString().split('T')[0];
			};

			// Creiamo un oggetto FormData
			const formData = new FormData();
			formData.append('title', this.newTravel.title);
			formData.append('start_date', formatDate(this.newTravel.start_date));
			formData.append('end_date', formatDate(this.newTravel.end_date));

			// Se l'utente ha selezionato un'immagine, la aggiungiamo al FormData
			if (this.newTravel.cover_image) {
				formData.append('cover_image', this.newTravel.cover_image);
			}

			console.log('Dati inviati:', Array.from(formData.entries()));

			// Axios post per inviare il FormData
			try {
				const token = state.auth.token;
				await axios.post(`${this.baseApiUrl}/travels`, formData, {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'multipart/form-data'
					}
				});
				this.loadTravels();
				this.showForm = false;
			} catch (error) {
				console.error("Errore nella creazione di un nuovo viaggio: ", error);
			}
		},
		/* form */
		toggleForm() {
			this.showForm = !this.showForm;
		},
		handleZIndexUpdate(travelId) {
			this.highlightedTravelId = travelId;
		},
		/* animation */
		beforeEnter(el) {
			el.style.opacity = 0;
			el.style.transform = 'translateX(60px)';
		},
		enter(el) {
			gsap.to(el, {
				opacity: 1,
				x: 0,
				duration: 1,
				delay: el.dataset.index * 0.15
			})
		}
	}
}
</script>

<template>
	<div class="container">
		<div class="row">
			<Profile />

			<!-- bottone aggiungi un viaggio -->
			<div class="my-3" v-if="isLoggedIn">
				<button class="btn btn-sm rounded-pill w-100 border fw-bold text-white p-2" @click="toggleForm()"
					style="background-color: var(--tertiary-color);">Aggiungi un nuovo viaggio</button>
			</div>

			<!-- form per aggiungere un viaggio -->
			<form v-if="showForm" @submit.prevent="addNewTravel" class="modal-overlay">
				<div class="modal-content">
					<div class="mb-2">
						<label for="title" class="form-label">Titolo</label>
						<input type="text" v-model="newTravel.title" id="title" placeholder="Titolo"
							class="form-control" required>
					</div>

					<div class="d-flex flex-wrap gap-2 mb-2">
						<div>
							<label for="start_date" class="form-label">Data di inizio</label>
							<DatePicker v-model="newTravel.start_date" id="start_date" class="form-control" required />
						</div>
						<div>
							<label for="end_date" class="form-label">Data di fine</label>
							<DatePicker v-model="newTravel.end_date" id="end_date" class="form-control" required />
						</div>
					</div>

					<div class="mb-2">
						<label for="cover_image" class="form-label">Immagine di copertina</label>
						<input type="file" @change="handleImageUpload" id="cover_image" class="form-control">
					</div>

					<div class="d-flex gap-2 mb-2 mt-3">
						<button type="submit" class="btn btn-primary rounded-pill">Crea Viaggio</button>
						<button type="button" class="btn border rounded-pill" @click="toggleForm">Annulla</button>
					</div>
				</div>
			</form>

			<!-- Accordion per i viaggi -->
			<div class="accordion accordion-flush" id="accordionFlushExample" v-if="isLoggedIn">
				<!-- Accordion per i prossimi viaggi -->
				<div class="accordion-item">
					<h2 class="accordion-header">
						<button class="accordion-button" type="button" data-bs-toggle="collapse"
							data-bs-target="#flush-collapseFuture" aria-expanded="true"
							aria-controls="flush-collapseFuture">
							I tuoi prossimi viaggi
						</button>
					</h2>
					<div id="flush-collapseFuture" class="accordion-collapse collapse show">
						<div class="accordion-body">
							<transition-group appear @before-enter="beforeEnter" @enter="enter">
								<div v-for="(travel, index) in futureTravels" :key="travel.id" :data-index="index"
									class="travel_card" :class="{ 'highlighted': highlightedTravelId === travel.id }">
									<TravelCard :travel="travel" @update-zindex="handleZIndexUpdate"
										@updated-travels="loadTravels" />
								</div>
							</transition-group>
						</div>
					</div>
				</div>
				<!-- Accordion per i viaggi completati -->
				<div class="accordion-item">
					<h2 class="accordion-header">
						<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
							data-bs-target="#flush-collapsePast" aria-expanded="false"
							aria-controls="flush-collapsePast">
							Viaggi completati
						</button>
					</h2>
					<div id="flush-collapsePast" class="accordion-collapse collapse">
						<div class="accordion-body">
							<transition-group appear @before-enter="beforeEnter" @enter="enter">
								<div class="col-12" v-for="(travel, index) in pastTravels" :key="travel.id"
									:data-index="index">
									<TravelCard :travel="travel" />
								</div>
							</transition-group>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
.popover-container {

	position: relative;
	z-index: 1001;
}

.popover-content {
	position: absolute;
	z-index: 9999;
}

.modal-overlay {
	z-index: 100000;
}

.modal-content {
	z-index: 100001;
}

.highlighted {
	z-index: 1000;
	/* valore alto per il viaggio evidenziato */
	position: relative;
	/* assicurati che il z-index funzioni */
}
</style>
