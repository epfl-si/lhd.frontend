import React from 'react';
import {getHazardImage} from "./HazardProperties";
import {useTranslation} from "react-i18next";
import {hazardAdditionalInfoType, roomDetailsType} from "../../utils/ressources/types";
import {sprintf} from "sprintf-js";
import {fetchFile} from "../../utils/ressources/file";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {TextArea} from "epfl-elements-react/src/stories/molecules/inputFields/TextArea.tsx";

interface HazardTitleProps {
  hazardAdditionalInfo: hazardAdditionalInfoType | undefined;
  selectedHazardCategory: string;
  otherRoom: roomDetailsType | null;
  handleFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  setComment?: (newValue: string) => void;
  comment: string | undefined;
  isReadonly: boolean;
}

export const HazardTitle = ({
                              hazardAdditionalInfo,
                              selectedHazardCategory,
                              otherRoom,
                              handleFileChange,
                              setComment,
                              comment,
                              isReadonly
  }: HazardTitleProps) => {
  const oidc = useOpenIDConnectContext();
  const { t } = useTranslation();

  const handleClickFileLink = async (event: any) => {
    if (!event.defaultPrevented) {
      event.preventDefault();
      await fetchFile(
        oidc.accessToken,
        hazardAdditionalInfo!.filePath!
      );
    }
  };

  return <div style={{display: 'flex', flexDirection: 'column'}}>
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
    <TextArea
      id={"comment"}
      name="comment"
      label={t('generic.comment')}
      key={selectedHazardCategory + "_key"}
      onChange={setComment}
      value={comment}
      isReadonly={isReadonly}
    />
    {!isReadonly && <div>
      <input id="file" style={{fontSize: 'small'}} type="file" onChange={handleFileChange} accept='.pdf'
             key={'newFile' + selectedHazardCategory}/>
    </div>}
    {hazardAdditionalInfo && hazardAdditionalInfo.filePath &&
      <a style={{fontSize: 'small'}} onClick={handleClickFileLink} href={hazardAdditionalInfo.filePath}>
        {hazardAdditionalInfo.filePath.split('/').pop()}
      </a>}
    <hr/>
  </div>
};
