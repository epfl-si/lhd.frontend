import { Box, Chip, IconButton, ListItem } from '@material-ui/core';
import { DeleteForever } from '@mui/icons-material';
import { Paper } from '@mui/material';
import { columns } from './appTable';

export default function AppParamsList(props) {
	const { paramsData, setParamsData, setSearchOptions } = props;

	const handleParamDelete = data => () => {
		setParamsData(paramsData.filter(p => p.key !== data.key));
	};

	const onClear = () => {
		setSearchOptions(columns);
		setParamsData([]);
	};
	return (
		paramsData.length > 0 && (
			<Paper
				sx={{
					position: 'relative',
					display: 'flex',
					flexDirection: 'row',
					justifyContent: 'center',
					flexWrap: 'wrap',
					listStyle: 'none',
					p: 0.5,
					m: 0,
				}}
				component="ul"
			>
				<p>Filters list</p>
				{paramsData.length > 1 && (
					<Box position="absolute" top={5} right={5}>
						<IconButton
							aria-label="delete"
							size="small"
							color="primary"
							onClick={onClear}
						>
							<DeleteForever fontSize="small" />
						</IconButton>
					</Box>
				)}

				{paramsData &&
					paramsData.map(data => {
						return (
							<ListItem key={data.key}>
								<Chip
									label={
										<div>
											<b>{data.param} |</b> {data.label}
										</div>
									}
									onDelete={handleParamDelete(data)}
								/>
							</ListItem>
						);
					})}
			</Paper>
		)
	);
}
