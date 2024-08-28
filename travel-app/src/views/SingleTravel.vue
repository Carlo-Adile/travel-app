<script>
import axios from 'axios';
import { state, getters, formattedDateRange } from '../state.js';
import StepCard from '../components/StepCard.vue';
import DatePicker from 'vue3-datepicker';
import gsap from 'gsap';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Map from '../components/Map.vue';

export default {
	name: 'SingleTravel',
	components: {
		StepCard,
		DatePicker,
		Map
	},
	data() {
		return {
			loading: true,
			travel: null,
			travelId: null,
			showForm: false,
			showFormMap: false,
			showFullMap: false,
			steps: [],
			groupedSteps: {},
			travelSteps: [],
			days: [],
			newStep: {
				title: '',
				day: null,
				time: '',
				description: '',
				tag: '',
				lat: null,
				lng: null
			},
			tags: [
				{ name: 'Ristoranti', iconClass: 'fa-solid fa-utensils' },
				{ name: 'Hotel', iconClass: 'fa-solid fa-bed' },
				{ name: 'Shopping', iconClass: 'fa-solid fa-bag-shopping' },
				{ name: 'Eventi', iconClass: 'fa-solid fa-ticket' },
				{ name: 'Città ed Attrazioni', iconClass: 'fa-solid fa-city' },
				{ name: 'Aeroporto', iconClass: 'fa-solid fa-plane' },
				{ name: 'Parchi e Aree naturali', iconClass: 'fa-solid fa-tree' },
				{ name: 'Mezzi di trasporto', iconClass: 'fa-solid fa-bus' },
				{ name: 'Musei, Gallerie e Monumenti', iconClass: 'fa-solid fa-landmark' },
				{ name: 'Spa e Benessere', iconClass: 'fa-solid fa-spa' },
				{ name: 'Spiagge e Località Balneari', iconClass: 'fa-solid fa-umbrella-beach' }
			],
			currentLocation: {
				lat: null,
				lng: null
			}
		}
	},
	computed: {
		validSteps() {
			return this.steps.filter(step => step.lat && step.lng && !isNaN(step.lat) && !isNaN(step.lng));
		}
	},
	mounted() {
		const travelId = this.$route.params.id;
		this.loadTravelData(travelId);
	},
	watch: {
		showFormMap(newVal) {
			if (newVal) {
				this.$nextTick(() => {
					this.initializeMap();
				});
			}
		}
	},
	methods: {
		/* metodi per l'ottenimento */
		async loadTravelData(travelId) {
			this.travelId = travelId;
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
					this.groupedSteps = this.groupStepsByDay(this.steps);
					console.log("singolo viaggio recuperato: ", this.travel);
					console.log("Steps validi per la mappa: ", this.validSteps);
				} else {
					this.$router.push({ name: 'not-found' });
				}
			} catch (error) {
				console.error('Errore durante il caricamento dei dati del viaggio:', error);
			}
		},
		groupStepsByDay(steps) {
			return steps.reduce((grouped, step) => {
				const day = step.day;
				if (!grouped[day]) {
					grouped[day] = [];
				}
				grouped[day].push(step);
				return grouped;
			}, {});
		},
		async addNewStep() {
			try {

				// Funzione di formattazione della data
				const formatDate = (date) => {
					if (!date) return null;

					const localDate = new Date(date);
					const year = localDate.getFullYear();
					const month = String(localDate.getMonth() + 1).padStart(2, '0');
					const day = String(localDate.getDate()).padStart(2, '0');

					return `${year}-${month}-${day}`;
				};
				/* prepara i dati */
				const stepData = {
					travel_id: this.$route.params.id,
					title: this.newStep.title,
					day: formatDate(this.newStep.day),
					time: this.newStep.time,
					description: this.newStep.description,
					tag: this.newStep.tag,
					lat: this.newStep.lat,
					lng: this.newStep.lng
				};
				console.log('Data dello step da inviare: ', stepData);
				/* await this.postStep(stepData); */
				try {
					const response = await axios.post(`${state.base_api_url}/travels/${stepData.travel_id}/steps`, stepData, {
						headers: {
							'Authorization': `Bearer ${state.auth.token}`,
							'Content-Type': 'application/json'
						}
					});
					/* this.steps.push(response.data.data); */
					await this.loadTravelData(this.travelId);
				} catch (error) {
					console.error('Errore durante l\'invio della tappa:', error.response?.data || error);
				}

				this.toggleForm(); // Nascondi il form
			} catch (error) {
				console.error('Errore durante la creazione della tappa:', error.response?.data || error);
			}
		},
		async getUserLocation() {
			return new Promise((resolve, reject) => {
				if (navigator.geolocation) {
					navigator.geolocation.getCurrentPosition(
						(position) => {
							this.currentLocation.lat = position.coords.latitude;
							this.currentLocation.lng = position.coords.longitude;
							resolve();
						},
						(error) => {
							console.error('Errore nell\'ottenere la posizione dell\'utente:', error);
							this.currentLocation.lat = 51.505; // Coordinate predefinite
							this.currentLocation.lng = -0.09; // Coordinate predefinite
							resolve(); // Risolvi la promessa anche se si verifica un errore
						}
					);
				} else {
					console.error('Geolocalizzazione non supportata.');
					this.currentLocation.lat = 51.505; // Coordinate predefinite
					this.currentLocation.lng = -0.09; // Coordinate predefinite
					resolve(); // Risolvi la promessa anche se la geolocalizzazione non è supportata
				}
			});
		},
		initializeMap() {
			const mapElement = document.getElementById('map');
			if (!mapElement) {
				console.error('Map container not found');
				return;
			}

			const map = L.map(mapElement).setView([51.505, -0.09], 13);

			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19
			}).addTo(map);

			map.on('click', (e) => {
				const { lat, lng } = e.latlng;
				this.newStep.lat = lat.toFixed(6);
				this.newStep.lng = lng.toFixed(6);

				L.marker([lat, lng]).addTo(map)
					.bindPopup(`Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`)
					.openPopup();
			});
		},
		async toggleFullMap() {
			if (!this.showFullMap) {
				await this.getUserLocation();
				console.log("Valid steps prima di aprire la mappa:", this.validSteps); // Log dei validSteps
				// Attendi che la posizione venga ottenuta
				this.showFullMap = true; // Mostra la mappa solo dopo aver ottenuto la posizione
			} else {
				this.showFullMap = false;
			}
		},
		/* template e animazioni */
		formatTime(time) {
			if (!time) return '';
			const [hours, minutes] = time.split(':');
			return `${hours}:${minutes}`;
		},
		formattedDay(day) {
			const options = { day: 'numeric', month: 'long' };
			const dayString = new Date(day);
			const formattedDay = dayString.toLocaleDateString('it-IT', options);
			return formattedDay;
		},
		getFormattedDateRange() {
			return formattedDateRange(this.travel.start_date, this.travel.end_date);
		},
		getTagIcon(tagName) {
			const tag = this.tags.find(t => t.name === tagName);
			return tag ? tag.iconClass : 'fa-solid fa-question';
		},
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
		},
		/* form */
		toggleForm() {
			this.showFormMap = !this.showFormMap;
			this.showForm = !this.showForm;
		},
	}
}
</script>

