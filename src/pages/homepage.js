import { RoomTable } from '../components/RoomTable';

export default function HomePage() {
	return (//(where: { building: { equals: "BC"} })
		<div>
			<RoomTable
				gQuery={`rooms { 
					name
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
