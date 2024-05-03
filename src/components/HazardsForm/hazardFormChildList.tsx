import {useTranslation} from "react-i18next";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import React, {useState} from "react";
import {columnType, hazardFormType} from "../../utils/ressources/types";
import {Box, Typography} from "@material-ui/core";
import {EntriesTableCategory} from "../../components/Table/EntriesTableCategory";
import {hazardFormChildType} from "../../utils/ressources/types";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {useHistory} from "react-router-dom";

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
					iconName={`${featherIcons}#plus-circle`}
					primary/>
			</div>
		</Box>;
}
