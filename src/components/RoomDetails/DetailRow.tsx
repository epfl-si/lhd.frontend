import { Box } from '@material-ui/core';
import React from 'react';

type DetailRowProps = {
	title: string;
	value: string | undefined;
};

export default function DetailRow({ title, value }: DetailRowProps) {
	return (
		<Box display="flex" flexDirection="row" justifyContent="space-between">
			<b>{title}</b>
			<Box>{value}</Box>
		</Box>
	);
}
