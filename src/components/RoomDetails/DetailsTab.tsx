import React, {useEffect, useState} from 'react';
import {kindType, lhdUnitsType, notificationType, roomDetailsType} from "../../utils/ressources/types";
import {fetchRoomTypes, fetchunitsFromFullText} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {Autocomplete, FormControlLabel, Stack, Switch} from "@mui/material";
import {TextField, useMediaQuery} from "@material-ui/core";
import {MultipleSelection} from "../global/MultipleSelection";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import Notifications from "../Table/Notifications";
import {updateRoom} from "../../utils/graphql/PostingTools";
import {notificationsVariants} from "../../utils/ressources/variants";
import {useTranslation} from "react-i18next";
import '../../../css/styles.scss'
import {AuditReportPanel} from "../Units/AuditReportPanel";

interface DetailsTabProps {
  roomData: roomDetailsType;
  onSaveRoom: () => void;
}

export const DetailsTab = ({
  roomData,
  onSaveRoom
  }: DetailsTabProps) => {
  const { t } = useTranslation();
  const oidc = useOpenIDConnectContext();
  const [room, setRoom] = useState<roomDetailsType>(roomData);
  const [roomKind, setRoomKind] = React.useState<kindType[]>([]);
  const [savedUnits, setSavedUnits] = useState<lhdUnitsType[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<lhdUnitsType[]>([]);
  const [notificationType, setNotificationType] = useState<notificationType>({
    type: "info",
    text: '',
  });
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const isLargeDevice = useMediaQuery("only screen and (min-width : 993px) and (max-width : 1200px)");
  const isExtraLargeDevice = useMediaQuery("only screen and (min-width : 1201px)");

  useEffect(() => {
    const loadFetch = async () => {
      const resultsRoomTypes = await fetchRoomTypes(
        env().REACT_APP_GRAPHQL_ENDPOINT_URL,
        oidc.accessToken
      );

      if (resultsRoomTypes.status === 200 && resultsRoomTypes.data && typeof resultsRoomTypes.data !== 'string') {
        setRoomKind(resultsRoomTypes.data);
      }
    }
    loadFetch();
  }, [oidc.accessToken]);

  useEffect(() => {
    setRoom(roomData);
    setSavedUnits(roomData.lhd_units);
    setSelectedUnits(roomData.lhd_units);
  }, [roomData]);

  function saveRoomDetails() {
    updateRoom(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      {
        id: JSON.stringify(room.id),
        haz_levels: [], hazards: [],
        name: room.name || '',
        kind: room.kind,//designation
        vol: room.vol,//volume
        vent: room.vent,//ventilation
        lhd_units: selectedUnits
      },
    ).then(res => {
      handleOpen(res);
    });
  }

  function onChangeUnits(changedUnits: lhdUnitsType[]) {
    setSelectedUnits(changedUnits);
  }

  const handleOpen = (res: any) => {
    if ( res.data?.updateRoom?.errors ) {
      const notif: notificationType = {
        text: res.data?.updateRoom?.errors[0].message,
        type: 'error'
      };
      setNotificationType(notif);
    } else if (res.status === 200) {
      onSaveRoom();
      setSavedUnits(selectedUnits.filter(u => u.status !== 'Deleted'));
      setNotificationType(notificationsVariants['room-update-success']);
    } else {
      setNotificationType(notificationsVariants['room-update-error']);
    }
    setOpenNotification(true);
  };

  const handleClose = () => {
    setOpenNotification(false);
  };

  function getUnitTitle(unit: lhdUnitsType) {
    return (unit.institute?.school?.name ?? '').concat(' ').concat(unit.institute?.name ?? '').concat(' ').concat(unit.name);
  }

  const fetchUnitsList = async (newValue: string): Promise<lhdUnitsType[]> => {
    const results = await fetchunitsFromFullText(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      newValue
    );
    if (results.status === 200) {
      if (results.data) {
        return results.data;
      } else {
        console.error('Bad GraphQL results', results);
      }
    }
    return [];
  };

  return <div style={{display: "flex", flexDirection: "row"}}>
    <div style={{width: (isExtraLargeDevice || isLargeDevice) ? '50%' : '100%'}}>
      <Stack spacing={2} className="roomDetailsDiv"
             style={{width: (isExtraLargeDevice || isLargeDevice) ? '80%' : '100%'}}>
        <div className="displayFlexColumn">
          <div><label className='labelDetails'>{t(`room_details.site`)}: </label><label
            className='valueDetails'>{room.site}</label>
          </div>
          <div><label className='labelDetails'>{t(`room_details.building`)}: </label><label
            className='valueDetails'>{room.building}</label>
          </div>
          <div><label className='labelDetails'>{t(`room_details.sector`)}: </label><label
            className='valueDetails'>{room.sector}</label>
          </div>
          <div><label className='labelDetails'>{t(`room_details.floor`)}: </label><label
            className='valueDetails'>{room.floor}</label>
          </div>
          <div><label className='labelDetails'>{t(`room_details.adminuse`)}: </label><label
            className='valueDetails'>{room.adminuse}</label>
          </div>
        </div>
        <Autocomplete
          value={room.kind?.name}
          onChange={(event: any, newValue: string | null) => {
            if ( newValue ) {
              room.kind = {name: newValue};
              setRoom({...room});
            }
          }}
          id="designation"
          key={room.kind?.name}
          options={roomKind.flatMap(k => k.name)}
          renderInput={(params) => <TextField {...params} label={t(`room_details.designation`)}/>}
        />
        <TextField
          id="volume"
          label="Volume (m³)"
          type="number"
          InputLabelProps={{
            shrink: true,
          }}
          variant="standard"
          value={room.vol || 0}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            room.vol = parseInt(event.target.value);
            setRoom({...room});
          }}
        />
        <FormControlLabel
          control={
            <Switch
              id="ventilation"
              checked={room.vent === 'y'}
              name="ventilation"
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                room.vent = event.target.checked ? 'y' : 'n';
                setRoom({...room});
              }}/>
          }
          label="Ventilation"
        />
        {(!isExtraLargeDevice && !isLargeDevice) ?
          <AuditReportPanel lhd_units={roomData.lhd_units} style={{marginLeft: '20px'}}/> : <></>}
        <label className='labelDetails'>{t(`room_details.attachUnitTitle`)}</label>
        <MultipleSelection selected={savedUnits} objectName="Unit"
                           onChangeSelection={onChangeUnits}
                           getCardTitle={getUnitTitle}
                           fetchData={fetchUnitsList}/>

        <div style={{marginTop: '50px'}}>
          <Button
            onClick={() => saveRoomDetails()}
            label="Save"
            iconName={`${featherIcons}#save`}
            primary/>
        </div>
        <Notifications
          open={openNotification}
          notification={notificationType}
          close={handleClose}
        />
      </Stack>
    </div>
      {
        (isExtraLargeDevice || isLargeDevice) ?
        <div style={{width: '50%'}}><AuditReportPanel lhd_units={roomData.lhd_units}/></div>
        : <></>
      }
  </div>
};
