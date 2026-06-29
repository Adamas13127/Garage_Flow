/*
 * Ce fichier declare l'ecran des vehicules client mobile GarageFlow.
 * Il existe pour afficher, creer, modifier et supprimer les vehicules du client connecte.
 * Il communique avec vehicleApi.ts et VehicleCard.
 */
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text } from 'react-native';
import { createVehicle, deleteVehicle, getVehicles, updateVehicle } from '../api/vehicleApi';
import { EmptyState } from '../components/feedback/EmptyState';
import { ErrorState } from '../components/feedback/ErrorState';
import { LoadingState } from '../components/feedback/LoadingState';
import { FormSection } from '../components/layout/FormSection';
import { ScreenContainer } from '../components/layout/ScreenContainer';
import { AppButton } from '../components/ui/AppButton';
import { AppInput } from '../components/ui/AppInput';
import { VehicleCard } from '../components/vehicles/VehicleCard';
import type { Vehicle, VehiclePayload } from '../types/vehicle';
import { colors } from '../utils/theme';

interface VehicleFormState { marque: string; modele: string; plaqueImmatriculation: string; kilometrage: string; annee: string; carburant: string; }
const emptyForm: VehicleFormState = { marque: '', modele: '', plaqueImmatriculation: '', kilometrage: '', annee: '', carburant: '' };

/** Cette fonction transforme un vehicule en formulaire editable. */
function vehicleToForm(vehicle: Vehicle): VehicleFormState { return { marque: vehicle.marque ?? '', modele: vehicle.modele ?? '', plaqueImmatriculation: vehicle.plaqueImmatriculation ?? vehicle.immatriculation ?? '', kilometrage: vehicle.kilometrage != null ? String(vehicle.kilometrage) : '', annee: vehicle.annee != null ? String(vehicle.annee) : '', carburant: vehicle.carburant ?? '' }; }

/** Cette page gere les vehicules du client avec validation minimale. */
export function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [form, setForm] = useState<VehicleFormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadVehicles = useCallback(async () => { try { setLoading(true); setError(null); setVehicles(await getVehicles()); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de charger les vehicules.'); } finally { setLoading(false); } }, []);
  useEffect(() => { void loadVehicles(); }, [loadVehicles]);

  function validateVehicle(): VehiclePayload | string {
    const kilometrage = form.kilometrage ? Number(form.kilometrage) : null;
    const annee = form.annee ? Number(form.annee) : null;
    const currentYear = new Date().getFullYear() + 1;
    if (!form.marque.trim()) return 'La marque est obligatoire.';
    if (!form.modele.trim()) return 'Le modele est obligatoire.';
    if (!form.plaqueImmatriculation.trim()) return 'La plaque est obligatoire.';
    if (kilometrage != null && (!Number.isFinite(kilometrage) || kilometrage < 0)) return 'Le kilometrage doit etre positif.';
    if (annee != null && (!Number.isFinite(annee) || annee < 1900 || annee > currentYear)) return 'L annee du vehicule est incoherente.';
    return { marque: form.marque.trim(), modele: form.modele.trim(), plaqueImmatriculation: form.plaqueImmatriculation.trim(), kilometrage, annee, carburant: form.carburant.trim() || null };
  }

  async function handleSubmit() {
    const payload = validateVehicle();
    if (typeof payload === 'string') { setError(payload); return; }
    try { setSaving(true); setError(null); setSuccess(null); if (editingId) await updateVehicle(editingId, payload); else await createVehicle(payload); setSuccess(editingId ? 'Vehicule modifie.' : 'Vehicule ajoute.'); setEditingId(null); setForm(emptyForm); await loadVehicles(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible d enregistrer le vehicule.'); } finally { setSaving(false); }
  }

  function handleEdit(vehicle: Vehicle) { setEditingId(vehicle.id); setForm(vehicleToForm(vehicle)); setSuccess(null); }
  function handleDelete(vehicle: Vehicle) { Alert.alert('Supprimer le vehicule', 'Confirmer la suppression ?', [{ text: 'Non' }, { text: 'Oui', onPress: () => void runDelete(vehicle.id) }]); }
  async function runDelete(id: number) { try { setError(null); await deleteVehicle(id); setSuccess('Vehicule supprime.'); await loadVehicles(); } catch (exception) { setError(exception instanceof Error ? exception.message : 'Impossible de supprimer le vehicule.'); } }

  return <ScreenContainer><Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Mes vehicules</Text>{success ? <Text style={{ color: colors.success, fontWeight: '700' }}>{success}</Text> : null}{error ? <ErrorState message={error} /> : null}<FormSection title={editingId ? 'Modifier le vehicule' : 'Ajouter un vehicule'}><AppInput label="Marque" value={form.marque} onChangeText={(value) => setForm((current) => ({ ...current, marque: value }))} /><AppInput label="Modele" value={form.modele} onChangeText={(value) => setForm((current) => ({ ...current, modele: value }))} /><AppInput label="Plaque" value={form.plaqueImmatriculation} onChangeText={(value) => setForm((current) => ({ ...current, plaqueImmatriculation: value }))} /><AppInput label="Kilometrage" keyboardType="numeric" value={form.kilometrage} onChangeText={(value) => setForm((current) => ({ ...current, kilometrage: value }))} /><AppInput label="Annee" keyboardType="numeric" value={form.annee} onChangeText={(value) => setForm((current) => ({ ...current, annee: value }))} /><AppInput label="Carburant" value={form.carburant} onChangeText={(value) => setForm((current) => ({ ...current, carburant: value }))} /><AppButton loading={saving} onPress={() => void handleSubmit()}>{editingId ? 'Modifier le vehicule' : 'Ajouter le vehicule'}</AppButton>{editingId ? <AppButton variant="secondary" onPress={() => { setEditingId(null); setForm(emptyForm); }}>Annuler la modification</AppButton> : null}</FormSection>{loading ? <LoadingState /> : null}{!loading && vehicles.length === 0 ? <EmptyState title="Aucun vehicule" message="Ajoutez votre premier vehicule pour reserver un rendez-vous." /> : null}{vehicles.map((vehicle) => <VehicleCard key={vehicle.id} vehicle={vehicle} onEdit={() => handleEdit(vehicle)} onDelete={() => handleDelete(vehicle)} />)}</ScreenContainer>;
}