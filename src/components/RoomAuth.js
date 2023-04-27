import { AppTable } from './Table/AppTable';

export function RoomAuth({ gQuery }) {
	return <AppTable graphqlBody={gQuery} variables={{}} />;
}
