import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  ZoomControl,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import ReactDOMServer from "react-dom/server";
import {
  FaShip,
  FaWater,
  FaDirections,
  FaLocationArrow,
  FaTimes,
} from "react-icons/fa";

const BASE_URL = import.meta.env.VITE_API_BASE ?? "http://localhost:8000/api";
const token = localStorage.getItem("access_token");

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    skip_zrok_interstitial: "true",
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

const createIcon = (icon, bgColor) =>
  L.divIcon({
    html: ReactDOMServer.renderToString(
      <div
        className="rounded-full w-7 h-7 flex items-center justify-center shadow-md"
        style={{ backgroundColor: bgColor }}
      >
        {icon}
      </div>
    ),
    className: "custom-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 28],
  });

const FitBounds = ({ bounds }) => {
  const map = useMap();
  useEffect(() => {
    if (bounds.length > 0) {
      const b = L.latLngBounds(bounds);
      map.fitBounds(b, { padding: [60, 60] });

      setTimeout(() => {
        const currentZoom = map.getZoom();
        if (currentZoom < map.getMaxZoom()) {
          map.setZoom(currentZoom + 1);
        }
      }, 300);
    }
  }, [bounds, map]);
  return null;
};

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

const Map = () => {
  const [boatData, setBoatData] = useState([]);
  const [ghatData, setGhatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [selectedPlace, setSelectedPlace] = useState(null);
  const popupRef = useRef(null);
  const mapRef = useRef();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get("/all-boat-ghat");
        setBoatData(response.data.data.boats || []);
        setGhatData(response.data.data.ghats || []);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGetDirections = (targetLat, targetLng, name) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

          const distance = calculateDistance(
            latitude,
            longitude,
            targetLat,
            targetLng
          );

          setRouteInfo({
            from: `Your Location (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`,
            to: `${name} (${targetLat.toFixed(4)}, ${targetLng.toFixed(4)})`,
            distance: `${distance} km`,
          });

          if (mapRef.current) {
            if (popupRef.current) {
              popupRef.current.close();
              popupRef.current = null;
            }

            const bounds = L.latLngBounds(
              [latitude, longitude],
              [targetLat, targetLng]
            );
            mapRef.current.fitBounds(bounds, { padding: [100, 100] });
          }
        },
        (error) => {
          alert(`Error getting your location: ${error.message}`);
        },
        { enableHighAccuracy: true }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleMarkerClick = (place, type) => {
    setSelectedPlace({ ...place, type });
    setRouteInfo(null); // Reset route info when selecting a new place
  };

  const closeSidePanel = () => {
    setSelectedPlace(null);
    setRouteInfo(null);
  };

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading map data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <div className="text-xl font-semibold text-red-600">Error: {error}</div>
      </div>
    );
  }

  const bounds = [];
  const ghatOffsetTracker = {};
  const boatOffsetTracker = {};

  return (
    <div className="w-full h-screen bg-gray-100 relative mt-5">
      <header className="text-center text-2xl sm:text-3xl font-semibold py-4 bg-white text-blue-800 shadow">
        🚤 Boat & 🛶 Ghaat Locator
      </header>

      <main className="h-[calc(100vh-4rem)] p-2">
        <div className="w-full h-full border border-gray-200 rounded-2xl shadow-lg overflow-hidden">
          <MapContainer
            scrollWheelZoom
            zoomControl={false}
            className="h-full w-full z-0"
            zoom={13}
            minZoom={6}
            maxZoom={22}
            whenCreated={(map) => (mapRef.current = map)}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attributionControl={false}
              maxZoom={22}
            />
            <ZoomControl position="topright" />
            <FitBounds bounds={bounds} />

            {ghatData.map((ghat) => {
              const lat = parseFloat(ghat.latitude);
              const lng = parseFloat(ghat.longitude);
              const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;

              ghatOffsetTracker[key] = (ghatOffsetTracker[key] || 0) + 1;
              const index = ghatOffsetTracker[key];
              const angle = (index * 45 * Math.PI) / 180;
              const radius = 0.00012 * index;

              const offsetLat = lat + radius * Math.cos(angle);
              const offsetLng = lng + radius * Math.sin(angle);

              bounds.push([offsetLat, offsetLng]);

              return (
                <Marker
                  key={`ghat-${ghat.id}`}
                  position={[offsetLat, offsetLng]}
                  icon={createIcon(<FaWater color="white" size={14} />, "#059669")}
                  eventHandlers={{
                    click: () => handleMarkerClick(ghat, "ghat"),
                  }}
                >
                 
                </Marker>
              );
            })}

            {boatData.map((boat) => {
              const lat = parseFloat(boat.boat_latitude);
              const lng = parseFloat(boat.boat_longitude);
              const key = `${lat.toFixed(6)},${lng.toFixed(6)}`;

              boatOffsetTracker[key] = (boatOffsetTracker[key] || 0) + 1;
              const index = boatOffsetTracker[key];
              const angle = (index * 45 * Math.PI) / 180;
              const radius = 0.00012 * index;

              const offsetLat = lat + radius * Math.cos(angle);
              const offsetLng = lng + radius * Math.sin(angle);

              bounds.push([offsetLat, offsetLng]);

              return (
                <Marker
                  key={`boat-${boat.id}`}
                  position={[offsetLat, offsetLng]}
                  icon={createIcon(<FaShip color="white" size={14} />, "#1d4ed8")}
                  eventHandlers={{
                    click: () => handleMarkerClick(boat, "boat"),
                  }}
                >
                
                </Marker>
              );
            })}

            {userLocation && (
              <Marker
                position={[userLocation.lat, userLocation.lng]}
                icon={createIcon(<FaLocationArrow color="white" size={12} />, "#ef4444")}
              >
                <Popup>Your Current Location</Popup>
              </Marker>
            )}
          </MapContainer>
        </div>
      </main>

      {selectedPlace && (
        <div className="absolute top-20 right-4 w-80 bg-white rounded-lg shadow-xl z-[1000] overflow-hidden">
          <div className="relative">
            <button
              onClick={closeSidePanel}
              className="absolute top-2 right-2 z-10 bg-white rounded-full p-1 shadow-md hover:bg-gray-100"
            >
              <FaTimes className="text-gray-600" />
            </button>

            <div className="h-40 bg-blue-100 flex items-center justify-center">
              {selectedPlace.type === "boat" ? (
                <FaShip className="text-5xl text-blue-600" />
              ) : (
                <FaWater className="text-5xl text-green-600" />
              )}
            </div>

            <div className="p-4">
              <h2 className="text-xl font-bold mb-1">
                {selectedPlace.type === "boat"
                  ? `🚤 ${selectedPlace.registration_no}`
                  : `🛶 ${selectedPlace.ghaat_name}`}
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                📍{" "}
                {selectedPlace.type === "boat"
                  ? selectedPlace.boat_location
                  : selectedPlace.location}
              </p>

              <button
                onClick={() =>
                  handleGetDirections(
                    parseFloat(
                      selectedPlace.type === "boat"
                        ? selectedPlace.boat_latitude
                        : selectedPlace.latitude
                    ),
                    parseFloat(
                      selectedPlace.type === "boat"
                        ? selectedPlace.boat_longitude
                        : selectedPlace.longitude
                    ),
                    selectedPlace.type === "boat"
                      ? selectedPlace.registration_no
                      : selectedPlace.ghaat_name
                  )
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2 mb-4"
              >
                <FaDirections /> Directions
              </button>

              {routeInfo && selectedPlace && (
                <div className="bg-blue-50 p-3 rounded-lg mb-4">
                  <h3 className="font-semibold text-blue-800 flex items-center gap-2 text-sm">
                    <FaDirections size={14} /> Route Information
                  </h3>
                  <div className="grid grid-cols-1 gap-1 mt-1 text-xs">
                    <div>
                      <span className="font-medium">From:</span> {routeInfo.from}
                    </div>
                    <div>
                      <span className="font-medium">To:</span> {routeInfo.to}
                    </div>
                    <div>
                      <span className="font-medium">Distance:</span> {routeInfo.distance}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-2">Details</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {selectedPlace.type === "boat" ? (
                    <>
                      <div>
                        <span className="font-medium">Unique ID:</span> {selectedPlace.boat_uid}
                      </div>
                      <div>
                        <span className="font-medium">Pilot:</span> {selectedPlace.pilot_name}
                      </div>
                      <div>
                        <span className="font-medium">Contact:</span> {selectedPlace.pilot_contact}
                      </div>
                      <div>
                        <span className="font-medium">Owner:</span> {selectedPlace.owner?.name}
                      </div>
                      <div>
                        <span className="font-medium">Phone:</span> {selectedPlace.owner?.number}
                      </div>
                      <div>
                        <span className="font-medium">Latitude:</span> {selectedPlace.boat_latitude}
                      </div>
                      <div>
                        <span className="font-medium">Longitude:</span> {selectedPlace.boat_longitude}
                      </div>
                      <div>
                        <span className="font-medium">Pincode:</span> {selectedPlace.boat_pincode}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>
                        <span className="font-medium">Unique ID:</span> {selectedPlace.ghat_uid}
                      </div>
                      <div>
                        <span className="font-medium">Latitude:</span> {selectedPlace.latitude}
                      </div>
                      <div>
                        <span className="font-medium">Longitude:</span> {selectedPlace.longitude}
                      </div>
                      <div>
                        <span className="font-medium">Pincode:</span> {selectedPlace.pincode}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-popup {
          margin-left: 30px !important;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 8px;
          box-shadow: 0 3px 10px rgba(0,0,0,0.2);
        }
        .custom-popup .leaflet-popup-tip {
          display: none;
        }
        .leaflet-popup-content {
          margin: 12px !important
        }
      `}</style>
    </div>
  );
};

export default Map;