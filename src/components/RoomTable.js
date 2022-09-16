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
            name
            institute {
              name
              school {
                name
              }
            }
            unitId
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
