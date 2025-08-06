
import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { Visit, VisitStatus, House } from '../types';
import Header from '../components/Header';
import { ICONS } from '../constants';

// --- Helper Types & Constants ---
interface HouseWithContext extends House {
    streetName: string;
    streetId: string;
    lastVisit: Visit;
}
type SortByType = 'date-desc' | 'date-asc' | 'street' | 'house';

const statusStyles: { [key in VisitStatus]: string } = {
    [VisitStatus.Pending]: 'bg-gray-100 text-gray-800',
    [VisitStatus.NotAtHome]: 'bg-red-100 text-red-800',
    [VisitStatus.Answered]: 'bg-green-100 text-green-800',
};


// --- Components ---
const HouseHistoryCard: React.FC<{
    house: HouseWithContext;
    isExpanded: boolean;
    onToggleExpand: () => void;
}> = ({ house, isExpanded, onToggleExpand }) => {
    const { lastVisit, visits } = house;
    const olderVisits = visits.slice(1);

    return (
        <li className="bg-white p-4 rounded-lg shadow-sm flex flex-col gap-3">
            {/* Last visit info */}
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-slate-800">{house.streetName} {house.number}</p>
                    <p className={`inline-block px-2 py-0.5 text-xs font-semibold rounded-full mt-1 ${statusStyles[lastVisit.status]}`}>{lastVisit.status}</p>
                </div>
                <p className="text-xs text-slate-500 flex-shrink-0 ml-2">{new Date(lastVisit.date).toLocaleString()}</p>
            </div>
            
            {(house.name || house.phone || house.observation) && (
                <div className="mt-2 text-sm text-slate-600 space-y-1 border-t pt-2">
                    {house.name && <p><strong>Nombre:</strong> {house.name}</p>}
                    {house.phone && <p><strong>Tel:</strong> {house.phone}</p>}
                    {house.observation && <p className="mt-2 text-sm italic text-slate-700 bg-slate-50 p-2 rounded">"{house.observation}"</p>}
                </div>
            )}
            
            {/* Expansion for older visits */}
            {olderVisits.length > 0 && (
                <div className="border-t border-slate-200 pt-3">
                    <button onClick={onToggleExpand} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                        {isExpanded ? 'Ocultar historial' : `Ver ${olderVisits.length} visita(s) anterior(es)`}
                        {React.cloneElement(ICONS.chevronDown, { className: `w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}` })}
                    </button>
                    {isExpanded && (
                        <ul className="space-y-3 mt-3 pl-2 border-l-2 border-slate-200">
                            {olderVisits.map(visit => (
                                <li key={visit.id} className="bg-slate-50 p-3 rounded-md text-sm">
                                    <div className="flex justify-between items-center">
                                        <p className={`font-semibold text-slate-700`}>{visit.status}</p>
                                        <p className="text-xs text-slate-500">{new Date(visit.date).toLocaleString()}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </li>
    );
};


const VisitHistoryPage: React.FC = () => {
    const { territoryId } = useParams<{ territoryId: string }>();
    const navigate = useNavigate();
    const { getTerritory } = useData();

    const [filterStatus, setFilterStatus] = useState<VisitStatus | 'All'>('All');
    const [sortBy, setSortBy] = useState<SortByType>('date-desc');
    const [expandedHouses, setExpandedHouses] = useState<Set<string>>(new Set());

    const territory = useMemo(() => territoryId ? getTerritory(territoryId) : undefined, [territoryId, getTerritory]);

    const processedHouses = useMemo(() => {
        if (!territory) return [];

        const allHousesWithContext: HouseWithContext[] = [];

        territory.streets.forEach(street => {
            street.houses.forEach(house => {
                if (house.visits.length > 0) {
                    const sortedVisits = [...house.visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
                    allHousesWithContext.push({
                        ...house,
                        visits: sortedVisits,
                        streetName: street.name,
                        streetId: street.id,
                        lastVisit: sortedVisits[0],
                    });
                }
            });
        });

        const filtered = filterStatus === 'All'
            ? allHousesWithContext
            : allHousesWithContext.filter(h => h.lastVisit?.status === filterStatus);

        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'date-asc':
                    return new Date(a.lastVisit.date).getTime() - new Date(b.lastVisit.date).getTime();
                case 'street':
                    return a.streetName.localeCompare(b.streetName) || a.number.localeCompare(b.number, undefined, { numeric: true });
                case 'house':
                    return a.number.localeCompare(b.number, undefined, { numeric: true }) || a.streetName.localeCompare(b.streetName);
                case 'date-desc':
                default:
                    return new Date(b.lastVisit.date).getTime() - new Date(a.lastVisit.date).getTime();
            }
        });
    }, [territory, filterStatus, sortBy]);

    const toggleExpandHouse = (houseId: string) => {
        setExpandedHouses(prev => {
            const newSet = new Set(prev);
            if (newSet.has(houseId)) {
                newSet.delete(houseId);
            } else {
                newSet.add(houseId);
            }
            return newSet;
        });
    };

    if (!territory) {
        return (
            <div className="bg-slate-100 min-h-screen">
                <Header title="Error" showBackButton backTo="/" />
                <main className="p-4 text-center">
                     <p>Territorio no encontrado.</p>
                </main>
            </div>
        );
    }

    return (
        <div className="bg-slate-100 min-h-screen">
            {/* <Header 
                title={<>Historial - T. {territory.number}</>}
                showBackButton
                backTo={`/territory/${territoryId}`}
            /> */}
            <div className="flex p-4 items-center ">
      <button onClick={() => navigate(`/territory/${territoryId}`)} className="p-2 rounded-full text-slate-700 " aria-label="Volver">
        {React.cloneElement(ICONS.back, { className: 'h-6 w-6' })}
      </button>

      <h1 className="px-4 text-lg text-slate-500"> Historial - T. {territory.number}</h1>
      
      
       
      </div>
            <main className="p-4 container mx-auto">
                <div className="bg-white p-3 rounded-lg shadow-md mb-4 flex  gap-4 justify-between items-center sticky top-[65px] z-10">
                    <div className="flex flex-col gap-2">
                         <label htmlFor="filter-status" className="text-xs font-medium text-slate-600">Filtrar:</label>
                         <select 
                            id="filter-status" 
                            value={filterStatus} 
                            onChange={(e) => setFilterStatus(e.target.value as any)}
                            className="bg-white border border-slate-300 rounded-md shadow-sm px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="All">Todos</option>
                            {Object.values(VisitStatus).map(s => <option key={s} value={s}>{s}</option>)}
                         </select>
                    </div>
                    <div className="flex flex-col gap-2">
                         <label htmlFor="sort-by" className="text-xs font-medium text-slate-600">Ordenar:</label>
                         <select 
                            id="sort-by" 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value as SortByType)}
                            className="bg-white border border-slate-300 rounded-md shadow-sm px-3 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        >
                            <option value="date-desc">Más Recientes</option>
                            <option value="date-asc">Más Antiguos</option>
                            <option value="street">Por Calle</option>
                            <option value="house">Por Casa</option>
                         </select>
                    </div>
                </div>

                {processedHouses.length > 0 ? (
                    <ul className="space-y-3">
                        {processedHouses.map(house => (
                            <HouseHistoryCard 
                                key={house.id}
                                house={house}
                                isExpanded={expandedHouses.has(house.id)}
                                onToggleExpand={() => toggleExpandHouse(house.id)}
                            />
                        ))}
                    </ul>
                ) : (
                    <div className="text-center py-16 text-slate-500">
                        <p className="font-semibold text-lg">No hay visitas que coincidan con el filtro.</p>
                        <p>Intenta con otra opción o registra nuevas visitas.</p>
                    </div>
                )}
            </main>
        </div>
    )
}

export default VisitHistoryPage;
