import {Component, OnInit} from '@angular/core';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import * as data from '../../assets/ data.json'

@Component({
  selector: 'app-hexagon-map',
  templateUrl: './hexagon-map.component.html',
  styleUrls: ['./hexagon-map.component.scss']
})
export class HexagonMapComponent implements OnInit {
  map!: L.Map;
  options: any;
  hexagons: any = {};
  displayedHexagons: L.Polygon[] = [];

  public ngOnInit(): void {
    this.options = {
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© OpenStreetMap contributors'
        })
      ],
      zoom: 13,
      center: L.latLng([51.505, -0.09]) // Координаты центра карты
    };
    this.hexagons = data;
    console.log(this.hexagons.features);
  }
  public onMapReady(map: L.Map): void {
    this.map = map;
    this.showHexagons();
  }

  private showHexagons(): void {
    this.hexagons.features.forEach((feature: any) => {
      // Проверяем, что есть координаты
      if (feature.geometry.coordinates.length > 0) {
        feature.geometry.coordinates.forEach((polygon: any) => {
          const hexCoords = polygon[0].map((coord: any) => {
            // Конвертируем координаты из EPSG:3857 в EPSG:4326
            const point = turf.toWgs84([coord[0], coord[1]]);
            return [point[1], point[0]]; // Leaflet требует [lat, lng]
          });

          // Убедимся, что цвет правильно взят из feature.properties.COLOR_HEX
          const hexColor = `#${feature.properties.COLOR_HEX}`;

          // Создаем и отображаем гексагоны
          const hexagon = L.polygon(hexCoords, {
            color: hexColor,
            fillColor: hexColor,
            fillOpacity: 0.5
          });

          // Добавляем шестиугольник в массив для последующего управления
          this.displayedHexagons.push(hexagon);
          hexagon.addTo(this.map);
        });
      } else {
        console.warn('Нет координат для feature:', feature);
      }
    });
  }

  public onMapZoom(event: any): void {
    // Логика изменения размера гексагонов в зависимости от уровня зума
    const zoomLevel = this.map.getZoom();
    this.displayedHexagons.forEach(hexagon => {
      const scale = this.calculateScale(zoomLevel);
      hexagon.setStyle({
        weight: scale
      });
    });
  }

  public onMapMoveEnd(event: any): void {
    // Логика фильтрации гексагонов для отображения только в видимой области
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
    // Определите, как изменять размер шестиугольников в зависимости от уровня масштабирования
    // Например, уменьшаем вес линий при увеличении масштаба
    return Math.max(1, 10 - zoomLevel); // Примерный расчет, измените по необходимости
  }
}
