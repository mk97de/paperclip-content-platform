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

export type PatternFormat = "A-Roll" | "B-Roll List" | "B-Roll Progressive";

export type PatternDefinition = {
  key: PatternKey;
  label: string;
  definition: string;
  examples: string[];
  bestFormat: PatternFormat;
  mechanic: string;
};

export const PATTERN_DEFINITIONS: Record<PatternKey, PatternDefinition> = {
  gegenposition: {
    key: "gegenposition",
    label: "Gegenposition",
    definition:
      "Verbreitete Annahme widerlegen — etwas, das die Zielgruppe für selbstverständlich hält, wird gekippt.",
    mechanic: "Kognitive Dissonanz: der Leser wird gezwungen, sein Wissen zu revidieren.",
    examples: [
      "Die diszipliniertesten Patientinnen haben oft die schlimmsten Symptome. Sie brauchen nicht mehr Kontrolle — sondern weniger.",
      "Hashimoto ist keine Schilddrüsenerkrankung. Es ist eine Immunerkrankung, die deine Schilddrüse angreift.",
      "Dein Hausarzt sagt, Ferritin 15 ist 'noch okay.' Funktionelle Medizin sagt: unter 50 bist du eisenmangelverdächtig.",
    ],
    bestFormat: "B-Roll List",
  },
  identifikation: {
    key: "identifikation",
    label: "Identifikation",
    definition:
      "Die Zielgruppe erkennt sich selbst in einer Symptom- oder Verhaltensliste wieder.",
    mechanic: "Selbstdiagnose-Shortcut: der Leser findet sich in 1-2 Zeilen wieder.",
    examples: [
      "Wenn deine Nebennieren erschöpft sind, passiert das: → Nachmittagstief → Heißhunger auf Salziges → Schwindel beim Aufstehen",
      "Wenn dein Östrogen dominiert, passiert das: → PMS wird zur Woche, nicht zum Tag → Brüste spannen unerträglich → Stimmung kippt 10 Tage vor der Periode",
      "Die eine Sache, die meine Patientinnen fast alle gemeinsam hatten: Sie wissen sehr viel und setzen davon nicht einmal die Hälfte um.",
    ],
    bestFormat: "B-Roll List",
  },
  ueberraschung: {
    key: "ueberraschung",
    label: "Überraschung",
    definition:
      "Unerwartete Kausalität — Symptom X hat gar nicht die Ursache, die alle vermuten.",
    mechanic: "Aha-Moment: der Leser will wissen, was die echte Ursache ist.",
    examples: [
      "Dein Magnesium wirkt nicht — nicht wegen der Dosis, sondern weil deine Darmflora es nicht aufnimmt.",
      "Dein Darm bestimmt, ob dein wichtigstes, weibliches Hormon recycelt oder ausgeschieden wird.",
      "Dein Serotonin entsteht nicht im Kopf, sondern zu 90 Prozent im Darm.",
    ],
    bestFormat: "B-Roll Progressive",
  },
  warnung: {
    key: "warnung",
    label: "Warnung",
    definition:
      "Unheilvolle Konsequenz — scheinbar gesunde Routinen richten heimlich Schaden an.",
    mechanic: "Verlustaversion: der Leser fürchtet, dass sein Verhalten schadet.",
    examples: [
      "5 gesunde Dinge, die heimlich deine Schilddrüse ruinieren — und du machst sie täglich.",
      "Das passiert in deinem Körper, wenn du chronisch zu wenig isst: → Schilddrüse fährt runter → Cortisol steigt → Nährstoffmängel",
      "5 Dinge, die ich meinen Patientinnen als ERSTES wegnehme, wenn sie wieder Energie haben wollen.",
    ],
    bestFormat: "B-Roll List",
  },
  neugier: {
    key: "neugier",
    label: "Neugier",
    definition:
      "Open-Loop: Frage + Teaser, der sich nur in den nächsten Sekunden auflöst.",
    mechanic: "Information Gap: das Hirn kann unvollständige Geschichten nicht ignorieren.",
    examples: [
      "Unregelmäßiger Zyklus? Prüfe diese 3 Leber-Marker — dein Hausarzt testet nur einen davon.",
      "Erst als ich diese 3 Laborwerte zusammen angeschaut habe — nicht einzeln — war plötzlich klar, warum ich dauernd müde war:",
      "'Ihre Blutwerte sind normal.' 'Ihre Blutwerte sind optimal.' Ein Wort Unterschied — aber es entscheidet alles.",
    ],
    bestFormat: "B-Roll Progressive",
  },
  autoritaet: {
    key: "autoritaet",
    label: "Autorität",
    definition:
      "Experten-Positioning: Alexandra zeigt, wie sie als Heilpraktikerin konkret vorgeht.",
    mechanic: "Insider-Wissen: der Leser bekommt Einblick hinter die Kulissen einer Praxis.",
    examples: [
      "Was ich als erstes mache, wenn eine neue Patientin in der Perimenopause zu mir kommt (diesen Part skippen Ärzte weil er sehr zeitaufwändig ist).",
      "80% meiner Patientinnen kommen zu mir mit dem Satz: 'Ich bin chronisch energielos.' Am Ende hatten nur 2/10 ein Schlafproblem.",
      "3 Dinge, die ich aus meiner eigenen Morgenroutine gestrichen habe — als Heilpraktikerin.",
    ],
    bestFormat: "A-Roll",
  },
  fehler_aufdecken: {
    key: "fehler_aufdecken",
    label: "Fehler aufdecken",
    definition:
      "Missverständnis demaskieren — ein gängiger Rat wird als veraltet oder falsch entlarvt.",
    mechanic: "Status-Update: der Leser fühlt sich informiert gegenüber Nicht-Eingeweihten.",
    examples: [
      "'Mach Intervallfasten & beweg dich mehr.' Das ist ein Abnehmratschlag von 2020. Heute wissen wir, warum genau das bei Frauen ab 35 nach hinten losgeht.",
      "Du trinkst deinen Kaffee zwischen 7 und 8 Uhr. Ich erkläre dir, warum das total bescheuert ist.",
      "Jedes Workout ein Ziel, jeder Spaziergang ein Zweck — so ruinierst du deine Leistung. Warum zwecklose Bewegung heilt.",
    ],
    bestFormat: "B-Roll Progressive",
  },
  story_einstieg: {
    key: "story_einstieg",
    label: "Story-Einstieg",
    definition:
      "Transformation-Narrativ: eine konkrete Patientin, eine Änderung, ein Vorher-Nachher.",
    mechanic: "Story-Sog: das Hirn ist auf narrative Strukturen trainiert, Listen auf A-Roll sind schwächer.",
    examples: [
      "Erst als wir bei meiner Patientin den Kaffee nicht gestrichen, sondern VERSCHOBEN haben, war ihre Energie ab 14 Uhr eine völlig andere.",
      "Erst als meine Patientin 7 Uhr statt 8 Uhr aufgewacht ist, haben wir ihr Gewichtsproblem in den Griff bekommen.",
      "Meine Patientin hat vor 3 Monaten 4 Ärzte besucht. Diagnose: 'Stress.' Unsere Diagnose nach einem Blutbild: Ferritin 8, Vitamin D 14.",
    ],
    bestFormat: "A-Roll",
  },
  dringlichkeit: {
    key: "dringlichkeit",
    label: "Dringlichkeit",
    definition:
      "Zeit- oder Handlungsdruck: wenn nichts passiert, eskaliert das Problem Monat für Monat.",
    mechanic: "Eskalations-Narrativ: der Leser sieht, was ihm bevorsteht, wenn er nichts ändert.",
    examples: [
      "Was passiert, wenn Cortisol Monat für Monat steigt: → Monat 1-3: Schlaf wird schlechter → Monat 3-6: Gewicht steigt → nach 12+ Monaten: chronische Krankheiten.",
      "Dein Darm bestimmt, ob dein wichtigstes, weibliches Hormon recycelt oder ausgeschieden wird. Und genau hier beginnen Hormonprobleme, an die kaum jemand denkt.",
      "TSH 2,8. Vitamin D 18. Ferritin 12. Laut Arzt: alles im Normbereich. Laut ihrem Körper: Haarausfall, Erschöpfung. 3 Monate später sieht ihr Leben anders aus.",
    ],
    bestFormat: "B-Roll Progressive",
  },
};

export const PATTERN_KEYS = Object.keys(PATTERN_DEFINITIONS) as PatternKey[];

export const FORMAT_BADGE_COLOR: Record<PatternFormat, string> = {
  "A-Roll":
    "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200/60 dark:border-amber-800/60",
  "B-Roll List":
    "bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200 border-indigo-200/60 dark:border-indigo-800/60",
  "B-Roll Progressive":
    "bg-violet-100 text-violet-900 dark:bg-violet-900/40 dark:text-violet-200 border-violet-200/60 dark:border-violet-800/60",
};
