<script>
import axios from 'axios';
import { state, getters } from '../state.js';
import StepCard from '../components/StepCard.vue';
import DayCard from '../components/DayCard.vue';
import ActionCard from '../components/ActionCard.vue';
import DatePicker from 'vue3-datepicker';
import gsap from 'gsap';

export default {
	name: 'SingleTravel',
	components: {
		StepCard,
		DayCard,
		ActionCard,
		DatePicker
	},
	data() {
		return {
			loading: true,
			travel: null,
			showForm: false,
			steps: [],
			days: [],
			newStep: {
				title: '',
				day: null,
				time: '',
				description: '',
				cost: null,
				google_maps_link: '',
			},
			selectedDay: null, // Giorno selezionato inizialmente
		}
	},
	mounted() {
		const travelId = this.$route.params.id;
		this.loadTravelData(travelId);
	},
	computed: {
		filteredSteps() {
			if (!this.selectedDay) return [];
			return this.steps.filter(step => this.formatDate(step.day) === this.selectedDay);
		}
	},
	methods: {
		selectDay(day) {
			this.selectedDay = this.formatDate(day.date); // Aggiorna il giorno selezionato
		},
		async loadTravelData(travelId) {
			try {
				const url = `${state.base_api_url}/travels/${travelId}`;
				const config = {
					headers: {
						Authorization: `Bearer ${getters.getToken()}`
					}
				};
				const response = await axios.get(url, config);
				if (response.data.success) {
					this.travel = response.data.response;
					this.steps = this.travel.steps;
					this.days = this.getDaysArray(this.travel.start_date, this.travel.end_date);
					this.selectedDay = this.formatDate(this.travel.start_date);
					console.log("singolo viaggio recuperato: ", this.travel);
				} else {
					this.$router.push({ name: 'not-found' });
				}
			} catch (error) {
				console.error('Errore durante il caricamento dei dati del viaggio:', error);
			}
		},
		getDaysArray(startDate, endDate) {
			const daysArray = [];
			const start = new Date(startDate);
			const end = new Date(endDate);

			while (start <= end) {
				daysArray.push({
					date: start.toISOString().split('T')[0], // YYYY-MM-DD
					dayOfWeek: start.toLocaleDateString('en-US', { weekday: 'long' }), // Giorno della settimana
					dayNumber: start.getDate()
				});
				start.setDate(start.getDate() + 1);
			}
			return daysArray;
		},
		formatDate(date) {
			if (!date) return null;

			const localDate = new Date(date);
			// Ottieni la data locale nel formato YYYY-MM-DD
			const year = localDate.getFullYear();
			const month = String(localDate.getMonth() + 1).padStart(2, '0'); // I mesi sono 0-based
			const day = String(localDate.getDate()).padStart(2, '0');

			return `${year}-${month}-${day}`;
		},
		async addNewStep() {
			try {
				const stepData = this.createStepData();
				await this.postStep(stepData);
				this.toggleForm(); // Nascondi il form
			} catch (error) {
				console.error('Errore durante la creazione della tappa:', error.response?.data || error);
			}
		},
		createStepData() {
			return {
				travel_id: this.$route.params.id,
				title: this.newStep.title,
				day: this.formatDate(this.newStep.day),
				time: this.newStep.time,
				description: this.newStep.description,
				cost: this.newStep.cost,
				google_maps_link: this.newStep.google_maps_link
			};
		},
		async postStep(stepData) {
			try {
				const response = await axios.post(`${state.base_api_url}/travels/${stepData.travel_id}/steps`, stepData, {
					headers: {
						'Authorization': `Bearer ${state.auth.token}`,
						'Content-Type': 'application/json'
					}
				});
				this.steps.push(response.data.data);
			} catch (error) {
				console.error('Errore durante l\'invio della tappa:', error.response?.data || error);
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
		<div class="row" v-if="travel">

			<!-- header -->
			<div class="d-flex align-items-center justify-content-between px-4 pt-3">
				<h2 class="p-0 m-0">{{ travel.title }}</h2>
				<div>
					<button class="btn fs-4 p-0 m-0" @click="openMenu">
						<i class="fa-solid fa-ellipsis-v"></i> <!-- Icona menu -->
					</button>
				</div>
			</div>

			<ActionCard title="Hai aggiunto" :count="steps.length + ' tappe'" buttonText="Aggiungi una tappa"
				imgSrc="/src/assets/travel-luggage.png" @button-click="toggleForm" />

			<form v-if="showForm" @submit.prevent="addNewStep">
				<div class="mb-3">
					<label for="title" class="form-label">Titolo della tappa</label>
					<input type="text" v-model="newStep.title" id="title" class="form-control" required>
				</div>

				<div class="mb-3">
					<label for="day" class="form-label">Giorno</label>
					<DatePicker v-model="newStep.day" id="day" class="form-control" required />
				</div>

				<div class="mb-3">
					<label for="time" class="form-label">Orario</label>
					<input type="time" v-model="newStep.time" id="time" class="form-control" required>
				</div>

				<div class="mb-3">
					<label for="description" class="form-label">Descrizione</label>
					<textarea v-model="newStep.description" id="description" class="form-control"></textarea>
				</div>

				<div class="mb-3">
					<label for="cost" class="form-label">Costo (€)</label>
					<input type="number" v-model="newStep.cost" id="cost" class="form-control" min="0" step="0.01">
				</div>

				<div class="mb-3">
					<label for="google_maps_link" class="form-label">Link Google Maps</label>
					<input type="url" v-model="newStep.google_maps_link" id="google_maps_link" class="form-control">
				</div>

				<button type="submit" class="btn btn-primary">Crea Tappa</button>
			</form>


			<!-- Sezione per i giorni del viaggio -->
			<div class="days-container mb-3">
				<DayCard v-for="(day, index) in days" :key="index" :day="day" :showYear="true" :showMonth="true"
					:class="{ 'selected-day': formatDate(day.date) === selectedDay }" @click="selectDay(day)" />
			</div>

			<div v-if="filteredSteps.length > 0">
				<transition-group appear @before-enter="beforeEnter" @enter="enter">
					<div class="col-12" v-for="(step, index) in filteredSteps" :key="step.id" :data-index="index">
						<StepCard :step="step" />
					</div>
				</transition-group>
			</div>

			<div v-else class="container">
				<h5 class="text-center fw-bold px-5 pt-1" style="color: var(--tertiary-color);">
					Nessuna tappa impostata per questo giorno!
				</h5>
				<img src="/src/assets/no_steps2.jpg" alt="" class="img-fluid">
			</div>


		</div>
	</div>
</template>

<style scoped>
.no_style {
	text-decoration: none;
	color: inherit;
}

.days-container {
	display: flex;
	overflow-x: auto;
	padding: 1rem;
	gap: 1rem;
}

.days-container::-webkit-scrollbar {
	height: 8px;
}

.days-container::-webkit-scrollbar-thumb {
	background-color: #ccc;
	border-radius: 4px;
}
</style>
