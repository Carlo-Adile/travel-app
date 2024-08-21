<script>
import axios from 'axios';
import { state, getters, login, logout, updateProfile, getTravel } from '../state.js';

export default {
	name: 'SingleTravel',
	data() {
		return {
			loading: true,
			travel: null,
			steps: null
		}
	},
	mounted() {
		let url = state.base_api_url + '/travels' + `/${this.$route.params.slug}`;
		this.getSingleProject(url);
	},
	methods: {
		getSingleProject(url) {
			console.log("url composto per il singolo viaggio: ", url);
			const config = {
				headers: {
					Authorization: `Bearer ${getters.getToken()}`
				}
			};

			axios
				.get(url, config)
				.then(response => {
					if (response.data.success) {
						this.travel = response.data.response;
						this.steps = response.data.response.steps;
						console.log("progetto caricato: ", this.travel);
					} else {
						this.$router.push({ name: 'not-found' })
					}
				}).catch(err => {
					console.log(err);
				})
		}
	}
}
</script>

<template>
	<div class="container p-2" v-if="travel">
		<div class="row">
			<div class="col-12">
				<p>
					{{ travel.title }}
				</p>
				<h5>Tappe organizzate</h5>

				<ul v-if="steps" v-for="(step, index) in steps">
					<li>{{ step.title }}</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped></style>