<script>
import DayCard from './DayCard.vue'; // Importa DayCard

export default {
	name: 'TravelCard',
	components: {
		DayCard // Registra DayCard
	},
	props: {
		travel: {
			type: Object,
			required: true
		}
	},
	computed: {
		// Genera un array di giorni a partire dalla start_date
		travelDays() {
			if (!this.travel || !this.travel.start_date) return [];

			const startDate = new Date(this.travel.start_date);
			const endDate = new Date(this.travel.end_date || startDate);
			const daysArray = [];

			let currentDate = new Date(startDate);
			while (currentDate <= endDate) {
				daysArray.push({
					date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
					dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'long' }), // Giorno della settimana
					dayNumber: currentDate.getDate()
				});
				currentDate.setDate(currentDate.getDate() + 1);
			}
			return daysArray;
		}
	}
}
</script>

<template>
	<router-link :to="{ name: 'travel', params: { id: travel.id, slug: travel.slug } }" class="no_style">
		<div class="mb-2" id="my_travel_card">
			<div class="d-flex justify-content-between align-items-center">
				<h3>{{ travel.title }}</h3>
				<div>
					<!-- Mostra la prima data disponibile per il viaggio -->
					<DayCard v-if="travelDays.length" :day="travelDays[0]" :showYear="true" :showMonth="true" />
				</div>
			</div>
		</div>
	</router-link>
</template>

<style scoped>
.no_style {
	text-decoration: none;
	color: inherit;
}

#my_travel_card {
	background-color: var(--secondary-color);
	border-left: 10px solid var(--tertiary-color);
	padding: 10px;
}
</style>
