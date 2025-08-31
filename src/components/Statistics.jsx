import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProgressDashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const API_STATS_URL = import.meta.env.VITE_API_URL;

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await axios.get(API_STATS_URL+"/api/statistics");
            setStats(response.data);
        } catch (err) {
            setError('Error al cargar las estadísticas.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border shadow-sm p-6 w-full max-w-2xl mx-auto my-8">
                <p className="text-center text-gray-500">Cargando estadísticas...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg border shadow-sm p-6 w-full max-w-2xl mx-auto my-8">
                <p className="text-center text-red-500">{error}</p>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="bg-white rounded-lg border shadow-sm p-6 w-full max-w-2xl mx-auto my-8">
                <p className="text-center text-gray-500">No se encontraron estadísticas.</p>
            </div>
        );
    }

    const { total_documents, status_counts } = stats;

    // Calcula el porcentaje de cada estado. Evita la división por cero.
    const getPercentage = (count) => {
        return total_documents > 0 ? (count / total_documents) * 100 : 0;
    };

    const pendientePerc = getPercentage(status_counts.pendiente);
    const enProgresoPerc = getPercentage(status_counts.en_progreso);
    const traducidoPerc = getPercentage(status_counts.traducido);

    return (
        <div className="bg-white rounded-lg border shadow-sm p-6 w-full max-w-2xl mx-auto my-8">
            <h2 className="text-2xl font-bold mb-4 text-center">Avance de Traducción</h2>
            
            <div className="mb-6">
                <p className="text-lg font-medium text-gray-700">Total de Diálogos: <span className="font-bold">{total_documents}</span></p>
            </div>

            {/* Barra de progreso */}
            <div className="w-full h-2 bg-gray-200 rounded-full flex overflow-hidden shadow-inner">
                {/* Barra para 'Traducido' */}
                <div
                    style={{ width: `${traducidoPerc}%` }}
                    className="h-full bg-green-500 transition-all duration-500 ease-out"
                    title={`Traducido: ${traducidoPerc.toFixed(1)}%`}
                ></div>
                {/* Barra para 'En Progreso' */}
                <div
                    style={{ width: `${enProgresoPerc}%` }}
                    className="h-full bg-yellow-400 transition-all duration-500 ease-out"
                    title={`En Progreso: ${enProgresoPerc.toFixed(1)}%`}
                ></div>
                {/* Barra para 'Pendiente' */}
                <div
                    style={{ width: `${pendientePerc}%` }}
                    className="h-full bg-red-400 transition-all duration-500 ease-out"
                    title={`Pendiente: ${pendientePerc.toFixed(1)}%`}
                ></div>
            </div>

            {/* Leyenda y detalles del progreso */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-green-500"></span>
                    <span>Traducido: <span className="font-bold">{status_counts.traducido}</span> (<span className="font-bold">{traducidoPerc.toFixed(1)}%</span>)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-yellow-400"></span>
                    <span>En Progreso: <span className="font-bold">{status_counts.en_progreso}</span> (<span className="font-bold">{enProgresoPerc.toFixed(1)}%</span>)</span>
                </div>
                <div className="flex items-center space-x-2">
                    <span className="w-4 h-4 rounded-full bg-red-400"></span>
                    <span>Pendiente: <span className="font-bold">{status_counts.pendiente}</span> (<span className="font-bold">{pendientePerc.toFixed(1)}%</span>)</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressDashboard;
