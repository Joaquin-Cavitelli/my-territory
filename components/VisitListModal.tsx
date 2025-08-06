
import React from 'react';
import { Territory, VisitStatus } from '../types';
import Modal from './Modal';

interface VisitListModalProps {
  isOpen: boolean;
  onClose: () => void;
  territory: Territory;
  statusToShow: VisitStatus;
}

const VisitListModal: React.FC<VisitListModalProps> = ({ isOpen, onClose, territory, statusToShow }) => {
  const visits = territory.streets
    .flatMap(street => 
      street.houses.flatMap(house => 
        house.visits
          .filter(visit => visit.status === statusToShow)
          .map(visit => ({ ...visit, streetName: street.name, houseNumber: house.number, name: house.name, observation: house.observation }))
      )
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Lista de "${statusToShow}"`}>
      <div className="max-h-[60vh] overflow-y-auto pr-2">
        {visits.length > 0 ? (
          <ul className="space-y-3">
            {visits.map(visit => (
              <li key={visit.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                <p className="font-semibold">{visit.streetName} {visit.houseNumber}</p>
                {visit.status === VisitStatus.Answered && visit.name && <p className="text-sm text-slate-600">Nombre: {visit.name}</p>}
                <p className="text-xs text-slate-500 mt-1">{new Date(visit.date).toLocaleString()}</p>
                {visit.observation && <p className="text-sm mt-2 italic text-slate-700">"{visit.observation}"</p>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-slate-500 py-8">No hay registros con este estado.</p>
        )}
      </div>
    </Modal>
  );
};

export default VisitListModal;
