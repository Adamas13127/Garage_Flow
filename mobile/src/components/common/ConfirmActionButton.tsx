/*
 * Ce fichier declare un bouton d'action avec confirmation dans GarageFlow mobile.
 * Il existe pour eviter qu'un client annule un rendez-vous par erreur.
 * Il communique avec les ecrans de detail et les cartes de rendez-vous.
 */
import { Alert } from 'react-native';
import { AppButton } from '../ui/AppButton';

interface ConfirmActionButtonProps { children: string; confirmMessage: string; confirmTitle: string; loading?: boolean; onConfirm: () => void; variant?: 'primary' | 'secondary'; }

/** Ce bouton demande une confirmation avant d'executer une action sensible. */
export function ConfirmActionButton({ children, confirmMessage, confirmTitle, loading, onConfirm, variant = 'secondary' }: ConfirmActionButtonProps) {
  return <AppButton loading={loading} variant={variant} onPress={() => Alert.alert(confirmTitle, confirmMessage, [{ text: 'Non', style: 'cancel' }, { text: 'Oui', style: 'destructive', onPress: onConfirm }])}>{children}</AppButton>;
}