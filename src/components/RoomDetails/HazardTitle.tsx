import React, {useEffect, useState} from 'react';
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";
import {
  hazardAdditionalInfoType,
  hazardsAdditionalInfoHasTagType,
  notificationType,
  roomDetailsType, tag
} from "../../utils/ressources/types";
import {sprintf} from "sprintf-js";
import {handleClickFileLink} from "../../utils/ressources/file";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchOtherRoomsForStaticMagneticField, fetchTags} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {Button, TextArea} from "epfl-elements-react-si-extra";
import {getErrorMessage} from '../../utils/graphql/Utils';
import Notifications from "../Table/Notifications";
import {Chip} from "@material-ui/core";
import {TagDialog} from "./TagDialog";
import {Tooltip} from "@mui/joy";
import {DeleteTagDialog} from "./DeleteTagDialog";
import {SplitButton} from "../global/SplitButton";

interface HazardTitleProps {
  hazardAdditionalInfo?: hazardAdditionalInfoType | undefined;
  selectedHazardCategory: string;
  room?: roomDetailsType | null;
  handleFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setComment?: (newValue: string) => void;
  comment?: string | undefined;
  isReadonly: boolean;
  onChangeAction?: (hazardName: string, reloadRoom: boolean) => void;
  user: any;
  refreshView?: () => void;
  tags?: hazardsAdditionalInfoHasTagType[];
}

