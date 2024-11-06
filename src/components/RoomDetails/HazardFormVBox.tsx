import React, {useEffect, useState} from 'react';
import {hazardFormType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardEditForm} from "./HazardEditForm";
import {HazardList} from "./HazardList";
import {readOrEditHazard} from "../../utils/ressources/jsonUtils";

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
    const forms = readOrEditHazard(room, action, currentForm, true);
    setSubmissionList(forms);
  }, [oidc.accessToken, action, selectedHazardCategory, room]);

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
