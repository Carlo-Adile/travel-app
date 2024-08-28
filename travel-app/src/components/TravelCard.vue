<script>
import { state, formattedDateRange } from '../state.js';

export default {
	name: 'TravelCard',
	data() {
		return {
			base_api_url: state.base_api_url || 'http://localhost:8000',
			isPopoverVisible: false,
			showConfirmDeleteTravel: false
		}
	},
	components: {

	},
	props: {
		travel: {
			type: Object,
			required: true
		}
	},
	computed: {
		daysRemaining() {
			if (!this.travel.start_date) return null;

			const today = new Date();
			const startDate = new Date(this.travel.start_date);

			// Calcola la differenza in millisecondi
			const diffTime = startDate - today;

			// Converte la differenza da millisecondi a giorni
			const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

			return diffDays;
		}
	},
	methods: {
		getFormattedDateRange() {
			return formattedDateRange(this.travel.start_date, this.travel.end_date);
		},
		togglePopover() {
			this.isPopoverVisible = !this.isPopoverVisible;
		},
		openConfirmTravelDelete() {
			this.showConfirmDeleteTravel = true;
		},
		async deleteTravel() {
			try {
				// Conferma l'eliminazione con l'utente
				const confirmDelete = confirm('Sei sicuro di voler eliminare questo viaggio?');
				if (!confirmDelete) return;

				// Esegui la richiesta di eliminazione
				await axios.delete(`${this.base_api_url}/travels/${this.travel.id}`, {
					headers: {
						'Authorization': `Bearer ${getters.getToken()}`,
						'Content-Type': 'application/json'
					}
				});

				// Gestisci la risposta se necessario
				console.log('Viaggio eliminata con successo');

			} catch (error) {
				console.error('Errore durante l\'eliminazione dello step:', error.response?.data || error);
			}
		}
	}
}
</script>

<template>

	<div class="mb-1 travel_card">
		<!-- immagine viaggio -->

		<router-link :to="{ name: 'travel', params: { id: travel.id, slug: travel.slug } }" class="no_style">

			<div class="travel_card_content">
				<div class="image-container">
					<img v-if="travel.cover_image" :src="`${'http://localhost:8000'}/${travel.cover_image}`" alt="Travel Picture"
						class="travel_picture" />
					<img v-else src="https://placehold.co/100" alt="Travel Picture" class="travel_picture" />
				</div>
				<!-- informazioni viaggio -->
				<div class="info-container">
					<h5>{{ travel.title }}</h5>
					<p><i class="fa-regular fa-calendar"></i> {{ getFormattedDateRange() }}</p>
					<p v-if="daysRemaining >= 0"><i class="fa-regular fa-clock"></i> {{ daysRemaining }} giorni
						rimanenti
					</p>
				</div>
			</div>

		</router-link>

		<!-- popover menu -->
		<div class="popover-container">
			<button @click="togglePopover" class="popover-button btn">
				<i class="fa-solid fa-ellipsis-v"></i>
			</button>
			<div v-if="isPopoverVisible" class="popover-content">
				<p @click="openUpdateTravelForm">Modifica viaggio</p>
				<p @click="deleteTravel">Elimina</p>
			</div>
		</div>

	</div>

</template>

<style scoped>
.travel_card {
	display: flex;
	flex-wrap: nowrap;

	.travel_card_content {
		display: flex;
		flex: 1;
		align-items: start;
	}

	.image-container {
		flex: 0 0 auto;
		/* Prevents the image container from shrinking */
		width: 100px;
		height: 100px;
		margin-right: 8px;
	}

	.travel_picture {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.info-container {
		flex: 1;
		/* Allows this section to take up remaining space */
	}

	p {
		font-size: 15px;
		margin-bottom: 4px;
	}

	i {
		width: 14px;
		text-align: center;
		margin-right: 1px;
	}
}

.travel_picture {
	width: 100%;
	height: 100%;
	margin-right: 10px;
	object-fit: cover;
}

.popover-container {
	margin-left: auto;
	display: flex;
	align-items: start;
}
</style>
