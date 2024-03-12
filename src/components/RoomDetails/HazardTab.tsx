import React, {useEffect, useState} from 'react';
import {HazardCard} from "./HazardCard";
import {hazardFormType, roomDetailsType} from "../../utils/ressources/types";
import {fetchHazardForms} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardFormVBox} from "./HazardFormVBox";

interface HazardTabProps {
  room: roomDetailsType;
}

export const HazardTab = ({
  room,
  }: HazardTabProps) => {
  const oidc = useOpenIDConnectContext();
  const [availableHazardsInDB, setAvailableHazardsInDB] = useState<hazardFormType[]>([]);
  // Remembers the left-hand side hazard category (e.g. lasers) that the user has selected.
  // The initial value means none of them.
  const [selectedHazardCategory, setSelectedHazardCategory] = useState<string>('');
  const [action, setAction] = useState<'Add' | 'Edit' | 'Read'>('Read');

  useEffect(() => {
    const loadFetch = async () => {
      const resultsHazardCategory = await fetchHazardForms(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken
      );

      if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
        setAvailableHazardsInDB(resultsHazardCategory.data);
      }
    };
    loadFetch();
  }, [oidc.accessToken]);

  function onReadHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    setAction('Read');
  }

  function onEditHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    setAction('Edit');
  }

  function onAddHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    setAction('Add');
  }

  return <div style={{display: 'flex', flexDirection: 'row'}}>
    <div style={{width: '30%'}}>
      {availableHazardsInDB.map(h =>
        <HazardCard hazardName={h.hazard_category.hazard_category_name}
                    key={h.hazard_category.hazard_category_name}
                    room={room}
                    onOpen={onReadHazard}
                    onEdit={onEditHazard}
                    onAdd={onAddHazard}
                    onEditMode={false}/>
      )}
    </div>
    <div style={{width: '70%', padding: '50px', visibility: selectedHazardCategory != '' ? 'visible' : 'hidden'}}>
      <HazardFormVBox room={room}
                      action={action}
                      onChangeAction={onEditHazard}
                      selectedHazardCategory={selectedHazardCategory}
                      lastVersionForm={availableHazardsInDB.find(f => f.hazard_category.hazard_category_name == selectedHazardCategory)}/>
    </div>
  </div>
};
