export interface IUbs {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  geocode: {
    latitude: number;
    longitude: number;
  };
}
