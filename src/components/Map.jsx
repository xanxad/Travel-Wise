//import { useNavigate } from "react-router-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  useMapEvents,
} from "react-leaflet";
import styles from "./Map.module.css";
//import { useState } from "react";
import { useCities } from "../contexts/CitiesContext";
import { useEffect, useState } from "react";
import { useGeolocation } from "../hooks/useGeoLocation";
import Button from "./Button";

function Map() {
  const [searchParams] = useSearchParams();
  const { cities } = useCities();
  const [mapPosition, setMapPosition] = useState([40, 0]);
  const {
    isLoading: isLoadingPosition,
    position: geoLocationPosition,
    getPosition,
  } = useGeolocation();

  const mapLat = searchParams.get("lat") || 40;
  const mapLng = searchParams.get("lng") || 0;

  useEffect(
    function () {
      if (mapLat && mapLng) setMapPosition([mapLat, mapLng]);
    },
    [mapLat, mapLng]
  );

  useEffect(
    function () {
      if (geoLocationPosition)
        return setMapPosition([
          geoLocationPosition.lat,
          geoLocationPosition.lng,
        ]);
    },
    [geoLocationPosition]
  );
  return (
    <div className={styles.mapContainer}>
      {!geoLocationPosition && (
        <Button type="position" onClick={getPosition}>
          {isLoadingPosition ? "Loading..." : "Use your position"}
        </Button>
      )}
      <MapContainer
        center={mapPosition}
        zoom={6}
        scrollWheelZoom={true}
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
        />

        {cities.map((city) => (
          <Marker
            position={[city.position.lat, city.position.lng]}
            key={city.id}
          >
            <Popup>
              <span>{city.emoji}</span> <span>{city.cityName}</span>
            </Popup>
          </Marker>
        ))}
        <ChangePosition position={mapPosition} />
        <DetectEvents />
      </MapContainer>
    </div>
  );
}

function ChangePosition({ position }) {
  const map = useMap();

  map.setView(position);
  return null;
}

function DetectEvents() {
  const Navigate = useNavigate();
  useMapEvents({
    click: (e) => {
      Navigate(`form?lat=${e.latlng.lat}&lng=${e.latlng.lng}`);
    },
  });
}

export default Map;