<template>
	<div class="container">
		<div class="row" v-if="travel && showFullMap === false">

			<img v-if="travel.cover_image" :src="`${'http://localhost:8000'}/${travel.cover_image}`" alt="Travel Picture"
				class="travel_picture" />
			<img v-else src="https://placehold.co/100" alt="Travel Picture" class="travel_picture" />

			<!-- header -->
			<div class="container-fluid pt-3">
				<div class="d-flex justify-content-between">
					<router-link :to="{ name: 'Home' }"><i class="fa-solid fa-chevron-left"></i></router-link>
					<div class="d-flex gap-2 justify-content-center">
						<i class="fa-solid fa-plus" @click="toggleForm"></i>
						<i class="fa-regular fa-map" @click=toggleFullMap></i>
					</div>

				</div>
				<div class="text-center">
					<h2>{{ travel.title }}</h2>
					<p>{{ getFormattedDateRange() }}</p>
				</div>
			</div>

			<!-- form per l'aggiunta di una tappa -->
			<form v-if="showForm" @submit.prevent="addNewStep" class="text-center modal-overlay">
				<div class="modal-content" @click.stop>
					<h3>Crea una nuova tappa</h3>

					<!-- Campi del modulo -->
					<div class="input-group mb-2">
						<span class="input-group-text"><i class="fa-solid fa-heading"></i></span>
						<input type="text" v-model="newStep.title" id="title" class="form-control" placeholder="Titolo">
					</div>

					<div class="mb-2">
						<textarea v-model="newStep.description" id="description" placeholder="Aggiungi una breve descrizione"
							class="form-control"></textarea>
					</div>

					<div class="input-group mb-2">
						<span class="input-group-text">Categoria</span>
						<select v-model="newStep.tag" id="category" class="form-select">
							<option v-for="tag in tags" :key="tag.name" :value="tag.name">{{ tag.name }}</option>
						</select>
					</div>

					<div class="mb-2 d-flex">
						<div class="input-group">
							<span class="input-group-text"><i class="fa-solid fa-calendar"></i></span>
							<DatePicker v-model="newStep.day" id="day" class="form-control rounded-0 date-picker" placeholder="Giorno"
								required />
						</div>
						<div>
							<input type="time" v-model="newStep.time" id="time" class="form-control" required>
						</div>
					</div>

					<!-- Sezione della mappa -->
					<div v-if="showFormMap" style="position: relative;">
						<div id="map" style="height: 400px; width: 100%; margin-bottom: 1rem;"></div>
					</div>

					<div class="mb-2 d-flex">
						<div class="input-group">
							<span class="input-group-text"><i class="fa-solid fa-map-pin"></i></span>
							<input type="text" id="lat" v-model="newStep.lat" class="form-control" placeholder="Latitudine"
								readonly />
						</div>
						<div class="input-group ms-2">
							<span class="input-group-text"><i class="fa-solid fa-map-pin"></i></span>
							<input type="text" id="lng" v-model="newStep.lng" class="form-control" placeholder="Longitudine"
								readonly />
						</div>
					</div>

					<div class="d-flex gap-2 mb-4 mt-2">
						<button type="submit" class="btn btn-primary rounded-pill">Aggiungi al viaggio</button>
						<button type="button" @click="toggleForm" class="btn border rounded-pill fw-medium">Annulla</button>
					</div>
				</div>
			</form>

			<!-- Sezione per la timeline suddivisa per giorno -->
			<div class="timeline" v-for="(steps, day) in groupedSteps" :key="day">
				<div class="day_limiter">
					<h3>{{ formattedDay(day) }}</h3>
				</div>
				<ul>
					<li v-for="(step, index) in steps" :key="step.id">
						<div class="time">{{ formatTime(step.time) }}</div>
						<div class="circle">
							<i :class="getTagIcon(step.tag)"></i>
						</div>
						<StepCard :step="step" :travel="travel" class="content" />

						<div v-if="index < steps.length - 1" class="line"></div>
					</li>
				</ul>
			</div>
			<div v-if="steps.length === 0" class="container">
				<h5 class="text-center fw-bold px-5 pt-1" style="color: var(--tertiary-color);">
					Nessuna tappa impostata per questo giorno!
				</h5>
				<img src="/src/assets/no_steps2.jpg" alt="" class="img-fluid">
			</div>

		</div>

		<!-- Mostra la mappa se l'utente seleziona la mappa -->
		<div v-if="showFullMap">
			<Map ref="mapComponent" :travelSteps="validSteps" :currentLocation="currentLocation" :showRouting="false" />
		</div>

	</div>
