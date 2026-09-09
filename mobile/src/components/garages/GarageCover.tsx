/*
 * Ce fichier declare une couverture visuelle pour les garages GarageFlow mobile.
 * Il existe pour donner un repere marketplace meme sans vraie image envoyee par l'API.
 * Il communique avec les cartes garage et l'ecran detail garage.
 */
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { colors, spacing } from '../../utils/theme';

interface GarageCoverProps {
  name: string;
  large?: boolean;
}

const GRADIENT_BANDS = 6;
const GRADIENT_SATURATION = 50;
const GRADIENT_TOP_LIGHTNESS = 30;
const GRADIENT_BOTTOM_LIGHTNESS = 18;

/** Cette fonction derive une teinte stable du nom pour que deux garages different visuellement. */
function hashHue(name: string): number {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = (hash * 31 + name.charCodeAt(index)) % 360;
  }
  return hash < 0 ? hash + 360 : hash;
}

function hslToHex(hue: number, saturationPercent: number, lightnessPercent: number): string {
  const s = saturationPercent / 100;
  const l = lightnessPercent / 100;
  const k = (n: number) => (n + hue / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (n: number) => Math.round(255 * f(n)).toString(16).padStart(2, '0');
  return `#${toHex(0)}${toHex(8)}${toHex(4)}`;
}

/**
 * Ces bandes simulent un degrade sans dependance externe : une teinte issue du nom du garage,
 * a saturation et luminosite fixes pour garantir un contraste texte blanc >= 4,5:1 (verifie
 * sur toutes les teintes possibles entre 18% et 30% de luminosite a 50% de saturation).
 */
function getGradientBands(name: string): string[] {
  const hue = hashHue(name || 'GarageFlow');
  return Array.from({ length: GRADIENT_BANDS }, (_, index) => {
    const ratio = index / (GRADIENT_BANDS - 1);
    const lightness = GRADIENT_TOP_LIGHTNESS + (GRADIENT_BOTTOM_LIGHTNESS - GRADIENT_TOP_LIGHTNESS) * ratio;
    return hslToHex(hue, GRADIENT_SATURATION, lightness);
  });
}

/** Cette couverture simule une image d'atelier propre tant que le backend ne fournit pas de photo. */
export function GarageCover({ large, name }: GarageCoverProps) {
  const initials = name.split(' ').filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('') || 'GF';
  const bands = getGradientBands(name);
  return (
    <View style={[styles.cover, large && styles.large]}>
      <View style={styles.bands}>
        {bands.map((color, index) => (
          <View key={`${color}-${index}`} style={[styles.band, { backgroundColor: color }]} />
        ))}
      </View>
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{initials}</Text>
          </View>
          <Text style={styles.available}>Ouvert</Text>
        </View>
        <Ionicons color="rgba(255,255,255,0.85)" name="build-outline" size={large ? 34 : 26} />
        <Text style={styles.label}>Atelier partenaire</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  available: { backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 12, color: colors.primaryDark, fontSize: 11, fontWeight: '900', paddingHorizontal: spacing.sm, paddingVertical: spacing.xs },
  band: { flex: 1 },
  bands: { bottom: 0, flexDirection: 'column', left: 0, position: 'absolute', right: 0, top: 0 },
  badge: { alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 20, height: 40, justifyContent: 'center', width: 40 },
  badgeText: { color: colors.primaryDark, fontSize: 13, fontWeight: '900' },
  content: { flex: 1, gap: spacing.sm, justifyContent: 'space-between', padding: spacing.md },
  cover: { borderRadius: 8, minHeight: 88, overflow: 'hidden', position: 'relative' },
  label: { color: '#fff', fontSize: 12, fontWeight: '900' },
  large: { minHeight: 136 },
  topRow: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
});
