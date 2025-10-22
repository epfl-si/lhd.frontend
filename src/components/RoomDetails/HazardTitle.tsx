import React, {useEffect, useState} from 'react';
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";
import {hazardAdditionalInfoType, roomDetailsType} from "../../utils/ressources/types";
import {sprintf} from "sprintf-js";
import {handleClickFileLink} from "../../utils/ressources/file";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {fetchOtherRoomsForStaticMagneticField} from "../../utils/graphql/FetchingTools";
import {env} from "../../utils/env";
import {Button, TextArea} from "epfl-elements-react-si-extra";

interface HazardTitleProps {
  hazardAdditionalInfo?: hazardAdditionalInfoType | undefined;
  selectedHazardCategory: string;
  room?: roomDetailsType | null;
  handleFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setComment?: (newValue: string) => void;
  comment?: string | undefined;
  isReadonly: boolean;
  onChangeAction?: (hazardName: string) => void;
  user: any;
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
                              user
  }: HazardTitleProps) => {
  const oidc = useOpenIDConnectContext();
  const { t } = useTranslation();
  const [otherRoom, setOtherRoom] = useState<roomDetailsType | null>(null);

  useEffect(() => {
    if(selectedHazardCategory == 'StaticMagneticField' && room) {
      loadOtherRoomsForStaticMagneticField();
    }
  }, [oidc.accessToken, selectedHazardCategory, room]);

  const loadOtherRoomsForStaticMagneticField = async () => {
    const results = await fetchOtherRoomsForStaticMagneticField(
      env().REACT_APP_GRAPHQL_ENDPOINT_URL,
      oidc.accessToken,
      room!.name
    );
    if (results.status === 200 && results.data && typeof results.data !== 'string') {
      setOtherRoom(results.data[0])
      console.log(results.data[0])
    } else {
      console.error('Bad GraphQL results', results);
    }
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
        {isReadonly && <label className="hazardTitle" style={{marginBottom:'0px'}}>{decodeURIComponent(comment || '')}</label>}
      </div>
      {isReadonly && user.canEditHazards && <Button size="icon"
              iconName={"#edit-3"}
              onClick={() => {if(onChangeAction) onChangeAction(selectedHazardCategory)}}/>
      }
    </div>
    {otherRoom && otherRoom.hazardReferences.map(ref => {
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
         onClick={e => handleClickFileLink(e, oidc.accessToken, hazardAdditionalInfo!.filePath!)}
         href={hazardAdditionalInfo.filePath}>
        {hazardAdditionalInfo.filePath.split('/').pop()}
      </a>}
  </div>
};
