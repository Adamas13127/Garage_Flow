/*
 * Ce fichier declare la page Configuration garage du frontend web GarageFlow.
 * Il existe pour permettre au gerant de modifier son garage, ses prestations, horaires et indisponibilites.
 * Il communique avec les API de gestion garage et les composants de formulaire partages.
 */
import { useCallback, useEffect, useState } from 'react';
import { getMyGarage, updateMyGarage } from '../api/garageApi';
import { createOpeningHour, disableOpeningHour, getOpeningHours, updateOpeningHour } from '../api/openingHourApi';
import { createServicePrestation, disableServicePrestation, getMyGarageServices, updateServicePrestation } from '../api/servicePrestationApi';
import { createUnavailability, deleteUnavailability, getUnavailabilities, updateUnavailability } from '../api/unavailabilityApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { InlineError } from '../components/feedback/InlineError';
import { LoadingState } from '../components/feedback/LoadingState';
import { SuccessMessage } from '../components/feedback/SuccessMessage';
import { ActionButton } from '../components/ui/ActionButton';
import { ConfirmDeleteButton } from '../components/ui/ConfirmDeleteButton';
import { DateTimeInput } from '../components/ui/DateTimeInput';
import { EditableCard } from '../components/ui/EditableCard';
import { FormRow } from '../components/ui/FormRow';
import { FormTextarea } from '../components/ui/FormTextarea';
import { Input } from '../components/ui/Input';
import { PageHeader } from '../components/ui/PageHeader';
import { Select } from '../components/ui/Select';
import { SettingsSection } from '../components/ui/SettingsSection';
import { TimeInput } from '../components/ui/TimeInput';
import { ToggleBadge } from '../components/ui/ToggleBadge';
import type { Garage, GaragePayload, OpeningHour, OpeningHourPayload, ServicePrestation, ServicePrestationPayload, Unavailability, UnavailabilityPayload } from '../types/garage';
import { formatDateTime } from '../utils/format';

const dayOptions = [
  { value: '1', label: 'Lundi' },
  { value: '2', label: 'Mardi' },
  { value: '3', label: 'Mercredi' },
  { value: '4', label: 'Jeudi' },
  { value: '5', label: 'Vendredi' },
  { value: '6', label: 'Samedi' },
  { value: '7', label: 'Dimanche' },
];

const dayLabels: Record<number, string> = { 1: 'Lundi', 2: 'Mardi', 3: 'Mercredi', 4: 'Jeudi', 5: 'Vendredi', 6: 'Samedi', 7: 'Dimanche' };

interface ServiceFormState { nom: string; description: string; dureeMinutes: string; actif: boolean; }
interface OpeningHourFormState { jourSemaine: string; heureDebut: string; heureFin: string; actif: boolean; }
interface UnavailabilityFormState { dateDebut: string; dateFin: string; motif: string; }

const emptyServiceForm: ServiceFormState = { nom: '', description: '', dureeMinutes: '', actif: true };
const emptyOpeningHourForm: OpeningHourFormState = { jourSemaine: '1', heureDebut: '', heureFin: '', actif: true };
const emptyUnavailabilityForm: UnavailabilityFormState = { dateDebut: '', dateFin: '', motif: '' };

/** Cette fonction convertit une prestation API en formulaire editable. */
function serviceToForm(service: ServicePrestation): ServiceFormState {
  return { nom: service.nom, description: service.description ?? '', dureeMinutes: String(service.dureeMinutes), actif: service.actif !== false };
}

/** Cette fonction convertit un horaire API en formulaire editable. */
function openingHourToForm(openingHour: OpeningHour): OpeningHourFormState {
  return { jourSemaine: String(openingHour.jourSemaine), heureDebut: openingHour.heureDebut, heureFin: openingHour.heureFin, actif: openingHour.actif !== false };
}

/** Cette fonction convertit une indisponibilite API en formulaire editable. */
function unavailabilityToForm(unavailability: Unavailability): UnavailabilityFormState {
  return { dateDebut: unavailability.dateDebut.slice(0, 16), dateFin: unavailability.dateFin.slice(0, 16), motif: unavailability.motif ?? '' };
}

