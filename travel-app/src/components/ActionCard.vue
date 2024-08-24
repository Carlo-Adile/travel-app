<script>
export default {
	name: 'ActionCard',
	props: {
		title: {
			type: String,
			required: true
		},
		count: {
			type: [Number, String],
			required: true
		},
		buttonText: {
			type: String,
			required: true
		},
		imgSrc: {
			type: String,
			required: true
		}
	},
	methods: {
		handleButtonClick() {
			this.$emit('button-click');
		}
	}
}
</script>

<template>
	<div class="col-12 py-3">
		<div class="card border-0 p-4" id="my_action_card">
			<div class="d-flex justify-content-between align-items-center">
				<div class="content">
					<h4 class="mb-2 p-2 text-white fw-medium">{{ title }} <br> {{ count }}</h4>
					<button class="btn btn-sm btn-primary fw-medium rounded-pill border-0" @click="handleButtonClick">
						{{ buttonText }}
					</button>
				</div>
				<div class="image-container w-50">
					<img :src="imgSrc" alt="Card Image" class="img-fluid">
				</div>
			</div>
		</div>
	</div>
</template>

<style scoped>
#my_action_card {
	background-color: var(--primary-color);
}
</style>
