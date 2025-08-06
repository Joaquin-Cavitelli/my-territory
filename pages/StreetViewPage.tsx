import React, { useState, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { House, Visit, VisitStatus } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import { ICONS } from '../constants';

const AddHouseVisitModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { houseNumber: string, visitData: { status: VisitStatus, name?: string, phone?: string, observation?: string } }) => void;
  house?: House | null;
}> = ({ isOpen, onClose, onSave, house }) => {
  
  const isNewHouse = !house;
  const [number, setNumber] = useState('');
  const [status, setStatus] = useState<VisitStatus>(VisitStatus.Pending);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [observation, setObservation] = useState('');
  const numberInputRef = React.useRef<HTMLInputElement>(null);
  const statusSelectRef = React.useRef<HTMLSelectElement>(null);

  React.useEffect(() => {
    if (isOpen) {
        setNumber(house?.number || '');
        // Reset fields for new visit
        setStatus(VisitStatus.Pending);
        setName(house?.name || '');
        setPhone(house?.phone || '');
        setObservation(house?.observation || '');
    }
    setTimeout(() => {
            if (isNewHouse) {
                numberInputRef.current?.focus();
            } else {
                statusSelectRef.current?.focus();
            }
        }, 100);
  }, [house, isOpen, isNewHouse]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewHouse && !number) return;

    const visitData = {
      status,
      name,
      phone,
      observation,
    };
    
    onSave({ houseNumber: number, visitData });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isNewHouse ? 'Nueva Casa' : `Registrar visita`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {isNewHouse ? (
            <div>
              <label htmlFor="house-number" className="block text-sm  text-slate-700">Número</label>
              <input id="house-number" ref={numberInputRef} type="number" value={number} onChange={(e) => setNumber(e.target.value)}
                  className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
            </div>
        ) : (
          <h3 className="text-lg  text-slate-700">Casa {house?.number}</h3>
        )}
        
        <hr className="my-2"/>
        

        <div>
          <label htmlFor="visit-status" className="block text-sm font-medium text-slate-700">Estado</label>
          <select id="visit-status" value={status} onChange={(e) => setStatus(e.target.value as VisitStatus)} ref={statusSelectRef}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-white">
            {Object.values(VisitStatus).map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>

        {status === VisitStatus.Answered && (
          <>
            <div>
              <label htmlFor="person-name" className="block text-sm font-medium text-slate-700">Nombre (Opcional)</label>
              <input id="person-name" type="text" value={name} onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="person-phone" className="block text-sm font-medium text-slate-700">Teléfono (Opcional)</label>
              <input id="person-phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
            </div>
            <div>
              <label htmlFor="visit-observation" className="block text-sm font-medium text-slate-700">Observación (Opcional)</label>
              <textarea id="visit-observation" value={observation} onChange={(e) => setObservation(e.target.value)} rows={3}
                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm"/>
            </div>
          </>
        )}
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};


const HouseItem: React.FC<{
  house: House;
  onNewVisit: () => void;
  onDelete: () => void;
}> = ({ house, onNewVisit, onDelete }) => {
  const lastVisit = house.visits[house.visits.length - 1];

  const statusStyles: { [key in VisitStatus]: string } = {
    [VisitStatus.Pending]: 'bg-gray-200 text-gray-800',
    [VisitStatus.NotAtHome]: 'bg-red-100 text-red-800',
    [VisitStatus.Answered]: 'bg-green-100 text-green-800',
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="p-4">
          <div className="flex items-center justify-between">
              <h3 className="text-xl text-slate-900">N° {house.number}</h3>
              {lastVisit && (
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[lastVisit.status]}`}>
                  {lastVisit.status}
              </span>
               )}
          </div>
          {(house.name || house.phone || house.observation) && (
            <div className="mt-3 pt-3 border-t text-sm text-slate-600 space-y-1">
                {house.name && <p><strong>Nombre:</strong> {house.name}</p>}
                {house.phone && <p><strong>Tel:</strong> {house.phone}</p>}
                {house.observation && <p className="mt-2 text-sm italic text-slate-700">"{house.observation}"</p>}
            </div>
          )}

          {lastVisit && <p className="mt-2 text-xs text-slate-400">Última visita: {new Date(lastVisit.date).toLocaleString()}</p>}
      </div>
      <div className="px-4 py-2 bg-slate-50 border-t flex justify-end gap-2">
          <button onClick={onNewVisit} title="Nueva Visita" className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-full">{React.cloneElement(ICONS.add, { className: "h-5 w-5" })}</button>
          <button onClick={onDelete} title="Eliminar Casa" className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full">{React.cloneElement(ICONS.delete, { className: "h-5 w-5" })}</button>
      </div>
    </div>
  );
};

const StreetViewPage: React.FC = () => {
  const { territoryId, streetId } = useParams<{ territoryId: string; streetId: string }>();
  const navigate = useNavigate();
  const { getTerritory, getStreet, addHouse, addVisitToHouse, deleteHouse } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeHouse, setActiveHouse] = useState<House | null>(null);
  const [deletingHouse, setDeletingHouse] = useState<House | null>(null);

  const territory = useMemo(() => territoryId ? getTerritory(territoryId) : undefined, [territoryId, getTerritory]);
  const street = useMemo(() => territoryId && streetId ? getStreet(territoryId, streetId) : undefined, [territoryId, streetId, getStreet]);

  const sortedHouses = useMemo(() => {
    return street?.houses.slice().sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true })) || [];
  }, [street]);

  if (!territory || !street) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Calle o territorio no encontrado.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white">Volver a la lista</button>
      </div>
    );
  }

  const handleSave = (data: { houseNumber: string, visitData: Omit<Visit, 'id' | 'date'> }) => {
    if (activeHouse) { // Adding a new visit to an existing house
      addVisitToHouse(territory.id, street.id, activeHouse.id, data.visitData);
    } else { // Adding a new house
      addHouse(territory.id, street.id, data.houseNumber, data.visitData);
    }
  };

  const openNewVisitModal = (house: House) => {
    setActiveHouse(house);
    setIsModalOpen(true);
  };
  
  const openAddHouseModal = () => {
    setActiveHouse(null);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-slate-100 min-h-screen">
      
       <div className="flex p-4 items-center ">
      <button onClick={() => navigate(`/territory/${territoryId}`)} className="p-2 rounded-full text-slate-700 " aria-label="Volver">
        {React.cloneElement(ICONS.back, { className: 'h-6 w-6' })}
      </button>

      <h1 className="px-4 text-lg text-slate-500">{street.name} </h1>
      
      
       
      </div>
      <main className="p-4 container mx-auto">
        <div className="space-y-4">
          {sortedHouses.map(h => (
            <HouseItem 
              key={h.id} 
              house={h}
              onNewVisit={() => openNewVisitModal(h)}
              onDelete={() => setDeletingHouse(h)} 
            />
          ))}
        </div>
        {street.houses.length === 0 && (
            <div className="text-center py-16 text-slate-500">
                <p>No hay casas registradas en esta calle.</p>
                <p>Presiona el botón '+' para agregar una nueva.</p>
            </div>
        )}
      </main>

      <button onClick={openAddHouseModal} className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110" aria-label="Agregar casa">
        {React.cloneElement(ICONS.add, { className: "h-6 w-6" })}
      </button>

      <AddHouseVisitModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        house={activeHouse}
      />
      
      {deletingHouse && (
        <ConfirmationDialog
          isOpen={!!deletingHouse}
          onClose={() => setDeletingHouse(null)}
          onConfirm={() => deleteHouse(territory.id, street.id, deletingHouse.id)}
          title="Eliminar Casa"
          message={`¿Estás seguro de que quieres eliminar la casa número ${deletingHouse.number}? Se perderán todos los registros de visitas.`}
        />
      )}
    </div>
  );
};

export default StreetViewPage;