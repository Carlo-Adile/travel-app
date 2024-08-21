<script>
export default {
	name: 'TravelCard',
	data() {
		return {

		}
	},
	props: {
		travel: {
			type: Object,
			required: true
		}
	}
}
</script>

<template>
	<router-link :to="{ name: 'travel', params: { slug: travel.slug } }" class="no_style">
		<div class="card p-2">
			<h4>{{ travel.title }}</h4>
			<p>data di inizio:
				{{ travel.start_date }}
			</p>
			<p>data di fine:
				{{ travel.end_date }}
			</p>
		</div>
	</router-link>
</template>

<style scoped>
.no_style {
	text-decoration: none;
	color: inherit;
}
</style>