export const HazardTitle = ({
  hazardAdditionalInfo,
  selectedHazardCategory,
  room,
  handleFileChange,
  setComment,
  comment,
  isReadonly,
  onChangeAction,
  user,
  refreshView,
  tags
  }: HazardTitleProps) => {
  const oidc = useOpenIDConnectContext();
  const { t } = useTranslation();
  const [otherRoom, setOtherRoom] = useState<roomDetailsType | null>(null);
  const [notificationType, setNotificationType] = useState<notificationType>({
    type: "info",
    text: '',
  });
  const [openNotification, setOpenNotification] = useState<boolean>(false);
  const [openTagDialog, setOpenTagDialog] = useState<boolean>(false);
  const [openDeleteTagDialog, setOpenDeleteTagDialog] = useState<boolean>(false);
  const [selectedTag, setSelectedTag] = useState<hazardsAdditionalInfoHasTagType>();
  const [availableTags, setAvailableTags] = useState<tag[]>([]);

  useEffect(() => {
    if(selectedHazardCategory == 'StaticMagneticField' && room) {
      loadOtherRoomsForStaticMagneticField();
    }
    loadTags();
  }, [oidc.accessToken, selectedHazardCategory, room, tags]);

  const loadOtherRoomsForStaticMagneticField = async () => {
    const results = await fetchOtherRoomsForStaticMagneticField(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      room!.name
    );
    if (results.status === 200 && results.data && typeof results.data !== 'string') {
      setOtherRoom(results.data[0])
    } else {
      const errors = getErrorMessage(results, 'rooms');
      setNotificationType(errors.notif);
      setOpenNotification(true);
    }
  }

  const handleClose = () => {
    setOpenNotification(false);
  };

  const closeTagDialog = () => {
    setOpenTagDialog(false);
    setSelectedTag(undefined);
  }

  const loadTags = async () => {
    let savedTags: string[] = [];
    if (hazardAdditionalInfo && hazardAdditionalInfo.hazardsAdditionalInfoHasTag)
      savedTags = hazardAdditionalInfo.hazardsAdditionalInfoHasTag.map(addInfo => addInfo.tag.tag_name);
    const results = await fetchTags(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      savedTags
    );
    if ( results.status === 200 && results.data ) {
      setAvailableTags(results.data);
    } else {
      const errors = getErrorMessage(results, 'tags');
      setNotificationType(errors.notif);
      setOpenNotification(true);
    }
  };

  function handleTagClick (selectedTag: tag) {
    loadTags();
    setSelectedTag({tag: selectedTag} as hazardsAdditionalInfoHasTagType);
    setOpenTagDialog(true);
  }

  return <div style={{marginTop: '10px'}}>
    <div style={{display: 'flex', flexDirection: 'row', justifyContent: "space-between"}}>
      <div style={{display: 'flex', flexDirection: 'row'}}>
        <img style={{margin: '5px', width: '30px', height: '30px'}}
             src={getHazardImage(selectedHazardCategory)}/>
        <strong className="hazardTitle">{t(`hazards.`.concat(selectedHazardCategory))}</strong>
        {hazardAdditionalInfo && hazardAdditionalInfo.modified_on && <label
          style={{fontStyle: "italic", fontSize: "small", marginBottom: '0px'}}
          className="hazardTitle">({sprintf(t(`hazards.modification_info`), hazardAdditionalInfo.modified_by,
          (new Date(hazardAdditionalInfo.modified_on)).toLocaleString('fr-CH', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            hour12: false
          }))})</label>}
        {isReadonly && <>
          <label className="hazardTitle" style={{marginBottom:'0px', marginRight: '5px'}}>{decodeURIComponent(comment || '')}</label>
          {tags && tags.map(t =>
            <Tooltip title={t.comment}>
              <Chip
                className="chip"
                label={t.tag.tag_name}
              />
            </Tooltip>)}
        </>}
      </div>
      {isReadonly && user.canEditHazards && <Button size="icon"
              iconName={"#edit-3"}
              onClick={() => {if(onChangeAction) onChangeAction(selectedHazardCategory, false)}}/>
      }
    </div>
    <div style={{display: "flex", flexDirection: "row"}}>
      {hazardAdditionalInfo && hazardAdditionalInfo.hazardsAdditionalInfoHasTag &&
        hazardAdditionalInfo.hazardsAdditionalInfoHasTag.map(addInfo =>
          <Tooltip title={addInfo.comment}>
            <Chip
              className="chip"
              label={addInfo.tag.tag_name}
              onClick={() => {
                setOpenTagDialog(true);
                setSelectedTag(addInfo);
              }}
              onDelete={() => {
                setSelectedTag(addInfo);
                setOpenDeleteTagDialog(true);
              }}
            />
          </Tooltip>)
      }
      {!isReadonly && user.canEditHazards && availableTags.length > 0 && <SplitButton handleClick={handleTagClick} options={availableTags} />}
    </div>
    {selectedTag && user.canEditHazards && <DeleteTagDialog tag={selectedTag} refreshView={refreshView} openDialog={openDeleteTagDialog}
                                                            setOpenDialog={setOpenDeleteTagDialog} />}
    {otherRoom && otherRoom.hazardReferences && otherRoom.hazardReferences.map(ref => {
      if ( ref.hazards.room?.name ) {
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
    {!isReadonly && <TextArea
      id={"comment"}
      name="comment"
      label={t('generic.comment')}
      key={selectedHazardCategory + "_key"}
      onChange={setComment}
      value={comment}
      isReadonly={isReadonly}
    />}
    {!isReadonly && <div>
      <input id="file" style={{fontSize: 'small'}} type="file" onChange={handleFileChange} accept='.pdf'
             key={'newFile' + selectedHazardCategory}/>
    </div>}
    {hazardAdditionalInfo && hazardAdditionalInfo.filePath &&
      <a style={{fontSize: 'small'}}
         onClick={async e => await handleClickFileLink(e, oidc.accessToken, hazardAdditionalInfo!.id!, 'hazardAdditionalInfo')}
         href={hazardAdditionalInfo.filePath}>
        {hazardAdditionalInfo.filePath.split('/').pop()}
      </a>}
    <Notifications
      open={openNotification}
      notification={notificationType}
      close={handleClose}
    />
    {user.canEditHazards &&
      <TagDialog
        availableTags={availableTags}
        openDialog={openTagDialog}
        additionalInfo={hazardAdditionalInfo?.id}
        selectedTag={selectedTag}
        roomId={room?.id}
        categoryName={selectedHazardCategory}
        close={closeTagDialog}
        save={() => {
          closeTagDialog();
          if ( refreshView ) {
            refreshView();
          }
        }}/>
    }
  </div>
};
