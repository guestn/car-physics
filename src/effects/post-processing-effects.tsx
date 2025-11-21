import {
  EffectComposer,
  Bloom,
  Noise,
  DepthOfField,
  Vignette,
  Outline,
  FXAA,
} from '@react-three/postprocessing'

export interface PostProcessingSettings {
  bloom: boolean
  noise: boolean
  depthOfField: boolean
  vignette: boolean
  outline: boolean
}

interface PostProcessingEffectsProps {
  settings: PostProcessingSettings
}

// Effect configurations as pure data
const effectConfigs = [
  {
    key: 'depthOfField',
    enabled: (settings: PostProcessingSettings) => settings.depthOfField,
    component: (key: string) => (
      <DepthOfField
        key={key}
        focusDistance={1}
        focalLength={1}
        bokehScale={2}
        height={480}
      />
    ),
  },
  {
    key: 'bloom',
    enabled: (settings: PostProcessingSettings) => settings.bloom,
    component: (key: string) => (
      <Bloom
        key={key}
        intensity={1.5}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.025}
        mipmapBlur={true}
        radius={0.8}
      />
    ),
  },
  {
    key: 'noise',
    enabled: (settings: PostProcessingSettings) => settings.noise,
    component: (key: string) => <Noise key={key} opacity={0.02} />,
  },
  {
    key: 'vignette',
    enabled: (settings: PostProcessingSettings) => settings.vignette,
    component: (key: string) => (
      <Vignette key={key} eskil={false} offset={0.1} darkness={0.2} />
    ),
  },
  {
    key: 'outline',
    enabled: (settings: PostProcessingSettings) => settings.outline,
    component: (key: string) => (
      <Outline
        key={key}
        visibleEdgeColor={0xffffff}
        hiddenEdgeColor={0x22090a}
        edgeStrength={20}
        pulseSpeed={0.0}
        blur={false}
        xRay={true}
        width={10}
      />
    ),
  },
] as const

// Pure function to create effects based on settings
const createEffects = (settings: PostProcessingSettings) =>
  effectConfigs
    .filter(({ enabled }) => enabled(settings))
    .map(({ key, component }) => component(key))

export const PostProcessingEffects = ({
  settings,
}: PostProcessingEffectsProps) => (
  <EffectComposer>
    {/* FXAA should be first to reduce aliasing and banding */}
    <FXAA />
    {createEffects(settings)}
  </EffectComposer>
)
