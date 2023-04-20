import { RoomTable } from '../components/RoomTable';

export default function BioHazard() {
	return (
		<div>
			<RoomTable
				gQuery={`rooms (where: { bio: { bio_level: { not: {equals: null}} }}) {
          name
          occupancies {
            unit {
              name
            }
          }
          bio {
            bio_level
            comment
            bio_org_lab {
              bio_org {
                organism
              }
            }
          }
          name
        }`}
			/>
		</div>
	);
}
