<script>
import axios from 'axios';
import { state, getters, getTravel, updateStep, deleteStep } from '../state.js';
import DatePicker from 'vue3-datepicker';

export default {
	name: 'StepCard',
	components: {
		DatePicker,
	},
	data() {
		return {
			/* visualizza form */
			showUpdateStepForm: false,
			showConfirmDeleteStep: false,
			isPopoverVisible: false,
			/* update step */
			updatedTime: '',
			updatedDay: new Date(this.step.day),
			updatedTitle: '',
			updatedDescription: '',
			updatedTag: '',
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
		}
	},
	props: {
		step: {
			type: Object,
			required: true
		},
		travel: {
			type: Object,
			required: true
		}
	},
	computed: {
		isChecked: {
			get() {
				return !!this.step.checked;
			},
			set(value) {
				this.step.checked = value ? 1 : 0;
			}
		},
		minDate() {
			return new Date(this.travel.start_date);
		},
		maxDate() {
			return new Date(this.travel.end_date);
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
		},
		openUpdateStepForm() {
			this.showUpdateStepForm = true;
		},
		async updateStep() {
			try {
				// Converti la data nel formato YYYY-MM-DD
				const localDate = new Date(this.updatedDay);
				const year = localDate.getFullYear();
				const month = String(localDate.getMonth() + 1).padStart(2, '0');
				const day = String(localDate.getDate()).padStart(2, '0');
				const updatedDay = `${year}-${month}-${day}`;
				// Prepara i dati da inviare per l'aggiornamento del profilo
				const stepData = {
					id: this.step.id,
					title: this.updatedTitle,
					day: updatedDay,
					time: this.updatedTime,
					description: this.updatedDescription,
					tag: this.updatedTag
				};

				// Richiama la funzione updateStep di state.js e passa lo stepId
				const response = await updateStep(stepData.id, stepData);

				// Aggiorna il componente con i nuovi dati
				this.step.title = this.updatedTitle;
				this.step.description = this.updatedDescription;
				this.step.day = this.updatedDay;
				this.step.time = this.updatedTime;

				this.step.title = this.updatedTitle;
				/* this.refreshData(); */

				// Gestisci la risposta, se necessario
				console.log('Tappa aggiornata con successo: ', response);

				// Potresti voler chiudere il form dopo l'aggiornamento
				this.closeForms();

			} catch (error) {
				// Gestisci l'errore, se necessario
				console.error('Step update failed:', error);
			}
		},
		openConfirmStepDelete() {
			this.showConfirmDeleteStep = true;
		},
		async deleteStep() {
			try {
				// Conferma l'eliminazione con l'utente
				const confirmDelete = confirm('Sei sicuro di voler eliminare questa tappa?');
				if (!confirmDelete) return;

				// Esegui la richiesta di eliminazione
				await axios.delete(`${state.base_api_url}/steps/${this.step.id}`, {
					headers: {
						'Authorization': `Bearer ${getters.getToken()}`,
						'Content-Type': 'application/json'
					}
				});

				// Gestisci la risposta se necessario
				console.log('Tappa eliminata con successo');

				// Potresti voler emettere un evento o chiamare un metodo per aggiornare lo stato del componente genitore
				this.$emit('stepDeleted', this.step.id);

				// Chiudi il modulo di conferma eliminazione
				this.closeForms();

			} catch (error) {
				console.error('Errore durante l\'eliminazione dello step:', error.response?.data || error);
			}
		},
		togglePopover() {
			this.isPopoverVisible = !this.isPopoverVisible;
		},
		closeForms() {
			this.showUpdateStepForm = false;
			this.showConfirmDeleteStep = false;
			this.isPopoverVisible = false;
		}
	}
}
</script>

<template>
	<div class="mb-2 p-0">
		<div class="step_card d-flex justify-content-between">
			<div>
				<h3>{{ step.title }}</h3>
				<p v-if="step.description">{{ step.description }}</p>
			</div>
			<!-- Icona menu con popover -->
			<div class="popover-container">
				<button @click="togglePopover" class="popover-button btn">
					<i class="fa-solid fa-ellipsis-v"></i>
				</button>
				<div v-if="isPopoverVisible" class="popover-content">
					<p @click="openUpdateStepForm">Modifica tappa</p>
					<p @click="deleteStep">Elimina</p>
				</div>

				<!-- Form per aggiornare la tappa -->
				<div v-if="showUpdateStepForm" class="modal-overlay" @click="closeForms">
					<div class="modal-content" @click.stop>
						<h3>Aggiorna tappa</h3>
						<form @submit.prevent="updateStep">
							<div class="input-group mb-2">
								<span class="input-group-text" id="update-title">#</span>
								<input type="text" v-model="updatedTitle" placeholder="Titolo" id="update-title"
									class="form-control" required />
							</div>
							<div class="mb-2">
								<textarea v-model="updatedDescription" id="update-description"
									placeholder="Modifica la descrizione" class="form-control" required />
							</div>
							<div class="input-group mb-2">
								<span class="input-group-text">Categoria</span>
								<select v-model="updatedTag" id="category" class="form-select">
									<option v-for="tag in tags" :key="tag" :value="tag.name">
										{{ tag.name }}
									</option>
								</select>
							</div>
							<div class="mb-2 d-flex">
								<div class="input-group">
									<span class="input-group-text"><i class="fa-solid fa-calendar"></i></span>
									<DatePicker v-model="updatedDay" id="day" class="form-control rounded-0 date-picker"
										placeholder="Giorno" :min-date="minDate" :max-date="maxDate" />
								</div>
								<div>
									<input type="time" v-model="updatedTime" id="time" class="form-control" required />
								</div>
							</div>
							<div class="d-flex gap-2 mb-3">
								<button type="submit" class="btn btn-primary rounded-pill fw-medium">Conferma</button>
								<button type="button" @click="closeForms"
									class="btn border rounded-pill fw-medium">Annulla</button>
							</div>
						</form>
					</div>
				</div>

			</div>
		</div>
	</div>
</template>

<style scoped>
.step_card {

	p,
	h3 {
		margin-bottom: 4px;
	}

	i {
		width: 16px;
		text-align: center;
		margin-right: 1px;
	}
}
</style>