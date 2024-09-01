<template>
	<div class="map-container map">
		<div class="search-container">
			<!-- Contenuto della barra di ricerca -->
			<div v-if="showMenu" class="search-input-wrapper">
				<i class="fa-solid fa-magnifying-glass search-icon"></i>
				<input type="text" placeholder="Cerca tra le tue tappe..." v-model="searchQuery" @input="filterMarkers"
					class="search-input" />
			</div>
			<ul v-if="filteredMarkers.length" class="results-dropdown">
				<li v-for="result in filteredMarkers" :key="result.id" @click="selectMarker(result)">
					{{ result.title }}
					<hr>
				</li>
			</ul>
		</div>
		<div ref="mapContainer" class="map">
			<div v-if="showMenu" id="map_nav" class="rounded-pill">
				<div>
					<i class="fa-solid fa-location-dot" @click.stop="emitCloseMap"></i>
					<p>Tappe</p>

				</div>
				<div :class="{ 'text-secondary': !chosenPoint }" @click.stop="addChosenPointToSteps" :disabled="!chosenPoint">
					<i class="fa-solid fa-plus"></i>
					<p>Aggiungi</p>
				</div>
				<div :class="{ 'text-secondary': !chosenPoint }" @click.stop="navigateToChosenPoint" :disabled="!chosenPoint">
					<i class="fa-solid fa-signs-post"></i>
					<p>Indicazioni</p>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Fuse from 'fuse.js';
import position_icon from '../assets/position_icon.png';

