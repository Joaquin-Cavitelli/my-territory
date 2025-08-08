import React, { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Territory, VisitStatus } from '../types';
import Header from '../components/Header';
import Modal from '../components/Modal';
import ConfirmationDialog from '../components/ConfirmationDialog';
import ImageViewer from '../components/ImageViewer';
import { ICONS } from '../constants';

const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

const AddEditTerritoryModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (number: string, mapImage?: string) => void;
  territory?: Territory | null;
}> = ({ isOpen, onClose, onSave, territory }) => {
  const [number, setNumber] = useState(territory?.number || '');
  const [mapImage, setMapImage] = useState<string | undefined>(territory?.mapImage);
  const [mapFile, setMapFile] = useState<File | null>(null);
const numberInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    setNumber(territory?.number || '');
    setMapImage(territory?.mapImage);
    setMapFile(null);
     if (isOpen) {
      setTimeout(() => {
        numberInputRef.current?.focus();
      }, 100);
    }
  }, [territory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!number) return;
    let newImageBase64 = mapImage;
    if (mapFile) {
      newImageBase64 = await fileToBase64(mapFile);
    }
    onSave(number, newImageBase64);
    onClose();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setMapFile(e.target.files[0]);
          setMapImage(URL.createObjectURL(e.target.files[0]));
      }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={territory ? 'Editar Territorio' : 'Nuevo Territorio'}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="territory-number" className="block text-sm font-medium text-slate-700">Número de Territorio</label>
          <input
            id="territory-number"
            ref={numberInputRef}
            type="number"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Mapa (Opcional)</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
          />
          {mapImage && <img src={mapImage} alt="Vista previa del mapa" className="mt-2 rounded-md max-h-40 w-auto" />}
        </div>
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-slate-200 text-slate-700 hover:bg-slate-300 font-semibold">Cancelar</button>
          <button type="submit" className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 font-semibold">Guardar</button>
        </div>
      </form>
    </Modal>
  );
};

const TerritoryCard: React.FC<{ territory: Territory; onSelect: () => void; onEdit: () => void; onDelete: () => void; }> = ({ territory, onSelect, onEdit, onDelete }) => {
  const [imageViewerOpen, setImageViewerOpen] = useState(false);
  
  const stats = useMemo(() => {
    let houses = 0;
    let notAtHome = 0;
    let answered = 0;
    territory.streets.forEach(s => {
      houses += s.houses.length;
      s.houses.forEach(h => {
        const lastVisit = h.visits[h.visits.length - 1];
        if (lastVisit?.status === VisitStatus.NotAtHome) notAtHome++;
        if (lastVisit?.status === VisitStatus.Answered) answered++;
      });
    });
    return { houses, notAtHome, answered };
  }, [territory]);

  return (
    <>
      <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-[1.02] cursor-pointer">
        {territory.mapImage && (
            <div className="relative">
                <img src={territory.mapImage} alt={`Mapa del territorio ${territory.number}`} className="w-full h-32 object-cover" onClick={onSelect} />
                <button onClick={(e) => { e.stopPropagation(); setImageViewerOpen(true); }} className="absolute top-2 right-2 flex justify-center items-center w-10 h-10 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-75">{React.cloneElement(ICONS.expand, { className: "absolute h-5 w-5 " })}</button>
            </div>
        )}
        <div className="p-4" onClick={onSelect}>
          <h2 className="text-2xl text-slate-700">Territorio {territory.number}</h2>
          <div className="mt-3 flex gap-5 text-sm text-slate-600">
            <div className="flex items-center gap-2">{React.cloneElement(ICONS.home, { className: "h-4 w-4 text-indigo-700" })}<span>{stats.houses}</span></div>
            <div className="flex items-center gap-2">{React.cloneElement(ICONS.notHome, { className: "h-4 w-4 text-red-700" })}<span>{stats.notAtHome}</span></div>
            <div className="flex items-center gap-2">{React.cloneElement(ICONS.answered, { className: "h-4 w-4 text-green-700" })}<span>{stats.answered}</span></div>
          </div>
        </div>
        <div className="px-4 py-2 bg-slate-50 border-t flex justify-end gap-2">
            <button onClick={(e) => {e.stopPropagation(); onEdit()}} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-200 rounded-full">{React.cloneElement(ICONS.edit, { className: "h-5 w-5" })}</button>
            <button onClick={(e) => {e.stopPropagation(); onDelete()}} className="p-2 text-slate-500 hover:text-red-600 hover:bg-slate-200 rounded-full">{React.cloneElement(ICONS.delete, { className: "h-5 w-5" })}</button>
        </div>
      </div>
      {imageViewerOpen && <ImageViewer src={territory.mapImage!} territoryNumber={territory.number} onClose={() => setImageViewerOpen(false)} />}
   
    </>
  );
};
   

const TerritoryListPage: React.FC = () => {
  const { territories, addTerritory, updateTerritory, deleteTerritory, loading } = useData();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTerritory, setEditingTerritory] = useState<Territory | null>(null);
  const [deletingTerritory, setDeletingTerritory] = useState<Territory | null>(null);

  const handleSaveTerritory = (number: string, mapImage?: string) => {
    if (editingTerritory) {
      updateTerritory(editingTerritory.id, number, mapImage);
    } else {
      addTerritory(number, mapImage);
    }
  };

  const openEditModal = (territory: Territory) => {
    setEditingTerritory(territory);
    setIsModalOpen(true);
  };
  
  const openAddModal = () => {
    setEditingTerritory(null);
    setIsModalOpen(true);
  };
  
  if (loading) {
     return <div className="flex justify-center items-center min-h-[--doc-height]">Cargando...</div>;
 
  }

  return (
    <div className="bg-slate-100 min-h-[--doc-height] pb-24">
      <h1 className="p-4  text-4xl text-slate-500">Territorios</h1>
      <main className="p-4 container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {territories.map(t => (
            <TerritoryCard 
              key={t.id} 
              territory={t}
              onSelect={() => navigate(`/territory/${t.id}`)}
              onEdit={() => openEditModal(t)}
              onDelete={() => setDeletingTerritory(t)}
            />
          ))}
        </div>
        {territories.length === 0 && (
            <div className="text-center py-16 text-slate-500">
                <p>No hay territorios.</p>
                <p>Presiona el botón '+' para agregar uno nuevo.</p>
            </div>
        )}
      </main>
      <button 
        onClick={openAddModal}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110"
        aria-label="Agregar territorio"
      >
        {React.cloneElement(ICONS.add, { className: "h-6 w-6" })}
      </button>

      <AddEditTerritoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTerritory}
        territory={editingTerritory}
      />
      
      {deletingTerritory && (
        <ConfirmationDialog 
          isOpen={!!deletingTerritory}
          onClose={() => setDeletingTerritory(null)}
          onConfirm={() => deleteTerritory(deletingTerritory.id)}
          title="Eliminar Territorio"
          message={`¿Estás seguro de que quieres eliminar el Territorio ${deletingTerritory.number}? Esta acción no se puede deshacer.`}
        />
      )}
    </div>
  );
};

export default TerritoryListPage;