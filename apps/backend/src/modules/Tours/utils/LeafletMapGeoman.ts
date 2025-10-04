import L from "leaflet";
import "maplibre-gl";
import "@maplibre/maplibre-gl-leaflet";
import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import pick from "lodash/pick";
import isEmpty from "lodash/isEmpty";

export class LeafletMapGeoman {
  map: L.Map | undefined;
  bounds: [[number, number], [number, number]];
  setGeoJson: (geoJson: any) => void;

  constructor(
    refContainer: React.RefObject<HTMLDivElement>,
    setGeoJson: (geoJson: any) => void,
    topLat: number,
    topLng: number,
    bottomLat: number,
    bottomLng: number,
    centerLat: number,
    centerLng: number,
    zoom: number,
    style: string,
    lang:
      | "cz"
      | "da"
      | "de"
      | "el"
      | "en"
      | "es"
      | "fa"
      | "fr"
      | "hu"
      | "id"
      | "it"
      | "nl"
      | "no"
      | "pl"
      | "pt_br"
      | "ro"
      | "ru"
      | "sv"
      | "tr"
      | "ua"
      | "zh"
      | "zh_tw"
  ) {
    this.bounds = [
      [topLng, topLat],
      [bottomLng, bottomLat],
    ];

    this.setGeoJson = setGeoJson;

    if (refContainer?.current) {
      this.map = L.map(refContainer.current, {
        center: L.latLng(centerLat, centerLng),
        maxBounds: [
          [topLat, topLng],
          [bottomLat, bottomLng],
        ],
        zoom,
        minZoom: 11,
        maxZoom: 20,
      });

      // @ts-ignore
      L.maplibreGL({
        style,
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">Openstreet Map Contributors</a>',
      }).addTo(this.map);

      this.map.pm.setPathOptions({
        weight: 2,
        color: "black",
        fillColor: "green",
        fillOpacity: 0.4,
      });
      this.map.pm.setLang(lang);
      this.map.pm.addControls({
        drawControls: true,
        drawMarker: false,
        drawPolygon: false,
        drawCircle: false,
        drawRectangle: false,
        drawCircleMarker: false,
        drawPolyline: true,
        oneBlock: true,
      });

      this.map.createPane("tour");
      const pane = this.map.getPane("tour");
      if (pane) {
        pane.style.zIndex = "200";
        pane.style.pointerEvents = "none";
      }

      this.map.on("pm:create", (event) => {
        this.attachEvents(event.layer);
        this.generateGeoJson();
      });
      this.map.on("pm:remove", (event) => {
        this.generateGeoJson();
      });
    } else {
      throw Error("LeafLetMapGeopMan MapContainer Ref not set");
    }
  }

  attachEvents(layer: any) {
    layer.on("pm:edit", () => {
      this.generateGeoJson();
    });
    layer.on("pm:cut", (e: any) => {
      this.attachEvents(e.layer);
      this.generateGeoJson();
    });
  }

  generateGeoJson() {
    const layers = this.findLayers();

    const geo = {
      type: "FeatureCollection",
      features: [] as any[],
    };

    layers.forEach((layer) => {
      const geoJson = layer.toGeoJSON();
      if (!geoJson.properties) {
        geoJson.properties = {};
      }

      geoJson.properties.options = pick(layer.options, ["weight", "color"]);

      if (layer.options.radius) {
        const radius = parseFloat(layer.options.radius);
        if (radius % 1 !== 0) {
          geoJson.properties.options.radius = radius.toFixed(6);
        } else {
          geoJson.properties.options.radius = radius.toFixed(0);
        }
      }

      if (layer instanceof L.Rectangle) {
        geoJson.properties.type = "rectangle";
      } else if (layer instanceof L.Circle) {
        geoJson.properties.type = "circle";
      } else if (layer instanceof L.CircleMarker) {
        geoJson.properties.type = "circlemarker";
      } else if (layer instanceof L.Polygon) {
        geoJson.properties.type = "polygon";
      } else if (layer instanceof L.Polyline) {
        geoJson.properties.type = "polyline";
      } else if (layer instanceof L.Marker) {
        geoJson.properties.type = "marker";
      }

      geoJson.id = `id-${this.hashCode(JSON.stringify(geoJson))}`;
      geo.features.push(
        pick(geoJson, ["type", "properties", "geometry", "id"])
      );
    });

    this.setGeoJson(geo);
  }

