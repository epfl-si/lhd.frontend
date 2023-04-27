import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// init i18next with elements inside const dictionary
i18next.use(initReactI18next).init({
	fallbackLng: 'en',
	resources: {
		en: {
			translation: {
				room: {
					name: 'Room',
					occupancies: {
						cosecs: {
							name: 'Cosec',
						},
						professors: {
							name: 'Professor',
						},
						unit: {
							name: 'Unit',
							institute: {
								name: 'Institute',
								school: {
									name: 'School',
								},
							},
							unitId: 'Unit ID',
						},
					},
					building: 'Building',
					sector: 'Sector',
					floor: 'Floor',
					kind: {
						name: 'Designation',
					},
					bio: {
						bio_level: 'Bio level',
						comment: 'Comment',
						bio_org_lab: {
							bio_org: {
								organism: 'Organism',
							},
						},
					},
				},
				logout: 'Logout',
				login: {
					button: 'Login',
					warning: 'Warning - You are not logged in !',
					title: 'Log in to access LHD',
					content:
						'You are trying to access sensitive data, please provide credentials to confirm your identity.',
				},
				copy: {
					params: 'Copy link with parameters',
					success: 'Successfully copied link w/ parameters to clipboard !',
					error: 'You have no query filters to share !',
				},
				params: {
					error: 'Invalid parameters !',
				},
				searchbar: {
					category: 'Select a category',
					entries: {
						label: 'Search entries',
						placeholder: 'Entries',
					},
				},
				fetchError: {
					header: 'An error has occurred',
					serverMessage: 'Server returned the following message: ',
					code: {
						500: {
							title: 'Internal Server Error',
							content: 'An internal server error has occurred.',
						},
						400: {
							title: 'Bad Request',
							content: 'The request was malformed.',
						},
						401: {
							title: 'Unauthorized',
							content: 'You are not authorized to access this resource.',
						},
						403: {
							title: 'Forbidden',
							content: 'You are not allowed to access this resource.',
						},
						404: {
							title: 'Not Found',
							content: 'The resource you are looking for was not found.',
						},
						408: {
							title: 'Request Timeout',
							content: 'The request timed out.',
						},
					},
				},
			},
		},
		fr: {
			translation: {
				room: {
					name: 'Salle',
					occupancies: {
						cosecs: {
							name: 'Cosec',
						},
						professors: {
							name: 'Professeur',
						},
						unit: {
							name: 'Unité',
							institute: {
								name: 'Institut',
								school: {
									name: 'École',
								},
							},
							unitId: 'ID Unité',
						},
					},
					building: 'Bâtiment',
					sector: 'Secteur',
					floor: 'Étage',
					kind: {
						name: 'Désignation',
					},
					bio: {
						bio_level: 'Niveau bio',
						comment: 'Commentaire',
						bio_org_lab: {
							bio_org: {
								organism: 'Organisme',
							},
						},
					},
				},
				logout: 'Déconnexion',
				login: {
					button: 'Connexion',
					warning: "Attention - Vous n'êtes pas connecté !",
					title: 'Connectez-vous pour accéder à LHD',
					content:
						"Vous essayez d'accéder à des données sensibles, veuillez fournir des identifiants pour confirmer votre identité.",
				},
				copy: {
					params: 'Copier le lien avec les paramètres',
					success: 'Lien avec paramètres copié avec succès !',
					error: "Vous n'avez pas de filtres de requête à partager !",
				},
				params: {
					error: 'Paramètres invalides !',
				},
				searchbar: {
					category: 'Sélectionnez une catégorie',
					entries: {
						label: 'Rechercher des entrées',
						placeholder: 'Entrées',
					},
				},
				fetchError: {
					header: 'Erreur de chargement',
					serverMessage: 'Le serveur a retourné le message suivant : ',
					code: {
						500: {
							title: 'Erreur interne du serveur',
							content: 'Une erreur interne du serveur s’est produite.',
						},
						400: {
							title: 'Mauvaise requête',
							content: 'La requête était malformée.',
						},
						401: {
							title: 'Non autorisé',
							content: "Vous n'êtes pas autorisé à accéder à cette ressource.",
						},
						403: {
							title: 'Interdit',
							content: "Vous n'êtes pas autorisé à accéder à cette ressource.",
						},
						404: {
							title: 'Non trouvé',
							content: 'La ressource que vous recherchez n’a pas été trouvée.',
						},
						408: {
							title: 'Temps d’attente de la requête dépassé',
							content: 'La requête a expiré.',
						},
					},
				},
			},
		},
	},
});

export function translate(key, lang) {
	return i18next.t(key, { lng: lang });
}
