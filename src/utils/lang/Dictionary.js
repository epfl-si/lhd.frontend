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
			},
		},
	},
});

export function translate(key, lang) {
	return i18next.t(key, { lng: lang });
}
