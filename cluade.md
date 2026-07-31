# Fluent Styles

A comprehensive, TypeScript-first React Native UI library providing production-ready components, hooks, and an imperative service layer — all powered by a portal-based rendering system.

[![npm version](https://img.shields.io/npm/v/fluent-styles)](https://www.npmjs.com/package/fluent-styles)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

---

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Portal System](#portal-system)
- [Components](#components)
  - [StyledButton](#styledbutton)
  - [StyledTextInput](#styledtextinput)
  - [Switch](#switch)
  - [StyledCheckBox](#styledcheckbox)
  - [StyledCard](#styledcard)
  - [StyledBadge / BadgeWithIcon](#styledbadge--badgewithicon)
  - [StyledImage / StyledImageBackground](#styledimage--styledimagebackground)
  - [StyledHeader](#styledheader)
  - [StyledForm](#styledform)
  - [StyledDropdown / StyledMultiSelectDropdown](#styleddropdown--styledmultiselectdropdown)
  - [Popup](#popup)
  - [Drawer](#drawer)
  - [Collapse / CollapseGroup](#collapse--collapsegroup)
  - [TabBar](#tabbar)
  - [StyledDivider](#styleddivider)
  - [StyledSeperator](#styledseperator)
  - [Stack](#stack)
  - [StyledText](#styledtext)
  - [StyledPressable](#styledpressable)
  - [StyledPage / StyledScrollView](#styledpage--styledscrollview)
  - [StyledSafeAreaView](#styledsafeareaview)
  - [Spacer / StyledSpacer](#spacer--styledspacer)
  - [StyledShape](#styledshape)
  - [Loader](#loader)
  - [StyledCircularProgress](#styledcircularprogress)
  - [StyledChip](#styledchip)
  - [StyledBar](#styledbar)
  - [StyledTimeline](#styledtimeline)
  - [StyledRadio / StyledRadioGroup](#styledradio--styledradiogroup)
  - [StyledProgressBar](#styledprogressbar)
  - [StyledSlider](#styledslider)
  - [StyledDatePicker](#styleddatepicker)
  - [StyledTable](#styledtable)
- [Hooks](#hooks)
  - [useToast](#usetoast)
  - [useNotification](#usenotification)
  - [useDialogue](#usedialogue)
  - [useActionSheet](#useactionsheet)
  - [useLoader](#useloader)
- [Imperative Services](#imperative-services)
  - [toastService](#toastservice)
  - [notificationService](#notificationservice)
  - [dialogueService](#dialogueservice)
  - [actionSheetService](#actionsheetservice)
  - [loaderService](#loaderservice)
- [Theme & Tokens](#theme--tokens)
- [Contributing](#contributing)
- [License](#license)

---

## Installation

```bash
npm install fluent-styles
# or
yarn add fluent-styles
```

Peer dependencies (install separately if not already present):

```bash
npm install react-native-safe-area-context
```

---

## Quick Start

Wrap your root component with `GlobalPortalProvider`. This single wrapper enables **all** portal-based UI — toasts, notifications, loaders, dialogues, drawers, and action sheets.

```tsx
import { GlobalPortalProvider } from 'fluent-styles'

export default function App() {
  return (
    <GlobalPortalProvider>
      <YourNavigator />
    </GlobalPortalProvider>
  )
}
```

If you also use the declarative hooks (`useToast`, `useDialogue`, etc.) inside descendant components, nest a `PortalManager` as well:

```tsx
import { GlobalPortalProvider, PortalManager } from 'fluent-styles'

export default function App() {
  return (
    <GlobalPortalProvider>
      <PortalManager>
        <YourNavigator />z
      </PortalManager>
    </GlobalPortalProvider>
  )
}
```

---

## Portal System

Fluent Styles uses a dual-layer portal architecture:

| Layer | Provider | Use case |
|---|---|---|
| **Global singleton** | `GlobalPortalProvider` | Imperative services (`toastService`, `loaderService`, etc.) — usable outside React |
| **Declarative hooks** | `PortalManager` | Hook APIs (`useToast`, `useDialogue`, etc.) — usable inside React components |

The low-level `portal` singleton is also exported for advanced use:

```ts
import { portal } from 'fluent-styles'

const id = portal.show(<MyWidget />, { position: 'top', backdrop: false })
setTimeout(() => portal.hide(id), 3000)
```

---

## Components

### StyledButton

A fully themed button with variant, shape, size, and icon support.

```tsx
import { StyledButton, theme } from 'fluent-styles'

// Variants (compact style)
<StyledButton primary compact>
  <StyledButton.Text color={theme.colors.white} fontSize={theme.fontSize.small} fontWeight={theme.fontWeight.semiBold}>
    Primary
  </StyledButton.Text>
</StyledButton>
<StyledButton secondary compact>Secondary</StyledButton>
<StyledButton outline compact>Outline</StyledButton>
<StyledButton ghost compact>Ghost</StyledButton>
<StyledButton link compact>Link</StyledButton>
<StyledButton danger compact>Danger</StyledButton>
<StyledButton success compact>Success</StyledButton>
<StyledButton warning compact>Warning</StyledButton>
<StyledButton disabled compact>Disabled</StyledButton>

// Sizes: xs | sm | md | lg | xl
{(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
  <StyledButton key={s} primary compact {...{ [s]: true }}>
    <StyledButton.Text color={theme.colors.white}>{s.toUpperCase()}</StyledButton.Text>
  </StyledButton>
))}

// Shapes
<StyledButton primary compact pill>Pill</StyledButton>
<StyledButton primary compact rounded>Rounded</StyledButton>
<StyledButton backgroundColor={theme.colors.yellow[500]} borderWidth={0} square>Square</StyledButton>

// Icons — left, right, or both
<StyledButton primary compact leftIcon={<Icon emoji="🚀" />}>Deploy</StyledButton>
<StyledButton outline compact rightIcon={<Icon emoji="→" />}>Continue</StyledButton>
<StyledButton secondary compact leftIcon={<Icon emoji="⬇" />} rightIcon={<Icon emoji="📦" />}>
  Download package
</StyledButton>

// Icon-only circular buttons
<StyledButton icon backgroundColor={theme.colors.indigo[500]}><Icon emoji="✉️" size={18} /></StyledButton>
<StyledButton icon backgroundColor={theme.colors.amber[400]}><Icon emoji="🔔" size={18} /></StyledButton>
<StyledButton icon backgroundColor={theme.colors.red[500]}><Icon emoji="🗑️" size={18} /></StyledButton>

// Loading state (async example)
const [loading, setLoading] = useState(false)
<StyledButton primary compact loading={loading} onPress={() => { setLoading(true); setTimeout(() => setLoading(false), 2000) }}>
  <StyledButton.Text color={theme.colors.white}>{loading ? 'Saving…' : 'Save changes'}</StyledButton.Text>
</StyledButton>

// Full-width block
<StyledButton primary block>
  <StyledButton.Text color={theme.colors.white} fontSize={theme.fontSize.medium} fontWeight={theme.fontWeight.bold}>
    Create account
  </StyledButton.Text>
</StyledButton>
<StyledButton outline block>
  <StyledButton.Text color={theme.colors.gray[800]} fontSize={theme.fontSize.medium}>Sign in instead</StyledButton.Text>
</StyledButton>

// Disabled
<StyledButton primary disabled>Disabled</StyledButton>
```

Accepts all `TouchableOpacityProps` and flat `ViewStyle` props.

---

### StyledTextInput

A rich text input with label, validation, addons, and an imperative ref handle.

```tsx
import { StyledTextInput } from 'fluent-styles'

// Variants: outline | filled | underline | ghost
<StyledTextInput variant="outline" label="Email" placeholder="you@example.com" />

// Sizes: sm | md | lg
<StyledTextInput size="md" label="Medium" />

// Floating label (Material Design style)
<StyledTextInput floatLabel label="Floating Label" />

// Validation
<StyledTextInput
  label="Username"
  required
  helperText="Must be unique"
  errorMessage="Already taken"
  error
/>

// Character counter
<StyledTextInput label="Bio" showCounter maxLength={200} multiline />

// Icons & addons
<StyledTextInput leftIcon={<SearchIcon />} placeholder="Search…" />
<StyledTextInput
  leftAddon={{ text: 'https://', bg: '#f4f4f5' }}
  rightAddon={{ text: '.com', bg: '#f4f4f5' }}
  placeholder="yoursite"
/>

// States
<StyledTextInput clearable value={value} onChangeText={setValue} />
<StyledTextInput loading />

// Imperative handle
const inputRef = useRef<StyledTextInputHandle>(null)
<StyledTextInput ref={inputRef} label="Password" secureTextEntry />
inputRef.current?.focus()
inputRef.current?.clear()
inputRef.current?.isFocused()
```

**Key props:**

| Prop | Type | Description |
|---|---|---|
| `label` | `string` | Input label |
| `floatLabel` | `boolean` | Animated floating label |
| `required` | `boolean` | Appends `*` to label |
| `helperText` | `string` | Hint text below input |
| `errorMessage` | `string` | Error text (visible when `error` is true) |
| `error` | `boolean` | Activates error state |
| `showCounter` | `boolean` | Character counter (requires `maxLength`) |
| `variant` | `outline \| filled \| underline \| ghost` | Visual style |
| `size` | `sm \| md \| lg` | Input size |
| `leftIcon / rightIcon` | `ReactNode` | Icon slots |
| `leftAddon / rightAddon` | `{ text?, node?, bg?, color?, onPress? }` | Prefix/suffix addons |
| `clearable` | `boolean` | Clear button when value is present |
| `loading` | `boolean` | Right-side activity spinner |
| `focusColor` | `string` | Border colour on focus |

---

### Switch

A generic animated toggle with async confirmation guard and customisable labels.

```tsx
import { Switch } from 'fluent-styles'

// Uncontrolled boolean
<Switch defaultValue={false} onChange={(val) => console.log(val)} />

// Controlled
<Switch value={isOn} onChange={setIsOn} />

// Non-boolean (generic types)
<Switch<'yes', 'no'>
  activeValue="yes"
  inactiveValue="no"
  defaultValue="no"
  onChange={(val) => console.log(val)}
/>

// Sizes: sm | md | lg
<Switch size="lg" defaultValue />

// Async guard — return false to cancel toggle
<Switch
  beforeChange={async (next) => {
    const ok = await confirmDialog()
    return ok
  }}
/>

// Inline labels & colours
<Switch activeLabel="ON" inactiveLabel="OFF" />
<Switch activeColor="#10b981" inactiveColor="#d4d4d8" />

// Fine-grained color token overrides
<Switch
  defaultValue
  colors={{
    activeTrack: palettes.rose[500],
    inactiveTrack: palettes.rose[100],
    inactiveBorder: palettes.rose[200],
    activeLabelText: '#fff',
  }}
/>
<Switch defaultValue activeColor={palettes.amber[400]} inactiveColor={palettes.amber[100]} />

// Teal with labels
<Switch
  size="lg"
  defaultValue
  activeLabel="ON"
  inactiveLabel="OFF"
  colors={{
    activeTrack: palettes.teal[500],
    inactiveTrack: palettes.teal[100],
    activeLabelText: '#fff',
    inactiveLabelText: palettes.teal[400],
  }}
/>

// On a dark background (slate palette)
<Switch
  defaultValue
  colors={{
    activeTrack: palettes.indigo[400],
    inactiveTrack: palettes.blueGray[700],
    inactiveBorder: palettes.blueGray[600],
    thumb: '#ffffff',
  }}
/>

// Always-rejected guard (demonstrates async guard returning false)
<Switch defaultValue={false} beforeChange={() => Promise.resolve(false)} />

// States
<Switch loading />
<Switch disabled />
```

**Key props:**

| Prop | Type | Description |
|---|---|---|
| `value` | `T` | Controlled value |
| `defaultValue` | `T` | Uncontrolled initial value |
| `activeValue / inactiveValue` | `T` | Values for on/off (default `true`/`false`) |
| `onChange` | `(val: T) => void` | Change callback |
| `beforeChange` | `(next: T) => boolean \| Promise<boolean>` | Async guard |
| `size` | `sm \| md \| lg` | Track size preset |
| `activeLabel / inactiveLabel` | `string \| ReactNode` | Label inside track |
| `activeColor / inactiveColor` | `string` | Track colour overrides |
| `loading` | `boolean` | Replaces thumb with a spinner |
| `disabled` | `boolean` | Disables interaction |
| `colors` | `Partial<SwitchColors>` | Fine-grained token overrides |

---

### StyledCheckBox

An accessible checkbox with customisable size and colour.

```tsx
import { StyledCheckBox, StyledCard, StyledText, Stack, theme } from 'fluent-styles'

// Basic
<StyledCheckBox checked={isChecked} onCheck={setChecked} />

// Sizes: 18 | 24 | 32 | 40
<Stack horizontal gap={16} alignItems="center">
  <StyledCheckBox checked size={18} onCheck={() => {}} />
  <StyledCheckBox checked size={24} onCheck={() => {}} />
  <StyledCheckBox checked size={32} onCheck={() => {}} />
  <StyledCheckBox checked size={40} onCheck={() => {}} />
</Stack>

// Custom colors
<StyledCheckBox checked checkedColor={theme.colors.green[500]}  checkMarkColor="#fff" onCheck={() => {}} />
<StyledCheckBox checked checkedColor={theme.colors.blue[600]}   checkMarkColor="#fff" onCheck={() => {}} />
<StyledCheckBox checked checkedColor={theme.colors.rose[500]}   checkMarkColor="#fff" onCheck={() => {}} />

// Disabled states
<StyledCheckBox checked={false} disabled onCheck={() => {}} />
<StyledCheckBox checked          disabled onCheck={() => {}} />

// --- Real-world: Settings preferences card ---
<StyledCard backgroundColor={theme.colors.white} borderRadius={18} padding={16} shadow="light">
  <Stack gap={18}>
    <StyledText fontSize={18} fontWeight={800}>Preferences</StyledText>
    {[{ label: 'Product updates', checked: updates, setter: setUpdates },
      { label: 'Marketing emails', checked: marketing, setter: setMarketing },
      { label: 'Push notifications', checked: notifs, setter: setNotifs }]
      .map(({ label, checked, setter }) => (
        <Stack key={label} horizontal alignItems="center" gap={12}>
          <StyledCheckBox checked={checked} onCheck={setter} />
          <StyledText fontSize={15} fontWeight={600}>{label}</StyledText>
        </Stack>
    ))}
  </Stack>
</StyledCard>

// --- Real-world: Task list with green checkmarks ---
<Stack gap={16}>
  {tasks.map(({ key, label, helper }) => (
    <Stack key={key} horizontal alignItems="center" gap={12}>
      <StyledCheckBox
        checked={done[key]}
        onCheck={(v) => setDone(prev => ({ ...prev, [key]: v }))}
        checkedColor={theme.colors.green[500]}
        checkMarkColor="#fff"
      />
      <Stack flex={1}>
        <StyledText fontSize={15} fontWeight={600}>{label}</StyledText>
        {helper && <StyledText fontSize={13} color={theme.colors.gray[500]}>{helper}</StyledText>}
      </Stack>
    </Stack>
  ))}
</Stack>

// --- Compact inline usage ---
<Stack horizontal alignItems="center" gap={10}>
  <StyledCheckBox checked={remember} onCheck={setRemember} size={20} />
  <StyledText>Remember me</StyledText>
</Stack>
```

---

### StyledCard

A flexible container with optional shadow levels and pressable wrapper.

```tsx
import { StyledCard } from 'fluent-styles'

<StyledCard shadow="light" padding={16} borderRadius={12}>
  <StyledText>Card content</StyledText>
</StyledCard>

// Pressable card
<StyledCard
  shadow="medium"
  pressable
  pressableProps={{ onPress: () => navigate('Detail') }}
>
  <StyledText>Tap me</StyledText>
</StyledCard>
```

**Shadow levels:** `light` | `lightMedium` | `medium` | `mediumDark` | `dark` | `veryDark`

Accepts all `ViewProps` and flat `ViewStyle` props.

---

### StyledBadge / BadgeWithIcon / BadgeIcon

Styled text badges, icon badges, and notification count overlays.

```tsx
import { StyledBadge, BadgeWithIcon, BadgeIcon, StyledImage, Stack, theme } from 'fluent-styles'

// --- Pill status badges ---
<Stack horizontal gap={10} flexWrap="wrap">
  <StyledBadge
    backgroundColor={theme.colors.green[50]}
    color={theme.colors.green[700]}
    paddingHorizontal={10} paddingVertical={6} borderRadius={999}
  >Active</StyledBadge>

  <StyledBadge
    backgroundColor={theme.colors.red[50]}
    color={theme.colors.red[600]}
    paddingHorizontal={10} paddingVertical={6} borderRadius={999}
  >Rejected</StyledBadge>

  <StyledBadge
    backgroundColor={theme.colors.blue[50]}
    color={theme.colors.blue[700]}
    paddingHorizontal={10} paddingVertical={6} borderRadius={999}
  >New</StyledBadge>
</Stack>

// --- Link badge ---
<StyledBadge link>View details</StyledBadge>

// --- BadgeWithIcon: feature / status badges ---
<BadgeWithIcon
  title="Featured"
  iconLeft={<Text>⭐</Text>}
  backgroundColor={theme.colors.yellow[50]}
  paddingHorizontal={12} paddingVertical={7} borderRadius={999} gap={6}
/>
<BadgeWithIcon
  title="Verified"
  iconLeft={<Text>✅</Text>}
  backgroundColor={theme.colors.green[50]}
  paddingHorizontal={12} paddingVertical={7} borderRadius={999} gap={6}
/>

// --- Status badges (workflow states) ---
<BadgeWithIcon title="In progress" iconLeft={<Text>🟡</Text>} color={theme.colors.yellow[700]}
  backgroundColor={theme.colors.yellow[50]} paddingHorizontal={12} paddingVertical={8} borderRadius={999} gap={6} />
<BadgeWithIcon title="Completed"  iconLeft={<Text>🟢</Text>} color={theme.colors.green[700]}
  backgroundColor={theme.colors.green[50]}  paddingHorizontal={12} paddingVertical={8} borderRadius={999} gap={6} />
<BadgeWithIcon title="Blocked"    iconLeft={<Text>🔴</Text>} color={theme.colors.red[700]}
  backgroundColor={theme.colors.red[50]}    paddingHorizontal={12} paddingVertical={8} borderRadius={999} gap={6} />

// --- BadgeIcon: count bubbles ---
<Stack horizontal gap={24} alignItems="center">
  <BadgeIcon char="1" size={24} />
  <BadgeIcon char="3" backgroundColor={theme.colors.blue[600]}  size={24} />
  <BadgeIcon char="9+" backgroundColor={theme.colors.gray[800]} size={24} />
</Stack>

// --- BadgeIcon over an icon (notification dot) ---
<BadgeIcon icon={<Text style={{ fontSize: 24 }}>🔔</Text>} char="2" right={20} top={-12} size={16} />
<BadgeIcon icon={<Text style={{ fontSize: 24 }}>🛒</Text>} char="4" backgroundColor={theme.colors.green[600]} right={16} top={-12} size={16} />

// --- Overlay badge on an image ---
<Stack>
  <StyledImage source={{ uri: '…' }} width={220} height={150} borderRadius={18} />
  <Stack position="absolute" top={10} right={10}>
    <StyledBadge backgroundColor="rgba(17,24,39,0.78)" color="#fff"
      paddingHorizontal={10} paddingVertical={6} borderRadius={999} fontWeight="700">New</StyledBadge>
  </Stack>
</Stack>

// --- Avatar with notification count ---
<Stack>
  <StyledImage source={{ uri: '…' }} cycle size={64} borderRadius={999} />
  <Stack position="absolute" top={2} right={2}>
    <BadgeIcon char="3" size={18} />
  </Stack>
</Stack>

// --- Product badges ---
<Stack horizontal gap={10} flexWrap="wrap">
  <StyledBadge backgroundColor={theme.colors.red[50]} color={theme.colors.red[600]}
    paddingHorizontal={10} paddingVertical={6} borderRadius={999} fontWeight="700">Sale</StyledBadge>
  <StyledBadge backgroundColor={theme.colors.gray[900]} color={theme.colors.white}
    paddingHorizontal={10} paddingVertical={6} borderRadius={999} fontWeight="700">Limited</StyledBadge>
  <BadgeWithIcon title="Free delivery" iconLeft={<Text>🚚</Text>} backgroundColor={theme.colors.green[50]}
    paddingHorizontal={12} paddingVertical={7} borderRadius={999} gap={6} />
</Stack>
```

**`BadgeIcon` props:** `char`, `icon?`, `size?`, `backgroundColor?`, `top?`, `right?`

---

### StyledImage / StyledImageBackground

Styled wrappers around React Native's `Image` and `ImageBackground`.

```tsx
import { StyledImage, StyledImageBackground } from 'fluent-styles'

// Fixed dimensions
<StyledImage source={{ uri: 'https://…' }} width={120} height={80} borderRadius={8} />

// Circular avatar (cycle + size)
<StyledImage source={{ uri: 'https://…' }} cycle size={64} />

// Background image with overlay
<StyledImageBackground source={require('./assets/hero.jpg')} height={200} borderRadius={12}>
  <StyledText color="#fff">Overlay text</StyledText>
</StyledImageBackground>
```

---

### StyledHeader

A composable navigation header with status bar management, slot-based layout, and a `StyledHeader.Full` escape hatch for fully custom content.

```tsx
import { StyledHeader } from 'fluent-styles'

// ── Basic title alignments ───────────────────────────────────────────────────
<StyledHeader title="Left aligned"   titleAlignment="left"   showStatusBar={false} />
<StyledHeader title="Center aligned" titleAlignment="center" showStatusBar={false} />
<StyledHeader title="Right aligned"  titleAlignment="right"  showStatusBar={false} />

// ── Back arrow ───────────────────────────────────────────────────────────────
<StyledHeader
  title="Go back"
  showBackArrow
  onBackPress={() => navigation.goBack()}
/>

// Custom back arrow colour + size
<StyledHeader
  title="Profile"
  titleAlignment="center"
  showBackArrow
  backArrowProps={{ size: 20, color: '#6366f1' }}
  onBackPress={() => navigation.goBack()}
/>

// ── Right / left icons ───────────────────────────────────────────────────────
<StyledHeader
  title="Notifications"
  titleAlignment="center"
  showBackArrow
  onBackPress={() => navigation.goBack()}
  rightIcon={<SettingsIcon />}
/>

// Multiple right icons
<StyledHeader
  title="Photos"
  titleAlignment="center"
  showBackArrow
  onBackPress={() => navigation.goBack()}
  rightIcon={
    <Stack horizontal gap={8}>
      <SearchIconBtn />
      <MoreIconBtn />
    </Stack>
  }
/>

// Logo + action on the right (no back arrow)
<StyledHeader
  titleAlignment="left"
  leftIcon={
    <Stack horizontal gap={6} alignItems="center">
      <BrandLogo />
      <StyledText fontSize={16} fontWeight="800">fluent</StyledText>
    </Stack>
  }
  rightIcon={<CartIconBtn />}
/>

// ── Themed background ────────────────────────────────────────────────────────
<StyledHeader
  title="Dark header"
  titleAlignment="center"
  showBackArrow
  onBackPress={() => navigation.goBack()}
  backgroundColor={theme.colors.gray[900]}
  titleProps={{ color: '#fff', fontWeight: '700' }}
  backArrowProps={{ color: '#fff' }}
/>

// ── StyledHeader.Full — fully custom children ────────────────────────────────
// Renders children directly inside the container; skips the built-in layout slots.
// Useful for search bars, tab strips, chat headers, etc.
<StyledHeader showStatusBar={false} backgroundColor={palettes.white}>
  <StyledHeader.Full>
    <Stack flex={1} horizontal alignItems="center" paddingHorizontal={12} gap={10}>
      <BackBtn />
      <SearchBar />
      <CancelBtn />
    </Stack>
  </StyledHeader.Full>
</StyledHeader>

// Chat-style header with avatar + call buttons
<StyledHeader showStatusBar={false} backgroundColor={palettes.white}>
  <StyledHeader.Full>
    <Stack flex={1} horizontal alignItems="center" paddingHorizontal={12} gap={10}>
      <BackBtn />
      <Avatar uri={avatarUri} size={36} />
      <Stack flex={1} gap={1}>
        <StyledText fontSize={14} fontWeight="700">Priya Kapoor</StyledText>
        <StyledText fontSize={11} color={palettes.teal[500]}>Active now</StyledText>
      </Stack>
      <CallBtn />
      <VideoBtn />
    </Stack>
  </StyledHeader.Full>
</StyledHeader>
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | — | Header title |
| `titleAlignment` | `left \| center \| right` | `left` | Title position |
| `titleProps` | `StyledTextProps` | — | Font/colour overrides for the title |
| `showBackArrow` | `boolean` | `false` | Renders a chevron back arrow |
| `onBackPress` | `() => void` | — | Tapped when the back arrow is pressed |
| `backArrowProps` | `BackArrowProps` | — | `size`, `color`, `strokeWidth` overrides |
| `leftIcon` | `ReactNode` | — | Custom left-slot content (replaces back arrow) |
| `rightIcon` | `ReactNode` | — | Custom right-slot content |
| `showStatusBar` | `boolean` | `true` | Include status bar spacer above the header |
| `statusBarProps` | `StatusBarProps` | — | Forwarded to the internal `StatusBar` component |
| `skipStatusBarOnAndroid` | `boolean` | `true` | Skip spacer on Android |
| `skipStatusBarOnIOS` | `boolean` | `true` | Skip spacer on iOS |
| `children` | `ReactNode` | — | When present (via `StyledHeader.Full`), replaces built-in slot layout |

All flat `ViewStyle` props (`backgroundColor`, `paddingHorizontal`, `borderRadius`, …) are forwarded to the container.

---

### StyledDropdown / StyledMultiSelectDropdown

Modal-based dropdowns with optional search, icons, and subtitles.

```tsx
import { StyledDropdown, StyledMultiSelectDropdown } from 'fluent-styles'

const options = [
  { value: 'react',   label: 'React Native' },
  { value: 'flutter', label: 'Flutter', subtitle: 'by Google' },
  { value: 'ionic',   label: 'Ionic', disabled: true },
]

// Single-select
<StyledDropdown
  label="Framework"
  placeholder="Pick one…"
  options={options}
  value={selected}
  onChange={(item) => setSelected(item.value)}
  variant="outline"
  size="md"
/>

// With search
<StyledDropdown label="Country" options={countryOptions} searchable searchPlaceholder="Filter…" />

// Multi-select
<StyledMultiSelectDropdown label="Tags" options={options} value={selectedTags} onChange={setSelectedTags} />
```

**DropdownOptionItem:** `value`, `label`, `icon?`, `subtitle?`, `disabled?`, `meta?`

**Trigger props:** `variant` (`outline | filled | underline | ghost`), `size` (`sm | md | lg`), `label`, `placeholder`, `disabled`

---

### Popup

A versatile overlay with multiple positions, animation styles, and a built-in header.

```tsx
import { Popup } from 'fluent-styles'

// --- Bottom sheet variants ---
<Popup visible={visible} onClose={hide}>Plain content — no header</Popup>
<Popup visible={visible} onClose={hide} title="Post options" showClose><ActionList /></Popup>
<Popup visible={visible} onClose={hide} title="Share post" subtitle="Choose where to send" showClose><ShareList /></Popup>
<Popup visible={visible} onClose={hide} title="Safe area" showClose safeAreaBottom>…</Popup>

// No backdrop
<Popup visible={visible} onClose={hide} title="No backdrop" overlay={false} showClose>…</Popup>

// Prevent dismiss on backdrop tap
<Popup visible={visible} onClose={hide} title="Tap overlay — nothing" showClose closeOnPressOverlay={false}>…</Popup>

// --- Positions ---
<Popup visible={visible} onClose={hide} position="top"    title="Notification" showClose>…</Popup>
<Popup visible={visible} onClose={hide} position="left"   title="Side menu"    showClose>…</Popup>
<Popup visible={visible} onClose={hide} position="right"  title="Filters"      showClose>…</Popup>
<Popup visible={visible} onClose={hide} position="center" title="Confirm"      showClose round>…</Popup>

// --- Animation styles ---
<Popup visible={visible} onClose={hide} animation="slide" title="Slide" showClose>…</Popup>
<Popup visible={visible} onClose={hide} animation="fade"  title="Fade"  showClose>…</Popup>
<Popup visible={visible} onClose={hide} position="center" animation="scale" title="Scale" showClose round>…</Popup>
<Popup visible={visible} onClose={hide} animation="none"  title="Instant" showClose>…</Popup>

// Spring physics
<Popup visible={visible} onClose={hide} title="Spring" showClose spring={{ damping: 18, stiffness: 280 }}>…</Popup>

// --- Corner rounding ---
<Popup visible={visible} onClose={hide} round           title="Default 20 px" showClose>…</Popup>
<Popup visible={visible} onClose={hide} round={false}   title="Square corners" showClose>…</Popup>
<Popup visible={visible} onClose={hide} round roundRadius={36} title="Large radius" showClose>…</Popup>

// --- Render strategy ---
<Popup visible={visible} onClose={hide} lazyRender title="Lazy (default)" showClose>…</Popup>
<Popup visible={visible} onClose={hide} destroyOnClose title="Destroy on close" showClose>…</Popup>

// --- Color token overrides ---
<Popup
  visible={visible} onClose={hide}
  title="Dark slate" subtitle="Token overrides" showClose
  colors={{
    background: palettes.blueGray[900],
    overlay: 'rgba(0,0,0,0.75)',
    handle: palettes.blueGray[600],
    headerTitle: palettes.blueGray[100],
    headerSubtitle: palettes.blueGray[400],
    headerBorder: palettes.blueGray[700],
    closeIcon: palettes.blueGray[300],
    closeIconBg: palettes.blueGray[700],
  }}
>…</Popup>

<Popup
  visible={visible} onClose={hide} title="Indigo surface" showClose
  colors={{ background: palettes.indigo[50], headerTitle: palettes.indigo[900], handle: palettes.indigo[300], closeIconBg: palettes.indigo[100] }}
>…</Popup>

// --- Lifecycle callbacks ---
<Popup
  visible={visible} onClose={hide} title="Lifecycle" showClose
  onOpen={()   => console.log('onOpen')}
  onOpened={()  => console.log('onOpened — animation done')}
  onClosed={()  => console.log('onClosed — animation done')}
>…</Popup>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | — | Controls visibility |
| `position` | `top \| bottom \| left \| right \| center` | `bottom` | Entry edge |
| `animation` | `slide \| fade \| scale \| none` | auto | Animation style |
| `overlay` | `boolean` | `true` | Show backdrop |
| `closeOnPressOverlay` | `boolean` | `true` | Dismiss on backdrop tap |
| `round / roundRadius` | `boolean / number` | `true / 20` | Rounded interior corners |
| `title / subtitle` | `ReactNode` | — | Built-in header content |
| `showHandle` | `boolean` | auto | Drag handle pill |
| `showClose` | `boolean` | `false` | Close (×) button |
| `safeAreaBottom` | `boolean` | `false` | Padding for home bar |
| `lazyRender` | `boolean` | `true` | Mount children on first open |
| `destroyOnClose` | `boolean` | `false` | Unmount children when closed |
| `spring` | `{ damping, stiffness, mass? }` | — | Spring physics override |
| `colors` | `Partial<PopupColors>` | — | Token overrides |

**Lifecycle callbacks:** `onOpen`, `onOpened`, `onClose`, `onClosed`

---

### Drawer

A swipeable side panel with built-in navigation list, header, and footer slot.

```tsx
import { Drawer } from 'fluent-styles'

<Drawer
  visible={isOpen}
  side="left"
  title="Menu"
  onClose={() => setOpen(false)}
  navItems={[
    { key: 'home',    label: 'Home',    icon: '🏠', active: true, onPress: () => navigate('Home') },
    { key: 'profile', label: 'Profile', icon: '👤', onPress: () => navigate('Profile') },
    { key: 'logout',  label: 'Logout',  icon: '🚪', section: 'Account', onPress: logout },
  ]}
  footer={<UserProfileRow />}
/>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `visible` | `boolean` | — | Controls visibility |
| `side` | `left \| right` | `left` | Entry edge |
| `width` | `number \| string` | `'78%'` | Drawer width |
| `navItems` | `DrawerNavItem[]` | — | Built-in nav list (auto-grouped by `section`) |
| `footer` | `ReactNode` | — | Pinned footer content |
| `swipeToClose` | `boolean` | `true` | Pan gesture dismiss |
| `swipeThreshold` | `number` | `0.4` | Fraction of width to trigger dismiss |
| `title / subtitle` | `ReactNode` | — | Header content |
| `headerRight` | `ReactNode` | — | Header right slot |
| `colors` | `Partial<DrawerColors>` | — | Token overrides |

**DrawerNavItem:** `key`, `label`, `icon?`, `badge?`, `section?`, `active?`, `disabled?`, `onPress?`

---

### Collapse / CollapseGroup

Animated accordion panels with full render-slot control.

```tsx
import { Collapse, CollapseGroup, CollapseItem, palettes, theme } from 'fluent-styles'

// --- Variants ---
<Collapse title="Cell (default)" variant="cell">…</Collapse>
<Collapse title="Card" subtitle="Shadow + radius" variant="card">…</Collapse>
<Collapse title="Bordered" variant="bordered">…</Collapse>
<Collapse title="Ghost" variant="ghost">…</Collapse>

// --- Sizes ---
<Collapse title="Small"  variant="bordered" size="sm">…</Collapse>
<Collapse title="Medium" variant="bordered" size="md">…</Collapse>
<Collapse title="Large"  variant="bordered" size="lg">…</Collapse>

// --- Header slots: leading · subtitle · trailing ---
<Collapse
  variant="card"
  leading={<Text style={{ fontSize: 20 }}>📦</Text>}
  title="Leading icon"
  subtitle="Any ReactNode on the left"
>…</Collapse>

<Collapse
  variant="card"
  title="Trailing badge"
  trailing={<View style={{ backgroundColor: palettes.indigo[500], borderRadius: 10, paddingHorizontal: 8 }}><Text style={{ color: '#fff', fontWeight: '700' }}>NEW</Text></View>}
>…</Collapse>

// --- Active header tint ---
<Collapse title="Tints when open" variant="bordered" activeHeader>…</Collapse>

// --- Disabled ---
<Collapse title="Premium feature" subtitle="Upgrade to unlock" variant="bordered" disabled>…</Collapse>

// --- Default open (uncontrolled) ---
<Collapse title="Starts expanded" variant="card" defaultCollapse>…</Collapse>

// --- Controlled open state ---
const [open, setOpen] = useState(false)
<Collapse
  title="Externally driven"
  variant="bordered"
  collapse={open}
  onCollapse={setOpen}
>…</Collapse>

// --- Custom header renderer ---
<Collapse
  variant="card"
  renderHeader={(open) => (
    <View style={{ padding: 14, backgroundColor: open ? '#eef2ff' : '#f2f2f7' }}>
      <Text style={{ fontWeight: '600' }}>{open ? '▲ Open' : '▼ Closed'}</Text>
    </View>
  )}
>…</Collapse>

// --- Custom header right (keep title, replace right side) ---
<Collapse
  title="Custom right"
  variant="bordered"
  renderHeaderRight={(open, chevron) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Text style={{ color: open ? '#6366f1' : '#8e8e93' }}>{open ? 'Open' : 'Closed'}</Text>
      {chevron}
    </View>
  )}
>…</Collapse>

// --- Color token overrides ---
<Collapse
  title="Dark slate theme"
  variant="card"
  colors={{
    background: theme.colors.blueGray[900],
    border: theme.colors.blueGray[700],
    titleColor: theme.colors.blueGray[100],
    subtitleColor: theme.colors.blueGray[400],
    iconColor: theme.colors.blueGray[400],
    activeHeaderBg: palettes.blueGray[800],
  }}
>…</Collapse>

<Collapse
  title="Warm amber theme"
  variant="bordered"
  colors={{
    background: palettes.amber[50],
    border: palettes.amber[300],
    titleColor: palettes.amber[900],
    iconColor: palettes.amber[500],
    activeHeaderBg: palettes.amber[100],
  }}
>…</Collapse>

// --- CollapseGroup: multi-open with defaultActiveKey array ---
<CollapseGroup variant="bordered" defaultActiveKey={['shipping']}>
  <CollapseItem itemKey="shipping" title="Shipping" subtitle="2–5 business days">…</CollapseItem>
  <CollapseItem itemKey="returns"  title="Returns"  subtitle="30-day policy">…</CollapseItem>
  <CollapseItem itemKey="sizing"   title="Size guide">…</CollapseItem>
</CollapseGroup>

// --- CollapseGroup: accordion FAQ with icons ---
<CollapseGroup accordion variant="card" defaultActiveKey="q1" style={{ gap: 8 }}>
  <CollapseItem itemKey="q1" leading={<Text style={{ fontSize: 18 }}>💳</Text>} title="Accepted payment methods">…</CollapseItem>
  <CollapseItem itemKey="q2" leading={<Text style={{ fontSize: 18 }}>🔒</Text>} title="Is my data secure?">…</CollapseItem>
  <CollapseItem itemKey="q3" leading={<Text style={{ fontSize: 18 }}>📞</Text>} title="How do I contact support?">…</CollapseItem>
</CollapseGroup>
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `title / subtitle` | `ReactNode` | — | Header content |
| `leading / trailing` | `ReactNode` | — | Header side slots |
| `variant` | `cell \| card \| bordered \| ghost` | `cell` | Visual style |
| `size` | `sm \| md \| lg` | `md` | Padding scale |
| `collapse / defaultCollapse` | `boolean` | — | Controlled / uncontrolled open state |
| `onCollapse` | `(open: boolean) => void` | — | Toggle callback |
| `activeHeader` | `boolean` | `false` | Tint header when open |
| `disabled` | `boolean` | `false` | Prevent interaction |
| `lazyRender` | `boolean` | `true` | Mount body on first expand |
| `destroyOnClose` | `boolean` | `false` | Unmount body when collapsed |
| `renderHeader` | `(open: boolean) => ReactNode` | — | Replace the entire header |
| `renderHeaderRight` | `(open, chevron) => ReactNode` | — | Replace only the right side of the header |
| `colors` | `Partial<CollapseColors>` | — | Token overrides |

`CollapseGroup` additional props: `accordion` (single-open), `defaultActiveKey` (`string \| string[]`)

---

### TabBar

A feature-rich animated tab bar with badge, icon, and indicator support.

```tsx
import { TabBar, TabItem, palettes } from 'fluent-styles'

// --- Bottom nav with icons + dot badges ---
type Nav = 'home' | 'explore' | 'activity' | 'profile'
const NAV_TABS: TabItem<Nav>[] = [
  { value: 'home',     label: 'Home',     iconRender: (c) => <HomeIcon color={c} /> },
  { value: 'explore',  label: 'Explore',  iconRender: (c) => <SearchIcon color={c} />, badge: 3 },
  { value: 'activity', label: 'Activity', iconRender: (c) => <BellIcon color={c} />,   badge: '' }, // '' = dot badge
  { value: 'profile',  label: 'Profile',  iconRender: (c) => <UserIcon color={c} /> },
]
<TabBar options={NAV_TABS} value={nav} onChange={setNav} indicator="dot" showBorder />

// --- Animated underline indicator ---
<TabBar options={SIMPLE_TABS} value={seg} onChange={setSeg} indicator="line" showBorder />

// --- Sliding pill indicator ---
<TabBar
  options={SIMPLE_TABS}
  defaultValue="week"
  indicator="pill"
  colors={{ background: palettes.indigo[50], activeText: palettes.indigo[700], indicator: palettes.indigo[200], text: palettes.indigo[400] }}
/>

// --- Scrollable tabs (many items) ---
<TabBar options={MANY_TABS} value={cat} onChange={setCat} tabAlign="scroll" indicator="line" showBorder />

// --- Disabled tabs ---
const TABS_WITH_DISABLED: TabItem<string>[] = [
  { value: 'available', label: 'Available' },
  { value: 'locked',    label: 'Locked',  disabled: true },
  { value: 'open',      label: 'Open' },
]
<TabBar options={TABS_WITH_DISABLED} value={active} onChange={setActive} indicator="line" showBorder />

// --- Solid / chip variant ---
<TabBar
  options={SIMPLE_TABS}
  defaultValue="week"
  variant="solid"
  indicator="pill"
  colors={{
    background: palettes.gray[100],
    activeChipBg: '#ffffff',
    activeChipText: palettes.gray[900],
    indicator: palettes.coolGray[200],
    text: palettes.gray[500],
  }}
/>

// --- Numeric values (step wizard) ---
type Step = 1 | 2 | 3
const STEPS: TabItem<Step>[] = [
  { value: 1, label: 'Step 1' },
  { value: 2, label: 'Step 2' },
  { value: 3, label: 'Step 3' },
]
<TabBar
  options={STEPS}
  value={step}
  onChange={setStep}
  indicator="line"
  colors={{ activeText: palettes.violet[600], indicator: palettes.violet[600], text: palettes.gray[400] }}
  showBorder
/>

// --- Custom indicator sizing ---
<TabBar options={SIMPLE_TABS} defaultValue="month" indicator="line" indicatorWidth={24} indicatorHeight={3} indicatorRadius={3} showBorder />

// --- Label scale on active tab ---
<TabBar options={SIMPLE_TABS} defaultValue="week" indicator="line" labelBulge={1.15} showBorder />

// --- Color overrides: green theme ---
<TabBar
  options={SIMPLE_TABS}
  defaultValue="day"
  indicator="line"
  showBorder
  colors={{ background: palettes.green[50], activeText: palettes.green[700], indicator: palettes.green[500], text: palettes.green[400], border: palettes.green[200] }}
/>

// --- Color overrides: dark slate ---
<TabBar
  options={NAV_TABS}
  defaultValue="home"
  indicator="dot"
  showBorder
  colors={{ background: palettes.blueGray[900], activeText: palettes.indigo[400], indicator: palettes.indigo[400], text: palettes.blueGray[400], border: palettes.blueGray[700], badge: palettes.rose[400] }}
/>

// --- Large font / taller bar ---
<TabBar options={SIMPLE_TABS} defaultValue="week" indicator="line" fontSize={17} height={52} showBorder />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `TabItem<T>[]` | — | Tab definitions |
| `value / defaultValue` | `T` | — | Controlled / uncontrolled value |
| `onChange` | `(val: T) => void` | — | Change callback |
| `variant` | `default \| underline \| card \| solid` | `default` | Visual preset |
| `indicator` | `false \| line \| pill \| dot` | `false` | Animated indicator style |
| `indicatorColor` | `ColorValue` | — | Indicator colour override |
| `indicatorWidth` | `number` | auto | Fixed indicator width (0 = full tab width) |
| `indicatorHeight` | `number` | `2` | Indicator thickness |
| `indicatorRadius` | `number` | auto | Indicator border radius |
| `tabAlign` | `center \| scroll` | `center` | Equal-width or scrolling tabs |
| `labelBulge` | `number \| boolean` | `1` | Active label scale factor |
| `fontSize` | `number` | — | Label font size |
| `height` | `number` | — | Bar height override |
| `showBorder` | `boolean` | `false` | Persistent bottom border |
| `colors` | `Partial<TabBarColors>` | — | Token overrides |

**TabItem:** `value`, `label`, `badge?` (`number` = count, `''` = dot), `iconRender?`, `disabled?`

---

### StyledDivider

A simple horizontal rule.

```tsx
import { StyledDivider } from 'fluent-styles'

<StyledDivider />
<StyledDivider borderBottomColor="#e4e4e7" marginVertical={8} />
```

---

### StyledSeperator

A horizontal row with left and optional right label — ideal for section headers.

```tsx
import { StyledSeperator } from 'fluent-styles'

<StyledSeperator leftLabel="Recent" rightLabel="See all" marginVertical={8} />
```

Props: `leftLabel`, `leftLabelProps`, `rightLabel`, `rightLabelProps`, plus all `StackProps`.

---

### Stack

A layout primitive for row and column arrangements.

```tsx
import { Stack } from 'fluent-styles'

// Vertical (column)
<Stack gap={12}>
  <StyledText>Item 1</StyledText>
  <StyledText>Item 2</StyledText>
</Stack>

// Horizontal (row)
<Stack horizontal alignItems="center" gap={8}>
  <Avatar />
  <StyledText>Jane Doe</StyledText>
</Stack>
```

---

### StyledText

A variant-aware Text component accepting `TextStyle` props directly.

```tsx
import { StyledText } from 'fluent-styles'

<StyledText fontSize={18} fontWeight="700" color="#1c1c1e">Heading</StyledText>
<StyledText link>Click here</StyledText>
<StyledText textAlign="center" color="#6b7280">Muted caption</StyledText>
```

---

### StyledPressable

A styled `Pressable` accepting flat `ViewStyle` props.

```tsx
import { StyledPressable } from 'fluent-styles'

<StyledPressable padding={12} borderRadius={8} backgroundColor="#f4f4f5" onPress={handlePress}>
  <StyledText>Press me</StyledText>
</StyledPressable>
```

---

### StyledPage / StyledScrollView

`StyledPage` is the recommended **top-level layout wrapper for every screen**. It wraps `StyledSafeAreaView` so safe area insets are handled automatically, and accepts all `ViewStyle` props for quick background colour, padding, and flex tweaks. Pair it with `StyledScrollView` for scrollable screens or nest a `StyledHeader` + content directly inside for fixed-layout screens.

```tsx
import { StyledPage, StyledScrollView, StyledHeader } from 'fluent-styles'

// ── Scrollable screen (most screens) ────────────────────────────────────────
export default function SettingsScreen() {
  return (
    <StyledPage flex={1} backgroundColor="#f8f8f8">
      <StyledHeader title="Settings" titleAlignment="left" showStatusBar={false} />
      <StyledScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {/* screen content */}
      </StyledScrollView>
    </StyledPage>
  )
}

// ── Fixed layout screen (e.g. chat, camera) ──────────────────────────────────
export default function ChatScreen() {
  return (
    <StyledPage flex={1} backgroundColor="#fff">
      <StyledHeader title="Priya Kapoor" showBackArrow onBackPress={() => navigation.goBack()} />
      <MessageList style={{ flex: 1 }} />
      <MessageComposer />
    </StyledPage>
  )
}

// ── Custom background / padding ──────────────────────────────────────────────
<StyledPage flex={1} backgroundColor={theme.colors.gray[50]} paddingHorizontal={16}>
  {/* content */}
</StyledPage>
```

Accepts all `SafeAreaViewProps` and flat `ViewStyle` props.

---

### StyledSafeAreaView

A styled wrapper around `SafeAreaView`.

```tsx
import { StyledSafeAreaView } from 'fluent-styles'

<StyledSafeAreaView flex={1} backgroundColor="#fff">
  <App />
</StyledSafeAreaView>
```

---

### Spacer / StyledSpacer

Inserts fixed or flexible whitespace between elements.

```tsx
import { StyledSpacer } from 'fluent-styles'

// Fixed height gap
<StyledSpacer height={16} />

// Flexible — fills remaining space (like a CSS flex spacer)
<StyledSpacer flex={1} />

// Horizontal gap inside a row
<Stack horizontal alignItems="center">
  <Icon />
  <StyledSpacer width={8} />
  <StyledText>Label</StyledText>
  <StyledSpacer flex={1} />
  <ChevronIcon />
</Stack>
```

**Props:** `height`, `width`, `flex`, `margin`, `marginTop`, `marginBottom`, `marginHorizontal`, `marginVertical`, `backgroundColor`

---

### StyledShape

A shaped container for icon chips, avatars, and dot indicators.

```tsx
import { StyledShape } from 'fluent-styles'

<StyledShape size={40} borderRadius={20} backgroundColor="#6366f1">
  <StyledText color="#fff">A</StyledText>
</StyledShape>
```

---

### Loader

A loading indicator with four animation variants, optional overlay, and label.

```tsx
import { Loader } from 'fluent-styles'

<Loader variant="spinner" />
<Loader variant="dots"     color="#6366f1" label="Saving…" />
<Loader variant="pulse"    overlay />
<Loader variant="circular" label="Loading…" theme="dark" />
```

| Prop | Type | Default | Description |
|---|---|---|---|
| `variant` | `spinner \| pulse \| dots \| circular` | `spinner` | Animation style |
| `label` | `string` | — | Text below the indicator |
| `color` | `string` | — | Indicator tint colour |
| `overlay` | `boolean` | `false` | Full-screen dimmed backdrop |
| `theme` | `light \| dark \| system` | `system` | Colour scheme |
| `colors` | `Partial<LoaderColors>` | — | Fine-grained token overrides |

---

### StyledCircularProgress

An animated SVG ring progress indicator with four visual variants, five preset sizes, centre label modes, gradient support, and full colour customisation.

```tsx
import { StyledCircularProgress } from 'fluent-styles'

// Basic — shows percentage
<StyledCircularProgress value={72} />

// Fraction display
<StyledCircularProgress value={18} total={25} display="fraction" />

// With label and sublabel
<StyledCircularProgress
  value={72}
  display="percent"
  label="Tasks"
  sublabel="this week"
  size="lg"
/>

// Gradient variant
<StyledCircularProgress
  value={68}
  variant="gradient"
  colors={{
    gradientFrom: '#6366f1',
    gradientTo:   '#22d3ee',
  }}
/>

// Dashboard (half-circle gauge)
<StyledCircularProgress value={55} variant="dashboard" size="xl" />

// Custom diameter and stroke
<StyledCircularProgress value={55} diameter={120} strokeWidth={24} display="percent" />

// Colour overrides
<StyledCircularProgress
  value={82}
  display="percent"
  label="Health"
  size="md"
  colors={{
    arc:      theme.colors.green[500],
    track:    theme.colors.green[100],
    label:    theme.colors.green[700],
    sublabel: theme.colors.green[400],
  }}
/>

// Custom centre content (overrides display/label)
<StyledCircularProgress value={55} display="none" size="lg">
  <Stack alignItems="center" gap={2}>
    <StyledText fontSize={14}>❤️</StyledText>
    <StyledText fontSize={12} fontWeight={theme.fontWeight.bold} color="#f43f5e">
      55 bpm
    </StyledText>
  </Stack>
</StyledCircularProgress>

// Controlled value with animation
<StyledCircularProgress
  value={controlled}
  display="percent"
  label="Progress"
  sublabel={`${controlled} / 100`}
  size="xl"
  variant="gradient"
  duration={600}
/>

// No animation
<StyledCircularProgress value={90} animated={false} display="percent" />

// On a dark surface
<StyledCircularProgress
  value={72}
  variant="gradient"
  display="percent"
  label="Progress"
  colors={{
    gradientFrom: '#818cf8',
    gradientTo:   '#22d3ee',
    track:        'rgba(255,255,255,0.12)',
    label:        '#f4f4f5',
    sublabel:     'rgba(255,255,255,0.5)',
  }}
/>
```

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | **required** | Current progress value |
| `total` | `number` | `100` | Maximum value |
| `display` | `'percent' \| 'fraction' \| 'value' \| 'label' \| 'none'` | `'percent'` | What to render in the centre |
| `label` | `string` | — | Primary label inside the ring |
| `sublabel` | `string` | — | Secondary line below the primary label |
| `variant` | `'default' \| 'ghost' \| 'gradient' \| 'dashboard'` | `'default'` | Visual style |
| `size` | `'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Preset diameter |
| `diameter` | `number` | — | Pixel diameter — overrides `size` |
| `strokeWidth` | `number` | — | Arc thickness in px — auto-scaled when omitted |
| `lineCap` | `'round' \| 'butt' \| 'square'` | `'round'` | Arc end cap style |
| `animated` | `boolean` | `true` | Animate from 0 to `value` on mount / value change |
| `duration` | `number` | `900` | Animation duration in ms |
| `colors` | `Partial<CircularProgressColors>` | — | Fine-grained colour overrides (see below) |
| `children` | `ReactNode` | — | Custom centre content — overrides `display`, `label`, `sublabel` |

#### Size presets

| Size | Diameter | Stroke |
|---|---|---|
| `xs` | 48 px | 4 px |
| `sm` | 64 px | 5 px |
| `md` | 80 px | 6 px |
| `lg` | 100 px | 7 px |
| `xl` | 128 px | 8 px |

#### Variants

| Variant | Description |
|---|---|
| `default` | Coloured arc on a light grey track |
| `ghost` | Arc only — no background track |
| `gradient` | Two-stop linear gradient arc (uses `gradientFrom` / `gradientTo`) |
| `dashboard` | Half-circle gauge — flat side at the bottom |

#### `CircularProgressColors`

| Token | Default | Controls |
|---|---|---|
| `arc` | `indigo[500]` | Progress arc fill |
| `track` | `gray[200]` | Background track ring |
| `label` | `gray[800]` | Primary centre text |
| `sublabel` | `gray[400]` | Secondary centre text |
| `gradientFrom` | `violet[500]` | Gradient start — `gradient` variant only |
| `gradientTo` | `cyan[400]` | Gradient end — `gradient` variant only |

#### Real-world example — onboarding card

```tsx
<Stack
  backgroundColor={theme.colors.indigo[600]}
  borderRadius={16}
  horizontal
  gap={20}
  paddingVertical={32}
  paddingHorizontal={16}
  alignItems="center"
>
  <StyledCircularProgress
    value={3}
    total={5}
    display="fraction"
    label="done"
    size="lg"
    colors={{
      arc:      theme.colors.white,
      track:    'rgba(255,255,255,0.2)',
      label:    theme.colors.white,
      sublabel: 'rgba(255,255,255,0.65)',
    }}
  />
  <Stack vertical flex={1} gap={4}>
    <StyledText fontSize={16} fontWeight={theme.fontWeight.bold} color={theme.colors.white}>
      Getting started
    </StyledText>
    <StyledText fontSize={13} color="rgba(255,255,255,0.75)">
      Complete 2 more steps to unlock all features.
    </StyledText>
  </Stack>
</Stack>
```

---

### StyledChip

A multi-variant chip/tag component with controlled and uncontrolled selection, animated checkmarks, and six visual variants.

```tsx
import { StyledChip } from 'fluent-styles'
```

#### Variants

| Variant | Description |
|---|---|
| `outlined` | Border + tinted bg when selected (default) |
| `filled` | Solid background, changes tone on select |
| `smooth` | Soft grey background, no border |
| `ingredient` | Dark-bg when selected (recipe/filter chips) |
| `likeable` | Pink heart chip — toggles like state |
| `icon` | Leading icon with accent styling |

#### Size presets

| Size | Padding H | Padding V | Font | Icon | Radius |
|---|---|---|---|---|---|
| `sm` | 10 | 5 | 11 | 12 | 20 |
| `md` | 14 | 8 | 13 | 14 | 24 |
| `lg` | 18 | 11 | 15 | 16 | 28 |

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `label` | `string` | — | Chip text |
| `variant` | `ChipVariant` | `'outlined'` | Visual style |
| `size` | `ChipSize` | `'md'` | Size preset |
| `selected` | `boolean` | — | Controlled selection state |
| `defaultSelected` | `boolean` | `false` | Uncontrolled initial state |
| `onPress` | `(selected: boolean) => void` | — | Fires with new selection value |
| `color` | `string` | theme default | Accent colour (border, text, icon) |
| `bgColor` | `string` | variant default | Fill background |
| `icon` | `React.ReactNode` | — | Leading icon node (used with `'icon'` variant) |
| `showCheck` | `boolean` | `true` | Show checkmark when selected |
| `disabled` | `boolean` | `false` | Reduces opacity, disables press |
| `borderRadius` | `number` | size preset | Override border radius |

#### Usage

```tsx
import React, { useState } from 'react'
import { StyledChip, Stack } from 'fluent-styles'
import Icon from 'react-native-vector-icons/Feather'

// ── Multi-select toggle helper ────────────────────────────────────────────────
// A common pattern: maintain a string[] of selected labels and toggle them.
const [selected, setSelected] = useState<string[]>(['Hacktoberfest'])

const toggle = (label: string) =>
  setSelected((prev) =>
    prev.includes(label) ? prev.filter((l) => l !== label) : [...prev, label]
  )

// ── 1. Outlined — multi-select filter bar ─────────────────────────────────────
<Stack gap={10}>
  <Stack horizontal gap={8} flexWrap="wrap">
    {[
      { label: 'Enhancement',   color: '#9e9e9e' },
      { label: 'Trends',        color: '#ff9800' },
    ].map(({ label, color }) => (
      <StyledChip
        key={label}
        label={label}
        variant="outlined"
        color={color}
        selected={selected.includes(label)}
        onPress={() => toggle(label)}
      />
    ))}
  </Stack>
  <Stack horizontal gap={8} flexWrap="wrap">
    {[
      { label: 'Rubi Kapustu',  color: '#2196f3' },
      { label: 'Hacktoberfest', color: '#4caf50' },
    ].map(({ label, color }) => (
      <StyledChip
        key={label}
        label={label}
        variant="outlined"
        color={color}
        selected={selected.includes(label)}
        onPress={() => toggle(label)}
      />
    ))}
  </Stack>
  <Stack horizontal gap={8} flexWrap="wrap">
    {[
      { label: 'Limited', color: '#e65100' },
      { label: 'Taken',   color: '#e91e63' },
    ].map(({ label, color }) => (
      <StyledChip key={label} label={label} variant="outlined" color={color}
        selected={selected.includes(label)} onPress={() => toggle(label)} />
    ))}
  </Stack>
</Stack>

// ── 2. Ingredient — recipe / dietary filter ───────────────────────────────────
const [ingredients, setIngredients] = useState(['Cinnamon', 'Nut'])

{[['Cheese', 'Vanilla', 'Chocolate', 'Egg'],
  ['Honey',  'Milk',    'Banana',    'Nut'],
  ['Cinnamon', 'Tomato', 'Yogurt'],
].map((row, ri) => (
  <Stack key={ri} horizontal gap={8} flexWrap="wrap">
    {row.map((label) => (
      <StyledChip
        key={label}
        label={label}
        variant="ingredient"
        selected={ingredients.includes(label)}
        onPress={() => toggle(label)}
      />
    ))}
  </Stack>
))}

// ── 3. Filled — label/status chips ────────────────────────────────────────────
<Stack horizontal gap={8} flexWrap="wrap">
  <StyledChip label="Hacktoberfest" variant="filled" bgColor="#e8f5e9" color="#388e3c" />
  <StyledChip label="Question"      variant="filled" bgColor="#fff3e0" color="#f57c00" />
  <StyledChip label="Enhancement"   variant="filled" bgColor="#f3e5f5" color="#7b1fa2" />
  {/* Selected filled chip with checkmark */}
  <StyledChip
    label="Taken"
    variant="filled"
    bgColor="#e91e8c"
    color="#fff"
    defaultSelected
    showCheck
  />
</Stack>

// ── 4. Icon chips — dynamic icon colour based on selected state ───────────────
const [activeIcons, setActiveIcons] = useState<string[]>(['Social Media'])

<Stack horizontal gap={8} flexWrap="wrap">
  {/* Solid active: bgColor becomes fill when selected */}
  <StyledChip
    label="Social Media"
    variant="icon"
    icon={
      <Icon
        name="refresh-cw"
        size={14}
        color={activeIcons.includes('Social Media') ? '#fff' : '#2e7d32'}
      />
    }
    color="#2e7d32"
    bgColor="#2e7d32"
    selected={activeIcons.includes('Social Media')}
    onPress={() => toggle('Social Media')}
  />
  <StyledChip
    label="Pin"
    variant="icon"
    icon={<Icon name="map-pin" size={14} color="#2e7d32" />}
    color="#2e7d32"
    bgColor="#e8f5e9"
    selected={activeIcons.includes('Pin')}
    onPress={() => toggle('Pin')}
  />
  <StyledChip
    label="Activity"
    variant="icon"
    icon={<Icon name="activity" size={14} color="#2e7d32" />}
    color="#2e7d32"
    bgColor="#e8f5e9"
    selected={activeIcons.includes('Activity')}
    onPress={() => toggle('Activity')}
  />
</Stack>

// Icon chips — mixed accent colour palette
<Stack horizontal gap={8} flexWrap="wrap">
  <StyledChip label="Annotation" variant="icon"
    icon={<Icon name="edit-3"  size={14} color="#5c6bc0" />} color="#5c6bc0" bgColor="#e8eaf6" />
  <StyledChip label="Laboratory" variant="icon"
    icon={<Icon name="zap"     size={14} color="#5c6bc0" />} color="#5c6bc0" bgColor="#e8eaf6" />
  <StyledChip label="History" variant="icon"
    icon={<Icon name="clock"   size={14} color="#5c6bc0" />} color="#5c6bc0" bgColor="#e8eaf6" />
  {/* Solid active — pre-selected */}
  <StyledChip
    label="Globe"
    variant="icon"
    icon={<Icon name="globe" size={14} color="#fff" />}
    color="#fff"
    bgColor="#3f51b5"
    selected
    onPress={() => {}}
  />
</Stack>

// ── 5. Likeable — topic interest chips ───────────────────────────────────────
const [liked, setLiked] = useState(['Big Data', 'New Technology'])

{[['Cryptocurrency', 'Big Data'],
  ['Software Development'],
  ['New Technology', 'Gadgets'],
  ['Technology Startups'],
].map((row, ri) => (
  <Stack key={ri} horizontal gap={8} flexWrap="wrap">
    {row.map((label) => (
      <StyledChip
        key={label}
        label={label}
        variant="likeable"
        selected={liked.includes(label)}
        onPress={() => toggle(label)}
      />
    ))}
  </Stack>
))}

// ── 6. Size variants side-by-side ────────────────────────────────────────────
<Stack gap={10}>
  <Stack horizontal gap={8} alignItems="center">
    <StyledChip label="Small"  variant="outlined"   size="sm" color="#2196f3" />
    <StyledChip label="Medium" variant="outlined"   size="md" color="#2196f3" />
    <StyledChip label="Large"  variant="outlined"   size="lg" color="#2196f3" />
  </Stack>
  <Stack horizontal gap={8} alignItems="center">
    <StyledChip label="Small"  variant="ingredient" size="sm" defaultSelected />
    <StyledChip label="Medium" variant="ingredient" size="md" defaultSelected />
    <StyledChip label="Large"  variant="ingredient" size="lg" defaultSelected />
  </Stack>
</Stack>

// ── 7. Disabled state ────────────────────────────────────────────────────────
<Stack horizontal gap={8} flexWrap="wrap">
  <StyledChip label="Outlined"   variant="outlined"   color="#2196f3"   disabled />
  <StyledChip label="Filled"     variant="filled"     bgColor="#e91e63" color="#fff" disabled />
  <StyledChip label="Ingredient" variant="ingredient" disabled />
  <StyledChip label="Likeable"   variant="likeable"   disabled />
</Stack>
```

---

### StyledBar

An animated SVG bar chart with gradient active bars, optional hatch texture on inactive bars, and a floating tooltip. Backed by `react-native-svg`.

```tsx
import { StyledBar } from 'fluent-styles'
```

#### `StyledBarDatum`

| Field | Type | Description |
|---|---|---|
| `label` | `string` | X-axis label |
| `value` | `number \| null` | Bar height value; `null` renders a grey placeholder bar |
| `active` | `boolean` | Marks the active/highlighted bar (renders gradient + tooltip) |

#### `StyledBarColors`

| Field | Default | Description |
|---|---|---|
| `inactiveBar` | `gray[200]` | Inactive bar fill |
| `hatchLine` | `rgba(0,0,0,0.07)` | Hatch stripe colour on inactive bars |
| `activeTop` | `#d4f53c` | Active bar gradient top |
| `activeBottom` | `#a8c820` | Active bar gradient bottom |
| `tooltipBg` | `gray[900]` | Tooltip bubble background |
| `tooltipText` | `white` | Tooltip text colour |
| `activeLabelColor` | `gray[900]` | Label colour for active bar |
| `inactiveLabelColor` | `gray[400]` | Label colour for inactive bars |

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `data` | `StyledBarDatum[]` | — | Array of bar data |
| `maxValue` | `number` | max of values | Explicit Y-axis ceiling |
| `width` | `number` | screen width − padding | SVG canvas width in px |
| `containerPaddingHorizontal` | `number` | `80` | Horizontal padding to subtract from screen width |
| `height` | `number` | `180` | Plot area height in px |
| `barWidthRatio` | `number` | `0.62` | Bar width as fraction of slot width |
| `labelHeight` | `number` | `28` | Height reserved below bars for labels |
| `showHatch` | `boolean` | `true` | Render hatch texture on inactive bars |
| `hatchSpacing` | `number` | `8` | Pixel gap between hatch lines |
| `tooltipLabel` | `string` | auto from active value | Override tooltip text |
| `unit` | `string` | `''` | Unit suffix appended to auto tooltip (e.g. `'min'`) |
| `colors` | `StyledBarColors` | lime theme | Colour overrides |
| `animated` | `boolean` | `true` | Animate bars growing from zero on mount |
| `animationDuration` | `number` | `600` | Animation duration in ms |

#### Usage

```tsx
import { StyledBar, StyledCard, palettes, theme } from 'fluent-styles'

// ── Padding rule ──────────────────────────────────────────────────────────────
// The chart auto-sizes to: screenWidth − containerPaddingHorizontal
// When placed inside a card:
//   screen paddingHorizontal = 20 → both sides = 40
//   card   padding           = 20 → both sides = 40
//   total containerPaddingHorizontal = 80   ← pass this value
const CONTAINER_PAD = 80

// ── 1. Default lime — workout duration ───────────────────────────────────────
<StyledCard padding={20} shadow="light">
  <StyledBar
    data={[
      { label: 'Sat', value: 45  },
      { label: 'Sun', value: 60  },
      { label: 'Mon', value: 35  },
      { label: 'Tue', value: 70,  active: true },
      { label: 'Wed', value: 50  },
      { label: 'Thu', value: 30  },
      { label: 'Fri', value: 20  },
    ]}
    unit="min"
    maxValue={100}
    containerPaddingHorizontal={CONTAINER_PAD}
  />
</StyledCard>

// ── 2. Green theme — weight tracking with null placeholders ──────────────────
// null value renders a shorter grey placeholder bar (e.g. a rest/missing day)
<StyledBar
  data={[
    { label: '13', value: null       },   // missing — shows placeholder
    { label: '14', value: 60.0, active: true },
    { label: '15', value: 58.2 },
    { label: '16', value: 59.1 },
    { label: '17', value: 57.4 },
    { label: '18', value: 58.0 },
    { label: '19', value: 56.8 },
  ]}
  unit="kg"
  maxValue={80}
  containerPaddingHorizontal={CONTAINER_PAD}
  colors={{
    activeTop:    '#4ade80',
    activeBottom: '#16a34a',
    tooltipBg:    '#15803d',
    tooltipText:  '#fff',
  }}
/>

// ── 3. Orange — temperature, no hatch texture ─────────────────────────────────
<StyledBar
  data={[
    { label: '13', value: null },
    { label: '14', value: 36.9, active: true },
    { label: '15', value: 37.1 },
    { label: '16', value: 36.8 },
    { label: '17', value: 37.0 },
    { label: '18', value: 37.2 },
    { label: '19', value: 36.5 },
  ]}
  unit="°C"
  maxValue={38}
  showHatch={false}
  containerPaddingHorizontal={CONTAINER_PAD}
  colors={{
    inactiveBar:  '#fed7aa',
    activeTop:    '#fb923c',
    activeBottom: '#ea580c',
    tooltipBg:    '#c2410c',
    tooltipText:  '#fff',
  }}
/>

// ── 4. Blue — water intake, large values ──────────────────────────────────────
<StyledBar
  data={[
    { label: '13', value: null        },
    { label: '14', value: 1750, active: true },
    { label: '15', value: 2100 },
    { label: '16', value: 1600 },
    { label: '17', value: 1900 },
    { label: '18', value: 800  },
    { label: '19', value: null  },
  ]}
  unit="mL"
  maxValue={2500}
  containerPaddingHorizontal={CONTAINER_PAD}
  colors={{
    inactiveBar:  '#bfdbfe',
    hatchLine:    'rgba(59,130,246,0.15)',
    activeTop:    '#60a5fa',
    activeBottom: '#2563eb',
    tooltipBg:    '#1e3a8a',
    tooltipText:  '#fff',
  }}
/>

// ── 5. Rose — calories burned, overridden tooltip label ───────────────────────
// tooltipLabel lets you display a formatted string instead of the raw value
<StyledBar
  data={caloriesData}
  unit="kcal"
  maxValue={2500}
  tooltipLabel="2,200 kcal"
  containerPaddingHorizontal={CONTAINER_PAD}
  colors={{
    inactiveBar:      '#fce7f3',
    hatchLine:        'rgba(236,72,153,0.12)',
    activeTop:        '#f472b6',
    activeBottom:     '#db2777',
    tooltipBg:        '#831843',
    tooltipText:      '#fff',
    activeLabelColor: '#be185d',   // active x-label gets accent colour too
  }}
/>

// ── 6. Minimal — no animation, narrow bars, indigo ───────────────────────────
// Use animated=false for static/print-style charts.
// barWidthRatio controls how wide bars are relative to their slot.
<StyledBar
  data={stepsData}
  unit="k"
  maxValue={100}
  animated={false}
  showHatch={false}
  barWidthRatio={0.42}
  containerPaddingHorizontal={CONTAINER_PAD}
  colors={{
    inactiveBar:  '#e0e7ff',
    activeTop:    '#818cf8',
    activeBottom: '#4338ca',
    tooltipBg:    '#312e81',
    tooltipText:  '#fff',
  }}
/>
```

---

### StyledTimeline

A data-driven vertical timeline with animated dots, three density variants, three dot shapes, custom renderers, and full colour overrides.

```tsx
import { StyledTimeline } from 'fluent-styles'
```

#### `TimelineItem`

| Field | Type | Description |
|---|---|---|
| `id` | `string` | Unique identifier |
| `time` | `string` | Primary time label (e.g. `'09:00'`) |
| `endTime` | `string` | Optional end time shown smaller below |
| `title` | `string` | Bold title in default content renderer |
| `subtitle` | `string` | Secondary line (muted) |
| `description` | `string` | Tertiary detail line |
| `content` | `React.ReactNode` | Custom content — replaces default renderer for this item |
| `meta` | `Record<string, unknown>` | Arbitrary metadata for use in `renderItem` |

#### Variants

| Variant | Gap between rows |
|---|---|
| `compact` | 12 px |
| `default` | 20 px |
| `spacious` | 32 px |

#### Dot shapes

| Shape | Appearance |
|---|---|
| `circle` | Hollow ring (transparent fill, coloured border) |
| `ring` | White fill with coloured border |
| `filled` | Solid fill (default) |

#### `StyledTimelineColors`

| Field | Default | Description |
|---|---|---|
| `line` | `gray[200]` | Vertical connector line colour |
| `dot` | `#8bc34a` | Dot fill / border colour |
| `dotBorder` | `white` | Inner ring background (for `ring` shape) |
| `timeText` | `gray[900]` | Primary time label colour |
| `endTimeText` | `gray[400]` | End-time label colour |

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `items` | `TimelineItem[]` | `[]` | Data-driven item list |
| `renderItem` | `(item, index) => ReactNode` | — | Custom row content renderer |
| `children` | `ReactNode` | — | Extra rows appended after `items` |
| `variant` | `TimelineVariant` | `'default'` | Row density |
| `dotShape` | `TimelineDotShape` | `'filled'` | Dot style |
| `dotSize` | `number` | `10` | Dot diameter in px |
| `timeColumnWidth` | `number` | `56` | Width of left time column in px |
| `timeGap` | `number` | `16` | Horizontal gap between dot column and content |
| `animated` | `boolean` | `true` | Pop-in animation on each dot |
| `colors` | `StyledTimelineColors` | — | Colour overrides |
| `onItemPress` | `(item: TimelineItem) => void` | — | Press handler for rows |

#### Usage

```tsx
import { StyledTimeline, type TimelineItem } from 'fluent-styles'

// ── 1. Minimal JSON-driven ────────────────────────────────────────────────────
<StyledTimeline
  items={[
    { id: '1', time: '09:00', title: 'Morning Run',    subtitle: 'Cardio · 5km' },
    { id: '2', time: '11:30', title: 'Strength Class', subtitle: 'Upper body'   },
    { id: '3', time: '14:00', title: 'Yoga',           subtitle: 'Recovery'     },
  ]}
/>

// ── 2. With end time ─────────────────────────────────────────────────────────
// endTime is shown smaller below the main time label
<StyledTimeline
  items={[
    { id: '1', time: '11:35', endTime: '13:05', title: 'Cardio',         subtitle: '4 of 6 sessions' },
    { id: '2', time: '14:45', endTime: '15:45', title: 'Muscle',         subtitle: '5 of 8 sessions' },
    { id: '3', time: '17:00', endTime: '18:00', title: 'Weight Training', subtitle: '4 of 9 sessions' },
  ]}
  colors={{ dot: '#8bc34a', timeText: '#1a1a1e', endTimeText: '#9ca3af' }}
/>

// ── 3. Custom renderItem — fitness planner card ───────────────────────────────
// Store arbitrary per-item data in the meta field; cast it inside renderItem.
interface WorkoutMeta {
  [key: string]: unknown
  iconName: string
  calories: string
  bpm:      string
  duration: string
}

const workoutItems: TimelineItem[] = [
  {
    id: '1', time: '11:35', endTime: '13:05', title: 'Cardio',
    meta: { iconName: 'heart', calories: '1200', bpm: '90', duration: '03:00' },
  },
  {
    id: '2', time: '14:45', endTime: '15:45', title: 'Muscle',
    meta: { iconName: 'zap',   calories: '980',  bpm: '102', duration: '01:00' },
  },
]

const WorkoutCard: React.FC<{ item: TimelineItem }> = ({ item }) => {
  const m = item.meta as unknown as WorkoutMeta
  return (
    <StyledCard padding={16} borderRadius={20} shadow="light" borderLeftWidth={4} borderLeftColor="#8bc34a">
      <StyledText fontSize={16} fontWeight="800">{item.title}</StyledText>
      <Stack horizontal gap={20} marginTop={8}>
        <StyledText fontSize={13} color="#6b7280">{m.calories} kcal</StyledText>
        <StyledText fontSize={13} color="#6b7280">{m.bpm} bpm</StyledText>
        <StyledText fontSize={13} color="#6b7280">{m.duration} hr</StyledText>
      </Stack>
    </StyledCard>
  )
}

<StyledTimeline
  items={workoutItems}
  renderItem={(item) => <WorkoutCard item={item} />}
  variant="default"
  dotShape="filled"
  dotSize={10}
  timeColumnWidth={58}
  timeGap={12}
  animated
  colors={{ dot: '#8bc34a', line: '#e5e7eb', timeText: '#1a1a1e', endTimeText: '#9ca3af' }}
/>

// ── 4. Mixed: data items + appended children ──────────────────────────────────
<StyledTimeline items={scheduleItems}>
  {/* This node is appended as a final timeline row */}
  <StyledCard padding={12}>
    <StyledText>Don't forget to hydrate! 💚</StyledText>
  </StyledCard>
</StyledTimeline>

// ── 5. Density variants ───────────────────────────────────────────────────────
<StyledTimeline items={items} variant="compact"  />
<StyledTimeline items={items} variant="default"  />
<StyledTimeline items={items} variant="spacious" />

// ── 6. Dot shapes ─────────────────────────────────────────────────────────────
<StyledTimeline items={items} dotShape="filled" />   // solid dot (default)
<StyledTimeline items={items} dotShape="ring"   />   // white fill, coloured border
<StyledTimeline items={items} dotShape="circle" />   // hollow ring

// ── 7. Blue theme with ring dots ─────────────────────────────────────────────
<StyledTimeline
  items={items}
  variant="spacious"
  dotShape="ring"
  colors={{ dot: '#2196f3', line: '#bbdefb', dotBorder: '#fff' }}
/>

// ── 8. Press handler — navigate on tap ───────────────────────────────────────
<StyledTimeline
  items={items}
  onItemPress={(item) => navigation.navigate('SessionDetail', { id: item.id })}
/>

// ── 9. Conditional rendering (rest day) ──────────────────────────────────────
// items is [] for rest days — render an empty state instead
{items.length > 0 ? (
  <StyledTimeline items={items} renderItem={(item) => <WorkoutCard item={item} />} />
) : (
  <Stack alignItems="center" paddingVertical={48}>
    <StyledText fontSize={18} fontWeight="800">Rest Day</StyledText>
    <StyledText fontSize={14} color="#9ca3af">Recovery is part of the plan.</StyledText>
  </Stack>
)}
```

---

### StyledRadio / StyledRadioGroup

Production-ready radio button system with three sub-components and three layout variants. Supports controlled and uncontrolled modes, generic value types, animated dot transitions, and full colour overrides.

```tsx
import { StyledRadio, StyledRadioGroup } from 'fluent-styles'
```

#### Sub-components

| Component | Description |
|---|---|
| `StyledRadio` | Raw animated radio dot — for custom layouts |
| `StyledRadioGroup` | Full managed group with `list`, `card`, and `boxed` variants |

#### Sizes (`RadioSize`)

| Size | Outer | Inner dot | Border |
|---|---|---|---|
| `sm` | 16 | 7 | 1.5 |
| `md` | 20 | 9 | 2.0 |
| `lg` | 24 | 11 | 2.5 |

#### Variants (`RadioVariant`)

| Variant | Description |
|---|---|
| `list` | Full-width bordered rows — each option is a standalone pressable card |
| `card` | Horizontal grid (configurable columns) — compact cards for delivery/plan selection |
| `boxed` | Single card wrapper with a title + divider-separated rows inside |

#### `RadioOption<T>`

| Field | Type | Description |
|---|---|---|
| `value` | `T` | Unique option value (string or number) |
| `label` | `string` | Primary label text |
| `subtitle` | `string` | Secondary description line |
| `rightContent` | `ReactNode` | Content displayed on the right (price, tag, etc.) |
| `leadingContent` | `ReactNode` | Leading content (logo, icon, etc.) |
| `badge` | `ReactNode` | Inline badge after the label (e.g. `"SAVE 33%"`) |
| `disabled` | `boolean` | Disables this specific option |

#### `StyledRadioColors`

| Field | Default | Description |
|---|---|---|
| `active` | `gray[900]` | Active dot and border colour |
| `inactive` | `gray[300]` | Inactive ring colour |
| `selectedCardBg` | `active + 5% opacity` | Selected item background |
| `selectedCardBorder` | `active` | Selected item border |
| `unselectedCardBorder` | `gray[200]` | Unselected item border |
| `label` | `gray[900]` | Label text colour |
| `subtitle` | `gray[400]` | Subtitle text colour |

#### `StyledRadioGroupProps<T>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `options` | `RadioOption<T>[]` | — | Options to render |
| `value` | `T` | — | Controlled selected value |
| `defaultValue` | `T` | — | Initial value for uncontrolled mode |
| `onChange` | `(value: T) => void` | — | Called when selection changes |
| `variant` | `RadioVariant` | `'list'` | Layout variant |
| `size` | `RadioSize` | `'md'` | Dot size preset |
| `title` | `string` | — | Section title (shown in `boxed` variant) |
| `colors` | `StyledRadioColors` | — | Colour overrides |
| `columns` | `number` | `3` | Columns for `card` variant |
| `gap` | `number` | `10` | Gap between cards in `card` variant |

#### Usage

```tsx
import React, { useState } from 'react'
import { StyledRadioGroup, StyledRadio, StyledCard, Stack, StyledText, type RadioOption } from 'fluent-styles'

// ── Shared colour theme ───────────────────────────────────────────────────────
const BLUE_COLORS = {
  active:               '#2563eb',
  selectedCardBg:       '#eff6ff',
  selectedCardBorder:   '#2563eb',
  unselectedCardBorder: '#e5e7eb',
}

// ── 1. Subscription plan — list variant with badge + price block ──────────────
// badge and rightContent let you embed arbitrary nodes beside each option.
const PriceBlock = ({ main, sub }: { main: string; sub: string }) => (
  <Stack alignItems="flex-end" gap={2}>
    <StyledText fontSize={14} fontWeight="600">{main}</StyledText>
    <StyledText fontSize={12} color="#9ca3af">{sub}</StyledText>
  </Stack>
)

const SaveBadge = ({ label }: { label: string }) => (
  <Stack paddingHorizontal={8} paddingVertical={3} borderRadius={6} backgroundColor="#dcfce7">
    <StyledText fontSize={10} fontWeight="700" color="#16a34a">{label}</StyledText>
  </Stack>
)

const [plan, setPlan] = useState('yearly')

<StyledRadioGroup
  options={[
    {
      value: 'yearly',
      label: 'Yearly',
      badge:        <SaveBadge label="SAVE 33%" />,
      rightContent: <PriceBlock main="$19.99/month" sub="$240 billed yearly" />,
    },
    {
      value: 'monthly',
      label: 'Monthly',
      rightContent: <PriceBlock main="$24/month" sub="$24 billed monthly" />,
    },
  ]}
  value={plan}
  onChange={setPlan}
  variant="list"
  colors={BLUE_COLORS}
/>

// ── 2. Billing period — boxed variant inside a card ─────────────────────────
// `title` renders a bold heading inside the card above the options.
<StyledRadioGroup
  title="Billing Period"
  options={[
    { value: 'monthly', label: 'Monthly', rightContent: <StyledText>$9.99/month</StyledText> },
    { value: 'yearly',  label: 'Yearly',  rightContent: <StyledText>$12.99/month</StyledText> },
  ]}
  defaultValue="monthly"
  variant="boxed"
/>

// ── 3. Delivery method — card variant (3-column grid, blue accent) ────────────
// Each option becomes a compact card; columns controls the grid width.
<StyledRadioGroup
  options={[
    { value: 'standard',  label: 'Standard',   subtitle: '4–10 business days',
      rightContent: <StyledText fontWeight="600">$5.00</StyledText>  },
    { value: 'express',   label: 'Express',    subtitle: '2–5 business days',
      rightContent: <StyledText fontWeight="600" color="#2563eb">$16.00</StyledText> },
    { value: 'superfast', label: 'Super Fast', subtitle: '1 business day',
      rightContent: <StyledText fontWeight="600">$25.00</StyledText> },
  ]}
  defaultValue="express"
  variant="card"
  columns={3}
  gap={10}
  colors={{ ...BLUE_COLORS, subtitle: '#2563eb' }}
/>

// ── 4. Payment method — list variant with leading card logos ──────────────────
// leadingContent rows any node before the radio dot (logos, avatars, icons…).
const VisaLogo = () => (
  <Stack width={40} height={24} borderRadius={4} backgroundColor="#1a1f71"
    alignItems="center" justifyContent="center">
    <StyledText fontSize={11} fontWeight="900" color="#fff">VISA</StyledText>
  </Stack>
)

const MastercardLogo = () => (
  <Stack width={36} height={24} borderRadius={4} backgroundColor="#f4f4f4"
    alignItems="center" justifyContent="center">
    <Stack horizontal>
      <Stack width={14} height={14} borderRadius={7} backgroundColor="#eb001b" />
      <Stack width={14} height={14} borderRadius={7} backgroundColor="#f79e1b" style={{ marginLeft: -5 }} />
    </Stack>
  </Stack>
)

<StyledRadioGroup
  options={[
    { value: 'mc8304',   leadingContent: <MastercardLogo />, label: '**** 8304',
      subtitle: 'Last used: Mar 26, 2022' },
    { value: 'visa0123', leadingContent: <VisaLogo />,        label: '**** 0123',
      subtitle: 'Never used' },
  ]}
  defaultValue="visa0123"
  variant="list"
  colors={BLUE_COLORS}
/>

// ── 5. Size variants — sm / md / lg ─────────────────────────────────────────
// Size affects only the radio dot; overall row proportions stay the same.
<Stack gap={14}>
  {(['sm', 'md', 'lg'] as const).map((size) => (
    <Stack key={size}>
      <StyledText fontSize={12} color="#9ca3af" marginBottom={8}>{size}</StyledText>
      <StyledRadioGroup
        options={[
          { value: 'a', label: 'Option A', rightContent: <StyledText>$5.00</StyledText>  },
          { value: 'b', label: 'Option B', rightContent: <StyledText>$10.00</StyledText> },
        ]}
        defaultValue="a"
        variant="list"
        size={size}
        colors={BLUE_COLORS}
      />
    </Stack>
  ))}
</Stack>

// ── 6. Disabled individual options ───────────────────────────────────────────
// Set disabled: true on any RadioOption to grey it out and block interaction.
<StyledRadioGroup
  options={[
    { value: 'active',   label: 'Active option',   rightContent: <StyledText>$9.99</StyledText>  },
    { value: 'disabled', label: 'Disabled option',  rightContent: <StyledText>$19.99</StyledText>, disabled: true },
    { value: 'other',    label: 'Another option',   rightContent: <StyledText>$5.99</StyledText>  },
  ]}
  defaultValue="active"
  variant="list"
  colors={BLUE_COLORS}
/>

// ── 7. StyledRadio standalone — custom layout swatches ───────────────────────
// Use StyledRadio directly when you need the dot inside your own layout.
<StyledCard padding={16} borderRadius={14} shadow="light">
  <Stack gap={16}>
    {[
      { label: 'Selected · dark',  selected: true,  color: '#111827' },
      { label: 'Unselected',       selected: false, color: '#111827' },
      { label: 'Selected · blue',  selected: true,  color: '#2563eb' },
      { label: 'Selected · green', selected: true,  color: '#16a34a' },
      { label: 'Selected · rose',  selected: true,  color: '#e11d48' },
    ].map(({ label, selected, color }) => (
      <Stack key={label} horizontal alignItems="center" gap={12}>
        <StyledRadio selected={selected} color={color} size="md" />
        <StyledText fontSize={14} color="#374151">{label}</StyledText>
      </Stack>
    ))}
  </Stack>
</StyledCard>
```

---

### StyledProgressBar

Animated progress bar with 5 variants, 5 size presets, 3 shapes, 5 label positions, and full colour overrides. Backed by `react-native-svg` for gradient and striped fills.

```tsx
import { StyledProgressBar } from 'fluent-styles'
```

#### Variants

| Variant | Description |
|---|---|
| `default` | Flat filled bar |
| `striped` | Diagonal animated stripe overlay |
| `gradient` | Left-to-right colour gradient (SVG) |
| `segmented` | Divided into N equal tick segments |
| `buffer` | Primary fill + secondary buffer track (media player style) |

#### Sizes

| Size | Height |
|---|---|
| `xs` | 3 px |
| `sm` | 6 px |
| `md` | 10 px (default) |
| `lg` | 16 px |
| `xl` | 24 px |

#### Shapes

| Shape | Border radius |
|---|---|
| `rounded` | `height / 2` (default) |
| `square` | `0` |
| `pill` | `999` |

#### Label positions

| Position | Placement |
|---|---|
| `none` | Hidden (default) |
| `above` | Right-aligned above the bar |
| `below` | Right-aligned below the bar |
| `right` | Inline to the right of the bar |
| `inside` | Centred inside the filled bar (requires `lg` or `xl`) |

#### `StyledProgressColors`

| Field | Default | Description |
|---|---|---|
| `fill` | `blue[500]` | Filled track colour |
| `track` | `gray[100]` | Background track colour |
| `buffer` | `gray[300]` | Buffer layer colour (`buffer` variant) |
| `stripe` | `rgba(255,255,255,0.25)` | Stripe overlay (`striped` variant) |
| `gradFrom` | `blue[400]` | Gradient start (`gradient` variant) |
| `gradTo` | `indigo[600]` | Gradient end (`gradient` variant) |
| `label` | `gray[700]` | External label text colour |
| `labelInside` | `white` | Inside label colour |

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | required | Current progress (0–`total`) |
| `total` | `number` | `100` | Maximum value |
| `bufferValue` | `number` | = `value` | Buffer position (`buffer` variant) |
| `variant` | `ProgressVariant` | `'default'` | Visual style |
| `size` | `ProgressSize` | `'md'` | Height preset |
| `shape` | `ProgressShape` | `'rounded'` | Bar end shape |
| `labelPosition` | `LabelPosition` | `'none'` | Where to show the percentage |
| `label` | `string \| false` | auto `%` | Custom label; `false` hides it |
| `showSteps` | `boolean` | `false` | Show `value / total` instead of `%` |
| `segments` | `number` | `5` | Segment count (`segmented` variant) |
| `segmentGap` | `number` | `3` | Gap between segments in px |
| `width` | `number` | container width | Explicit pixel width |
| `animated` | `boolean` | `true` | Animate fill on mount / value change |
| `animationDuration` | `number` | `600` | Animation duration in ms |
| `colors` | `StyledProgressColors` | blue theme | Colour overrides |
| `onAnimationComplete` | `() => void` | — | Fires when animation finishes |

#### Usage

```tsx
import { StyledProgressBar } from 'fluent-styles'

// ── 1. Variants ───────────────────────────────────────────────────────────────
<StyledProgressBar value={65} labelPosition="right" />

<StyledProgressBar value={45} variant="striped" size="lg" labelPosition="right" />

<StyledProgressBar value={72} variant="gradient" labelPosition="right"
  colors={{ gradFrom: '#6366f1', gradTo: '#22d3ee' }} />

// Segmented — workout sets: 5 of 9 complete
<StyledProgressBar
  value={5}
  total={9}
  variant="segmented"
  segments={9}
  showSteps
  labelPosition="right"
  colors={{ fill: '#8bc34a', track: '#e5e7eb' }}
/>

// Buffer — media player (loaded 60%, played 30%)
<StyledProgressBar
  value={30}
  bufferValue={60}
  variant="buffer"
  size="sm"
  labelPosition="right"
  colors={{ fill: '#2563eb', buffer: '#bfdbfe', track: '#e5e7eb' }}
/>

// ── 2. Sizes side-by-side ─────────────────────────────────────────────────────
{(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((s) => (
  <StyledProgressBar key={s} value={65} size={s} labelPosition="right"
    colors={{ fill: '#3b82f6' }} />
))}

// ── 3. Label positions ────────────────────────────────────────────────────────
<StyledProgressBar value={60} labelPosition="above" />
<StyledProgressBar value={60} labelPosition="below" />
<StyledProgressBar value={60} labelPosition="right" />
// Inside label requires lg or xl
<StyledProgressBar value={60} size="lg" labelPosition="inside"
  colors={{ fill: '#3b82f6', labelInside: '#fff' }} />
<StyledProgressBar value={55} size="xl" variant="striped" labelPosition="inside"
  colors={{ fill: '#8bc34a', labelInside: '#1a1a1a' }} />

// ── 4. Shapes ─────────────────────────────────────────────────────────────────
<StyledProgressBar value={65} size="lg" shape="rounded" labelPosition="right" />
<StyledProgressBar value={65} size="lg" shape="square"  labelPosition="right" />
<StyledProgressBar value={65} size="lg" shape="pill"    labelPosition="right" />

// ── 5. Colour themes ─────────────────────────────────────────────────────────
<StyledProgressBar value={65} size="md" labelPosition="right" colors={{ fill: '#3b82f6', track: '#dbeafe' }} />
<StyledProgressBar value={65} size="md" labelPosition="right" colors={{ fill: '#8bc34a', track: '#ecfccb' }} />
<StyledProgressBar value={65} size="md" labelPosition="right" colors={{ fill: '#f43f5e', track: '#ffe4e6' }} />
<StyledProgressBar value={65} size="md" labelPosition="right" colors={{ fill: '#f59e0b', track: '#fef3c7' }} />

// ── 6. Gradient themes ────────────────────────────────────────────────────────
{[
  { label: 'Indigo → Cyan',  from: '#6366f1', to: '#22d3ee' },
  { label: 'Rose → Orange',  from: '#f43f5e', to: '#fb923c' },
  { label: 'Lime → Emerald', from: '#a3e635', to: '#10b981' },
  { label: 'Violet → Pink',  from: '#8b5cf6', to: '#ec4899' },
].map(({ from, to }) => (
  <StyledProgressBar value={70} variant="gradient" size="md" labelPosition="right"
    colors={{ gradFrom: from, gradTo: to }} />
))}

// ── 7. Controlled with button strip ──────────────────────────────────────────
const [progress, setProgress] = useState(45)

<StyledProgressBar value={progress} variant="gradient" size="lg" labelPosition="above"
  animationDuration={400}
  colors={{ gradFrom: '#6366f1', gradTo: '#22d3ee' }} />

<Stack horizontal gap={10} justifyContent="center">
  {[0, 25, 50, 75, 100].map((v) => (
    <StyledPressable key={v} onPress={() => setProgress(v)}
      paddingHorizontal={14} paddingVertical={8} borderRadius={20}
      backgroundColor={progress === v ? '#6366f1' : '#f3f4f6'}>
      <StyledText fontSize={13} fontWeight="600"
        color={progress === v ? '#fff' : '#374151'}>{v}%</StyledText>
    </StyledPressable>
  ))}
</Stack>

// ── 8. Real-world: workout card ───────────────────────────────────────────────
{[
  { title: 'Cardio',  progress: 65, label: '4 Of 6', color: '#dc2626', bg: '#fff0f0' },
  { title: 'Muscle',  progress: 62, label: '5 Of 8', color: '#9333ea', bg: '#fdf4ff' },
  { title: 'Weight',  progress: 44, label: '4 Of 9', color: '#ea580c', bg: '#fff7ed' },
].map(({ title, progress, label, color, bg }) => (
  <Stack key={title} marginBottom={16}>
    <Stack horizontal alignItems="center" gap={10} marginBottom={8}>
      <Stack width={32} height={32} borderRadius={16} backgroundColor={bg}
        alignItems="center" justifyContent="center">
        <Icon name="activity" size={14} color={color} />
      </Stack>
      <StyledText fontSize={14} fontWeight="700">{title}</StyledText>
    </Stack>
    <StyledProgressBar
      value={progress}
      size="sm"
      labelPosition="right"
      label={label}
      colors={{ fill: color, track: '#f3f4f6' }}
    />
  </Stack>
))}

// ── 9. Real-world: file upload status ─────────────────────────────────────────
{[
  { name: 'design-assets.zip', size: '24.5 MB', value: 100, done: true  },
  { name: 'report-final.pdf',  size: '3.2 MB',  value: 67,  done: false },
  { name: 'video-export.mp4',  size: '128 MB',  value: 23,  done: false },
].map(({ name, size, value, done }) => (
  <Stack key={name} marginBottom={14}>
    <Stack horizontal alignItems="center" justifyContent="space-between" marginBottom={6}>
      <StyledText fontSize={13} fontWeight="600">{name}</StyledText>
      <StyledText fontSize={11} color="#9ca3af">{size}</StyledText>
    </Stack>
    <StyledProgressBar
      value={value}
      size="xs"
      shape="pill"
      colors={{ fill: done ? '#10b981' : '#3b82f6', track: '#f3f4f6' }}
    />
  </Stack>
))}

// ── 10. Real-world: skills profile ────────────────────────────────────────────
{[
  { skill: 'React Native', pct: 92 },
  { skill: 'TypeScript',   pct: 85 },
  { skill: 'UI Design',    pct: 74 },
].map(({ skill, pct }) => (
  <Stack key={skill} horizontal alignItems="center" gap={12} marginBottom={12}>
    <StyledText fontSize={13} fontWeight="600" width={100}>{skill}</StyledText>
    <Stack flex={1}>
      <StyledProgressBar value={pct} size="md" variant="gradient" labelPosition="right"
        colors={{ gradFrom: '#6366f1', gradTo: '#8b5cf6' }} />
    </Stack>
  </Stack>
))}
```

---

### StyledSlider

Gesture-driven slider with PanResponder, animated thumb scale, tooltip, tick marks, and 5 variants. Range mode manages two independent thumbs. Backed by `react-native-svg` for gradient fills.

```tsx
import { StyledSlider } from 'fluent-styles'
```

#### Variants

| Variant | Description |
|---|---|
| `default` | Single thumb, fill left of thumb |
| `range` | Two thumbs, fill between them |
| `stepped` | Snaps to discrete tick marks |
| `gradient` | Gradient-filled track |
| `buffer` | Primary thumb + secondary buffer fill (media player style) |

#### Sizes

| Size | Track height | Thumb diameter |
|---|---|---|
| `sm` | 4 px | 18 px |
| `md` | 6 px (default) | 24 px |
| `lg` | 10 px | 32 px |

#### `StyledSliderColors`

| Field | Default | Description |
|---|---|---|
| `fill` | `#3b82f6` | Filled track colour |
| `track` | `gray[200]` | Background track |
| `buffer` | `gray[300]` | Buffer fill (`buffer` variant) |
| `thumb` | `white` | Thumb fill |
| `thumbBorder` | = `fill` | Thumb border colour |
| `gradFrom` | `#60a5fa` | Gradient start (`gradient` variant) |
| `gradTo` | `#4f46e5` | Gradient end (`gradient` variant) |
| `tooltipBg` | `#111827` | Tooltip background |
| `tooltipText` | `white` | Tooltip text |
| `rangeLabel` | `gray[400]` | Min/max label colour |
| `tick` | `gray[300]` | Inactive tick colour |
| `tickActive` | = `fill` | Filled tick colour |

#### Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `value` | `number` | required | Current thumb value (or low thumb for `range`) |
| `valueHigh` | `number` | — | High thumb value (`range` variant) |
| `bufferValue` | `number` | — | Buffer position (`buffer` variant) |
| `min` | `number` | `0` | Minimum value |
| `max` | `number` | `100` | Maximum value |
| `step` | `number` | `1` | Step increment |
| `variant` | `SliderVariant` | `'default'` | Visual style |
| `size` | `SliderSize` | `'md'` | Track/thumb size preset |
| `showTooltip` | `boolean` | `true` | Show tooltip while dragging |
| `alwaysShowTooltip` | `boolean` | `false` | Keep tooltip permanently visible |
| `showMinMax` | `boolean` | `false` | Display min/max labels at track ends |
| `steps` | `number` | `5` | Number of ticks (`stepped` variant) |
| `formatLabel` | `(v: number) => string` | `String(v)` | Custom tooltip/tick label formatter |
| `width` | `number` | container width | Explicit pixel width |
| `disabled` | `boolean` | `false` | Disables interaction, reduces opacity |
| `colors` | `StyledSliderColors` | blue theme | Colour overrides |
| `onValueChange` | `(value: number) => void` | — | Fires continuously while dragging |
| `onSlidingComplete` | `(value: number) => void` | — | Fires once on drag release |
| `onRangeChange` | `(low, high: number) => void` | — | Range drag callback |
| `onRangeComplete` | `(low, high: number) => void` | — | Range drag-release callback |

#### Usage

```tsx
import React, { useState } from 'react'
import { StyledSlider, Stack, StyledText } from 'fluent-styles'
import Icon from 'react-native-vector-icons/Feather'

// ── 1. Default — basic volume control ────────────────────────────────────────
const [vol, setVol] = useState(65)

<StyledSlider value={vol} onValueChange={setVol} showMinMax />

// ── 2. Range — price filter ───────────────────────────────────────────────────
// valueHigh is required for the range variant.
const [priceLow, setPriceLow]   = useState(20)
const [priceHigh, setPriceHigh] = useState(75)

<StyledSlider
  variant="range"
  value={priceLow}
  valueHigh={priceHigh}
  min={0}
  max={200}
  step={5}
  onRangeChange={(lo, hi) => { setPriceLow(lo); setPriceHigh(hi) }}
  showMinMax
  formatLabel={(v) => `$${v}`}
  colors={{ fill: '#6366f1', thumbBorder: '#6366f1', tooltipBg: '#6366f1' }}
/>

// ── 3. Stepped — star rating (snaps to 5 ticks) ───────────────────────────────
// steps controls both the number of ticks and the snap resolution.
const [rating, setRating] = useState(4)

<StyledSlider
  variant="stepped"
  value={rating}
  min={1} max={5} steps={5}
  onValueChange={setRating}
  alwaysShowTooltip
  size="lg"
  formatLabel={(v) => ['','★','★★','★★★','★★★★','★★★★★'][Math.round(v)] ?? ''}
  colors={{
    fill:        '#f59e0b',
    track:       '#fef3c7',
    thumbBorder: '#f59e0b',
    tooltipBg:   '#f59e0b',
    tickActive:  '#f59e0b',
  }}
/>

// ── 4. Gradient — temperature control ────────────────────────────────────────
const [temp, setTemp] = useState(22)

<StyledSlider
  variant="gradient"
  value={temp}
  min={10} max={35}
  onValueChange={setTemp}
  formatLabel={(v) => `${v}°`}
  alwaysShowTooltip
  showMinMax
  size="lg"
  colors={{
    gradFrom:  '#60a5fa',
    gradTo:    '#ef4444',
    tooltipBg: temp < 22 ? '#60a5fa' : '#ef4444',
  }}
/>

// ── 5. Buffer — media player seek bar ────────────────────────────────────────
const formatTime = (s: number) =>
  `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

const [played, setPlayed] = useState(95)
const DURATION = 243

<StyledSlider
  variant="buffer"
  value={played}
  bufferValue={Math.min(played + 60, DURATION)}
  min={0}
  max={DURATION}
  size="sm"
  onValueChange={setPlayed}
  formatLabel={formatTime}
  colors={{ fill: '#2563eb', buffer: '#bfdbfe' }}
/>

// ── 6. Sizes ──────────────────────────────────────────────────────────────────
<StyledSlider value={40} size="sm" onValueChange={() => {}} />
<StyledSlider value={60} size="md" onValueChange={() => {}} />
<StyledSlider value={80} size="lg" onValueChange={() => {}} />

// ── 7. Colour themes ──────────────────────────────────────────────────────────
{[
  { fill: '#8bc34a', track: '#ecfccb', label: 'Lime'   },
  { fill: '#f43f5e', track: '#ffe4e6', label: 'Rose'   },
  { fill: '#f59e0b', track: '#fef3c7', label: 'Amber'  },
  { fill: '#8b5cf6', track: '#ede9fe', label: 'Purple' },
  { fill: '#14b8a6', track: '#ccfbf1', label: 'Teal'   },
].map(({ fill, track }) => (
  <StyledSlider
    value={65}
    onValueChange={() => {}}
    colors={{ fill, track, thumbBorder: fill, tooltipBg: fill }}
    formatLabel={(v) => `${v}%`}
  />
))}

// ── 8. Real-world: Audio / brightness controls with icons ─────────────────────
<Stack horizontal alignItems="center" gap={12}>
  <Icon name="volume-x" size={18} color="#9ca3af" />
  <Stack flex={1}>
    <StyledSlider value={vol} onValueChange={setVol} showTooltip={false}
      colors={{ fill: '#1a1a1a', track: '#e5e7eb', thumbBorder: '#1a1a1a' }} />
  </Stack>
  <Icon name="volume-2" size={18} color="#9ca3af" />
  <StyledText fontSize={13} fontWeight="600" width={32}>{vol}%</StyledText>
</Stack>

<Stack horizontal alignItems="center" gap={12}>
  <Icon name="sun" size={18} color="#9ca3af" />
  <Stack flex={1}>
    <StyledSlider value={bright} onValueChange={setBright} showTooltip={false}
      colors={{ fill: '#f59e0b', track: '#fef3c7', thumbBorder: '#f59e0b' }} />
  </Stack>
  <Icon name="sun" size={18} color="#f59e0b" />
  <StyledText fontSize={13} fontWeight="600" width={32}>{bright}%</StyledText>
</Stack>

// ── 9. Disabled state ─────────────────────────────────────────────────────────
<StyledSlider value={55} disabled showMinMax />
```

---

### StyledForm

A composable form wrapper that propagates `disabled` / `loading` state to all sub-components via React context, with optional keyboard avoidance and scroll wrapping.

```tsx
import { StyledForm } from 'fluent-styles'
```

#### Sub-components

| Component | Wraps | Description |
|---|---|---|
| `StyledForm.Row` | `Stack horizontal` | Side-by-side inputs |
| `StyledForm.Section` | — | Grouped block with title, subtitle, and optional divider |
| `StyledForm.Actions` | `Stack` | Slot for submit/cancel buttons |
| `StyledForm.Input` | `StyledTextInput` | Text input that inherits form `disabled` / `loading` |
| `StyledForm.Checkbox` | `StyledCheckBox` | Checkbox that inherits form `disabled` |
| `StyledForm.Switch` | `Switch` | Toggle that inherits form `disabled` / `loading` |
| `StyledForm.Select` | `StyledDropdown` | Dropdown picker that inherits form `disabled` |
| `StyledForm.Radio` | `StyledRadioGroup` | Radio group |
| `StyledForm.DatePicker` | `StyledDatePicker` | Date/time picker that inherits form `disabled` |
| `StyledForm.Slider` | `StyledSlider` | Slider that inherits form `disabled` |

#### `StyledForm` root props

| Prop | Type | Default | Description |
|---|---|---|---|
| `disabled` | `boolean` | `false` | Disables all sub-components via context |
| `loading` | `boolean` | `false` | Sets loading state on compatible sub-components |
| `gap` | `number` | `16` | Vertical gap between form fields |
| `avoidKeyboard` | `boolean` | `true` | Wraps content in `KeyboardAvoidingView` |
| `scrollable` | `boolean` | `false` | Wraps content in a `ScrollView` |
| `scrollPadding` | `number` | `40` | Bottom padding inside the scroll view |

#### Usage

```tsx
import { StyledForm, StyledButton, StyledText, StyledDivider, Stack, theme, palettes } from 'fluent-styles'

// ── 1. Sign-up form — inputs, checkbox, inline validation ────────────────────
const [email, setEmail]       = useState('')
const [password, setPassword] = useState('')
const [agreed, setAgreed]     = useState(false)
const [loading, setLoading]   = useState(false)

const errors = {
  email:    email.length > 0 && !email.includes('@') ? 'Enter a valid email' : undefined,
  password: password.length > 0 && password.length < 8 ? 'At least 8 characters' : undefined,
}

<StyledForm gap={16} avoidKeyboard={false} disabled={loading}>
  <StyledForm.Input
    label="Email address"
    required
    variant="outline"
    placeholder="you@example.com"
    keyboardType="email-address"
    autoCapitalize="none"
    value={email}
    onChangeText={setEmail}
    error={!!errors.email}
    errorMessage={errors.email}
  />

  <StyledForm.Input
    label="Password"
    required
    variant="outline"
    placeholder="8+ characters"
    secureTextEntry
    value={password}
    onChangeText={setPassword}
    error={!!errors.password}
    errorMessage={errors.password}
  />

  <StyledDivider borderBottomColor={theme.colors.gray[100]} />

  <Stack horizontal alignItems="center" gap={12}>
    <StyledForm.Checkbox checked={agreed} onCheck={setAgreed} />
    <StyledText fontSize={13}>I agree to the Terms of Service</StyledText>
  </Stack>

  <StyledForm.Actions>
    <StyledButton block loading={loading} onPress={handleSubmit}
      backgroundColor={palettes.indigo[600]}>
      <StyledText color="#fff" fontSize={15} fontWeight="700">
        {loading ? 'Creating account…' : 'Create account'}
      </StyledText>
    </StyledButton>
  </StyledForm.Actions>
</StyledForm>

// ── 2. Profile form — Row, Section, Select, DatePicker, Switch ───────────────
<StyledForm gap={20} avoidKeyboard={false}>
  <StyledForm.Section title="Personal details" subtitle="How you appear to others">
    <StyledForm.Row>
      <StyledForm.Input label="First name" flex={1} variant="outline"
        value={firstName} onChangeText={setFirstName} />
      <StyledForm.Input label="Last name"  flex={1} variant="outline"
        value={lastName}  onChangeText={setLastName}  />
    </StyledForm.Row>

    <StyledForm.Input
      label="Bio" variant="outline" multiline showCounter maxLength={160}
      value={bio} onChangeText={setBio} helperText="Shown on your public profile"
    />

    {/* StyledForm.Select uses the `data` prop (same as StyledDropdown) */}
    <StyledForm.Select
      label="Country"
      variant="outline"
      data={COUNTRY_OPTIONS}
      value={country}
      onChange={(item) => setCountry(item.value)}
      placeholder="Select country"
    />

    <StyledForm.DatePicker
      label="Date of birth" mode="date" variant="input"
      value={dob} onChange={setDob} onConfirm={setDob}
    />
  </StyledForm.Section>

  <StyledForm.Section title="Notifications">
    <Stack horizontal alignItems="center" justifyContent="space-between">
      <StyledText fontSize={14} fontWeight="600">Newsletter</StyledText>
      <StyledForm.Switch value={newsletter} onChange={setNewsletter}
        activeColor={palettes.indigo[600]} />
    </Stack>
  </StyledForm.Section>

  <StyledForm.Actions horizontal gap={10}>
    <StyledButton outline compact flex={1} onPress={discard}>
      <StyledText fontSize={14} fontWeight="600">Discard</StyledText>
    </StyledButton>
    <StyledButton primary compact flex={1}
      backgroundColor={palettes.indigo[600]} onPress={save}>
      <StyledText fontSize={14} fontWeight="700" color="#fff">Save</StyledText>
    </StyledButton>
  </StyledForm.Actions>
</StyledForm>

// ── 3. Subscription form — Radio, Slider, form-level disabled context ─────────
// Setting `disabled` on <StyledForm> propagates down to every sub-component.
<StyledForm gap={20} avoidKeyboard={false} disabled={locked}>
  <StyledForm.Section title="Choose a plan">
    <StyledForm.Radio
      options={PLAN_OPTIONS}
      value={plan}
      onChange={setPlan}
      variant="list"
      colors={{ active: palettes.indigo[600] }}
    />
  </StyledForm.Section>

  <StyledForm.Section title="Team size">
    <StyledForm.Slider
      value={seats}
      min={2} max={50} step={1}
      onValueChange={setSeats}
      formatLabel={(v) => `${v} seats`}
      colors={{ fill: palettes.indigo[600] }}
    />
  </StyledForm.Section>

  <StyledForm.Actions>
    <StyledButton primary block onPress={() => setLocked((v) => !v)}
      backgroundColor={locked ? theme.colors.gray[300] : palettes.indigo[600]}>
      <StyledText fontSize={15} fontWeight="700" color="#fff">
        {locked ? '🔒 Disabled (tap to re-enable)' : 'Subscribe'}
      </StyledText>
    </StyledButton>
  </StyledForm.Actions>
</StyledForm>

// ── 4. Filter panel — compact, no sections ───────────────────────────────────
<StyledForm gap={14} avoidKeyboard={false}>
  <StyledForm.Input
    variant="filled" placeholder="Search products…"
    value={query} onChangeText={setQuery} clearable
  />

  <StyledForm.Select
    label="Region" variant="outline" size="sm"
    data={COUNTRY_OPTIONS} value={country}
    onChange={(item) => setCountry(item.value)}
    placeholder="All regions"
  />

  <StyledForm.Slider
    variant="range"
    value={minPrice} valueHigh={maxPrice}
    min={0} max={1000} step={10}
    onRangeChange={(lo, hi) => { setMinPrice(lo); setMaxPrice(hi) }}
    formatLabel={(v) => `$${v}`}
  />

  <Stack horizontal alignItems="center" justifyContent="space-between">
    <StyledText fontSize={14} fontWeight="600">In stock only</StyledText>
    <StyledForm.Switch value={inStock} onChange={setInStock} size="sm" />
  </Stack>

  <StyledForm.Actions horizontal gap={10}>
    <StyledButton outline compact flex={1} onPress={resetFilters}>
      <StyledText fontSize={13} fontWeight="600">Reset</StyledText>
    </StyledButton>
    <StyledButton primary compact flex={2}
      backgroundColor={theme.colors.gray[900]}>
      <StyledText fontSize={13} fontWeight="700" color="#fff">Apply filters</StyledText>
    </StyledButton>
  </StyledForm.Actions>
</StyledForm>
```

> **Note:** `StyledForm.Select` wraps `StyledDropdown` and therefore uses the `data` prop (not `options`). `StyledForm.Radio` wraps `StyledRadioGroup` and uses the `options` prop.

---

### StyledTable

A responsive data table with client-side and server-side pagination, sortable columns, row selection, striped / dark variants, and an automatic card layout on narrow screens.

```tsx
import { StyledTable, type TableColumn, usePaginatedQuery } from 'fluent-styles'
```

#### `TableColumn<T>` definition

| Field | Type | Description |
|---|---|---|
| `key` | `string` | Must match a key of the row data object |
| `title` | `string` | Column header label |
| `width` | `number` | Fixed column width in px. Omit to stretch (flex: 1) |
| `align` | `left \| center \| right` | Text alignment (default `left`) |
| `sortable` | `boolean` | Allow tapping the header to sort |
| `render` | `(value, row, index) => ReactNode` | Custom cell renderer |

#### `StyledTable` props

| Prop | Type | Default | Description |
|---|---|---|---|
| `columns` | `TableColumn<T>[]` | — | Column definitions |
| `data` | `T[]` | — | Row data (each row must have a unique `id` field) |
| `selectable` | `boolean` | `false` | Show checkboxes for row selection |
| `selectedIds` | `(string \| number)[]` | — | Controlled selection |
| `onSelectionChange` | `(ids) => void` | — | Selection change callback |
| `sortKey` | `string \| null` | — | Controlled sort column |
| `sortDirection` | `asc \| desc \| null` | — | Controlled sort direction |
| `onSort` | `(key, direction) => void` | — | Sort change callback |
| `pagination` | `boolean` | `false` | Enable internal (client-side) pagination |
| `pageSize` | `number` | `10` | Rows per page (internal pagination) |
| `externalPagination` | `boolean` | `false` | Render `data` as-is — parent manages pages |
| `currentPage` | `number` | — | 0-based current page (controlled) |
| `totalPages` | `number` | — | Total pages from the datasource |
| `totalCount` | `number` | — | Total record count |
| `onPageChange` | `(page: number) => void` | — | Page change callback |
| `loading` | `boolean` | `false` | Show loading skeleton over rows |
| `virtualized` | `boolean` | auto | Use `FlatList` renderer (auto-enabled for >50 rows) |
| `striped` | `boolean` | `false` | Alternating row background |
| `showDivider` | `boolean` | `false` | Horizontal divider between rows |
| `scrollable` | `boolean` | `false` | Horizontal scroll when content overflows |
| `emptyText` | `string` | — | Text shown when `data` is empty |
| `emptyNode` | `ReactNode` | — | Custom empty state node |
| `colors` | `Partial<TableColors>` | — | Color token overrides |
| `borderRadius` | `number` | `16` | Outer container border radius |
| `bordered` | `boolean` | `true` | Show outer card border |
| `cardBreakpoint` | `number` | `768` | Width threshold below which rows switch to card layout |
| `forceTable` | `boolean` | `false` | Always render table rows regardless of screen width |
| `forceCards` | `boolean` | `false` | Always render card layout regardless of screen width |
| `cardRender` | `(row, index, selected, onToggle?) => ReactNode` | — | Custom card renderer for narrow screens |
| `onRowPress` | `(row, index) => void` | — | Row tap callback |

#### Usage

```tsx
import { StyledTable, type TableColumn, theme, palettes } from 'fluent-styles'

// ── 1. Minimal — static data, no pagination ────────────────────────────────
interface UserRow { id: number; name: string; email: string; role: string }

const USER_COLS: TableColumn<UserRow>[] = [
  { key: 'name',  title: 'Name',  render: (v) => <StyledText fontWeight="700">{v}</StyledText> },
  { key: 'email', title: 'Email', render: (v) => <StyledText color={theme.colors.gray[500]}>{v}</StyledText> },
  { key: 'role',  title: 'Role',  width: 90, align: 'center' },
]

<StyledTable columns={USER_COLS} data={users} showDivider />

// ── 2. Sortable + selectable ───────────────────────────────────────────────
const [sel, setSel] = useState<(string | number)[]>([])

const PRODUCT_COLS: TableColumn<ProductRow>[] = [
  { key: 'name',  title: 'Product' },
  { key: 'price', title: 'Price',  width: 80, align: 'right', sortable: true,
    render: (v) => <StyledText fontWeight="700">${v}</StyledText> },
  { key: 'stock', title: 'Stock',  width: 80, align: 'center', sortable: true },
  { key: 'status', title: 'Status', width: 110, align: 'center',
    render: (v) => <StatusBadge label={v} /> },
]

<StyledTable
  columns={PRODUCT_COLS}
  data={products}
  selectable
  selectedIds={sel}
  onSelectionChange={setSel}
  showDivider
  pagination
  pageSize={8}
/>

// ── 3. Client-side pagination ──────────────────────────────────────────────
<StyledTable
  columns={ORDER_COLS}
  data={orders}          // pass the full dataset
  pagination             // StyledTable slices it internally
  pageSize={10}
  showDivider
  bordered
/>

// ── 4. External pagination (REST API) ─────────────────────────────────────
// Use the `usePaginatedQuery` hook to manage page state, sorting, search,
// and loading — then spread `table.tableProps` onto StyledTable.
const table = usePaginatedQuery<Order>({
  pageSize: 10,
  fetcher: async ({ page, pageSize, sortKey, sortDir, search, filters }) => {
    const res = await api.get('/orders', { params: { page, pageSize, sortKey, sortDir, search, ...filters } })
    return { data: res.data.items, totalCount: res.data.total }
  },
  initialSortKey: 'date',
  initialSortDir: 'desc',
})

<StyledTable
  columns={ORDER_COLS}
  {...table.tableProps}   // wires data, loading, pagination state, sort, onSort, onPageChange
  showDivider
  bordered
/>

// ── 5. Realm / SQLite (synchronous) ───────────────────────────────────────
const table = usePaginatedQuery<Employee>({
  pageSize: 15,
  realmQuery: ({ page, pageSize, sortKey, sortDir, search }) => {
    const results = realm.objects('Employee').sorted(sortKey ?? 'name', sortDir === 'desc')
    return { data: Array.from(results).slice(page * pageSize, (page + 1) * pageSize), totalCount: results.length }
  },
})

<StyledTable columns={EMP_COLS} {...table.tableProps} showDivider bordered />

// ── 6. Custom card layout (narrow screens) ────────────────────────────────
// `forceCards` renders the custom card renderer regardless of screen width.
// `forceTable` always renders the table.
// Default: auto-switches at the `cardBreakpoint` (768 px).
<StyledTable
  columns={PRODUCT_COLS}
  data={products}
  pagination
  pageSize={6}
  forceCards
  bordered={false}
  cardRender={(row, index, isSelected, onToggle) => (
    <ProductCard row={row} isSelected={isSelected} onToggle={onToggle} />
  )}
/>

// ── 7. Striped + dark theme ────────────────────────────────────────────────
// Striped
<StyledTable columns={USER_COLS} data={users} striped showDivider={false} />

// Dark theme via color overrides
<StyledTable
  columns={USER_COLS}
  data={users}
  showDivider
  colors={{
    background:     theme.colors.gray[900],
    headerBg:       theme.colors.gray[800],
    headerText:     theme.colors.gray[400],
    rowBg:          theme.colors.gray[900],
    border:         theme.colors.gray[700],
    divider:        theme.colors.gray[700],
    text:           theme.colors.gray[100],
    sortActive:     theme.colors.gray[100],
    sortInactive:   theme.colors.gray[600],
    selectedBg:     palettes.indigo[900],
    selectedBorder: palettes.indigo[500],
  }}
/>

// ── 8. Custom empty state ─────────────────────────────────────────────────
<StyledTable
  columns={USER_COLS}
  data={[]}
  emptyNode={
    <Stack alignItems="center" gap={8}>
      <StyledText fontSize={32}>🗂️</StyledText>
      <StyledText fontSize={15} fontWeight="700">No users yet</StyledText>
      <StyledText fontSize={13} color={theme.colors.gray[400]}>Invite someone to get started.</StyledText>
    </Stack>
  }
/>
```

#### `usePaginatedQuery` hook

Manages page, sort, search, filters, loading, and error for external data sources. Returns `table.tableProps` which can be spread directly onto `StyledTable`.

```tsx
const table = usePaginatedQuery<T>(options)

// Spread onto StyledTable:
<StyledTable columns={COLS} {...table.tableProps} />
```

| Option | Type | Description |
|---|---|---|
| `pageSize` | `number` | Rows per page |
| `fetcher` | `async (params) => { data, totalCount }` | Async REST / GraphQL fetcher |
| `realmQuery` | `(params) => { data, totalCount }` | Synchronous Realm / SQLite query |
| `initialSortKey` | `string` | Initial sort column |
| `initialSortDir` | `asc \| desc \| null` | Initial sort direction |
| `initialSearch` | `string` | Initial search string |
| `initialFilters` | `Record<string, any>` | Initial filter values |
| `searchDebounce` | `number` | Search debounce ms (default 300) |

`table` return value exposes: `data`, `loading`, `error`, `totalCount`, `totalPages`, `page`, `setPage`, `sortKey`, `sortDir`, `setSort`, `search`, `setSearch`, `filters`, `setFilters`, `refresh`, and `tableProps` (ready to spread).

---

## Hooks

All hooks require a `PortalManager` ancestor.

### useToast

```tsx
import { useToast } from 'fluent-styles'

const toast = useToast()

// --- Shortcut methods ---
toast.success('Profile saved')
toast.error('Upload failed', 'The selected file is larger than 5 MB.')
toast.warning('Unsaved changes', 'You have pending edits on this screen.')
toast.info('New update available', 'Restart the app to use the latest version.')

// --- Full control with show() ---
const id = toast.show({
  message: 'Settings updated',
  description: 'Your preferences were saved successfully.',
  variant: 'success',     // 'success' | 'error' | 'warning' | 'info'
  duration: 2500,
  theme: 'light',         // 'light' | 'dark' | 'system'
})

// Dark-themed toast
toast.show({
  message: 'Background sync started',
  description: 'We will notify you when sync is complete.',
  variant: 'info',
  duration: 4000,
  theme: 'dark',
})

// --- Persistent toast (duration: 0 — never auto-dismisses) ---
const persistId = toast.show({
  message: 'Uploading file…',
  description: 'Please keep the app open until upload finishes.',
  variant: 'info',
  duration: 0,
  theme: 'dark',
})
toast.dismiss(persistId)  // dismiss manually later

// --- Short / long durations ---
toast.show({ message: 'Quick message', variant: 'info', duration: 1200, theme: 'light' })
toast.show({ message: 'Read this carefully', variant: 'warning', duration: 6000, theme: 'light' })

// --- Color token overrides ---
toast.show({
  message: 'Custom success',
  variant: 'success',
  theme: 'light',
  colors: {
    successBg: '#ecfdf5',
    successBorder: '#10b981',
    successLabel: '#065f46',
    description: '#047857',
    closeIcon: '#065f46',
  },
})

toast.show({
  message: 'Custom error',
  variant: 'error',
  theme: 'dark',
  colors: {
    errorBg: '#3b0a0a',
    errorBorder: '#ef4444',
    errorLabel: '#fecaca',
    description: '#fca5a5',
    closeIcon: '#fecaca',
  },
})

// --- Dismiss ---
toast.dismiss(id)    // single
toast.dismissAll()   // all active
```

| Method | Signature | Description |
|---|---|---|
| `show` | `(options) => number` | Show a toast, returns portal id |
| `success` | `(message, description?) => number` | Green success toast |
| `error` | `(message, description?) => number` | Red error toast |
| `warning` | `(message, description?) => number` | Amber warning toast |
| `info` | `(message, description?) => number` | Blue info toast |
| `dismiss` | `(id: number) => void` | Dismiss specific toast |
| `dismissAll` | `() => void` | Dismiss all active toasts |

**`show` options:** `message`, `description?`, `variant`, `duration` (`0` = persistent), `theme`, `colors`

---

### useNotification

```tsx
import { useNotification } from 'fluent-styles'

const notification = useNotification()

// --- Basic notification ---
const id = notification.show({
  title: 'New message from Alex',
  body: 'Hey, are you free this afternoon?',
  source: 'Messages',
  initials: 'AK',
  timestamp: 'now',
  theme: 'dark',
})

// --- With avatar image ---
notification.show({
  title: 'Sarah Johnson',
  body: 'Sent you 3 new design files.',
  source: 'Drive',
  avatar: { uri: 'https://example.com/avatar.jpg' },
  timestamp: '2m',
  theme: 'light',
})

// --- With action button ---
notification.show({
  title: 'Deployment finished',
  body: 'Production build completed successfully.',
  source: 'CI/CD',
  initials: 'CI',
  timestamp: 'now',
  actionLabel: 'Open',
  onAction: () => navigate('Dashboard'),
  theme: 'dark',
})

// --- Custom duration ---
notification.show({ title: 'Quick', body: 'Disappears fast', initials: 'Q', duration: 1500, theme: 'light' })
notification.show({ title: 'Long',  body: 'Stays a while',   initials: 'L', duration: 8000, theme: 'dark'  })

// --- Color token overrides ---
notification.show({
  title: 'Custom brand notification',
  body: 'Using token overrides on top of the active theme.',
  source: 'Brand',
  initials: 'BR',
  timestamp: 'now',
  theme: 'light',
  actionLabel: 'View',
  onAction: () => navigate('Brand'),
  colors: {
    background: '#eff6ff',
    border: '#2563eb',
    title: '#1e3a8a',
    body: '#1d4ed8',
    source: '#2563eb',
    timestamp: '#3b82f6',
    avatarBg: '#dbeafe',
    avatarBorder: '#60a5fa',
    avatarInitials: '#1d4ed8',
    actionBg: '#dbeafe',
    actionLabel: '#1d4ed8',
    closeIcon: '#1d4ed8',
  },
})

// --- Real-world examples ---
notification.show({
  title: 'New comment on your PR',
  body: 'Chris left feedback on the latest changes.',
  source: 'Git',
  initials: 'CK',
  timestamp: '1m',
  actionLabel: 'Review',
  onAction: () => navigate('PRReview'),
  theme: 'dark',
})

notification.show({
  title: 'Meeting starts in 10 minutes',
  body: 'Frontend sync with the product team.',
  source: 'Calendar',
  initials: 'CA',
  timestamp: 'soon',
  actionLabel: 'Join',
  onAction: joinMeeting,
  theme: 'light',
})

notification.dismiss(id)
```

**Show options:** `title`, `body`, `avatar`, `initials`, `source`, `timestamp`, `actionLabel`, `onAction`, `duration` (`0` = persistent), `theme`, `colors`

---

### useDialogue

```tsx
import { useDialogue } from 'fluent-styles'

const dialogue = useDialogue()

// --- Alert (Promise<void>) ---
await dialogue.alert(
  'Session expired',
  'Please log in again to continue.',
  '🔒',
  'light',  // optional theme
)

// --- Confirm (Promise<boolean>) ---
const confirmed = await dialogue.confirm({
  title: 'Save changes?',
  message: 'Your edits will be saved to this project.',
  icon: '💾',
  confirmLabel: 'Save',
  cancelLabel: 'Cancel',
  theme: 'light',
})
if (confirmed) save()

// --- Destructive confirm ---
const ok = await dialogue.confirm({
  title: 'Delete project?',
  message: 'This action cannot be undone.',
  icon: '⚠️',
  confirmLabel: 'Delete',
  cancelLabel: 'Keep it',
  destructive: true,
})
if (ok) deleteProject()

// --- Custom multi-action dialogue ---
dialogue.show({
  title: 'Unsaved changes',
  message: 'You have unsaved edits. What would you like to do?',
  icon: '📝',
  theme: 'light',
  actions: [
    { label: 'Discard',      variant: 'destructive', onPress: () => discard() },
    { label: 'Save draft',   variant: 'secondary',   onPress: () => saveDraft() },
    { label: 'Keep editing', variant: 'primary',     onPress: () => keepEditing() },
  ],
})

// --- Async chained flow (confirm then alert) ---
const publish = async () => {
  const confirmed = await dialogue.confirm({
    title: 'Publish update?',
    message: 'This will make the latest version visible to users.',
    icon: '🚀',
    confirmLabel: 'Publish',
    cancelLabel: 'Not now',
    theme: 'light',
  })
  if (!confirmed) return

  await performPublish()

  await dialogue.alert('Published', 'Your update is now live.', '✅')
}

// --- Programmatic dismiss by id ---
const id = dialogue.show({
  title: 'Temporary dialogue',
  message: 'This will close automatically in 2 seconds.',
  icon: '⏳',
  theme: 'light',
  actions: [{ label: 'OK', variant: 'primary', onPress: () => {} }],
})
setTimeout(() => dialogue.dismiss(id), 2000)

// --- Real-world: log out + rate app ---
const handleLogout = async () => {
  const ok = await dialogue.confirm({ title: 'Log out?', message: 'You will need to sign in again.', icon: '👋', confirmLabel: 'Log out', destructive: true })
  if (ok) logout()
}

const handleRateApp = () => {
  dialogue.show({
    title: 'Enjoying the app?',
    icon: '⭐',
    actions: [
      { label: '😠 1',  variant: 'secondary', onPress: () => submitRating(1) },
      { label: '😐 3',  variant: 'secondary', onPress: () => submitRating(3) },
      { label: '😁 5',  variant: 'primary',   onPress: () => submitRating(5) },
    ],
  })
}
```

**Action variants:** `primary` | `secondary` | `destructive`

---

### useActionSheet

```tsx
import { useActionSheet } from 'fluent-styles'

const actionSheet = useActionSheet()

// Items list
actionSheet.show({
  title: 'Post options',
  items: [
    { icon: '✏️', label: 'Edit',      onPress: onEdit },
    { icon: '🔗', label: 'Copy link', onPress: onCopy },
    { icon: '🚩', label: 'Report',    variant: 'destructive', onPress: onReport },
    { icon: '🔒', label: 'Premium',   variant: 'disabled' },
  ],
})

// Custom content sheet
actionSheet.present(<MyDatePicker onChange={setDate} />, { title: 'Pick a date' })

// Mixed: content + items
actionSheet.show({
  title: 'Choose a colour',
  children: <ColorSwatchRow onSelect={setColor} />,
  items: [{ label: 'Reset to default', onPress: resetColor }],
})
```

**ActionSheetItem variants:** `default` | `destructive` | `disabled`

---

### useLoader

```tsx
import { useLoader } from 'fluent-styles'

const loader = useLoader()

// --- Manual show / hide ---
const id = loader.show({ label: 'Saving…', variant: 'spinner' })
await saveData()
loader.hide(id)

// --- Variants ---
loader.show({ variant: 'spinner'  })
loader.show({ variant: 'dots',    label: 'Processing…' })
loader.show({ variant: 'pulse',   overlay: true })
loader.show({ variant: 'circular', label: 'Loading…', theme: 'dark' })

// --- Color overrides ---
loader.show({
  label: 'Preparing analytics…',
  variant: 'circular',
  theme: 'dark',
  colors: { indicator: '#60a5fa', label: '#dbeafe' },
})

// --- Automatic wrap (always hides, even on error) ---
const report = await loader.wrap(
  () => api.fetchReport(),
  { label: 'Loading report…', variant: 'dots' },
)

// --- Wrap example with status feedback ---
const runFakeTask = async (options, successMsg) => {
  const result = await loader.wrap(
    () => new Promise(resolve => setTimeout(resolve, 2000)),
    options,
  )
  toast.success(successMsg)
}
await runFakeTask({ label: 'Saving profile…', variant: 'spinner'  }, 'Profile saved')
await runFakeTask({ label: 'Uploading data…', variant: 'circular' }, 'Upload complete')
```

---

## Imperative Services

These services are callable from **anywhere** — Redux middleware, Axios interceptors, navigation helpers — because they use the global `portal` singleton. No `PortalManager` is required.

### toastService

```ts
import { toastService } from 'fluent-styles'

toastService.success('Saved!')
toastService.error('Network error', 'Check your connection.')
toastService.warning('Session expiring')
toastService.info('New version available')

const id = toastService.show({ message: 'Custom', variant: 'info', duration: 2000 })
toastService.dismiss(id)
```

### notificationService

```ts
import { notificationService } from 'fluent-styles'

const id = notificationService.show({
  title: 'Payment received',
  body: '$49.99 from John Smith',
  initials: 'JS',
})
notificationService.dismiss(id)
```

### dialogueService

```ts
import { dialogueService } from 'fluent-styles'

const ok = await dialogueService.confirm({ title: 'Sign out?', destructive: true })
await dialogueService.alert('Welcome back!', 'You were away for 3 days.')

dialogueService.show({ title: 'Custom', actions: [{ label: 'Got it', onPress: () => {} }] })
```

### actionSheetService

```ts
import { actionSheetService } from 'fluent-styles'

actionSheetService.show({
  title: 'Share',
  items: [
    { icon: '📋', label: 'Copy link', onPress: copyLink },
    { icon: '✉️', label: 'Email',     onPress: shareEmail },
  ],
})

actionSheetService.present(<MyPicker />, { title: 'Choose' })
```

### loaderService

```ts
import { loaderService } from 'fluent-styles'

const id = loaderService.show({ label: 'Uploading…', variant: 'circular' })
await uploadFile()
loaderService.hide(id)

// Wrapped — always hides, even on error
const result = await loaderService.wrap(() => api.submit(form), { label: 'Submitting…' })
```

---

## Theme & Tokens

The design token system is fully exported for use in your own components.

```ts
import { theme, palettes, lightColors, darkColors, fontStyles } from 'fluent-styles'

// Colour scales (50–900)
theme.colors.indigo[500]  // '#6366f1'
theme.colors.rose[600]    // '#e11d48'
theme.colors.gray[100]    // '#f4f4f5'

// Base values
palettes.white  // '#FFFFFF'
palettes.black  // '#000000'

// Typography scale
theme.fontSize.small
theme.fontSize.normal
theme.fontSize.medium
theme.fontSize.large

theme.fontWeight.normal
theme.fontWeight.semiBold
theme.fontWeight.bold

// Prebuilt font style objects
fontStyles.body
fontStyles.heading
```

### Per-component colour token overrides

Every complex component accepts a `colors` prop typed as `Partial<ComponentColors>`. Exported default token maps:

| Export | Used by |
|---|---|
| `TAB_BAR_COLORS_LIGHT` / `TAB_BAR_COLORS_DARK` | `TabBar` |
| `POPUP_COLORS_LIGHT` / `POPUP_COLORS_DARK` | `Popup` |
| `DRAWER_COLORS_LIGHT` / `DRAWER_COLORS_DARK` | `Drawer` |
| `COLLAPSE_LIGHT` / `COLLAPSE_DARK` | `Collapse` |
| `LOADER_LIGHT` / `LOADER_DARK` | `Loader` |

### `theme` prop

Overlay and feedback components accept a `theme` prop:

```tsx
<Popup theme="dark" visible={…}>…</Popup>
<Loader theme="system" />  {/* follows device dark mode */}
```

Values: `'light'` | `'dark'` | `'system'`

---

## Contributing

Issues and pull requests are welcome. Please open an issue first to discuss any significant changes.

- Repository: [github.com/aaghorighor/fluent-styles](https://github.com/aaghorighor/fluent-styles)
- Bug reports: [github.com/aaghorighor/fluent-styles/issues](https://github.com/aaghorighor/fluent-styles/issues)

---

## License

[Apache 2.0](LICENSE)
