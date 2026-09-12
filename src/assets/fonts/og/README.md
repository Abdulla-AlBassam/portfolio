# Newsreader static instances (OG card only)

These two TTFs are used at build time by `src/pages/thoughts/og/[slug].png.ts`. Satori
cannot read variable-font axes, so it needs static instances on disk. They are never
served to the browser; the site itself loads the variable Newsreader from Google Fonts.

| File | Instance | Used for |
| --- | --- | --- |
| `Newsreader_60pt-SemiBold.ttf` | `opsz 60`, `wght 600` | card title |
| `Newsreader_24pt-Medium.ttf` | `opsz 24`, `wght 500` | eyebrow and domain line |

Provenance: `ofl/newsreader/Newsreader[opsz,wght].ttf` from the google/fonts repository,
pinned to the two locations above with fontTools:

```
python3 -c "
from fontTools.ttLib import TTFont
from fontTools.varLib import instancer
f = TTFont('Newsreader[opsz,wght].ttf')
instancer.instantiateVariableFont(f, {'opsz': 60, 'wght': 600}, inplace=True, updateFontNames=False)
f.save('Newsreader_60pt-SemiBold.ttf')"
```

The upstream repository publishes only the variable font, and the designer's repository
(productiontype/Newsreader) ships statics at 6pt, 16pt and 72pt only, so the 60pt and
24pt cuts the design calls for have to be instanced.

Licence: SIL Open Font License 1.1, copied verbatim in `OFL.txt`. Copyright 2020 The
Newsreader Project Authors. There is no Reserved Font Name, so the instances keep the
family name. Modified copies stay under the same licence and must not be sold on their own.
