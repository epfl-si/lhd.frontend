import React, {useEffect, useState} from 'react';
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {hazardFormType, notificationType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {getHazardImage} from "./HazardProperties";
import {addHazard} from "../../utils/graphql/PostingTools";
import {env} from "../../utils/env";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardForm} from "./HazardForm";
import {createKey} from "../../utils/ressources/keyGeneration";
import {createKey} from "../../utils/ressources/keyGenerator";

interface HazardFormVBoxProps {
  room: roomDetailsType;
  selectedHazardCategory: string;
  lastVersionForm: hazardFormType | undefined;
  action: 'Add' | 'Edit' | 'Read';
  onChangeAction?: (hazardName: string) => void;
  setDirtyState: (modified: boolean) => void;
}

export const HazardFormVBox = ({
  room,
  selectedHazardCategory,
  lastVersionForm,
  action,
  onChangeAction,
  setDirtyState
}: HazardFormVBoxProps) => {
  const oidc = useOpenIDConnectContext();
  const [submissionsList, setSubmissionsList] = useState<submissionForm[]>([]);
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<notificationType>({
    type: "info",
    text: '',
  });
  const currentForm = lastVersionForm?.form ? JSON.parse(lastVersionForm?.form) : {};

  useEffect(() => {
    const loadFetch = async () => {
      const subform = readOrEditHazard();
      switch (action) {
        case "Add":
          const newKey = createKey(10);
          setSubmissionsList([...subform , {
            id: `{"salt":"newHazard${newKey}","eph_id":"newHazard${newKey}"}`, submission: {data: {}},
            form: currentForm}]);
          break;
        case "Read":
        case "Edit":
          setSubmissionsList([...subform]);
          break;
      };
    };
    loadFetch();
  }, [oidc.accessToken, action, selectedHazardCategory, room]);

  const readOrEditHazard = (): submissionForm[] => {
    const subForm: submissionForm[] = [];
    room.hazards.forEach(h => {
      const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
      if (category == selectedHazardCategory) {
        const oldForm = h.hazard_form_history.form;
        subForm.push({id: h.id, submission: JSON.parse(h.submission), form: action == 'Read' ? JSON.parse(oldForm) : currentForm});
      }
    });
    return subForm;
  }

  const handleSubmit = async () => {
    if (lastVersionForm)  {
      const submissionsToSave: submissionForm[] = [];
      submissionsList.forEach(f => {
        submissionsToSave.push({
          id: JSON.parse(f.id),
          submission: f.submission
        })
      });
      addHazard(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken,
        JSON.stringify(submissionsToSave).replaceAll('"','\\"'),
        lastVersionForm,
        room.name
      ).then(res => {
        handleOpen(res);
      });
    }
  };

  const handleOpen = async (res: any) => {
    if ( res.data?.addHazardToRoom?.errors ) {
      const notif: notificationType = {
        text: res.data?.addHazardToRoom?.errors[0].message,
        type: 'error'
      };
      setNotificationType(notif);
    } else if ( res.status === 200 ) {
      if ( onChangeAction ) {
        onChangeAction(selectedHazardCategory);
      }
      setNotificationType(notificationsVariants['room-update-success']);
    } else {
      setNotificationType(notificationsVariants['room-update-error']);
    }
    setOpenNotification(true);
  };

  const handleClose = () => {
    setOpenNotification(false);
  };

  const onChangeSubmission = (id: string) => {
    return (newSubmission: object, isUnchanged: boolean) => {
      setDirtyState(!isUnchanged);
      const arr = submissionsList.find(s => s.id == id);
      if(arr && Object.keys(arr.submission.data).length == 0) {
        const changedSubmission = {id, submission: {data: newSubmission}, form: currentForm};
        setSubmissionsList(submissionsList.map(s => s.id == id ? changedSubmission : s));
      }
    }
  }

  function onAddHazard() {
    const newKey = createKey(10);
    const newSubmissionArray = [...submissionsList, {
      id: `{"salt":"newHazard${newKey}","eph_id":"newHazard${newKey}"}`, submission: {data: {}},
      form: currentForm}];
    setSubmissionsList(newSubmissionArray)
  }

  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: "space-between"}}>
      <div style={{display: 'flex', flexDirection: 'row', marginBottom: '20px'}}>
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(selectedHazardCategory)}/>
        <strong style={{marginLeft: '10px'}}>{selectedHazardCategory}</strong>
      </div>
      <Button size="icon"
              iconName={"#plus-circle"}
              onClick={onAddHazard}
      style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>
    </div>
    {submissionsList.map(sf => <div key={sf.id + action + 'div'}>
      <HazardForm submission={sf} action={action} onChangeSubmission={onChangeSubmission(sf.id)}
        key={sf.id + action}/>
        <hr />
      </div>
    )}
    <div style={{marginTop: '50px', visibility: action != "Read" ? "visible" : "hidden"}}>
      <Button
        onClick={handleSubmit}
        label="Save"
        iconName={`${featherIcons}#save`}
        primary/>
    </div>
    <Notifications
      open={openNotification}
      notification={notificationType}
      close={handleClose}
    />
  </div>
};
