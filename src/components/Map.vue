<template>
	<div>
		<div id="map" style="height: 100vh; width: 100%;"></div>
	</div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

export default {
	props: {
		travelSteps: {
			type: Array,
			default: () => []
		},
		currentLocation: {
			type: Object,
			default: () => ({ lat: null, lng: null })
		},
		showRouting: { // Aggiungi questa proprietà
			type: Boolean,
			default: false
		}
	},
	mounted() {
		this.initializeMap();
	},
	methods: {
		initializeMap() {
			// Imposta i valori predefiniti
			const defaultLat = 51.505;
			const defaultLng = -0.09;

			// Usa le coordinate dell'utente se disponibili
			let lat = this.currentLocation.lat || defaultLat;
			let lng = this.currentLocation.lng || defaultLng;

			console.log("Map center set to:", { lat, lng });

			// Crea la mappa
			const map = L.map('map').setView([lat, lng], 13);

			// Aggiungi il layer delle tile
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19
			}).addTo(map);

			// Trasformare lat e lng in numeri
			const waypoints = this.travelSteps
				.map(step => {
					const parsedLat = parseFloat(step.lat);
					const parsedLng = parseFloat(step.lng);
					console.log("Parsed waypoint:", { lat: parsedLat, lng: parsedLng });
					return [parsedLat, parsedLng];
				})
				.filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

			console.log("Filtered waypoints:", waypoints);

			// Aggiungi i marker
			waypoints.forEach(([lat, lng], index) => {
				console.log("Adding marker for:", { lat, lng });
				L.marker([lat, lng]).addTo(map)
					.bindPopup(this.travelSteps[index].title);
			});

			// Se ci sono più punti, aggiungi il routing
			if (waypoints.length > 1 && this.showRouting) {
				L.Routing.control({
					waypoints: waypoints.map(([lat, lng]) => L.latLng(lat, lng)),
					routeWhileDragging: true
				}).addTo(map);
			}

			// Adatta la vista della mappa per includere tutti i marker
			if (waypoints.length > 0) {
				const bounds = L.latLngBounds(waypoints);
				console.log("Fitting map to bounds:", bounds);
				map.fitBounds(bounds);
			} else {
				console.log("No waypoints available, setting default view.");
				map.setView([lat, lng], 13); // Reimposta la vista se non ci sono punti
			}
		}
	}
}
</script>

<style scoped>
#map {
	height: 100vh;
	width: 100%;
}
</style>
