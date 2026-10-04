// Formulaire sur mesure (/custom-orders) : questions, options et textes réglables depuis
// Management › Settings › Custom form. Fichier partagé par le site et le serveur (pas d'accès disque).

export interface WizardPiece {
  label: string;
  hint: string;
}

export interface WizardSettings {
  showDiscordButton: boolean;
  askPed: boolean;
  pedMultiple: boolean;
  pedOptions: string[];
  askImages: boolean;
  maxImages: number;
  askDuration: boolean;
  askBudget: boolean;
  minBriefLength: number;
  pieces: WizardPiece[];
  texts: Record<WizardTextKey, string>;
}

// Chaque texte affiché par le formulaire, groupé par étape pour la page de réglages.
export const WIZARD_TEXT_GROUPS = [
  {
    title: 'Général',
    fields: [
      { key: 'stepLabel', label: 'Indicateur d’étape', hint: '{n} = étape en cours, {total} = nombre d’étapes.' },
      { key: 'discordButton', label: 'Bouton Discord' },
      { key: 'backButton', label: 'Bouton retour' },
      { key: 'nextButton', label: 'Bouton suivant' },
      { key: 'backToReview', label: 'Bouton après une modification', hint: 'Affiché quand le client modifie une réponse depuis le récapitulatif.' },
    ],
  },
  {
    title: 'Étape 1 · Pièce',
    fields: [
      { key: 'pieceTitle', label: 'Titre' },
      { key: 'pedLabel', label: 'Question du ped' },
      { key: 'pedMultiNote', label: 'Mention sous le ped (choix multiple)' },
    ],
  },
  {
    title: 'Étape 2 · Brief',
    fields: [
      { key: 'briefTitle', label: 'Titre' },
      { key: 'briefText', label: 'Sous-titre' },
      { key: 'briefPlaceholder', label: 'Exemple dans la zone de texte', long: true },
      { key: 'briefTooShort', label: 'Message tant que le brief est trop court' },
      { key: 'imagesLabel', label: 'Titre des images' },
      { key: 'imagesHint', label: 'Aide des images' },
    ],
  },
  {
    title: 'Étape 3 · Délai et budget',
    fields: [
      { key: 'timingTitle', label: 'Titre' },
      { key: 'durationLabel', label: 'Libellé du délai' },
      { key: 'budgetLabel', label: 'Libellé du budget' },
      { key: 'budgetHint', label: 'Aide sous le budget', hint: '{min} = budget minimum, {step} = palier.' },
    ],
  },
  {
    title: 'Étape 4 · Récapitulatif',
    fields: [
      { key: 'reviewTitle', label: 'Titre' },
      { key: 'reviewText', label: 'Sous-titre' },
      { key: 'reviewEyebrow', label: 'Petit titre de la carte' },
      { key: 'madeForLabel', label: 'Libellé « ped »' },
      { key: 'durationReviewLabel', label: 'Libellé « délai »' },
      { key: 'budgetReviewLabel', label: 'Libellé « budget »' },
      { key: 'referencesLabel', label: 'Libellé « nombre d’images »' },
      { key: 'imagesCount', label: 'Nombre d’images', hint: '{n} = nombre d’images.' },
      { key: 'noImages', label: 'Aucune image' },
      { key: 'yourBriefLabel', label: 'Libellé « brief »' },
      { key: 'referenceImagesLabel', label: 'Libellé « images de référence »' },
      { key: 'editButton', label: 'Bouton modifier' },
      { key: 'sendButton', label: 'Bouton d’envoi' },
      { key: 'sendingButton', label: 'Bouton pendant l’envoi' },
    ],
  },
  {
    title: 'Après l’envoi',
    fields: [
      { key: 'sentTitle', label: 'Titre' },
      { key: 'sentText', label: 'Texte', long: true },
      { key: 'sentButton', label: 'Bouton vers le compte' },
    ],
  },
  {
    title: 'Connexion et fermeture',
    fields: [
      { key: 'signInTitle', label: 'Titre (client non connecté)' },
      { key: 'signInText', label: 'Texte (client non connecté)', long: true },
      { key: 'signInButton', label: 'Bouton de connexion' },
      { key: 'closedTitle', label: 'Titre (commandes fermées)' },
      { key: 'closedText', label: 'Texte (commandes fermées)', long: true },
    ],
  },
] as const;

