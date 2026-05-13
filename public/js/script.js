const socket = io()

if(navigator.geolocation){
    navigator.geolocation.watchPosition((position) => {
      const{latitude, longitude} = position.coords;
      socket.emit("send-location",{latitude,longitude})
    },
    (error)=>{
        console.error(error);
    },
    {
        enableHighAccuracy: true,
        timeout:5000,
        maximumAge:0,
    }
)
}  

const map = L.map("map").setView([0,0], 10)
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",{
    attribution:"By Ajeet Yadav"
}).addTo(map)

const markers = {};
let hasCenteredOnUser = false;

function createMarkerIcon(isCurrentUser) {
    const markerClass = isCurrentUser ? "location-marker current-user" : "location-marker other-user";
    return L.divIcon({
        className: "marker-wrapper",
        html: `<div class="${markerClass}"><span class="marker-dot"></span></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
    });
}

socket.on("receive-location", (data)=>{
    const {id, latitude, longitude} = data;
    const isCurrentUser = id === socket.id;
    const popupText = isCurrentUser ? "You are here" : `User: ${id.slice(0, 5)}`;

    if (isCurrentUser && !hasCenteredOnUser) {
        map.setView([latitude, longitude], 15);
        hasCenteredOnUser = true;
    }

    if(markers[id]){
        markers[id].setLatLng([latitude,longitude])
        markers[id].getPopup().setContent(popupText)
    }else{
        markers[id] = L.marker([latitude,longitude], {
            icon: createMarkerIcon(isCurrentUser),
        }).addTo(map).bindPopup(popupText)
    }
})

socket.on("user-disconnected",(id)=>{
    if(markers[id]){
        map.removeLayer(markers[id]);
        delete markers[id];

    }
})
