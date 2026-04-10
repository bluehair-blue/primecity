import CutawayIntro from "./CutawayIntro";
import SunriseIntro from "./SunriseIntro";
import RippleIntro from "./RippleIntro";
import GlitchIntro from "./GlitchIntro";
// Future styles added here as implemented:
// import FlashIntro from "./FlashIntro";
// import FogIntro from "./FogIntro";
// import CardDealIntro from "./CardDealIntro";
// import PageFlipIntro from "./PageFlipIntro";

export const INTRO_COMPONENTS = {
  cutaway: CutawayIntro,
  sunrise: SunriseIntro,
  ripple: RippleIntro,
  glitch: GlitchIntro,
  // Fallback: styles not yet registered render the default overlay in CinematicCharDetail
};
