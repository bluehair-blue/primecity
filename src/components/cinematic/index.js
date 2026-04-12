import CutawayIntro from "./CutawayIntro";
import SunriseIntro from "./SunriseIntro";
import RippleIntro from "./RippleIntro";
import GlitchIntro from "./GlitchIntro";
import FlashIntro from "./FlashIntro";
import FogIntro from "./FogIntro";
import WindIntro from "./WindIntro";
// Future styles added here as implemented:
// import PageFlipIntro from "./PageFlipIntro";

export const INTRO_COMPONENTS = {
  cutaway: CutawayIntro,
  sunrise: SunriseIntro,
  ripple: RippleIntro,
  glitch: GlitchIntro,
  flash: FlashIntro,
  fog: FogIntro,
  wind: WindIntro,
  // Fallback: styles not yet registered render the default overlay in CinematicCharDetail
};