export type WizardTextKey = (typeof WIZARD_TEXT_GROUPS)[number]['fields'][number]['key'];

export const DEFAULT_WIZARD_TEXTS: Record<WizardTextKey, string> = {
  stepLabel: 'Step {n} of {total}',
  discordButton: 'Join our Discord',
  backButton: 'Back',
  nextButton: 'Next',
  backToReview: 'Back to review',
  pieceTitle: 'What would you like us to create?',
  pedLabel: 'Who will wear it?',
  pedMultiNote: 'Selecting more than one character may require additional rigging and affect pricing.',
  briefTitle: 'Tell us about your vision',
  briefText: 'Design, text or engraving, stones, colors, references. The more detail, the better.',
  briefPlaceholder: 'Example: a gold medallion of my crew logo, iced-out edges, with our name engraved on the back...',
  briefTooShort: 'A few more words to continue',
  imagesLabel: 'Reference images',
  imagesHint: 'Drop, paste or pick photos: sketches, logos, inspiration.',
  timingTitle: "How long can you wait, and what's your budget?",
  durationLabel: 'Delivery time:',
  budgetLabel: 'Budget:',
  budgetHint: 'From ${min} · +${step} per step · hold to go faster',
  reviewTitle: 'Ready to send?',
  reviewText: 'Review your details before sending your request.',
  reviewEyebrow: 'Custom project',
  madeForLabel: 'Made for',
  durationReviewLabel: 'Priority',
  budgetReviewLabel: 'Budget',
  referencesLabel: 'References',
  imagesCount: '{n} images',
  noImages: 'None',
  yourBriefLabel: 'Your brief',
  referenceImagesLabel: 'Reference images',
  editButton: 'Edit',
  sendButton: 'Send request',
  sendingButton: 'Sending...',
  sentTitle: 'Request sent',
  sentText: 'We will reply to you directly on the site. You can follow the conversation from your account.',
  sentButton: 'View my requests',
  signInTitle: 'Sign in with Discord to start',
  signInText: 'Every custom request is tied to your Discord account, so we can reply to you on the site and on our server.',
  signInButton: 'Continue with Discord',
  closedTitle: 'Custom orders are closed for now',
  closedText: 'Our jewelers are fully booked. Join our Discord to be the first to know when new slots open.',
};

export const WIZARD_TEXT_KEYS = Object.keys(DEFAULT_WIZARD_TEXTS) as WizardTextKey[];

export const DEFAULT_WIZARD: WizardSettings = {
  showDiscordButton: true,
  askPed: true,
  pedMultiple: true,
  pedOptions: ['Male', 'Female', 'Franklin', 'Michael', 'Trevor'],
  askImages: true,
  maxImages: 6,
  askDuration: true,
  askBudget: true,
  minBriefLength: 15,
  pieces: [
    { label: 'Medallion & pendant', hint: 'Logos, emblems, portraits' },
    { label: 'Chain & cuban link', hint: 'Heavy links, chokers' },
    { label: 'Iced watch', hint: 'Timepieces, bezels' },
    { label: 'Ring', hint: 'Signets, eternity bands' },
    { label: 'Grillz', hint: 'Teeth caps, fangs' },
    { label: 'Full set', hint: 'Multi-piece 1-of-1' },
  ],
  texts: DEFAULT_WIZARD_TEXTS,
};

// Remplace {n}, {total}… dans un texte réglable.
export function fill(text: string, vars: Record<string, string | number>) {
  return text.replace(/\{(\w+)\}/g, (m, k) => (k in vars ? String(vars[k]) : m));
}