</template>

<style scoped>
.travel_picture {
	width: 100vw;
	padding: 0;
	margin: 0;
	object-fit: cover;
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

.timeline {
	position: relative;
	max-width: 600px;
	margin: 0 auto;
	padding: 0px 0;
}

.timeline ul {
	list-style: none;
	padding: 12px 0;
	margin: 0;
}

.timeline li {
	position: relative;
	padding: 10px 0;
	display: flex;
	align-items: flex-start;
}

.timeline li .line {
	position: absolute;
	left: calc(20% + 4px);
	top: 30px;
	width: 2px;
	height: 100%;
	background-color: #3498db;
	z-index: 0;
}

.timeline .day_limiter {
	margin: 2px 10px;
	border-bottom: 1px solid grey;
	border-radius: 5px;
	padding-left: 15px;
}

.timeline .time {
	width: 60px;
	text-align: right;
	margin-right: 15px;
	margin-top: -10px;
	color: #3498db;
	font-weight: bold;
}

.timeline .circle {
	width: 30px;
	height: 30px;
	background-color: #3498db;
	border-radius: 50%;
	position: absolute;
	left: calc(20% - 10px);
	top: 0;
	transform: translateY(10px);
	z-index: 1;
	display: flex;
	align-items: center;
	justify-content: center;

	i {
		color: white;
	}

}

.timeline .content {
	margin-top: -15px;
	margin-left: 35px;
	width: 70%;
}
</style>