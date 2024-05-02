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
import {createKey} from "../../utils/ressources/keyGenerator";
import {useTranslation} from "react-i18next";

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
  const { t } = useTranslation();
  const oidc = useOpenIDConnectContext();
  const [submissionsList, setSubmissionsList] = useState<submissionForm[]>([]);
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<notificationType>({
    type: "info",
    text: '',
  });
  const currentForm = lastVersionForm?.form ? JSON.parse(lastVersionForm?.form) : {};
  const currentFormChild = (lastVersionForm?.children && lastVersionForm?.children.length > 0) ?
    (lastVersionForm.children[0].form ? JSON.parse(lastVersionForm.children[0].form) : undefined) : undefined;

  useEffect(() => {
    const loadFetch = async () => {
      const subform = readOrEditHazard();
      switch (action) {
        case "Add":
          onAddHazard(false, subform);
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
        const childrenList: submissionForm[] = [];
        h.children.forEach(child => {
          childrenList.push({id: child.id, submission: JSON.parse(child.submission),
            form: action == 'Read' ? JSON.parse(child.hazard_form_child_history.form) : JSON.parse(child.hazard_form_child_history.hazard_form_child.form)});
        })
        subForm.push({id: h.id, submission: JSON.parse(h.submission), form: action == 'Read' ? JSON.parse(oldForm) : currentForm,
          children: childrenList});
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
          submission: f.submission,
          children: f.children?.map(c => {
            const childForSave: submissionForm = {id: JSON.parse(c.id), submission: c.submission,
              formName: currentFormChild ? lastVersionForm!.children![0].hazard_form_child_name : ''};
            return childForSave;
          })
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
      const oldSubmission = submissionsList.find(s => s.id == id);
      if(oldSubmission && Object.keys(oldSubmission.submission.data).length == 0) {
        const changedSubmission = {id, submission: {data: newSubmission}, form: currentForm,
          children: oldSubmission.children};
        setSubmissionsList(submissionsList.map(s => s.id == id ? changedSubmission : s));
      }
    }
  }

  const onChangeChildSubmission = (id: string) => {
    return (newSubmission: object, isUnchanged: boolean) => {
      setDirtyState(!isUnchanged);

      let oldParentSubmission: submissionForm | undefined;
      let oldChildSubmission: submissionForm | undefined;
      submissionsList.forEach(s => {
        const child = s.children?.find(c => c.id == id);
        if (child) {
          oldParentSubmission = s;
          oldChildSubmission = child;
        }
      });
      if(oldParentSubmission && oldChildSubmission) {
        const changedChildSubmission = {id, submission: {data: newSubmission}, form: currentFormChild};
        const updatedParentSubmissionChildren = oldParentSubmission.children?.map(s => s.id == id ? changedChildSubmission : s);
        const changedParentSubmission: submissionForm = {...oldParentSubmission, children: updatedParentSubmissionChildren};
        setSubmissionsList(submissionsList.map(s => s.id == oldParentSubmission?.id ? changedParentSubmission : s));
      }
    }
  }

  function onAddHazard(dirtyState: boolean, submissions: submissionForm[]) {
    setDirtyState(dirtyState);
    const newKey = createKey(10);
    if (currentFormChild) {
      setSubmissionsList([...submissions , {
        id: `{"salt":"newHazard${newKey}","eph_id":"newHazard${newKey}"}`, submission: {data: {}},
        form: currentForm, children: [{
          id: `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`, submission: {data: {}},
          form: currentFormChild}]}]); //TODO make it generic if there are more tan one child, If I have more than one add one form for each child
    } else {
      setSubmissionsList([...submissions , {
        id: `{"salt":"newHazard${newKey}","eph_id":"newHazard${newKey}"}`, submission: {data: {}},
        form: currentForm, children: []}]);
    }
  }

  function onAddHazardChild(parentId: string) {
    setDirtyState(true);
    const newKey = createKey(10);
    const parent = submissionsList.find(s => s.id == parentId);
    if(parent) {
      parent.children?.push({
        id: `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`, submission: {data: {}},
        form: currentFormChild});
      setSubmissionsList(submissionsList.map(s => s.id == parentId ? parent : s));
    }
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
              onClick={() => onAddHazard(true, submissionsList)}
      style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>
    </div>
    {submissionsList.map(sf => <div key={sf.id + action + 'div'}>
      <HazardForm submission={sf} action={action} onChangeSubmission={onChangeSubmission(sf.id)}
        key={sf.id + action}/>
      {sf.children && sf.children.length > 0 &&
        <Button size="icon"
                iconName={"#plus-circle"}
                onClick={() => onAddHazardChild(sf.id)}
                style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>}
      {sf.children && sf.children.map(child => <div key={child.id + action + 'div'}>
          <HazardForm submission={child} action={action} onChangeSubmission={onChangeChildSubmission(child.id)}
                      key={child.id + action}/>
        </div>
      )}
        <hr />
      </div>
    )}
    <div style={{marginTop: '50px', visibility: action != "Read" ? "visible" : "hidden"}}>
      <Button
        onClick={handleSubmit}
        label={t(`generic.saveButton`)}
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
