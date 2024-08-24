<script>
import axios from 'axios';
import { state, getters, getTravel } from '../state.js';

export default {
	name: 'TravelCard',
	data() {
		return {

		}
	},
	props: {
		step: {
			type: Object,
			required: true
		}
	},
	computed: {
		isChecked: {
			get() {
				return !!this.step.checked; // Converte 1 o 0 in true o false
			},
			set(value) {
				this.step.checked = value ? 1 : 0; // Converte true o false in 1 o 0
			}
		}
	},
	methods: {
		async updateCheckedStatus() {
			try {
				// Prepara i dati per l'aggiornamento
				const updatedData = {
					checked: this.step.checked
				};

				// Effettua la richiesta di aggiornamento
				const response = await axios.patch(`${state.base_api_url}/steps/${this.step.id}`, updatedData, {
					headers: {
						'Authorization': `Bearer ${getters.getToken()}`,
						'Content-Type': 'application/json'
					}
				});

				// Gestisci la risposta se necessario
				console.log('Stato aggiornato con successo:', response.data);
			} catch (error) {
				console.error('Errore durante l\'aggiornamento dello stato:', error.response?.data || error);
			}
		}
	}
}
</script>

<template>
	<div class="mb-2" id="my_step_card">
		<div class="d-flex justify-content-between">

			<div class="col-8">
				<h3>{{ step.title }}</h3>
				<p v-if="step.time"><i class="fa-regular fa-clock"></i> {{ step.time }}</p>
				<p v-if="step.cost"><i class="fa-solid fa-euro-sign"></i> {{ step.cost }}</p>
				<p v-if="step.description"><i class="fa-solid fa-info"></i> {{ step.description }}</p>
				<a :href="step.google_maps_link" target="_blank" rel="noopener noreferrer">
					<p v-if="step.google_maps_link"><i class="fa-solid fa-location-dot"></i> Apri su Google Maps</p>
				</a>
			</div>

			<!-- checkbox di Katie Radford https://getcssscan.com/css-checkboxes-examples -->
			<div class="checkbox-wrapper-31">
				<input type="checkbox" v-model="isChecked" @change="updateCheckedStatus" />
				<svg viewBox="0 0 35.6 35.6">
					<circle class="background" cx="17.8" cy="17.8" r="17.8"></circle>
					<circle class="stroke" cx="17.8" cy="17.8" r="14.37"></circle>
					<polyline class="check" points="11.78 18.12 15.55 22.23 25.17 12.87"></polyline>
				</svg>
			</div>
		</div>

	</div>
</template>

<style scoped>
.no_style {
	text-decoration: none;
	color: inherit;
}

#my_card {
	background-color: var(--primary-color);
}

#my_step_card {
	background-color: var(--secondary-color);
	border-left: 10px solid var(--tertiary-color);
	padding: 10px;

	p {
		margin-bottom: 6px;
	}

	i {
		width: 16px;
		text-align: center;
	}
}

/* checkbox di Katie Radford https://getcssscan.com/css-checkboxes-examples */
.checkbox-wrapper-31 {
	position: relative;
	display: inline-block;
	width: 50px;
	height: 50px;
}

.checkbox-wrapper-31 .background {
	fill: var(--primary-color);
	transition: ease all 0.6s;
}

.checkbox-wrapper-31 .stroke {
	fill: none;
	stroke: #fff;
	stroke-miterlimit: 10;
	stroke-width: 2px;
	stroke-dashoffset: 100;
	stroke-dasharray: 100;
	transition: ease all 0.6s;
}

.checkbox-wrapper-31 .check {
	fill: none;
	stroke: #fff;
	stroke-linecap: round;
	stroke-linejoin: round;
	stroke-width: 2px;
	stroke-dashoffset: 22;
	stroke-dasharray: 22;
	transition: ease all 0.6s;
}

.checkbox-wrapper-31 input[type=checkbox] {
	position: absolute;
	width: 100%;
	height: 100%;
	left: 0;
	top: 0;
	margin: 0;
	opacity: 0;
	-appearance: none;
	-webkit-appearance: none;
}

.checkbox-wrapper-31 input[type=checkbox]:hover {
	cursor: pointer;
}

.checkbox-wrapper-31 input[type=checkbox]:checked+svg .background {
	/* fill: #6cbe45; */
	fill: var(--tertiary-color)
}

.checkbox-wrapper-31 input[type=checkbox]:checked+svg .stroke {
	stroke-dashoffset: 0;
}

.checkbox-wrapper-31 input[type=checkbox]:checked+svg .check {
	stroke-dashoffset: 0;
}
</style>