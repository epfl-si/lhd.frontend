import React, {useEffect, useRef, useState} from 'react';
import {hazardFormType, roomDetailsType} from "../../utils/ressources/types";
import {fetchHazardForms, fetchOrganism, fetchRoomsForDropDownComponent} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardFormVBox} from "./HazardFormVBox";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import {NewHazardChoise} from "./NewHazardChoise";

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
  const [action, setAction] = useState<'Add' | 'Edit' | 'Read'>('Read');
  const listSavedCategories = room.hazards.map(h => h.hazard_form_history.hazard_form.hazard_category.hazard_category_name).filter(uniqueFilter);
  const roomList = useRef<string[]>([]);
  const organismList = useRef<object[]>([]);
  const [isNewHazardListVisible, setNewHazardListVisible] = useState(false);

  useEffect(() => {
    const loadFetch = async () => {
      const resultsHazardCategory = await fetchHazardForms(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken
      );

      if (resultsHazardCategory.status === 200 && resultsHazardCategory.data && typeof resultsHazardCategory.data !== 'string') {
        const sortedHazardCategories = resultsHazardCategory.data.sort((a:hazardFormType,b: hazardFormType) =>
          a.hazard_category.hazard_category_name ?
            a.hazard_category.hazard_category_name.localeCompare(b.hazard_category.hazard_category_name) :
            0
        )
        setAvailableHazardsInDB([...sortedHazardCategories]);
      }

    };
    loadFetch();
    fetchRoomList();
    fetchOrganismList();
  }, [oidc.accessToken]);

  function uniqueFilter(value: string, index: number, self: string[]) {
    return self.indexOf(value) === index;
  }

  const fetchRoomList = async () => {
    const results = await fetchRoomsForDropDownComponent(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken
    );
    if (results.status === 200 && results.data && typeof results.data !== 'string') {
      roomList.current = results.data.map(r => r.name).sort((a,b) => a ? a.localeCompare(b) : 0);
    } else {
      console.error('Bad GraphQL results', results);
    }
    return [];
  }

  const fetchOrganismList = async () => {
    const results = await fetchOrganism(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken
    );
    if (results.status === 200 && results.data && typeof results.data !== 'string' && results.data[0]) {
      organismList.current = results.data;
      organismList.current.push({filePath: null, organism: "Other", risk_group: 1});
    } else {
      console.error('Bad GraphQL results', results);
    }
    return [];
  }

  function onReadHazard(hazard: string) {
    onChangeHazard(hazard);
    setAction('Read');
  }

  function onEditHazard(hazard: string) {
    onChangeHazard(hazard);
    onSaveRoom();
    setAction('Edit');
  }

  function onAddHazard(hazard: string) {
    onChangeHazard(hazard);
    setAction('Add');
  }

  function onChangeHazard(hazard: string) {
    setSelectedHazardCategory(hazard);
    const newHazardArray = availableHazardsInDB.map(h => {
      h.isSelected = h.hazard_category.hazard_category_name == hazard
      return h;
    })
    setAvailableHazardsInDB([...newHazardArray]);
  }

  const handleClickForNewHazardVisibility = () => {
    setNewHazardListVisible(!isNewHazardListVisible);
  };

  return <div>
    <div>
      <Button size="icon"
              iconName={"#plus-circle"}
              onClick={handleClickForNewHazardVisibility}
              style={{visibility: isNewHazardListVisible ? 'hidden' : 'visible'}}/>
      <NewHazardChoise
        openDialog={isNewHazardListVisible}
        onAddHazard={onAddHazard}
        onCancelClick={setNewHazardListVisible}
        availableHazardsInDB={availableHazardsInDB}
        listSavedCategories={listSavedCategories}/>
    </div>
    <HazardFormVBox room={room}
                    action={action}
                    onChangeAction={onEditHazard}
                    onReadAction={onReadHazard}
                    selectedHazardCategory={selectedHazardCategory}
                    lastVersionForm={availableHazardsInDB.find(f => f.hazard_category.hazard_category_name == selectedHazardCategory)}
                    organismList={organismList.current}
                    roomList={roomList.current}/>
  </div>
};
