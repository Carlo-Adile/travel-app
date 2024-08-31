<script>
export default {
	name: 'AppFooter',
	data() {
		return {

		}
	}
}
</script>

<template>
	<div class="container-fluid" id="my_footer">
		<div class="icon_container">
			<router-link :to="{ name: 'Home' }"><i class="fa-solid fa-house"></i></router-link>

			<i class="fa-solid fa-user"></i>
			<i class="fa-solid fa-gear"></i>
		</div>
	</div>
</template>

<style scoped>
#my_footer {
	position: fixed;
	bottom: 0;
	padding: 0.7rem;
	/* background-color: var(--secondary-color); */
	background-color: #fff;
	border-top: 1px solid var(--secondary-color);
}

.icon_container {
	display: flex;
	justify-content: space-evenly;
	align-items: center;

	i {
		font-size: 1.5rem;
		color: var(--secondary-color);
	}
}
</style>