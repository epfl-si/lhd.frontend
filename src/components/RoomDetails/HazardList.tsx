import React from 'react';
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";
import {hazardAdditionalInfoType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {sprintf} from "sprintf-js";
import {fetchFile} from "../../utils/ressources/file";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {TextArea} from "epfl-elements-react/src/stories/molecules/inputFields/TextArea.tsx";
import {Paper, Table, TableBody, TableCell, tableCellClasses, TableHead, TableRow} from "@mui/material";
import TableContainer from "@material-ui/core/TableContainer";
import {styled} from "@mui/joy";

interface HazardListProps {
  fields: string[];
  submissionsList: submissionForm[];
  childFields: string[];
}

export const HazardList = ({
  fields,
  submissionsList,
  childFields
  }: HazardListProps) => {

  const getValueFromSubmission = (item: any): string => {
    const values: any[] = [];
    if (typeof item === 'object' && item !== null) {
      const keys = Object.keys(item);
      if (keys.indexOf("organism") > -1 ) {
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

  const StyledTableCell = styled(TableCell)(({ theme }) => ({
    [`&.${tableCellClasses.head}`]: {
      backgroundColor: '#FFCECE',
      color: theme.palette.common.black,
      fontSize: "small",
      fontWeight: "bold"
    },
    [`&.${tableCellClasses.body}`]: {
      fontSize: "small",
    },
  }));

  const StyledTableCellForChild = styled(TableCell)(({ theme }) => ({
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

  function splitCamelCase(str: string) {
    const label = str.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert a space between lowercase and uppercase letters
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return <TableContainer component={Paper}>
    <Table size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          {fields.map((field) => (
            <StyledTableCell>{splitCamelCase(field)}</StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {submissionsList.map((submission) => (
          <>
            <TableRow
              key={submission.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              {fields.map((field) => {
                const label = getValueFromSubmission(submission.submission.data[field]);
                return <StyledTableCell component="th" scope="row">
                  {label}
                </StyledTableCell>
              })}
            </TableRow>
            {submission.children && submission.children.length > 0 && <TableRow>
              <StyledTableCell colSpan={fields.length}>
                <TableContainer component={Paper}>
                  <Table size="small" aria-label="a dense table">
                    <TableHead>
                      <TableRow>
                        {childFields.map((childField) => (
                          <StyledTableCellForChild>{splitCamelCase(childField)}</StyledTableCellForChild>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {submission.children?.map((submissionChild) => (
                        <>
                          <TableRow
                            key={submissionChild.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                          >
                            {childFields.map((childField) => {
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
};
