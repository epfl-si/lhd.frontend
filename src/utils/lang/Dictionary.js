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
				unit_details: {
					personPlaceholder: 'Select a person',
					profTab: 'Prof / Resp',
					cosecTab: 'COSECs',
					subunitTab: 'Sub-Units',
					title: 'Details on unit',
					addNewUnit: 'Add a new sub-unit',
					noSubUnits: 'No sub-unit present',
					deleteUnitConfirmationMessageTitle: 'Are you sur to delete this unit?',
					deleteUnitConfirmationMessageDescription: 'All relationships with responsibles and COSECs will be deleted. \nAll sub-units will be deleted too.'
				},
				unit: {
					name: 'Name',
					institute: 'Institute',
					school: 'School',
					search: 'Search...',
					unitList: 'Units'
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
				room_details: {
					details: 'Details',
					unitPlaceholder: 'Search a unit',
					hazards: 'Hazards',
					title: 'Details on room ',
					designation: 'Designation',
					building: 'Building',
					sector: 'Sector',
					floor: 'Floor'
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
				generic: {
					saveButton: 'Save',
					deleteButton: 'Delete',
					cancelButton: 'Cancel'
				},
				menu: {
					rooms: 'Rooms / Hazards',
					units: 'Units',
					dispensations: 'Dispensations',
					hazardFormControl: 'Hazard Form Control'
				},
				hazards: {
					Biological: 'Biological',
					Chemical: 'Chemical',
					CompressedGas: 'Compressed Gas',
					Cryogenics: 'Cryogenics',
					Electrical: 'Electrical',
					EMRadiation: 'EM Radiation',
					IonisingRadiation: 'Ionising Radiation',
					Laser: 'Laser',
					Nanoparticles: 'Nanoparticles',
					Noise: 'Noise',
					StaticMagneticField: 'Static Magnetic Field',
					Temperature: 'Temperature',
				},
				hazardFormControl: {
					title: 'Hazard Forms',
					version: 'Version',
					category: 'Category',
					addNewCategory: 'Add new hazard category',
					newHazardCategory: 'Insert the new hazard category',
					insertNewVersion: 'Insert the hazard form version',
					newVersionCurrentIs: 'Insert the hazard form version (current version is ',
					Create: 'Create',
					Modify: 'Modify form of: ',
					fillMandatoryFields: 'Some mandatory fields are empty',
					versionError: 'New version must be more than current version'
				}
			},
		},
		fr: {
			translation: {
				room: {
					name: 'Salle',
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
				unit_details: {
					personPlaceholder: 'Sélectionner une personne',
					profTab: 'Prof / Resp',
					cosecTab: 'COSECs',
					subunitTab: 'Sub-Unités',
					title: 'Détails de l\'unité',
					addNewUnit: 'Ajouter une nouvelle sub-unité',
					noSubUnits: 'Aucune sub-unité présente',
					deleteUnitConfirmationMessageTitle: 'Êtes-vous sûrs de vouloir supprimer cette unité?',
					deleteUnitConfirmationMessageDescription: 'Toutes les rélations avec les responsables et les COSECs seront aussi supprimées, ainsi que toutes les sub-unités.'
				},
				unit: {
					name: 'Nom',
					institute: 'Institut',
					school: 'Ecole',
					search: 'Rechercher...',
					unitList: 'Unités'
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
				room_details: {
					details: 'Détails',
					unitPlaceholder: 'Cherche une unité',
					hazards: 'Dangers',
					title: 'Détails de la room ',
					designation: 'Désignation',
					building: 'Bâtiment',
					sector: 'Secteur',
					floor: 'Étage'
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
				generic: {
					saveButton: 'Enregistrer',
					deleteButton: 'Soupprimer',
					cancelButton: 'Annuler'
				},
				menu: {
					rooms: 'Rooms / Dangers',
					units: 'Unités',
					dispensations: 'Dispensations',
					hazardFormControl: 'Contrôle des formulaires des hasards'
				},
				hazards: {
					Biological: 'Biologique',
					Chemical: 'Chimique',
					CompressedGas: 'Gaz compressé',
					Cryogenics: 'Cryogénie',
					Electrical: 'Électrique',
					EMRadiation: 'Rayonnement EM',
					IonisingRadiation: 'Rayonnement Ionisant',
					Laser: 'Laser',
					Nanoparticles: 'Nanoparticules',
					Noise: 'Bruit',
					StaticMagneticField: 'Champ Magnétique Statique',
					Temperature: 'Température',
				},
				hazardFormControl: {
					title: 'Formulaires des dangers',
					version: 'Version',
					category: 'Catégory',
					addNewCategory: 'Ajouter une nouvelle catégory de danger',
					newHazardCategory: 'Insérer la nouvelle catégory de danger',
					insertNewVersion: 'Insérer la version du formulaire du danger',
					newVersionCurrentIs: 'Insérer la version du formulaire du danger (la version courante est ',
					Create: 'Créer',
					Modify: 'Modifier le formulaire de: ',
					fillMandatoryFields: 'Certains champs obligatoires sont vides',
					versionError: 'La nouvelle version doit être majeure que la version courante'
				}
			},
		},
	},
});

export function translate(key, lang) {
	return i18next.t(key, { lng: lang });
}
