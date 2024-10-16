import React, {useEffect, useState} from 'react';
import {hazardFormType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardEditForm} from "./HazardEditForm";
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
  const hazardAdditionalInfo = selectedHazardCategory ? room.hazardAdditionalInfo.find(h => h.hazard_category?.hazard_category_name == selectedHazardCategory) : undefined;
  const currentForm = lastVersionForm?.form ? JSON.parse(lastVersionForm?.form) : {};

  useEffect(() => {
    const forms = readOrEditHazard();
    setSubmissionList(forms);
  }, [oidc.accessToken, action, selectedHazardCategory, room]);

  const readOrEditHazard = (): submissionForm[] => {
    const subForm: submissionForm[] = [];
    room.hazards.forEach(h => {
      const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
      //if (category == selectedHazardCategory) {
        const childrenList: submissionForm[] = [];
        h.children.forEach(child => {
          childrenList.push({id: child.id, submission: JSON.parse(child.submission),
            form: action == 'Read' ? JSON.parse(child.hazard_form_child_history.form) : JSON.parse(child.hazard_form_child_history.hazard_form_child.form)});
        })
        subForm.push({id: h.id, submission: JSON.parse(h.submission), form: action == 'Read' ? JSON.parse(h.hazard_form_history.form) : currentForm,
          children: childrenList, room: room, category: category});
      //}
    });
    return subForm;
  }

  return <div>
    <HazardList submissionsList={submissionsList}
                onChangeAction={onChangeAction}/>

    <HazardEditForm room={room}
                    selectedHazardCategory={selectedHazardCategory}
                    lastVersionForm={lastVersionForm}
                    action={action}
                    roomList={roomList}
                    onChangeAction={onChangeAction}
                    onReadAction={onReadAction}
                    organismList={organismList}
                    initialSubmissionsList={submissionsList.filter(s => s.category == selectedHazardCategory)}
                    hazardAdditionalInfo={hazardAdditionalInfo}
      />
  </div>
};
