import React, {useEffect, useState} from 'react';
import {HazardCard} from "./HazardCard";
import {hazardFormType, roomDetailsType} from "../../utils/ressources/types";
import {fetchHazardForms} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardFormVBox} from "./HazardFormVBox";
import {BackButton} from "../global/BackButton";

interface HazardTabProps {
  room: roomDetailsType;
  onSaveRoom: () => void;
}

export const HazardTab = ({
  room,
  onSaveRoom
  }: HazardTabProps) => {
  const oidc = useOpenIDConnectContext();
  const [availableHazardsInDB, setAvailableHazardsInDB] = useState<hazardFormType[]>([]);
  // Remembers the left-hand side hazard category (e.g. lasers) that the user has selected.
  // The initial value means none of them.
  const [selectedHazardCategory, setSelectedHazardCategory] = useState<string>('');
  const [isLittleScreen, setIsLittleScreen] = useState<boolean>(false);
  const [action, setAction] = useState<'Add' | 'Edit' | 'Read'>('Read');

  useEffect(() => {
    const loadFetch = async () => {
      const resultsHazardCategory = await fetchHazardForms(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken
      );

      if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
        setAvailableHazardsInDB([...resultsHazardCategory.data]);
      }

      toggleDivVisibility();
      window.addEventListener("resize", toggleDivVisibility);
    };
    loadFetch();
  }, [oidc.accessToken]);

  function toggleDivVisibility() {
    if (window.innerWidth <= 1024) {
      setIsLittleScreen(true);
    } else {
      setIsLittleScreen(false);
    }
  }

  function onReadHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    setAction('Read');
  }

  function onEditHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    onSaveRoom();
    setAction('Edit');
  }

  function onAddHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    setAction('Add');
  }

  return <div style={{display: 'flex', flexDirection: 'row'}}>
    <div className="roomHazardCardsDiv" style={{display: (isLittleScreen && selectedHazardCategory != '') ? 'none' : 'flex'}}>
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
    <div className="roomHazarFormDiv" style={{display: (selectedHazardCategory != '' ? 'flex' : 'none')}}>
      <BackButton icon="#menu"  onClickButton={() => setSelectedHazardCategory('')}/>
      <HazardFormVBox room={room}
                      action={action}
                      onChangeAction={onEditHazard}
                      selectedHazardCategory={selectedHazardCategory}
                      lastVersionForm={availableHazardsInDB.find(f => f.hazard_category.hazard_category_name == selectedHazardCategory)}/>
    </div>
  </div>
};
