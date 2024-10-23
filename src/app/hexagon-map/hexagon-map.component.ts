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
  private hexagonRadius: number = 50000;
  private allowedBounds: [number, number, number, number] = [30.0, 12.0, 50.0, 30.0];

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

    // Генерация шестиугольной сетки на основе границ видимой карты
    const hexagons = turf.hexGrid(bbox, this.hexagonRadius, { units: 'meters' });

    // Ограничивающая область, в пределах которой будут добавляться шестиугольники
    const allowedArea = turf.bboxPolygon(this.allowedBounds); // Создание многоугольника из ограничивающего прямоугольника

    hexagons.features.forEach((hexagonFeature: any) => {
      // Проверяем пересекается ли шестиугольник с разрешённой областью
      if (turf.booleanIntersects(allowedArea, hexagonFeature)) {
        const hexCoords = hexagonFeature.geometry.coordinates[0].map((coord: number[]) => {
          return [coord[1], coord[0]]; // Leaflet требует [lat, lng]
        });

        const hexColor = this.getHexColorForFeature(hexagonFeature);

        const hexagon = L.polygon(hexCoords, {
          color: hexColor,
          fillColor: hexColor,
          fillOpacity: 0.4,
          weight: 1
        });

        this.displayedHexagons.push(hexagon);
        hexagon.addTo(this.map);
      }
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

  private clearHexagons(): void {
    this.displayedHexagons.forEach(hexagon => {
      this.map.removeLayer(hexagon);
    });
    this.displayedHexagons = [];
  }

  private updateHexagonRadiusBasedOnZoom(zoomLevel: number): void {
    switch(!!zoomLevel) {
      case zoomLevel < 7 : this.hexagonRadius = 50000;
      break;
      case zoomLevel >= 7 && zoomLevel <= 9 : this.hexagonRadius = 20000;
      break;
      case zoomLevel > 9 && zoomLevel <= 11: this.hexagonRadius = 5000;
      break;
      case zoomLevel > 11: this.hexagonRadius = 1000;
      break;
    }
  }

  public onMapMoveEnd(): void {
    this.updateHexagonRadiusBasedOnZoom(this.map.getZoom()); // Обновляем радиус шестиугольников
    this.clearHexagons(); // Удаляем существующие шестиугольники
    this.createHexagonGrid(); // Пересоздаём сетку
  }
}