export default {
	name: 'Map',
	props: {
		travelSteps: Array,
		currentLocation: Object,
		isFormMap: Boolean,
		showMenu: {
			type: Boolean,
			default: true
		},
	},
	data() {
		return {
			map: null,
			userLocationMarker: null,
			userLocationIcon: L.icon({
				iconUrl: position_icon,
				iconSize: [40, 40],
				iconAnchor: [12, 40],
				popupAnchor: [1, -34]
			}),
			centerLatLng: null,
			markers: [],
			searchQuery: '',
			showDropdown: false,
			chosenPoint: null,
			fuse: null,
			threshold: 0.3
		};
	},
	mounted() {
		this.getUserLocation();
		this.initializeMap().then(() => {
			this.showPOIs();
		});
	},
	methods: {
		/* inizializza mappa e user location */
		initializeMap() {
			return new Promise((resolve, reject) => {
				this.map = L.map(this.$refs.mapContainer, {
					zoomControl: false
				}).setView([51.505, -0.09], 13);

				L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
					maxZoom: 19
				}).addTo(this.map);

				let centerLatLng;

				if (this.travelSteps.length > 0) {
					const bounds = L.latLngBounds(this.travelSteps.map(step => [step.lat, step.lng]));
					this.map.fitBounds(bounds);
					centerLatLng = bounds.getCenter();
					this.centerLatLng = bounds.getCenter();
				} else if (this.currentLocation.lat && this.currentLocation.lng) {
					centerLatLng = [this.currentLocation.lat, this.currentLocation.lng];
					L.marker(centerLatLng).addTo(this.map)
						.bindPopup('La tua posizione')
						.openPopup();
				}

				if (centerLatLng) {
					this.map.setView(centerLatLng, 13);
				}

				this.travelSteps.forEach((step, index) => {
					const marker = L.marker([step.lat, step.lng]).addTo(this.map)
						.bindPopup(`<b>${step.title}</b><br>${step.tag}`);
					this.markers.push({ id: index, marker, title: step.title });
				});

				this.fuse = new Fuse(this.markers, {
					keys: ['title'],
					includeScore: true,
					threshold: this.threshold
				});

				// Assegna l'handler per aggiungere un marker temporaneo alla mappa
				this.map.on('click', async (e) => {
					const { lat, lng } = e.latlng;
					const tempMarker = L.marker([lat, lng]).addTo(this.map);
					const address = await this.getAddressFromLatLng(lat, lng);
					tempMarker.bindPopup(address).openPopup();

					// Aggiorna chosenPoint con lat, lng, e address
					this.chosenPoint = { lat, lng, address };
				});

				// Risolvi la Promise dopo aver completato l'inizializzazione
				resolve();
			});
		},
		async getUserLocation() {
			return new Promise((resolve, reject) => {
				if (navigator.geolocation) {
					navigator.geolocation.watchPosition(
						(position) => {
							this.currentLocation.lat = position.coords.latitude;
							this.currentLocation.lng = position.coords.longitude;
							this.updateMapLocation();
							resolve();
						},
						(error) => {
							console.error('Errore nell\'ottenere la posizione dell\'utente:', error);
							this.currentLocation.lat = 51.505; // Coordinate predefinite
							this.currentLocation.lng = -0.09;
							this.updateMapLocation();
							resolve();
						},
						{ enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
					);
				} else {
					console.error('Geolocalizzazione non supportata.');
					this.currentLocation.lat = 51.505; // Coordinate predefinite
					this.currentLocation.lng = -0.09;
					this.updateMapLocation();
					resolve();
				}
			});
		},
		updateMapLocation() {
			if (this.userLocationMarker) {
				this.userLocationMarker.setLatLng([this.currentLocation.lat, this.currentLocation.lng]);
			} else {
				this.userLocationMarker = L.marker([this.currentLocation.lat, this.currentLocation.lng], {
					icon: this.userLocationIcon
				}).addTo(this.map);
			}
			/* this.map.setView([this.currentLocation.lat, this.currentLocation.lng], 13); */
		},
		/* overpass API di OpenStreetMap */
		async getPOIs(lat, lng, radius = 4000) {
			const { lat: refLat, lng: refLng } = this.centerLatLng;

			// Costruisce la query per ottenere i POI
			const overpassUrl = `
        https://overpass-api.de/api/interpreter?data=[out:json];
        (
            node(around:${radius},${lat},${lng})[amenity~"restaurant|cafe|bar|pub|fast_food|library|cinema|theatre|place_of_worship"];
            node(around:${radius},${lat},${lng})[shop];
            node(around:${radius},${lat},${lng})[tourism];
            node(around:${radius},${lat},${lng})[leisure];
            node(around:${radius},${lat},${lng})[natural];
        );
        out center;
    `;

			try {
				const response = await fetch(overpassUrl);
				const data = await response.json();

				return data.elements.map(poi => ({
					lat: poi.lat,
					lng: poi.lon,
					name: poi.tags.name || 'Punto di interesse',
					type: poi.tags.amenity || poi.tags.shop || poi.tags.tourism || poi.tags.leisure || poi.tags.natural || 'Unknown'
				}));
			} catch (error) {
				console.error('Errore nel recupero dei POI:', error);
				return [];
			}
		},

		async showPOIs() {
			if (!this.centerLatLng) {
				console.error('centerLatLng non è definito');
				return;
			}

			const { lat, lng } = this.centerLatLng;
			const pois = await this.getPOIs(lat, lng);
			console.log("POIs ottenuti: ", pois);

			pois.forEach(poi => {

				if (poi.type === 'tree') {
					return; // Salta i marker di tipo "tree"
				}

				const iconMapping = {
					restaurant: 'fa-utensils', // Ristorante
					cafe: 'fa-coffee', // Caffè
					bar: 'fa-beer', // Bar
					pub: 'fa-glass-whiskey', // Pub
					fast_food: 'fa-hamburger', // Fast food
					library: 'fa-book', // Biblioteca
					cinema: 'fa-film', // Cinema
					theatre: 'fa-theater-masks', // Teatro
					place_of_worship: 'fa-church', // Luogo di culto
					shop: 'fa-shopping-bag', // Negozi
					clothes: 'fa-shopping-bag', //vestiti
					computer: 'fa-shopping-bag', //computer
					tourism: 'fa-landmark', // Turismo
					leisure: 'fa-futbol', // Tempo libero (puoi cambiare con icona specifica se necessario)
					natural: 'fa-tree', // Natura
					default: 'fa-map-marker-alt' // Icona di default
				};

				const iconClass = iconMapping[poi.type] || iconMapping['default'];

				const icon = L.divIcon({
					html: `<i class="fas ${iconClass}" style="color: #000000; font-size: 20px; width: 25px; height: 25px;"></i>`, // Personalizza il colore e la dimensione
					className: 'custom-div-icon',
					iconSize: [25, 25], // Dimensione dell'icona
					iconAnchor: [12, 25], // Punto in cui l'icona punta alla posizione sulla mappa
					popupAnchor: [0, -25] // Punto da dove si apre il popup
				});

				const marker = L.marker([poi.lat, poi.lng], { icon }).addTo(this.map);
				marker.bindPopup(`<b>${poi.name}</b><br>Tipo: ${poi.type}`);
			});
		},
		/* funzione di ricerca */
		updateSearch() {
			if (this.searchQuery.length >= 3) {
				this.showDropdown = true;
			} else {
				this.showDropdown = false;
			}
		},
		/* seleziona un punto sulla mappa e aggiungilo a chosen step */
		selectMarker(marker) {
			this.searchQuery = '';
			this.map.setView(marker.marker.getLatLng(), 13);
			marker.marker.openPopup();
			this.showDropdown = false;

			this.chosenPoint = {
				lat: marker.marker.getLatLng().lat,
				lng: marker.marker.getLatLng().lng,
				address: marker.title
			};
		},
		async getAddressFromLatLng(lat, lng) {
			const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&addressdetails=1`);
			const data = await response.json();
			return data.display_name || 'Luogo sconosciuto';
		},
		addChosenPointToSteps() {
			if (this.chosenPoint) {
				console.log("punto da inviare: ", this.chosenPoint);
				this.$emit('add-point', {
					lat: this.chosenPoint.lat,
					lng: this.chosenPoint.lng,
					title: this.chosenPoint.address || 'Nuova Tappa' // Use the address or a default title
				});
				this.chosenPoint = null;
			}
		},
		/* funzione di navigazione */
		async navigateToChosenPoint() {
			if (this.chosenPoint) {
				try {
					const { lat, lng } = this.chosenPoint;
					const userLatLng = [this.currentLocation.lat || 51.505, this.currentLocation.lng || -0.09];
					const routeUrl = `https://router.project-osrm.org/route/v1/driving/${userLatLng[1]},${userLatLng[0]};${lng},${lat}?overview=full&geometries=geojson`;

					const response = await fetch(routeUrl);
					if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`);

					const data = await response.json();
					console.log('Route data:', data); // Debugging

					if (data.routes && data.routes.length > 0) {
						const route = data.routes[0];
						if (route.geometry && route.geometry.coordinates) {
							const latLngs = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
							L.polyline(latLngs, { color: 'blue' }).addTo(this.map);
							this.map.fitBounds(L.latLngBounds(latLngs));
						} else {
							alert('Impossibile trovare un percorso.');
						}
					} else {
						alert('Impossibile trovare un percorso.');
					}
				} catch (error) {
					console.error('Errore durante la navigazione:', error);
					alert('Si è verificato un errore durante il calcolo del percorso.');
				}
			} else {
				alert('Nessun punto selezionato.');
			}
		},
		/* funzione di chiusura mappa */
		emitCloseMap() {
			this.$emit('close-map')
		}
	},
	computed: {
		filteredMarkers() {
			if (!this.searchQuery) return [];
			const results = this.fuse.search(this.searchQuery);
			return results.map(result => result.item);
		}
	}
};
</script>

<style scoped>
.map-container {
	height: 100%;
	position: relative;
}

.map {
	height: 100%;
	width: 100%;
}

/* search bar in alto */
.search-container {
	position: absolute;
	top: 20px;
	left: 50%;
	transform: translateX(-50%);
	z-index: 1000;

	display: flex;
	flex-direction: column;
}

.search-input-wrapper {
	display: flex;
	align-items: center;
	background-color: white;
	border-radius: 25px;
	padding: 3px 20px;
	box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
	width: 300px;
}

.search-icon {
	color: #888;
	margin-right: 10px;
}

.search-input {
	flex-grow: 1;
	border: none;
	outline: none;
	padding: 10px;
	border-radius: 25px;
	font-size: 16px;
}

.results-dropdown {
	display: block;

	list-style-type: none;
	margin: 0;
	padding: 0;
	max-height: 200px;

	overflow-y: auto;
	background-color: white;
	border-radius: 5px;
	margin-top: 5px;
	box-shadow: 0 3px 5px rgba(0, 0, 0, 0.15);
	min-height: 50px;
	padding: 1rem;
}

/* Barra di navigazione fissa in fondo allo schermo */
#map_nav {
	position: fixed;
	left: 50%;
	transform: translateX(-50%);
	bottom: 5%;
	width: 90%;
	height: 80px;
	background-color: #fff;
	z-index: 1000;
	display: flex;
	justify-content: space-around;
	align-items: center;
	text-align: center;
	padding: 0.3rem;
	color: var(--tertiary-color);
}

#map_nav i {
	font-size: 24px;
	margin-bottom: 4px;
}

#map_nav p {
	font-family: sans-serif;
	font-size: 14px;
	font-weight: 600;
	margin-bottom: 0;
}

input[type="text"] {
	border: none;
	outline: none;
}
</style>