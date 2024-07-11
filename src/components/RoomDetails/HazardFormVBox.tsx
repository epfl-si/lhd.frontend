import React, {useEffect, useRef, useState} from 'react';
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
import {sprintf} from "sprintf-js";
import {fetchOtherRoomsForStaticMagneticField} from "../../utils/graphql/FetchingTools";
import {fetchFile, readFileAsBase64} from "../../utils/ressources/file";

interface HazardFormVBoxProps {
  room: roomDetailsType;
  selectedHazardCategory: string;
  lastVersionForm: hazardFormType | undefined;
  action: 'Add' | 'Edit' | 'Read';
  onChangeAction?: (hazardName: string) => void;
  setDirtyState: (modified: boolean) => void;
  roomList: string[];
  organismList: object[];
}

export const HazardFormVBox = ({
  room,
  selectedHazardCategory,
  lastVersionForm,
  action,
  onChangeAction,
  setDirtyState,
  roomList,
  organismList
}: HazardFormVBoxProps) => {
  const { t } = useTranslation();
  const oidc = useOpenIDConnectContext();
  const submissionsList = useRef<submissionForm[]>([]);
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
  const formsMapValidation = useRef<{[key: string]: boolean}>({});
  const [otherRoom, setOtherRoom] = useState<roomDetailsType | null>(null);
  const hazardAdditionalInfo = room.hazardAdditionalInfo.find(h => h.hazard_category?.hazard_category_name == selectedHazardCategory);
  const [file, setFile] = useState<File | undefined>();

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
    setComment(decodeURIComponent(hazardAdditionalInfo?.comment ?? ''));
    setFile(undefined);
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

  const setSubmissionListAndValidationMap = (submissions: submissionForm[], id: string, isValid: boolean) => {
    submissionsList.current = submissions;
    const map: {[key: string]: boolean} = {};
    submissions.forEach(s => {
      map[s.id] = getValidationFromMapItem(s.id, id, isValid);
      s.children?.forEach(child => {
        map[child.id] = getValidationFromMapItem(child.id, id, isValid);
      })
    });
    formsMapValidation.current = map;
    setIsSaveDisabled(Object.values(map).some(value => value === false));
  }

  const getValidationFromMapItem = (itemId: string, checkedId: string, isValid: boolean): boolean => {
    if (itemId == checkedId) {
      return isValid;
    } else if (itemId in formsMapValidation.current) {
      return formsMapValidation.current[itemId];
    } else {
      return false;
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
      submissionsList.current.forEach(f => {
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
      let fileBase64 = await readFileAsBase64(file);
      addHazard(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken,
        JSON.stringify(submissionsToSave).replaceAll('"','\\"'),
        lastVersionForm,
        room.name,
        {
          comment: encodeURIComponent(comment ?? ''),
          file: fileBase64,
          fileName: file?.name
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
      const oldSubmission = submissionsList.current.find(s => s.id == id);
      if(oldSubmission) {
        const changedSubmission = {id, submission: {data: newSubmission}, form: currentForm,
          children: oldSubmission.children};
        setSubmissionListAndValidationMap(submissionsList.current.map(s => s.id == id ? changedSubmission : s), id, isValid);
      }
    }
  }

  const onChangeChildSubmission = (id: string) => {
    return (newSubmission: object, isUnchanged: boolean, isValid: boolean) => {
      setDirtyState(!isUnchanged);

      let oldParentSubmission: submissionForm | undefined;
      let oldChildSubmission: submissionForm | undefined;
      submissionsList.current.forEach(s => {
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
        setSubmissionListAndValidationMap(submissionsList.current.map(s => s.id == oldParentSubmission?.id ? changedParentSubmission : s), id, isValid);
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
    const parent = submissionsList.current.find(s => s.id == parentId);
    if(parent) {
      const id = `{"salt":"newHazardChild${newKey}","eph_id":"newHazardChild${newKey}"}`;
      parent.children?.push({
        id: id, submission: {data: {}},
        form: currentFormChild});
      setSubmissionListAndValidationMap(submissionsList.current.map(s => s.id == parentId ? parent : s), id, false);
    }
  }

  function onChangeAdditionalInfo(newValue: string) {
    setDirtyState(comment !== newValue);
    setComment(newValue);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleClickFileLink = async (event: any) => {
    if (!event.defaultPrevented) {
      event.preventDefault();
      await fetchFile(
        oidc.accessToken,
        hazardAdditionalInfo!.filePath!
      );
    }
  };

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
                onClick={() => onAddHazard(true, submissionsList.current)}
                style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>
      </div>
      {otherRoom && otherRoom.hazardReferences.map(ref => {
        if (ref.hazards.room?.name) {
          const submission = (ref && ref.submission) ? JSON.parse(ref.submission) : null;
          const url = `/roomdetails?room=${encodeURIComponent(ref.hazards.room?.name)}`;
          return <div>
              <label style={{fontSize: "small"}}>
                {submission != null ? (submission.data.line + 'mT ' + submission.data.position) : ''}
                {t(`hazards.otherRooms`)}
                <a href={url}>{ref.hazards.room?.name}</a>
              </label>
            </div>
        } else {
          return <></>
        }
      })}
      <TextArea
        id={"comment"}
        name="comment"
        label="Comment"
        key={selectedHazardCategory + "_key"}
        onChange={onChangeAdditionalInfo}
        value={comment}
        isReadonly={action == 'Read'}
      />
      <div>
        <input id="file" type="file" onChange={handleFileChange} accept='.pdf' key={'newFile' + selectedHazardCategory}/>
      </div>
      {hazardAdditionalInfo && hazardAdditionalInfo.filePath &&
        <a onClick={handleClickFileLink} href={hazardAdditionalInfo.filePath}>
          {hazardAdditionalInfo.filePath.split('/').pop()}
        </a>}
      {hazardAdditionalInfo && hazardAdditionalInfo.modified_on && <label style={{
        fontStyle: "italic",
        fontSize: "small"
      }}>{sprintf(t(`hazards.modification_info`), hazardAdditionalInfo.modified_by,
          (new Date(hazardAdditionalInfo.modified_on)).toLocaleString('fr-CH', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          }))}</label>}
      <hr/>
    </div>
    {submissionsList.current.map(sf => <div key={sf.id + action + 'div'}>
      <HazardForm submission={sf} action={action} onChangeSubmission={onChangeSubmission(sf.id)}
                  key={sf.id + action} roomList={roomList} organismList={organismList}/>
      {currentFormChild &&
        <Button size="icon"
                iconName={"#plus-circle"}
                onClick={() => onAddHazardChild(sf.id)}
                style={{visibility: action == "Edit" ? "visible" : "hidden"}}/>}
      {sf.children && sf.children.map(child => <div key={child.id + action + 'div'}>
          <HazardForm submission={child} action={action} onChangeSubmission={onChangeChildSubmission(child.id)}
                      key={child.id + action} roomList={roomList} organismList={organismList}/>
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
