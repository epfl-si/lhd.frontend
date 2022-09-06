import { AppTable } from '../components/appTable';

export function RoomTable() {
	return (
		<AppTable
			graphqlBody={`rooms (where: { building: { equals: "BC"} }) {
				name
				occupancies { 
          cosecs { name }
          professors { name }
          unit {
            name_unit
            institut {
              name_institut
              faculty {
                name_faculty
              }
            }
            sciper_unit
          }
        }
        building
        sector
        floor
        kind {
          name
        }
			}`}
			variables={{}}
		/>
	);
}
