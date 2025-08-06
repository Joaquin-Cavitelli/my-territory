
export enum VisitStatus {
  Pending = 'Pendiente',
  NotAtHome = 'No en casa',
  Answered = 'Atendido',
}

export interface Visit {
  id: string;
  status: VisitStatus;
  date: string; // ISO string
}

export interface House {
  id: string;
  number: string;
  name?: string;
  phone?: string;
  observation?: string;
  visits: Visit[];
}

export interface Street {
  id: string;
  name: string;
  houses: House[];
}

export interface Territory {
  id: string;
  number: string;
  mapImage?: string; // base64 encoded image
  streets: Street[];
}

export interface DataContextType {
  territories: Territory[];
  loading: boolean;
  addTerritory: (number: string, mapImage?: string) => void;
  updateTerritory: (id: string, number: string, mapImage?: string) => void;
  deleteTerritory: (id: string) => void;
  getTerritory: (id: string) => Territory | undefined;
  addStreet: (territoryId: string, name: string) => void;
  updateStreet: (territoryId: string, streetId: string, name: string) => void;
  deleteStreet: (territoryId: string, streetId: string) => void;
  getStreet: (territoryId: string, streetId: string) => Street | undefined;
  addHouse: (territoryId: string, streetId: string, houseNumber: string, data: { status: VisitStatus, name?: string, phone?: string, observation?: string }) => void;
  addVisitToHouse: (territoryId: string, streetId: string, houseId: string, data: { status: VisitStatus, name?: string, phone?: string, observation?: string }) => void;
  deleteHouse: (territoryId: string, streetId: string, houseId: string) => void;
}
