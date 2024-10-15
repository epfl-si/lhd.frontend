import React, {useEffect, useRef, useState} from 'react';
import {hazardFormType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchOtherRoomsForStaticMagneticField} from "../../utils/graphql/FetchingTools";
import {HazardEditForm} from "./HazardEditForm";
import {HazardTitle} from "./HazardTitle";
import {HazardList} from "./HazardList";

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
  const childFields = useRef<string[]>([]);

  useEffect(() => {
    const forms = readOrEditHazard();
    setSubmissionList(forms);
    fields.current = Object.keys(forms.length>0 ? forms[0].submission.data : []).filter(key => key != 'status' && key != "delete");
    findChildFields(forms);
    if(selectedHazardCategory == 'StaticMagneticField') {
      loadOtherRoomsForStaticMagneticField();
    }
  }, [oidc.accessToken, action, selectedHazardCategory, room]);

  const findChildFields = (forms: submissionForm[]) => {
    const formsWithChildren = forms.filter(f => f.children && f.children.length>0);
    if (formsWithChildren.length > 0 && formsWithChildren[0].children && formsWithChildren[0].children.length > 0) {
      childFields.current = Object.keys(formsWithChildren[0].children[0].submission.data).filter(key => key != 'status' && key != "delete");
    } else {
      childFields.current = [];
    }
  }
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

  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <HazardTitle hazardAdditionalInfo={hazardAdditionalInfo}
                 selectedHazardCategory={selectedHazardCategory}
                 otherRoom={otherRoom}
                 comment={hazardAdditionalInfo?.comment}
                 isReadonly={true}
    />

    <HazardList fields={fields.current}
                childFields={childFields.current}
                submissionsList={submissionsList} />

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
