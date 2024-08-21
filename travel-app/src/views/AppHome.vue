<script>
import TravelCard from '../components/TravelCard.vue';
import { state, getters, login, logout, updateProfile, getTravel } from '../state.js';

export default {
	name: 'AppHome',
	components: {
		TravelCard
	},
	data() {
		return {
			travels: [],
		}
	},
	mounted() {
		if (this.isLoggedIn) {
			// Carica i viaggi all'avvio se l'utente è già loggato
			getTravel().then((travels) => {
				console.log('Viaggi recuperati all\'avvio:', travels);
				this.travels = travels;
			}).catch((error) => {
				console.error('Errore nel recupero dei viaggi all\'avvio:', error);
			});
		}
	},
	computed: {
		isLoggedIn() {
			return getters.isLoggedIn();
		}
	},
	watch: {
		isLoggedIn(newValue) {
			if (newValue) {
				// L'utente è loggato, carica i viaggi
				getTravel().then((travels) => {
					console.log('Viaggi recuperati:', travels);
					this.travels = travels;
				}).catch((error) => {
					console.error('Errore nel recupero dei viaggi:', error);
				});
			}
		}
	}
}
</script>

<template>
	<div class="container">

		<h1>I miei viaggi</h1>
		<p class="text-secondary fw-medium">n viaggi aggiunti</p>

		<div class="d-flex justify-content-between align-items-center btn btn-primary p-2 mb-4">
			<span class="fw-medium">
				Aggiungi un nuovo viaggio
			</span>
		</div>

		<div class="row gap-2 px-2">
			<!-- <div class="card p-2" v-if="travels" v-for="travel in travels">
				{{ travel.title }}
			</div> -->
			<div class="col-12" v-for="(travel, index) in travels" data-index="index" :key="travel.id">
				<TravelCard :travel="travel" />
			</div>

		</div>

	</div>
</template>

<style scoped></style>