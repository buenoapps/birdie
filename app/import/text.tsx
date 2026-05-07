import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Platform, StyleSheet, Text, TextInput, View } from 'react-native';

import { ModalScreen } from '@/components/ui/ModalScreen';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { Colors } from '@/constants/theme';
import { useBirdieData } from '@/hooks/use-birdie-data';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { t } from '@/lib/i18n';
import { annotateDuplicates, parse, setStagedImport } from '@/lib/import';

export default function ImportTextScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { family, friends } = useBirdieData();
  const [text, setText] = useState('');

  const onSubmit = () => {
    try {
      const parsed = parse(text);
      setStagedImport(annotateDuplicates(parsed, family, friends));
      router.replace('/import/review' as never);
    } catch (err) {
      Alert.alert(t('screen.settings.importErrorTitle'), String(err));
    }
  };

  return (
    <ModalScreen>
      <Text style={[styles.title, { color: colors.text }]}>{t('screen.import.text.title')}</Text>
      <Text style={[styles.hint, { color: colors.textMuted }]}>{t('screen.import.text.hint')}</Text>
      <View
        style={[styles.inputWrapper, { borderColor: colors.border, backgroundColor: colors.surface }]}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={t('screen.import.text.placeholder')}
          placeholderTextColor={colors.textMuted}
          multiline
          autoCapitalize="none"
          autoCorrect={false}
          spellCheck={false}
          textAlignVertical="top"
          style={[
            styles.input,
            {
              color: colors.text,
              fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
            },
          ]}
        />
      </View>
      <PrimaryButton
        title={t('screen.import.text.submitCta')}
        onPress={onSubmit}
        disabled={text.trim().length === 0}
      />
    </ModalScreen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 24, fontWeight: '800' },
  hint: { fontSize: 14, lineHeight: 20 },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: 14,
    minHeight: 320,
    padding: 12,
  },
  input: {
    fontSize: 14,
    lineHeight: 20,
    minHeight: 296,
  },
});
