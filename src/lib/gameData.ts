export const PLAYERS_DATA = [
  // Humains
  { id: 'ernesto', name: 'Ernesto', role: 'human' as const },
  { id: 'francoise', name: 'Françoise', role: 'human' as const },
  { id: 'chloe', name: 'Chloé', role: 'human' as const },
  { id: 'curna', name: 'Curna', role: 'human' as const },
  { id: 'lou-anne', name: 'Lou-Anne', role: 'human' as const },
  { id: 'julien', name: 'Julien', role: 'human' as const },
  { id: 'matthieu', name: 'Matthieu', role: 'human' as const },
  { id: 'noah', name: 'Noah', role: 'human' as const },
  { id: 'louis', name: 'Louis', role: 'human' as const },
  { id: 'melanie', name: 'Mélanie', role: 'human' as const },
  { id: 'emilie', name: 'Emilie', role: 'human' as const },
  { id: 'lilian', name: 'Lilian', role: 'human' as const },
  { id: 'johan', name: 'Johan', role: 'human' as const },
  { id: 'anne-sophie', name: 'Anne-Sophie', role: 'human' as const },
  { id: 'lisa', name: 'Lisa', role: 'human' as const },
  
  // Altérés
  { id: 'eliott', name: 'Eliott', role: 'altered' as const },
  { id: 'nono', name: 'Nono', role: 'altered' as const },
  { id: 'cass', name: 'Cass', role: 'altered' as const },
  { id: 'dimitry', name: 'Dimitry', role: 'altered' as const },
  { id: 'carine', name: 'Carine', role: 'altered' as const },
];

export const MISSIONS_TIER_1 = {
  // Missions Humains
  ernesto: {
    id: 'mission_ernesto_1',
    targetId: 'johan',
    targetName: 'Johan',
    riddle: "L'Ombre détecte quelqu'un qui a porté l'uniforme de la République avant de siéger dans les conseils. Il s'oppose aujourd'hui à la mairie de Pont-à-Mousson et vient de se marier.",
  },
  francoise: {
    id: 'mission_francoise_1',
    targetId: 'diana',
    targetName: 'Diana',
    riddle: "L'Ombre détecte une âme libérale qui soigne sans les murs d'un hôpital. Cette personne partage sa vie avec un passionné de deux-roues.",
  },
  chloe: {
    id: 'mission_chloe_1',
    targetId: 'anne-sophie',
    targetName: 'Anne-Sophie',
    riddle: "Quelqu'un ici soigne sans les murs d'un hôpital. Cette personne a consacré sa vie aux chevaux et vient de se marier.",
  },
  curna: {
    id: 'mission_curna_1',
    targetId: 'cass',
    targetName: 'Cass',
    riddle: "Le Portail résonne avec quelqu'un qui crée des espaces hors du temps. Cette personne décore avec l'âme des années 70, 80 et 90.",
  },
  'lou-anne': {
    id: 'mission_louanne_1',
    targetId: 'diana',
    targetName: 'Diana',
    riddle: "Quelqu'un ici voyage sans cesse vers le sud de l'Europe. Cette personne est originaire d'un pays où l'on parle portugais.",
  },
  julien: {
    id: 'mission_julien_1',
    targetId: 'carine',
    targetName: 'Carine',
    riddle: "L'Ombre détecte un homme qui a porté l'uniforme de la République avant de siéger dans les conseils.",
  },
  matthieu: {
    id: 'mission_matthieu_1',
    targetId: 'lou-anne',
    targetName: 'Lou-Anne',
    riddle: "Le Portail te lance un défi. Cette personne collectionne quelque chose lié au rire des enfants et aux surprises en 3 lettres.",
  },
  noah: {
    id: 'mission_noah_1',
    targetId: 'eliott',
    targetName: 'Eliott',
    riddle: "Quelqu'un ici a transformé son corps en machine de course. Cette personne a participé aux plus grands championnats du monde.",
  },
  louis: {
    id: 'mission_louis_1',
    targetId: 'ernesto',
    targetName: 'Ernesto',
    riddle: "L'Ombre vibre près de quelqu'un qui veille la nuit sur les machines. Cette personne garde l'usine et bricole tout.",
  },
  melanie: {
    id: 'mission_melanie_1',
    targetId: 'diana',
    targetName: 'Diana',
    riddle: "Le Portail détecte quelqu'un qui voyage constamment vers le sud de l'Europe et partage sa vie avec un passionné de motos.",
  },
  emilie: {
    id: 'mission_emilie_1',
    targetId: 'nono',
    targetName: 'Nono',
    riddle: "Quelqu'un ici est devenu parent cette année au printemps et porte fièrement ses racines croates.",
  },
  lilian: {
    id: 'mission_lilian_1',
    targetId: 'lisa',
    targetName: 'Lisa',
    riddle: "Le Portail cherche quelqu'un qui parle plusieurs langues, possède une tache unique sur le visage et soigne en liberté.",
  },
  johan: {
    id: 'mission_johan_1',
    targetId: 'anne-sophie',
    targetName: 'Anne-Sophie',
    riddle: "Quelqu'un ici a consacré sa vie aux chevaux, possède un chien nommé Lixy et vient de se marier.",
  },
  'anne-sophie': {
    id: 'mission_annesophie_1',
    targetId: 'nono',
    targetName: 'Nono',
    riddle: "Le Portail résonne avec quelqu'un qui travaille dans le Grand-Duché et est devenu père cette année.",
  },
  lisa: {
    id: 'mission_lisa_1',
    targetId: 'carine',
    targetName: 'Carine',
    riddle: "Trouve la personne qui travaille dans une banque à Paris et est originaire de Nancy.",
  },
  
  // Missions Altérés (sabotage)
  eliott: {
    id: 'mission_eliott_1',
    type: 'sabotage' as const,
    targetId: 'ernesto',
    instruction: "Tu dois faire croire à Ernesto que Dimitry est un Altéré. Sois subtil et crédible.",
  },
  nono: {
    id: 'mission_nono_1',
    type: 'sabotage' as const,
    targetId: 'francoise',
    instruction: "Tu dois convaincre Françoise que Carine est suspecte. Utilise n'importe quel argument plausible.",
  },
  cass: {
    id: 'mission_cass_1',
    type: 'sabotage' as const,
    targetId: 'anne-sophie',
    instruction: "Tu dois saboter la mission d'Anne-Sophie en lui donnant une fausse information crédible.",
  },
  dimitry: {
    id: 'mission_dimitry_1',
    type: 'sabotage' as const,
    targetId: 'johan',
    instruction: "Tu dois faire alliance avec Johan et le convaincre qu'Eliott est un Altéré.",
  },
  carine: {
    id: 'mission_carine_1',
    type: 'sabotage' as const,
    targetId: 'lou-anne',
    instruction: "Tu dois saboter la mission de Lou-Anne en l'orientant vers la mauvaise personne.",
  },
};

export const INITIAL_GAME_STATE = {
  id: 'game_halloween_2025',
  status: 'waiting' as const,
  portalLevel: 0,
  startedAt: Date.now(),
  humanFragments: 0,
  alteredSuccesses: 0,
  winner: null,
  totalMissionsCompleted: 0,
  meetingsHeld: 0,
  currentMeeting: null,
  // Seuils pour déclencher les 3 réunions (basés sur le nombre de missions complétées)
  meetingThresholds: [7, 14, 20], // 1ère réunion à 7 missions, 2ème à 14, 3ème à 20
};
