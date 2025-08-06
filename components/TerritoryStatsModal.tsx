import React, { useMemo } from 'react';
import Modal from './Modal';
import { Territory, VisitStatus } from '../types';
import { ICONS } from '../constants';

interface TerritoryStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  territory: Territory;
}

const TerritoryStatsModal: React.FC<TerritoryStatsModalProps> = ({ isOpen, onClose, territory }) => {
  const stats = useMemo(() => {
    if (!territory) return null;

    const streets = territory.streets || [];
    const houses = streets.flatMap(s => s.houses || []);
    const visits = houses.flatMap(h => h.visits || []);

    const lastVisitStatusCount = {
      [VisitStatus.Answered]: 0,
      [VisitStatus.NotAtHome]: 0,
      [VisitStatus.Pending]: 0,
    };

    houses.forEach(house => {
      if (house.visits && house.visits.length > 0) {
        // Assuming the last visit in the array is the most recent one.
        const lastVisit = house.visits[house.visits.length - 1];
        if (lastVisitStatusCount.hasOwnProperty(lastVisit.status)) {
          lastVisitStatusCount[lastVisit.status]++;
        }
      }
    });

    const totalHouses = houses.length;
    const answeredHouses = lastVisitStatusCount[VisitStatus.Answered];
    const completionPercentage = totalHouses > 0 ? (answeredHouses / totalHouses) * 100 : 0;

    return {
      totalStreets: streets.length,
      totalHouses,
      totalVisits: visits.length,
      lastVisitStatusCount,
      completionPercentage,
      answeredHouses,
    };
  }, [territory]);

  if (!isOpen || !stats) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Territorio ${territory.number}`}>
      <div className="space-y-6 text-slate-700">
        
        <div className="grid grid-cols-3 gap-4 text-center border-b pb-6">
          <div>
            <p className="text-3xl font-semibold text-slate-600">{stats.totalStreets}</p>
            <p className="text-sm font-medium text-slate-500">Calles</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-600">{stats.totalHouses}</p>
            <p className="text-sm font-medium text-slate-500">Casas</p>
          </div>
          <div>
            <p className="text-3xl font-semibold text-slate-600">{stats.totalVisits}</p>
            <p className="text-sm font-medium text-slate-500">Visitas</p>
          </div>
        </div>

        {stats.totalHouses > 0 && (
          <div>
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
              <div className="bg-green-700 h-4 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ width: `${stats.completionPercentage}%` }}>
                
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-1 text-center">{stats.answeredHouses} de {stats.totalHouses} casas atendidas.</p>
          </div>
        )}

        <div>
          
          <div className="grid grid-cols-3 gap-4 text-center border-b pb-6">
          <div>
            <p className="text-xl flex items-center justify-center gap-3 font-semibold text-green-700">{stats.lastVisitStatusCount[VisitStatus.Answered]}{React.cloneElement(ICONS.answered, { className: "h-5 w-5" })}</p>
            <p className="text-xs font-medium text-green-700">Atendido</p>
          </div>
          <div>
            <p className="text-xl flex items-center justify-center gap-3 font-semibold text-red-700">{stats.lastVisitStatusCount[VisitStatus.NotAtHome]}{React.cloneElement(ICONS.notHome, { className: "h-5 w-5" })}</p>
            <p className="text-xs font-medium text-red-700">No en casa</p>
          </div>
          <div>
            <p className="text-xl flex items-center justify-center gap-3 font-semibold text-indigo-700">{stats.lastVisitStatusCount[VisitStatus.Pending]}{React.cloneElement(ICONS.home, { className: "h-5 w-5" })}</p>
            <p className="text-xs font-medium text-indigo-700">Pendiente</p>
          </div>
        </div>
          {/* <ul className="space-y-2">
            <li className="flex justify-between items-center p-3 border border-green-300 rounded-lg">
              <span className="flex items-center gap-3 font-medium text-salte-700">
                {React.cloneElement(ICONS.answered, { className: "h-5 w-5" })}
                Atendido
              </span>
              <span className="font-bold text-lg text-green-800">{stats.lastVisitStatusCount[VisitStatus.Answered]}</span>
            </li>
            <li className="flex justify-between items-center p-3 border-red-50 rounded-lg">
              <span className="flex items-center gap-3 font-medium text-red-800">
                {React.cloneElement(ICONS.notHome, { className: "h-5 w-5" })}
                No en casa
              </span>
              <span className="font-bold text-lg text-red-800">{stats.lastVisitStatusCount[VisitStatus.NotAtHome]}</span>
            </li>
            <li className="flex justify-between items-center p-3 border-slate-100 rounded-lg">
              <span className="flex items-center gap-3 font-medium text-slate-800">
                {React.cloneElement(ICONS.home, { className: "h-5 w-5" })}
                Pendiente
              </span>
              <span className="font-bold text-lg text-slate-800">{stats.lastVisitStatusCount[VisitStatus.Pending]}</span>
            </li>
          </ul> */}
        </div>
        
        <div className="flex justify-end pt-2">
            <button onClick={onClose} className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">Cerrar</button>
        </div>

      </div>
    </Modal>
  );
};

export default TerritoryStatsModal;