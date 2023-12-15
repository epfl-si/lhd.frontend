import { RoomTable } from '../components/RoomTable';

export default function HomePage() {
	return (//(where: { building: { equals: "BC"} })
		<div>
			<RoomTable
				gQuery={`rooms { 
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
