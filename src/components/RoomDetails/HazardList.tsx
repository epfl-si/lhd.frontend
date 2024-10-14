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
}

export const HazardList = ({
  fields,
  submissionsList
  }: HazardListProps) => {

  const getValueFromSubmission = (item: any): any => {
    if (typeof item === 'object' && item !== null) {
      const entries = Object.entries(item);
      if (entries.length > 0) {
        const [dynamicKey, value] = entries[0];
        return getValueFromSubmission(value);
      }
    } else {
      return item;
    }
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

  function splitCamelCase(str: string) {
    const label = str.replace(/([a-z])([A-Z])/g, '$1 $2') // Insert a space between lowercase and uppercase letters
    return label.charAt(0).toUpperCase() + label.slice(1);
  }

  return <TableContainer component={Paper}>
    <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
      <TableHead>
        <TableRow>
          {fields.map((field) => (
            <StyledTableCell>{splitCamelCase(field)}</StyledTableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {submissionsList.map((submission) => (
          <TableRow
            key={submission.id}
            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
          >
            {fields.map((field) => (
              <StyledTableCell component="th" scope="row">
                {getValueFromSubmission(submission.submission.data[field])}
              </StyledTableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
};
