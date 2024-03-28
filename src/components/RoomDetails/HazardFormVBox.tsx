import React, {useEffect, useState} from 'react';
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {
  hazardFormType,
  hazardType,
  notificationType,
  roomDetailsType,
  submissionForm
} from "../../utils/ressources/types";
import {getHazardImage} from "./HazardProperties";
import {addHazard} from "../../utils/graphql/PostingTools";
import {env} from "../../utils/env";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {fetchHazardsInRoom} from "../../utils/graphql/FetchingTools";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardForm} from "./HazardForm";
import {checkForHazardSubmissions} from "../../utils/ressources/objectComparing";

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
  const [roomHazards, setRoomHazards] = useState<hazardType[]>(room.hazards);
  const [submissionForm, setSubmissionForm] = useState<submissionForm[]>([]);
  const [formData, setFormData] = useState<submissionForm[]>([]);
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<notificationType>({
    type: "info",
    text: '',
  });
  const currentForm = lastVersionForm?.form ? JSON.parse(lastVersionForm?.form) : {};

  useEffect(() => {
    const loadFetch = async () => {
      const subform = readOrEditHazard(action);
      switch (action) {
        case "Add":
          setSubmissionForm([...subform , {
            id: '{"salt":"newHazard","eph_id":"newHazard"}', submission: {},
            form: currentForm}]);
          break;
        case "Read":
        case "Edit":
          setSubmissionForm([...subform]);
          break;
      };
    };
    loadFetch();
  }, [oidc.accessToken, roomHazards, action, selectedHazardCategory]);

  const readOrEditHazard = (action: string): submissionForm[] => {
    const subForm: submissionForm[] = [];
    roomHazards.forEach(h => {
      const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
      if (category == selectedHazardCategory) {
        const oldForm = h.hazard_form_history.form;
        subForm.push({id: h.id, submission: JSON.parse(h.submission), form: action == 'Read' ? JSON.parse(oldForm) : currentForm});
      }
    });
    setFormData(action == 'Read' ? [] : [...subForm]);
    return subForm;
  }

  const handleSubmit = async () => {
    if (lastVersionForm)  {
      const submissionsList: submissionForm[] = [];
      formData.forEach(f => {
        submissionsList.push({
          id: JSON.parse(f.id),
          submission: f.submission
        })
      });
      addHazard(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken,
        JSON.stringify(submissionsList).replaceAll('"','\\"'),
        lastVersionForm,
        room.name
      ).then(res => {
        handleOpen(res);
      });
    }
  };

  const fetchHazards = async () => {
    const results = await fetchHazardsInRoom(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      room.name
    );
    if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
      setRoomHazards(results.data[0].hazards);
      if ( onChangeAction ) {
        onChangeAction(selectedHazardCategory);
      }
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
      await fetchHazards();
      setDirtyState(false);
      setNotificationType(notificationsVariants['room-update-success']);
    } else {
      setNotificationType(notificationsVariants['room-update-error']);
    }
    setOpenNotification(true);
  };

  const handleClose = () => {
    setOpenNotification(false);
  };

  const onChangeSubmission = (submissionFormChanged: object, submissionFormOriginal: submissionForm) => {
    if(action!='Read' && submissionFormChanged && submissionFormOriginal) {
      const submissionsAreEquals = checkForHazardSubmissions(submissionFormChanged, submissionFormOriginal.submission.data);
      console.log('submissionsAreEquals', submissionsAreEquals);
      setDirtyState(!submissionsAreEquals);
    }

    const submissions = formData.filter(f => f.id != submissionFormOriginal.id);
    submissions.push({id: submissionFormOriginal.id, submission: {data: submissionFormChanged}});
    setFormData([...submissions]);
  }

  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', flexDirection: 'row', marginBottom: '20px'}}>
      <img style={{margin: '5px', width: '30px', height: '30px'}}
           src={getHazardImage(selectedHazardCategory)}/>
      <strong style={{marginLeft: '10px'}}>{selectedHazardCategory}</strong>
    </div>
    {submissionForm.map(sf => <div>
      <HazardForm submission={sf} action={action} onChangeSubmission={onChangeSubmission(sf.id)}
        key={sf.id + action}/>
        <hr/>
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