/** Cette page orchestre les formulaires de configuration du garage connecte. */
export function GarageSettingsPage() {
  const [garage, setGarage] = useState<Garage | null>(null);
  const [garageForm, setGarageForm] = useState<GaragePayload>({});
  const [services, setServices] = useState<ServicePrestation[]>([]);
  const [openingHours, setOpeningHours] = useState<OpeningHour[]>([]);
  const [unavailabilities, setUnavailabilities] = useState<Unavailability[]>([]);
  const [serviceForm, setServiceForm] = useState<ServiceFormState>(emptyServiceForm);
  const [serviceEdits, setServiceEdits] = useState<Record<number, ServiceFormState>>({});
  const [openingHourForm, setOpeningHourForm] = useState<OpeningHourFormState>(emptyOpeningHourForm);
  const [openingHourEdits, setOpeningHourEdits] = useState<Record<number, OpeningHourFormState>>({});
  const [unavailabilityForm, setUnavailabilityForm] = useState<UnavailabilityFormState>(emptyUnavailabilityForm);
  const [unavailabilityEdits, setUnavailabilityEdits] = useState<Record<number, UnavailabilityFormState>>({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [loadedGarage, loadedServices, loadedOpeningHours, loadedUnavailabilities] = await Promise.all([
        getMyGarage(), getMyGarageServices(), getOpeningHours(), getUnavailabilities(),
      ]);
      setGarage(loadedGarage);
      setGarageForm({ ...loadedGarage });
      setServices(loadedServices);
      setOpeningHours(loadedOpeningHours);
      setUnavailabilities(loadedUnavailabilities);
      setServiceEdits(Object.fromEntries(loadedServices.map((service) => [service.id, serviceToForm(service)])));
      setOpeningHourEdits(Object.fromEntries(loadedOpeningHours.map((hour) => [hour.id, openingHourToForm(hour)])));
      setUnavailabilityEdits(Object.fromEntries(loadedUnavailabilities.map((item) => [item.id, unavailabilityToForm(item)])));
    } catch (exception) {
      setError(exception instanceof Error ? exception.message : 'Impossible de charger la configuration du garage.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadSettings(); }, [loadSettings]);

  async function runAction(key: string, task: () => Promise<void>, successMessage: string) {
    try {
      setSavingKey(key);
      setActionError(null);
      setSuccess(null);
      await task();
      setSuccess(successMessage);
      await loadSettings();
    } catch (exception) {
      setActionError(exception instanceof Error ? exception.message : 'Action impossible pour le moment.');
    } finally {
      setSavingKey(null);
    }
  }

  function validateService(form: ServiceFormState): ServicePrestationPayload | string {
    const dureeMinutes = Number(form.dureeMinutes);
    if (!form.nom.trim()) return 'Le nom de la prestation est obligatoire.';
    if (!Number.isFinite(dureeMinutes) || dureeMinutes <= 0) return 'La duree doit etre superieure a 0.';
    return { nom: form.nom.trim(), description: form.description.trim() || null, dureeMinutes, actif: form.actif };
  }

  function validateOpeningHour(form: OpeningHourFormState): OpeningHourPayload | string {
    const jourSemaine = Number(form.jourSemaine);
    if (jourSemaine < 1 || jourSemaine > 7) return 'Le jour doit etre compris entre 1 et 7.';
    if (!form.heureDebut || !form.heureFin) return 'Les heures de debut et de fin sont obligatoires.';
    if (form.heureDebut >= form.heureFin) return 'L heure de debut doit etre avant l heure de fin.';
    return { jourSemaine, heureDebut: form.heureDebut, heureFin: form.heureFin, actif: form.actif };
  }

  function validateUnavailability(form: UnavailabilityFormState): UnavailabilityPayload | string {
    if (!form.dateDebut || !form.dateFin) return 'Les dates de debut et de fin sont obligatoires.';
    if (form.dateDebut >= form.dateFin) return 'La date de debut doit etre avant la date de fin.';
    return { dateDebut: form.dateDebut, dateFin: form.dateFin, motif: form.motif.trim() || null };
  }

  if (loading) return <LoadingState label="Chargement de la configuration garage" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Configuration garage" description="Informations, prestations, horaires et indisponibilites du garage connecte." />
      <SuccessMessage message={success} />
      <InlineError message={actionError} />
      {error ? <ErrorState message={error} /> : null}

      <SettingsSection title="Informations du garage" description="Ces informations decrivent le garage dans l'application.">
        {garage ? (
          <div className="space-y-4">
            <FormRow>
              <Input label="Nom" name="nom" value={garageForm.nom ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, nom: event.target.value }))} />
              <Input label="Email" name="email" type="email" value={garageForm.email ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, email: event.target.value }))} />
            </FormRow>
            <FormRow>
              <Input label="Telephone" name="telephone" value={garageForm.telephone ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, telephone: event.target.value }))} />
              <Input label="Logo URL" name="logoUrl" value={garageForm.logoUrl ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, logoUrl: event.target.value }))} />
            </FormRow>
            <FormRow>
              <Input label="Adresse" name="adresse" value={garageForm.adresse ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, adresse: event.target.value }))} />
              <Input label="Ville" name="ville" value={garageForm.ville ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, ville: event.target.value }))} />
            </FormRow>
            <Input label="Code postal" name="codePostal" value={garageForm.codePostal ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, codePostal: event.target.value }))} />
            <FormTextarea label="Description" name="description" value={garageForm.description ?? ''} onChange={(event) => setGarageForm((current) => ({ ...current, description: event.target.value }))} />
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700"><input checked={garageForm.actif !== false} type="checkbox" onChange={(event) => setGarageForm((current) => ({ ...current, actif: event.target.checked }))} /> Garage actif</label>
            <ActionButton loading={savingKey === 'garage'} type="button" onClick={() => void runAction('garage', async () => { await updateMyGarage(garageForm); }, 'Les informations du garage ont ete enregistrees.')}>Enregistrer</ActionButton>
          </div>
        ) : <EmptyState title="Garage introuvable" description="Aucun garage n'a ete renvoye par l'API." />}
      </SettingsSection>

      <SettingsSection title="Prestations" description="Services proposes par le garage aux clients.">
        <div className="space-y-4">
          <FormRow>
            <Input label="Nom de la prestation" name="serviceNom" value={serviceForm.nom} onChange={(event) => setServiceForm((current) => ({ ...current, nom: event.target.value }))} />
            <Input label="Duree en minutes" name="serviceDuree" type="number" min="1" value={serviceForm.dureeMinutes} onChange={(event) => setServiceForm((current) => ({ ...current, dureeMinutes: event.target.value }))} />
          </FormRow>
          <FormTextarea label="Description prestation" name="serviceDescription" value={serviceForm.description} onChange={(event) => setServiceForm((current) => ({ ...current, description: event.target.value }))} />
          <ActionButton loading={savingKey === 'service-create'} type="button" onClick={() => {
            const payload = validateService(serviceForm); if (typeof payload === 'string') { setActionError(payload); return; }
            void runAction('service-create', async () => { await createServicePrestation(payload); setServiceForm(emptyServiceForm); }, 'La prestation a ete creee.');
          }}>Creer la prestation</ActionButton>
          {services.length === 0 ? <EmptyState title="Aucune prestation" description="Ajoutez une premiere prestation pour le garage." /> : null}
          <div className="space-y-3">
            {services.map((service) => {
              const form = serviceEdits[service.id] ?? serviceToForm(service);
              return (
                <EditableCard key={service.id} title={service.nom} subtitle={`${service.dureeMinutes} minutes`} actions={<><ToggleBadge active={service.actif} /><ConfirmDeleteButton label="Desactiver" loading={savingKey === `service-disable-${service.id}`} onConfirm={() => void runAction(`service-disable-${service.id}`, async () => { await disableServicePrestation(service.id); }, 'La prestation a ete desactivee.')} /></>}>
                  <div className="space-y-3">
                    <FormRow>
                      <Input label="Nom" name={`service-name-${service.id}`} value={form.nom} onChange={(event) => setServiceEdits((current) => ({ ...current, [service.id]: { ...form, nom: event.target.value } }))} />
                      <Input label="Duree" name={`service-duration-${service.id}`} type="number" min="1" value={form.dureeMinutes} onChange={(event) => setServiceEdits((current) => ({ ...current, [service.id]: { ...form, dureeMinutes: event.target.value } }))} />
                    </FormRow>
                    <FormTextarea label="Description" name={`service-description-${service.id}`} value={form.description} onChange={(event) => setServiceEdits((current) => ({ ...current, [service.id]: { ...form, description: event.target.value } }))} />
                    <ActionButton loading={savingKey === `service-update-${service.id}`} type="button" onClick={() => { const payload = validateService(form); if (typeof payload === 'string') { setActionError(payload); return; } void runAction(`service-update-${service.id}`, async () => { await updateServicePrestation(service.id, payload); }, 'La prestation a ete modifiee.'); }}>Modifier la prestation</ActionButton>
                  </div>
                </EditableCard>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Horaires" description="Plages d'ouverture hebdomadaires du garage.">
        <div className="space-y-4">
          <FormRow>
            <Select label="Jour" name="openingDay" options={dayOptions} value={openingHourForm.jourSemaine} onChange={(event) => setOpeningHourForm((current) => ({ ...current, jourSemaine: event.target.value }))} />
            <TimeInput label="Heure debut" name="openingStart" value={openingHourForm.heureDebut} onChange={(event) => setOpeningHourForm((current) => ({ ...current, heureDebut: event.target.value }))} />
          </FormRow>
          <TimeInput label="Heure fin" name="openingEnd" value={openingHourForm.heureFin} onChange={(event) => setOpeningHourForm((current) => ({ ...current, heureFin: event.target.value }))} />
          <ActionButton loading={savingKey === 'opening-create'} type="button" onClick={() => { const payload = validateOpeningHour(openingHourForm); if (typeof payload === 'string') { setActionError(payload); return; } void runAction('opening-create', async () => { await createOpeningHour(payload); setOpeningHourForm(emptyOpeningHourForm); }, 'La plage horaire a ete creee.'); }}>Creer la plage horaire</ActionButton>
          {openingHours.length === 0 ? <EmptyState title="Aucun horaire" description="Ajoutez une plage horaire d'ouverture." /> : null}
          <div className="space-y-3">
            {openingHours.map((hour) => {
              const form = openingHourEdits[hour.id] ?? openingHourToForm(hour);
              return (
                <EditableCard key={hour.id} title={dayLabels[hour.jourSemaine] ?? `Jour ${hour.jourSemaine}`} subtitle={`${hour.heureDebut} - ${hour.heureFin}`} actions={<><ToggleBadge active={hour.actif} /><ConfirmDeleteButton label="Desactiver" loading={savingKey === `opening-disable-${hour.id}`} onConfirm={() => void runAction(`opening-disable-${hour.id}`, async () => { await disableOpeningHour(hour.id); }, 'La plage horaire a ete desactivee.')} /></>}>
                  <div className="grid gap-3 md:grid-cols-3">
                    <Select label="Jour" name={`opening-day-${hour.id}`} options={dayOptions} value={form.jourSemaine} onChange={(event) => setOpeningHourEdits((current) => ({ ...current, [hour.id]: { ...form, jourSemaine: event.target.value } }))} />
                    <TimeInput label="Heure debut" name={`opening-start-${hour.id}`} value={form.heureDebut} onChange={(event) => setOpeningHourEdits((current) => ({ ...current, [hour.id]: { ...form, heureDebut: event.target.value } }))} />
                    <TimeInput label="Heure fin" name={`opening-end-${hour.id}`} value={form.heureFin} onChange={(event) => setOpeningHourEdits((current) => ({ ...current, [hour.id]: { ...form, heureFin: event.target.value } }))} />
                  </div>
                  <ActionButton className="mt-3" loading={savingKey === `opening-update-${hour.id}`} type="button" onClick={() => { const payload = validateOpeningHour(form); if (typeof payload === 'string') { setActionError(payload); return; } void runAction(`opening-update-${hour.id}`, async () => { await updateOpeningHour(hour.id, payload); }, 'La plage horaire a ete modifiee.'); }}>Modifier la plage horaire</ActionButton>
                </EditableCard>
              );
            })}
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Indisponibilites" description="Periodes pendant lesquelles le garage ne prend pas de rendez-vous.">
        <div className="space-y-4">
          <FormRow>
            <DateTimeInput label="Date debut" name="unavailabilityStart" value={unavailabilityForm.dateDebut} onChange={(event) => setUnavailabilityForm((current) => ({ ...current, dateDebut: event.target.value }))} />
            <DateTimeInput label="Date fin" name="unavailabilityEnd" value={unavailabilityForm.dateFin} onChange={(event) => setUnavailabilityForm((current) => ({ ...current, dateFin: event.target.value }))} />
          </FormRow>
          <Input label="Motif" name="unavailabilityMotif" value={unavailabilityForm.motif} onChange={(event) => setUnavailabilityForm((current) => ({ ...current, motif: event.target.value }))} />
          <ActionButton loading={savingKey === 'unavailability-create'} type="button" onClick={() => { const payload = validateUnavailability(unavailabilityForm); if (typeof payload === 'string') { setActionError(payload); return; } void runAction('unavailability-create', async () => { await createUnavailability(payload); setUnavailabilityForm(emptyUnavailabilityForm); }, 'L indisponibilite a ete creee.'); }}>Creer l'indisponibilite</ActionButton>
          {unavailabilities.length === 0 ? <EmptyState title="Aucune indisponibilite" description="Ajoutez les fermetures exceptionnelles ou indisponibilites du garage." /> : null}
          <div className="space-y-3">
            {unavailabilities.map((item) => {
              const form = unavailabilityEdits[item.id] ?? unavailabilityToForm(item);
              return (
                <EditableCard key={item.id} title={item.motif ?? 'Indisponibilite'} subtitle={`${formatDateTime(item.dateDebut)} - ${formatDateTime(item.dateFin)}`} actions={<ConfirmDeleteButton label="Supprimer" loading={savingKey === `unavailability-delete-${item.id}`} onConfirm={() => void runAction(`unavailability-delete-${item.id}`, async () => { await deleteUnavailability(item.id); }, 'L indisponibilite a ete supprimee.')} />}>
                  <div className="space-y-3">
                    <FormRow>
                      <DateTimeInput label="Date debut" name={`unavailability-start-${item.id}`} value={form.dateDebut} onChange={(event) => setUnavailabilityEdits((current) => ({ ...current, [item.id]: { ...form, dateDebut: event.target.value } }))} />
                      <DateTimeInput label="Date fin" name={`unavailability-end-${item.id}`} value={form.dateFin} onChange={(event) => setUnavailabilityEdits((current) => ({ ...current, [item.id]: { ...form, dateFin: event.target.value } }))} />
                    </FormRow>
                    <Input label="Motif" name={`unavailability-motif-${item.id}`} value={form.motif} onChange={(event) => setUnavailabilityEdits((current) => ({ ...current, [item.id]: { ...form, motif: event.target.value } }))} />
                    <ActionButton loading={savingKey === `unavailability-update-${item.id}`} type="button" onClick={() => { const payload = validateUnavailability(form); if (typeof payload === 'string') { setActionError(payload); return; } void runAction(`unavailability-update-${item.id}`, async () => { await updateUnavailability(item.id, payload); }, 'L indisponibilite a ete modifiee.'); }}>Modifier l'indisponibilite</ActionButton>
                  </div>
                </EditableCard>
              );
            })}
          </div>
        </div>
      </SettingsSection>
    </div>
  );
}