'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AlertTriangle, Database, Settings } from 'lucide-react';
import Link from 'next/link';

// ─── Context ────────────────────────────────────────────────────────────────

interface DatabaseWarningContextValue {
  /** Wraps a submit handler: if SQLite, shows warning modal first */
  guardedSubmit: (onConfirm: () => void | Promise<void>) => void;
}

const DatabaseWarningContext = createContext<DatabaseWarningContextValue>({
  guardedSubmit: (fn) => fn(),
});

// ─── Provider ────────────────────────────────────────────────────────────────

export function DatabaseWarningProvider({ children }: { children: ReactNode }) {
  const [isSupabase, setIsSupabase] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<(() => void | Promise<void>) | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((r) => r.json())
      .then((d) => setIsSupabase(!!d.isSupabase))
      .catch(() => setIsSupabase(true)); // fail-safe: don't block if API is down
  }, []);

  const guardedSubmit = useCallback(
    (onConfirm: () => void | Promise<void>) => {
      if (!isSupabase) {
        setPendingAction(() => onConfirm);
      } else {
        onConfirm();
      }
    },
    [isSupabase]
  );

  const handleConfirm = async () => {
    if (pendingAction) {
      await pendingAction();
      setPendingAction(null);
    }
  };

  const handleCancel = () => setPendingAction(null);

  return (
    <DatabaseWarningContext.Provider value={{ guardedSubmit }}>
      {children}

      {/* ── Warning Modal ── */}
      {pendingAction && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-orange-200 dark:border-orange-900/50 overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex items-center gap-3 p-5 border-b border-orange-100 dark:border-orange-900/30 bg-orange-50 dark:bg-orange-950/20">
              <div className="p-2 bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 rounded-xl">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white text-base">Dados em Risco</h3>
                <p className="text-xs text-orange-600 dark:text-orange-400 font-medium">Banco de dados temporário (SQLite)</p>
              </div>
            </div>

            {/* Body */}
            <div className="p-5 space-y-3">
              <p className="text-sm text-gray-700 dark:text-neutral-300">
                O Dimy ainda está rodando com o banco de dados local <strong>(SQLite)</strong>. Isso significa que os dados que você salvar agora <strong>serão perdidos</strong> caso o servidor seja reiniciado ou atualizado sem um volume persistente.
              </p>
              <div className="flex items-start gap-2 p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl text-xs text-gray-500 dark:text-neutral-400">
                <Database className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                <span>Para proteger seus dados permanentemente, configure a variável <code className="bg-gray-200 dark:bg-neutral-700 px-1 rounded">DATABASE_URL</code> com sua conexão Supabase.</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-2 p-5 pt-0">
              <button
                onClick={handleConfirm}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 rounded-xl transition-colors"
              >
                Salvar mesmo assim
              </button>
              <Link
                href="/supabase"
                onClick={handleCancel}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4" />
                Configurar Supabase
              </Link>
            </div>
          </div>
        </div>
      )}
    </DatabaseWarningContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useDatabaseWarning() {
  return useContext(DatabaseWarningContext);
}
