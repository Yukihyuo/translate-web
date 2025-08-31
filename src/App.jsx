// src/App.jsx
import React, { useState, useEffect } from 'react';
import DialogCard from './components/DialogCard'; // Ajusta la ruta
import axios from 'axios'; // Para hacer peticiones HTTP
import './index.css'; // Asegúrate de importar tus estilos de Tailwind
import ProgressDashboard from './components/Statistics';

function App() {
    const [currentDialog, setCurrentDialog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dialogsQueue, setDialogsQueue] = useState([]); // Cola de diálogos pendientes
    // const [dialogIndex, setDialogIndex] = useState(0); // Índice para navegar la cola
    const API_BASE_URL = import.meta.env.VITE_API_URL; // Ajusta la URL de tu API

    useEffect(() => {
        fetchInitialDialogs();
    }, []);

    const fetchInitialDialogs = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/api/pending`);
            if (response.data.dialogos.length > 0) {
                setDialogsQueue(response.data.dialogos);
                setCurrentDialog(response.data.dialogos[0]);
            } else {
                setCurrentDialog(null);
                setDialogsQueue([]);
                alert('No hay más diálogos pendientes por traducir. ¡Buen trabajo!');
            }
        } catch (err) {
            setError('Error al cargar los diálogos: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (id, newTranslation, newStatus) => {
        setLoading(true);
        setError(null);
        try {
            // Se asume que el backend gestiona el historial y la validación
            await axios.put(`${API_BASE_URL}/api/${id}`, {
                'es-ES': newTranslation,
                status: newStatus,
                // Puedes enviar 'translated_by' si lo gestionas en el frontend
                // history: { new_text: newTranslation, translated_by: 'userId' }
            });
            handleNext(id); // Pasa al siguiente automáticamente después de guardar
        } catch (err) {
            setError('Error al guardar la traducción: ' + err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = (currentDialogId) => {
        // Encuentra el índice del diálogo actual en la cola
        const currentIndexInQueue = dialogsQueue.findIndex(d => d._id === currentDialogId);
        
        // Si el diálogo actual fue guardado o saltado, lo removemos de la cola
        const updatedQueue = dialogsQueue.filter(d => d._id !== currentDialogId);
        setDialogsQueue(updatedQueue);

        // Si hay más diálogos en la cola
        if (updatedQueue.length > 0) {
            // Toma el siguiente diálogo, asegurándote de no salirte del rango
            const nextIndex = currentIndexInQueue < updatedQueue.length ? currentIndexInQueue : 0;
            setCurrentDialog(updatedQueue[nextIndex]);
        } else {
            // Si la cola está vacía, intenta cargar más diálogos
            fetchInitialDialogs();
        }
    };

    const handleSkip = (id) => {
        // Simplemente pasa al siguiente sin guardar
        handleNext(id);
    };


    if (loading) return <div className="flex justify-center items-center h-screen text-xl">Cargando diálogos...</div>;
    if (error) return <div className="flex justify-center items-center h-screen text-red-500 text-xl">{error}</div>;
    if (!currentDialog) return <div className="flex justify-center items-center h-screen text-xl">No hay diálogos pendientes. ¡Felicidades!</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 mt-4">Traducción de Diálogos del Juego</h1>
            <ProgressDashboard/>
            <DialogCard
                dialog={currentDialog}
                onSave={handleSave}
                onNext={handleNext}
                onSkip={handleSkip}
            />
            {/* Opcional: Puedes agregar un contador de progreso global aquí si obtienes las estadísticas de la API */}
        </div>
    );
}

export default App;