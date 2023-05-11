import { AppTable } from './Table/AppTable.tsx';

export function RoomAuth({ gQuery }) {
	return <AppTable graphqlBody={gQuery} variables={{}} />;
}
