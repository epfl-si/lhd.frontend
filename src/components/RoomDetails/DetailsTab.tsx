import React, {useEffect, useState} from 'react';
import {kindType, lhdUnitsType, notificationType, roomDetailsType} from "../../utils/ressources/types";
import {fetchRoomTypes} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {Autocomplete, FormControlLabel, Stack, Switch} from "@mui/material";
import {TextField} from "@material-ui/core";
import {MultipleSelection} from "../global/MultipleSelection";
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import featherIcons from "epfl-elements/dist/icons/feather-sprite.svg";
import Notifications from "../Table/Notifications";
import {updateRoom} from "../../utils/graphql/PostingTools";
import {notificationsVariants} from "../../utils/ressources/variants";
import {useTranslation} from "react-i18next";

interface DetailsTabProps {
  roomData: roomDetailsType;
}

export const DetailsTab = ({
                             roomData
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
    setSavedUnits(room.lhd_units);
    setSelectedUnits(room.lhd_units);
  }, [roomData]);

  function saveRoomDetails() {
    updateRoom(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      {
        haz_levels: [], hazards: [],
        name: room.name || '',
        kind: room.kind,//designation
        vol: room.vol,//volume
        vent: room.vent,//ventilation
        lhd_units: selectedUnits
      },
      {}
    ).then(res => {
      handleOpen(res);
    });
  }

  function onChangeUnits(changedUnits: lhdUnitsType[]) {
    setSelectedUnits(changedUnits);
  }

  const handleOpen = (res: any) => {
    if (res.status === 200) {
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

  return <Stack spacing={2} width="30%">
    <Autocomplete
      value={room.kind?.name || ''}
      onChange={(event: any, newValue: string | null) => {
        if (room.kind && newValue ) {
          room.kind.name = newValue;
          setRoom({...room});
        }
      }}
      id="designation"
      options={roomKind.flatMap(k => k.name)}
      renderInput={(params) => <TextField {...params} label={t(`room_details.designation`)} />}
    />
    <TextField
      id="volume"
      label="Volume"
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
    <MultipleSelection selected={savedUnits} objectName="Unit" onChangeSelection={onChangeUnits}/>

    <div style={{marginTop: '50px'}}>
      <Button
        onClick={() => saveRoomDetails()}
        label="Save"
        iconName={`${featherIcons}#save`}
        primary />
    </div>
    <Notifications
      open={openNotification}
      notification={notificationType}
      close={handleClose}
    />
  </Stack>
};