import {useTranslation} from "react-i18next";
import React, {useState} from "react";
import {columnType, hazardFormChildType} from "../../utils/ressources/types";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../Table/EntriesTableCategory";
import {useHistory} from "react-router-dom";
import { Button } from "epfl-elements-react-si-extra";

interface HazardFormChildListProps {
	hazardFormChildList: hazardFormChildType[];
	category: string;
}

export const HazardFormChildList = ({
	hazardFormChildList,
	category
}: HazardFormChildListProps) => {
	const { t } = useTranslation();
	const history = useHistory();
	const [tableData, setTableData] = useState<hazardFormChildType[]>(hazardFormChildList);
	const [loading, setLoading] = useState(false);
	const columns: columnType[] = [
		{field: "version", headerName: t(`hazardFormControl.version`), width: 100},
		{field: "hazard_form_child_name", headerName: t(`hazardFormControl.hazard_form_child_name`), width: 200}
	];

	return <Box>
			<Typography gutterBottom>
				{t(`hazardFormControl.childListTitle`)}
			</Typography>
			<EntriesTableCategory
				tableData={tableData}
				columns={columns}
				loading={loading}
				pageToOpen={"hazardFormsChild"}
			/>
			<div style={{marginTop: '50px'}}>
				<Button
					onClick={() => history.push(`/hazardFormChildDetails?name=NewHazardFormChild&category=${category}`)}
					label={t(`generic.addNew`)}
					iconName={`#plus-circle`}
					primary/>
			</div>
		</Box>;
}
