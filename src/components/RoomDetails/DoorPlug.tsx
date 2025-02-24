import React, {useEffect, useState} from 'react';
import "../../../css/styles.scss";

interface DoorPlugProps {
	roomName: string;
}

export const DoorPlug = ({
	roomName,
}: DoorPlugProps) => {
	const [pdfUrl, setPdfUrl] = useState<string>('');
	const [exists, setExists] = useState<boolean>(false);

	useEffect(() => {
		setPdfUrl("https://cristal-test.epfl.ch/fiches_de_porte/" + roomName + "/" + roomName + ".pdf")
		checkIfPDFExists("https://cristal-test.epfl.ch/fiches_de_porte/" + roomName + "/" + roomName + ".pdf");
	}, [roomName]);

	async function checkIfPDFExists(url: string) {
		try {
			console.log(url)
			const response = await fetch(url, { method: "HEAD" });
			console.log(response)
			setExists(response.ok);
		} catch (error) {
			setExists(false);
		}
	}

	return exists ?
		<div className="form-card-div">
			<a style={{fontSize: 'small'}} href={pdfUrl}>CRISTAL</a>
		</div> : <></>
};
