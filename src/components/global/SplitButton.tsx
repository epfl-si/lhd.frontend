import React from 'react';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import ButtonGroup from '@material-ui/core/ButtonGroup';
import ArrowDropDownIcon from '@material-ui/icons/ArrowDropDown';
import ClickAwayListener from '@material-ui/core/ClickAwayListener';
import Grow from '@material-ui/core/Grow';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import MenuItem from '@material-ui/core/MenuItem';
import MenuList from '@material-ui/core/MenuList';
import {tag} from "../../utils/ressources/types";
import {Chip} from "@material-ui/core";

interface SplitButtonProps {
	options: tag[];
	handleClick: (option: tag) => void;
}

export const SplitButton = ({
	options,
	handleClick
}: SplitButtonProps) => {
	const [open, setOpen] = React.useState(false);
	const anchorRef = React.useRef(null);
	const [selectedIndex, setSelectedIndex] = React.useState(0);

	const handleMenuItemClick = (event, index) => {
		setSelectedIndex(index);
		setOpen(false);
	};

	const handleToggle = () => {
		setOpen((prevOpen) => !prevOpen);
	};

	const handleClose = (event) => {
		if (anchorRef.current && anchorRef.current.contains(event.target)) {
			return;
		}

		setOpen(false);
	};

	return (
		options.length > 1 ?
			<>
				<ButtonGroup variant="contained" color="primary" ref={anchorRef} aria-label="split button">
					<Button onClick={() => handleClick(options[selectedIndex])}>{options[selectedIndex]?.tag_name}</Button>
					<Button color="primary"
						size="small"
						aria-controls={open ? 'split-button-menu' : undefined}
						aria-expanded={open ? 'true' : undefined}
						aria-label="select merge strategy"
						aria-haspopup="menu"
						onClick={handleToggle}
					>
						<ArrowDropDownIcon />
					</Button>
				</ButtonGroup>
				<Popper open={open} anchorEl={anchorRef.current} role={undefined} transition disablePortal style={{zIndex: 9999}}>
					{({ TransitionProps, placement }) => (
						<Grow
							{...TransitionProps}
							style={{
								transformOrigin: placement === 'bottom' ? 'center top' : 'center bottom',
							}}
						>
							<Paper>
								<ClickAwayListener onClickAway={handleClose}>
									<MenuList id="split-button-menu">
										{options.map((option, index) => (
											<MenuItem
												key={option.tag_name}
												selected={index === selectedIndex}
												onClick={(event) => handleMenuItemClick(event, index)}
											>
												{option.tag_name}
											</MenuItem>
										))}
									</MenuList>
								</ClickAwayListener>
							</Paper>
						</Grow>
					)}
				</Popper>
			</> :
			<Chip
				className="grayChip"
				label={options[selectedIndex]?.tag_name?.toUpperCase()}
				onClick={() => handleClick(options[0])}
			/>
	);
}
