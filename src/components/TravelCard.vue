<script>
import { state, formattedDateRange, updateTravel, getters } from '../state.js';
import DatePicker from 'vue3-datepicker';
import axios from 'axios';

export default {
	name: 'TravelCard',
	components: {
		DatePicker
	},
	data() {
		return {
			baseApiUrl: 'https://api-travel-agenda.carloadile.com/api',
			/* baseApiUrl: 'http://127.0.0.1:8000/api', */
			/* aggiorna viaggio */
			updatedTravelTitle: this.travel.title,
			updatedTravelStartDate: new Date(this.travel.start_date),
			updatedTravelEndDate: new Date(this.travel.end_date),
			updatedCoverImage: null,
			/* forms */
			isPopoverVisible: false,
			showUpdateTravelForm: false,
			showConfirmDeleteTravel: false
		}
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
		/* medoti per aggiornare il viaggio */
		async updateTravel() {
			const formData = new FormData();
			const formatDate = (date) => {
				if (!date) return null;
				const d = new Date(date);
				return d.toISOString().split('T')[0];
			};

			formData.append('title', this.updatedTravelTitle || this.travel.title);
			formData.append('start_date', formatDate(this.updatedTravelStartDate) || this.travel.start_date);
			formData.append('end_date', formatDate(this.updatedTravelEndDate) || this.travel.end_date);
			formData.append('_method', 'PATCH');

			if (this.updatedCoverImage) {
				formData.append('cover_image', this.updatedCoverImage);
			}
			try {

				console.log('Dati inviati:', Array.from(formData.entries()));

				const response = await axios.post(`${this.baseApiUrl}/travels/${this.travel.id}`, formData, {
					headers: {
						'Authorization': `Bearer ${getters.getToken()}`,
						'Content-Type': 'application/x-www-form-urlencoded'
					}
				});

				this.closeForms();
				this.updatedTravelTitle = '';
				this.updatedTravelStartDate = null;
				this.updatedTravelEndDate = null;
				this.updatedCoverImage = null;
				this.$emit('updated-travels');

			} catch (error) {
				console.error('Errore durante la modifica del viaggio', error.response ? error.response.data : error);
			}
		},
		handleImageUpload(event) {
			const file = event.target.files[0];
			if (file) {
				this.updatedCoverImage = file;
			}
		},
		async deleteTravel() {
			try {
				// Conferma l'eliminazione con l'utente
				const confirmDelete = confirm('Sei sicuro di voler eliminare questo viaggio?');
				if (!confirmDelete) return;

				// Esegui la richiesta di eliminazione
				await axios.delete(`${this.baseApiUrl}/travels/${this.travel.id}`, {
					headers: {
						'Authorization': `Bearer ${getters.getToken()}`,
						'Content-Type': 'application/json'
					}
				});

				this.$emit('updated-travels');

				// Gestisci la risposta se necessario
				console.log('Viaggio eliminata con successo');

			} catch (error) {
				console.error('Errore durante l\'eliminazione del viaggio:', error.response?.data || error);
			}
		},
		/* forms */
		togglePopover() {
			this.isPopoverVisible = !this.isPopoverVisible;
		},
		openConfirmTravelDelete() {
			this.showConfirmDeleteTravel = true;
		},
		toggleUpdateTravelForm() {
			this.showUpdateTravelForm = !this.showUpdateTravelForm;
			this.isPopoverVisible = !this.isPopoverVisible;
			this.$emit('update-zindex', this.travel.id);
		},
		closeForms() {
			this.showUpdateTravelForm = false;
			this.isPopoverVisible = false;
		},
	}
}
</script>

<template>

	<div class="mb-1 travel_card">
		<!-- immagine viaggio -->

		<router-link :to="{ name: 'travel', params: { id: travel.id, slug: travel.slug } }" class="no_style">

			<div class="travel_card_content">
				<div class="image-container">
					<img v-if="travel.cover_image"
						:src="`https://api-travel-agenda.carloadile.com/storage/${travel.cover_image}`"
						alt="Travel Picture" class="travel_picture" />
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
				<p @click="toggleUpdateTravelForm">Modifica viaggio</p>
				<p @click="deleteTravel">Elimina</p>
			</div>
		</div>

		<!-- Form per aggiornare il viaggio -->
		<div v-show="showUpdateTravelForm" class="modal-overlay" @click="closeForms">
			<div @click.stop class="modal-content">
				<h2>Aggiorna viaggio</h2>
				<hr>
				<form @submit.prevent="updateTravel">
					<div class="mb-2">
						<label for="update-title" class="form-label">Titolo</label>
						<input type="text" v-model="updatedTravelTitle" placeholder="Massimo 55 caratteri"
							id="update-title" class="form-control" required />
					</div>
					<div class="d-flex flex-wrap gap-2 mb-2">
						<div>
							<label for="start_date" class="form-label">Data di inizio</label>
							<DatePicker v-model="updatedTravelStartDate" id="start_date" class="form-control"
								required />
						</div>
						<div>
							<label for="end_date" class="form-label">Data di fine</label>
							<DatePicker v-model="updatedTravelEndDate" id="end_date" class="form-control" required />
						</div>
					</div>
					<div class="mb-2">
						<label for="cover_image" class="form-label">Immagine di copertina</label>
						<input type="file" @change="handleImageUpload" id="cover_image" class="form-control">
					</div>
					<hr>
					<div class="d-flex justify-content-center gap-2 mt-1">
						<button type="submit" class="btn rounded-pill form_btn_confirm">Conferma</button>
						<button type="button" @click="closeForms"
							class="btn border rounded-pill form_btn_cancel">Annulla</button>
					</div>
				</form>
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
	position: relative;
	z-index: 1001;
}

.popover-content {
	position: absolute;
	top: 30%;
	right: 10%;
	background-color: white;
	border: 1px solid #ddd;
	border-radius: 4px;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
	padding: 10px;
	margin-top: 8px;
	z-index: 9999;
	min-width: 150px;
}

.modal-overlay {
	background: transparent;
	backdrop-filter: none;
}
</style>
