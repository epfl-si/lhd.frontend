import React from 'react';
import {Button} from "epfl-elements-react/src/stories/molecules/Button.tsx";
import './card.css'

interface Style extends CSS.Properties, CSS.PropertiesHyphen {}

interface CompactItemListProps {
  title?: string;
  children?: React.ReactNode;
  icon?: string;
  onClickIcon?: () => void;
  onClickItem?: () => void;
  cardStyle?: Style;
  textStyle?: Style;
}

/**
 * Primary UI component for user interaction
 */
export const Card = ({
  title,
  children,
  icon,
  onClickIcon,
  onClickItem,
  cardStyle,
  textStyle
}: CompactItemListProps) => {

  let leftDivStyle = "flex-fill";
  if(icon) {
    leftDivStyle = "flex-item-left";
  }

  return (
      <div className="card">
          <div className={leftDivStyle} onClick={onClickItem}>
            {title ? (
              strikethrough ?
                <h5 className="card-text"><s>{title}</s></h5>
                :
                <h5 className="card-text">{title}</h5>
            ) : (<></>)}
            {strikethrough ? <s>{children}</s> : children}
          </div>
          {icon ? <div className="flex-item-right">
            <Button size="icon"
                          iconName={icon}
                          onClick={onClickIcon}/>
          </div> : <></>}
      </div>
  );
};
