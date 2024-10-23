export interface IMap {
  type: string;
  features: IFeatures[];
}

interface IFeatures {
  type: string;
  properties: IProperties;
  geometry: IGeometry;
}

interface IProperties {
  COLOR_HEX: string;
  ID: number;
}

interface IGeometry {
  type: string;
  crs?: ICRS;
  coordinates: number[][][][];
}

interface ICRS {
  type: string;
  properties: {
    name: string;
  };
}
