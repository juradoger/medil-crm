// Hook del asistente de IA — envuelve aiService con loading/error/simulated
import { useState } from 'react';
import { aiService } from '../services/aiService';

export function useAI() {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);

  // withAILoading — envuelve TODA operación async de IA (loading + error + simulated)
  async function withAILoading(fn) {
    setLoading(true);
    setError(null);
    setIsSimulated(false);
    try {
      const result = await fn();
      if (result?.simulated) {
        setIsSimulated(true);
      }
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function suggestDiagnosis(symptoms, patientId, specialty) {
    return withAILoading(() =>
      aiService.suggestDiagnosis(symptoms, patientId, specialty)
    );
  }

  async function summarizeHistory(patientId, patientName) {
    return withAILoading(() =>
      aiService.summarizeHistory(patientId, patientName)
    );
  }

  async function chat(message, patientContext, history) {
    return withAILoading(() =>
      aiService.chat(message, patientContext, history)
    );
  }

  async function suggestSupplies(diagnosis, notes, branchId) {
    return withAILoading(() =>
      aiService.suggestSupplies(diagnosis, notes, branchId)
    );
  }

  return {
    loading, error, isSimulated,
    suggestDiagnosis, summarizeHistory,
    chat, suggestSupplies,
  };
}
