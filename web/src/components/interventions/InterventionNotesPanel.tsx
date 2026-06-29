/*
 * Ce fichier declare la section des notes internes d'une intervention GarageFlow.
 * Il existe pour permettre au garage de consulter, ajouter, modifier et supprimer ses notes.
 * Il communique avec interventionApi.ts et InterventionsPage.
 */
import { useCallback, useEffect, useState } from 'react';
import { createInterventionNote, deleteInterventionNote, getInterventionNotes, updateInterventionNote } from '../../api/interventionApi';
import type { InterventionNote } from '../../types/intervention';
import { formatDateTime, formatUserName } from '../../utils/format';
import { InlineError } from '../feedback/InlineError';
import { LoadingState } from '../feedback/LoadingState';
import { SuccessMessage } from '../feedback/SuccessMessage';
import { ActionButton } from '../ui/ActionButton';
import { FormTextarea } from '../ui/FormTextarea';

interface InterventionNotesPanelProps {
  interventionId: number;
}

/** Ce panneau gere les notes internes qui ne doivent jamais etre visibles par le client. */
export function InterventionNotesPanel({ interventionId }: InterventionNotesPanelProps) {
  const [notes, setNotes] = useState<InterventionNote[]>([]);
  const [newContent, setNewContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadNotes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setNotes(await getInterventionNotes(interventionId));
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger les notes internes.');
    } finally {
      setLoading(false);
    }
  }, [interventionId]);

  useEffect(() => {
    void loadNotes();
  }, [loadNotes]);

  async function handleCreateNote() {
    if (!newContent.trim()) {
      setError('La note interne ne peut pas etre vide.');
      return;
    }

    try {
      setActionId('create');
      setError(null);
      setSuccess(null);
      await createInterventionNote(interventionId, newContent.trim());
      setNewContent('');
      setSuccess('Note interne ajoutee.');
      await loadNotes();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible d ajouter la note interne.');
    } finally {
      setActionId(null);
    }
  }

  async function handleUpdateNote(noteId: number) {
    if (!editingContent.trim()) {
      setError('La note interne ne peut pas etre vide.');
      return;
    }

    try {
      setActionId(`update-${noteId}`);
      setError(null);
      setSuccess(null);
      await updateInterventionNote(interventionId, noteId, editingContent.trim());
      setEditingNoteId(null);
      setEditingContent('');
      setSuccess('Note interne modifiee.');
      await loadNotes();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de modifier la note interne.');
    } finally {
      setActionId(null);
    }
  }

  async function handleDeleteNote(noteId: number) {
    try {
      setActionId(`delete-${noteId}`);
      setError(null);
      setSuccess(null);
      await deleteInterventionNote(interventionId, noteId);
      setSuccess('Note interne supprimee.');
      await loadNotes();
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de supprimer la note interne.');
    } finally {
      setActionId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-md border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="font-semibold text-slate-950">Notes internes</h3>
        <p className="text-sm text-slate-500">Notes internes - non visibles par le client.</p>
      </div>
      <SuccessMessage message={success} />
      <InlineError message={error} />
      {loading ? <LoadingState label="Chargement des notes internes" /> : null}
      {!loading && notes.length === 0 ? <p className="text-sm text-slate-500">Aucune note interne pour cette intervention.</p> : null}
      <div className="space-y-3">
        {notes.map((note) => (
          <article className="rounded-md border border-slate-200 bg-white p-3" key={note.id}>
            {editingNoteId === note.id ? (
              <div className="space-y-3">
                <FormTextarea label="Modifier la note interne" name={`note-${note.id}`} value={editingContent} onChange={(event) => setEditingContent(event.target.value)} />
                <div className="flex flex-wrap gap-2">
                  <ActionButton loading={actionId === `update-${note.id}`} type="button" onClick={() => void handleUpdateNote(note.id)}>Enregistrer</ActionButton>
                  <ActionButton type="button" variant="ghost" onClick={() => { setEditingNoteId(null); setEditingContent(''); }}>Annuler</ActionButton>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-slate-700">{note.contenu}</p>
                <p className="text-xs text-slate-500">{formatUserName(note.auteur)} - {formatDateTime(note.createdAt)}</p>
                <div className="flex flex-wrap gap-2">
                  <ActionButton type="button" variant="secondary" onClick={() => { setEditingNoteId(note.id); setEditingContent(note.contenu); }}>Modifier</ActionButton>
                  <ActionButton loading={actionId === `delete-${note.id}`} type="button" variant="ghost" onClick={() => void handleDeleteNote(note.id)}>Supprimer</ActionButton>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>
      <div className="space-y-3">
        <FormTextarea label="Nouvelle note interne" name={`new-note-${interventionId}`} value={newContent} onChange={(event) => setNewContent(event.target.value)} />
        <ActionButton loading={actionId === 'create'} type="button" onClick={() => void handleCreateNote()}>Ajouter la note</ActionButton>
      </div>
    </section>
  );
}