import { styled, StyledText, StyledTextProps } from 'fluent-styles'

/**
 * PreMeal Typography System
 *
 * This is the centralized Text component for all typography in the app.
 * It automatically maps fontWeight to the correct Plus Jakarta Sans variant.
 *
 * VARIANTS (semantic sizing + weights):
 * - hero: 56px/800 — Large splash text (welcome screens, standout headings)
 * - display: 32px/800 — Very prominent display text
 * - header: 24px/700 — Main section headings
 * - title: 20px/700 — Card titles, modal headers, important blocks
 * - subtitle: 16px/600 — Supporting headings under title
 * - body: 14px/400 — Standard readable content (default)
 * - bodySmall: 12px/400 — Compact supporting copy
 * - label: 14px/600 — Field labels, emphasized UI labels
 * - subLabel: 12px/500 — Helper text, muted metadata
 * - button: 14px/700 — CTA and button labels
 * - metric: 18px/800 — Prominent numbers (prices, totals, stat values)
 * - metric_small: 14px/600 — Smaller prominent numbers
 * - caption: 11px/400 — Tiny support text, chart notes, footnotes
 * - overline: 12px/700 — Small uppercase section markers (e.g., "DELIVERY WINDOW")
 *
 * USAGE EXAMPLES:
 * 1. Use semantic variants wherever they fit:
 *    <Text variant="title">My Card Title</Text>
 *    <Text variant="body">Lorem ipsum...</Text>
 *    <Text variant="button">Post Reply</Text>
 *
 * 2. Override specific properties when needed:
 *    <Text variant="body" color={Colors.textSecondary}>Muted body</Text>
 *    <Text variant="button" fontSize={15}>Larger button</Text>
 *
 * 3. Explicit overrides for special cases (use sparingly):
 *    <Text fontSize={28} fontWeight="800">Very prominent stat</Text>
 *    <Text fontSize={13} color={Colors.textSecondary}>Slightly muted note</Text>
 *
 * NOTES:
 * - fontWeight prop automatically updates fontFamily to match Plus Jakarta Sans variant
 * - fontFamily prop can override the automatic mapping if needed
 * - Explicit fontSize/fontWeight on variants work as overrides without breaking font mapping
 * - Prefer variants over raw typography props for consistency
 */

type TextVariant =
  | 'display'
  | 'header'
  | 'title'
  | 'subtitle'
  | 'body'
  | 'bodySmall'
  | 'label'
  | 'subLabel'
  | 'caption'
  | 'button'
  | 'metric'
  | 'metric_small'
  | 'hero'
  | 'overline'

type AppTextProps = StyledTextProps & {
  variant?: TextVariant
}

const resolveFontFamily = (weight?: string | number) => {
  const value = String(weight || '400')

  if (value === '800') return 'PlusJakartaSans_800ExtraBold'
  if (value === '700' || value === 'bold') return 'PlusJakartaSans_700Bold'
  if (value === '600') return 'PlusJakartaSans_600SemiBold'
  if (value === '500') return 'PlusJakartaSans_500Medium'
  if (value === '300') return 'PlusJakartaSans_300Light'
  return 'PlusJakartaSans_400Regular'
}

const TEXT_VARIANTS: Record<TextVariant, any> = {
  display: {
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
    lineHeight: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    lineHeight: 28,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
  bodySmall: {
    fontSize: 12,
    fontWeight: '400',
    lineHeight: 18,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  subLabel: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 18,
  },
  caption: {
    fontSize: 11,
    fontWeight: '400',
    lineHeight: 16,
  },
  // CTA and button labels
  button: {
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  // Prominent numbers and cycle stats in cards
  metric: {
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
  },
   metric_small: {
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  // Large splash / hero welcome text
  hero: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 64,
    letterSpacing: -1,
  },
  overline: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
}

const Text = styled<AppTextProps>(StyledText, {
  base: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 22,
  },
  variants: {
    variant: (selected: string, options: AppTextProps) => {
      const selectedVariant = (selected || 'body') as TextVariant
      const variantStyle = TEXT_VARIANTS[selectedVariant] || TEXT_VARIANTS.body

      const explicitWeight = options.fontWeight
      const resolvedWeight = String(explicitWeight || variantStyle.fontWeight || '400')

      // An explicit fontSize/lineHeight/letterSpacing prop alongside a
      // variant (e.g. <Text variant="title" fontSize={17}>) must win over
      // the variant's own value — these three are baked into
      // TEXT_VARIANTS rather than being their own `variants` category (the
      // way fontWeight/fontFamily are), so without this they'd silently be
      // discarded: the variant's own value would always render regardless
      // of what the caller passed. Confirmed via the underlying styled()
      // merge order, not a guess.
      return {
        ...variantStyle,
        ...(options.fontSize !== undefined ? { fontSize: options.fontSize } : {}),
        ...(options.lineHeight !== undefined ? { lineHeight: options.lineHeight } : {}),
        ...(options.letterSpacing !== undefined ? { letterSpacing: options.letterSpacing } : {}),
        fontFamily: options.fontFamily || resolveFontFamily(resolvedWeight),
      }
    },

    fontWeight: (selected: string, options: AppTextProps) => {
      const activeVariant = (options.variant as TextVariant) || 'body'
      const variantStyle = TEXT_VARIANTS[activeVariant] || TEXT_VARIANTS.body
      const weight = String(selected || variantStyle.fontWeight || '400')

      return {
        fontWeight: weight as any,
        fontFamily: options.fontFamily || resolveFontFamily(weight),
      }
    },

    fontFamily: (selected: string) => {
      if (!selected) return {}
      return { fontFamily: selected }
    },
  },
})

export { Text }
export type { AppTextProps, TextVariant }