import React, {useEffect, useState} from 'react';
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {TextArea} from "epfl-elements-react/src/stories/molecules/inputFields/TextArea.tsx";
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
  const [comment, setComment] = useState<string | undefined>();
  const [isSaveDisabled, setIsSaveDisabled] = useState<boolean>(false);
  const [formsMapValidation, setFormsMapValidation] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const loadFetch = async () => {
      const subform = readOrEditHazard();
      switch (action) {
        case "Add":
          onAddHazard(false, subform);
          break;
        case "Read":
        case "Edit":
          setSubmissionListAndValidationMap([...subform], '', true);
          break;
      };
    };
    loadFetch();
    const hazardAdditionalInfo = room.hazardAdditionalInfo.find(h => h.hazard_category?.hazard_category_name == selectedHazardCategory);
    setComment(decodeURIComponent(hazardAdditionalInfo?.comment ?? ''));
  }, [oidc.accessToken, action, selectedHazardCategory, room]);

  const setSubmissionListAndValidationMap = (submissions: submissionForm[], id: string, isValid: boolean) => {
    setSubmissionsList(submissions);
    const map: {[key: string]: boolean} = {};
    submissions.forEach(s => {
      map[s.id] = getValidationFromMapItem(s.id, id, isValid);
      s.children?.forEach(child => {
        map[child.id] = getValidationFromMapItem(child.id, id, isValid);
      })
    });
    setFormsMapValidation(map);
    setIsSaveDisabled(Object.values(map).some(value => value === false));
  }

  const getValidationFromMapItem = (itemId: string, checkedId: string, isValid: boolean): boolean => {
    if (itemId == checkedId) {
      return isValid;
    } else if (itemId in formsMapValidation) {
      return formsMapValidation[itemId];
    } else {
      return true;
    }
  }

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
        room.name,
        {
          comment: encodeURIComponent(comment ?? '')
        }
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
    return (newSubmission: object, isUnchanged: boolean, isValid: boolean) => {
      setDirtyState(!isUnchanged);
      const oldSubmission = submissionsList.find(s => s.id == id);
      if(oldSubmission) {
        const changedSubmission = {id, submission: {data: newSubmission}, form: currentForm,
          children: oldSubmission.children};
        setSubmissionListAndValidationMap(submissionsList.map(s => s.id == id ? changedSubmission : s), id, isValid);
      }
    }
  }

  const onChangeChildSubmission = (id: string) => {
    return (newSubmission: object, isUnchanged: boolean, isValid: boolean) => {
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
        setSubmissionListAndValidationMap(submissionsList.map(s => s.id == oldParentSubmission?.id ? changedParentSubmission : s), id, isValid);
      }
    }
  }

  function onAddHazard(dirtyState: boolean, submissions: submissionForm[]) {
    setDirtyState(dirtyState);
    const newKey = createKey(10);
    const id = `{"salt":"newHazard${newKey}","eph_id":"newHazard${newKey}"}`;
    let children: { id: string; submission: { data: {}; }; form: any; }[] = [];
    if (currentFormChild) {
      children = [{
        id: `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`, submission: {data: {}},
        form: currentFormChild
      }];//TODO make it generic if there are more than one child, in this case add one form for each child
    }
    setSubmissionListAndValidationMap([...submissions, {
      id: id, submission: {data: {}},
      form: currentForm, children: children
    }], id, false);
  }

  function onAddHazardChild(parentId: string) {
    setDirtyState(true);
    const newKey = createKey(10);
    const parent = submissionsList.find(s => s.id == parentId);
    if(parent) {
      const id = `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`;
      parent.children?.push({
        id: id, submission: {data: {}},
        form: currentFormChild});
      setSubmissionListAndValidationMap(submissionsList.map(s => s.id == parentId ? parent : s), id, false);
    }
  }

  function onChangeAdditionalInfo(newValue: string) {
    setDirtyState(comment !== newValue);
    setComment(newValue);
  }

  return <div style={{display: 'flex', flexDirection: 'column'}}>
    <div style={{display: 'flex', flexDirection: 'column'}}>
      <div style={{display: 'flex', flexDirection: 'row', justifyContent: "space-between"}}>
        <div style={{display: 'flex', flexDirection: 'row', marginBottom: '20px'}}>
          <img style={{margin: '5px', width: '30px', height: '30px'}}
               src={getHazardImage(selectedHazardCategory)}/>
          <strong style={{marginLeft: '10px'}}>{t(`hazards.`.concat(selectedHazardCategory))}</strong>
        </div>
        <Button size="icon"
                iconName={"#plus-circle"}
                onClick={() => onAddHazard(true, submissionsList)}
                style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>
      </div>
      <TextArea
        id={"comment"}
        name="comment"
        label="Comment"
        key={selectedHazardCategory+"_key"}
        onChange={onChangeAdditionalInfo}
        value={comment}
        isReadonly={action == 'Read'}
      />
      <hr/>
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
                      key={child.id + action} />
        </div>
      )}
        <hr />
      </div>
    )}
    <div style={{marginTop: '50px', visibility: action != "Read" ? "visible" : "hidden"}}>
      <Button
        onClick={handleSubmit}
        isDisabled={isSaveDisabled}
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
