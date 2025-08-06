import React, { useState, useMemo, Fragment, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Street, VisitStatus, Territory } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ImageViewer from '../components/ImageViewer';
import TerritoryStatsModal from '../components/TerritoryStatsModal';
import { exportTerritoryDataToExcel } from '../services/exportService';
import { Menu, Transition } from '@headlessui/react';
import { ICONS } from '../constants';


const AddEditStreetModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  street?: Street | null;
}> = ({ isOpen, onClose, onSave, street }) => {
  const [name, setName] = useState('');
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setName(street?.name || '');
    if (isOpen) {
      setTimeout(() => {
        nameInputRef.current?.focus();
      }, 100);
    }
  }, [street, isOpen]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave(name);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={street ? 'Editar Calle' : 'Nueva Calle'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="street-name" className="block text-sm font-medium text-slate-700">Nombre de la Calle</label>
          <input
            id="street-name"
            ref={nameInputRef}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};


const StreetCard: React.FC<{ street: Street; onSelect: () => void; onEdit: () => void; onDelete: () => void; }> = ({ street, onSelect, onEdit, onDelete }) => {
  const stats = useMemo(() => {
    const lastVisits = street.houses.map(h => h.visits[h.visits.length - 1]).filter(Boolean);
    const notAtHome = lastVisits.filter(v => v.status === VisitStatus.NotAtHome).length;
    const answered = lastVisits.filter(v => v.status === VisitStatus.Answered).length;
    return { houses: street.houses.length, notAtHome, answered };
  }, [street]);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
        <div onClick={onSelect} className="p-4 cursor-pointer">
            <h3 className="text-xl font-base text-slate-800 capitalize">{street.name}</h3>
            <div className="mt-3 flex gap-5 text-sm text-slate-600">
            <div className="flex items-center gap-2">{React.cloneElement(ICONS.home, { className: "h-4 w-4 text-indigo-700" })}<span>{stats.houses}</span></div>
            <div className="flex items-center gap-2">{React.cloneElement(ICONS.notHome, { className: "h-4 w-4 text-red-700" })}<span>{stats.notAtHome}</span></div>
            <div className="flex items-center gap-2">{React.cloneElement(ICONS.answered, { className: "h-4 w-4 text-green-700" })}<span>{stats.answered}</span></div>
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-50 border-t flex justify-end gap-2">
            <button onClick={(e) => {e.stopPropagation(); onEdit()}} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-full" title="Editar calle">{React.cloneElement(ICONS.edit, { className: "h-5 w-5" })}</button>
            <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full" title="Eliminar calle">{React.cloneElement(ICONS.delete, { className: "h-5 w-5" })}</button>
        </div>
    </div>
  );
};


