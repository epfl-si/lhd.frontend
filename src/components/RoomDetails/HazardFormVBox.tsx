import React, {useEffect, useRef, useState} from 'react';
import {hazardFormType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchOtherRoomsForStaticMagneticField} from "../../utils/graphql/FetchingTools";
import {HazardEditForm} from "./HazardEditForm";
import {HazardTitle} from "./HazardTitle";
import TableContainer from '@material-ui/core/TableContainer';
import {Paper, Table, TableBody, TableCell, tableCellClasses, TableHead, TableRow} from "@mui/material";
import {styled} from "@mui/joy";

interface HazardFormVBoxProps {
  room: roomDetailsType;
  selectedHazardCategory: string;
  lastVersionForm: hazardFormType | undefined;
  action: 'Add' | 'Edit' | 'Read';
  onChangeAction?: (hazardName: string) => void;
  onReadAction?: (hazardName: string) => void;
  roomList: string[];
  organismList: object[];
}

export const HazardFormVBox = ({
  room,
  selectedHazardCategory,
  lastVersionForm,
  action,
  onChangeAction,
  onReadAction,
  roomList,
  organismList
}: HazardFormVBoxProps) => {
  const oidc = useOpenIDConnectContext();
  const [submissionsList, setSubmissionList] = useState<submissionForm[]>([]);
  const [otherRoom, setOtherRoom] = useState<roomDetailsType | null>(null);
  const hazardAdditionalInfo = room.hazardAdditionalInfo.find(h => h.hazard_category?.hazard_category_name == selectedHazardCategory);
  const currentForm = lastVersionForm?.form ? JSON.parse(lastVersionForm?.form) : {};
  const fields = useRef<string[]>([]);

  useEffect(() => {
    const forms = readOrEditHazard();
    setSubmissionList(forms);
    fields.current = Object.keys(forms.length>0 ? forms[0].submission.data : []).filter(key => key != 'status' && key != "delete");
    if(selectedHazardCategory == 'StaticMagneticField') {
      loadOtherRoomsForStaticMagneticField();
    }
  }, [oidc.accessToken, action, selectedHazardCategory, room]);

  const loadOtherRoomsForStaticMagneticField = async () => {
    const results = await fetchOtherRoomsForStaticMagneticField(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      room.name
    );
    if (results.status === 200 && results.data && typeof results.data !== 'string') {
      setOtherRoom(results.data[0])
      console.log(results.data[0])
    } else {
      console.error('Bad GraphQL results', results);
    }
  }

  const readOrEditHazard = (): submissionForm[] => {
    const subForm: submissionForm[] = [];
    room.hazards.forEach(h => {
      const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
      if (category == selectedHazardCategory) {
        const childrenList: submissionForm[] = [];
        h.children.forEach(child => {
          childrenList.push({id: child.id, submission: JSON.parse(child.submission),
            form: action == 'Read' ? JSON.parse(child.hazard_form_child_history.form) : JSON.parse(child.hazard_form_child_history.hazard_form_child.form)});
        })
        subForm.push({id: h.id, submission: JSON.parse(h.submission), form: action == 'Read' ? JSON.parse(h.hazard_form_history.form) : currentForm,
          children: childrenList});
      }
    });
    return subForm;
  }

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

  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <HazardTitle hazardAdditionalInfo={hazardAdditionalInfo}
                 selectedHazardCategory={selectedHazardCategory}
                 otherRoom={otherRoom}
                 comment={hazardAdditionalInfo?.comment}
                 isReadonly={true}
    />

    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} size="small" aria-label="a dense table">
        <TableHead>
          <TableRow>
            {fields.current.map((field) => (
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
              {fields.current.map((field) => (
                <StyledTableCell component="th" scope="row">
                  {getValueFromSubmission(submission.submission.data[field])}
                </StyledTableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>

    <HazardEditForm room={room}
                    selectedHazardCategory={selectedHazardCategory}
                    lastVersionForm={lastVersionForm}
                    action={action}
                    roomList={roomList}
                    onChangeAction={onChangeAction}
                    onReadAction={onReadAction}
                    organismList={organismList}
                    initialSubmissionsList={submissionsList}
                    hazardAdditionalInfo={hazardAdditionalInfo}
                    otherRoom={otherRoom}
      />
  </div>
};
