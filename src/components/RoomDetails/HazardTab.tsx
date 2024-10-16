import React, {useEffect, useRef, useState} from 'react';
import {HazardCard} from "./HazardCard";
import {hazardFormType, roomDetailsType} from "../../utils/ressources/types";
import {fetchHazardForms, fetchOrganism, fetchRoomsForDropDownComponent} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {HazardFormVBox} from "./HazardFormVBox";
import {BackButton} from "../global/BackButton";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";

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

      toggleDivVisibility();
      window.addEventListener("resize", toggleDivVisibility);
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
    } else {
      console.error('Bad GraphQL results', results);
    }
    return [];
  }

  function toggleDivVisibility() {
    if (window.innerWidth <= 1024) {
      setIsLittleScreen(true);
    } else {
      setIsLittleScreen(false);
    }
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

  return <div style={{display: 'flex', flexDirection: 'row'}}>
    <div className="roomHazardCardsDiv" style={{display: (isLittleScreen && selectedHazardCategory != '') ? 'none' : 'flex'}}>
      <div style={{flexDirection: 'column'}}>
        {availableHazardsInDB.map(h => {
          return listSavedCategories.includes(h.hazard_category.hazard_category_name) ?
            <HazardCard hazardName={h.hazard_category.hazard_category_name}
                        backgroundColor={`${h.isSelected ? '#FFCECE' : ''}`}
                        key={h.hazard_category.hazard_category_name}
                        room={room}
                        onOpen={onReadHazard}
                        onEdit={onEditHazard}
                        listSavedCategories={listSavedCategories}/> :
            <></>
        })}
      </div>
      <div>
        <Button size="icon"
                iconName={"#plus-circle"}
                onClick={handleClickForNewHazardVisibility}
                style={{visibility: isNewHazardListVisible ? 'hidden' : 'visible'}}        />
        {isNewHazardListVisible &&
          <div style={{flexDirection: 'column'}}>
          {availableHazardsInDB.map(h => {
            return !listSavedCategories.includes(h.hazard_category.hazard_category_name) ?
              <HazardCard hazardName={h.hazard_category.hazard_category_name}
                          backgroundColor={`${h.isSelected ? '#FFCECE' : ''}`}
                          key={h.hazard_category.hazard_category_name}
                          room={room}
                          onAdd={onAddHazard}
                          listSavedCategories={listSavedCategories}/> :
              <></>
          })}
        </div>}
      </div>
    </div>
    <div className="roomHazarFormDiv" style={{display: (selectedHazardCategory != '' ? 'flex' : 'none')}}>
      {isLittleScreen && listSavedCategories.includes(selectedHazardCategory) ?
        <div style={{display: 'flex', flexDirection: 'row'}}>
          <BackButton icon="#menu" onClickButton={() => setSelectedHazardCategory('')} alwaysPresent={false}/>
          <Button size="icon"
                  iconName={"#edit-3"}
                  onClick={() => onEditHazard(selectedHazardCategory)}
                  style={{marginLeft: '10px', display: action != "Edit" ? 'flex' : 'none'}}/>
        </div> : <BackButton icon="#menu" onClickButton={() => setSelectedHazardCategory('')} alwaysPresent={false}/>}
      <HazardFormVBox room={room}
                      action={action}
                      onChangeAction={onEditHazard}
                      onReadAction={onReadHazard}
                      selectedHazardCategory={selectedHazardCategory}
                      lastVersionForm={availableHazardsInDB.find(f => f.hazard_category.hazard_category_name == selectedHazardCategory)}
                      organismList={organismList.current}
                      roomList={roomList.current}/>
    </div>
  </div>
};
