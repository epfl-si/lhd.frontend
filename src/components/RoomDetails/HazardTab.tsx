import React, {useEffect, useState} from 'react';
import {HazardCard} from "./HazardCard";
import {Form} from "@formio/react";
import {hazardFormType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {fetchHazardForms} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {getHazardImage} from "./HazardProperties";
import {addHazard, updateRoom} from "../../utils/graphql/PostingTools";
import {notificationsVariants} from "../../utils/ressources/variants";
import Notifications from "../Table/Notifications";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import {notificationType} from '../../utils/ressources/types';

interface HazardTabProps {
  room: roomDetailsType;
}

export const HazardTab = ({
  room,
  }: HazardTabProps) => {
  const oidc = useOpenIDConnectContext();
  const [openHazard, setOpenHazard] = useState<boolean>(false);
  const [hazardForms, setHazardForms] = useState<hazardFormType[]>([]);
  const [selectedHazardCategory, setSelectedHazardCategory] = useState<string>('');
  const [savedCategoriesList, setSavedCategoriesList] = useState<string[]>([]);
  const [submissionForm, setSubmissionForm] = useState<submissionForm[]>([]);
  const [lastVersionForm, setLastVersionForm] = useState<hazardFormType>();
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const [notificationType, setNotificationType] = useState<notificationType>({
    type: "info",
    text: '',
  });
  const [formData, setFormData] = useState<submissionForm[]>([]);

  useEffect(() => {
    const loadFetch = async () => {
      const resultsHazardCategory = await fetchHazardForms(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken
      );

      if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
        setHazardForms(resultsHazardCategory.data);
      }
    };
    loadFetch();

    setSavedCategoriesList(room.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name));
  }, [oidc.accessToken, room]);

  const handleSubmit = async () => {
    if (lastVersionForm)  {
      const submissionsList: submissionForm[] = [];
      formData.forEach(f => {
        submissionsList.push({
          id: JSON.parse(f.id),
          submission: {data: f.submission}
        })
      });
      addHazard(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken,
        JSON.stringify(submissionsList).replaceAll('"','\\"'),
        lastVersionForm,
        room.name
      ).then(res => {//TODO load from DB and recharge savedCategoriesList setSubmissionForm and setFormData if 200
        handleOpen(res);
      });
    }
  };

  const handleOpen = (res: any) => {
    if (res.data?.addHazardToRoom?.errors) {
      const notif: notificationType = {
        text: res.data?.addHazardToRoom?.errors[0].message,
        type: 'error'
      };
      setNotificationType(notif);
    } else if (res.status === 200) {
      setNotificationType(notificationsVariants['unit-update-success']);
    } else {
      setNotificationType(notificationsVariants['unit-update-error']);
    }
    setOpenNotification(true);
  };

  const handleClose = () => {
    setOpenNotification(false);
  };

  function onOpenHazard(hazard: string) {
    setOpenHazard(true);
    setSelectedHazardCategory(hazard);
    const lastform: hazardFormType | undefined = hazardForms.find(f => f.hazard_category.hazard_category_name == hazard);
    setLastVersionForm(lastform);

    if (savedCategoriesList.includes(hazard)) {//TODO load from DB and recharge savedCategoriesList setSubmissionForm and setFormData
      const subForm: submissionForm[] = [];
      room.hazards.forEach(h => {
        const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
        if (category == hazard) {
          const holdForm = h.hazard_form_history.form; //TODO insert id in submission h.id
          subForm.push({id: h.id, submission: JSON.parse(h.submission), form: JSON.parse(holdForm)});
        }
      });
      setSubmissionForm(subForm);
      setFormData(subForm);
    } else {
      setSubmissionForm([{id: 'newHazard', submission: {}, form: lastform?.form ? JSON.parse(lastform?.form) : {}}]);
    }
  }

  return <div style={{display: 'flex', flexDirection: 'row'}}>
    <div style={{width: '30%'}}>
      {hazardForms.map(h =>
        <HazardCard hazardName={h.hazard_category.hazard_category_name} key={h.hazard_category.hazard_category_name}
                    listSavedCategories={savedCategoriesList}
                    onClick={(e) => onOpenHazard(h.hazard_category.hazard_category_name)}/>
      )}
    </div>
    <div style={{width: '70%', padding: '50px', visibility: openHazard ? 'visible' : 'hidden'}}>
      <div style={{display: 'flex', flexDirection: 'column'}}>
        <div style={{display: 'flex', flexDirection: 'row', marginBottom: '20px'}}>
          <img style={{margin: '5px', width: '30px', height: '30px'}}
               src={getHazardImage(selectedHazardCategory)}/>
          <strong style={{marginLeft: '10px'}}>{selectedHazardCategory}</strong>
        </div>
        {submissionForm.map(sf => <Form
          onChange={(event) => {
            const submissions = formData.filter(f => f.id!=sf.id);
            submissions.push({id: sf.id, submission: event.data});
            setFormData(submissions);
          }}
          submission={sf.submission}
          form={sf.form}/>)}
        <div style={{marginTop: '50px'}}>
          <Button
            onClick={handleSubmit}
            label="Save"
            iconName={`${featherIcons}#save`}
            primary/>
        </div>
      </div>
    </div>
    <Notifications
      open={openNotification}
      notification={notificationType}
      close={handleClose}
    />
  </div>
};