  findLayers() {
    let layers: any[] = [];

    if (!this.map) return layers;
    
    this.map.eachLayer((layer) => {
      if (
        layer instanceof L.Polyline ||
        layer instanceof L.Marker ||
        layer instanceof L.Circle ||
        layer instanceof L.CircleMarker
      ) {
        layers.push(layer);
      }
    });

    // filter out layers that don't have the leaflet-geoman instance
    layers = layers.filter((layer) => !!layer.pm);

    // filter out everything that's leaflet-geoman specific temporary stuff
    layers = layers.filter((layer) => !layer._pmTempLayer);

    return layers;
  }

  hashCode(str: string) {
    let hash = 0,
      i,
      chr;
    if (str.length === 0) return hash;
    for (i = 0; i < str.length; i++) {
      chr = str.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  setTourStops(stops: any[]) {
    if (!this.map) return;

    if (!Array.isArray(stops)) return;

    this.map.eachLayer((layer: any) => {
      if (!layer.pm && layer instanceof L.Marker) {
        layer.remove();
      }
    });

    const points = stops.map((stop) => ({
      type: "Feature",
      properties: {
        number: stop.number,
        show_on_map: true,
      },
      geometry: {
        type: "Point",
        coordinates: [stop.lng, stop.lat],
      },
    }));

    L.geoJSON(points as any, {
      pointToLayer: function (feature, latlng) {
        const numberIcon = L.divIcon({
          className: "number-icon",
          iconSize: [20, 20],
          iconAnchor: [10, 10],
          html: feature.properties.number,
        });

        return new L.Marker(latlng, {
          icon: numberIcon,
          pmIgnore: true,
          pane: "tour",
        });
      },
    }).addTo(this.map);
  }

  loadGeoJson(features: any) {
    if (!this.map) return;

    this.findLayers().forEach((layer) => {
      layer.remove();
    });

    if (isEmpty(features)) return;

    try {
      const geoLayer = L.geoJSON(features, {
        style: (feature) => {
          return feature?.properties?.options;
        },
        pointToLayer: (feature, latlng) => {
          switch (feature.properties.type) {
            case "marker":
              return new L.Marker(latlng) as any;
            case "circle":
              return new L.Circle(latlng, feature.properties.options) as any;
            case "circlemarker":
              return new L.CircleMarker(
                latlng,
                feature.properties.options
              ) as any;
          }
          return null;
        },
      });

      geoLayer.getLayers().forEach((layer: any) => {
        if (!this.map) return;

        let latlng;
        if (layer._latlng) {
          latlng = layer.getLatLng();
        } else {
          latlng = layer.getLatLngs();
        }

        let newLayer;
        switch (layer.feature.properties.type) {
          case "rectangle":
            newLayer = new L.Rectangle(latlng, layer.options).addTo(this.map);
            break;
          case "circle":
            newLayer = new L.Circle(latlng, layer.options).addTo(this.map);
            break;
          case "polygon":
            newLayer = new L.Polygon(latlng, layer.options).addTo(this.map);
            break;
          case "polyline":
            newLayer = new L.Polyline(latlng, layer.options).addTo(this.map);
            break;
          case "marker":
            newLayer = new L.Marker(latlng, layer.options).addTo(this.map);
            break;
          case "circlemarker":
            newLayer = new L.CircleMarker(latlng, layer.options).addTo(
              this.map
            );
            break;
        }

        if (newLayer) this.attachEvents(newLayer);
      });
    } catch (err) {
      console.error(err);
    }

    this.generateGeoJson();
  }
}
