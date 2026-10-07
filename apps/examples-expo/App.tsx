import { useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Clipboard from 'expo-clipboard';
import { SignaturePad, type SignaturePadHandle } from 'signetpad/react-native-svg';
import type { SignatureData, SignatureSnapshot } from 'signetpad';

const VIEWPORT = { width: 720, height: 300 };
const STROKE_COLORS = ['#102935', '#b94d29', '#167769', '#2b67d1', '#111111'] as const;
const STROKE_WIDTHS = [1, 2, 3, 4, 6, 8] as const;
const PAD_WIDTH = Math.min(Dimensions.get('window').width - 68, VIEWPORT.width);
const PAD_HEIGHT = PAD_WIDTH * (VIEWPORT.height / VIEWPORT.width);

const SAMPLE_SIGNATURE: SignatureData = {
  version: 1,
  viewport: VIEWPORT,
  strokes: [
    {
      id: 'sample-signature',
      style: { color: '#102935', width: 3, opacity: 1, cap: 'round', join: 'round' },
      points: [
        { x: 80, y: 170, time: 0 },
        { x: 128, y: 98, time: 12 },
        { x: 170, y: 193, time: 24 },
        { x: 220, y: 115, time: 36 },
        { x: 272, y: 177, time: 48 },
        { x: 330, y: 128, time: 60 },
        { x: 405, y: 157, time: 72 },
        { x: 502, y: 110, time: 84 },
        { x: 610, y: 154, time: 96 },
      ],
    },
  ],
};

const EMPTY_SNAPSHOT: SignatureSnapshot = {
  revision: 0,
  isEmpty: true,
  isDrawing: false,
  strokeCount: 0,
  canUndo: false,
  canRedo: false,
  bounds: null,
};

export default function App() {
  const [typedName, setTypedName] = useState('');
  const [strokeColor, setStrokeColor] = useState<(typeof STROKE_COLORS)[number]>('#102935');
  const [strokeWidth, setStrokeWidth] = useState<(typeof STROKE_WIDTHS)[number]>(3);
  const [showData, setShowData] = useState(false);
  const [status, setStatus] = useState('Ready for a signature.');
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const padRef = useRef<SignaturePadHandle>(null);

  const signatureData = useMemo(
    () =>
      JSON.stringify(
        padRef.current?.toData() ?? { version: 1, viewport: VIEWPORT, strokes: [] },
        null,
        2,
      ),
    [snapshot.revision],
  );

  const handleClear = () => {
    padRef.current?.clear();
    setStatus('Signature cleared.');
  };

  const handleLoadSample = () => {
    padRef.current?.loadData(SAMPLE_SIGNATURE);
    setStatus('Sample signature loaded.');
  };

  const handleCopyData = async () => {
    if (snapshot.isEmpty) return;
    await Clipboard.setStringAsync(signatureData);
    setStatus('Signature data copied.');
  };

  const handleShareSvg = async () => {
    if (snapshot.isEmpty) return;
    const svg = padRef.current?.toSvg();
    if (!svg) return;
    await Share.share({ message: svg, title: 'signature.svg' });
    setStatus('SVG ready to share.');
  };

  const handlePrepare = () => {
    if (snapshot.isEmpty && !typedName.trim()) {
      setStatus('Draw a signature or enter the signatory name.');
      return;
    }

    setStatus(
      snapshot.isEmpty ? 'Typed signature is ready to submit.' : 'Signature is ready to submit.',
    );
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.page} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>SignetPad</Text>
          <Text style={styles.badge}>Expo + SVG example</Text>
        </View>

        <Text style={styles.title}>A signature field with the details people notice.</Text>
        <Text style={styles.lede}>
          Draw, adjust the next stroke, inspect the vector payload, or use the typed alternative.
          Native export uses SVG.
        </Text>

        <View style={styles.card}>
          <Text style={styles.legend}>Your signature</Text>
          <Text style={styles.help}>
            Draw with a finger or stylus. Use the actions below to correct a stroke.
          </Text>

          <View style={styles.canvasFrame}>
            <SignaturePad
              ref={padRef}
              accessibilityLabel="Signature drawing area"
              viewport={VIEWPORT}
              stroke={{ color: strokeColor, width: strokeWidth }}
              onSnapshot={setSnapshot}
              style={[styles.signaturePad, { width: PAD_WIDTH, height: PAD_HEIGHT }]}
            />
          </View>

          <View style={styles.toolbar}>
            <ActionButton
              label="Undo"
              disabled={!snapshot.canUndo}
              onPress={() => {
                padRef.current?.undo();
              }}
            />
            <ActionButton
              label="Redo"
              disabled={!snapshot.canRedo}
              onPress={() => {
                padRef.current?.redo();
              }}
            />
            <ActionButton label="Clear" disabled={snapshot.isEmpty} onPress={handleClear} />
            <Text style={styles.strokeCount}>
              {snapshot.strokeCount} {snapshot.strokeCount === 1 ? 'stroke' : 'strokes'}
            </Text>
          </View>

          <Text style={styles.label}>Type the signatory name instead</Text>
          <Text style={styles.help}>Use this option when drawing is not convenient.</Text>
          <TextInput
            value={typedName}
            onChangeText={setTypedName}
            autoComplete="name"
            placeholder="Signatory name"
            placeholderTextColor="#5e7077"
            style={styles.textInput}
          />

          <Text style={styles.status}>{status}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={handlePrepare}
            style={({ pressed }) => [styles.saveButton, pressed && styles.pressed]}
          >
            <Text style={styles.saveButtonText}>Prepare signature</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.panelTitle}>Adjust, inspect, reuse.</Text>

          <Text style={styles.label}>Next stroke color</Text>
          <View style={styles.swatchRow}>
            {STROKE_COLORS.map((color) => (
              <Pressable
                key={color}
                accessibilityRole="button"
                accessibilityLabel={`Stroke color ${color}`}
                onPress={() => setStrokeColor(color)}
                style={[
                  styles.swatch,
                  { backgroundColor: color },
                  strokeColor === color && styles.swatchSelected,
                ]}
              />
            ))}
          </View>
          <Text style={styles.code}>{strokeColor}</Text>

          <Text style={styles.label}>Stroke width {strokeWidth}px</Text>
          <View style={styles.swatchRow}>
            {STROKE_WIDTHS.map((width) => (
              <Pressable
                key={width}
                accessibilityRole="button"
                accessibilityLabel={`Stroke width ${width}`}
                onPress={() => setStrokeWidth(width)}
                style={[styles.widthChip, strokeWidth === width && styles.widthChipSelected]}
              >
                <Text style={styles.widthChipText}>{width}</Text>
              </Pressable>
            ))}
          </View>

          <ActionButton label="Load sample" onPress={handleLoadSample} fullWidth />
          <ActionButton
            label={showData ? 'Hide data' : 'View data'}
            onPress={() => setShowData((value) => !value)}
            fullWidth
          />
          <ActionButton
            label="Copy JSON"
            disabled={snapshot.isEmpty}
            onPress={handleCopyData}
            fullWidth
          />
          <ActionButton
            label="Share SVG"
            disabled={snapshot.isEmpty}
            onPress={handleShareSvg}
            fullWidth
          />

          {showData ? (
            <ScrollView horizontal style={styles.dataPreview}>
              <Text style={styles.dataPreviewText}>{signatureData}</Text>
            </ScrollView>
          ) : null}

          <Text style={styles.note}>
            Style applies to new strokes. Saved signatures remain intact. React Native exports SVG
            through toSvg().
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({
  label,
  onPress,
  disabled = false,
  fullWidth = false,
}: {
  label: string;
  onPress: () => unknown;
  disabled?: boolean;
  fullWidth?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        fullWidth && styles.buttonFull,
        disabled && styles.buttonDisabled,
        pressed && !disabled && styles.pressed,
      ]}
    >
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#f7f6f2',
  },
  page: {
    paddingTop: 56,
    paddingHorizontal: 16,
    paddingBottom: 48,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(16, 41, 53, 0.12)',
  },
  brand: {
    color: '#102935',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  badge: {
    color: '#5e7077',
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    color: '#102935',
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -1.2,
    lineHeight: 38,
    marginTop: 12,
  },
  lede: {
    color: '#49606a',
    fontSize: 16,
    lineHeight: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#d9e1da',
    padding: 18,
    gap: 12,
  },
  legend: {
    color: '#102935',
    fontSize: 18,
    fontWeight: '700',
  },
  panelTitle: {
    color: '#102935',
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  help: {
    color: '#49606a',
    fontSize: 13,
    lineHeight: 20,
  },
  canvasFrame: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d9e1da',
    backgroundColor: '#eff3ef',
    padding: 8,
  },
  signaturePad: {
    borderRadius: 10,
    backgroundColor: '#fcfdfb',
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 8,
  },
  strokeCount: {
    marginLeft: 'auto',
    color: '#5e7077',
    fontSize: 12,
    fontVariant: ['tabular-nums'],
  },
  label: {
    color: '#102935',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  textInput: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: '#bdc9c0',
    borderRadius: 10,
    paddingHorizontal: 12,
    color: '#102935',
    backgroundColor: '#ffffff',
    fontSize: 16,
  },
  status: {
    color: '#49606a',
    fontSize: 13,
    minHeight: 20,
  },
  saveButton: {
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: '#102935',
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  swatch: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: {
    borderColor: '#b94d29',
  },
  code: {
    color: '#49606a',
    fontFamily: 'monospace',
    fontSize: 12,
  },
  widthChip: {
    minWidth: 40,
    minHeight: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bdc9c0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    paddingHorizontal: 10,
  },
  widthChipSelected: {
    borderColor: '#102935',
    backgroundColor: '#eff3ef',
  },
  widthChipText: {
    color: '#102935',
    fontSize: 13,
    fontWeight: '700',
  },
  button: {
    minHeight: 40,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bdc9c0',
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonFull: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  buttonText: {
    color: '#49606a',
    fontSize: 13,
    fontWeight: '700',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  dataPreview: {
    maxHeight: 220,
    borderRadius: 10,
    backgroundColor: '#101d28',
    padding: 12,
  },
  dataPreviewText: {
    color: '#dbe7ed',
    fontFamily: 'monospace',
    fontSize: 11,
    lineHeight: 18,
  },
  note: {
    color: '#49606a',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
});
