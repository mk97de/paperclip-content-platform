export type PatternKey =
  | "gegenposition"
  | "identifikation"
  | "ueberraschung"
  | "warnung"
  | "neugier"
  | "autoritaet"
  | "fehler_aufdecken"
  | "story_einstieg"
  | "dringlichkeit";

export type PatternDefinition = {
  key: PatternKey;
  label: string;
  definition: string;
  example: string;
  bestFormat: "A-Roll" | "B-Roll List" | "B-Roll Progressive";
};

export const PATTERN_DEFINITIONS: Record<PatternKey, PatternDefinition> = {
  gegenposition: {
    key: "gegenposition",
    label: "Gegenposition",
    definition:
      "Verbreitete Annahme widerlegen — etwas, das die Zielgruppe für selbstverständlich hält, wird gekippt.",
    example:
      "Die diszipliniertesten Patientinnen haben oft die schlimmsten Symptome. Sie brauchen nicht mehr Kontrolle — sondern weniger.",
    bestFormat: "B-Roll List",
  },
  identifikation: {
    key: "identifikation",
    label: "Identifikation",
    definition:
      "Die Zielgruppe erkennt sich selbst in einer Symptom- oder Verhaltensliste wieder.",
    example:
      "Wenn deine Nebennieren erschöpft sind, passiert das: → Nachmittagstief → Heißhunger auf Salziges → Schwindel beim Aufstehen",
    bestFormat: "B-Roll List",
  },
  ueberraschung: {
    key: "ueberraschung",
    label: "Überraschung",
    definition:
      "Unerwartete Kausalität — Symptom X hat gar nicht die Ursache, die alle vermuten.",
    example:
      "Dein Magnesium wirkt nicht — nicht wegen der Dosis, sondern weil deine Darmflora es nicht aufnimmt.",
    bestFormat: "B-Roll Progressive",
  },
  warnung: {
    key: "warnung",
    label: "Warnung",
    definition:
      "Unheilvolle Konsequenz — scheinbar gesunde Routinen richten heimlich Schaden an.",
    example:
      "5 gesunde Dinge, die heimlich deine Schilddrüse ruinieren — und du machst sie täglich.",
    bestFormat: "B-Roll List",
  },
  neugier: {
    key: "neugier",
    label: "Neugier",
    definition:
      "Open-Loop: Frage + Teaser, der sich nur in den nächsten Sekunden auflöst.",
    example:
      "Unregelmäßiger Zyklus? Prüfe diese 3 Leber-Marker — dein Hausarzt testet nur einen davon.",
    bestFormat: "B-Roll Progressive",
  },
  autoritaet: {
    key: "autoritaet",
    label: "Autorität",
    definition:
      "Experten-Positioning: Alexandra zeigt, wie sie als Heilpraktikerin konkret vorgeht.",
    example:
      "Was ich als erstes mache, wenn eine neue Patientin in der Perimenopause zu mir kommt (diesen Part skippen Ärzte weil er sehr zeitaufwändig ist).",
    bestFormat: "A-Roll",
  },
  fehler_aufdecken: {
    key: "fehler_aufdecken",
    label: "Fehler aufdecken",
    definition:
      "Missverständnis demaskieren — ein gängiger Rat wird als veraltet oder falsch entlarvt.",
    example:
      "'Mach Intervallfasten & beweg dich mehr.' Das ist ein Abnehmratschlag von 2020. Heute wissen wir, warum genau das bei Frauen ab 35 nach hinten losgeht.",
    bestFormat: "B-Roll Progressive",
  },
  story_einstieg: {
    key: "story_einstieg",
    label: "Story-Einstieg",
    definition:
      "Transformation-Narrativ: eine konkrete Patientin, eine Änderung, ein Vorher-Nachher.",
    example:
      "Erst als wir bei meiner Patientin den Kaffee nicht gestrichen, sondern VERSCHOBEN haben, war ihre Energie ab 14 Uhr eine völlig andere.",
    bestFormat: "A-Roll",
  },
  dringlichkeit: {
    key: "dringlichkeit",
    label: "Dringlichkeit",
    definition:
      "Zeit- oder Handlungsdruck: wenn nichts passiert, eskaliert das Problem Monat für Monat.",
    example:
      "Was passiert, wenn Cortisol Monat für Monat steigt: → Monat 1-3: Schlaf wird schlechter → Monat 3-6: Gewicht steigt → nach 12+ Monaten: chronische Krankheiten.",
    bestFormat: "B-Roll Progressive",
  },
};

export const PATTERN_KEYS = Object.keys(PATTERN_DEFINITIONS) as PatternKey[];
