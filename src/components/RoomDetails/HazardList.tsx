import React, {useEffect, useRef, useState} from 'react';
import {submissionForm} from "../../utils/ressources/types";
import {Paper, Table, TableBody, TableCell, tableCellClasses, TableHead, TableRow} from "@mui/material";
import TableContainer from "@material-ui/core/TableContainer";
import {styled} from "@mui/joy";
import {HazardTitle} from "./HazardTitle";
import {splitCamelCase} from "../../utils/ressources/jsonUtils";

interface HazardListProps {
	submissionsList: submissionForm[];
	onChangeAction?: (hazardName: string) => void;
}

export const HazardList = ({
														 submissionsList,
														 onChangeAction
													 }: HazardListProps) => {
	const fields = useRef<string[]>([]);
	const childFields = useRef<string[]>([]);
	const [groupedSubmissionList, setGroupedSubmissionList] = useState<{ [category: string]: submissionForm[] }>({});

	useEffect(() => {
		setGroupedSubmissionList(submissionsList.reduce(
			(result: any, currentValue: any) => {
				(result[currentValue['category']] = result[currentValue['category']] || []).push(currentValue);
				return result;
			}, {}));
	}, [submissionsList]);

	const findChildFields = (forms: submissionForm[]) => {
		const formsWithChildren = forms.filter(f => f.children && f.children.length > 0);
		if ( formsWithChildren.length > 0 && formsWithChildren[0].children && formsWithChildren[0].children.length > 0 ) {
			childFields.current = Object.keys(formsWithChildren[0].children[0].submission.data).filter(key => key != 'status' && key != "delete");
		} else {
			childFields.current = [];
		}
	}

	const getValueFromSubmission = (item: any): string => {
		const values: any[] = [];
		if ( typeof item === 'object' && item !== null ) {
			const keys = Object.keys(item);
			if ( keys.indexOf("organism") > -1 ) {
				values.push(getValueFromSubmission(item["organism"]));
			} else {
				keys.forEach(k => {
					values.push(getValueFromSubmission(item[k]));
				})
			}
		} else {
			values.push(item);
		}
		return values.join(", ");
	}

	const StyledTableCell = styled(TableCell)(({theme}) => ({
		[`&.${tableCellClasses.head}`]: {
			backgroundColor: 'lightgray',
			color: theme.palette.common.black,
			fontSize: "small",
			fontWeight: "bold"
		},
		[`&.${tableCellClasses.body}`]: {
			fontSize: "small",
		},
	}));

	const StyledTableCellForChild = styled(TableCell)(({theme}) => ({
		[`&.${tableCellClasses.head}`]: {
			backgroundColor: '#fafafa',
			color: theme.palette.common.black,
			fontSize: "small",
			fontWeight: "bold"
		},
		[`&.${tableCellClasses.body}`]: {
			backgroundColor: '#fafafa',
			fontSize: "small",
		},
	}));

	return <div style={{display: 'flex', flexDirection: 'column'}}>
		{Object.keys(groupedSubmissionList).sort().map((cat, index) => {
			fields.current = Object.keys(groupedSubmissionList[cat].length > 0 ? groupedSubmissionList[cat][0].submission.data : []).filter(key => key != 'status' && key != "delete");
			findChildFields(groupedSubmissionList[cat]);
			return <div style={{marginTop: '10px'}}>
				<HazardTitle selectedHazardCategory={cat}
														isReadonly={true}
														onChangeAction={onChangeAction}/>
				<TableContainer component={Paper}>
					<Table size="small" aria-label="a dense table">
						<TableHead>
							<TableRow>
								{fields.current.map((field) => (
									<StyledTableCell>{splitCamelCase(field)}</StyledTableCell>
								))}
							</TableRow>
						</TableHead>
						<TableBody>
							{groupedSubmissionList[cat].map((submission) => (
								<>
									<TableRow
										key={submission.id}
										sx={{'&:last-child td, &:last-child th': {border: 0}}}
									>
										{fields.current.map((field) => {
											const label = getValueFromSubmission(submission.submission.data[field]);
											return <StyledTableCell component="th" scope="row">
												{label}
											</StyledTableCell>
										})}
									</TableRow>
									{submission.children && submission.children.length > 0 && <TableRow>
					  <StyledTableCell colSpan={fields.current.length}>
						  <TableContainer component={Paper}>
							  <Table size="small" aria-label="a dense table">
								  <TableHead>
									  <TableRow>
                      {childFields.current.map((childField) => (
                        <StyledTableCellForChild>{splitCamelCase(childField)}</StyledTableCellForChild>
                      ))}
									  </TableRow>
								  </TableHead>
								  <TableBody>
                    {submission.children?.map((submissionChild) => (
                      <>
                        <TableRow
                          key={submissionChild.id}
                          sx={{'&:last-child td, &:last-child th': {border: 0}}}
                        >
                          {childFields.current.map((childField) => {
                            const label = getValueFromSubmission(submissionChild.submission.data[childField]);
                            return <StyledTableCellForChild component="th" scope="row">
                              {label}
                            </StyledTableCellForChild>
                          })}
                        </TableRow>
                      </>
                    ))}
								  </TableBody>
							  </Table>
						  </TableContainer>
					  </StyledTableCell>
				  </TableRow>}
								</>
							))}
						</TableBody>
					</Table>
				</TableContainer>
			</div>
		})}
	</div>
};
