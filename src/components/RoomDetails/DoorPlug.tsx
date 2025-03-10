import React, {useEffect, useState} from 'react';
import "../../../css/styles.scss";
import {useTranslation} from "react-i18next";
import {env} from "../../utils/env";

interface DoorPlugProps {
	roomName: string;
}

export const DoorPlug = ({
	roomName,
}: DoorPlugProps) => {
	const {t} = useTranslation();
	const [pdfUrl, setPdfUrl] = useState<string>('');
	const [exists, setExists] = useState<boolean>(false);

	useEffect(() => {
		const cristalUrl = "https://" + env().CRISTAL_URL + "/fiches_de_porte/" + roomName + "/" + roomName + ".pdf";
		setPdfUrl(cristalUrl)
		checkIfPDFExists(cristalUrl);
	}, [roomName]);

	async function checkIfPDFExists(url: string) {
		try {
			const response = await fetch(url, { method: "HEAD" });
			console.log(response)
			setExists(response.ok);
		} catch (error) {
			setExists(false);
		}
	}

	return <div>
		<label className='labelDetails'>{t(`room_details.fichePorte`)}: </label>
		<a className='valueDetails' href={pdfUrl} target="_blank">{exists ? pdfUrl.split('/').pop() : ''}</a>
	</div>
};
