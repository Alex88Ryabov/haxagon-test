import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import * as data from '../../assets/data.json';
import {IMap} from "../map.interface";

@Component({
  selector: 'app-hexagon-map',
  templateUrl: './hexagon-map.component.html'
})
export class HexagonMapComponent implements OnInit {
  private map!: L.Map;
  public options: any;
  private displayedHexagons: L.Polygon[] = [];
  private hexagons: IMap = data;
  private hexagonRadius: number = 10000;

  public ngOnInit(): void {
    this.options = {
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        })
      ],
      zoom: 6,
      center: L.latLng([22.0, 38.0]) // red sea coordinates;
    };
  }

  public onMapReady(map: L.Map): void {
    this.map = map;
    this.createHexagonGrid();
  }

  private createHexagonGrid(): void {
    const bounds = this.map.getBounds();
    const bbox: [number, number, number, number] = [
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth()
    ];

    const hexagons = turf.hexGrid(bbox, this.hexagonRadius, { units: 'meters' });

    hexagons.features.forEach((hexagonFeature: any) => {
      const hexCoords = hexagonFeature.geometry.coordinates[0].map((coord: number[]) => {
        return [coord[1], coord[0]];
      });

      const hexColor = this.getHexColorForFeature(hexagonFeature);

      const hexagon = L.polygon(hexCoords, {
        color: hexColor,
        fillColor: hexColor,
        fillOpacity: 0.4,
      });

      this.displayedHexagons.push(hexagon);
      hexagon.addTo(this.map);
    });
  }

  private getHexColorForFeature(hexagonFeature: any): string {
    const featureId = hexagonFeature.id;
    const featureData = this.hexagons.features.find((f: any) => f.id === featureId);

    if (featureData && featureData.properties && featureData.properties.COLOR_HEX) {
      return `#${featureData.properties.COLOR_HEX}`;
    }

    return '#FFFFFF';
  }

  public onMapZoom(): void {
    const zoomLevel = this.map.getZoom();
    this.displayedHexagons.forEach(hexagon => {
      const scale = this.calculateScale(zoomLevel);
      hexagon.setStyle({
        weight: scale
      });
    });
  }

  public onMapMoveEnd(): void {
    const bounds = this.map.getBounds();
    this.displayedHexagons.forEach(hexagon => {
      if (bounds.contains(hexagon.getBounds())) {
        if (!this.map.hasLayer(hexagon)) {
          hexagon.addTo(this.map);
        }
      } else {
        if (this.map.hasLayer(hexagon)) {
          this.map.removeLayer(hexagon);
        }
      }
    });
  }

  private calculateScale(zoomLevel: number): number {
    return Math.max(1, 10 - zoomLevel);
  }
}
