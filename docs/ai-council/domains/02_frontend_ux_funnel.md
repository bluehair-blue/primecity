# Domain 02 — Frontend / UX Funnel

Audit the user journey from landing to EdenChat entry, and the site's effectiveness as a portfolio showcase.

## Review Files

- `src/pages/Home.jsx`
- `src/pages/Works.jsx`
- `src/pages/Updates.jsx`
- `src/pages/Gallery.jsx`
- `src/pages/Contact.jsx`
- `src/components/HeroSlider.jsx`
- `src/components/GameModes.jsx`
- `src/components/ImageSystemInfo.jsx`
- `src/data/characters.js`
- `src/data/gamemodes.js`

## Questions

- Does a first-time visitor understand what Prime City is within 5 seconds?
- Is the CTA to enter EdenChat clear and prominent enough?
- Do the character / mode / gallery / update sections connect as a coherent "showcase of work"?
- From a personal branding and monetization perspective, are Works and Contact sufficient?

## Funnel Map

```
[1] Landing     — HeroSlider: does the headline and visual communicate the concept?
[2] Explore     — CharCarousel / CityMap / GameModes: does the user know what to do?
[3] Deep Dive   — CharDetail / CinematicCharDetail: is the character depth compelling?
[4] CTA         — Is there a clear path to EdenChat from every major section?
[5] Conversion  — Does the user actually click into EdenChat?
```

## Audit Points

### First Impression (5-second test)

- Does the hero headline communicate "AI chatbot" or "simulation" without prior context?
- Is the EdenChat CTA above the fold on both desktop and mobile?
- Is the site's language (Korean) a barrier or an intentional choice?

### EdenChat CTA Coverage

- List every location in the site where an EdenChat link or button appears.
- For each: is it labeled clearly? Is the destination obvious (external link)?
- Is there a dead zone — a section the user might read for a long time with no path to EdenChat?

### Showcase Coherence

- Does the sequence Character → Mode → Gallery → Updates tell a story?
- Is `GameModes.jsx` up to date with all released modes including CEO mode?
- Does `gamemodes.js` include `detailPath` for all modes that have a page?

### Works / Contact as Portfolio

- Does `Works.jsx` present a completed project or a visible placeholder?
- Does `Contact.jsx` include a commission or collaboration inquiry path?
- Is the creator's identity (name, role, links) findable within 2 clicks?

### Mobile & Accessibility

- Test `useIsMobile(768)` branch coverage in HeroSlider, GameModes, CharCarousel.
- Check touch interaction on carousel and city map.
- Check `aria-label` on CTA buttons, especially external links.

## Findings

_Populate with Finding Cards after review. Use IDs: `PC-FE-NNN`._