const TerritoryViewPage: React.FC = () => {
  const { territoryId } = useParams<{ territoryId: string }>();
  const navigate = useNavigate();
  const { getTerritory, addStreet, updateStreet, deleteStreet } = useData();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStreet, setEditingStreet] = useState<Street | null>(null);
  const [deletingStreet, setDeletingStreet] = useState<Street | null>(null);
  const [isImageViewerOpen, setIsImageViewerOpen] = useState(false);
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);

  const territory = useMemo(() => territoryId ? getTerritory(territoryId) : undefined, [territoryId, getTerritory]);

  if (!territory) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p>Territorio no encontrado.</p>
        <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 rounded-md bg-indigo-600 text-white">Volver a la lista</button>
      </div>
    );
  }

  const handleSaveStreet = (name: string) => {
    if (editingStreet) {
      updateStreet(territory.id, editingStreet.id, name);
    } else {
      addStreet(territory.id, name);
    }
  };

  const openEditModal = (street: Street) => {
    setEditingStreet(street);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingStreet(null);
    setIsModalOpen(true);
  };
  
  const TerritoryMenu = () => (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button className="p-2 rounded-full text-slate-670 ">
          {React.cloneElement(ICONS.options, { className: "h-6 w-6" })}
        </Menu.Button>
      </div>
      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 mt-2 w-72 p-2 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="px-1 py-2 ">
            {territory.mapImage && (
            <Menu.Item>
              {({ active }) => (
                <button onClick={() => setIsImageViewerOpen(true)} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                  {React.cloneElement(ICONS.map, { className: "mr-2 h-5 w-5" })}Ver Mapa
                </button>
              )}
            </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button onClick={() => setIsStatsModalOpen(true)} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                   {React.cloneElement(ICONS.chartBar, { className: "mr-2 h-5 w-5" })}Estadísticas
                </button>
              )}
            </Menu.Item>
            <Menu.Item>
              {({ active }) => (
                <button onClick={() => navigate(`/territory/${territory.id}/history`)} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                   {React.cloneElement(ICONS.history, { className: "mr-2 h-5 w-5" })}Ver Historial de Visitas
                </button>
              )}
            </Menu.Item>
          </div>
          <div className="px-1 py-1">
             <Menu.Item>
              {({ active }) => (
                <button onClick={() => exportTerritoryDataToExcel(territory)} className={`${active ? 'bg-indigo-500 text-white' : 'text-gray-900'} group flex w-full items-center rounded-md px-2 py-2 text-sm`}>
                   {React.cloneElement(ICONS.export, { className: "mr-2 h-5 w-5" })}Exportar a Excel
                </button>
              )}
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );

  return (
    <div className="bg-slate-100 min-h-screen">
      {/* <Header 
        title={<>Territorio <span className="font-extrabold">{territory.number}</span></>} 
        showBackButton 
        backTo="/"
        actions={<TerritoryMenu />}
      /> */}
      <div className="flex p-4 items-center justify-between ">
        <div className="flex items-center">

      <button onClick={() => navigate('/')} className="p-2 rounded-full text-slate-700 " aria-label="Volver">
        {React.cloneElement(ICONS.back, { className: 'h-6 w-6' })}
      </button>

      <h1 className=" text-lg px-4 text-slate-500">Territorio {territory.number} </h1>
        </div>
      
        <TerritoryMenu />
      </div>
      
      <main className="p-4 container mx-auto">
        <div className="space-y-4">
          {territory.streets.map(s => (
            <StreetCard 
              key={s.id}
              street={s}
              onSelect={() => navigate(`/territory/${territory.id}/street/${s.id}`)}
              onEdit={() => openEditModal(s)}
              onDelete={() => setDeletingStreet(s)}
            />
          ))}
        </div>
        {territory.streets.length === 0 && (
            <div className="text-center py-16 text-slate-500">
                <p>No hay calles en este territorio.</p>
                <p>Presiona el botón '+' para agregar una nueva.</p>
            </div>
        )}
      </main>

      <button onClick={openAddModal} className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110" aria-label="Agregar calle">
        {React.cloneElement(ICONS.add, { className: "h-6 w-6" })}
      </button>

      <AddEditStreetModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStreet}
        street={editingStreet}
      />
      
      {deletingStreet && (
        <ConfirmationDialog
          isOpen={!!deletingStreet}
          onClose={() => setDeletingStreet(null)}
          onConfirm={() => deleteStreet(territory.id, deletingStreet.id)}
          title="Eliminar Calle"
          message={`¿Estás seguro de que quieres eliminar la calle "${deletingStreet.name}"? Se perderán todos los datos de las casas asociadas.`}
        />
      )}

      {isImageViewerOpen && territory.mapImage && (
        <ImageViewer src={territory.mapImage} territoryNumber={territory.number} onClose={() => setIsImageViewerOpen(false)} />
     
      )}
      {territory && (
        <TerritoryStatsModal
          isOpen={isStatsModalOpen}
          onClose={() => setIsStatsModalOpen(false)}
          territory={territory}
        />
      )}
      
    </div>
  );
};

export default TerritoryViewPage;