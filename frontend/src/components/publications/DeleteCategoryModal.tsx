import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Trash2, X, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { getDocuments, deleteDocument, updateDocument } from '@/core/content/actions';
import { deleteCollection } from '@/core/schema/actions';

interface DeleteCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: any;
  allCategories: any[];
  onSuccess: () => void;
}

export function DeleteCategoryModal({ isOpen, onClose, category, allCategories, onSuccess }: DeleteCategoryModalProps) {
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [action, setAction] = useState<'delete' | 'move'>('delete');
  const [targetCategory, setTargetCategory] = useState<string>('');

  useEffect(() => {
    if (isOpen && category) {
      setLoading(true);
      getDocuments(category.id).then((docs) => {
        setDocuments(docs || []);
        setLoading(false);
      }).catch(() => {
        setDocuments([]);
        setLoading(false);
      });
      setAction('delete');
      setTargetCategory('');
    }
  }, [isOpen, category]);

  if (!isOpen || !category) return null;

  const availableTargets = allCategories.filter(c => c.id !== category.id);

  const handleDelete = async () => {
    if (documents.length > 0 && action === 'move' && !targetCategory) {
      toast.error('Selecione uma categoria de destino.');
      return;
    }

    setDeleting(true);
    try {
      if (documents.length > 0) {
        if (action === 'delete') {
          // Excluir todos os posts
          for (const doc of documents) {
            await deleteDocument(doc.id, category.slug);
          }
        } else if (action === 'move') {
          // Mover todos os posts
          const targetSlug = allCategories.find(c => c.id === targetCategory)?.slug;
          if (!targetSlug) throw new Error('Categoria de destino não encontrada.');
          
          for (const doc of documents) {
            // Utilizamos a nova API que aceita collectionId
            await fetch(`/api/content/documents/${doc.id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                collectionId: targetCategory,
                data: doc.data
              })
            });
          }
        }
      }

      // Excluir a categoria em si
      const res = await deleteCollection(category.id);
      if (res.success) {
        toast.success('Categoria excluída com sucesso!');
        onSuccess();
        onClose();
      } else {
        toast.error('Erro ao excluir: ' + res.error);
      }
    } catch (error) {
      console.error(error);
      toast.error('Erro ao processar a exclusão.');
    } finally {
      setDeleting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white dark:bg-neutral-900 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-neutral-800 relative animate-in slide-in-from-bottom-4 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-500/20 flex items-center justify-center mb-6 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-8 h-8" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Excluir Categoria</h2>
          <p className="text-gray-500 dark:text-neutral-400 mb-6">
            Tem certeza que deseja excluir a categoria <strong className="text-gray-700 dark:text-gray-300">{category.name}</strong>?
          </p>

          {loading ? (
            <div className="mb-6 flex items-center gap-2 text-gray-500">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
              Verificando posts...
            </div>
          ) : documents.length > 0 ? (
            <div className="w-full bg-gray-50 dark:bg-neutral-950 border border-gray-200 dark:border-neutral-800 rounded-2xl p-4 mb-6 text-left">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">
                Existem {documents.length} posts nesta categoria.
              </p>
              
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input 
                    type="radio" 
                    name="action" 
                    value="delete"
                    checked={action === 'delete'}
                    onChange={() => setAction('delete')}
                    className="mt-1 w-4 h-4 text-red-600"
                  />
                  <div>
                    <span className="block text-sm font-medium text-gray-900 dark:text-white">Excluir todos os posts</span>
                    <span className="block text-xs text-gray-500">Os posts serão apagados permanentemente junto com a categoria.</span>
                  </div>
                </label>

                {availableTargets.length > 0 && (
                  <label className="flex items-start gap-3 cursor-pointer">
                    <input 
                      type="radio" 
                      name="action" 
                      value="move"
                      checked={action === 'move'}
                      onChange={() => setAction('move')}
                      className="mt-1 w-4 h-4 text-blue-600"
                    />
                    <div className="flex-1">
                      <span className="block text-sm font-medium text-gray-900 dark:text-white">Mover posts para outra categoria</span>
                      <span className="block text-xs text-gray-500 mb-2">Preserva os posts transferindo-os antes de excluir.</span>
                      
                      {action === 'move' && (
                        <select 
                          value={targetCategory}
                          onChange={(e) => setTargetCategory(e.target.value)}
                          className="w-full bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 text-sm rounded-lg px-3 py-2 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecione o destino...</option>
                          {availableTargets.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      )}
                    </div>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 mb-6">Nenhum post encontrado nesta categoria. A exclusão é segura.</p>
          )}

          <div className="flex gap-3 w-full">
            <button
              onClick={onClose}
              disabled={deleting}
              className="flex-1 py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting || (action === 'move' && !targetCategory)}
              className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {deleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  {action === 'move' ? 'Mover e Excluir' : 'Excluir'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
