import { RoomTable } from '../components/RoomTable';
import React, {useEffect} from "react";

interface HomePageProps {
	handleCurrentPage: (page: string) => void;
}

export const HomePage = ({
	handleCurrentPage
}: HomePageProps) => {
	handleCurrentPage("rooms");

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
};
