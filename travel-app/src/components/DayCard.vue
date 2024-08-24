<script>
export default {
	name: 'DayCard',
	props: {
		day: {
			type: Object,
			required: true
		},
		showYear: {
			type: Boolean,
			default: false
		},
		showMonth: {
			type: Boolean,
			default: false
		}
	},
	computed: {
		// Dizionario dei mesi in italiano
		monthsInItalian() {
			return {
				'January': 'Gennaio',
				'February': 'Febbraio',
				'March': 'Marzo',
				'April': 'Aprile',
				'May': 'Maggio',
				'June': 'Giugno',
				'July': 'Luglio',
				'August': 'Agosto',
				'September': 'Settembre',
				'October': 'Ottobre',
				'November': 'Novembre',
				'December': 'Dicembre'
			};
		},
		// Funzione per abbreviare il giorno della settimana in italiano
		abbreviatedDayOfWeek() {
			const daysOfWeek = {
				'Sunday': 'Domenica',
				'Monday': 'Lunedì',
				'Tuesday': 'Martedì',
				'Wednesday': 'Mercoledì',
				'Thursday': 'Giovedì',
				'Friday': 'Venerdì',
				'Saturday': 'Sabato'
			};
			// Usa il giorno della settimana corrente per ottenere l'abbreviazione
			return daysOfWeek[this.day.dayOfWeek] || this.day.dayOfWeek;
		},
		// Funzione per formattare la data con l'anno se richiesto
		// Funzione per formattare la data con il mese letterale e l'anno in italiano se richiesto
		formattedDay() {
			const date = new Date(this.day.date);
			const dayNumber = date.getDate();
			const monthName = this.monthsInItalian[date.toLocaleDateString('en-US', { month: 'long' })];
			const year = date.getFullYear();

			let result = `${monthName}`;
			if (this.showYear) {
				result += ` ${year}`;
			}
			return result;
		}
	}
}
</script>

<template>
	<div class="day-card">
		<h6>{{ abbreviatedDayOfWeek }}</h6>
		<h3>{{ day.dayNumber }}</h3>
		<h6 v-if="showMonth || showYear">{{ formattedDay }}</h6>
	</div>
</template>

<style scoped>
.day-card {
	background-color: #f0f0f0;
	border-radius: 8px;
	padding: 5px;
	width: 85px;
	text-align: center;
	flex: 0 0 auto;
	box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);

	h3,
	h5,
	h6 {
		margin-bottom: 4px;
	}
}

.selected-day {
	background-color: var(--tertiary-color);
	color: white;
}
</style>
