<script>
import axios from 'axios';
import TravelCard from '../components/TravelCard.vue';
import { state, getters, getTravel } from '../state.js';
import DatePicker from 'vue3-datepicker';
import Profile from '../components/Profile.vue';
import ActionCard from '../components/ActionCard.vue';
import gsap from 'gsap';

export default {
	name: 'AppHome',
	components: {
		TravelCard,
		DatePicker,
		Profile,
		ActionCard
	},
	data() {
		return {
			travels: [],
			showForm: false,
			newTravel: {
				title: '',
				start_date: null,
				end_date: null,
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
		async loadTravels() {
			try {
				const travels = await getTravel();
				console.log('Viaggi recuperati:', travels);
				this.travels = travels;
			} catch (error) {
				console.error('Errore nel recupero dei viaggi:', error);
			}
		},
		async addNewTravel() {
			const formatDate = (date) => {
				// Restituisce solo la parte data in formato YYYY-MM-DD
				if (!date) return null;
				const d = new Date(date);
				return d.toISOString().split('T')[0];
			};
			const travelData = {
				title: this.newTravel.title,
				start_date: formatDate(this.newTravel.start_date),
				end_date: formatDate(this.newTravel.end_date)
			};
			// Axios post
			try {
				const token = state.auth.token;
				const response = await axios.post(`${state.base_api_url}/travels`, travelData, {
					headers: {
						'Authorization': `Bearer ${token}`,
						'Content-Type': 'application/json'
					}
				});
				// Aggiorna dati
				this.loadTravels();
				this.showForm = false;
			} catch (error) {
				console.error("errore nella creazione di un nuovo viaggio: ", error);
			}
		},
		toggleForm() {
			this.showForm = !this.showForm;
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
				delay: el.dataset.index * 0.2
			})
		}
	}
}
</script>

<template>
	<div class="container">
		<div class="row">
			<Profile />

			<ActionCard title="Hai aggiunto" :count="travels.length + ' viaggi'" buttonText="Aggiungi un viaggio"
				imgSrc="/src/assets/travel-luggage.png" @button-click="toggleForm" v-if="travels.length" />

			<ActionCard title="Aggiungi il tuo primo viaggio" buttonText="Aggiungi un viaggio"
				imgSrc="/src/assets/travel-luggage.png" @button-click="toggleForm" v-if="travels.length === 0 && isLoggedIn" />

			<form v-if="showForm" @submit.prevent="addNewTravel">
				<div class="mb-3">
					<label for="title" class="form-label">Titolo del viaggio</label>
					<input type="text" v-model="newTravel.title" id="title" class="form-control" required>
				</div>
				<div class="mb-3">
					<label for="start_date" class="form-label">Data di inizio</label>
					<DatePicker v-model="newTravel.start_date" id="start_date" class="form-control" required />
				</div>
				<div class="mb-3">
					<label for="end_date" class="form-label">Data di fine</label>
					<DatePicker v-model="newTravel.end_date" id="end_date" class="form-control" required />
				</div>
				<button type="submit" class="btn btn-primary">Crea Viaggio</button>
			</form>

			<!-- Accordion per i viaggi -->
			<div class="accordion accordion-flush" id="accordionFlushExample" v-if="isLoggedIn">
				<!-- Accordion per i prossimi viaggi -->
				<div class="accordion-item">
					<h2 class="accordion-header">
						<button class="accordion-button" type="button" data-bs-toggle="collapse"
							data-bs-target="#flush-collapseFuture" aria-expanded="true" aria-controls="flush-collapseFuture">
							I tuoi prossimi viaggi
						</button>
					</h2>
					<div id="flush-collapseFuture" class="accordion-collapse collapse show">
						<div class="accordion-body">
							<transition-group appear @before-enter="beforeEnter" @enter="enter">
								<div class="col-12" v-for="(travel, index) in futureTravels" :key="travel.id" :data-index="index">
									<TravelCard :travel="travel" />
								</div>
							</transition-group>
						</div>
					</div>
				</div>

				<!-- Accordion per i viaggi completati -->
				<div class="accordion-item">
					<h2 class="accordion-header">
						<button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
							data-bs-target="#flush-collapsePast" aria-expanded="false" aria-controls="flush-collapsePast">
							Viaggi completati
						</button>
					</h2>
					<div id="flush-collapsePast" class="accordion-collapse collapse">
						<div class="accordion-body">
							<div class="col-12" v-for="(travel, index) in pastTravels" :key="travel.id">
								<TravelCard :travel="travel" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
#my_action_card {
	background-color: var(--primary-color);
}
</style>
