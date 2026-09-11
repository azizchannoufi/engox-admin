import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  CircleMarker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Driver, Order } from "@/types/domain";
import { DEPOT } from "@/constants/theme";

function driverIcon(online: boolean, heading: number) {
  const color = online ? "#01D4A6" : "#999999";
  return L.divIcon({
    className: "driver-marker",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    html: `<div style="
      width:28px;height:28px;display:flex;align-items:center;justify-content:center;
      transform:rotate(${heading}deg);
    ">
      <div style="
        width:0;height:0;border-left:7px solid transparent;border-right:7px solid transparent;
        border-bottom:16px solid ${color};filter:drop-shadow(0 1px 1px rgba(0,0,0,.35));
      "></div>
    </div>`,
  });
}

function MapFocus({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  const [lat, lng] = center;
  useEffect(() => {
    map.setView([lat, lng], zoom);
  }, [lat, lng, map, zoom]);
  return null;
}

interface OpsMapProps {
  drivers?: Driver[];
  orders?: Order[];
  trail?: [number, number][];
  focus?: [number, number];
  zoom?: number;
  onSelectDriver?: (id: string) => void;
}

export function OpsMap({
  drivers = [],
  orders = [],
  trail,
  focus,
  zoom = 12,
  onSelectDriver,
}: OpsMapProps) {
  const lat = focus?.[0] ?? DEPOT.lat;
  const lng = focus?.[1] ?? DEPOT.lng;
  const center = useMemo<[number, number]>(() => [lat, lng], [lat, lng]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom
      className="h-full w-full rounded-[inherit]"
    >
      <MapFocus center={center} zoom={zoom} />
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <CircleMarker
        center={[DEPOT.lat, DEPOT.lng]}
        radius={8}
        pathOptions={{ color: "#C9A227", fillColor: "#C9A227", fillOpacity: 1 }}
      >
        <Popup>Deposito Hub Queens</Popup>
      </CircleMarker>
      {orders.map((order) => (
        <CircleMarker
          key={order.id}
          center={[order.lat, order.lng]}
          radius={5}
          pathOptions={{
            color: order.status === "FAILED" ? "#E53935" : "#69B76B",
            fillColor: "#fff",
            fillOpacity: 1,
            weight: 2,
          }}
        >
          <Popup>
            {order.recipientName}
            <br />
            {order.address}
          </Popup>
        </CircleMarker>
      ))}
      {trail && trail.length > 1 ? (
        <Polyline positions={trail} pathOptions={{ color: "#01D4A6", weight: 3 }} />
      ) : null}
      {drivers.map((driver) => (
        <Marker
          key={driver.id}
          position={[driver.lat, driver.lng]}
          icon={driverIcon(driver.isOnline, driver.headingDeg)}
          eventHandlers={{
            click: () => onSelectDriver?.(driver.id),
          }}
        >
          <Popup>
            <strong>
              {driver.firstName} {driver.lastName}
            </strong>
            <br />
            {driver.licensePlate} · {Math.round(driver.speedKmh)} km/h
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
