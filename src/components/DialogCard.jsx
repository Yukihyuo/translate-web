import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Copy, Sparkles } from 'lucide-react';
import { ToastContainer, toast } from 'react-toastify';

const DialogCard = ({ dialog, onSave, onNext, onSkip }) => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  const [esEsText, setEsEsText] = useState(dialog['es-ES'] || '');
  const [status, setStatus] = useState(dialog.status);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!esEsText && dialog['en-US']) {
      handleTranslate();
    }
  }, [dialog['en-US']]);

  const handleCopy = (text, message) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast.success(message);
      })
      .catch(err => {
        toast.error('Error al copiar el texto.');
        console.error('Error al copiar el texto:', err);
      });
  };

  const handleTranslate = async () => {
    setIsTranslating(true);
    try {
      const res = await axios.post(API_BASE_URL + "/api/translate", {
        text: dialog['en-US'],
      });

      if (res.data && res.data.translations) {
        console.log(res.data)
        setEsEsText(res.data.translations.google);
        if (status === 'pendiente') {
          setStatus('en_progreso');
        }
      } else {
        toast.error("No se pudo obtener la traducción.");
      }
    } catch (err) {
      toast.error("Error al conectar con el servicio de traducción.");
      console.error("Error de traducción:", err);
    } finally {
      setIsTranslating(false);
    }
  };

  const handleSave = () => {
    onSave(dialog._id, esEsText, status);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-2xl mx-auto my-8">
      <ToastContainer position="bottom-right" autoClose={3000} hideProgressBar newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      <div className="flex flex-col space-y-1.5 pb-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold leading-none tracking-tight text-gray-800">
            Diálogo ID: <span className="text-blue-600">{dialog._id}</span>
          </h3>
          <button
            onClick={() => handleCopy(dialog._id, 'ID copiado al portapapeles.')}
            className="p-2 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="Copiar ID"
          >
            <Copy className="h-4 w-4 text-gray-500" />
          </button>
        </div>
        <p className="text-sm text-gray-500">
          Estado actual: <span className={`font-medium ${status === 'traducido' ? 'text-green-600' : status === 'en_progreso' ? 'text-yellow-600' : 'text-red-600'}`}>{status}</span>
        </p>
      </div>
      <div className="p-6 grid gap-4">
        {/* Texto en inglés (en-US) */}
        <div className="space-y-2 relative">
          <label htmlFor="en-US" className="text-sm font-medium leading-none text-gray-700">
            Texto Original (en-US)
          </label>
          <textarea
            id="en-US"
            className="flex min-h-[80px] w-full rounded-md bg-slate-300 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            value={dialog['en-US'] || 'N/A'}
            readOnly
          />
          <button
            onClick={() => handleCopy(dialog['en-US'], 'Texto original copiado al portapapeles.')}
            className="absolute top-8 right-2 p-2 rounded-md hover:bg-gray-200 transition-colors"
            aria-label="Copiar texto original"
          >
            <Copy className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Input para la traducción al español (es-ES) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="es-ES" className="text-sm font-medium leading-none text-gray-700">
              Traducción (es-ES)
            </label>
            <button
              onClick={handleTranslate}
              disabled={isTranslating}
              className={`p-2 rounded-md transition-colors flex items-center gap-1 text-sm font-medium ${isTranslating ? 'text-gray-400 cursor-not-allowed' : 'text-blue-600 hover:bg-gray-100'}`}
            >
              <Sparkles className="h-4 w-4" />
              {isTranslating ? 'Traduciendo...' : 'Traducir Automático'}
            </button>
          </div>
          <textarea
            id="es-ES"
            className="flex min-h-[80px] w-full rounded-md shadow-md bg-slate-200 focus:border-none px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            placeholder="Ingresa la traducción aquí..."
            value={esEsText}
            onChange={(e) => {
              setEsEsText(e.target.value);
              if (status === 'pendiente') {
                setStatus('en_progreso');
              }
            }}
          />
        </div>

        {/* Controles de estado con botones de radio */}
        <div className="space-y-2">
          <span className="text-sm font-medium leading-none text-gray-700">
            Cambiar Estado
          </span>
          <div className="flex space-x-2">
            {['pendiente', 'en_progreso', 'traducido'].map((option) => (
              <div key={option} className="flex-1">
                <input
                  type="radio"
                  id={`status-${option}`}
                  name="status"
                  value={option}
                  checked={status === option}
                  onChange={(e) => setStatus(e.target.value)}
                  className="hidden" // Oculta el input de radio por defecto
                />
                <label
                  htmlFor={`status-${option}`}
                  className={`
                    inline-flex items-center justify-center w-full px-4 py-2 text-sm font-medium
                    rounded-md border border-input transition-colors cursor-pointer
                    ${status === option ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-100'}
                    `}
                >
                  {option.charAt(0).toUpperCase() + option.slice(1).replace('_', ' ')}
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex items-center p-6 border-t justify-end gap-2">
        <button
          onClick={() => onSkip(dialog._id)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-white hover:bg-gray-100 hover:text-accent-foreground h-10 px-4 py-2"
        >
          Saltar
        </button>
        <button
          onClick={handleSave}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-10 px-4 py-2"
        >
          Guardar
        </button>
        <button
          onClick={() => onNext(dialog._id)}
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};

export default DialogCard;
