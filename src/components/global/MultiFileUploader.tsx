import React from "react";
import {handleClickFileLink, readFileAsBase64} from "../../utils/ressources/file";
import {useOpenIDConnectContext} from "@epfl-si/react-appauth";
import {genericType} from "../../utils/ressources/types";

interface MultiFileUploaderProps {
	selectedFiles: genericType[];
	setSelectedFiles: (files: genericType[]) => void;
	maxFiles?: number;
	selectedId: string;
}

export default function MultiFileUploader({
	selectedFiles,
	setSelectedFiles,
	maxFiles = 1,
	selectedId
}: MultiFileUploaderProps) {
	const oidc = useOpenIDConnectContext();

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>
	) => {
		if (!event.target.files) return;
		const newFiles = Array.from(event.target.files);
		const fileList: genericType[] = [];
		for (let i = 0; i < newFiles.length; i++) {
			const base64 = await readFileAsBase64(newFiles[i]);
			fileList.push({status: "New", path: newFiles[i].name, base64});
		}
		setSelectedFiles([...selectedFiles, ...fileList]);

		// Allows selecting the same file again after removal
		event.target.value = "";
	};

	return <div style={{display: "flex", flexDirection: "column"}}>
		<div>
			<input
				id="file"
				style={{fontSize: 'small'}}
				type="file"
				onChange={handleFileChange}
				accept='.pdf'
				multiple
			/>
		</div>
		{selectedFiles.map(file => {
			if (file.path) {
				const fileName = file.path.split('/').pop();
				return <a style={{fontSize: 'small'}}
					 onClick={async e => await handleClickFileLink(e, oidc.accessToken, selectedId, 'assessment', fileName)}
					 href={file.path}>{fileName}
				</a>
			}
		})}
	</div>
}
