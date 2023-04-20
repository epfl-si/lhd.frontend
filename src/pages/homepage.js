import { RoomTable } from '../components/RoomTable';

export default function HomePage() {
	return (
		<div>
			<RoomTable
				gQuery={`rooms (where: { building: { equals: "BC"} }) {
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
			/>
		</div>
	);
}
