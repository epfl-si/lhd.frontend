import React, {useEffect, useState} from 'react';
import {HazardCard} from "./HazardCard";
import {Form} from "@formio/react";
import {hazardFormType, roomDetailsType, submissionForm} from "../../utils/ressources/types";
import {fetchHazardForms} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {getHazardImage} from "./HazardProperties";
import {updateRoom} from "../../utils/graphql/PostingTools";

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

  const handleSubmit = async (event) => {
    console.log(event.data, lastVersionForm );

  };

  function onOpenHazard(hazard: string) {
    setOpenHazard(true);
    setSelectedHazardCategory(hazard);
    const lastform: hazardFormType | undefined = hazardForms.find(f => f.hazard_category.hazard_category_name == hazard);
    setLastVersionForm(lastform);

    if (savedCategoriesList.includes(hazard)) {
      const subForm: submissionForm[] = [];
      room.hazards.forEach(h => {
        const sub = h.submission;
        const holdForm = h.hazard_form_history.form;
        const category = h.hazard_form_history.hazard_form.hazard_category.hazard_category_name;
        if (category == hazard) {
          subForm.push({submission: JSON.parse(sub), form: JSON.parse(holdForm)});
        }
      });
      setSubmissionForm(subForm);
    } else {
      setSubmissionForm([{submission: {}, form: lastform ?? {}}]);
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
          onCustomEvent={handleSubmit}
          submission={sf.submission}
          form={sf.form}/>)}
      </div>
    </div>
  </div>
};
