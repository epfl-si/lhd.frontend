import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

// init i18next with elements inside const dictionary
i18next.use(initReactI18next).init({
	fallbackLng: 'en',
	resources: {
		en: {
			translation: {
				room: {
					search: 'Search...',
					roomList: 'Rooms',
					name: 'Room',
					building: 'Building',
					sector: 'Sector',
					site: 'Site',
					floor: 'Floor',
					addNewRoom: 'Add new room',
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
					unit: 'Unit'
				},
				hazard: {
					hazardList: 'Hazards',
					category: 'Category',
				},
				unit_details: {
					personPlaceholder: 'Select a person',
					profTab: 'Prof / Resp',
					cosecTab: 'COSECs',
					subunitTab: 'Sub-Units',
					title: 'Details on unit',
					addNewUnit: 'Add a new sub-unit',
					noSubUnits: 'No sub-unit present',
					editName: 'Edit the sub-unit name',
					deleteUnitConfirmationMessageTitle: 'Are you sure to delete this unit: ',
					deleteUnitConfirmationMessageDescription: 'All relationships with responsibles, COSECs, rooms and storages will be deleted. \nAll sub-units will be deleted too.'
				},
				unit: {
					name: 'Unit',
					institute: 'Institute',
					school: 'Faculty',
					search: 'Search...',
					unitList: 'Units',
					addNewUnit: 'Add new unit',
					subUnit: 'SubUnit',
					cosec: 'COSECs',
					prof: 'Prof / Resp',
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
					site: 'Site',
					floor: 'Floor',
					attachUnit: 'Attach a unit',
					attachUnitTitle: 'Room attached to the following units:',
					undoDeletionUnit: 'Undo the deletion of the unit from this room',
					deleteUnit: 'Delete this unit from the room',
					adminuse: 'DIN Type',
					facultyuse: 'DIN Sub-type',
					volume: 'Volume (m³)',
					vol: 'Vol (m³)',
					fichePorte: 'Fiche de porte'
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
					cancelButton: 'Cancel',
					continueButton: 'Continue',
					addNew: 'Add new',
					search: 'Search',
					comment: 'Comment'
				},
				datagrid: {
					columns: 'Columns',
					filters: 'Filters',
					density: 'Density',
					export: 'Export',
					exportCSV: 'Download as CSV',
					print: 'Print'
				},
				menu: {
					rooms: 'Rooms',
					units: 'Units',
					organisms: 'Organisms',
					dispensations: 'Dispensations',
					hazardFormControl: 'Hazard Form Control',
					hazards: 'Hazards'
				},
				organism: {
					organismsList: 'Organisms',
					name: 'Name',
					risk: 'Risk',
					file: 'File',
					search: 'Search',
					updated_on: 'Updated on',
					updated_by: 'Updated by',
					updated: 'Updated',
					addNewOrganism: 'Add new organism',
					modifyOrganism: 'Modify the organism',
					organismName: 'Organism name',
					deleteOrganismTitle: 'Delete organism: ',
					deleteOrganismMessageStart: 'This organism is still used in some hazads. Please, verify hazards following ',
					deleteOrganismMessageEnd: ' and delete them before deleting the organism',
					link: 'this link',
					retry: 'Retry',
					actions: 'Actions'
				},
				hazards: {
					Biological: 'Biological',
					Chemical: 'Chemical',
					CompressedGas: 'Compressed Gas',
					Cryogenics: 'Cryogenics',
					Electrical: 'Electrical',
					TimeVaryingEMF: 'Time Varying EMF',
					IncoherentLightSource: 'Incoherent Light Source',
					IonisingRadiation: 'Ionising Radiation',
					Laser: 'Laser',
					Nanoparticles: 'Nanoparticles',
					Noise: 'Noise',
					StaticMagneticField: 'Static Magnetic Field',
					Temperature: 'Temperature',
					modification_info: 'Modified by %s on %s',
					otherRooms: ' due to magnet located in room ',
					deleteHazardConfirmationMessageTitle: 'Are you sure you want to delete this hazard?'
				},
				hazardFormControl: {
					title: 'Hazard Forms',
					version: 'Version',
					category: 'Category',
					addNewCategory: 'Add new hazard category',
					newHazardCategory: 'Insert the new hazard category',
					newHazardFormChild: 'Insert the sub-form name',
					insertNewVersion: 'Insert the hazard form version',
					newVersionCurrentIs: 'Current version: ',
					Create: 'Create',
					Modify: 'Modify form of: ',
					fillMandatoryFields: 'Some mandatory fields are empty',
					versionError: 'New version must be more than current version',
					childListTitle: 'Children form list',
					hazard_form_child_name: 'Name'
				},
				hazard_details: {
					unsavedChangesMessageTitle: 'Unsaved changes',
					unsavedChangesMessageDescription: 'You have unsaved changes. Are you sure you want to continue? All unsaved changes will be lost.'
				}
			},
		},
		fr: {
			translation: {
				room: {
					search: 'Rechercher...',
					roomList: 'Locaux',
					name: 'Local',
					building: 'Bâtiment',
					sector: 'Secteur',
					site: 'Site',
					floor: 'Étage',
					addNewRoom: 'Ajouter un local',
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
				hazard: {
					hazardList: 'Dangers',
					category: 'Catégorie',
				},
				unit_details: {
					personPlaceholder: 'Sélectionner une personne',
					profTab: 'Prof / Resp',
					cosecTab: 'COSECs',
					subunitTab: 'Sous-Unités',
					title: 'Détails de l\'unité',
					addNewUnit: 'Ajouter une nouvelle sous-unité',
					noSubUnits: 'Aucune sous-unité présente',
					editName: 'Modifier le nom de la sous-unité',
					deleteUnitConfirmationMessageTitle: 'Êtes-vous sûrs de vouloir supprimer cette unité: ',
					deleteUnitConfirmationMessageDescription: 'Toutes les rélations avec les responsables, les COSECs, les locaux et les stockages seront aussi supprimées, ainsi que toutes les sous-unités.'
				},
				unit: {
					name: 'Unité',
					institute: 'Institut',
					school: 'Faculté',
					search: 'Rechercher...',
					unitList: 'Unités',
					addNewUnit: 'Ajouter une nouvelle unité',
					subUnit: 'SubUnit',
					cosec: 'COSECs',
					prof: 'Prof / Resp',
				},
				logout: 'Déconnexion',
				login: {
					button: 'Connexion',
					warning: "Attention - Vous n'êtes pas connecté !",
					title: 'Connectez-vous pour accéder à LHD',
					content:
						"Vous essayez d'accéder à des données sensibles, veuillez fournir vos identifiants pour confirmer votre identité.",
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
					unitPlaceholder: 'Chercher une unité',
					hazards: 'Dangers',
					title: 'Détails du local ',
					designation: 'Désignation',
					building: 'Bâtiment',
					sector: 'Secteur',
					site: 'Site',
					floor: 'Étage',
					attachUnit: 'Rattacher une unité',
					attachUnitTitle: 'Local rattaché aux unités suivantes:',
					undoDeletionUnit: 'Annuler la suppression de l\'unité de ce local',
					deleteUnit: 'Supprimer cette unité de ce local',
					adminuse: 'Type DIN',
					facultyuse: 'Sous-type DIN',
					volume: 'Volume (m³)',
					vol: 'Vol (m³)',
					fichePorte: 'Fiche de porte'
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
					deleteButton: 'Supprimer',
					cancelButton: 'Annuler',
					continueButton: 'Continuer',
					addNew: 'Ajouter',
					search: 'Rechercher',
					comment: 'Commentaire'
				},
				datagrid: {
					columns: 'Colonnes',
					filters: 'Filtres',
					density: 'Densité',
					export: 'Exporter',
					exportCSV: 'Télécharger comme CSV',
					print: 'Imprimer'
				},
				menu: {
					rooms: 'Locaux',
					units: 'Unités',
					organisms: 'Organismes',
					dispensations: 'Dispensations',
					hazardFormControl: 'Contrôle des formulaires de dangers',
					hazards: 'Dangers'
				},
				organism: {
					organismsList: 'Organismes',
					name: 'Nom',
					risk: 'Risque',
					file: 'Fichier',
					search: 'Rechercher',
					updated_on: 'Modifié le',
					updated_by: 'Modifié par',
					updated: 'Modified',
					addNewOrganism: 'Ajouter un nouveau organisme',
					modifyOrganism: 'Modifier l\'organisme',
					organismName: 'Nom de l\'organisme',
					deleteOrganismTitle: 'Supprimer l\'organism: ',
					deleteOrganismMessageStart: 'Cet organisme est encore utilisé dans certains dangers. Veuillez vérifier les dangers en suivant ',
					deleteOrganismMessageEnd: ' et les supprimer avant de supprimer l\'organisme.',
					link: 'ce lien',
					retry: 'Réessayer',
					actions: 'Actions'
				},
				hazards: {
					Biological: 'Biologique',
					Chemical: 'Chimique',
					CompressedGas: 'Gaz compressé',
					Cryogenics: 'Cryogénie',
					Electrical: 'Électrique',
					TimeVaryingEMF: 'Time Varying EMF',
					IncoherentLightSource: 'Source Lumineuse incohérente',
					IonisingRadiation: 'Rayonnement Ionisant',
					Laser: 'Laser',
					Nanoparticles: 'Nanoparticules',
					Noise: 'Bruit',
					StaticMagneticField: 'Champ Magnétique Statique',
					Temperature: 'Température',
					modification_info: 'Modifié par %s le %s',
					otherRooms: ' dû à l\'aimant situé dans la salle ',
					deleteHazardConfirmationMessageTitle: 'Êtes-vous sûrs de vouloir supprimer ce danger?',
				},
				hazardFormControl: {
					title: 'Formulaires des dangers',
					version: 'Version',
					category: 'Catégorie',
					addNewCategory: 'Ajouter une nouvelle catégorie de danger',
					newHazardCategory: 'Insérer la nouvelle catégorie de danger',
					newHazardFormChild: 'Insérer le nom du formulaire enfant',
					insertNewVersion: 'Insérer la version du formulaire du danger',
					newVersionCurrentIs: 'Version courante: ',
					Create: 'Créer',
					Modify: 'Modifier le formulaire de: ',
					fillMandatoryFields: 'Certains champs obligatoires sont vides',
					versionError: 'La nouvelle version doit être plus récente que la version courante',
					childListTitle: 'Liste des formulaires enfants',
					hazard_form_child_name: 'Nom'
				},
				hazard_details: {
					unsavedChangesMessageTitle: 'Changements non enregistrés',
					unsavedChangesMessageDescription: 'Vous avez des changements qui ne sont pas enregistrés. Êtes-vous sûr de vouloir continuer? Tous les changements non sauvegardés seront perdus.'
				}
			},
		},
	},
});

export function translate(key, lang) {
	return i18next.t(key, { lng: lang });
}
